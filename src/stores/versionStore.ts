/**
 * 版本状态管理
 * 使用 Zustand 管理版本历史
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Version, VersionState, CreateVersionParams, NodeChange } from '@/lib/version/types';
import type { OutlineState } from '@/lib/outline/types';
import { versionService } from '@/lib/version/service';

interface VersionActions {
  // 创建新版本
  createVersion: (
    state: Pick<OutlineState, 'nodes' | 'rootIds'>,
    params: CreateVersionParams
  ) => Version;

  // 获取版本
  getVersion: (versionId: string) => Version | undefined;

  // 获取最新版本
  getLatestVersion: () => Version | undefined;

  // 获取版本列表（按时间倒序）
  getVersionList: () => Version[];

  // 回滚到指定版本（返回该版本的快照）
  rollbackTo: (versionId: string) => Pick<OutlineState, 'nodes' | 'rootIds'> | null;

  // 获取两个版本之间的差异
  getDiff: (fromVersionId: string, toVersionId: string) => NodeChange[] | null;

  // 清理旧版本（保留最近 N 个）
  pruneVersions: (keepCount?: number) => void;

  // 重置版本历史
  resetVersions: () => void;

  // 设置最大版本数
  setMaxVersions: (count: number) => void;
}

type VersionStore = VersionState & VersionActions;

const DEFAULT_MAX_VERSIONS = 50;

export const useVersionStore = create<VersionStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      versions: [],
      currentVersionId: null,
      maxVersions: DEFAULT_MAX_VERSIONS,

      // 创建新版本
      createVersion: (state, params) => {
        const version = versionService.createVersion(state, params);

        set((s) => {
          const newVersions = [version, ...s.versions];

          // 如果超过最大版本数，删除最旧的
          if (newVersions.length > s.maxVersions) {
            newVersions.splice(s.maxVersions);
          }

          return {
            versions: newVersions,
            currentVersionId: version.id,
          };
        });

        return version;
      },

      // 获取版本
      getVersion: (versionId) => {
        return get().versions.find((v) => v.id === versionId);
      },

      // 获取最新版本
      getLatestVersion: () => {
        const { versions } = get();
        return versions.length > 0 ? versions[0] : undefined;
      },

      // 获取版本列表
      getVersionList: () => {
        return get().versions;
      },

      // 回滚到指定版本
      rollbackTo: (versionId) => {
        const version = get().getVersion(versionId);
        if (!version) return null;

        set({ currentVersionId: versionId });

        return {
          nodes: JSON.parse(JSON.stringify(version.snapshot.nodes)),
          rootIds: [...version.snapshot.rootIds],
        };
      },

      // 获取两个版本之间的差异
      getDiff: (fromVersionId, toVersionId) => {
        const fromVersion = get().getVersion(fromVersionId);
        const toVersion = get().getVersion(toVersionId);

        if (!fromVersion || !toVersion) return null;

        const diff = versionService.computeDiff(fromVersion, toVersion);
        return diff.changes;
      },

      // 清理旧版本
      pruneVersions: (keepCount) => {
        const count = keepCount ?? get().maxVersions;
        set((s) => ({
          versions: s.versions.slice(0, count),
        }));
      },

      // 重置版本历史
      resetVersions: () => {
        set({
          versions: [],
          currentVersionId: null,
        });
      },

      // 设置最大版本数
      setMaxVersions: (count) => {
        set({ maxVersions: count });
        get().pruneVersions(count);
      },
    }),
    {
      name: 'protodoc-versions',
      // 自定义序列化以处理大型快照
      partialize: (state) => ({
        versions: state.versions,
        currentVersionId: state.currentVersionId,
        maxVersions: state.maxVersions,
      }),
    }
  )
);
