import React from "react";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

const ProgressBar = ({ value, max, className }: ProgressBarProps) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      className={cn(
        "w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-800",
        className
      )}
    >
      <div
        className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
