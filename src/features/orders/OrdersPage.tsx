import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/business/OrderStatusBadge";
import { useAuth } from "../../context/AuthContext";

export default function OrdersPage() {
  const { isAdmin } = useAuth();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["orders", page, status, search],
    queryFn: async () => {
      const res = await api.get(
        `/Orders?pageNumber=${page}&pageSize=10&status=${status}&searchTerm=${search}`
      );
      return res.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/Orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] })
  });

  if (ordersQuery.isLoading) return <LoadingSpinner />;

  const data = ordersQuery.data;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title="No orders found"
        description="Try adjusting your filters."
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <h1 className="text-3xl font-bold text-white">Your Orders</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All", value: "" },
            { label: "Pending", value: "Pending" },
            { label: "Confirmed", value: "Confirmed" },
            { label: "Processing", value: "Processing" },
            { label: "Shipped", value: "Shipped" },
            { label: "Delivered", value: "Delivered" },
            { label: "Cancelled", value: "Cancelled" }
          ]}
        />

        <div className="flex items-end">
          <Button onClick={() => setPage(1)}>Apply</Button>
        </div>
      </div>

      <div className="space-y-6">
        {data.items.map((order: any) => (
          <Card key={order.id} className="p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isAdmin ? `Order #${order.id}` : "Your order"}
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  {new Date(order.createdAt).toLocaleString()}
                </p>

                <div className="mt-3">
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-3 text-sm text-white/70">
                  Items: {order.itemCount}
                </div>

                <div className="mt-1 text-lg font-bold text-white">
                  {order.totalPrice} AZN
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
                >
                  View
                </Link>

                <Button
                  variant="outline"
                  onClick={() => deleteMutation.mutate(order.id)}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>

        <Button
          disabled={page >= data.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}