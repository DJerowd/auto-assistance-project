import { cn } from "../../lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-secondary/40 via-secondary/80 to-secondary/40", className)}
      {...props}
    />
  );
}

export { Skeleton };