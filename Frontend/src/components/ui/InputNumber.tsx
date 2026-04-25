import * as React from "react";
import { cn } from "../../lib/utils";
import { Input } from "./Input";
import type { InputProps } from "./Input";

interface InputNumberProps extends InputProps {
  onValueChange: (value: number) => void;
  value: number | string;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    const handleStep = (step: number) => {
      const currentValue = Number(value) || 0;
      onValueChange(currentValue + step);
    };

    return (
      <div className="relative flex items-center">
        <Input
          type="number"
          className={cn("pr-12 [appearance:textfield]", className)}
          ref={ref}
          value={value}
          onChange={(e) => onValueChange(e.target.valueAsNumber || 0)}
          {...props}
        />
        <div className="absolute right-1 flex h-full items-center gap-1 pr-1">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="text-foreground/50 hover:text-foreground hover:bg-accent rounded h-6 w-6 flex items-center justify-center transition-colors"
            tabIndex={-1}
            aria-label="Diminuir"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="text-foreground/50 hover:text-foreground hover:bg-accent rounded h-6 w-6 flex items-center justify-center transition-colors"
            tabIndex={-1}
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>
    );
  },
);
InputNumber.displayName = "InputNumber";

export { InputNumber };
