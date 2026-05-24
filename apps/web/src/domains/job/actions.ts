import { atom } from "jotai";
import type { Job } from "@ai-resume/shared-types";
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
