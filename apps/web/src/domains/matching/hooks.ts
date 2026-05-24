"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  hydrateMatchingResultsAtom,
  setMatchingErrorAtom,
  setMatchingJobIdAtom,
  setMatchingLoadingAtom,
  toggleMatchingCandidateAtom
} from "./actions";
import { matchingResultsAtom, matchingWorkspaceAtom } from "./selectors";

export function useMatchingWorkspaceState() {
  return {
    workspace: useAtomValue(matchingWorkspaceAtom),
    results: useAtomValue(matchingResultsAtom)
  };
}

export function useMatchingWorkspaceActions() {
  const hydrateResults = useSetAtom(hydrateMatchingResultsAtom);
  const setMatchingLoading = useSetAtom(setMatchingLoadingAtom);
  const setMatchingError = useSetAtom(setMatchingErrorAtom);
  const setJobId = useSetAtom(setMatchingJobIdAtom);
  const toggleCandidate = useSetAtom(toggleMatchingCandidateAtom);

  return useMemo(
    () => ({
      hydrateResults,
      setMatchingLoading,
      setMatchingError,
      setJobId,
      toggleCandidate
    }),
    [hydrateResults, setJobId, setMatchingError, setMatchingLoading, toggleCandidate]
  );
}
