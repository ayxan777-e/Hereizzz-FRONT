import Badge from "../ui/Badge";

interface Props {
  status: string;
}

export default function PaymentStatusBadge({ status }: Props) {
  const map: Record<string, { label: string; type: "success" | "warning" | "error" | "info" }> = {
    Pending: { label: "Pending", type: "warning" },
    Paid: { label: "Paid", type: "success" },
    Failed: { label: "Failed", type: "error" }
  };

  const data = map[status] ?? { label: status, type: "info" };

  return <Badge type={data.type}>{data.label}</Badge>;
}