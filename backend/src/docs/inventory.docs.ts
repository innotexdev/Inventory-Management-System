import type { OpenApiFragment } from "./openapi";

const errorResponses = {
  400: { description: "Validation failed" },
  401: { description: "No session" },
  403: { description: "Role not allowed" },
  404: { description: "Not found" },
  409: { description: "Conflict" },
};

const itemSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    assetTag: { type: "string", example: "INV-0001" },
    name: { type: "string" },
    category: { type: "object" },
    brand: { type: "string", nullable: true },
    model: { type: "string", nullable: true },
    serialNumber: { type: "string", nullable: true },
    status: { type: "string", enum: ["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"] },
    currentHolder: { type: "object", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const createItemBody = {
  type: "object",
  required: ["name", "categoryId"],
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    categoryId: { type: "string", format: "uuid" },
    brand: { type: "string", maxLength: 50, nullable: true },
    model: { type: "string", maxLength: 50, nullable: true },
    serialNumber: { type: "string", minLength: 3, maxLength: 64, nullable: true },
    purchaseDate: { type: "string", format: "date", nullable: true },
    notes: { type: "string", maxLength: 500, nullable: true },
  },
};

export const inventoryDocs: OpenApiFragment = {
  paths: {
    "/api/categories": {
      get: {
        tags: ["Inventory"],
        summary: "List categories",
        responses: { 200: { description: "Category list" }, ...errorResponses },
      },
    },
    "/api/items": {
      get: {
        tags: ["Inventory"],
        summary: "List items with filters, sorting and pagination",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"] },
          },
          { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "teamId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "holderId", in: "query", schema: { type: "string", format: "uuid" } },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["name", "assetTag", "createdAt"] },
          },
          { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
        ],
        responses: { 200: { description: "Paginated item list" }, ...errorResponses },
      },
      post: {
        tags: ["Inventory"],
        summary: "Create an item",
        requestBody: {
          required: true,
          content: { "application/json": { schema: createItemBody } },
        },
        responses: { 201: { description: "Item created" }, ...errorResponses },
      },
    },
    "/api/items/{id}": {
      get: {
        tags: ["Inventory"],
        summary: "Item detail with current holder",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Item detail" }, ...errorResponses },
      },
      patch: {
        tags: ["Inventory"],
        summary: "Edit item fields",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { ...createItemBody, required: [] },
            },
          },
        },
        responses: { 200: { description: "Item updated" }, ...errorResponses },
      },
    },
    "/api/items/{id}/status": {
      post: {
        tags: ["Inventory"],
        summary: "Send to repair, back from repair or retire",
        description:
          "Assigning is a separate operation; Assigned is a derived, non-editable status.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["AVAILABLE", "IN_REPAIR", "RETIRED"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status changed" }, ...errorResponses },
      },
    },
    "/api/items/{id}/assign": {
      post: {
        tags: ["Assignments"],
        summary: "Assign an available item to an active user",
        description:
          "Creates an assignment and makes the item Assigned in one transaction. Two simultaneous requests for the same item produce one assignment and one 409 conflict.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: {
                  userId: { type: "string", format: "uuid" },
                  note: { type: "string", maxLength: 250, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Item assigned, returns the updated item" },
          ...errorResponses,
        },
      },
    },
    "/api/items/{id}/unassign": {
      post: {
        tags: ["Assignments"],
        summary: "Return an assigned item",
        description:
          "Closes the active assignment with a return timestamp and actor in one transaction.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  note: { type: "string", maxLength: 250, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Item returned, returns the updated item" },
          ...errorResponses,
        },
      },
    },
    "/api/items/{id}/assignments": {
      get: {
        tags: ["Assignments"],
        summary: "Item assignment history",
        description:
          "Full history for an item, newest first, including who assigned and returned it.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: { 200: { description: "Assignment history" }, ...errorResponses },
      },
    },
    "/api/stats/inventory": {
      get: {
        tags: ["Inventory"],
        summary: "Dashboard totals per status and category",
        responses: { 200: { description: "Inventory totals" }, ...errorResponses },
      },
    },
  },
  components: {
    schemas: {
      Item: itemSchema,
    },
  },
};
