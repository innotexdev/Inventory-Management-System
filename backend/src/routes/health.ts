import { Router, Request, Response } from "express";

interface HealthStatus {
  status: "ok";
  uptime: number;
}

const router = Router();

router.get("/", (_req: Request, res: Response) => {;
  res.json({ status: "ok", uptime: process.uptime() } as HealthStatus);
});

export default router;
