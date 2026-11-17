import type { OpenApiFragment } from "./openapi";

export const teamDocs: OpenApiFragment = {
  paths: {
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List teams",
        description: "Manager and Admin only. Read-only list used by the users page team filter.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Team list" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
        },
      },
    },
  },
};
