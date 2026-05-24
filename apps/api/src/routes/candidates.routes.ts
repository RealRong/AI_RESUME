import { Router } from "express";
import { createSignedResumeUrl } from "../repositories/storage.repository";
import {
  getCandidateDetail,
  listCandidates,
  updateCandidateProfile,
  updateCandidateStatus
} from "../repositories/candidates.repository";
import { validateBody } from "../middleware/validate-body";
import {
  updateCandidateSchema,
  updateCandidateStatusSchema
} from "../schemas/candidates.schema";
import { ok } from "../utils/http";

export const candidatesRouter = Router();

candidatesRouter.get("/", async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const keyword =
    typeof req.query.keyword === "string" && req.query.keyword.trim()
      ? req.query.keyword.trim()
      : undefined;

  const result = await listCandidates(
    keyword
      ? {
          page,
          pageSize,
          keyword
        }
      : {
          page,
          pageSize
        }
  );

  return ok(
    res,
    {
      items: result.items
    },
    {
      page,
      pageSize,
      total: result.total
    }
  );
});

candidatesRouter.get("/:candidateId", async (req, res) => {
  const detail = await getCandidateDetail(req.params.candidateId);

  if (!detail) {
    return res.status(404).json({
      data: null,
      meta: {},
      error: {
        code: "CANDIDATE_NOT_FOUND",
        message: "Candidate not found."
      }
    });
  }

  const pdfPreviewUrl = detail.source_file_url
    ? await createSignedResumeUrl(detail.source_file_url)
    : null;

  return ok(res, {
    id: detail.id,
    basic: {
      name: detail.name,
      phone: detail.phone,
      email: detail.email,
      city: detail.city
    },
    status: detail.status,
    skills: detail.candidate_skills.map((skill) => ({
      name: skill.skill_name,
      type: skill.skill_type
    })),
    education: detail.candidate_educations.map((item) => ({
      id: item.id,
      school: item.school,
      major: item.major,
      degree: item.degree,
      graduationDate: item.graduation_date
    })),
    workExperiences: detail.candidate_work_experiences.map((item) => ({
      id: item.id,
      companyName: item.company_name,
      title: item.title,
      startDate: item.start_date,
      endDate: item.end_date,
      summary: item.summary
    })),
    projects: detail.candidate_projects.map((item) => ({
      id: item.id,
      projectName: item.project_name,
      techStack: item.tech_stack ?? [],
      roleSummary: item.role_summary,
      highlights: item.highlights ?? []
    })),
    pdfPreviewUrl
  });
});

candidatesRouter.patch("/:candidateId", validateBody(updateCandidateSchema), async (req, res) => {
  const candidateId = String(req.params.candidateId);
  await updateCandidateProfile(candidateId, req.body);
  return ok(res, {
    id: candidateId,
    payload: req.body
  });
});

candidatesRouter.patch(
  "/:candidateId/status",
  validateBody(updateCandidateStatusSchema),
  async (req, res) => {
    const candidateId = String(req.params.candidateId);
    await updateCandidateStatus(candidateId, req.body.status);
    return ok(res, {
      id: candidateId,
      status: req.body.status
    });
  }
);
