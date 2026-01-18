"use client";

import { devices } from "@/config/devices";

interface DeviceToolbarProps {
  currentDevice: string;
  onDeviceChange: (deviceId: string) => void;
}

export function DeviceToolbar({ currentDevice, onDeviceChange }: DeviceToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--background)] rounded-lg p-1 border border-[var(--border-color)]">
      {devices.map((device) => (
        <button
          key={device.id}
          onClick={() => onDeviceChange(device.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1.5 ${
            device.id === currentDevice
              ? "bg-[var(--background-secondary)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
          }`}
          title={`${device.label} (${device.width}px)`}
        >
          <span>{device.icon}</span>
          <span className="hidden sm:inline">{device.label}</span>
        </button>
      ))}
    </div>
  );
}
