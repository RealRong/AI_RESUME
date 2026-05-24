export type UploadQueueItem = {
  uploadId: string;
  fileName: string;
  progress: number;
  status: "queued" | "uploading" | "parsing" | "extracting" | "completed" | "failed";
  candidateId?: string;
  error?: string;
  events?: Array<{
    type: string;
    payload: Record<string, unknown>;
  }>;
  partialExtraction?: {
    basic?: Record<string, unknown>;
  };
};

export type UploadDomainState = {
  queue: UploadQueueItem[];
  activeEventSourceIds: string[];
};
