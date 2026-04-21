# 🚀 DEPLOY NOW - Complete Instructions

## ✅ What's Already Done

- ✅ Code is complete and tested
- ✅ Local authentication successful
- ✅ Credentials file created: `.gtasks-server-credentials.json`
- ✅ Git repository initialized
- ✅ All files committed

## 🎯 What You Need to Do (10 Minutes Total)

### Step 1: Create GitHub Repository (2 minutes)

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `gtasks-mcp-server`
   - **Visibility**: Private
   - **DON'T** check "Initialize with README"
3. Click **"Create repository"**

### Step 2: Push Code to GitHub (1 minute)

```bash
cd /Users/apple/gtasks-mcp-server-node
git remote set-url origin https://github.com/YOUR_USERNAME/gtasks-mcp-server.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Deploy to Render (5 minutes)

#### 3.1 Create Web Service

1. Go to: https://dashboard.render.com/
2. Click **"New +" → "Web Service"**
3. Click **"Connect a repository"**
4. Select **"gtasks-mcp-server"**
5. Click **"Connect"**

#### 3.2 Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `gtasks-mcp-server` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Starter` (or Free) |

#### 3.3 Upload Credentials File (CRITICAL!)

1. Click **"Advanced"**
2. Scroll to **"Secret Files"**
3. Click **"Add Secret File"**
4. **Filename**: `.gtasks-server-credentials.json`
5. **Contents**: Run this command to copy the content:

```bash
cat /Users/apple/gtasks-mcp-server-node/.gtasks-server-credentials.json | pbcopy
```

Then paste (Cmd+V) into the "Contents" field.

6. Click **"Save"**

#### 3.4 Add Environment Variables

Still in "Advanced" section:

Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `GOOGLE_CREDENTIALS_PATH` | `/etc/secrets/.gtasks-server-credentials.json` |

#### 3.5 Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build
3. Watch logs for success message

### Step 4: Verify Deployment (2 minutes)

Render will give you a URL like: `https://gtasks-mcp-server-xxxx.onrender.com`

**Test it:**

```bash
# Replace xxxx with your actual URL
curl https://gtasks-mcp-server-xxxx.onrender.com/health
```

Expected response:
```json
{"status":"healthy","timestamp":"..."}
```

### Step 5: Connect to Claude Desktop (2 minutes)

1. Edit: `~/.claude.json`
2. Add this server:

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

3. Restart Claude Desktop (Cmd+Q, reopen)
4. Test: "List all my Google Tasks"

## 🎉 Success Checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Credentials uploaded as Secret File
- [ ] Environment variables set
- [ ] Deployment successful (check logs)
- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] Added to Claude Desktop config
- [ ] Can list tasks in Claude

## 🐛 Troubleshooting

### "Repository not found"
→ Make sure the GitHub repo exists and you have access

### "Build failed on Render"
→ Check build logs, verify `package.json` is in repo

### "Credentials not found"
→ Verify Secret File was uploaded correctly
→ Check `GOOGLE_CREDENTIALS_PATH` matches `/etc/secrets/.gtasks-server-credentials.json`

### "Can't connect from Claude"
→ Verify URL in `~/.claude.json` matches your Render URL
→ Make sure transport is set to `"sse"`

## 📞 Need Help?

Check the full guides:
- README.md - Complete documentation
- DEPLOYMENT_GUIDE.md - Step-by-step with screenshots
- QUICK_START.md - Quick reference

## ⚡ Quick Copy Commands

**Copy credentials to clipboard:**
```bash
cat /Users/apple/gtasks-mcp-server-node/.gtasks-server-credentials.json | pbcopy
```

**Test local server:**
```bash
cd /Users/apple/gtasks-mcp-server-node
npm start
```

**View credentials file location:**
```bash
ls -la /Users/apple/gtasks-mcp-server-node/.gtasks-server-credentials.json
```

---

**Total Time: ~10 minutes**

**You're almost done! Just create the GitHub repo and follow the steps above.**
