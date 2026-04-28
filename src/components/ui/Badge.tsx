import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  type?: "success" | "warning" | "error" | "info";
  className?: string;
}

export default function Badge({
  children,
  type = "info",
  className
}: BadgeProps) {
  const colors = {
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    warning: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    error: "border-red-400/30 bg-red-400/10 text-red-300",
    info: "border-blue-400/30 bg-blue-400/10 text-blue-300"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        colors[type],
        className
      )}
    >
      {children}
    </span>
  );
}