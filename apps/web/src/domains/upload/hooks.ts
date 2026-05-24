"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  appendUploadEventAtom,
  enqueueUploadsAtom,
  markUploadCompletedAtom,
  markUploadFailedAtom,
  setPartialExtractionAtom,
  setUploadProgressAtom
} from "./actions";
import { uploadQueueAtom } from "./selectors";

export function useUploadQueueState() {
  return {
    queue: useAtomValue(uploadQueueAtom)
  };
}

export function useUploadQueueActions() {
  const enqueueUploads = useSetAtom(enqueueUploadsAtom);
  const setUploadProgress = useSetAtom(setUploadProgressAtom);
  const appendUploadEvent = useSetAtom(appendUploadEventAtom);
  const setPartialExtraction = useSetAtom(setPartialExtractionAtom);
  const markUploadCompleted = useSetAtom(markUploadCompletedAtom);
  const markUploadFailed = useSetAtom(markUploadFailedAtom);

  return useMemo(
    () => ({
      enqueueUploads,
      setUploadProgress,
      appendUploadEvent,
      setPartialExtraction,
      markUploadCompleted,
      markUploadFailed
    }),
    [
      appendUploadEvent,
      enqueueUploads,
      markUploadCompleted,
      markUploadFailed,
      setPartialExtraction,
      setUploadProgress
    ]
  );
}
