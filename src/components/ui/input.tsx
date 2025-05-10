
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value: propValue, onChange: baseOnChange, ...props }, ref) => {
    let currentValue = propValue;
    const isValueControlledTypeTextLike = !(
      type === 'checkbox' ||
      type === 'radio' ||
      type === 'file' ||
      type === 'button' ||
      type === 'submit' ||
      type === 'reset' ||
      type === 'image' ||
      type === 'hidden'
    );

    if (isValueControlledTypeTextLike && propValue === undefined) {
      currentValue = "";
    }
    
    // For type="number", if currentValue is an empty string and the input expects a number,
    // React might issue a warning or the input might behave unexpectedly.
    // However, react-hook-form typically handles string values from inputs and Zod coerces them.
    // If `defaultValues` in RHF initializes number fields as `undefined` or a number,
    // this `currentValue = ""` conversion for `undefined` propValue is important for controlled text-like inputs.
    // For `type="number"`, if `propValue` is `undefined`, `currentValue` becomes `""`.
    // This is acceptable as `input type="number"` can have an empty value.

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number" && baseOnChange) {
        const { value } = event.target;
        // Regex: allows empty string, optional minus, digits, optional dot, digits.
        // This covers valid numbers and intermediate states like "-", ".", "-."
        const numericRegex = /^-?\d*\.?\d*$/;
        if (numericRegex.test(value)) {
          baseOnChange(event);
        }
        // If not matching, do nothing; the input won't update with invalid characters
        // because react-hook-form's state won't change, and React will re-render with the old value.
      } else if (baseOnChange) {
        baseOnChange(event);
      }
    };

    return (
      <input
        // For number inputs that need strict numeric-only typing,
        // sometimes it's more robust to use type="text" and inputMode="numeric"
        // and handle all parsing logic. However, sticking to type="number"
        // for now to retain browser-specific behaviors like steppers (if enabled).
        type={type}
        value={currentValue}
        onChange={handleChange} // Use the custom handler
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
