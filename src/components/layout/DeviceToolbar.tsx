"use client";

import { devices } from "@/config/devices";

interface DeviceToolbarProps {
  currentDevice: string;
  onDeviceChange: (deviceId: string) => void;
}

export function DeviceToolbar({ currentDevice, onDeviceChange }: DeviceToolbarProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {devices.map((device) => (
        <button
          key={device.id}
          onClick={() => onDeviceChange(device.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition flex items-center gap-1.5 ${
            device.id === currentDevice
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
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
