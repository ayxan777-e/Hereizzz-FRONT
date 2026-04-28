import Card from "../ui/Card";

interface PriceBreakdownProps {
  productPrice: number;
  shipping: number;
  customs: number;
  warehouse: number;
  localDelivery: number;
  finalTotal: number;
}

export default function PriceBreakdown({
  productPrice,
  shipping,
  customs,
  warehouse,
  localDelivery,
  finalTotal
}: PriceBreakdownProps) {
  const rows = [
    { label: "Product price", value: productPrice },
    { label: "Shipping", value: shipping },
    { label: "Customs fee", value: customs },
    { label: "Warehouse fee", value: warehouse },
    { label: "Local delivery", value: localDelivery }
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">Price Breakdown</h3>

      <div className="space-y-2 text-sm text-white/65">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span>{row.label}</span>
            <span>{row.value} AZN</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-between gap-4 border-t border-white/10 pt-4 text-lg font-bold text-emerald-300">
        <span>Total</span>
        <span>{finalTotal} AZN</span>
      </div>
    </Card>
  );
}