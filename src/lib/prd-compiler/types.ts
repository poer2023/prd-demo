import type { ProtoSpec } from "@/lib/protospec";

export interface PrdSource {
  projectId: string;
  content: string;
  title?: string;
  sourceType?: "markdown" | "structured";
}

export interface PrdAstSection {
  id: string;
  title: string;
  level: number;
  parentId: string | null;
  content: string;
  lines: string[];
}

export interface PrdAstDocument {
  id: string;
  title: string;
  sourceType: "markdown" | "structured";
  raw: string;
  sections: PrdAstSection[];
}

export interface NormalizedPrdPage {
  id: string;
  title: string;
  summary: string;
  requirements: string[];
  interactions: string[];
  styleDirectives: string[];
  acceptanceCriteria: string[];
}

export interface NormalizedPrd {
  projectId: string;
  title: string;
  pages: NormalizedPrdPage[];
  globalStyleDirectives: string[];
  globalAcceptanceCriteria: string[];
}

export interface CompilerWarning {
  code: string;
  message: string;
}

export interface CompilerOutput {
  spec: ProtoSpec;
  warnings: CompilerWarning[];
}
