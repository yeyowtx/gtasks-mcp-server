import { authenticate } from "@google-cloud/local-auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, "../.gtasks-server-credentials.json");
const OAUTH_KEYS_PATH = path.join(__dirname, "../gcp-oauth.keys.json");

async function authenticateAndSaveCredentials() {
  console.log("🔐 Starting Google OAuth authentication flow...");
  console.log("=========================================\n");

  if (!fs.existsSync(OAUTH_KEYS_PATH)) {
    console.error("❌ OAuth keys file not found at:", OAUTH_KEYS_PATH);
    console.error("\nPlease follow these steps:");
    console.error("1. Go to https://console.cloud.google.com/");
    console.error("2. Create a new project or select existing");
    console.error("3. Enable Google Tasks API");
    console.error("4. Create OAuth 2.0 credentials (Desktop App)");
    console.error("5. Download the JSON file");
    console.error("6. Rename it to 'gcp-oauth.keys.json'");
    console.error("7. Place it in the root of this project\n");
    process.exit(1);
  }

  try {
    console.log("📂 Found OAuth keys file");
    console.log("🌐 Opening browser for authentication...\n");

    const auth = await authenticate({
      keyfilePath: OAUTH_KEYS_PATH,
      scopes: ["https://www.googleapis.com/auth/tasks"],
    });

    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(auth.credentials, null, 2));

    console.log("\n✅ Authentication successful!");
    console.log("📝 Credentials saved to:", CREDENTIALS_PATH);
    console.log("\n🎉 You can now run the server with: npm start");
    console.log("=========================================\n");
  } catch (error: any) {
    console.error("\n❌ Authentication failed:", error.message);
    process.exit(1);
  }
}

authenticateAndSaveCredentials();
