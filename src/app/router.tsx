import { Routes, Route } from "react-router-dom";
import LayoutPublic from "../components/layout/LayoutPublic";
import LayoutAdmin from "../components/layout/LayoutAdmin";

import HomePage from "../features/public/HomePage";
import ProductsPage from "../features/products/ProductsPage";
import ProductDetailPage from "../features/products/ProductDetailPage";
import CartPage from "../features/cart/CartPage";
import OrdersPage from "../features/orders/OrdersPage";
import OrderDetailPage from "../features/orders/OrderDetailPage";
import PaymentsPage from "../features/payments/PaymentsPage";
import NotificationsPage from "../features/notifications/NotificationsPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ConfirmEmailPage from "../features/auth/ConfirmEmailPage";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import ProfilePage from "../features/profile/ProfilePage";
import AdminDashboardPage from "../features/admin/AdminDashboardPage";


function AdminDashboard() {
  return <div className="text-2xl font-bold text-white">Admin Dashboard</div>;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<LayoutPublic />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

          <Route
           path="/admin/dashboard"
           element={
            <ProtectedRoute>
              <AdminDashboardPage />
              </ProtectedRoute>
          }
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/admin" element={<LayoutAdmin />}>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}