import type { ReactNode } from "react";

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={`glass-light p-4 flex flex-wrap gap-3 items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
