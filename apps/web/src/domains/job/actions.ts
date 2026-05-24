import { atom } from "jotai";
import type { Job, JobDraft } from "@ai-resume/shared-types";
import { jobDomainStateAtom } from "./atoms";

export const hydrateJobsAtom = atom(null, (_get, set, items: Job[]) => {
  set(jobDomainStateAtom, (prev) => ({
    ...prev,
    list: {
      items,
      loading: false,
      error: null
    }
  }));
});

export const setJobsLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(jobDomainStateAtom, (prev) => ({
    ...prev,
    list: {
      ...prev.list,
      loading
    }
  }));
});

export const setJobsErrorAtom = atom(null, (_get, set, error: string | null) => {
  set(jobDomainStateAtom, (prev) => ({
    ...prev,
    list: {
      ...prev.list,
      error,
      loading: false
    }
  }));
});

export const setActiveJobAtom = atom(null, (_get, set, job: Job | null) => {
  set(jobDomainStateAtom, (prev) => ({
    ...prev,
    editor: {
      activeJobId: job?.id ?? null,
      draft: job
        ? {
            title: job.title,
            description: job.description,
            requiredSkills: job.requiredSkills,
            bonusSkills: job.bonusSkills
          }
        : prev.editor.draft,
      dirty: false
    }
  }));
});

export const updateJobDraftAtom = atom(
  null,
  (_get, set, patch: Partial<JobDraft>) => {
    set(jobDomainStateAtom, (prev) => ({
      ...prev,
      editor: {
        ...prev.editor,
        draft: {
          ...prev.editor.draft,
          ...patch
        },
        dirty: true
      }
    }));
  }
);

export const resetJobDraftAtom = atom(null, (_get, set) => {
  set(jobDomainStateAtom, (prev) => ({
    ...prev,
    editor: {
      activeJobId: null,
      draft: {
        title: "",
        description: "",
        requiredSkills: [],
        bonusSkills: []
      },
      dirty: false
    }
  }));
});
