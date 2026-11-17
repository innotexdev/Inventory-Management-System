import type { OpenApiFragment } from "./openapi";

export const userDocs: OpenApiFragment = {
  paths: {
    "/api/users/me": {
      patch: {
        tags: ["Users"],
        summary: "Update my profile",
        description: "Updates the authenticated user's first name, last name, or both.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateUser",
              },
              example: {
                firstName: "John",
                lastName: "Doe",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
            content: {
              "application/json": {
                example: {
                  data: {
                    id: "user-id",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@example.com",
                  },
                },
              },
            },
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
        tags: ["Users"],
        summary: "Change my password",
        description:
          "Changes the authenticated user's password after verifying the current password.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdatePassword",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Password changed successfully",
            content: {
              "application/json": {
                example: {
                  data: {
                    message: "Password changed successfully",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input or incorrect current password",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/api/users/me/items": {
      get: {
        tags: ["Users"],
        summary: "Get my currently assigned items",
        description: "Returns inventory items currently assigned to the authenticated user.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Currently assigned items retrieved successfully",
            content: {
              "application/json": {
                example: {
                  data: [],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/api/users/me/assignments": {
      get: {
        tags: ["Users"],
        summary: "Get my assignment history",
        description:
          "Returns the authenticated user's assignment history, including returned items.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Assignment history retrieved successfully",
            content: {
              "application/json": {
                example: {
                  data: [],
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users with search, filters and pagination",
        description:
          "Manager and Admin only. Each row includes the number of items the user holds.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "teamId", in: "query", schema: { type: "string", format: "uuid" } },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["EMPLOYEE", "MANAGER", "ADMIN"] },
          },
          { name: "isActive", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
        ],
        responses: {
          200: { description: "Paginated user list" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
        },
      },
    },

    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "User detail",
        description: "Manager and Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "User detail" },
          400: { description: "Malformed id" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
          404: { description: "User not found" },
        },
      },
    },

    "/api/users/{id}/items": {
      get: {
        tags: ["Assignments"],
        summary: "Items currently held by a user",
        description: "Manager and Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "Currently held items" },
          400: { description: "Malformed id" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
          404: { description: "User not found" },
        },
      },
    },

    "/api/users/{id}/assignments": {
      get: {
        tags: ["Assignments"],
        summary: "Assignment history for a user",
        description: "Manager and Admin only, newest first.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          200: { description: "User assignment history" },
          400: { description: "Malformed id" },
          401: { description: "No session" },
          403: { description: "Role not allowed" },
          404: { description: "User not found" },
        },
      },
    },
  },
};
