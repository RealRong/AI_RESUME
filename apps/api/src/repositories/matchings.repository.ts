import type { MatchingResult } from "@ai-resume/shared-types";
import { getSupabaseAdminClient } from "../clients/supabase";

type MatchingRow = {
  id: string;
  candidate_id: string;
  job_id: string;
  overall_score: number;
  skill_match_score: number;
  experience_relevance_score: number;
  education_fit_score: number;
  summary: string;
  strengths_json: string[];
  risks_json: string[];
  evidence_json: string[];
};

function mapMatching(row: MatchingRow): MatchingResult {
  return {
    matchingId: row.id,
    candidateId: row.candidate_id,
    jobId: row.job_id,
    overallScore: row.overall_score,
    dimensionScores: {
      skillMatch: row.skill_match_score,
      experienceRelevance: row.experience_relevance_score,
      educationFit: row.education_fit_score
    },
    summary: row.summary,
    strengths: row.strengths_json ?? [],
    risks: row.risks_json ?? [],
    evidence: row.evidence_json ?? []
  };
}

export async function createMatchingRecord(input: {
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillMatchScore: number;
  experienceRelevanceScore: number;
  educationFitScore: number;
  summary: string;
  strengths: string[];
  risks: string[];
  evidence: string[];
  modelName?: string;
  promptVersion?: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("candidate_matchings")
    .insert({
      candidate_id: input.candidateId,
      job_id: input.jobId,
      overall_score: input.overallScore,
      skill_match_score: input.skillMatchScore,
      experience_relevance_score: input.experienceRelevanceScore,
      education_fit_score: input.educationFitScore,
      summary: input.summary,
      strengths_json: input.strengths,
      risks_json: input.risks,
      evidence_json: input.evidence,
      model_name: input.modelName ?? "rule-based-v1",
      prompt_version: input.promptVersion ?? "rule-based-v1"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create matching record: ${error.message}`);
  }

  return mapMatching(data as MatchingRow);
}

export async function getMatchingById(matchingId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("candidate_matchings")
    .select("*")
    .eq("id", matchingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get matching by id: ${error.message}`);
  }

  return data ? mapMatching(data as MatchingRow) : null;
}
