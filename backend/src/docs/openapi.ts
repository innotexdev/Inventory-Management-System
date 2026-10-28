export interface OpenApiFragment {
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}
