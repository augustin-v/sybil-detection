import * as React from "react"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
    return (
      <div
        className={`relative overflow-auto ${className}`}
        style={{ maxHeight: '24rem' }}
        {...props}
      >
        {children}
      </div>
    )
  }