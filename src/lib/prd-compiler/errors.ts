export const PRD_COMPILER_ERROR_CODES = {
  EMPTY_PRD_CONTENT: "EMPTY_PRD_CONTENT",
  EMPTY_PRD_STRUCTURE: "EMPTY_PRD_STRUCTURE",
  INVALID_PROTO_SPEC: "INVALID_PROTO_SPEC",
  CONSTRAINT_CONFLICT: "CONSTRAINT_CONFLICT",
} as const;

export class PrdCompilerError extends Error {
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "PrdCompilerError";
    this.code = code;
    this.details = details;
  }
}

export function isPrdCompilerError(error: unknown): error is PrdCompilerError {
  return error instanceof PrdCompilerError;
}
