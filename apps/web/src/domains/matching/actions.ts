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
