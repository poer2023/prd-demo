import type { ComponentNode, ComponentType, PageSpec } from "@/lib/protospec";

export interface RuntimeWarning {
  code: string;
  message: string;
  nodeId?: string;
}

export interface RuntimeRenderResult {
  page: PageSpec;
  root: ComponentNode;
  warnings: RuntimeWarning[];
}

export interface RuntimeRenderOptions {
  allowedComponents?: ReadonlySet<ComponentType>;
}

export interface RuntimeMergeOptions {
  lockedNodeIds: ReadonlySet<string>;
}
