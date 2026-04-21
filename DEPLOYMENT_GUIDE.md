# 🚀 Complete Render Deployment Guide

This guide walks you through deploying the Google Tasks MCP Server to Render step-by-step.

## 📋 Prerequisites

- Google Cloud account
- Render account (free tier works!)
- Git/GitHub account
- Node.js 18+ installed locally

## 🔧 Step 1: Google Cloud Setup (10 minutes)

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Project name: "Google Tasks MCP"
4. Click "Create"
5. Wait for project creation (~30 seconds)

### 1.2 Enable Google Tasks API

1. In the new project, go to **"APIs & Services" → "Library"**
2. Search for: **"Google Tasks API"**
3. Click on it
4. Click **"Enable"**
5. Wait for activation (~10 seconds)

### 1.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Select **"Internal"** (if you have Google Workspace) or **"External"**
3. Fill in:
   - **App name**: Google Tasks MCP Server
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. On "Scopes" page:
   - Click **"Add or Remove Scopes"**
   - Search for: `https://www.googleapis.com/auth/tasks`
   - Check the box
   - Click **"Update"** → **"Save and Continue"**
6. On "Test users" page (if External):
   - Click **"Add Users"**
   - Add your Google email
   - Click **"Save and Continue"**
7. Click **"Back to Dashboard"**

### 1.4 Create OAuth Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Application type: **"Desktop app"**
4. Name: **"Google Tasks MCP Desktop"**
5. Click **"Create"**
6. Click **"Download JSON"** on the popup
7. Save the file

## 💻 Step 2: Local Setup & Authentication (5 minutes)

### 2.1 Prepare the Project

```bash
cd /Users/apple/gtasks-mcp-server-node
npm install
```

### 2.2 Add OAuth Keys

1. Rename your downloaded JSON file to: **`gcp-oauth.keys.json`**
2. Move it to: `/Users/apple/gtasks-mcp-server-node/gcp-oauth.keys.json`

### 2.3 Authenticate

```bash
npm run build
npm run auth
```

**What happens:**
1. Browser opens automatically
2. Google asks you to sign in
3. Google asks for permission to access your Tasks
4. Click "Allow"
5. Terminal shows: "✅ Authentication successful!"

**Result:**
- File created: `.gtasks-server-credentials.json`
- This file contains your access token and refresh token
- **KEEP THIS FILE SECURE!**

### 2.4 Test Locally

```bash
npm start
```

Visit: http://localhost:10000/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T..."
}
```

Press `Ctrl+C` to stop the server.

## 🌐 Step 3: GitHub Setup (2 minutes)

### 3.1 Create GitHub Repository

```bash
cd /Users/apple/gtasks-mcp-server-node
git init
git add .
git commit -m "Initial commit: Google Tasks MCP Server"
```

### 3.2 Push to GitHub

1. Go to [GitHub](https://github.com/new)
2. Repository name: **gtasks-mcp-server**
3. Visibility: **Private** (recommended)
4. Click **"Create repository"**

```bash
git remote add origin https://github.com/YOUR_USERNAME/gtasks-mcp-server.git
git branch -M main
git push -u origin main
```

## 🎯 Step 4: Render Deployment (5 minutes)

### 4.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +" → "Web Service"**
3. Click **"Connect a repository"**
4. Authorize GitHub if prompted
5. Select your **gtasks-mcp-server** repository
6. Click **"Connect"**

### 4.2 Configure Service

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `gtasks-mcp-server` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Starter` (or Free) |

### 4.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |

### 4.4 Upload Secret Credentials

This is the **CRITICAL STEP**:

1. In the same "Advanced" section, scroll to **"Secret Files"**
2. Click **"Add Secret File"**
3. **Filename**: `.gtasks-server-credentials.json`
4. **Contents**: Open your local `.gtasks-server-credentials.json` file, copy all contents, paste here
5. Click **"Save"**

**Note the file path shown:** `/etc/secrets/.gtasks-server-credentials.json`

### 4.5 Add Credentials Path Variable

Add one more environment variable:

| Key | Value |
|-----|-------|
| `GOOGLE_CREDENTIALS_PATH` | `/etc/secrets/.gtasks-server-credentials.json` |

### 4.6 Deploy!

1. Click **"Create Web Service"**
2. Wait for deployment (2-3 minutes)
3. Watch the logs for:
   ```
   ✅ Google OAuth credentials loaded successfully
   ✅ Google Tasks API connection successful
   ✅ Google Tasks MCP HTTP Server started successfully!
   ```

## ✅ Step 5: Verify Deployment (2 minutes)

### 5.1 Check Health Endpoint

Render will give you a URL like: `https://gtasks-mcp-server-xxxx.onrender.com`

Visit: `https://gtasks-mcp-server-xxxx.onrender.com/health`

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T..."
}
```

### 5.2 Check Server Info

Visit: `https://gtasks-mcp-server-xxxx.onrender.com/`

Expected:
```json
{
  "name": "Google Tasks MCP Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "mcp": "/mcp",
    "sse": "/sse"
  },
  "tools": 7,
  "status": "running"
}
```

### 5.3 Test MCP Endpoint

Use `curl` to test:

```bash
curl -X POST https://gtasks-mcp-server-xxxx.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list", "params": {}}'
```

Expected: JSON response with 7 tools listed.

## 🔌 Step 6: Connect to Claude Desktop (5 minutes)

### 6.1 Add to Claude Config

Edit: `~/.claude.json`

Add this to the `mcpServers` section:

```json
{
  "mcpServers": {
    "gtasks-remote": {
      "url": "https://gtasks-mcp-server-xxxx.onrender.com/mcp",
      "transport": "sse"
    }
  }
}
```

Replace `xxxx` with your actual Render URL.

### 6.2 Restart Claude Desktop

1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. Check the MCP tools icon (🔧) - should show "gtasks-remote"

### 6.3 Test in Claude

Try these prompts:

```
"List all my Google Tasks"
"Create a task: Test MCP integration, due tomorrow"
"Search for tasks about 'test'"
"Show me all my task lists"
```

## 🎉 Success!

You now have:
- ✅ Google Tasks MCP Server running on Render
- ✅ 7 tools available for managing tasks
- ✅ Secure OAuth authentication
- ✅ Connected to Claude Desktop
- ✅ Access from mobile (via Claude mobile app)

## 🔄 Updating the Server

When you make changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Render will automatically redeploy!

## 🐛 Troubleshooting

### Error: "Credentials not found"

**Cause**: Secret file not uploaded correctly

**Fix**:
1. Go to Render dashboard → Your service → "Environment"
2. Check "Secret Files" section
3. Verify `.gtasks-server-credentials.json` is there
4. Verify `GOOGLE_CREDENTIALS_PATH` matches the file path

### Error: "API connection failed"

**Cause**: Google Tasks API not enabled or credentials expired

**Fix**:
1. Verify API is enabled in Google Cloud Console
2. Re-run local auth: `npm run auth`
3. Re-upload new credentials to Render Secret Files
4. Redeploy

### Error: "Module not found"

**Cause**: Build failed

**Fix**:
1. Check Render build logs
2. Verify `package.json` is in repository
3. Manually trigger redeploy

### Server crashes on startup

**Cause**: Missing environment variables

**Fix**:
1. Check all environment variables are set:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `GOOGLE_CREDENTIALS_PATH=/etc/secrets/.gtasks-server-credentials.json`
2. Redeploy

## 📞 Need Help?

- Check Render logs: Dashboard → Your service → "Logs"
- Check Google Cloud logs: Cloud Console → "Logging"
- Verify OAuth scopes include Google Tasks
- Try re-authenticating locally and re-uploading credentials

---

**Total setup time: ~30 minutes**
**Deployment cost: Free (on Render free tier)**
**Maintenance: Automatic updates via Git push**
