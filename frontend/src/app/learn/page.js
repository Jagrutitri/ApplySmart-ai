"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function LearnPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [resources, setResources] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    const data = sessionStorage.getItem("analysisResult");
    if (data) {
      const parsed = JSON.parse(data);
      setResources(parsed.learning_resources || []);
      setMissingSkills(parsed.missing_skills || []);
    }
  }, [user, authLoading, router]);

  const generalResources = [
    { skill: "Data Structures & Algorithms", channel: "Abdul Bari", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", title: "Data Structures Full Course", duration: "8 hours", topics: ["Arrays", "Trees", "Graphs", "DP"] },
    { skill: "Data Structures & Algorithms", channel: "Love Babbar", url: "https://youtu.be/WQoB2z67hvY?si=q8OMPy4vl-_QaAcb", title: "Data Structures Full Course in C++", duration: "4 days", topics: ["Arrays", "Strings","LinkedList", "Stack", "Queue", "BackTracking", "Trees", "Graphs", "DP"] },
    { skill: "System Design", channel: "Rohit Negi", url: "https://youtu.be/W8kg8h-uIC8?si=5BdBywv7TQDZcAyJ", title: "System Design", duration: "2.5 hour", topics: ["Scalability", "Load Balancing", "Caching"] },
    { skill: "Git & GitHub", channel: "Traversy Media", url: "https://www.youtube.com/watch?v=SWYqp7iY_Tc", title: "Git & GitHub Crash Course", duration: "32 min", topics: ["Commits", "Branching", "Pull Requests"] },
    { skill: "Docker", channel: "TechWorld with Nana", url: "https://www.youtube.com/watch?v=3c-iBn73dDE", title: "Docker Tutorial for Beginners", duration: "3 hours", topics: ["Containers", "Images", "Docker Compose"] },
    { skill: "React.js", channel: "Sheryians Coding School", url: "https://youtu.be/3LRZRSIh_KE?si=8I0ceVkm6pLN_HIR", title: "React-JS Learn Everything", duration: "11 hour", topics: ["Hooks", "State", "Components"] },
    { skill: "Node.js", channel: "Programming with Mosh", url: "https://youtu.be/TlB_eWDSMt4?si=Vp3M2jImZuuaKZiC", title: "Node.js Tutorial for Beginners", duration: "1.5 hours", topics: ["Express", "REST API", "npm"] },
  ];

  const displayResources = resources.length > 0 ? resources : generalResources.map(r => ({
    skill: r.skill,
    why: `${r.skill} is a highly sought-after skill in today's job market.`,
    resource: { title: r.title, channel: r.channel, url: r.url, duration: r.duration },
    topics: r.topics
  }));

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fdf4ff,#f0f4ff)" }}>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 60, padding: "100px 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fdf4ff", border: "1px solid #e9d5ff", borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#9333ea" }}>school</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em" }}>Learning Path</span>
          </div>
          <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 40, fontWeight: 900, color: "#0f172a", margin: "0 0 12px" }}>
            {missingSkills.length > 0 ? "Bridge Your Skill Gaps" : "Recommended Learning Resources"}
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 600, margin: 0, lineHeight: 1.7 }}>
            {missingSkills.length > 0
              ? `You're missing ${missingSkills.length} skills. Here are the best FREE YouTube resources to learn them fast.`
              : "Explore top-rated free YouTube resources to upskill and stay competitive."}
          </p>
        </header>

        {missingSkills.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 32, border: "1px solid #e9d5ff", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>Skills to learn:</span>
            {missingSkills.map(s => (
              <span key={s} style={{ background: "#fdf4ff", color: "#7c3aed", padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
          {displayResources.map((item, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(147,51,234,0.07)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(147,51,234,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(147,51,234,0.07)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "#fdf4ff", color: "#7c3aed", padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{item.skill}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>FREE</span>
                  <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>YouTube</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{item.why}</p>

              <a href={item.resource?.url || "#"} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", gap: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 14, textDecoration: "none", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: 22 }}>play_circle</span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 3px", lineHeight: 1.3 }}>{item.resource?.title}</p>
                  <p style={{ fontSize: 12, color: "#ea580c", margin: 0, fontWeight: 600 }}>{item.resource?.channel}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>⏱ {item.resource?.duration}</p>
                </div>
              </a>

              {item.topics && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginRight: 4 }}>Topics:</span>
                  {item.topics.map(t => (
                    <span key={t} style={{ background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Recommended for your profile</span>
                <a href={item.resource?.url || "#"} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, color: "#7c3aed", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  Watch Now <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Pro tip */}
        <div style={{ marginTop: 40, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", borderRadius: 20, padding: 32, color: "#fff", display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>lightbulb</span>
          </div>
          <div>
            <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 8px", fontSize: 18 }}>Pro Learning Tip</h3>
            <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 700 }}>
              Focus on one skill at a time. Complete the full YouTube course before moving to the next. 
              Build a small project using each skill and add it to your GitHub. This gives you talking points in interviews and makes your resume stand out.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://www.youtube.com/c/freecodecamp" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 18px", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                freeCodeCamp ↗
              </a>
              <a href="https://www.youtube.com/@TraversyMedia" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 18px", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Traversy Media ↗
              </a>
              <a href="https://www.youtube.com/@Fireship" target="_blank" rel="noopener noreferrer"
                style={{ padding: "8px 18px", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Fireship ↗
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}