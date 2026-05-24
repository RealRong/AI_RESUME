import multer, { type FileFilterCallback } from "multer";
import { Router, type Request } from "express";
import { createSignedResumeUrl } from "../repositories/storage.repository";
import {
  findResumeUploadById,
  listUploadEvents
} from "../repositories/uploads.repository";
import { uploadsParamsSchema } from "../schemas/uploads.schema";
import {
  createUploadDraft,
  processUpload
} from "../services/upload-processing.service";
import { ok } from "../utils/http";

export const uploadsRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) => {
    if (file.mimetype !== "application/pdf") {
      callback(new Error("Only PDF files are allowed."));
      return;
    }

    callback(null, true);
  }
});

uploadsRouter.post("/", upload.array("files", 10), async (req, res) => {
  const files = ((req as Request & { files?: Express.Multer.File[] }).files ?? []);

  if (files.length === 0) {
    return res.status(400).json({
      data: null,
      meta: {},
      error: {
        code: "UPLOAD_EMPTY",
        message: "At least one PDF file is required."
      }
    });
  }

  const uploads = await Promise.all(files.map((file) => createUploadDraft(file)));

  for (const [index, file] of files.entries()) {
    const accepted = uploads[index];
    if (accepted) {
      queueMicrotask(() => {
        void processUpload(file, accepted);
      });
    }
  }

  return ok(res, { uploads });
});

uploadsRouter.get("/:uploadId", async (req, res) => {
  const params = uploadsParamsSchema.parse(req.params);
  const uploadRecord = await findResumeUploadById(params.uploadId);

  if (!uploadRecord) {
    return res.status(404).json({
      data: null,
      meta: {},
      error: {
        code: "UPLOAD_NOT_FOUND",
        message: "Upload record not found."
      }
    });
  }

  const signedUrl = await createSignedResumeUrl(uploadRecord.file_path);

  return ok(res, {
    uploadId: uploadRecord.id,
    fileName: uploadRecord.file_name,
    status: uploadRecord.status,
    errorMessage: uploadRecord.error_message,
    uploadedAt: uploadRecord.uploaded_at,
    fileUrl: signedUrl
  });
});

uploadsRouter.get("/:uploadId/events", async (req, res) => {
  const params = uploadsParamsSchema.parse(req.params);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let cursor: string | undefined;

  const writeEvents = async () => {
    const events = await listUploadEvents({
      uploadId: params.uploadId,
      after: cursor
    });

    for (const event of events) {
      res.write(`id: ${event.id}\n`);
      res.write(`event: ${event.event_type}\n`);
      res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
      cursor = event.created_at;
    }
  };

  await writeEvents();

  const interval = setInterval(() => {
    void writeEvents().catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "SSE event stream failed.";
      res.write(`event: job.failed\n`);
      res.write(`data: ${JSON.stringify({ uploadId: params.uploadId, message })}\n\n`);
    });
  }, 1500);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});
