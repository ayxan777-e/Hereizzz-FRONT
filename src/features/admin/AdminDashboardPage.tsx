import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/business/StatCard";

import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from "recharts";

interface MonthlyRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  monthlyRevenue: MonthlyRevenue[];
}

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [year, setYear] = useState(2026);

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard", year],
    queryFn: async () => {
      const res = await api.get(`/Dashboard/admin?year=${year}`);
      return res.data.data as DashboardData;
    },
    enabled: isAdmin
  });

  if (!isAdmin) {
    return (
      <EmptyState
        title="Access denied"
        description="You are not authorized to view this page."
      />
    );
  }

  if (dashboardQuery.isLoading) return <LoadingSpinner />;

  const data = dashboardQuery.data;

  if (!data) {
    return <EmptyState title="No dashboard data available" />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-300">Analytics</p>
          <h1 className="mt-1 text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Overview of revenue, orders, and payment performance.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-white/70">Year:</label>
          <input
            type="number"
            className="w-28 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-emerald-400"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={`${data.totalRevenue} AZN`}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          color="blue"
        />
        <StatCard
          title="Total Payments"
          value={data.totalPayments}
          color="blue"
        />
        <StatCard
          title="Paid Payments"
          value={data.paidPayments}
          color="green"
        />
        <StatCard
          title="Pending Payments"
          value={data.pendingPayments}
          color="yellow"
        />
        <StatCard
          title="Failed Payments"
          value={data.failedPayments}
          color="red"
        />
      </div>

      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Monthly Revenue
        </h2>

        <div className="h-80 w-full">
          <ResponsiveContainer>
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="monthName" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px"
                }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#4ade80" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4ade80"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}