import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.resolve(currentDir, "..", "..");
const workspaceRoot = path.resolve(apiRoot, "..", "..");

const envFiles = [
  path.join(apiRoot, ".env.local"),
  path.join(apiRoot, ".env"),
  path.join(workspaceRoot, ".env.local"),
  path.join(workspaceRoot, ".env")
];

for (const envFile of envFiles) {
  if (!existsSync(envFile)) {
    continue;
  }

  config({
    path: envFile,
    override: false
  });
}
