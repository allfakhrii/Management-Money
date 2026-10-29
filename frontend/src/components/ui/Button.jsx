import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "min-h-[36px] px-3 py-1.5 text-xs gap-1.5",
    md: "min-h-[44px] px-4 py-2 text-sm gap-2",
    lg: "min-h-[48px] px-6 py-2.5 text-base gap-2.5",
  };

  const variantStyles = {
    default:
      "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900 shadow-xs",
    white:
      "bg-white text-slate-950 hover:bg-slate-100 focus-visible:ring-white shadow-sm font-bold",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
    destructive:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600 shadow-xs",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-xs",
  };

  const mergedClasses = twMerge(
    clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
  );

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={mergedClasses}
      {...props}
    >
      {children}
    </button>
  );
}
