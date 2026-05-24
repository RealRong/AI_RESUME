import { Router } from "express";
import { validateBody } from "../middleware/validate-body";
import { createMatchingSchema } from "../schemas/matchings.schema";
import { ok } from "../utils/http";

export const matchingsRouter = Router();

matchingsRouter.post("/", validateBody(createMatchingSchema), (req, res) => {
  return ok(res, {
    results: req.body.candidateIds.map((candidateId: string, index: number) => ({
      matchingId: `00000000-0000-0000-0000-00000000010${index}`,
      candidateId,
      jobId: req.body.jobId,
      overallScore: 80 - index * 4,
      dimensionScores: {
        skillMatch: 84 - index * 3,
        experienceRelevance: 79 - index * 2,
        educationFit: 76 - index
      },
      summary: "Scaffold response for matching workflow.",
      strengths: ["Structured resume", "Relevant frontend stack"],
      risks: ["Need manual verification"],
      evidence: ["Placeholder result"]
    }))
  });
});

matchingsRouter.get("/:matchingId", (req, res) => {
  return ok(res, {
    matchingId: req.params.matchingId
  });
});
