import type { OpenApiFragment } from "./openapi";

export const authDocs: OpenApiFragment = {
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Log in",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Login" },
            },
          },
        },
        responses: {
          200: { description: "Signed in, session cookie set" },
          400: { description: "Invalid input" },
          401: { description: "Invalid email or password" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register a new employee account and sign in",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Register" },
            },
          },
        },
        responses: {
          201: { description: "Account created, session cookie set" },
          400: { description: "Invalid input" },
          409: { description: "Email already in use" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Log out",
        tags: ["Auth"],
        responses: {
          204: { description: "Signed out, session cookie cleared" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Current user with role and team",
        tags: ["Auth"],
        responses: {
          200: { description: "Current user" },
          401: { description: "No session" },
        },
      },
    },
  },
};
