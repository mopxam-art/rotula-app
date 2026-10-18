import React from "react";

export interface ChartEmptyStateProps {
  message?: string;
  className?: string;
}

/**
 * Empty state container rendered in place of a chart when its series has no points.
 * Ensures an explicit accessible message is announced rather than drawing bare axes.
 */
export function ChartEmptyState({
  message = "No data available",
  className = "",
}: ChartEmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex h-[260px] w-full flex-col items-center justify-center text-center text-sm text-slate-500 ${className}`}
    >
      <p>{message}</p>
    </div>
  );
}
