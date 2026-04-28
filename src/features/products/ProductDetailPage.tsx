import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PriceBreakdown from "../../components/business/PriceBreakdown";
import RouteCard from "../../components/business/RouteCard";

interface ProductDetail {
  id: number;
  externalProductId: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  marketplace: string;
  originCountry: string;
  weightKg: number;
  category: string;
  imageUrl?: string | null;
  affiliateUrl: string;
}

interface FeeItem {
  name: string;
  amount: number;
}

interface CalculationOption {
  productId: number;
  productTitle: string;
  shippingOptionId: number;
  shippingOptionName: string;
  productPrice: number;
  shippingCost: number;
  customsFee: number;
  warehouseFee: number;
  localDeliveryFee: number;
  finalPrice: number;
  transportType: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  fees: FeeItem[];
}

interface RouteResponse {
  cheapest: CalculationOption | null;
  fastest: CalculationOption | null;
  balanced: CalculationOption | null;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const productId = Number(id);

  const [selected, setSelected] = useState<CalculationOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await api.get(`/Product/${productId}`);
      return res.data.data as ProductDetail;
    },
    enabled: productId > 0
  });

  const routesQuery = useQuery({
    queryKey: ["routes", productId],
    queryFn: async () => {
      const res = await api.get(`/Routes/${productId}`);
      return res.data.data as RouteResponse;
    },
    enabled: productId > 0
  });

  const routeOptions = useMemo(() => {
    const routes = routesQuery.data;
    if (!routes) return [];

    // 🔥 düzgün sıra
    const options = [
      { option: routes.cheapest, highlight: "cheapest" as const },
      { option: routes.balanced, highlight: "balanced" as const },
      { option: routes.fastest, highlight: "fastest" as const }
    ];

    const unique = new Map<number, any>();

    for (const item of options) {
      if (item.option && !unique.has(item.option.shippingOptionId)) {
        unique.set(item.option.shippingOptionId, item);
      }
    }

    return Array.from(unique.values());
  }, [routesQuery.data]);

  // 🔥 Balanced default seçilir
  useEffect(() => {
    if (!selected && routesQuery.data?.balanced) {
      setSelected(routesQuery.data.balanced);
    }
  }, [routesQuery.data, selected]);

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Select route");

      return api.post("/Cart/add-items", {
        productId,
        quantity,
        shippingOptionId: selected.shippingOptionId
      });
    },
    onSuccess: () => {
      setSuccessMessage("Added to cart successfully 🎉");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  });

  if (productQuery.isLoading || routesQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <EmptyState
        title="Product could not be loaded"
        description="The product may not exist or backend is down."
      />
    );
  }

  const product = productQuery.data;

  return (
    <div className="space-y-10">
      {/* TOP */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-[420px] w-full object-cover"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-white/40">
              No image
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-emerald-300">
              {product.marketplace} • {product.category}
            </p>

            <h1 className="text-3xl font-bold text-white">
              {product.title}
            </h1>

            {product.description && (
              <p className="mt-3 text-white/60">{product.description}</p>
            )}
          </div>

          <Card className="p-5">
            <p className="text-white/50">Product price</p>
            <p className="text-3xl font-bold text-emerald-300">
              {product.price} {product.currency}
            </p>

            <div className="mt-4 text-sm text-white/60 grid grid-cols-2 gap-2">
              <div>Origin: {product.originCountry}</div>
              <div>Weight: {product.weightKg} kg</div>
            </div>
          </Card>

          <a
            href={product.affiliateUrl}
            target="_blank"
            className="inline-flex px-4 py-2 border rounded-xl text-white/70 hover:bg-white/10"
          >
            Open marketplace product
          </a>
        </div>
      </div>

      {/* ROUTES */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Choose delivery route
        </h2>

        {routeOptions.length === 0 ? (
          <EmptyState title="No routes found" description="Try later." />
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {routeOptions.map(({ option, highlight }) => (
              <RouteCard
                key={option.shippingOptionId}
                {...option}
                highlight={highlight}
                selected={
                  selected?.shippingOptionId === option.shippingOptionId
                }
                onSelect={() => setSelected(option)}
              />
            ))}
          </div>
        )}
      </section>

      {/* PRICE */}
      {selected && (
        <PriceBreakdown
          productPrice={selected.productPrice}
          shipping={selected.shippingCost}
          customs={selected.customsFee}
          warehouse={selected.warehouseFee}
          localDelivery={selected.localDeliveryFee}
          finalTotal={selected.finalPrice}
        />
      )}

      {/* ADD */}
      <Card className="flex flex-col md:flex-row justify-between gap-4 p-5">
        <div>
          <p className="text-white font-semibold">Ready to order?</p>

          {!isAuthenticated && (
            <p className="text-yellow-300 text-sm">
              Login required
            </p>
          )}

          {successMessage && (
            <p className="text-green-400 text-sm mt-2">
              {successMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Number(e.target.value)))
            }
            className="w-20 px-3 py-2 bg-white/5 text-white border rounded-xl"
          />

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="px-4 py-2 bg-emerald-400 rounded-xl text-black"
            >
              Login
            </Link>
          ) : (
            <Button
              disabled={!selected}
              loading={addToCart.isPending}
              onClick={() => addToCart.mutate()}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}