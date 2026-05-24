import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJob,
  listJobs,
  updateJob
} from "../repositories/jobs.repository";
import { validateBody } from "../middleware/validate-body";
import { createJobSchema, updateJobSchema } from "../schemas/jobs.schema";
import { created, noContent, ok } from "../utils/http";

export const jobsRouter = Router();

jobsRouter.get("/", async (_req, res) => {
  const items = await listJobs();
  return ok(res, { items });
});

jobsRouter.post("/", validateBody(createJobSchema), async (req, res) => {
  const job = await createJob(req.body);
  return created(res, job);
});

jobsRouter.get("/:jobId", async (req, res) => {
  const job = await getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      data: null,
      meta: {},
      error: {
        code: "JOB_NOT_FOUND",
        message: "Job not found."
      }
    });
  }

  return ok(res, job);
});

jobsRouter.patch("/:jobId", validateBody(updateJobSchema), async (req, res) => {
  const jobId = String(req.params.jobId);
  const job = await updateJob(jobId, req.body);
  return ok(res, job);
});

jobsRouter.delete("/:jobId", async (req, res) => {
  await deleteJob(String(req.params.jobId));
  return noContent(res);
});
