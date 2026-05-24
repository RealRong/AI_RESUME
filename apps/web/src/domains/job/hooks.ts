"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  hydrateJobsAtom,
  resetJobDraftAtom,
  setActiveJobAtom,
  setJobsErrorAtom,
  setJobsLoadingAtom,
  updateJobDraftAtom
} from "./actions";
import { jobEditorAtom, jobListAtom } from "./selectors";

export function useJobState() {
  return {
    list: useAtomValue(jobListAtom),
    editor: useAtomValue(jobEditorAtom)
  };
}

export function useJobActions() {
  const hydrateJobs = useSetAtom(hydrateJobsAtom);
  const setJobsLoading = useSetAtom(setJobsLoadingAtom);
  const setJobsError = useSetAtom(setJobsErrorAtom);
  const setActiveJob = useSetAtom(setActiveJobAtom);
  const updateDraft = useSetAtom(updateJobDraftAtom);
  const resetDraft = useSetAtom(resetJobDraftAtom);

  return useMemo(
    () => ({
      hydrateJobs,
      setJobsLoading,
      setJobsError,
      setActiveJob,
      updateDraft,
      resetDraft
    }),
    [hydrateJobs, resetDraft, setActiveJob, setJobsError, setJobsLoading, updateDraft]
  );
}
