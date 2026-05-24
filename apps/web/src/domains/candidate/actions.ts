import { atom } from "jotai";
import type { CandidateListItem } from "@ai-resume/shared-types";
import { candidateListStateAtom } from "./atoms";

export const setCandidateKeywordAtom = atom(null, (_get, set, keyword: string) => {
  set(candidateListStateAtom, (prev) => ({
    ...prev,
    query: {
      ...prev.query,
      keyword,
      page: 1
    }
  }));
});

export const hydrateCandidateListAtom = atom(
  null,
  (_get, set, payload: { items: CandidateListItem[]; total: number }) => {
    set(candidateListStateAtom, (prev) => ({
      ...prev,
      remote: {
        ...prev.remote,
        items: payload.items,
        total: payload.total,
        loading: false,
        error: null
      }
    }));
  }
);
