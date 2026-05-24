import type {
  AiProviderConfig,
  CandidateStatus,
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
    updateProfile(
      candidateId: string,
      input: Partial<{
        basic: {
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          city?: string | null;
        };
        skills: Array<{ name: string; type: string }>;
        education: Array<{
          school?: string;
          major?: string | null;
          degree?: string | null;
          graduationDate?: string | null;
        }>;
        workExperiences: Array<{
          companyName?: string;
          title?: string | null;
          startDate?: string | null;
          endDate?: string | null;
          summary?: string | null;
        }>;
        projects: Array<{
          projectName?: string;
          techStack?: string[];
          roleSummary?: string | null;
          highlights?: string[];
        }>;
      }>
    ): Promise<void>;
    updateStatus(candidateId: string, status: CandidateStatus): Promise<void>;
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
    compareJobs(input: {
      jobIds: string[];
      candidateIds: string[];
    }): Promise<MatchingResult[]>;
  };
};
