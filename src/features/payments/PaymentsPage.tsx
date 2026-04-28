import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PaymentStatusBadge from "../../components/business/PaymentStatusBadge";
import { useAuth } from "../../context/AuthContext";

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  transactionId?: string;
}

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const paymentsQuery = useQuery({
    queryKey: ["payments-my"],
    queryFn: async () => {
      const res = await api.get("/Payments/my");
      return res.data.data as Payment[];
    }
  });

  const payMutation = useMutation({
    mutationFn: async (id: number) => api.post(`/Payments/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments-my"] });
    }
  });

  if (paymentsQuery.isLoading) return <LoadingSpinner />;

  const payments = paymentsQuery.data;

  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        title="No Payments Found"
        description="You have no payments yet."
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <h1 className="text-3xl font-bold text-white">Your Payments</h1>

      <div className="space-y-6">
        {payments.map((payment) => (
          <Card key={payment.id} className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isAdmin ? `Payment #${payment.id}` : "Payment"}
                </h2>

                {isAdmin && (
                  <p className="mt-1 text-sm text-white/50">
                    Order ID: {payment.orderId}
                  </p>
                )}

                <div className="mt-3">
                  <PaymentStatusBadge status={payment.status} />
                </div>

                <div className="mt-3 text-lg font-bold text-white">
                  {payment.amount} AZN
                </div>

                <p className="mt-1 text-sm text-white/50">
                  Method: {payment.method}
                </p>
              </div>

              <div className="space-y-2 text-sm text-white/70">
                <div>
                  <span className="text-white/40">Created: </span>
                  <span>{new Date(payment.createdAt).toLocaleString()}</span>
                </div>

                {payment.paidAt && (
                  <div>
                    <span className="text-white/40">Paid: </span>
                    <span>{new Date(payment.paidAt).toLocaleString()}</span>
                  </div>
                )}

                {isAdmin && payment.transactionId && (
                  <div className="break-all">
                    <span className="text-white/40">Transaction ID: </span>
                    <span>{payment.transactionId}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-end">
                {payment.status === "Pending" ? (
                  <Button
                    variant="primary"
                    onClick={() => payMutation.mutate(payment.id)}
                    loading={payMutation.isPending}
                  >
                    Pay Now
                  </Button>
                ) : (
                  <span className="text-sm text-white/40">No action</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}