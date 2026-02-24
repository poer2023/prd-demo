import type { ProtoSpec } from "@/lib/protospec";
import type { CompileJobRecord } from "@/lib/platform/jobs/types";

export interface ProtoSpecRepository {
  create(spec: ProtoSpec): Promise<void>;
  getById(specId: string): Promise<ProtoSpec | null>;
  listByProject(projectId: string): Promise<ProtoSpec[]>;
}

export interface CompileJobRepository {
  create(job: CompileJobRecord): Promise<void>;
  update(job: CompileJobRecord): Promise<void>;
  getById(jobId: string): Promise<CompileJobRecord | null>;
  listByProject(projectId: string): Promise<CompileJobRecord[]>;
}

export interface RepositoryBundle {
  protoSpecRepository: ProtoSpecRepository;
  compileJobRepository: CompileJobRepository;
}
