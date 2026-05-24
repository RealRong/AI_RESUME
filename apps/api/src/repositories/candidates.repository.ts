import type { CandidateStatus } from "@ai-resume/shared-types";
import { getSupabaseAdminClient } from "../clients/supabase";

function normalizeDateInput(value?: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const yearOnlyMatch = normalized.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return `${yearOnlyMatch[1]}-01-01`;
  }

  const yearMonthMatch = normalized.match(/^(\d{4})[./-](\d{1,2})$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    const safeMonth = (month ?? "1").padStart(2, "0");
    return `${year}-${safeMonth}-01`;
  }

  const fullDateMatch = normalized.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch;
    return `${year}-${(month ?? "1").padStart(2, "0")}-${(day ?? "1").padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  return null;
}

type CandidateDraftRow = {
  id: string;
  upload_id: string;
  source_file_url: string;
  extraction_status: string;
  status: string;
};

type CandidateListRow = {
  id: string;
  name: string | null;
  email: string | null;
  city: string | null;
  status: CandidateStatus;
  latest_overall_score: number | null;
  created_at: string;
  candidate_skills: Array<{ skill_name: string }>;
  candidate_educations: Array<{ school: string }>;
};

type CandidateDetailRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  status: CandidateStatus;
  source_file_url: string | null;
  candidate_skills: Array<{ skill_name: string; skill_type: string }>;
  candidate_educations: Array<{
    id: string;
    school: string;
    major: string | null;
    degree: string | null;
    graduation_date: string | null;
  }>;
  candidate_work_experiences: Array<{
    id: string;
    company_name: string;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    summary: string | null;
  }>;
  candidate_projects: Array<{
    id: string;
    project_name: string;
    tech_stack: string[];
    role_summary: string | null;
    highlights: string[];
  }>;
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

export async function listCandidates(params: {
  page: number;
  pageSize: number;
  keyword?: string;
}) {
  const supabase = getSupabaseAdminClient();
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = (supabase as any)
    .from("candidates")
    .select(
      "id, name, email, city, status, latest_overall_score, created_at, candidate_skills(skill_name), candidate_educations(school)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.keyword) {
    query = query.or(
      `name.ilike.%${params.keyword}%,email.ilike.%${params.keyword}%,city.ilike.%${params.keyword}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list candidates: ${error.message}`);
  }

  return {
    items: ((data as CandidateListRow[]) ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      city: row.city,
      status: row.status,
      skills: row.candidate_skills?.map((skill) => skill.skill_name) ?? [],
      schools: row.candidate_educations?.map((education) => education.school).filter(Boolean) ?? [],
      latestOverallScore: row.latest_overall_score,
      uploadedAt: row.created_at
    })),
    total: count ?? 0
  };
}

export async function getCandidateDetail(candidateId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("candidates")
    .select(
      `
      id,
      name,
      phone,
      email,
      city,
      status,
      source_file_url,
      candidate_skills(skill_name, skill_type),
      candidate_educations(id, school, major, degree, graduation_date),
      candidate_work_experiences(id, company_name, title, start_date, end_date, summary),
      candidate_projects(id, project_name, tech_stack, role_summary, highlights)
    `
    )
    .eq("id", candidateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get candidate detail: ${error.message}`);
  }

  return (data as CandidateDetailRow | null) ?? null;
}

export async function updateCandidateStatus(candidateId: string, status: CandidateStatus) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any)
    .from("candidates")
    .update({ status })
    .eq("id", candidateId);

  if (error) {
    throw new Error(`Failed to update candidate status: ${error.message}`);
  }
}

export async function updateCandidateProfile(
  candidateId: string,
  payload: {
    basic?: {
      name?: string | null;
      phone?: string | null;
      email?: string | null;
      city?: string | null;
    };
    skills?: Array<{ name: string; type: string }>;
    education?: Array<{
      school?: string;
      major?: string | null;
      degree?: string | null;
      graduationDate?: string | null;
    }>;
    workExperiences?: Array<{
      companyName?: string;
      title?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      summary?: string | null;
    }>;
    projects?: Array<{
      projectName?: string;
      techStack?: string[];
      roleSummary?: string | null;
      highlights?: string[];
    }>;
  }
) {
  const supabase = getSupabaseAdminClient();

  if (payload.basic) {
    const { error } = await (supabase as any)
      .from("candidates")
      .update({
        name: payload.basic.name,
        phone: payload.basic.phone,
        email: payload.basic.email,
        city: payload.basic.city
      })
      .eq("id", candidateId);

    if (error) {
      throw new Error(`Failed to update candidate basic info: ${error.message}`);
    }
  }

  if (payload.skills) {
    await (supabase as any).from("candidate_skills").delete().eq("candidate_id", candidateId);
    if (payload.skills.length > 0) {
      const { error } = await (supabase as any).from("candidate_skills").insert(
        payload.skills.map((skill) => ({
          candidate_id: candidateId,
          skill_name: skill.name,
          skill_type: skill.type
        }))
      );

      if (error) {
        throw new Error(`Failed to update candidate skills: ${error.message}`);
      }
    }
  }

  if (payload.education) {
    await (supabase as any).from("candidate_educations").delete().eq("candidate_id", candidateId);
    const items = payload.education.filter((item) => item.school);
    if (items.length > 0) {
      const { error } = await (supabase as any).from("candidate_educations").insert(
        items.map((item, index) => ({
          candidate_id: candidateId,
          school: item.school,
          major: item.major ?? null,
          degree: item.degree ?? null,
          graduation_date: normalizeDateInput(item.graduationDate),
          sort_order: index
        }))
      );

      if (error) {
        throw new Error(`Failed to update candidate educations: ${error.message}`);
      }
    }
  }

  if (payload.workExperiences) {
    await (supabase as any)
      .from("candidate_work_experiences")
      .delete()
      .eq("candidate_id", candidateId);
    const items = payload.workExperiences.filter((item) => item.companyName);
    if (items.length > 0) {
      const { error } = await (supabase as any).from("candidate_work_experiences").insert(
        items.map((item, index) => ({
          candidate_id: candidateId,
          company_name: item.companyName,
          title: item.title ?? null,
          start_date: normalizeDateInput(item.startDate),
          end_date: normalizeDateInput(item.endDate),
          summary: item.summary ?? null,
          sort_order: index
        }))
      );

      if (error) {
        throw new Error(`Failed to update candidate work experiences: ${error.message}`);
      }
    }
  }

  if (payload.projects) {
    await (supabase as any).from("candidate_projects").delete().eq("candidate_id", candidateId);
    const items = payload.projects.filter((item) => item.projectName);
    if (items.length > 0) {
      const { error } = await (supabase as any).from("candidate_projects").insert(
        items.map((item, index) => ({
          candidate_id: candidateId,
          project_name: item.projectName,
          tech_stack: item.techStack ?? [],
          role_summary: item.roleSummary ?? null,
          highlights: item.highlights ?? [],
          sort_order: index
        }))
      );

      if (error) {
        throw new Error(`Failed to update candidate projects: ${error.message}`);
      }
    }
  }
}

export async function listCandidatesForMatching(candidateIds: string[]) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await (supabase as any)
    .from("candidates")
    .select(
      "id, name, cleaned_text, candidate_skills(skill_name), candidate_educations(degree), candidate_work_experiences(id)"
    )
    .in("id", candidateIds);

  if (error) {
    throw new Error(`Failed to list candidates for matching: ${error.message}`);
  }

  return (data ?? []) as Array<{
    id: string;
    name: string | null;
    cleaned_text: string | null;
    candidate_skills: Array<{ skill_name: string }>;
    candidate_educations: Array<{ degree: string | null }>;
    candidate_work_experiences: Array<{ id: string }>;
  }>;
}

export async function updateCandidateLatestScore(candidateId: string, score: number) {
  const supabase = getSupabaseAdminClient();
  const { error } = await (supabase as any)
    .from("candidates")
    .update({ latest_overall_score: score })
    .eq("id", candidateId);

  if (error) {
    throw new Error(`Failed to update candidate latest score: ${error.message}`);
  }
}
