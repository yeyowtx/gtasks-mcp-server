# ⚡ Quick Start Guide

Get your Google Tasks MCP Server running in **5 commands**!

## 🎯 For Local Development

```bash
# 1. Install dependencies
cd /Users/apple/gtasks-mcp-server-node
npm install

# 2. Build the project
npm run build

# 3. Set up Google OAuth (opens browser)
npm run auth

# 4. Start the server
npm start
```

Visit: http://localhost:10000/health

## 🚀 For Render Deployment

### Prerequisites
1. ✅ Run steps 1-3 above (local auth)
2. ✅ Create GitHub repo and push code
3. ✅ Have `.gtasks-server-credentials.json` file

### Deploy Steps

1. **Create Web Service** on [Render](https://dashboard.render.com/)
   - Connect GitHub repository
   - Build: `npm install && npm run build`
   - Start: `npm start`

2. **Upload Secret File**
   - Go to "Environment" → "Secret Files"
   - Add `.gtasks-server-credentials.json`
   - Content: Copy from your local file

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   GOOGLE_CREDENTIALS_PATH=/etc/secrets/.gtasks-server-credentials.json
   ```

4. **Deploy** and wait 2-3 minutes

## 🔌 Connect to Claude

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "gtasks": {
      "url": "https://your-app.onrender.com/mcp",
      "transport": "sse"
    }
  }
}
```

Restart Claude Desktop. Done! 🎉

## 🧪 Test Commands

In Claude Desktop, try:

```
"List all my tasks"
"Create a task: Buy milk, due tomorrow"
"Search for tasks about 'project'"
"Show my task lists"
```

## 📖 Need More Help?

- Full docs: [README.md](README.md)
- Step-by-step: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Troubleshooting: See README.md

## 🆘 Common Issues

**"Credentials not found"**
→ Run `npm run auth` first

**"OAuth keys file not found"**
→ Download from Google Cloud Console, rename to `gcp-oauth.keys.json`

**"Build failed on Render"**
→ Check `package.json` is in your repo

**"Can't connect from Claude"**
→ Verify URL in `~/.claude.json` matches your Render URL

---

**Questions?** Check the full [README.md](README.md) or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
