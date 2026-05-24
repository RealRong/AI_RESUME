import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

const currentDir = __dirname;
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
