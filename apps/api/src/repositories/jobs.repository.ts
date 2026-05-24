import type { JobDraft } from "@ai-resume/shared-types";
import { getSupabaseAdminClient } from "../clients/supabase";

type JobRow = {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  bonus_skills: string[];
  created_at: string;
  updated_at: string;
};

function mapJob(row: JobRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requiredSkills: row.required_skills ?? [],
    bonusSkills: row.bonus_skills ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listJobs() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list jobs: ${error.message}`);
  }

  return ((data as JobRow[]) ?? []).map(mapJob);
}

export async function createJob(input: JobDraft) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("jobs")
    .insert({
      title: input.title,
      description: input.description,
      required_skills: input.requiredSkills,
      bonus_skills: input.bonusSkills
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  return mapJob(data as JobRow);
}

export async function getJob(jobId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get job: ${error.message}`);
  }

  return data ? mapJob(data as JobRow) : null;
}

export async function updateJob(
  jobId: string,
  input: Partial<JobDraft>
) {
  const supabase = getSupabaseAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.requiredSkills !== undefined) patch.required_skills = input.requiredSkills;
  if (input.bonusSkills !== undefined) patch.bonus_skills = input.bonusSkills;

  const { data, error } = await (supabase as any)
    .from("jobs")
    .update(patch)
    .eq("id", jobId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }

  return mapJob(data as JobRow);
}

export async function deleteJob(jobId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any).from("jobs").delete().eq("id", jobId);

  if (error) {
    throw new Error(`Failed to delete job: ${error.message}`);
  }
}
