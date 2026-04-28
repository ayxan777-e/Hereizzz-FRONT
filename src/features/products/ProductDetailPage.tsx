import { useMemo, useState } from "react";
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

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await api.get(`/Product/${productId}`);
      return response.data.data as ProductDetail;
    },
    enabled: Number.isFinite(productId) && productId > 0
  });

  const routesQuery = useQuery({
    queryKey: ["routes", productId],
    queryFn: async () => {
      const response = await api.get(`/Routes/${productId}`);
      return response.data.data as RouteResponse;
    },
    enabled: Number.isFinite(productId) && productId > 0
  });

  const routeOptions = useMemo(() => {
    const routes = routesQuery.data;
    if (!routes) return [];

    const options = [
      { option: routes.cheapest, highlight: "cheapest" as const },
      { option: routes.fastest, highlight: "fastest" as const },
      { option: routes.balanced, highlight: "balanced" as const }
    ];

    const unique = new Map<
      number,
      {
        option: CalculationOption;
        highlight: "cheapest" | "fastest" | "balanced";
      }
    >();

    for (const item of options) {
      if (item.option && !unique.has(item.option.shippingOptionId)) {
        unique.set(item.option.shippingOptionId, {
          option: item.option,
          highlight: item.highlight
        });
      }
    }

    return Array.from(unique.values());
  }, [routesQuery.data]);

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!selected) {
        throw new Error("Please select a shipping route.");
      }

      return api.post("/Cart/add-items", {
        productId,
        quantity,
        shippingOptionId: selected.shippingOptionId
      });
    }
  });

  if (productQuery.isLoading || routesQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <EmptyState
        title="Product could not be loaded"
        description="The product may not exist or the backend API is not reachable."
      />
    );
  }

  const product = productQuery.data;

  return (
    <div className="space-y-10">
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
              No image available
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-emerald-300">
              {product.marketplace} • {product.category}
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-white md:text-4xl">
              {product.title}
            </h1>

            {product.description && (
              <p className="mt-4 text-sm leading-6 text-white/60">
                {product.description}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/45">Product price</p>

            <p className="mt-1 text-3xl font-bold text-emerald-300">
              {product.price} {product.currency}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/60">
              <div>Origin: {product.originCountry}</div>
              <div>Weight: {product.weightKg} kg</div>
              <div>Category: {product.category}</div>
            </div>
          </div>

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Open marketplace product
          </a>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-300">
            Delivery routes
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Choose your preferred route
          </h2>
        </div>

        {routesQuery.isError || routeOptions.length === 0 ? (
          <EmptyState
            title="No delivery routes found"
            description="There are no active shipping options for this product yet."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {routeOptions.map(({ option, highlight }) => (
              <RouteCard
                key={`${highlight}-${option.shippingOptionId}`}
                {...option}
                highlight={highlight}
                selected={selected?.shippingOptionId === option.shippingOptionId}
                onSelect={() => setSelected(option)}
              />
            ))}
          </div>
        )}
      </section>

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

      <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-semibold text-white">Ready to add?</h3>

          <p className="mt-1 text-sm text-white/55">
            Select a route, choose quantity, and add the item to your cart.
          </p>

          {!isAuthenticated && (
            <p className="mt-2 text-sm text-yellow-300">
              You must login before adding this product to cart.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.target.value) || 1))
            }
            className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-emerald-400"
          />

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              Login to add
            </Link>
          ) : (
            <Button
              type="button"
              variant="primary"
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