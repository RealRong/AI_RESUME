import { atom } from "jotai";
import type { CandidateListState } from "./types";

export const candidateListStateAtom = atom<CandidateListState>({
  query: {
    keyword: "",
    page: 1,
    pageSize: 20,
    sortBy: "uploadedAt",
    sortOrder: "desc",
    filters: {
      status: [],
      skills: []
    },
    viewMode: "table"
  },
  selection: {
    selectedIds: [],
    compareIds: []
  },
  remote: {
    items: [],
    total: 0,
    loading: false,
    error: null
  }
});
