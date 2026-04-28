import Badge from "../ui/Badge";

interface Props {
  status: string;
}

export default function OrderStatusBadge({ status }: Props) {
  const map: Record<string, { label: string; type: "success" | "warning" | "error" | "info" }> = {
    Pending: { label: "Pending", type: "warning" },
    Confirmed: { label: "Confirmed", type: "info" },
    Processing: { label: "Processing", type: "info" },
    Shipped: { label: "Shipped", type: "info" },
    Delivered: { label: "Delivered", type: "success" },
    Cancelled: { label: "Cancelled", type: "error" }
  };

  const data = map[status] ?? { label: status, type: "info" };

  return <Badge type={data.type}>{data.label}</Badge>;
}