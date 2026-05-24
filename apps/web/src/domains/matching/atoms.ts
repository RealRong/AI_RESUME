import { atom } from "jotai";
import type { MatchingDomainState } from "./types";

export const matchingDomainStateAtom = atom<MatchingDomainState>({
  workspace: {
    jobId: null,
    candidateIds: []
  },
  results: {
    items: [],
    loading: false,
    error: null
  }
});
