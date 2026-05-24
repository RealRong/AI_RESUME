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

export const setCandidateSortAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      sortBy: "score" | "uploadedAt" | "name";
      sortOrder: "asc" | "desc";
    }
  ) => {
    set(candidateListStateAtom, (prev) => ({
      ...prev,
      query: {
        ...prev.query,
        sortBy: payload.sortBy,
        sortOrder: payload.sortOrder
      }
    }));
  }
);

export const toggleCandidateStatusFilterAtom = atom(
  null,
  (_get, set, status: string) => {
    set(candidateListStateAtom, (prev) => {
      const exists = prev.query.filters.status.includes(status);
      return {
        ...prev,
        query: {
          ...prev.query,
          page: 1,
          filters: {
            ...prev.query.filters,
            status: exists
              ? prev.query.filters.status.filter((item) => item !== status)
              : [...prev.query.filters.status, status]
          }
        }
      };
    });
  }
);

export const toggleCandidateSkillFilterAtom = atom(
  null,
  (_get, set, skill: string) => {
    set(candidateListStateAtom, (prev) => {
      const exists = prev.query.filters.skills.includes(skill);
      return {
        ...prev,
        query: {
          ...prev.query,
          page: 1,
          filters: {
            ...prev.query.filters,
            skills: exists
              ? prev.query.filters.skills.filter((item) => item !== skill)
              : [...prev.query.filters.skills, skill]
          }
        }
      };
    });
  }
);

export const clearCandidateFiltersAtom = atom(null, (_get, set) => {
  set(candidateListStateAtom, (prev) => ({
    ...prev,
    query: {
      ...prev.query,
      page: 1,
      filters: {
        status: [],
        skills: []
      }
    }
  }));
});

export const toggleCandidateCompareAtom = atom(
  null,
  (_get, set, candidateId: string) => {
    set(candidateListStateAtom, (prev) => {
      const exists = prev.selection.compareIds.includes(candidateId);
      const compareIds = exists
        ? prev.selection.compareIds.filter((item) => item !== candidateId)
        : [...prev.selection.compareIds, candidateId].slice(0, 3);

      return {
        ...prev,
        selection: {
          ...prev.selection,
          compareIds
        }
      };
    });
  }
);

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
