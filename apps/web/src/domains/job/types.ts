import type { Job, JobDraft } from "@ai-resume/shared-types";

export type JobDomainState = {
  list: {
    items: Job[];
    loading: boolean;
    error: string | null;
  };
  editor: {
    activeJobId: string | null;
    draft: JobDraft;
    dirty: boolean;
  };
};
