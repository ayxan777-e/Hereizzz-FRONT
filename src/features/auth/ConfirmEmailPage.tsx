import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = params.get("userId");
      const token = params.get("token");

      if (!userId || !token) {
        setStatus("error");
        setMessage("Invalid confirmation link.");
        return;
      }

      try {
        const response = await api.get("/Auth/confirm-email", {
          params: { userId, token }
        });

        setStatus("success");
        setMessage(response.data.message || "Email confirmed successfully.");

        // 🔥 AUTO REDIRECT
        setTimeout(() => {
          navigate("/login");
        }, 2500);

      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message || "Email confirmation failed."
        );
      }
    };

    confirmEmail();
  }, [params, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">

        {status === "loading" && (
          <>
            <LoadingSpinner />
            <h1 className="mt-4 text-2xl font-bold text-white">
              Confirming your email...
            </h1>
            <p className="mt-3 text-sm text-white/60">
              Please wait while we verify your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-3xl">
              ✅
            </div>

            <h1 className="text-2xl font-bold text-white">
              Email confirmed
            </h1>

            <p className="mt-3 text-sm text-white/60">
              {message}
            </p>

            <p className="mt-2 text-xs text-white/40">
              Redirecting to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-400/10 text-3xl">
              ❌
            </div>

            <h1 className="text-2xl font-bold text-white">
              Confirmation failed
            </h1>

            <p className="mt-3 text-sm text-white/60">
              {message}
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Go to login
            </Link>
          </>
        )}

      </Card>
    </div>
  );
}