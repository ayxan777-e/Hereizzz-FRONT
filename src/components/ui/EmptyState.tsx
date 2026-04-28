import React from "react";
import Card from "./Card";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  children
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
          {description}
        </p>
      )}

      {children && <div className="mt-6">{children}</div>}
    </Card>
  );
}