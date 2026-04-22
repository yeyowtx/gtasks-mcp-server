import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { google, tasks_v1 } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { TaskActions, TaskResources } from "./Tasks.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '10000', 10);
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH ||
  path.join(__dirname, "../.gtasks-server-credentials.json");
const OAUTH_KEYS_PATH = process.env.GOOGLE_OAUTH_KEYS_PATH ||
  path.join(__dirname, "../gcp-oauth.keys.json");

// Initialize Google Tasks API
const tasks = google.tasks("v1");

// Initialize MCP Server
const server = new Server(
  {
    name: "gtasks-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Setup MCP handlers
server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  const [allTasks, nextPageToken] = await TaskResources.list(request, tasks);
  return {
    resources: allTasks.map((task) => ({
      uri: `gtasks:///${task.id}`,
      mimeType: "text/plain",
      name: task.title,
    })),
    nextCursor: nextPageToken,
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const task = await TaskResources.read(request, tasks);

  const taskDetails = [
    `Title: ${task.title || "No title"}`,
    `Status: ${task.status || "Unknown"}`,
    `Due: ${task.due || "Not set"}`,
    `Notes: ${task.notes || "No notes"}`,
    `Hidden: ${task.hidden || "Unknown"}`,
    `Parent: ${task.parent || "Unknown"}`,
    `Deleted?: ${task.deleted || "Unknown"}`,
    `Completed Date: ${task.completed || "Unknown"}`,
    `Position: ${task.position || "Unknown"}`,
    `ETag: ${task.etag || "Unknown"}`,
    `Links: ${task.links || "Unknown"}`,
    `Kind: ${task.kind || "Unknown"}`,
    `Status: ${task.status || "Unknown"}`,
    `Created: ${task.updated || "Unknown"}`,
    `Updated: ${task.updated || "Unknown"}`,
  ].join("\n");

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/plain",
        text: taskDetails,
      },
    ],
  };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search",
        description: "Search for a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "list",
        description: "List all tasks in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            cursor: {
              type: "string",
              description: "Cursor for pagination",
            },
          },
        },
      },
      {
        name: "create",
        description: "Create a new task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            notes: {
              type: "string",
              description: "Task notes",
            },
            due: {
              type: "string",
              description: "Due date (YYYY-MM-DD or ISO 8601 format, e.g. 2025-03-19)",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "clear",
        description: "Clear completed tasks from a Google Tasks task list",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
          },
          required: ["taskListId"],
        },
      },
      {
        name: "delete",
        description: "Delete a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            id: {
              type: "string",
              description: "Task id",
            },
          },
          required: ["id", "taskListId"],
        },
      },
      {
        name: "list-tasklists",
        description: "List all task lists in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "update",
        description: "Update a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            id: {
              type: "string",
              description: "Task ID",
            },
            uri: {
              type: "string",
              description: "Task URI",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            notes: {
              type: "string",
              description: "Task notes",
            },
            status: {
              type: "string",
              enum: ["needsAction", "completed"],
              description: "Task status (needsAction or completed)",
            },
            due: {
              type: "string",
              description: "Due date (YYYY-MM-DD or ISO 8601 format, e.g. 2025-03-19)",
            },
          },
          required: ["id", "uri"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search") {
    const taskResult = await TaskActions.search(request, tasks);
    return taskResult;
  }
  if (request.params.name === "list") {
    const taskResult = await TaskActions.list(request, tasks);
    return taskResult;
  }
  if (request.params.name === "list-tasklists") {
    const response = await tasks.tasklists.list();
    const taskLists = response.data.items || [];
    const formatted = taskLists
      .map((list) => `${list.title} (ID: ${list.id})`)
      .join("\n");
    return {
      content: [
        {
          type: "text",
          text:
            taskLists.length > 0
              ? `Found ${taskLists.length} task lists:\n${formatted}`
              : "No task lists found",
        },
      ],
    };
  }
  if (request.params.name === "create") {
    const taskResult = await TaskActions.create(request, tasks);
    return taskResult;
  }
  if (request.params.name === "update") {
    const taskResult = await TaskActions.update(request, tasks);
    return taskResult;
  }
  if (request.params.name === "delete") {
    const taskResult = await TaskActions.delete(request, tasks);
    return taskResult;
  }
  if (request.params.name === "clear") {
    const taskResult = await TaskActions.clear(request, tasks);
    return taskResult;
  }
  throw new Error("Tool not found");
});

// Load Google OAuth credentials
async function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("❌ Credentials not found at:", CREDENTIALS_PATH);
    console.error("Please run authentication first or set GOOGLE_CREDENTIALS_PATH");
    process.exit(1);
  }

  if (!fs.existsSync(OAUTH_KEYS_PATH)) {
    console.error("❌ OAuth keys not found at:", OAUTH_KEYS_PATH);
    console.error("Please set GOOGLE_OAUTH_KEYS_PATH or add gcp-oauth.keys.json");
    process.exit(1);
  }

  // Read and clean the JSON file (remove any control characters or extra whitespace)
  let rawContent = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  let oauthKeysContent = fs.readFileSync(OAUTH_KEYS_PATH, "utf-8");

  // Remove any control characters except normal spaces
  rawContent = rawContent.replace(/[\x00-\x1F\x7F]/g, '');
  oauthKeysContent = oauthKeysContent.replace(/[\x00-\x1F\x7F]/g, '');

  // Parse the cleaned content
  const credentials = JSON.parse(rawContent.trim());
  const oauthKeys = JSON.parse(oauthKeysContent.trim());

  // Extract client credentials
  const { client_id, client_secret, redirect_uris } = oauthKeys.installed;

  // Create OAuth2 client with proper configuration
  const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  auth.setCredentials(credentials);

  // Force token refresh if needed
  try {
    await auth.getAccessToken();
    console.log("✅ Access token refreshed successfully");
  } catch (error: any) {
    console.error("⚠️ Token refresh failed:", error.message);
  }

  google.options({ auth });

  console.log("✅ Google OAuth credentials loaded successfully");
}

// Create Express app
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Root endpoint with info
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Google Tasks MCP Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      mcp: "/mcp",
      sse: "/sse",
    },
    tools: 7,
    status: "running",
  });
});

// MCP endpoint (streamable)
app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const request = req.body;

    // Route to appropriate handler based on request method
    let response;

    if (request.method === "tools/list") {
      response = await server.request(
        { method: "tools/list", params: {} },
        ListToolsRequestSchema
      );
    } else if (request.method === "tools/call") {
      response = await server.request(
        {
          method: "tools/call",
          params: {
            name: request.params?.name,
            arguments: request.params?.arguments,
          },
        },
        CallToolRequestSchema
      );
    } else if (request.method === "resources/list") {
      response = await server.request(
        {
          method: "resources/list",
          params: request.params || {},
        },
        ListResourcesRequestSchema
      );
    } else if (request.method === "resources/read") {
      response = await server.request(
        {
          method: "resources/read",
          params: { uri: request.params?.uri },
        },
        ReadResourceRequestSchema
      );
    } else {
      throw new Error(`Unknown method: ${request.method}`);
    }

    res.json(response);
  } catch (error: any) {
    console.error("[MCP] Error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// SSE endpoint for streaming
app.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: "ping" })}\n\n`);
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

// Start server
async function startServer() {
  try {
    console.log("🚀 Starting Google Tasks MCP HTTP Server...");
    console.log("=========================================");

    // Load credentials
    await loadCredentials();

    // Test Google Tasks API connection
    console.log("[Google Tasks] Testing API connection...");
    const testResponse = await tasks.tasklists.list({ maxResults: 1 });
    console.log("✅ Google Tasks API connection successful");
    console.log(`📋 Found ${testResponse.data.items?.length || 0} task list(s)`);

    // Start Express server - bind to 0.0.0.0 for Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log("\n✅ Google Tasks MCP HTTP Server started successfully!");
      console.log(`🌐 Server running on: http://0.0.0.0:${PORT}`);
      console.log(`🔗 MCP Endpoint: http://0.0.0.0:${PORT}/mcp`);
      console.log(`🔗 SSE Endpoint: http://0.0.0.0:${PORT}/sse`);
      console.log(`📋 Tools Available: 7`);
      console.log(`🎯 Ready for Claude Desktop integration!`);
      console.log("=========================================\n");
    });
  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Error details:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Add global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

startServer();
