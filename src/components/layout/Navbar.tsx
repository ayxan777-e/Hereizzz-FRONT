import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, User, ShoppingCart, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../business/NotificationBell";
import Button from "../ui/Button";
import {
  startNotificationConnection,
  stopNotificationConnection
} from "../../services/notificationHub";

export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const userId =
      user.sub ||
      user.nameid ||
      user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      user["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"];

    if (!userId) return;

    startNotificationConnection(userId, () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      stopNotificationConnection();
    };
  }, [isAuthenticated, user, queryClient]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/15 text-white"
        : "text-white/75 hover:bg-white/10 hover:text-white"
    }`;

  const closeMenus = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate("/login");
  };

  const displayName =
    user?.fullName ||
    user?.["fullName"] ||
    user?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    "Account";

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/40 shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          onClick={closeMenus}
          className="text-2xl font-bold tracking-wide text-white"
        >
          Hereizzz
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/cart" className={navClass}>
                <span className="inline-flex items-center gap-1">
                  <ShoppingCart size={16} />
                  Cart
                </span>
              </NavLink>

              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>

              <Link
                to="/notifications"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 transition hover:bg-white/10"
              >
                <NotificationBell />
              </Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>

              <Link
                to="/register"
                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <User size={18} />
                <span className="max-w-32 truncate">{displayName}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0a0d12] p-2 shadow-2xl">
                  <NavLink
                    to="/profile"
                    onClick={closeMenus}
                    className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    Profile
                  </NavLink>

                  <NavLink
                    to="/orders"
                    onClick={closeMenus}
                    className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    Orders
                  </NavLink>

                  <NavLink
                    to="/payments"
                    onClick={closeMenus}
                    className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    Payments
                  </NavLink>

                  {isAdmin && (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2 text-sm text-cyan-300 hover:bg-white/10"
                    >
                      Admin Dashboard
                    </NavLink>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {isAdmin && isAuthenticated && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-cyan-400/15 text-cyan-300"
                    : "text-cyan-300 hover:bg-cyan-400/10"
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            <NavLink to="/" className={navClass} onClick={closeMenus}>
              Home
            </NavLink>

            <NavLink to="/products" className={navClass} onClick={closeMenus}>
              Products
            </NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={navClass} onClick={closeMenus}>
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className={navClass}
                  onClick={closeMenus}
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/cart" className={navClass} onClick={closeMenus}>
                  Cart
                </NavLink>

                <NavLink to="/orders" className={navClass} onClick={closeMenus}>
                  Orders
                </NavLink>

                <NavLink
                  to="/payments"
                  className={navClass}
                  onClick={closeMenus}
                >
                  Payments
                </NavLink>

                <NavLink
                  to="/notifications"
                  className={navClass}
                  onClick={closeMenus}
                >
                  Notifications
                </NavLink>

                <NavLink
                  to="/profile"
                  className={navClass}
                  onClick={closeMenus}
                >
                  Profile
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin/dashboard"
                    className={`${navClass({ isActive: false })} text-cyan-300`}
                    onClick={closeMenus}
                  >
                    Admin Dashboard
                  </NavLink>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}