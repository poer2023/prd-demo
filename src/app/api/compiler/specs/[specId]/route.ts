import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/platform/api/response";
import { getRepositories } from "@/lib/platform/repositories";

interface RouteContext {
  params: Promise<{
    specId: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = (await context.params) as { specId?: unknown } | null | undefined;
  const specId = params?.specId;
  if (typeof specId !== "string" || !specId.trim()) {
    return apiError("MISSING_SPEC_ID", "specId is required", 400);
  }

  const { protoSpecRepository } = getRepositories();
  const spec = await protoSpecRepository.getById(specId);
  if (!spec) {
    return apiError("SPEC_NOT_FOUND", `No ProtoSpec found for ${specId}`, 404);
  }

  return apiOk(spec);
}
