import { getInMemoryRepositories } from "./memory";

// Phase A: 先使用内存实现。Phase B 开始切换 PostgreSQL 实现。
export function getRepositories() {
  return getInMemoryRepositories();
}

export * from "./types";
