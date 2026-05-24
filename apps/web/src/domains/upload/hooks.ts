"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { enqueueUploadsAtom } from "./actions";
import { uploadQueueAtom } from "./selectors";

export function useUploadQueueState() {
  return {
    queue: useAtomValue(uploadQueueAtom)
  };
}

export function useUploadQueueActions() {
  return {
    enqueueUploads: useSetAtom(enqueueUploadsAtom)
  };
}
