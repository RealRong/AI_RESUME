import type { MatchingResult } from "@ai-resume/shared-types";
import { getJob } from "../repositories/jobs.repository";
import {
  listCandidatesForMatching,
  updateCandidateLatestScore
} from "../repositories/candidates.repository";
import {
  createMatchingRecord
} from "../repositories/matchings.repository";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function createMatchings(input: {
  jobId: string;
  candidateIds: string[];
}): Promise<MatchingResult[]> {
  const job = await getJob(input.jobId);

  if (!job) {
    throw new Error("Job not found.");
  }

  const candidates = await listCandidatesForMatching(input.candidateIds);

  const required = job.requiredSkills.map((skill) => skill.toLowerCase());
  const bonus = job.bonusSkills.map((skill) => skill.toLowerCase());

  const results: MatchingResult[] = [];

  for (const candidate of candidates) {
    const skills = candidate.candidate_skills.map((skill) => skill.skill_name.toLowerCase());
    const requiredMatches = required.filter((skill) => skills.includes(skill)).length;
    const bonusMatches = bonus.filter((skill) => skills.includes(skill)).length;
    const skillMatch = required.length
      ? clampScore((requiredMatches / required.length) * 100)
      : 70;
    const experienceRelevance = clampScore(
      50 +
        Math.min(candidate.candidate_work_experiences.length, 5) * 8 +
        Math.min((candidate.cleaned_text?.length ?? 0) / 400, 15)
    );
    const educationFit = clampScore(
      candidate.candidate_educations.some((item) => item.degree) ? 78 : 60
    );
    const overallScore = clampScore(
      skillMatch * 0.5 + experienceRelevance * 0.3 + educationFit * 0.2 + bonusMatches * 3
    );

    const strengths = [
      requiredMatches > 0 ? `匹配到 ${requiredMatches} 项必备技能` : "技能匹配有限",
      candidate.candidate_work_experiences.length > 0
        ? `检测到 ${candidate.candidate_work_experiences.length} 段工作经历`
        : "工作经历信息较少"
    ];
    const risks = [
      requiredMatches < required.length ? "仍有部分必备技能未命中" : "必备技能基本覆盖"
    ];
    const evidence = [
      `候选人技能：${candidate.candidate_skills.map((skill) => skill.skill_name).join(", ") || "无"}`,
      `岗位必备：${job.requiredSkills.join(", ") || "无"}`
    ];
    const summary = `技能匹配 ${skillMatch} 分，经验相关性 ${experienceRelevance} 分，教育契合度 ${educationFit} 分。`;

    const record = await createMatchingRecord({
      candidateId: candidate.id,
      jobId: input.jobId,
      overallScore,
      skillMatchScore: skillMatch,
      experienceRelevanceScore: experienceRelevance,
      educationFitScore: educationFit,
      summary,
      strengths,
      risks,
      evidence
    });

    await updateCandidateLatestScore(candidate.id, overallScore);
    results.push(record);
  }

  return results;
}
