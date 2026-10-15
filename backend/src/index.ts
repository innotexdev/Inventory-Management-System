import dotenv from "dotenv";
import app from "./app";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
