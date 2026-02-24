"use client";

import { DocLayout } from "@/components/layout";
import { essaypassNavTree } from "@/config/docs";

export default function OrderConfirmationPage() {
  return (
    <DocLayout
      title="订单确认页"
      description="订单确认与支付页面，包含预览卡片、Turnitin 附加服务、价格计算。"
      versions={[
        { id: "v1", label: "V1 - 完整版", date: "2025-01-18" },
      ]}
      defaultVersion="v1"
      states={[
        { id: "default", label: "默认" },
        { id: "turnitin", label: "含 Turnitin" },
        { id: "mobile", label: "移动端" },
      ]}
      defaultState="default"
      decisions={[
        { date: "01-18", content: "完成订单确认页全部交互" },
        { date: "01-17", content: "添加 Turnitin 查重服务选项" },
        { date: "01-17", content: "价格计算逻辑：基础价格 + 附加服务" },
        { date: "01-16", content: "预览卡片显示论文核心信息" },
      ]}
      navItems={essaypassNavTree}
      projectSlug="essaypass"
      lastUpdated="2025-01-18"
    >
      {({ state }) => (
        <div className="space-y-4">
          {/* 预览卡片 */}
          <section id="preview" className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">📄 订单预览</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">主题</span>
                <span className="text-gray-900 dark:text-white">The Impact of AI on Education</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">类型</span>
                <span className="text-gray-900 dark:text-white">Research Paper</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">字数</span>
                <span className="text-gray-900 dark:text-white">2,500 words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">截止日期</span>
                <span className="text-gray-900 dark:text-white">2025-01-25</span>
              </div>
            </div>
          </section>

          {/* Turnitin 服务 */}
          <section id="turnitin" className={`p-4 rounded-lg border ${
            state === "turnitin"
              ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">✅ Turnitin 查重</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">保证论文原创性，提供查重报告</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 dark:text-green-400 font-medium">+$19.99</span>
                <div className={`w-12 h-6 rounded-full p-1 transition ${
                  state === "turnitin" ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition transform ${
                    state === "turnitin" ? "translate-x-6" : ""
                  }`} />
                </div>
              </div>
            </div>
          </section>

          {/* 价格计算 */}
          <section id="pricing" className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">基础价格 (2,500 字)</span>
                <span className="text-gray-900 dark:text-white">$49.99</span>
              </div>
              {state === "turnitin" && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Turnitin 查重</span>
                  <span className="text-gray-900 dark:text-white">$19.99</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700 font-medium">
                <span className="text-gray-900 dark:text-white">总计</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  ${state === "turnitin" ? "69.98" : "49.99"}
                </span>
              </div>
            </div>

            {state === "mobile" ? (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">$49.99</span>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
                  立即支付
                </button>
              </div>
            ) : (
              <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                💳 立即支付
              </button>
            )}
          </section>
        </div>
      )}
    </DocLayout>
  );
}
