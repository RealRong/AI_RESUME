import { Router } from "express";
import { validateBody } from "../middleware/validate-body";
import { getMatchingById } from "../repositories/matchings.repository";
import { createMatchingSchema } from "../schemas/matchings.schema";
import { createMatchings } from "../services/matching.service";
import { ok } from "../utils/http";

export const matchingsRouter = Router();

matchingsRouter.post("/", validateBody(createMatchingSchema), async (req, res) => {
  const results = await createMatchings(req.body);
  return ok(res, {
    results
  });
});

matchingsRouter.get("/:matchingId", async (req, res) => {
  const matching = await getMatchingById(req.params.matchingId);

  if (!matching) {
    return res.status(404).json({
      data: null,
      meta: {},
      error: {
        code: "MATCHING_NOT_FOUND",
        message: "Matching not found."
      }
    });
  }

  return ok(res, matching);
});
