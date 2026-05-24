import { atom } from "jotai";
import { uploadDomainStateAtom } from "./atoms";
import type { UploadQueueItem } from "./types";

export const enqueueUploadsAtom = atom(null, (_get, set, items: UploadQueueItem[]) => {
  set(uploadDomainStateAtom, (prev) => ({
    ...prev,
    queue: [...prev.queue, ...items]
  }));
});

export const replaceQueuedUploadsAtom = atom(
  null,
  (
    _get,
    set,
    payload: {
      localClientIds: string[];
      items: UploadQueueItem[];
    }
  ) => {
    const currentItemsByClientId = new Map<string, UploadQueueItem>();

    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: [
        ...prev.queue
          .filter((item) => {
            currentItemsByClientId.set(item.clientId, item);
            return !payload.localClientIds.includes(item.clientId);
          }),
        ...payload.items.map((item) => {
          const currentItem = currentItemsByClientId.get(item.clientId);

          if (!currentItem) {
            return item;
          }

          const nextItem: UploadQueueItem = {
            ...currentItem,
            ...item,
          };

          const preview = currentItem.preview ?? item.preview;
          const events = currentItem.events ?? item.events;
          const partialExtraction =
            currentItem.partialExtraction ?? item.partialExtraction;

          if (preview) {
            nextItem.preview = preview;
          }

          if (events) {
            nextItem.events = events;
          }

          if (partialExtraction) {
            nextItem.partialExtraction = partialExtraction;
          }

          return nextItem;
        })
      ]
    }));
  }
);

export const setUploadPreviewGeneratingAtom = atom(
  null,
  (_get, set, payload: { clientId: string; fileObjectUrl: string }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.clientId === payload.clientId
          ? {
              ...item,
              preview: {
                fileObjectUrl: payload.fileObjectUrl,
                thumbnailStatus: "generating"
              }
            }
          : item
      )
    }));
  }
);

export const setUploadPreviewReadyAtom = atom(
  null,
  (
    _get,
    set,
    payload: { clientId: string; thumbnailUrl: string; pageCount: number }
  ) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.clientId === payload.clientId
          ? (() => {
              const nextPreview: UploadQueueItem["preview"] = {
                thumbnailStatus: "ready",
                thumbnailUrl: payload.thumbnailUrl,
                pageCount: payload.pageCount
              };

              if (item.preview?.fileObjectUrl) {
                nextPreview.fileObjectUrl = item.preview.fileObjectUrl;
              }

              return {
                ...item,
                preview: nextPreview
              };
            })()
          : item
      )
    }));
  }
);

export const setUploadPreviewFailedAtom = atom(
  null,
  (_get, set, payload: { clientId: string; error: string }) => {
    set(uploadDomainStateAtom, (prev) => ({
      ...prev,
      queue: prev.queue.map((item) =>
        item.clientId === payload.clientId
          ? (() => {
              const nextPreview: UploadQueueItem["preview"] = {
                thumbnailStatus: "failed",
                thumbnailError: payload.error
              };

              if (item.preview?.fileObjectUrl) {
                nextPreview.fileObjectUrl = item.preview.fileObjectUrl;
              }

              return {
                ...item,
                preview: nextPreview
              };
            })()
          : item
      )
    }));
  }
);

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
