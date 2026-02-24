import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/platform/api/response";
import { compilerJobService } from "@/lib/platform/jobs";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = (await context.params) as { jobId?: unknown } | null | undefined;
  const jobId = params?.jobId;

  if (typeof jobId !== "string" || !jobId.trim()) {
    return apiError("MISSING_JOB_ID", "jobId is required", 400);
  }

  const job = await compilerJobService.getJob(jobId);
  if (!job) {
    return apiError("JOB_NOT_FOUND", `No compile job found for ${jobId}`, 404);
  }

  return apiOk({
    id: job.id,
    projectId: job.projectId,
    status: job.status,
    requestedBy: job.requestedBy,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    result: job.result,
    error: job.error,
  });
}
