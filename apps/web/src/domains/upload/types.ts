export type UploadThumbnailStatus = "idle" | "generating" | "ready" | "failed";

export type UploadPreview = {
  fileObjectUrl?: string;
  thumbnailUrl?: string;
  thumbnailStatus: UploadThumbnailStatus;
  thumbnailError?: string;
  pageCount?: number;
};

export type UploadQueueItem = {
  clientId: string;
  uploadId: string;
  fileName: string;
  progress: number;
  status: "queued" | "uploading" | "parsing" | "extracting" | "completed" | "failed";
  candidateId?: string;
  error?: string;
  fileSize?: number;
  preview?: UploadPreview;
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
