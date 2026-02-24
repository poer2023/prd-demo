import type { ProtoSpec } from "@/lib/protospec";
import type { CompileJobRecord } from "@/lib/platform/jobs/types";
import type {
  CompileJobRepository,
  ProtoSpecRepository,
  RepositoryBundle,
} from "./types";

class InMemoryProtoSpecRepository implements ProtoSpecRepository {
  private readonly specs = new Map<string, ProtoSpec>();

  async create(spec: ProtoSpec): Promise<void> {
    this.specs.set(spec.id, spec);
  }

  async getById(specId: string): Promise<ProtoSpec | null> {
    return this.specs.get(specId) || null;
  }

  async listByProject(projectId: string): Promise<ProtoSpec[]> {
    return [...this.specs.values()]
      .filter((spec) => spec.meta.projectId === projectId)
      .sort((a, b) => b.meta.generatedAt.localeCompare(a.meta.generatedAt));
  }
}

class InMemoryCompileJobRepository implements CompileJobRepository {
  private readonly jobs = new Map<string, CompileJobRecord>();

  async create(job: CompileJobRecord): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async update(job: CompileJobRecord): Promise<void> {
    this.jobs.set(job.id, job);
  }

  async getById(jobId: string): Promise<CompileJobRecord | null> {
    return this.jobs.get(jobId) || null;
  }

  async listByProject(projectId: string): Promise<CompileJobRecord[]> {
    return [...this.jobs.values()]
      .filter((job) => job.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

const bundle: RepositoryBundle = {
  protoSpecRepository: new InMemoryProtoSpecRepository(),
  compileJobRepository: new InMemoryCompileJobRepository(),
};

export function getInMemoryRepositories(): RepositoryBundle {
  return bundle;
}
