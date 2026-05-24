import { getSupabaseAdminClient } from "../clients/supabase";

type CandidateDraftRow = {
  id: string;
  upload_id: string;
  source_file_url: string;
  extraction_status: string;
  status: string;
};

export async function createCandidateDraft(params: {
  uploadId: string;
  sourceFileUrl: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("candidates")
    .insert({
      upload_id: params.uploadId,
      source_file_url: params.sourceFileUrl,
      extraction_status: "pending"
    })
    .select("id, upload_id, source_file_url, extraction_status, status")
    .single();

  if (error) {
    throw new Error(`Failed to create candidate draft: ${error.message}`);
  }

  return data as CandidateDraftRow;
}

export async function updateCandidateExtraction(params: {
  candidateId: string;
  basic: {
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
  };
  rawText: string;
  cleanedText: string;
  extractionStatus: "running" | "completed" | "failed";
  extractionError?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any)
    .from("candidates")
    .update({
      name: params.basic.name,
      phone: params.basic.phone,
      email: params.basic.email,
      city: params.basic.city,
      raw_text: params.rawText,
      cleaned_text: params.cleanedText,
      extraction_status: params.extractionStatus,
      extraction_error: params.extractionError ?? null
    })
    .eq("id", params.candidateId);

  if (error) {
    throw new Error(`Failed to update candidate extraction: ${error.message}`);
  }
}
