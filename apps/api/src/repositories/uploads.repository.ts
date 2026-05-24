import type { UploadEventType, UploadStatus } from "@ai-resume/shared-types";
import { getSupabaseAdminClient } from "../clients/supabase";

type JsonObject = Record<string, unknown>;
type ResumeUploadRow = {
  id: string;
  file_name: string;
  file_path: string;
  status: UploadStatus;
  error_message: string | null;
  uploaded_at: string;
};

type UploadEventRow = {
  id: string;
  event_type: UploadEventType;
  payload: JsonObject;
  created_at: string;
};

export async function createResumeUpload(params: {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("resume_uploads")
    .insert({
      file_name: params.fileName,
      file_path: params.filePath,
      file_size: params.fileSize,
      mime_type: params.mimeType,
      status: "uploaded"
    })
    .select("id, file_name, file_path, status, uploaded_at")
    .single();

  if (error) {
    throw new Error(`Failed to create resume upload: ${error.message}`);
  }

  return data as ResumeUploadRow;
}

export async function updateResumeUpload(params: {
  uploadId: string;
  status: UploadStatus;
  errorMessage?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any)
    .from("resume_uploads")
    .update({
      status: params.status,
      error_message: params.errorMessage ?? null
    })
    .eq("id", params.uploadId);

  if (error) {
    throw new Error(`Failed to update resume upload: ${error.message}`);
  }
}

export async function findResumeUploadById(uploadId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("resume_uploads")
    .select("*")
    .eq("id", uploadId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load resume upload: ${error.message}`);
  }

  return (data as ResumeUploadRow | null) ?? null;
}

export async function appendUploadEvent(params: {
  uploadId: string;
  eventType: UploadEventType;
  payload: JsonObject;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any).from("upload_events").insert({
    upload_id: params.uploadId,
    event_type: params.eventType,
    payload: params.payload
  });

  if (error) {
    throw new Error(`Failed to append upload event: ${error.message}`);
  }
}

export async function listUploadEvents(params: {
  uploadId: string;
  after?: string | undefined;
}) {
  const supabase = getSupabaseAdminClient();
  let query = (supabase as any)
    .from("upload_events")
    .select("id, event_type, payload, created_at")
    .eq("upload_id", params.uploadId)
    .order("created_at", { ascending: true });

  if (params.after) {
    query = query.gt("created_at", params.after);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list upload events: ${error.message}`);
  }

  return (data as UploadEventRow[]) ?? [];
}
