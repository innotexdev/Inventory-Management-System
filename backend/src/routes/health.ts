import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { toLoggableError } from "../lib/errors";

interface HealthStatus {
  status: "ok" | "unavailable";
  uptime: number;
}

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const uptime = process.uptime();

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    logger.error("Health check failed: database unreachable", toLoggableError(err));
    const body: HealthStatus = { status: "unavailable", uptime };
    res.status(503).json(body);
    return;
  }

  const body: HealthStatus = { status: "ok", uptime };
  res.json(body);
});

export default router;
