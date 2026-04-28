import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [emailOrUserName, setEmailOrUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      await login(emailOrUserName, password);
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message;
      const errors = err?.response?.data?.errors;

      setErrorMsg(errors?.[0] || message || "Login failed");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrUserName.trim() || !password.trim()) {
      setErrorMsg("Email/username and password are required.");
      return;
    }

    setErrorMsg("");
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Login
        </h1>

        {errorMsg && (
          <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300">
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email or Username"
            value={emailOrUserName}
            onChange={(e) => setEmailOrUserName(e.target.value)}
            placeholder="Enter email or username"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loginMutation.isPending}
          >
            Login
          </Button>

          <div className="text-center text-sm text-white/70">
            Don't have an account?{" "}
            <Link to="/register" className="text-cyan-300 hover:underline">
              Register
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}