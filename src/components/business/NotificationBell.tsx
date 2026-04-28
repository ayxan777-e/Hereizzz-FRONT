import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ["notifications-unread"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get("/Notifications/unread-count");
      return res.data.data as number;
    }
  });

  const unread = data ?? 0;

  return (
    <div className="relative inline-flex items-center">
      <Bell size={18} className="text-white/80" />

      {unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
        >
          {unread > 99 ? "99+" : unread}
        </motion.span>
      )}
    </div>
  );
}