"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { hydrateMatchingResultsAtom } from "./actions";
import { matchingResultsAtom, matchingWorkspaceAtom } from "./selectors";

export function useMatchingWorkspaceState() {
  return {
    workspace: useAtomValue(matchingWorkspaceAtom),
    results: useAtomValue(matchingResultsAtom)
  };
}

export function useMatchingWorkspaceActions() {
  return {
    hydrateResults: useSetAtom(hydrateMatchingResultsAtom)
  };
}
