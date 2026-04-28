import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { cn } from "../../utils/cn";

interface FeeItem {
  name: string;
  amount: number;
}

interface RouteCardProps {
  shippingOptionName: string;
  transportType: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  finalPrice: number;
  fees?: FeeItem[];
  highlight?: "cheapest" | "fastest" | "balanced";
  selected?: boolean;
  onSelect?: () => void;
}

export default function RouteCard({
  shippingOptionName,
  transportType,
  estimatedMinDays,
  estimatedMaxDays,
  finalPrice,
  fees = [],
  highlight,
  selected,
  onSelect
}: RouteCardProps) {
  const highlightLabel = {
    cheapest: "Cheapest",
    fastest: "Fastest",
    balanced: "Balanced"
  };

  const highlightClass = {
    cheapest: "border-emerald-400/60",
    fastest: "border-yellow-400/60",
    balanced: "border-cyan-400/60"
  };

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]",
        highlight && highlightClass[highlight],
        selected && "border-emerald-400 bg-emerald-400/10"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{shippingOptionName}</h3>
          <p className="mt-1 text-sm text-white/55">
            {estimatedMinDays}-{estimatedMaxDays} days
          </p>
        </div>

        <Badge type="info">{transportType}</Badge>
      </div>

      {highlight && (
        <Badge
          type={
            highlight === "cheapest"
              ? "success"
              : highlight === "fastest"
              ? "warning"
              : "info"
          }
          className="mb-4"
        >
          {highlightLabel[highlight]}
        </Badge>
      )}

      <div className="mb-4 text-2xl font-bold text-emerald-300">
        {finalPrice} AZN
      </div>

      {fees.length > 0 && (
        <div className="space-y-2 border-t border-white/10 pt-4 text-sm text-white/60">
          {fees.map((fee) => (
            <div key={fee.name} className="flex justify-between gap-4">
              <span>{fee.name}</span>
              <span>{fee.amount} AZN</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}