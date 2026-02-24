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
