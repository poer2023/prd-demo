import { compilePrdToProtoSpec, isPrdCompilerError } from "@/lib/prd-compiler";
import { createId } from "@/lib/platform/id";
import { log } from "@/lib/platform/observability/logger";
import { getRepositories } from "@/lib/platform/repositories";
import type { CompileJobRecord, CreateCompileJobInput } from "./types";

const processingQueue: string[] = [];
let isProcessing = false;

function nowIso() {
  return new Date().toISOString();
}

export class CompilerJobService {
  async createJob(input: CreateCompileJobInput): Promise<CompileJobRecord> {
    if (!input.projectId.trim()) {
      throw new Error("projectId is required");
    }
    if (!input.prdContent.trim()) {
      throw new Error("prdContent is required");
    }

    const id = createId("cmpjob");
    const timestamp = nowIso();
    const job: CompileJobRecord = {
      id,
      projectId: input.projectId,
      status: "queued",
      payload: {
        source: {
          projectId: input.projectId,
          content: input.prdContent,
          title: input.title,
          sourceType: "markdown",
        },
      },
      result: null,
      error: null,
      requestedBy: input.requestedBy,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const { compileJobRepository } = getRepositories();
    await compileJobRepository.create(job);
    processingQueue.push(job.id);
    log("info", "Compile job created", {
      module: "compiler-job-service",
      traceId: job.id,
      projectId: job.projectId,
    });

    void this.processQueue();
    return job;
  }

  async getJob(jobId: string): Promise<CompileJobRecord | null> {
    const { compileJobRepository } = getRepositories();
    return compileJobRepository.getById(jobId);
  }

  private async processQueue(): Promise<void> {
    if (isProcessing) return;
    isProcessing = true;
    const { compileJobRepository, protoSpecRepository } = getRepositories();

    try {
      while (processingQueue.length > 0) {
        const jobId = processingQueue.shift();
        if (!jobId) continue;
        const job = await compileJobRepository.getById(jobId);
        if (!job || job.status !== "queued") continue;

        job.status = "running";
        job.updatedAt = nowIso();
        await compileJobRepository.update(job);
        log("info", "Compile job started", {
          module: "compiler-job-service",
          traceId: job.id,
          projectId: job.projectId,
        });

        try {
          const output = compilePrdToProtoSpec(job.payload.source);
          await protoSpecRepository.create(output.spec);
          job.status = "succeeded";
          job.result = {
            specId: output.spec.id,
            warnings: output.warnings,
          };
          job.error = null;
          job.updatedAt = nowIso();
          await compileJobRepository.update(job);

          log("info", "Compile job succeeded", {
            module: "compiler-job-service",
            traceId: job.id,
            projectId: job.projectId,
            specId: output.spec.id,
            warningCount: output.warnings.length,
          });
        } catch (error) {
          job.status = "failed";
          job.updatedAt = nowIso();
          if (isPrdCompilerError(error)) {
            job.error = {
              code: error.code,
              message: error.message,
              details: error.details,
            };
          } else if (error instanceof Error) {
            job.error = {
              code: "UNEXPECTED_COMPILER_ERROR",
              message: error.message,
            };
          } else {
            job.error = {
              code: "UNKNOWN_COMPILER_ERROR",
              message: "Unknown compiler error",
            };
          }
          await compileJobRepository.update(job);
          log("error", "Compile job failed", {
            module: "compiler-job-service",
            traceId: job.id,
            projectId: job.projectId,
            errorCode: job.error.code,
          });
        }
      }
    } finally {
      isProcessing = false;
    }
  }
}
