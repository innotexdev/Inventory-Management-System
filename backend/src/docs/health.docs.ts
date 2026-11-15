import type { OpenApiFragment } from "./openapi";

export const healthDocs: OpenApiFragment = {
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          200: {
            description: "Server is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    uptime: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
