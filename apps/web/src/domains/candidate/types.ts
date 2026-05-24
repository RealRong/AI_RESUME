import type { CandidateListItem } from "@ai-resume/shared-types";

export type CandidateListState = {
  query: {
    keyword: string;
    page: number;
    pageSize: number;
    sortBy: "score" | "uploadedAt" | "name";
    sortOrder: "asc" | "desc";
    filters: {
      status: string[];
      skills: string[];
    };
    viewMode: "table" | "card";
  };
  selection: {
    selectedIds: string[];
    compareIds: string[];
  };
  remote: {
    items: CandidateListItem[];
    total: number;
    loading: boolean;
    error: string | null;
  };
};
