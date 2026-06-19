"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/analysis", label: "Analysis" },
    { href: "/learn", label: "Learn" },
  ];

  return (
    <nav style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 8px rgba(0,75,202,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 20 }}>auto_awesome</span>
          </div>
          <span style={{ fontFamily: "Merriweather, serif", fontWeight: 800, fontSize: 20, color: "#131b2e" }}>
            Apply<span style={{ color: "#2563eb" }}>Smart</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                textDecoration: "none",
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#2563eb" : "#475569",
                background: isActive ? "#eff6ff" : "transparent",
                borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent",
                transition: "all 0.15s"
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#eff6ff", borderRadius: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#2563eb" }}>account_circle</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1e40af" }}>{user.name}</span>
              </div>
              <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "#fee2e2", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: "none", padding: "7px 16px", fontSize: 14, fontWeight: 600, color: "#475569" }}>Login</Link>
              <Link href="/register" style={{ textDecoration: "none", padding: "7px 18px", background: "#2563eb", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}