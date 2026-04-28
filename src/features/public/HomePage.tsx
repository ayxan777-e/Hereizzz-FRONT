import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import ProductCard from "../../components/business/ProductCard";
import Card from "../../components/ui/Card";
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

export default function HomePage() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const response = await api.get("/Product");
      return response.data.data as ProductListItem[];
    },
  });

  const featuredProducts = useMemo(() => {
    return (data ?? [])
      .filter((product) => product.isActive === true)
      .slice(0, 4);
  }, [data]);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center shadow-2xl md:px-10 md:py-28">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Hereizzz
          </p>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            Shop globally.
            <br />
            <span className="text-emerald-300">Know your final price.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
            Compare delivery routes, calculate real costs, and order smarter
            with transparent shipping, customs, warehouse, and local delivery
            fees.
          </p>

          <div className="mx-auto mt-10 max-w-md">
            <Input
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={
                query.trim()
                  ? `/products?search=${encodeURIComponent(query)}`
                  : "/products"
              }
              className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
            >
              Start Shopping Smart
            </Link>

            <Link
              to="/register"
              className="rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-300">Preview</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              Featured Products
            </h2>
          </div>

          <Link
            to="/products"
            className="text-sm font-medium text-white/60 hover:text-white"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <Card key={index} className="p-4">
                <div className="mb-4 h-36 rounded-2xl bg-white/10" />
                <div className="mb-3 h-4 rounded-full bg-white/15" />
                <div className="h-4 w-1/2 rounded-full bg-white/10" />
              </Card>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                currency={product.currency}
                marketplace={product.marketplace}
                category={product.category}
                imageUrl={product.imageUrl}
              />
            ))
          ) : (
            <p className="text-sm text-white/50">
              No active featured products found.
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-300">
            Smart logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Route comparison before checkout
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
  
  {/* Cheapest */}
  <Card className="p-6 opacity-80 transition hover:opacity-100">
    <h3 className="text-lg font-bold text-white">Cheapest Route</h3>
    <p className="mt-2 text-sm text-white/60">
      Pick the lowest final cost after product, shipping, and all fees.
    </p>
  </Card>

  {/*BALANCED (MAIN - SARI HIGHLIGHT) */}
  <Card className="scale-105 border-2 border-yellow-400 p-6 shadow-lg shadow-yellow-400/10">
    <h3 className="text-lg font-bold text-white">Balanced Option</h3>
    <p className="mt-2 text-sm text-white/70">
      Get the best mix of speed and price for smarter shopping.
    </p>
  </Card>

  {/* Fastest */}
  <Card className="p-6 opacity-80 transition hover:opacity-100">
    <h3 className="text-lg font-bold text-white">Fastest Route</h3>
    <p className="mt-2 text-sm text-white/60">
      Choose the shortest estimated delivery window.
    </p>
  </Card>

</div>
      </section>
    </div>
  );
}