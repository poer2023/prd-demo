import type { CompilerWarning, PageTemplateType } from "../types";

export type CompilerConflictResolution = "fail" | "downgrade";

export interface CompilerConflict {
  code: string;
  message: string;
  path: string;
  resolution: CompilerConflictResolution;
}

export interface ConflictResolutionResult {
  template: PageTemplateType;
  warnings: CompilerWarning[];
  errors: CompilerConflict[];
}
