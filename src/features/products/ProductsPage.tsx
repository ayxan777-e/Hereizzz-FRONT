import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import api from "../../services/api";
import ProductCard from "../../components/business/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
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

export default function ProductsPage() {
  const [params] = useSearchParams();
  const queryFromUrl = params.get("search") || "";

  const [search, setSearch] = useState(queryFromUrl);
  const [showFilters, setShowFilters] = useState(false);

  const [category, setCategory] = useState("");
  const [marketplace, setMarketplace] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setSearch(queryFromUrl);
  }, [queryFromUrl]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/Product");
      return response.data.data as ProductListItem[];
    },
  });

  const categories = useMemo(() => {
    const products = data ?? [];
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
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
    setCategory("");
    setMarketplace("");
    setMinPrice("");
    setMaxPrice("");
  };

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <EmptyState
        title="Products could not be loaded"
        description="Please check backend API."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
        </div>

        {/* SEARCH + FILTER BUTTON */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
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

        {/* ANIMATED FILTER PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -10,
              }}
              transition={{
                type: "spring",
                stiffness: 130,
                damping: 18,
              }}
              className="origin-top rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="grid gap-4 md:grid-cols-4">
                {/* CATEGORY */}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                {/* MARKETPLACE */}
                <select
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
                >
                  <option value="">All marketplaces</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Ebay">Ebay</option>
                  <option value="Trendyol">Trendyol</option>
                </select>

                {/* MIN PRICE */}
                <Input
                  type="number"
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                {/* MAX PRICE */}
                <Input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
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

      {/* RESULTS */}
      {filteredProducts.length === 0 ? (
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