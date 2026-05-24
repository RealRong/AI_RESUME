import type { AiProviderConfig, MatchingResult } from "@ai-resume/shared-types";
import { getJob } from "../repositories/jobs.repository";
import {
  listCandidatesForMatching,
  updateCandidateLatestScore
} from "../repositories/candidates.repository";
import {
  createMatchingRecord
} from "../repositories/matchings.repository";
import { createAiJsonCompletion } from "./ai-provider.service";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function createMatchings(input: {
  jobId: string;
  candidateIds: string[];
  aiConfig?: AiProviderConfig | null;
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

    const fallbackStrengths = [
      requiredMatches > 0 ? `匹配到 ${requiredMatches} 项必备技能` : "技能匹配有限",
      candidate.candidate_work_experiences.length > 0
        ? `检测到 ${candidate.candidate_work_experiences.length} 段工作经历`
        : "工作经历信息较少"
    ];
    const fallbackRisks = [
      requiredMatches < required.length ? "仍有部分必备技能未命中" : "必备技能基本覆盖"
    ];
    const fallbackEvidence = [
      `候选人技能：${candidate.candidate_skills.map((skill) => skill.skill_name).join(", ") || "无"}`,
      `岗位必备：${job.requiredSkills.join(", ") || "无"}`
    ];
    let summary = `技能匹配 ${skillMatch} 分，经验相关性 ${experienceRelevance} 分，教育契合度 ${educationFit} 分。`;
    let strengths = fallbackStrengths;
    let risks = fallbackRisks;
    let evidence = fallbackEvidence;
    let modelName = "rule-based-v1";
    let promptVersion = "rule-based-v1";

    if (input.aiConfig?.apiKey) {
      try {
        const aiResult = await createAiJsonCompletion<{
          summary?: string;
          strengths?: string[];
          risks?: string[];
          evidence?: string[];
        }>({
          config: input.aiConfig,
          systemPrompt:
            "你是招聘场景下的候选人匹配分析助手。基于给定的岗位信息、候选人信息和规则分数，输出简洁、专业、可执行的中文 JSON。不要输出 Markdown。",
          userPrompt: JSON.stringify(
            {
              task: "生成候选人与岗位的匹配分析摘要",
              output: {
                summary: "2到3句中文总结，说明整体匹配情况和最关键判断",
                strengths: ["最多3条亮点"],
                risks: ["最多3条风险"],
                evidence: ["最多4条证据，尽量具体"]
              },
              job: {
                title: job.title,
                description: job.description,
                requiredSkills: job.requiredSkills,
                bonusSkills: job.bonusSkills
              },
              candidate: {
                name: candidate.name,
                skills: candidate.candidate_skills.map((skill) => skill.skill_name),
                workExperienceCount: candidate.candidate_work_experiences.length,
                hasEducationDegree: candidate.candidate_educations.some((item) => item.degree),
                cleanedTextExcerpt: (candidate.cleaned_text ?? "").slice(0, 2400)
              },
              scores: {
                overallScore,
                skillMatch,
                experienceRelevance,
                educationFit,
                requiredMatches,
                requiredTotal: required.length,
                bonusMatches
              }
            },
            null,
            2
          )
        });

        summary = aiResult.summary?.trim() || summary;
        strengths = aiResult.strengths?.filter(Boolean).slice(0, 3) || fallbackStrengths;
        risks = aiResult.risks?.filter(Boolean).slice(0, 3) || fallbackRisks;
        evidence = aiResult.evidence?.filter(Boolean).slice(0, 4) || fallbackEvidence;
        modelName = input.aiConfig.model;
        promptVersion = "ai-matching-v1";
      } catch {
        // Keep rule-based fallback if AI analysis fails.
      }
    }

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
      evidence,
      modelName,
      promptVersion
    });

    await updateCandidateLatestScore(candidate.id, overallScore);
    results.push(record);
  }

  return results;
}
