import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

interface RegisterPayload {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterPayload>({
    fullName: "",
    userName: "",
    email: "",
    password: ""
  });

  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await register(form);
    },
    onSuccess: (message) => {
      setConfirmedEmail(form.email);
      setSuccessMsg(message || "Check your email for confirmation.");
      setErrorMsg("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;

      setErrorMsg(errors?.[0] || message || "Registration failed");
      setSuccessMsg("");
    }
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/Auth/resend-confirmation-email", {
        email: confirmedEmail
      });

      return response.data;
    },
    onSuccess: (res) => {
      setSuccessMsg(res?.message || "Confirmation email sent again.");
      setErrorMsg("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;

      setErrorMsg(
        errors?.[0] || message || "Could not resend confirmation email."
      );
    }
  });

  useEffect(() => {
    if (!successMsg || !confirmedEmail) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get("/Auth/email-confirmation-status", {
          params: {
            email: confirmedEmail
          }
        });

        if (response.data.data === true) {
          clearInterval(interval);
          navigate("/login");
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [successMsg, confirmedEmail, navigate]);

  const setField = (field: keyof RegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.userName.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setErrorMsg("All fields are required.");
      setSuccessMsg("");
      return;
    }

    setErrorMsg("");
    registerMutation.mutate();
  };

  if (successMsg) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />

          <h1 className="text-2xl font-bold text-white">
            Waiting for email confirmation
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-white">{confirmedEmail}</span>.
            Please open your mailbox and confirm your email. After confirmation,
            you will be redirected to login automatically.
          </p>

          {errorMsg && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {errorMsg}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            loading={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            Resend confirmation email
          </Button>

          <Link
            to="/login"
            className="mt-4 inline-flex text-sm text-white/50 hover:text-white"
          >
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Register
        </h1>

        {errorMsg && (
          <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Enter full name"
          />

          <Input
            label="Username"
            value={form.userName}
            onChange={(e) => setField("userName", e.target.value)}
            placeholder="Choose a username"
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="Enter email"
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="Enter password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={registerMutation.isPending}
          >
            Register
          </Button>

          <div className="text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-300 hover:underline">
              Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}