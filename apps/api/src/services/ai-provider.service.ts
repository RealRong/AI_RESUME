import { aiProviderConfigSchema, type AiProviderConfig } from "@ai-resume/shared-types";

export function parseAiProviderConfig(input: {
  baseUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
  model?: string | null | undefined;
}): AiProviderConfig | null {
  if (!input.apiKey?.trim()) {
    return null;
  }

  return aiProviderConfigSchema.parse({
    baseUrl: input.baseUrl?.trim() || "https://api.openai.com/v1",
    apiKey: input.apiKey.trim(),
    model: input.model?.trim() || "gpt-5.4"
  });
}

export async function createAiJsonCompletion<T>(params: {
  config: AiProviderConfig;
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
  const response = await fetch(`${params.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.config.apiKey}`
    },
    body: JSON.stringify({
      model: params.config.model,
      temperature: 0,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: params.systemPrompt
        },
        {
          role: "user",
          content: params.userPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI request failed: ${response.status} ${text}`.slice(0, 500));
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const rawContent = payload.choices?.[0]?.message?.content;
  const content = Array.isArray(rawContent)
    ? rawContent
        .map((item) => item.text ?? "")
        .join("")
        .trim()
    : rawContent?.trim();

  if (!content) {
    throw new Error("AI response content is empty.");
  }

  return JSON.parse(content) as T;
}
