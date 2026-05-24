import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { candidatesRouter } from "./routes/candidates.routes";
import { jobsRouter } from "./routes/jobs.routes";
import { matchingsRouter } from "./routes/matchings.routes";
import { uploadsRouter } from "./routes/uploads.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      data: { status: "ok" },
      meta: {},
      error: null
    });
  });

  app.use("/api/uploads", uploadsRouter);
  app.use("/api/candidates", candidatesRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/matchings", matchingsRouter);

  app.use(errorHandler);

  return app;
}
