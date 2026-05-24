const uploadStatusLabels = {
  queued: "排队中",
  uploading: "上传中",
  parsing: "解析中",
  extracting: "提取中",
  completed: "已完成",
  failed: "失败"
} as const;

const candidateStatusLabels: Record<string, string> = {
  draft: "草稿",
  processing: "处理中",
  completed: "已完成",
  failed: "失败"
};

export function getUploadStatusLabel(status: keyof typeof uploadStatusLabels) {
  return uploadStatusLabels[status] ?? status;
}

export function getCandidateStatusLabel(status: string) {
  return candidateStatusLabels[status] ?? status;
}
