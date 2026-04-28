import React from "react";
import { cn } from "../../utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export default function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm text-white/80">
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:bg-white/10",
          error && "border-red-400/70 focus:border-red-400",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0a0d12] text-white">
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}