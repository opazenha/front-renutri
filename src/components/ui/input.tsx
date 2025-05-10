
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value: propValue, ...props }, ref) => {
    // For controlled inputs where 'value' attribute is used for user input,
    // an undefined value can lead to an uncontrolled component initially.
    // We default it to an empty string to keep it controlled.
    // This does not apply to types like 'checkbox' or 'radio' (controlled by 'checked'),
    // or 'file' (value is read-only), or button types.
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
    
    // For type="number", if currentValue is an empty string, it might cause issues.
    // React itself will warn if an empty string is provided to a number input that expects a number.
    // However, react-hook-form and Zod often handle this coercion.
    // If `currentValue` is `""` and `type` is `number`, we might let it pass
    // relying on `react-hook-form` and `zod` to manage coercion and validation.
    // Or, ensure that number inputs always receive `undefined` or a valid number from the form state.
    // The `defaultValues` in `react-hook-form` should handle initializing number fields appropriately (e.g., to `undefined` or a specific number).

    return (
      <input
        type={type}
        value={currentValue}
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
