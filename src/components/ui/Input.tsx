import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm text-white/80">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-400/70 focus:bg-white/10",
          error && "border-red-400/70 focus:border-red-400",
          className
        )}
        {...props}
      />

      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}