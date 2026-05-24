import type { Request } from "express";
import { parseAiProviderConfig } from "../services/ai-provider.service";

export function getAiConfigFromRequest(req: Request) {
  const baseUrlHeader = req.header("x-ai-base-url");
  const apiKeyHeader = req.header("x-ai-api-key");
  const modelHeader = req.header("x-ai-model");

  return parseAiProviderConfig({
    baseUrl: baseUrlHeader,
    apiKey: apiKeyHeader,
    model: modelHeader
  });
}
