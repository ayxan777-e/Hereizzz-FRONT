import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";

interface UserProfile {
  id: string;
  fullName: string;
  userName: string;
  email: string;
}

export default function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/Auth/profile");
      return response.data.data as UserProfile;
    }
  });

  if (profileQuery.isLoading) return <LoadingSpinner />;

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <EmptyState
        title="Profile could not be loaded"
        description="Please login again."
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-medium text-emerald-300">Account</p>
        <h1 className="mt-1 text-3xl font-bold text-white">My Profile</h1>
        <p className="mt-2 text-sm text-white/55">
          Your personal account information.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-2xl font-bold text-emerald-300">
            {profile.fullName?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              {profile.fullName}
            </h2>
            <p className="text-sm text-white/50">@{profile.userName}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-white/40">Full name</p>
            <p className="mt-1 font-medium text-white">{profile.fullName}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-white/40">Username</p>
            <p className="mt-1 font-medium text-white">{profile.userName}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
            <p className="text-xs text-white/40">Email</p>
            <p className="mt-1 font-medium text-white">{profile.email}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}