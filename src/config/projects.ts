export interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  visibility: "public" | "private";
  color?: string; // 渐变色起始色
  updatedAt: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "登录优化",
    description: "优化登录转化率，将验证码按钮从输入框下方移到输入框内部",
    slug: "login",
    visibility: "public",
    color: "#c7d2fe", // 淡紫
    updatedAt: "2024-01-18",
  },
  {
    id: "2",
    name: "注册流程",
    description: "新用户注册流程设计，包含手机号验证和基本信息填写",
    slug: "register",
    visibility: "public",
    color: "#bbf7d0", // 淡绿
    updatedAt: "2024-01-15",
  },
  {
    id: "3",
    name: "个人中心",
    description: "用户个人中心页面，包含资料编辑、安全设置等功能",
    slug: "profile",
    visibility: "private",
    color: "#fecaca", // 淡红
    updatedAt: "2024-01-10",
  },
];

export function getPublicProjects(): Project[] {
  return projects.filter((p) => p.visibility === "public");
}

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
