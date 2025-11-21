import * as React from "react";
import { cn } from "./utils";

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Collapsible({
  open,
  onOpenChange,
  children,
  className,
  ...props
}: CollapsibleProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function CollapsibleTrigger({
  children,
  className,
  ...props
}: CollapsibleTriggerProps) {
  return (
    <button className={cn(className)} {...props}>
      {children}
    </button>
  );
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CollapsibleContent({
  children,
  className,
  ...props
}: CollapsibleContentProps) {
  return (
    <div 
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
