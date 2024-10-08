import * as React from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out ${className}`}
        {...props}
      />
      {label && (
        <label className="ml-2 block text-sm leading-5 text-gray-300">
          {label}
        </label>
      )}
    </div>
  )
}