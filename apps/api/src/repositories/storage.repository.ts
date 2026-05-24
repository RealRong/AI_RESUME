import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient } from "../clients/supabase";

const RESUME_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "resumes-private";
const STORAGE_SAFE_NAME_FALLBACK = "resume.pdf";

function sanitizeStorageFileName(fileName: string) {
  const normalized = fileName.normalize("NFKD");
  const sanitized = normalized
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "");

  if (!sanitized) {
    return STORAGE_SAFE_NAME_FALLBACK;
  }

  if (!sanitized.includes(".")) {
    return `${sanitized}.pdf`;
  }

  return sanitized;
}

export async function uploadResumePdf(params: {
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}) {
  const supabase = getSupabaseAdminClient();
  const safeFileName = sanitizeStorageFileName(params.fileName);
  const objectPath = `resumes/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFileName}`;

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(objectPath, params.fileBuffer, {
      contentType: params.contentType,
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload PDF to storage: ${error.message}`);
  }

  return {
    bucket: RESUME_BUCKET,
    objectPath
  };
}

export async function createSignedResumeUrl(objectPath: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(objectPath, 60 * 30);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
