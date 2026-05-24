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
    stage?: "basic" | "education" | "workExperiences" | "skills" | "projects";
    basic?: {
      name?: string | null;
      phone?: string | null;
      email?: string | null;
      city?: string | null;
    };
    education?: Array<{
      school: string;
      major?: string | null;
      degree?: string | null;
      graduationDate?: string | null;
    }>;
    workExperiences?: Array<{
      companyName: string;
      title?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      summary?: string | null;
    }>;
    skills?: Array<{
      name: string;
      type: string;
    }>;
    projects?: Array<{
      projectName: string;
      techStack?: string[];
      roleSummary?: string | null;
      highlights?: string[];
    }>;
  };
};

export type UploadDomainState = {
  queue: UploadQueueItem[];
  activeEventSourceIds: string[];
};
