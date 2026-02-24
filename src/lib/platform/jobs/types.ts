import type { CompilerWarning, PrdSource } from "@/lib/prd-compiler";

export type CompileJobStatus = "queued" | "running" | "succeeded" | "failed";

export interface CreateCompileJobInput {
  projectId: string;
  prdContent: string;
  title?: string;
  requestedBy?: string;
}

export interface CompileJobPayload {
  source: PrdSource;
}

export interface CompileJobResult {
  specId: string;
  warnings: CompilerWarning[];
  confidence: number;
  needsHumanReview: boolean;
  reviewReasons: string[];
}

export interface CompileJobRecord {
  id: string;
  projectId: string;
  status: CompileJobStatus;
  payload: CompileJobPayload;
  result: CompileJobResult | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  } | null;
  requestedBy?: string;
  createdAt: string;
  updatedAt: string;
}
