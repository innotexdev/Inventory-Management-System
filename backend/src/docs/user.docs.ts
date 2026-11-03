import type { OpenApiFragment } from "./openapi";

export const userDocs: OpenApiFragment = {
  paths: {
    "/api/users/me": {
      patch: {
        tags: ["Users"],
        summary: "Update my profile",
        description: "Updates the authenticated user's first and last name.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUser",
              },
              example: {
                firstName: "Innocent",
                lastName: "Akuh",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
          },
          400: {
            description: "Invalid request body or no fields to update",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "User not found",
          },
        },
      },
    },
    "/api/users/me/password": {
      patch: {
        summary: "Change current user's password",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePassword" },
            },
          },
        },
        responses: {
          200: { description: "Password changed successfully" },
          400: { description: "Invalid input or incorrect current password" },
          401: { description: "No session" },
        },
      },
    },

    "/api/users/me/items": {
      get: {
        summary: "List items currently assigned to the authenticated user",
        tags: ["Users"],
        responses: {
          200: { description: "Current assigned items" },
          401: { description: "No session" },
        },
      },
    },

    "/api/users/me/assignments": {
      get: {
        summary: "List assignment history for the authenticated user",
        tags: ["Users"],
        responses: {
          200: { description: "User assignment history, including returned items" },
          401: { description: "No session" },
        },
      },
    },
  },
};
