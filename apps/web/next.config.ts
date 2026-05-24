import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jotaiEntry = require.resolve("jotai");
const jotaiReactEntry = require.resolve("jotai/react");
const jotaiVanillaEntry = require.resolve("jotai/vanilla");

const nextConfig: NextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@ai-resume/shared-types"],
  experimental: {
    devtoolSegmentExplorer: false
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};

    config.resolve.alias = {
      ...config.resolve.alias,
      "jotai$": jotaiEntry,
      "jotai/react$": jotaiReactEntry,
      "jotai/vanilla$": jotaiVanillaEntry
    };

    return config;
  }
};

export default nextConfig;
