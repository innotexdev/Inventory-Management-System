import type { NextFunction, Request, Response } from "express";
import { listTeams } from "../services/team.service";

export async function listTeamsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await listTeams() });
  } catch (err) {
    next(err);
  }
}
