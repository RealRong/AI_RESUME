"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { aiProviderConfigSchema, type AiProviderConfig } from "@ai-resume/shared-types";
import type { AppInstance } from "./types";
import {
  createUploadsRequest,
  createUploadEventSource
} from "./upload/api";
import { createPdfThumbnail } from "./upload/preview";
import {
  fetchCandidateDetailRequest,
  fetchCandidateListRequest,
  updateCandidateProfileRequest,
  updateCandidateStatusRequest
} from "./candidate/api";
import { fetchJobsRequest } from "./job/api";
import { createJobRequest, updateJobRequest } from "./job/api";
import { createMatchingRequest } from "./matching/api";
import { useUploadQueueActions, useUploadQueueState } from "@/domains/upload/hooks";
import { useCandidateListActions, useCandidateListState } from "@/domains/candidate/hooks";
import { useJobActions } from "@/domains/job/hooks";
import { useMatchingWorkspaceActions } from "@/domains/matching/hooks";
import { useSettingsActions, useSettingsState } from "@/domains/settings/hooks";
import { useUiActions, useUiState } from "@/domains/ui/hooks";

const InstanceContext = createContext<AppInstance | null>(null);
const AI_SETTINGS_STORAGE_KEY = "ai.resume.settings";
const THEME_STORAGE_KEY = "ai.resume.theme";

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const uploadActions = useUploadQueueActions();
  const uploadState = useUploadQueueState();
  const candidateState = useCandidateListState();
  const candidateActions = useCandidateListActions();
  const jobActions = useJobActions();
  const matchingActions = useMatchingWorkspaceActions();
  const settingsState = useSettingsState();
  const settingsActions = useSettingsActions();
  const uiState = useUiState();
  const uiActions = useUiActions();
  const uploadEventSourcesRef = useRef(new Map<string, EventSource>());
  const uploadQueueRef = useRef(uploadState.queue);
  const candidateQueryRef = useRef(candidateState.query);
  const aiConfigRef = useRef<AiProviderConfig | null>(settingsState.ai.savedConfig);
  const aiDraftRef = useRef(settingsState.ai.draft);

  useEffect(() => {
    candidateQueryRef.current = candidateState.query;
  }, [candidateState.query]);

  useEffect(() => {
    uploadQueueRef.current = uploadState.queue;
  }, [uploadState.queue]);

  useEffect(() => {
    aiConfigRef.current = settingsState.ai.savedConfig;
  }, [settingsState.ai.savedConfig]);

  useEffect(() => {
    aiDraftRef.current = settingsState.ai.draft;
  }, [settingsState.ai.draft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);

      if (!raw) {
        settingsActions.hydrateAi(null);
        return;
      }

      const parsed = aiProviderConfigSchema.parse(JSON.parse(raw));
      settingsActions.hydrateAi(parsed);
    } catch {
      window.localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
      settingsActions.hydrateAi(null);
    }
  }, [settingsActions]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    uiActions.setTheme(savedTheme === "dark" ? "dark" : "light");
  }, [uiActions]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    document.documentElement.classList.toggle("dark", uiState.theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, uiState.theme);
  }, [uiState.theme]);

  useEffect(() => {
    return () => {
      for (const source of uploadEventSourcesRef.current.values()) {
        source.close();
      }

      for (const item of uploadQueueRef.current) {
        if (item.preview?.fileObjectUrl) {
          URL.revokeObjectURL(item.preview.fileObjectUrl);
        }

        if (item.preview?.thumbnailUrl) {
          URL.revokeObjectURL(item.preview.thumbnailUrl);
        }
      }
    };
  }, []);

  const instance = useMemo<AppInstance>(() => {
    return {
      settings: {
        openAiDialog() {
          settingsActions.openAiDialog();
        },
        closeAiDialog() {
          settingsActions.closeAiDialog();
        },
        updateAiDraft(input) {
          settingsActions.updateAiDraft(input);
        },
        saveAiConfig() {
          const parsed = aiProviderConfigSchema.parse(aiDraftRef.current);

          settingsActions.saveAi(parsed);
          aiConfigRef.current = parsed;

          if (typeof window !== "undefined") {
            window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
          }
        },
        clearAiConfig() {
          settingsActions.clearAi();
          aiConfigRef.current = null;

          if (typeof window !== "undefined") {
            window.localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
          }
        }
      },
      upload: {
        async createUploads(files) {
          const queued = files.map((file) => {
            const clientId = crypto.randomUUID();

            return {
              clientId,
              uploadId: `local-${clientId}`,
              candidateId: "",
              fileName: file.name,
              fileSize: file.size,
              progress: 0,
              status: "uploading" as const
            };
          });

          uploadActions.enqueueUploads(queued);

          for (const [index, file] of files.entries()) {
            const item = queued[index];
            if (!item) {
              continue;
            }
            const fileObjectUrl = URL.createObjectURL(file);

            uploadActions.setUploadPreviewGenerating({
              clientId: item.clientId,
              fileObjectUrl
            });

            void createPdfThumbnail(file)
              .then((thumbnail) => {
                uploadActions.setUploadPreviewReady({
                  clientId: item.clientId,
                  thumbnailUrl: thumbnail.thumbnailUrl,
                  pageCount: thumbnail.pageCount
                });
              })
              .catch((error: unknown) => {
                uploadActions.setUploadPreviewFailed({
                  clientId: item.clientId,
                  error:
                    error instanceof Error ? error.message : "PDF 缩略图生成失败。"
                });
              });
          }

          try {
            const response = await createUploadsRequest(files, aiConfigRef.current);
            const uploads = response.data.uploads;

            uploadActions.replaceQueuedUploads({
              localClientIds: queued.map((item) => item.clientId),
              items: uploads.map((item, index) => {
                const nextItem = {
                  clientId: queued[index]?.clientId ?? crypto.randomUUID(),
                  uploadId: item.uploadId,
                  candidateId: item.candidateId,
                  fileName: item.fileName,
                  progress: 0,
                  status: "uploading" as const
                };

                if (queued[index]?.fileSize) {
                  return {
                    ...nextItem,
                    fileSize: queued[index].fileSize
                  };
                }

                return nextItem;
              })
            });

            return uploads;
          } catch (error) {
            for (const item of queued) {
              uploadActions.markUploadFailed({
                uploadId: item.uploadId,
                error: error instanceof Error ? error.message : "上传请求失败。"
              });
            }

            throw error;
          }
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
              basic?: {
                name?: string | null;
                phone?: string | null;
                email?: string | null;
                city?: string | null;
              };
            };
            uploadActions.appendUploadEvent({
              uploadId,
              type: "extract.partial",
              eventPayload: payload
            });
            if (payload.basic) {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "basic",
                data: payload.basic
              });
            }
          });

          source.addEventListener("extract.section", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              stage?: "basic" | "education" | "workExperiences" | "skills" | "projects";
              data?: unknown;
              progress?: number;
            };
            uploadActions.appendUploadEvent({
              uploadId,
              type: "extract.section",
              eventPayload: payload as Record<string, unknown>
            });

            if (payload.progress !== undefined) {
              uploadActions.setUploadProgress({
                uploadId,
                progress: payload.progress,
                status: "extracting"
              });
            }

            if (payload.stage === "basic" && payload.data && typeof payload.data === "object") {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "basic",
                data: payload.data as {
                  name?: string | null;
                  phone?: string | null;
                  email?: string | null;
                  city?: string | null;
                }
              });
            }

            if (payload.stage === "education" && Array.isArray(payload.data)) {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "education",
                data: payload.data as Array<{
                  school: string;
                  major?: string | null;
                  degree?: string | null;
                  graduationDate?: string | null;
                }>
              });
            }

            if (payload.stage === "workExperiences" && Array.isArray(payload.data)) {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "workExperiences",
                data: payload.data as Array<{
                  companyName: string;
                  title?: string | null;
                  startDate?: string | null;
                  endDate?: string | null;
                  summary?: string | null;
                }>
              });
            }

            if (payload.stage === "skills" && Array.isArray(payload.data)) {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "skills",
                data: payload.data as Array<{
                  name: string;
                  type: string;
                }>
              });
            }

            if (payload.stage === "projects" && Array.isArray(payload.data)) {
              uploadActions.setPartialExtraction({
                uploadId,
                stage: "projects",
                data: payload.data as Array<{
                  projectName: string;
                  techStack?: string[];
                  roleSummary?: string | null;
                  highlights?: string[];
                }>
              });
            }
          });

          source.addEventListener("extract.completed", (event) => {
            const payload = JSON.parse((event as MessageEvent).data) as {
              candidateId?: string;
              progress?: number;
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

            if (payload.candidateId) {
              void fetchCandidateDetailRequest(payload.candidateId)
                .then((response) => response.data)
                .then((detail) => {
                  uploadActions.hydrateExtractionSnapshot({
                    uploadId,
                    candidateId: payload.candidateId as string,
                    basic: detail.basic,
                    education: detail.education.map((item) => ({
                      school: item.school,
                      major: item.major,
                      degree: item.degree,
                      graduationDate: item.graduationDate
                    })),
                    workExperiences: detail.workExperiences.map((item) => ({
                      companyName: item.companyName,
                      title: item.title,
                      startDate: item.startDate,
                      endDate: item.endDate,
                      summary: item.summary
                    })),
                    skills: detail.skills.map((item) => ({
                      name: item.name,
                      type: item.type
                    })),
                    projects: detail.projects.map((item) => ({
                      projectName: item.projectName,
                      techStack: item.techStack,
                      roleSummary: item.roleSummary,
                      highlights: item.highlights
                    }))
                  });
                })
                .catch(() => {});

              void fetchCandidateListRequest({
                page: candidateQueryRef.current.page,
                pageSize: candidateQueryRef.current.pageSize,
                keyword: candidateQueryRef.current.keyword,
                sortBy: candidateQueryRef.current.sortBy,
                sortOrder: candidateQueryRef.current.sortOrder
              })
                .then((response) => {
                  candidateActions.hydrateList({
                    items: response.data.items,
                    total: response.meta.total ?? response.data.items.length
                  });
                })
                .catch(() => {});
            }
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
        },
        disposeUploadResources(clientId) {
          const item = uploadQueueRef.current.find((currentItem) => currentItem.clientId === clientId);

          if (!item?.preview) {
            return;
          }

          if (item.preview.fileObjectUrl) {
            URL.revokeObjectURL(item.preview.fileObjectUrl);
          }

          if (item.preview.thumbnailUrl) {
            URL.revokeObjectURL(item.preview.thumbnailUrl);
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
        },
        async updateProfile(candidateId, input) {
          await updateCandidateProfileRequest(candidateId, input);
          await this.fetchList();
        },
        async updateStatus(candidateId, status) {
          await updateCandidateStatusRequest(candidateId, status);
          await this.fetchList();
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
            const response = await createMatchingRequest(input, aiConfigRef.current);
            matchingActions.hydrateResults(response.data.results);
            return response.data.results;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create matching.";
            matchingActions.setMatchingError(message);
            throw error;
          }
        },
        async compareJobs(input) {
          matchingActions.setMatchingLoading(true);

          try {
            const groups = await Promise.all(
              input.jobIds.map((jobId) =>
                createMatchingRequest(
                  {
                    jobId,
                    candidateIds: input.candidateIds
                  },
                  aiConfigRef.current
                ).then((response) => response.data.results)
              )
            );

            const results = groups.flat();
            matchingActions.hydrateResults(results);
            return results;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to compare matching results.";
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
    settingsActions,
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
