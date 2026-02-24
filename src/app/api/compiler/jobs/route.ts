import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/platform/api/response";
import { compilerJobService } from "@/lib/platform/jobs";

interface CreateJobBody {
  projectId?: unknown;
  prdContent?: unknown;
  title?: unknown;
  requestedBy?: unknown;
}

function parseCreateJobBody(body: unknown): CreateJobBody | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as CreateJobBody;
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const body = parseCreateJobBody(rawBody);
  if (!body) {
    return apiError("INVALID_BODY", "Request body must be an object", 400);
  }
  if (typeof body.projectId !== "string" || !body.projectId.trim()) {
    return apiError("MISSING_PROJECT_ID", "projectId is required", 400);
  }
  if (typeof body.prdContent !== "string" || !body.prdContent.trim()) {
    return apiError("MISSING_PRD_CONTENT", "prdContent is required", 400);
  }
  if (body.title !== undefined && typeof body.title !== "string") {
    return apiError("INVALID_TITLE", "title must be a string", 400);
  }
  if (body.requestedBy !== undefined && typeof body.requestedBy !== "string") {
    return apiError("INVALID_REQUESTED_BY", "requestedBy must be a string", 400);
  }

  try {
    const job = await compilerJobService.createJob({
      projectId: body.projectId,
      prdContent: body.prdContent,
      title: body.title,
      requestedBy: body.requestedBy,
    });
    return apiOk(
      {
        jobId: job.id,
        status: job.status,
        createdAt: job.createdAt,
      },
      202
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create compile job";
    return apiError("CREATE_JOB_FAILED", message, 500);
  }
}
