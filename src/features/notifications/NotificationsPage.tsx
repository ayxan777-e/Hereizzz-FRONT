// src/features/notifications/NotificationsPage.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/Notifications");
      return res.data.data;
    }
  });

  const markOne = useMutation({
    mutationFn: (id: number) =>
      api.patch(`/Notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    }
  });

  const markAll = useMutation({
    mutationFn: () => api.patch(`/Notifications/read-all`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    }
  });

  if (notificationsQuery.isLoading) return <LoadingSpinner />;

  const data = notificationsQuery.data;

  if (!data || data.length === 0) {
    return <EmptyState title="No Notifications" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>

        <Button onClick={() => markAll.mutate()} loading={markAll.isPending}>
          Mark all
        </Button>
      </div>

      {data.map((n: any) => (
        <Card
          key={n.id}
          className={`p-6 ${n.isRead ? "opacity-60" : ""}`}
        >
          <h2 className="font-semibold">{n.title}</h2>
          <p className="text-white/70">{n.message}</p>

          {!n.isRead && (
            <Button
              className="mt-3"
              onClick={() => markOne.mutate(n.id)}
              loading={markOne.isPending}
            >
              Mark as read
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}