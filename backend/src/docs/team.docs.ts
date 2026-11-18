import type { OpenApiFragment } from "./openapi";

export const teamDocs: OpenApiFragment = {
  paths: {
    "/api/teams": {
      get: {
        tags: ["Teams"],
        summary: "List teams",
        description: "Manager and Admin only.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Team list" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
        },
      },
      post: {
        tags: ["Teams"],
        summary: "Create team",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Team created" },
          400: { description: "Validation failed" },
          401: { description: "No session" },
          403: { description: "Admin only" },
          409: { description: "Duplicate name" },
        },
      },
    },
    "/api/teams/{id}": {
      patch: {
        tags: ["Teams"],
        summary: "Rename or update team",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Team updated" },
          400: { description: "Validation or malformed id" },
          401: { description: "No session" },
          403: { description: "Admin only" },
          404: { description: "Team not found" },
          409: { description: "Duplicate name" },
        },
      },
      delete: {
        tags: ["Teams"],
        summary: "Delete an empty team",
        security: [{ bearerAuth: [] }],
        responses: {
          204: { description: "Team deleted" },
          400: { description: "Malformed id" },
          401: { description: "No session" },
          403: { description: "Admin only" },
          404: { description: "Team not found" },
          409: { description: "Team still has members" },
        },
      },
    },
  },
};
