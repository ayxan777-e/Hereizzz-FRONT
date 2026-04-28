import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
        <div>
          <h2 className="text-xl font-bold tracking-wide">Hereizzz</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
            A premium cross-border shopping assistant for transparent prices,
            smart route selection, and easier international orders.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Platform</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/60">
            <Link to="/products" className="hover:text-white">
              Products
            </Link>
            <Link to="/cart" className="hover:text-white">
              Cart
            </Link>
            <Link to="/orders" className="hover:text-white">
              Orders
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Promise</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Know the real final price before checkout. Compare cheapest,
            fastest, and balanced delivery options.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Hereizzz. All rights reserved.
      </div>
    </footer>
  );
}