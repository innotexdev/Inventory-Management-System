import type { NextFunction, Request, Response } from "express";
import { createTeam, deleteTeam, listTeams, updateTeam } from "../services/team.service";
import type { createTeamSchema, updateTeamSchema } from "../validation/team.validation";
import type { z } from "zod";

export async function listTeamsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await listTeams() });
  } catch (err) {
    next(err);
  }
}

export async function createTeamHandler(
  req: Request<unknown, unknown, z.infer<typeof createTeamSchema>>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.status(201).json({ data: await createTeam(req.body) });
  } catch (err) {
    next(err);
  }
}

export async function updateTeamHandler(
  req: Request<{ id: string }, unknown, z.infer<typeof updateTeamSchema>>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({ data: await updateTeam(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeamHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteTeam(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
