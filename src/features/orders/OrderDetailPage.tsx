import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import OrderStatusBadge from "../../components/business/OrderStatusBadge";
import { useAuth } from "../../context/AuthContext";

const statusOptions = [
  { label: "Confirmed", value: "Confirmed" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" }
];

function canTransition(current: string, next: string) {
  const rules: Record<string, string[]> = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Delivered"],
    Delivered: [],
    Cancelled: []
  };

  return rules[current]?.includes(next) ?? false;
}

function getAllowedStatusOptions(current: string) {
  return statusOptions.filter((option) => canTransition(current, option.value));
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusError, setStatusError] = useState("");

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/Orders/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      return api.patch(`/Orders/${id}/status`, {
        status: selectedStatus
      });
    },
    onSuccess: () => {
      setStatusError("");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;

      setStatusError(errors?.[0] || message || "Status could not be updated.");
    }
  });

  useEffect(() => {
    if (orderQuery.data?.status) {
      const allowed = getAllowedStatusOptions(orderQuery.data.status);
      setSelectedStatus(allowed[0]?.value || "");
      setStatusError("");
    }
  }, [orderQuery.data?.status]);

  if (orderQuery.isLoading) return <LoadingSpinner />;

  const order = orderQuery.data;

  if (!order) return null;

  const allowedStatusOptions = getAllowedStatusOptions(order.status);
  const hasAllowedTransitions = allowedStatusOptions.length > 0;
  const isAllowedTransition = canTransition(order.status, selectedStatus);

  const handleUpdateStatus = () => {
    if (!hasAllowedTransitions) {
      setStatusError("This order is final. Status can no longer be changed.");
      return;
    }

    if (!selectedStatus) {
      setStatusError("Please select a status.");
      return;
    }

    if (!isAllowedTransition) {
      setStatusError(
        `Cannot change status from ${order.status} to ${selectedStatus}.`
      );
      return;
    }

    setStatusError("");
    updateStatusMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <h1 className="text-3xl font-bold text-white">
        {isAdmin ? `Order #${order.id}` : "Order details"}
      </h1>

      <Card className="p-6">
        <div className="flex justify-between">
          <span>Status</span>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-2 flex justify-between">
          <span>Created</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        <div className="mt-4 flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-emerald-400">{order.totalPrice} AZN</span>
        </div>

        {isAdmin && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Admin actions
            </h3>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              {hasAllowedTransitions ? (
                <Select
                  label="Change status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setStatusError("");
                  }}
                  options={allowedStatusOptions}
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                  This order is final. Status can no longer be changed.
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                disabled={!hasAllowedTransitions || updateStatusMutation.isPending}
                loading={updateStatusMutation.isPending}
                onClick={handleUpdateStatus}
              >
                Update Status
              </Button>
            </div>

            {statusError && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {statusError}
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-6">
        {order.items.map((item: any) => (
          <Card key={item.id} className="p-6">
            <h2 className="text-lg font-semibold text-white">
              {item.productTitle}
            </h2>

            <p className="mt-1 text-sm text-white/60">
              {item.shippingOptionName} ({item.transportType})
            </p>

            <p className="text-sm text-white/60">
              {item.estimatedMinDays}-{item.estimatedMaxDays} days
            </p>

            <div className="mt-3 space-y-1 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Unit</span>
                <span>{item.unitPrice} AZN</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{item.shippingCost} AZN</span>
              </div>

              <div className="flex justify-between">
                <span>Customs</span>
                <span>{item.customsFee} AZN</span>
              </div>

              <div className="flex justify-between">
                <span>Warehouse</span>
                <span>{item.warehouseFee} AZN</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{item.localDeliveryFee} AZN</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span className="text-emerald-400">
                {item.finalPrice * item.quantity} AZN
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}