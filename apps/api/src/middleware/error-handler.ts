import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      data: null,
      meta: {},
      error: {
        code: "VALIDATION_ERROR",
        message: err.issues.map((issue) => issue.message).join("; ")
      }
    });
  }

  const message = err instanceof Error ? err.message : "Unknown server error.";

  return res.status(500).json({
    data: null,
    meta: {},
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message
    }
  });
}
