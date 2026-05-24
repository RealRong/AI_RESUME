import { atom } from "jotai";
import { uploadDomainStateAtom } from "./atoms";
import type { UploadQueueItem } from "./types";

export const enqueueUploadsAtom = atom(null, (_get, set, items: UploadQueueItem[]) => {
  set(uploadDomainStateAtom, (prev) => ({
    ...prev,
    queue: [...prev.queue, ...items]
  }));
});
