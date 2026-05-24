"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { hydrateCandidateListAtom, setCandidateKeywordAtom } from "./actions";
import { candidateRemoteAtom, candidateQueryAtom } from "./selectors";

export function useCandidateListState() {
  return {
    query: useAtomValue(candidateQueryAtom),
    remote: useAtomValue(candidateRemoteAtom)
  };
}

export function useCandidateListActions() {
  return {
    setKeyword: useSetAtom(setCandidateKeywordAtom),
    hydrateList: useSetAtom(hydrateCandidateListAtom)
  };
}
