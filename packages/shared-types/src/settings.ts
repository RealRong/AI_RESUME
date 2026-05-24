import { z } from "zod";

export type AiProviderConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

export const aiProviderConfigSchema = z.object({
  baseUrl: z.string().trim().url(),
  apiKey: z.string().trim().min(1),
  model: z.string().trim().min(1).max(120)
});
