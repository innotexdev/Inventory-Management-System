import { Router, Request, Response } from "express";

interface HealthStatus {
  status: "ok";
  uptime: number;
}

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const body: HealthStatus = { status: "ok", uptime: process.uptime() };
  res.json(body);
});

export default router;
