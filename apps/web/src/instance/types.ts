import type {
  AiProviderConfig,
  CandidateDetail,
  CandidateListItem,
  Job,
  JobDraft,
  MatchingResult,
  UploadListItem
} from "@ai-resume/shared-types";

export type CandidateListQueryInput = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: "score" | "uploadedAt" | "name";
  sortOrder?: "asc" | "desc";
};

export type AppInstance = {
  settings: {
    openAiDialog(): void;
    closeAiDialog(): void;
    updateAiDraft(input: Partial<AiProviderConfig>): void;
    saveAiConfig(): void;
    clearAiConfig(): void;
  };
  upload: {
    createUploads(files: File[]): Promise<UploadListItem[]>;
    subscribeUploadEvents(uploadId: string): void;
    disposeUploadStream(uploadId: string): void;
    disposeUploadResources(clientId: string): void;
  };
  candidate: {
    fetchList(input?: CandidateListQueryInput): Promise<CandidateListItem[]>;
    fetchDetail(candidateId: string): Promise<CandidateDetail>;
  };
  job: {
    fetchList(): Promise<Job[]>;
    createJob(input: JobDraft): Promise<Job>;
    updateJob(jobId: string, input: Partial<JobDraft>): Promise<Job>;
  };
  matching: {
    createMatching(input: {
      jobId: string;
      candidateIds: string[];
    }): Promise<MatchingResult[]>;
  };
};
