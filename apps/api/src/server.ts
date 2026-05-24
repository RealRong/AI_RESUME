import "./bootstrap/load-env";
import { createServer } from "node:http";
import { createApp } from "./app";

const app = createApp();
export default app;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3001);
  createServer(app).listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}
