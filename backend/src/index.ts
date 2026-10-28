import app from "./app";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { env } from "./config/env";
import { toLoggableError } from "./lib/errors";

const server = app.listen(env.PORT, (err) => {
  if (err) {
    logger.error("Server failed to start", err);
    process.exitCode = 1;
    return;
  }

  logger.info(`Server running on http://localhost:${env.PORT}`);
});

let shuttingDown = false;

function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    logger.debug(`Shutdown already in progress, ignoring ${signal}`);
    return;
  }
  shuttingDown = true;

  logger.info(`${signal} received, shutting down...`);

  let exitCode = 0;
  try {
    await closeServer();
    await prisma.$disconnect();
    logger.info("Shutdown complete");
  } catch (err) {
    logger.error("Shutdown failed", toLoggableError(err));
    exitCode = 1;
  }

  process.exitCode = exitCode;
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
