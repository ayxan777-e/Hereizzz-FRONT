import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/Cart");
      return res.data.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { itemId: number; quantity: number }) =>
      api.put("/Cart/items", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: number) =>
      api.delete("/Cart/items", { data: { itemId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const clearMutation = useMutation({
    mutationFn: async () => api.delete("/Cart"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] })
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/Orders/checkout");
      return res.data.data;
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      window.location.href = `/orders/${orderId}`;
    }
  });

  if (cartQuery.isLoading) return <LoadingSpinner />;

  const cart = cartQuery.data;

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Start by adding products to your cart."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Cart</h1>

        <Button
          variant="outline"
          onClick={() => clearMutation.mutate()}
          loading={clearMutation.isPending}
        >
          Clear Cart
        </Button>
      </div>

      {/* ITEMS */}
      <div className="space-y-6">
        {cart.items.map((item: any) => (
          <Card key={item.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">

              {/* LEFT */}
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-semibold">{item.productTitle}</h2>

                <p className="text-white/70 text-sm">
                  Shipping: {item.shippingOptionName} ({item.transportType})
                </p>

                <p className="text-white/50 text-sm">
                  Delivery: {item.estimatedMinDays}-{item.estimatedMaxDays} days
                </p>

                <div className="mt-3 text-white/70 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Product</span>
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

                <div className="mt-4 text-emerald-400 text-lg font-bold">
                  Total: {item.finalPrice * item.quantity} AZN
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-4">

                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateMutation.mutate({
                      itemId: item.id,
                      quantity: Number(e.target.value)
                    })
                  }
                  className="w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                />

                <button
                  onClick={() => removeMutation.mutate(item.id)}
                  className="p-2 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SUMMARY */}
      <Card className="p-6">
        <div className="flex justify-between text-xl font-bold">
          <span>Total Price:</span>
          <span className="text-emerald-400">
            {cart.totalPrice} AZN
          </span>
        </div>

        <Button
          variant="primary"
          className="mt-6"
          onClick={() => checkoutMutation.mutate()}
          loading={checkoutMutation.isPending}
        >
          Checkout
        </Button>
      </Card>
    </div>
  );
}