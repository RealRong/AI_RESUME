import type { AiProviderConfig } from "@ai-resume/shared-types";
import { aiProviderConfigSchema } from "../schemas/shared.schema";

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

export async function createAiTextStream(params: {
  config: AiProviderConfig;
  systemPrompt: string;
  userPrompt: string;
  onText: (text: string) => void | Promise<void>;
}) {
  const response = await fetch(`${params.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.config.apiKey}`
    },
    body: JSON.stringify({
      model: params.config.model,
      temperature: 0,
      stream: true,
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

  if (!response.body) {
    throw new Error("AI response body is empty.");
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const lineBreakIndex = buffer.indexOf("\n");

      if (lineBreakIndex === -1) {
        break;
      }

      const line = buffer.slice(0, lineBreakIndex).trim();
      buffer = buffer.slice(lineBreakIndex + 1);

      if (!line.startsWith("data:")) {
        continue;
      }

      const payload = line.slice(5).trim();

      if (!payload || payload === "[DONE]") {
        continue;
      }

      const parsed = JSON.parse(payload) as {
        choices?: Array<{
          delta?: {
            content?: string;
          };
        }>;
      };

      const content = parsed.choices?.[0]?.delta?.content;

      if (content) {
        await params.onText(content);
      }
    }
  }
}
