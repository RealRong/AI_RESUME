import { atom } from "jotai";
import type { JobDomainState } from "./types";

export const jobDomainStateAtom = atom<JobDomainState>({
  list: {
    items: [],
    loading: false,
    error: null
  },
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
});
