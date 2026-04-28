import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Truck, ShoppingBag, CreditCard, Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const adminLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: Package
  },
  {
    to: "/admin/shipping-options",
    label: "Shipping Options",
    icon: Truck
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag
  },
  {
    to: "/admin/payments",
    label: "Payments",
    icon: CreditCard
  }
];

export default function LayoutAdmin() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0d12] text-white">
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link to="/admin/dashboard" className="text-xl font-bold tracking-wide">
            Hereizzz Admin
          </Link>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2 p-4">
          {adminLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <div className="min-h-screen md:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/30 px-4 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="text-xs text-white/40">Admin area</p>
            <h1 className="text-sm font-semibold text-white">Management Console</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
              <User size={16} className="text-emerald-300" />
              <span className="text-sm text-white/80">
                {user?.fullName || user?.userName || "Admin"}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}