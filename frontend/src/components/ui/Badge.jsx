import React from "react";

export function Badge({
  children,
  variant = "neutral",
  className = "",
}) {
  const variantStyles = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    income: "bg-emerald-50 text-emerald-700 border-emerald-200",
    expense: "bg-rose-50 text-rose-700 border-rose-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    brand: "bg-slate-900 text-white border-slate-900",
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
