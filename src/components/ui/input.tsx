
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value: propValue, defaultValue: propDefaultValue, onChange: baseOnChange, ...props }, ref) => {
    const isControlled = propValue !== undefined;

    let valueAttributeToSet: string | number | readonly string[] | undefined;
    let defaultValueAttributeToSet: string | number | readonly string[] | undefined;

    const isTextLikeInput = !(
      type === 'checkbox' ||
      type === 'radio' ||
      type === 'file' ||
      type === 'button' ||
      type === 'submit' ||
      type === 'reset' ||
      type === 'image' ||
      type === 'hidden'
    );

    if (isControlled) {
      valueAttributeToSet = propValue;
      // For controlled text-like inputs, if `propValue` is undefined, React expects an empty string to keep it controlled.
      if (isTextLikeInput && valueAttributeToSet === undefined) {
        valueAttributeToSet = "";
      }
      // `defaultValueAttributeToSet` remains undefined as `value` takes precedence in controlled inputs.
    } else {
      // For uncontrolled inputs, `valueAttributeToSet` is undefined.
      // The native input will use `propDefaultValue` if provided.
      valueAttributeToSet = undefined;
      defaultValueAttributeToSet = propDefaultValue;
    }
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "number" && baseOnChange) {
        const { value: inputValue } = event.target;
        // Regex: allows empty string, optional minus, digits, optional dot, digits.
        const numericRegex = /^-?\d*\.?\d*$/;
        if (numericRegex.test(inputValue)) {
          baseOnChange(event);
        }
        // If not matching, do nothing; the input won't update with invalid characters
      } else if (baseOnChange) {
        baseOnChange(event);
      }
      // If it's an uncontrolled input and no `baseOnChange` was passed by the consumer,
      // this custom `handleChange` won't do anything for non-numeric types,
      // which is standard behavior for uncontrolled inputs.
    };

    return (
      <input
        type={type}
        value={valueAttributeToSet}
        defaultValue={defaultValueAttributeToSet}
        // For controlled inputs, `baseOnChange` (the user's onChange) is used.
        // For uncontrolled inputs, our `handleChange` is used, which might internally call `baseOnChange` if it was provided for number validation.
        onChange={isControlled ? baseOnChange : handleChange}
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
