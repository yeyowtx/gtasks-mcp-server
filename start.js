// Wrapper script to catch startup errors
console.log("=== START WRAPPER ===");
console.log("Node version:", process.version);
console.log("Current directory:", process.cwd());
console.log("Environment:", process.env.NODE_ENV);

try {
  console.log("Attempting to import http-server.js...");
  await import('./dist/http-server.js');
  console.log("Import successful!");
} catch (error) {
  console.error("❌ FATAL ERROR during import:");
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  console.error("Full error:", error);
  process.exit(1);
}
