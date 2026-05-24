"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  hydrateCandidateListAtom,
  setCandidatePageAtom,
  setCandidateKeywordAtom,
  setCandidateListErrorAtom,
  setCandidateListLoadingAtom,
  setCandidateViewModeAtom
} from "./actions";
import { candidateRemoteAtom, candidateQueryAtom } from "./selectors";

export function useCandidateListState() {
  return {
    query: useAtomValue(candidateQueryAtom),
    remote: useAtomValue(candidateRemoteAtom)
  };
}

export function useCandidateListActions() {
  const setKeyword = useSetAtom(setCandidateKeywordAtom);
  const setPage = useSetAtom(setCandidatePageAtom);
  const setViewMode = useSetAtom(setCandidateViewModeAtom);
  const hydrateList = useSetAtom(hydrateCandidateListAtom);
  const setListLoading = useSetAtom(setCandidateListLoadingAtom);
  const setListError = useSetAtom(setCandidateListErrorAtom);

  return useMemo(
    () => ({
      setKeyword,
      setPage,
      setViewMode,
      hydrateList,
      setListLoading,
      setListError
    }),
    [hydrateList, setKeyword, setListError, setListLoading, setPage, setViewMode]
  );
}
