"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------- Button ----------
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 hover:bg-accent-cyan/25 hover:shadow-glow",
  secondary:
    "bg-bg-hover text-gray-200 border border-border hover:bg-[#232333]",
  ghost: "text-gray-300 hover:bg-bg-hover hover:text-white",
  danger:
    "bg-accent-red/15 text-accent-red border border-accent-red/40 hover:bg-accent-red/25",
  outline:
    "border border-border text-gray-300 hover:border-accent-cyan/50 hover:text-accent-cyan",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-accent-cyan/40",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

// ---------- Card ----------
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg-card/80 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between p-4 border-b border-border", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

// ---------- Badge ----------
type BadgeTone = "online" | "offline" | "busy" | "neutral" | "cyan" | "purple";
const badgeTones: Record<BadgeTone, string> = {
  online: "bg-accent-green/15 text-accent-green border-accent-green/30",
  offline: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  busy: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  neutral: "bg-bg-hover text-gray-300 border-border",
  cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  purple: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---------- Input ----------
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-border bg-bg-base/60 px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

// ---------- StatusDot ----------
export function StatusDot({ status }: { status: string }) {
  const tone =
    status === "online" ? "bg-accent-green" : status === "busy" ? "bg-accent-amber" : "bg-gray-500";
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {status === "online" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-60" />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", tone)} />
    </span>
  );
}

// ---------- Modal ----------
export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-bg-card shadow-2xl animate-fadeIn",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ---------- Empty state ----------
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      {icon && <div className="mb-3 text-gray-600">{icon}</div>}
      <p className="text-gray-300 font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
