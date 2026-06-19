"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("⚠️ User already exists! Please login instead.");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess("Account created successfully! Redirecting...");
      login(data.token, data.user);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#eff6ff 0%,#f0f4ff 50%,#e0e7ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 28 }}>auto_awesome</span>
          </div>
          <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 26, fontWeight: 800, color: "#131b2e", margin: "0 0 6px" }}>
            Apply<span style={{ color: "#2563eb" }}>Smart</span> AI
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Create your free account</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 36, boxShadow: "0 8px 40px rgba(37,99,235,0.1)", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontFamily: "Merriweather,serif", fontSize: 22, fontWeight: 700, color: "#131b2e", margin: "0 0 24px" }}>Create Account</h2>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: 18, flexShrink: 0 }}>error</span>
              <span style={{ color: "#dc2626", fontSize: 14 }}>{error}</span>
              {error.includes("already exists") && (
                <Link href="/login" style={{ marginLeft: "auto", color: "#2563eb", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", textDecoration: "none" }}>→ Login</Link>
              )}
            </div>
          )}

          {success && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "#16a34a", fontSize: 18 }}>check_circle</span>
              <span style={{ color: "#16a34a", fontSize: 14 }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
              { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters" },
              { key: "confirm", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: 10, fontSize: 14, color: "#131b2e", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: 8, padding: "13px", background: loading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Merriweather,serif" }}
            >
              {loading ? "Creating account..." : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}