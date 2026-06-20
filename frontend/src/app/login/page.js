"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "../../lib/config";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#eff6ff 0%,#f0f4ff 50%,#e0e7ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 28 }}>auto_awesome</span>
          </div>
          <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 26, fontWeight: 800, color: "#131b2e", margin: "0 0 6px" }}>
            Apply<span style={{ color: "#2563eb" }}>Smart</span> AI
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Welcome back! Sign in to continue</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 8px 40px rgba(37,99,235,0.1)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontFamily: "Merriweather,serif", fontSize: 22, fontWeight: 700, color: "#131b2e", margin: "0 0 24px" }}>Sign In</h2>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: 18 }}>error</span>
              <span style={{ color: "#dc2626", fontSize: 14 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, color: "#131b2e", outline: "none", transition: "border 0.2s", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, color: "#131b2e", outline: "none", transition: "border 0.2s", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "13px", background: loading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Merriweather,serif" }}
            >
              {loading ? (
                <><span className="material-symbols-outlined" style={{ fontSize: 18, animation: "spin 1s linear infinite" }}>progress_activity</span> Signing in...</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span> Sign In</>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Create one free</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}