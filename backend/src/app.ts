import express from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { swaggerSpec } from "./lib/swagger";
import swaggerUi from "swagger-ui-express";

const app = express();

app.disable("x-powered-by");

app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use(notFound);
app.use(errorHandler);

export default app;
