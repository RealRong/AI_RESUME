import { z } from "zod";

export const uploadsParamsSchema = z.object({
  uploadId: z.string().uuid()
});
