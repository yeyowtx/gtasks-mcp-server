# Google Tasks MCP Server (Node.js + HTTP/SSE)

A production-ready MCP (Model Context Protocol) server for Google Tasks with HTTP/SSE transport, designed for deployment on Render and integration with Claude Desktop.

## 🎯 Features

- ✅ **7 Tools**: search, list, create, update, delete, clear, list-tasklists
- ✅ **HTTP/SSE Transport**: Works with remote MCP connections
- ✅ **Node.js**: Full TypeScript support with ES modules
- ✅ **Render Ready**: Pre-configured for Render deployment
- ✅ **Google OAuth**: Secure authentication with Google Tasks API
- ✅ **Production Tested**: Based on proven MCP SDK patterns

## 📋 Tools Available

1. **search** - Search for tasks by title or notes
2. **list** - List all tasks across all task lists
3. **create** - Create a new task with title, notes, and due date
4. **update** - Update existing task properties
5. **delete** - Delete a task
6. **clear** - Clear completed tasks from a list
7. **list-tasklists** - List all task lists in your account

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd gtasks-mcp-server-node
npm install
```

### 2. Set Up Google OAuth

#### A. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Tasks API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Tasks API"
   - Click "Enable"

#### B. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "Internal" (for testing) or "External"
3. Fill in app name and support email
4. Add scope: `https://www.googleapis.com/auth/tasks`
5. Save and continue

#### C. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Desktop app**
4. Name it: "Google Tasks MCP Server"
5. Click "Create"
6. Download the JSON file
7. Rename it to `gcp-oauth.keys.json`
8. Place it in the root of this project

### 3. Authenticate

```bash
npm run build
npm run auth
```

This will:
- Open your browser for Google OAuth
- Save credentials to `.gtasks-server-credentials.json`
- You only need to do this once

### 4. Start the Server

```bash
npm start
```

Server will be available at:
- **Health**: http://localhost:10000/health
- **MCP**: http://localhost:10000/mcp
- **SSE**: http://localhost:10000/sse

## 🌐 Render Deployment

### Option 1: Deploy via Render Dashboard

1. **Fork/Clone this repo** to your GitHub account

2. **Authenticate locally first**:
   ```bash
   npm run auth
   ```
   This creates `.gtasks-server-credentials.json`

3. **Create new Web Service on Render**:
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Environment**: Node

4. **Upload credentials as a Secret File**:
   - In Render dashboard, go to "Environment"
   - Click "Secret Files"
   - Upload `.gtasks-server-credentials.json`
   - Note the file path (e.g., `/etc/secrets/gtasks-credentials`)

5. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   GOOGLE_CREDENTIALS_PATH=/etc/secrets/.gtasks-server-credentials.json
   ```

6. **Deploy** and wait for build to complete

### Option 2: Deploy via render.yaml

1. Authenticate locally (same as above)
2. Upload credentials to Render as Secret File
3. Push your code with `render.yaml` included
4. Render will auto-deploy

### Verify Deployment

Visit: `https://your-app-name.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T12:00:00.000Z"
}
```

## 🔌 Connect to Claude Desktop

### Local Connection (stdio)

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "gtasks-local": {
      "command": "node",
      "args": ["/absolute/path/to/gtasks-mcp-server-node/dist/http-server.js"]
    }
  }
}
```

### Remote Connection (HTTP/SSE)

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "gtasks-remote": {
      "url": "https://your-app-name.onrender.com/mcp",
      "transport": "sse"
    }
  }
}
```

Restart Claude Desktop and you'll see Google Tasks tools available!

## 📖 Usage Examples

Once connected, you can use Claude to:

```
"List all my tasks"
"Create a task: Buy groceries, due tomorrow"
"Search for tasks about 'project'"
"Mark task XYZ as completed"
"Clear all completed tasks"
"Show me all my task lists"
```

## 🛠️ Development

### Build
```bash
npm run build
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Run Authentication
```bash
npm run auth
```

## 📁 Project Structure

```
gtasks-mcp-server-node/
├── src/
│   ├── http-server.ts    # Main HTTP server with MCP integration
│   ├── Tasks.ts           # Google Tasks API business logic
│   └── auth.ts            # OAuth authentication script
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── render.yaml            # Render deployment config
├── .env.example           # Environment variables template
├── .gitignore
└── README.md
```

## 🔒 Security Notes

- ✅ `.gitignore` excludes all credential files
- ✅ Never commit `gcp-oauth.keys.json` or `.gtasks-server-credentials.json`
- ✅ Use Render Secret Files for production credentials
- ✅ OAuth tokens are scoped to Google Tasks only
- ✅ CORS enabled for browser-based MCP clients

## 🐛 Troubleshooting

### "Credentials not found"
- Run `npm run auth` first
- Make sure `.gtasks-server-credentials.json` exists
- For Render: verify Secret File path matches `GOOGLE_CREDENTIALS_PATH`

### "OAuth keys file not found"
- Download OAuth credentials from Google Cloud Console
- Rename to `gcp-oauth.keys.json`
- Place in project root

### "API connection failed"
- Verify Google Tasks API is enabled in your project
- Check OAuth scopes include `https://www.googleapis.com/auth/tasks`
- Try re-authenticating: `npm run auth`

### Build errors
```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

## 📊 API Endpoints

### GET /
Server info and available endpoints

### GET /health
Health check endpoint (required by Render)

### POST /mcp
Main MCP endpoint for tool calls and resource queries

### GET /sse
Server-Sent Events endpoint for streaming

## 🔄 Updating

To update the server:

```bash
git pull
npm install
npm run build
npm start
```

For Render deployments, just push to your connected repository.

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- MCP Documentation: https://modelcontextprotocol.io/
- Google Tasks API: https://developers.google.com/tasks

---

**Built with ❤️ for the MCP ecosystem**
