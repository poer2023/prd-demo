"use client";

import { devices } from "@/config/devices";

interface DeviceFrameProps {
  deviceId: string;
  children: React.ReactNode;
}

export function DeviceFrame({ deviceId, children }: DeviceFrameProps) {
  const device = devices.find((d) => d.id === deviceId);

  if (!device || deviceId === "desktop") {
    return <div className="w-full h-full flex items-center justify-center">{children}</div>;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="bg-[var(--background-secondary)] rounded-3xl shadow-xl border-8 border-[#333] overflow-hidden"
        style={{
          width: device.width,
          height: device.height,
        }}
      >
        <div className="h-6 bg-[#333] flex items-center justify-center">
          <div className="w-16 h-1 bg-[#555] rounded-full" />
        </div>
        <div className="h-[calc(100%-24px)] overflow-auto bg-[var(--background-secondary)]">
          {children}
        </div>
      </div>
    </div>
  );
}
