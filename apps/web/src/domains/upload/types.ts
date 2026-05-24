export type UploadQueueItem = {
  uploadId: string;
  fileName: string;
  progress: number;
  status: "queued" | "uploading" | "parsing" | "extracting" | "completed" | "failed";
  candidateId?: string;
  error?: string;
};

export type UploadDomainState = {
  queue: UploadQueueItem[];
  activeEventSourceIds: string[];
};
