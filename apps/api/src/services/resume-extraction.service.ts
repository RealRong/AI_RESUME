import type { AiProviderConfig } from "@ai-resume/shared-types";
import { createAiJsonCompletion } from "./ai-provider.service";

export type ExtractionBasicInfo = {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
};

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /(?:\+?\d[\d\s-]{7,}\d)/;

export function extractResumeBasics(cleanedText: string): ExtractionBasicInfo {
  const lines = cleanedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstMeaningfulLine = lines[0] ?? "";
  const email = cleanedText.match(emailRegex)?.[0] ?? null;
  const phone = cleanedText.match(phoneRegex)?.[0] ?? null;

  return {
    name: firstMeaningfulLine ? firstMeaningfulLine.slice(0, 80) : null,
    phone,
    email,
    city: null
  };
}

export async function extractResumeBasicsWithAi(params: {
  cleanedText: string;
  config: AiProviderConfig;
}) {
  const result = await createAiJsonCompletion<Partial<ExtractionBasicInfo>>({
    config: params.config,
    systemPrompt:
      "你是一个简历信息提取器。只返回 JSON，不要返回 Markdown。请从简历文本中提取候选人的姓名、手机号、邮箱、城市。无法确定时返回 null。",
    userPrompt: [
      "请从以下简历文本中提取结构化字段，并返回 JSON：",
      '{ "name": string | null, "phone": string | null, "email": string | null, "city": string | null }',
      "",
      params.cleanedText.slice(0, 16000)
    ].join("\n")
  });

  return {
    name: typeof result.name === "string" ? result.name.trim() || null : null,
    phone: typeof result.phone === "string" ? result.phone.trim() || null : null,
    email: typeof result.email === "string" ? result.email.trim() || null : null,
    city: typeof result.city === "string" ? result.city.trim() || null : null
  } satisfies ExtractionBasicInfo;
}
