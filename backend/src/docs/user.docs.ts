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
  },
};
