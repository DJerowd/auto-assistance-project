import * as React from 'react';
import { cn } from '../../lib/utils';
import { Input } from './Input';
import type { InputProps } from './Input';

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
          type='number'
          className={cn('pr-12 appearance: textfield', className)}
          ref={ref}
          value={value}
          onChange={(e) => onValueChange(e.target.valueAsNumber || 0)}
          {...props}
        />
        <div className="absolute right-1 flex h-full items-center">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="text-indigo-500 hover:text-gray-800 dark:hover:text-gray-200 h-6 w-6"
            tabIndex={-1}
            aria-label="Diminuir"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="text-indigo-500 hover:text-gray-800 dark:hover:text-gray-200 h-6 w-6"
            tabIndex={-1}
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>
    );
  }
);
InputNumber.displayName = 'InputNumber';

export { InputNumber };