"use client";

import { useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  appendUploadEventAtom,
  enqueueUploadsAtom,
  markUploadCompletedAtom,
  markUploadFailedAtom,
  replaceQueuedUploadsAtom,
  hydrateUploadExtractionSnapshotAtom,
  setUploadPreviewFailedAtom,
  setUploadPreviewGeneratingAtom,
  setUploadPreviewReadyAtom,
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
  const replaceQueuedUploads = useSetAtom(replaceQueuedUploadsAtom);
  const setUploadPreviewGenerating = useSetAtom(setUploadPreviewGeneratingAtom);
  const setUploadPreviewReady = useSetAtom(setUploadPreviewReadyAtom);
  const setUploadPreviewFailed = useSetAtom(setUploadPreviewFailedAtom);
  const setUploadProgress = useSetAtom(setUploadProgressAtom);
  const appendUploadEvent = useSetAtom(appendUploadEventAtom);
  const setPartialExtraction = useSetAtom(setPartialExtractionAtom);
  const markUploadCompleted = useSetAtom(markUploadCompletedAtom);
  const markUploadFailed = useSetAtom(markUploadFailedAtom);
  const hydrateExtractionSnapshot = useSetAtom(hydrateUploadExtractionSnapshotAtom);

  return useMemo(
    () => ({
      enqueueUploads,
      replaceQueuedUploads,
      setUploadPreviewGenerating,
      setUploadPreviewReady,
      setUploadPreviewFailed,
      setUploadProgress,
      appendUploadEvent,
      setPartialExtraction,
      markUploadCompleted,
      markUploadFailed,
      hydrateExtractionSnapshot
    }),
    [
      appendUploadEvent,
      enqueueUploads,
      markUploadCompleted,
      markUploadFailed,
      replaceQueuedUploads,
      setUploadPreviewFailed,
      setUploadPreviewGenerating,
      setUploadPreviewReady,
      setPartialExtraction,
      setUploadProgress,
      hydrateExtractionSnapshot
    ]
  );
}
