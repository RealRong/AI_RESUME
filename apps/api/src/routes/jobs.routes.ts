import { Router } from "express";
import { validateBody } from "../middleware/validate-body";
import { createJobSchema, updateJobSchema } from "../schemas/jobs.schema";
import { created, noContent, ok } from "../utils/http";

export const jobsRouter = Router();

jobsRouter.get("/", (_req, res) => {
  return ok(res, {
    items: []
  });
});

jobsRouter.post("/", validateBody(createJobSchema), (req, res) => {
  return created(res, {
    id: "00000000-0000-0000-0000-000000000001",
    ...req.body
  });
});

jobsRouter.get("/:jobId", (req, res) => {
  return ok(res, {
    id: req.params.jobId,
    title: "Frontend Engineer",
    description: "Scaffold placeholder",
    requiredSkills: ["React", "TypeScript", "Next.js"],
    bonusSkills: ["Node.js"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

jobsRouter.patch("/:jobId", validateBody(updateJobSchema), (req, res) => {
  return ok(res, {
    id: req.params.jobId,
    ...req.body
  });
});

jobsRouter.delete("/:jobId", (_req, res) => {
  return noContent(res);
});
