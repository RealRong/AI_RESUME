import { Router } from "express";
import { validateBody } from "../middleware/validate-body";
import {
  updateCandidateSchema,
  updateCandidateStatusSchema
} from "../schemas/candidates.schema";
import { ok } from "../utils/http";

export const candidatesRouter = Router();

candidatesRouter.get("/", (_req, res) => {
  return ok(
    res,
    {
      items: []
    },
    {
      page: 1,
      pageSize: 20,
      total: 0
    }
  );
});

candidatesRouter.get("/:candidateId", (req, res) => {
  return ok(res, {
    id: req.params.candidateId,
    basic: {
      name: null,
      phone: null,
      email: null,
      city: null
    },
    status: "pending",
    skills: [],
    education: [],
    workExperiences: [],
    projects: [],
    pdfPreviewUrl: null
  });
});

candidatesRouter.patch("/:candidateId", validateBody(updateCandidateSchema), (req, res) => {
  return ok(res, {
    id: req.params.candidateId,
    payload: req.body
  });
});

candidatesRouter.patch(
  "/:candidateId/status",
  validateBody(updateCandidateStatusSchema),
  (req, res) => {
    return ok(res, {
      id: req.params.candidateId,
      status: req.body.status
    });
  }
);
