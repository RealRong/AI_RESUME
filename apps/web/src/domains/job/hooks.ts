"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { hydrateJobsAtom } from "./actions";
import { jobEditorAtom, jobListAtom } from "./selectors";

export function useJobState() {
  return {
    list: useAtomValue(jobListAtom),
    editor: useAtomValue(jobEditorAtom)
  };
}

export function useJobActions() {
  return {
    hydrateJobs: useSetAtom(hydrateJobsAtom)
  };
}
