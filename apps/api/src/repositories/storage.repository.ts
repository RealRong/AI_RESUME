import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient } from "../clients/supabase";

const RESUME_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "resumes-private";

export async function uploadResumePdf(params: {
  fileName: string;
  fileBuffer: Buffer;
  contentType: string;
}) {
  const supabase = getSupabaseAdminClient();
  const objectPath = `resumes/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${params.fileName}`;

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
