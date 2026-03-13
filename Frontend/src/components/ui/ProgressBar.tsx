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
        "w-full bg-secondary rounded-full h-2.5",
        className
      )}
    >
      <div
        className="bg-primary h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
