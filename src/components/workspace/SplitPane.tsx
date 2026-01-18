"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

interface SplitPaneProps {
  leftRatio: number;
  onRatioChange: (ratio: number) => void;
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function SplitPane({
  leftRatio,
  onRatioChange,
  leftContent,
  rightContent,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clamp ratio to 0.1 ~ 0.9
  const clampRatio = (ratio: number): number => {
    return Math.min(0.9, Math.max(0.1, ratio));
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio = (moveEvent.clientX - containerRect.left) / containerRect.width;
      onRatioChange(clampRatio(newRatio));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [onRatioChange]);

  const leftWidth = `${leftRatio * 100}%`;
  const rightWidth = `${(1 - leftRatio) * 100}%`;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{
        cursor: isDragging ? "col-resize" : undefined,
      }}
    >
      {/* Left Panel */}
      <div
        className="h-full overflow-auto"
        style={{
          width: leftWidth,
          transition: isDragging ? "none" : "width 300ms ease-in-out",
        }}
      >
        {leftContent}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="group relative h-full w-1 flex-shrink-0 cursor-col-resize bg-[var(--border-color)] hover:bg-[var(--foreground)]"
        style={{
          transition: "background-color 150ms ease-in-out",
        }}
      >
        {/* Drag affordance indicator */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
          style={{
            transition: "opacity 150ms ease-in-out",
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="h-1 w-1 rounded-full bg-[var(--background)]" />
            <div className="h-1 w-1 rounded-full bg-[var(--background)]" />
            <div className="h-1 w-1 rounded-full bg-[var(--background)]" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="h-full overflow-auto"
        style={{
          width: rightWidth,
          transition: isDragging ? "none" : "width 300ms ease-in-out",
        }}
      >
        {rightContent}
      </div>
    </div>
  );
}
