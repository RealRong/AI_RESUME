import { atom } from "jotai";
import type { MatchingResult } from "@ai-resume/shared-types";
import { matchingDomainStateAtom } from "./atoms";

export const hydrateMatchingResultsAtom = atom(
  null,
  (_get, set, results: MatchingResult[]) => {
    set(matchingDomainStateAtom, (prev) => ({
      ...prev,
      results: {
        items: results,
        loading: false,
        error: null
      }
    }));
  }
);

export const setMatchingLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(matchingDomainStateAtom, (prev) => ({
    ...prev,
    results: {
      ...prev.results,
      loading
    }
  }));
});

export const setMatchingErrorAtom = atom(
  null,
  (_get, set, error: string | null) => {
    set(matchingDomainStateAtom, (prev) => ({
      ...prev,
      results: {
        ...prev.results,
        error,
        loading: false
      }
    }));
  }
);

export const setMatchingJobIdAtom = atom(null, (_get, set, jobId: string) => {
  set(matchingDomainStateAtom, (prev) => ({
    ...prev,
    workspace: {
      ...prev.workspace,
      jobId
    }
  }));
});

export const toggleMatchingCandidateAtom = atom(
  null,
  (_get, set, candidateId: string) => {
    set(matchingDomainStateAtom, (prev) => {
      const exists = prev.workspace.candidateIds.includes(candidateId);
      const nextIds = exists
        ? prev.workspace.candidateIds.filter((id) => id !== candidateId)
        : [...prev.workspace.candidateIds, candidateId].slice(0, 3);

      return {
        ...prev,
        workspace: {
          ...prev.workspace,
          candidateIds: nextIds
        }
      };
    });
  }
);
