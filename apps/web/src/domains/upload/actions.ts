import { atom } from "jotai";
import { uploadDomainStateAtom } from "./atoms";
import type { UploadQueueItem } from "./types";

export const enqueueUploadsAtom = atom(null, (_get, set, items: UploadQueueItem[]) => {
  set(uploadDomainStateAtom, (prev) => ({
    ...prev,
    queue: [...prev.queue, ...items]
  }));
});

export const setUploadProgressAtom = atom(
  null,
  (_get, set, payload: { uploadId: string; progress: number; status?: UploadQueueItem["status"] }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.uploadId === payload.uploadId
          ? {
              ...item,
              progress: payload.progress,
              status: payload.status ?? item.status
            }
          : item
      )
    }));
  }
);

export const appendUploadEventAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      uploadId: string;
      type: string;
      eventPayload: Record<string, unknown>;
    }
  ) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.uploadId === payload.uploadId
          ? {
              ...item,
              events: [
                ...(item.events ?? []),
                {
                  type: payload.type,
                  payload: payload.eventPayload
                }
              ]
            }
          : item
      )
    }));
  }
);

export const setPartialExtractionAtom = atom(
  null,
  (_get, set, payload: { uploadId: string; basic: Record<string, unknown> }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.uploadId === payload.uploadId
          ? {
              ...item,
              partialExtraction: {
                ...item.partialExtraction,
                basic: payload.basic
              }
            }
          : item
      )
    }));
  }
);

export const markUploadCompletedAtom = atom(
  null,
  (_get, set, payload: { uploadId: string; candidateId?: string }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.uploadId === payload.uploadId
          ? (() => {
              const nextItem: UploadQueueItem = {
                ...item,
                progress: 100,
                status: "completed"
              };

              if (payload.candidateId) {
                nextItem.candidateId = payload.candidateId;
              }

              return nextItem;
            })()
          : item
      )
    }));
  }
);

export const markUploadFailedAtom = atom(
  null,
  (_get, set, payload: { uploadId: string; error: string }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.uploadId === payload.uploadId
          ? {
              ...item,
              status: "failed",
              error: payload.error
            }
          : item
      )
    }));
  }
);
