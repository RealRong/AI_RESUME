import type { ApiResponse, UploadListItem } from "@ai-resume/shared-types";
import type { AiProviderConfig } from "@ai-resume/shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

function createAiHeaders(config?: AiProviderConfig | null) {
  if (!config?.apiKey.trim()) {
    return {};
  }

  return {
    "x-ai-base-url": config.baseUrl,
    "x-ai-api-key": config.apiKey,
    "x-ai-model": config.model
  };
}

export async function createUploadsRequest(files: File[], config?: AiProviderConfig | null) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    body: formData,
    headers: createAiHeaders(config)
  });

  if (!response.ok) {
    throw new Error(`Upload request failed: ${response.status}`);
  }

  return (await response.json()) as ApiResponse<{
    uploads: UploadListItem[];
  }>;
}

export function createUploadEventSource(uploadId: string) {
  return new EventSource(`${API_BASE_URL}/api/uploads/${uploadId}/events`);
}
