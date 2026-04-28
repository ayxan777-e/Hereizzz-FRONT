import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import api from "../../services/api";
import ProductCard from "../../components/business/ProductCard";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";

interface ProductListItem {
  id: number;
  externalProductId: string;
  title: string;
  price: number;
  currency: string;
  marketplace: string;
  category: string;
  imageUrl?: string | null;
  isActive: boolean;
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 h-36 rounded-xl bg-white/10" />
      <div className="mb-3 h-4 rounded-full bg-white/15" />
      <div className="h-4 w-1/2 rounded-full bg-white/10" />
    </div>
  );
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const marketplace = params.get("marketplace") || "";
  const minPrice = params.get("min") || "";
  const maxPrice = params.get("max") || "";

  const [showFilters, setShowFilters] = useState(false);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    setParams(newParams);
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/Product");
      return response.data.data as ProductListItem[];
    },
  });

  const categories = useMemo(() => {
    const products = data ?? [];
    return Array.from(new Set(products.map((p) => p.category)))
      .filter(Boolean)
      .sort();
  }, [data]);

  const filteredProducts = useMemo(() => {
    const products = data ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.marketplace.toLowerCase().includes(normalizedSearch);

      const matchesCategory = !category || product.category === category;

      const matchesMarketplace =
        !marketplace || product.marketplace === marketplace;

      const matchesMinPrice =
        !minPrice || product.price >= Number(minPrice);

      const matchesMaxPrice =
        !maxPrice || product.price <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMarketplace &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [data, search, category, marketplace, minPrice, maxPrice]);

  const clearFilters = () => {
    setParams({});
  };

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-8 text-center">
        <h2 className="text-xl font-bold text-white">
          Products could not be loaded
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
          Something went wrong while loading products. Please make sure the
          backend API is running and try again.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isFetching ? "Retrying..." : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-emerald-300">Marketplace</p>
          <h1 className="text-3xl font-bold text-white">Products</h1>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <SlidersHorizontal size={18} />
            </motion.div>
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 130, damping: 18 }}
              className="origin-top rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="grid gap-4 md:grid-cols-4">
                <select
                  value={category}
                  onChange={(e) => updateParam("category", e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={marketplace}
                  onChange={(e) => updateParam("marketplace", e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">All marketplaces</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Ebay">Ebay</option>
                  <option value="Trendyol">Trendyol</option>
                </select>

                <Input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => updateParam("min", e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => updateParam("max", e.target.value)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-white/60 hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try different filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}