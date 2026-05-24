import { z } from "zod";

export const uploadStatuses = [
  "uploaded",
  "parsing",
  "extracting",
  "completed",
  "failed"
] as const;

export type UploadStatus = (typeof uploadStatuses)[number];

export type UploadListItem = {
  uploadId: string;
  candidateId: string;
  fileName: string;
  status: UploadStatus;
};

export const uploadEventTypes = [
  "upload.accepted",
  "upload.progress",
  "pdf.parsed",
  "resume.cleaned",
  "extract.started",
  "extract.section",
  "extract.partial",
  "extract.completed",
  "job.failed"
] as const;

export type UploadEventType = (typeof uploadEventTypes)[number];

export const uploadStatusSchema = z.enum(uploadStatuses);
export const uploadEventTypeSchema = z.enum(uploadEventTypes);
