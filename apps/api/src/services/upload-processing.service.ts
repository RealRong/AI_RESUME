import type { UploadEventType } from "@ai-resume/shared-types";
import {
  appendUploadEvent,
  createResumeUpload,
  updateResumeUpload
} from "../repositories/uploads.repository";
import {
  createCandidateDraft,
  updateCandidateExtraction
} from "../repositories/candidates.repository";
import { uploadResumePdf } from "../repositories/storage.repository";
import { cleanResumeText } from "./resume-cleaner.service";
import { extractResumeBasics } from "./resume-extraction.service";
import { parsePdfBuffer } from "./pdf-parser.service";

type AcceptedUpload = {
  uploadId: string;
  candidateId: string;
  fileName: string;
  status: "uploaded";
};

type UploadableFile = Express.Multer.File;

async function emitEvent(
  uploadId: string,
  eventType: UploadEventType,
  payload: Record<string, unknown>
) {
  await appendUploadEvent({
    uploadId,
    eventType,
    payload
  });
}

export async function createUploadDraft(file: UploadableFile): Promise<AcceptedUpload> {
  const storage = await uploadResumePdf({
    fileName: file.originalname,
    fileBuffer: file.buffer,
    contentType: file.mimetype
  });

  const upload = await createResumeUpload({
    fileName: file.originalname,
    filePath: storage.objectPath,
    fileSize: file.size,
    mimeType: file.mimetype
  });

  const candidate = await createCandidateDraft({
    uploadId: upload.id,
    sourceFileUrl: storage.objectPath
  });

  await emitEvent(upload.id, "upload.accepted", {
    uploadId: upload.id,
    candidateId: candidate.id,
    fileName: file.originalname
  });

  return {
    uploadId: upload.id,
    candidateId: candidate.id,
    fileName: file.originalname,
    status: "uploaded"
  };
}

export async function processUpload(file: UploadableFile, accepted: AcceptedUpload) {
  try {
    await updateResumeUpload({
      uploadId: accepted.uploadId,
      status: "parsing"
    });
    await emitEvent(accepted.uploadId, "upload.progress", {
      uploadId: accepted.uploadId,
      stage: "parsing",
      progress: 20
    });

    const parsed = await parsePdfBuffer(file.buffer);
    await emitEvent(accepted.uploadId, "pdf.parsed", {
      uploadId: accepted.uploadId,
      pageCount: parsed.pageCount
    });

    const cleanedText = cleanResumeText(parsed.text);
    await emitEvent(accepted.uploadId, "resume.cleaned", {
      uploadId: accepted.uploadId,
      textLength: cleanedText.length
    });

    await updateResumeUpload({
      uploadId: accepted.uploadId,
      status: "extracting"
    });
    await emitEvent(accepted.uploadId, "extract.started", {
      uploadId: accepted.uploadId,
      progress: 60
    });

    const basics = extractResumeBasics(cleanedText);
    await updateCandidateExtraction({
      candidateId: accepted.candidateId,
      basic: basics,
      rawText: parsed.text,
      cleanedText,
      extractionStatus: "running"
    });

    await emitEvent(accepted.uploadId, "extract.partial", {
      uploadId: accepted.uploadId,
      basic: basics
    });

    await updateCandidateExtraction({
      candidateId: accepted.candidateId,
      basic: basics,
      rawText: parsed.text,
      cleanedText,
      extractionStatus: "completed"
    });

    await updateResumeUpload({
      uploadId: accepted.uploadId,
      status: "completed"
    });
    await emitEvent(accepted.uploadId, "extract.completed", {
      uploadId: accepted.uploadId,
      candidateId: accepted.candidateId,
      progress: 100
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload processing failed.";

    await Promise.allSettled([
      updateResumeUpload({
        uploadId: accepted.uploadId,
        status: "failed",
        errorMessage: message
      }),
      updateCandidateExtraction({
        candidateId: accepted.candidateId,
        basic: {
          name: null,
          phone: null,
          email: null,
          city: null
        },
        rawText: "",
        cleanedText: "",
        extractionStatus: "failed",
        extractionError: message
      }),
      emitEvent(accepted.uploadId, "job.failed", {
        uploadId: accepted.uploadId,
        message
      })
    ]);
  }
}
