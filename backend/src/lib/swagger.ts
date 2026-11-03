import type { OpenApiFragment } from "../docs/openapi";
import { generatedSchemas } from "../docs/schemas.docs";
import { authDocs } from "../docs/auth.docs";
import { healthDocs } from "../docs/health.docs";
import { env } from "../config/env";
import { userDocs } from "../docs/user.docs";

const fragments: OpenApiFragment[] = [healthDocs, authDocs, userDocs];

const paths: Record<string, unknown> = {};
for (const f of fragments) Object.assign(paths, f.paths);

const schemas: Record<string, unknown> = { ...generatedSchemas };
for (const f of fragments) Object.assign(schemas, f.components?.schemas ?? {});

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Inventory API",
    version: "1.0.0",
    description: "Inventory management system API",
  },
  servers: [{ url: env.BASE_URL }],
  paths,
  components: {
    schemas,
  },
};
