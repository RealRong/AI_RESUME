"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import type { AppInstance } from "./types";
import {
  createUploadsRequest,
  createUploadEventSource
} from "./upload/api";
import {
  fetchCandidateDetailRequest,
  fetchCandidateListRequest
} from "./candidate/api";
import { fetchJobsRequest } from "./job/api";
import { createJobRequest, updateJobRequest } from "./job/api";
import { createMatchingRequest } from "./matching/api";
import { useUploadQueueActions } from "@/domains/upload/hooks";
import { useCandidateListActions, useCandidateListState } from "@/domains/candidate/hooks";
import { useJobActions } from "@/domains/job/hooks";
import { useMatchingWorkspaceActions } from "@/domains/matching/hooks";

const InstanceContext = createContext<AppInstance | null>(null);

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const uploadActions = useUploadQueueActions();
  const candidateState = useCandidateListState();
  const candidateActions = useCandidateListActions();
  const jobActions = useJobActions();
  const matchingActions = useMatchingWorkspaceActions();
  const uploadEventSourcesRef = useRef(new Map<string, EventSource>());
  const candidateQueryRef = useRef(candidateState.query);

  useEffect(() => {
    candidateQueryRef.current = candidateState.query;
  }, [candidateState.query]);

  const instance = useMemo<AppInstance>(() => {
    return {
      upload: {
        async createUploads(files) {
          const queued = files.map((file) => ({
            uploadId: `local-${crypto.randomUUID()}`,
            candidateId: "",
            fileName: file.name,
            progress: 0,
            status: "uploading" as const
          }));

          uploadActions.enqueueUploads(queued);
          const localUploadIds = queued.map((item) => item.uploadId);

          const response = await createUploadsRequest(files);
          const uploads = response.data.uploads;

          uploadActions.replaceQueuedUploads({
            localUploadIds,
            items: uploads.map((item) => ({
              uploadId: item.uploadId,
              candidateId: item.candidateId,
              fileName: item.fileName,
              progress: 0,
              status: "uploading" as const
            }))
          });

          return uploads;
        },
        subscribeUploadEvents(uploadId) {
          if (uploadEventSourcesRef.current.has(uploadId)) {
            return;
          }

          const source = createUploadEventSource(uploadId);

          source.addEventListener("upload.progress", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              progress?: number;
              stage?: "parsing" | "extracting";
            };
            uploadActions.setUploadProgress({
              uploadId,
              progress: payload.progress ?? 0,
              status: payload.stage ?? "uploading"
            });
          });

          source.addEventListener("extract.partial", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              basic?: Record<string, unknown>;
            };
            uploadActions.appendUploadEvent({
              uploadId,
              type: "extract.partial",
              eventPayload: payload
            });
            uploadActions.setPartialExtraction({
              uploadId,
              basic: payload.basic ?? {}
            });
          });

          source.addEventListener("extract.completed", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              candidateId?: string;
            };
            uploadActions.appendUploadEvent({
              uploadId,
              type: "extract.completed",
              eventPayload: payload
            });
            const completedPayload: { uploadId: string; candidateId?: string } = {
              uploadId
            };
            if (payload.candidateId) {
              completedPayload.candidateId = payload.candidateId;
            }
            uploadActions.markUploadCompleted(completedPayload);
          });

          source.addEventListener("job.failed", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              message?: string;
            };
            uploadActions.markUploadFailed({
              uploadId,
              error: payload.message ?? "Upload processing failed."
            });
          });

          uploadEventSourcesRef.current.set(uploadId, source);
        },
        disposeUploadStream(uploadId) {
          const source = uploadEventSourcesRef.current.get(uploadId);
          if (source) {
            source.close();
            uploadEventSourcesRef.current.delete(uploadId);
          }
        }
      },
      candidate: {
        async fetchList(input) {
          candidateActions.setListLoading(true);

          try {
            const response = await fetchCandidateListRequest({
              page: input?.page ?? candidateQueryRef.current.page,
              pageSize: input?.pageSize ?? candidateQueryRef.current.pageSize,
              keyword: input?.keyword ?? candidateQueryRef.current.keyword,
              sortBy: input?.sortBy ?? candidateQueryRef.current.sortBy,
              sortOrder: input?.sortOrder ?? candidateQueryRef.current.sortOrder
            });

            candidateActions.hydrateList({
              items: response.data.items,
              total: response.meta.total ?? response.data.items.length
            });

            return response.data.items;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to fetch candidates.";
            candidateActions.setListError(message);
            throw error;
          }
        },
        async fetchDetail(candidateId) {
          const response = await fetchCandidateDetailRequest(candidateId);
          return response.data;
        }
      },
      job: {
        async fetchList() {
          jobActions.setJobsLoading(true);

          try {
            const response = await fetchJobsRequest();
            jobActions.hydrateJobs(response.data.items);
            return response.data.items;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to fetch jobs.";
            jobActions.setJobsError(message);
            throw error;
          }
        },
        async createJob(input) {
          const response = await createJobRequest(input);
          await this.fetchList();
          return response.data;
        },
        async updateJob(jobId, input) {
          const response = await updateJobRequest(jobId, input);
          await this.fetchList();
          return response.data;
        }
      },
      matching: {
        async createMatching(input) {
          matchingActions.setMatchingLoading(true);

          try {
            const response = await createMatchingRequest(input);
            matchingActions.hydrateResults(response.data.results);
            return response.data.results;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create matching.";
            matchingActions.setMatchingError(message);
            throw error;
          }
        }
      }
    };
  }, [
    candidateActions,
    jobActions,
    matchingActions,
    uploadActions
  ]);

  return <InstanceContext.Provider value={instance}>{children}</InstanceContext.Provider>;
}

export function useInstance() {
  const context = useContext(InstanceContext);

  if (!context) {
    throw new Error("useInstance must be used within InstanceProvider.");
  }

  return context;
}
