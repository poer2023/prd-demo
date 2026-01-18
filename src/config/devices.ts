// src/config/devices.ts
export interface Device {
  id: string;
  label: string;
  icon: string;
  width: number;
  height?: number;
}

export const devices: Device[] = [
  { id: "mobile", label: "手机", icon: "📱", width: 375, height: 667 },
  { id: "tablet", label: "平板", icon: "📱", width: 768, height: 1024 },
  { id: "desktop", label: "桌面", icon: "🖥️", width: 1280 },
];

export const defaultDevice = "desktop";
