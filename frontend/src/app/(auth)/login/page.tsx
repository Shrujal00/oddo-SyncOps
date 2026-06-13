"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../../../features/auth";
import { useAppStore } from "../../../store/app-store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAppStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.accessToken, res.user);
      document.cookie = `syncops-token=${res.accessToken}; path=/; max-age=86400; SameSite=Lax`;
      router.push("/overview");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-[400px] bg-elevated rounded-2xl border border-border p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10M5 8V17H15V8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-1">SyncOps</h1>
          <p className="text-sm text-text-2 mt-0.5">From Demand to Delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@syncops.dev"
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              required
              suppressHydrationWarning
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-text-3 mt-6">
          SyncOps ERP - Internal use only
        </p>
      </div>
    </div>
  );
}
