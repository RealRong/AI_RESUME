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

export const setCandidatePageAtom = atom(null, (_get, set, page: number) => {
  set(candidateListStateAtom, (prev) => ({
    ...prev,
    query: {
      ...prev.query,
      page
    }
  }));
});

export const setCandidateViewModeAtom = atom(
  null,
  (_get, set, viewMode: "table" | "card") => {
    set(candidateListStateAtom, (prev) => ({
      ...prev,
      query: {
        ...prev.query,
        viewMode
      }
    }));
  }
);

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

export const setCandidateListLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(candidateListStateAtom, (prev) => ({
    ...prev,
    remote: {
      ...prev.remote,
      loading
    }
  }));
});

export const setCandidateListErrorAtom = atom(
  null,
  (_get, set, error: string | null) => {
    set(candidateListStateAtom, (prev) => ({
      ...prev,
      remote: {
        ...prev.remote,
        error,
        loading: false
      }
    }));
  }
);
