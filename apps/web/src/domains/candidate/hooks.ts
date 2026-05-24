"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  clearCandidateFiltersAtom,
  hydrateCandidateListAtom,
  setCandidatePageAtom,
  setCandidateKeywordAtom,
  setCandidateListErrorAtom,
  setCandidateListLoadingAtom,
  setCandidateSortAtom,
  setCandidateViewModeAtom,
  toggleCandidateCompareAtom,
  toggleCandidateSkillFilterAtom,
  toggleCandidateStatusFilterAtom
} from "./actions";
import { candidateRemoteAtom, candidateQueryAtom, candidateSelectionAtom } from "./selectors";

export function useCandidateListState() {
  return {
    query: useAtomValue(candidateQueryAtom),
    remote: useAtomValue(candidateRemoteAtom),
    selection: useAtomValue(candidateSelectionAtom)
  };
}

export function useCandidateListActions() {
  const setKeyword = useSetAtom(setCandidateKeywordAtom);
  const setPage = useSetAtom(setCandidatePageAtom);
  const setViewMode = useSetAtom(setCandidateViewModeAtom);
  const setSort = useSetAtom(setCandidateSortAtom);
  const toggleStatusFilter = useSetAtom(toggleCandidateStatusFilterAtom);
  const toggleSkillFilter = useSetAtom(toggleCandidateSkillFilterAtom);
  const clearFilters = useSetAtom(clearCandidateFiltersAtom);
  const toggleCompare = useSetAtom(toggleCandidateCompareAtom);
  const hydrateList = useSetAtom(hydrateCandidateListAtom);
  const setListLoading = useSetAtom(setCandidateListLoadingAtom);
  const setListError = useSetAtom(setCandidateListErrorAtom);

  return useMemo(
    () => ({
      setKeyword,
      setPage,
      setViewMode,
      setSort,
      toggleStatusFilter,
      toggleSkillFilter,
      clearFilters,
      toggleCompare,
      hydrateList,
      setListLoading,
      setListError
    }),
    [clearFilters, hydrateList, setKeyword, setListError, setListLoading, setPage, setSort, setViewMode, toggleCompare, toggleSkillFilter, toggleStatusFilter]
  );
}
