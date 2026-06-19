"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { downloadAnalysisPDF } from "../../lib/generatePDF";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function AnalysisPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const data = sessionStorage.getItem("analysisResult");
    if (!data) { router.push("/dashboard"); return; }
    setResult(JSON.parse(data));
  }, [router]);

  if (!result) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4ff" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#2563eb" }}>progress_activity</span>
    </div>
  );

  const { match_score, matched_skills, missing_skills, important_keywords, feedback, learning_resources, ats_analysis, keyword_analysis, tone_analysis } = result;

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (match_score / 100) * circumference;
  const matchLabel = match_score >= 80 ? "Excellent Match" : match_score >= 60 ? "Strong Match" : match_score >= 40 ? "Moderate Match" : "Needs Work";
  const matchColor = match_score >= 80 ? "#16a34a" : match_score >= 60 ? "#2563eb" : match_score >= 40 ? "#d97706" : "#dc2626";
  const percentile = Math.min(99, Math.round(40 + match_score * 0.59));

  const ScoreBar = ({ label, score, color }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "ats", label: "ATS Check", icon: "data_thresholding" },
    { id: "keywords", label: "Keywords", icon: "psychology" },
    { id: "tone", label: "Tone Analysis", icon: "history_edu" },
    { id: "learn", label: "Learning Path", icon: "school" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff,#e8f0fe)" }}>
      <Navbar />
      <main style={{ paddingTop: 88, paddingBottom: 60, maxWidth: 1100, margin: "0 auto", padding: "88px 24px 60px" }}>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>Analysis Completed</span>
          <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 36, fontWeight: 900, color: "#0f172a", margin: "0 0 10px" }}>Job Match Results</h1>
          <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>Full breakdown of your resume against the job description.</p>
        </header>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 14, padding: 6, marginBottom: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s",
                background: activeTab === tab.id ? "#2563eb" : "transparent",
                color: activeTab === tab.id ? "#fff" : "#64748b" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 24 }}>
              {/* Score Circle */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(37,99,235,0.07)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#64748b", marginBottom: 24, fontSize: 15 }}>Overall Match Score</h3>
                <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="192" height="192" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="96" cy="96" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="14" />
                    <circle cx="96" cy="96" r={radius} fill="transparent" stroke={matchColor} strokeWidth="14"
                      strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <span style={{ fontFamily: "Merriweather,serif", fontSize: 48, fontWeight: 900, color: "#0f172a", display: "block" }}>{match_score}%</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: matchColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>{matchLabel}</span>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ color: "#16a34a", fontSize: 18 }}>verified</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Surpasses {percentile}% of applicants</span>
                </div>
                {/* Quick scores */}
                <div style={{ width: "100%", marginTop: 24, display: "flex", gap: 8 }}>
                  {[
                    { label: "ATS", score: ats_analysis?.ats_score || 0, color: "#2563eb" },
                    { label: "Keywords", score: keyword_analysis?.keyword_score || 0, color: "#9333ea" },
                    { label: "Tone", score: tone_analysis?.tone_score || 0, color: "#16a34a" },
                  ].map(item => (
                    <div key={item.label} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: item.color, margin: "0 0 2px", fontFamily: "Merriweather,serif" }}>{item.score}%</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 600 }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Feedback */}
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(37,99,235,0.07)", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: "#eff6ff", borderRadius: 10, padding: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: "#2563eb", fontSize: 22 }}>auto_awesome</span>
                  </div>
                  <h3 style={{ fontFamily: "Merriweather,serif", fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>AI Analysis Feedback</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {feedback.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "Merriweather,serif", fontWeight: 700, color: "#2563eb", fontSize: 14 }}>{i + 1}</div>
                      <div>
                        <p style={{ fontWeight: 700, margin: "0 0 4px", color: "#0f172a", fontSize: 14 }}>{item.title}</p>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: 0, color: "#0f172a", fontSize: 15 }}>Skills You Have</h4>
                  <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{matched_skills.length} Matched</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {matched_skills.length === 0 && <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>No matched skills found.</p>}
                  {matched_skills.map(s => <span key={s} style={{ background: "#f0fdf4", color: "#15803d", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>{s}</span>)}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: 0, color: "#0f172a", fontSize: 15 }}>Missing Skills</h4>
                  <span style={{ background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{missing_skills.length} Missing</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {missing_skills.length === 0 && <p style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>🎉 No missing skills!</p>}
                  {missing_skills.map(s => <span key={s} style={{ background: "#fef2f2", color: "#dc2626", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>{s}</span>)}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: 0, color: "#0f172a", fontSize: 15 }}>Important Keywords</h4>
                  <span style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Top Keywords</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {important_keywords.map(kw => <span key={kw} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>key</span>{kw}</span>)}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "2fr 3fr", overflow: "hidden" }}>
              <div style={{ padding: 28, borderRight: "1px solid #f1f5f9" }}>
                <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#0f172a", margin: "0 0 6px", fontSize: 16 }}>Summary</h4>
                {[{ label: "Match Score", value: `${match_score}%` }, { label: "ATS Score", value: `${ats_analysis?.ats_score || "—"}%` }, { label: "Keyword Score", value: `${keyword_analysis?.keyword_score || "—"}%` }, { label: "Tone Score", value: `${tone_analysis?.tone_score || "—"}%` }].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                    <span style={{ color: "#64748b" }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 28, background: "rgba(255,255,255,0.6)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h5 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>Ready to improve your resume?</h5>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Check the ATS, Keywords, and Tone tabs for detailed improvement suggestions.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => router.push("/dashboard")} style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Merriweather,serif" }}>Analyze Another</button>
                  <button onClick={() => setActiveTab("learn")} style={{ padding: "10px 20px", background: "#fdf4ff", color: "#9333ea", border: "1px solid #e9d5ff", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>View Learning Path</button>
                  <button onClick={() => downloadAnalysisPDF(result)} style={{ padding: "10px 20px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Download</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ATS TAB ── */}
        {activeTab === "ats" && ats_analysis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #e2e8f0", textAlign: "center" }}>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#64748b", marginBottom: 24, fontSize: 15 }}>ATS Score</h3>
                <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px", background: `conic-gradient(${ats_analysis.ats_score >= 70 ? "#16a34a" : ats_analysis.ats_score >= 50 ? "#d97706" : "#dc2626"} ${ats_analysis.ats_score * 3.6}deg, #f1f5f9 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontFamily: "Merriweather,serif", fontSize: 28, fontWeight: 900, color: "#0f172a" }}>{ats_analysis.ats_score}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>/ 100</span>
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: ats_analysis.grade === "A" ? "#f0fdf4" : ats_analysis.grade === "B" ? "#eff6ff" : "#fef2f2", padding: "6px 16px", borderRadius: 20 }}>
                  <span style={{ fontFamily: "Merriweather,serif", fontSize: 20, fontWeight: 900, color: ats_analysis.grade === "A" ? "#16a34a" : ats_analysis.grade === "B" ? "#2563eb" : "#dc2626" }}>Grade {ats_analysis.grade}</span>
                </div>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 16, lineHeight: 1.6 }}>{ats_analysis.summary}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ats_analysis.passed_checks?.length > 0 && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: 20 }}>
                    <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#15803d", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> Passed Checks
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {ats_analysis.passed_checks.map((check, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span className="material-symbols-outlined" style={{ color: "#16a34a", fontSize: 16, flexShrink: 0, marginTop: 1 }}>done</span>
                          <span style={{ fontSize: 13, color: "#166534" }}>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ats_analysis.issues?.length > 0 && (
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
                    <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#0f172a", margin: "0 0 14px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#dc2626" }}>warning</span> Issues to Fix
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {ats_analysis.issues.map((issue, i) => (
                        <div key={i} style={{ background: issue.severity === "high" ? "#fef2f2" : issue.severity === "medium" ? "#fff7ed" : "#f8fafc", borderRadius: 10, padding: 14, borderLeft: `3px solid ${issue.severity === "high" ? "#dc2626" : issue.severity === "medium" ? "#d97706" : "#64748b"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "#0f172a" }}>{issue.issue}</p>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: issue.severity === "high" ? "#fecaca" : issue.severity === "medium" ? "#fed7aa" : "#e2e8f0", color: issue.severity === "high" ? "#dc2626" : issue.severity === "medium" ? "#d97706" : "#64748b", textTransform: "uppercase" }}>{issue.severity}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Fix: {issue.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── KEYWORDS TAB ── */}
        {activeTab === "keywords" && keyword_analysis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 20px", color: "#0f172a" }}>Keyword Scores</h3>
                <ScoreBar label="Overall Keyword Match" score={keyword_analysis.keyword_score} color="#9333ea" />
                <ScoreBar label="Keyword Density" score={keyword_analysis.density_score} color="#2563eb" />
                <div style={{ marginTop: 20, background: "#fdf4ff", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 13, color: "#7c3aed", margin: 0, lineHeight: 1.6 }}>💡 {keyword_analysis.recommendation}</p>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 20px", color: "#0f172a" }}>High Priority Keywords</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {keyword_analysis.high_priority?.map((kw, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: kw.in_resume ? "#f0fdf4" : "#fef2f2", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{kw.keyword}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: kw.in_resume ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{kw.in_resume ? "check_circle" : "cancel"}</span>
                        {kw.in_resume ? "Found" : "Missing"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 16px", color: "#0f172a", fontSize: 16 }}>Medium Priority Keywords</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {keyword_analysis.medium_priority?.map((kw, i) => (
                  <span key={i} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: kw.in_resume ? "#eff6ff" : "#f8fafc", color: kw.in_resume ? "#2563eb" : "#94a3b8", border: `1px solid ${kw.in_resume ? "#bfdbfe" : "#e2e8f0"}`, display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{kw.in_resume ? "check" : "add"}</span>{kw.keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TONE TAB ── */}
        {activeTab === "tone" && tone_analysis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, margin: "0 0 8px", color: "#0f172a" }}>Tone Scores</h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdf4", padding: "6px 14px", borderRadius: 20, marginBottom: 20 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#16a34a" }}>record_voice_over</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", textTransform: "capitalize" }}>{tone_analysis.tone_type} Tone</span>
                </div>
                <ScoreBar label="Overall Tone" score={tone_analysis.tone_score} color="#16a34a" />
                <ScoreBar label="Authority & Confidence" score={tone_analysis.authority_score} color="#2563eb" />
                <ScoreBar label="Clarity & Readability" score={tone_analysis.clarity_score} color="#9333ea" />
                <ScoreBar label="Action Verbs Usage" score={tone_analysis.action_verbs_score} color="#d97706" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#0f172a", margin: "0 0 12px", fontSize: 15 }}>Overall Assessment</h4>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>{tone_analysis.overall_assessment}</p>
                </div>
                {tone_analysis.strengths?.length > 0 && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: 20 }}>
                    <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#15803d", margin: "0 0 12px", fontSize: 14 }}>✓ Strengths</h4>
                    {tone_analysis.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#166534", margin: "0 0 6px", display: "flex", gap: 8 }}><span>→</span>{s}</p>)}
                  </div>
                )}
                {tone_analysis.improvements?.length > 0 && (
                  <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: 20 }}>
                    <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#c2410c", margin: "0 0 12px", fontSize: 14 }}>⚠ Improvements</h4>
                    {tone_analysis.improvements.map((s, i) => <p key={i} style={{ fontSize: 13, color: "#9a3412", margin: "0 0 6px", display: "flex", gap: 8 }}><span>→</span>{s}</p>)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {tone_analysis.weak_phrases?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#dc2626", margin: "0 0 14px", fontSize: 14 }}>❌ Weak Phrases Found</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {tone_analysis.weak_phrases.map((p, i) => <span key={i} style={{ background: "#fef2f2", color: "#dc2626", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>"{p}"</span>)}
                  </div>
                </div>
              )}
              {tone_analysis.strong_phrases?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#16a34a", margin: "0 0 14px", fontSize: 14 }}>✓ Strong Phrases Found</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {tone_analysis.strong_phrases.map((p, i) => <span key={i} style={{ background: "#f0fdf4", color: "#16a34a", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>"{p}"</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LEARN TAB ── */}
        {activeTab === "learn" && (
          <div>
            {learning_resources && learning_resources.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
                {learning_resources.map((item, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ background: "#fdf4ff", color: "#7c3aed", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{item.skill}</span>
                      <span style={{ background: "#f0fdf4", color: "#16a34a", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>FREE</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.5 }}>{item.why}</p>
                    <a href={item.resource?.url || "#"} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", gap: 10, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 12, textDecoration: "none", alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: 20 }}>play_circle</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>{item.resource?.title}</p>
                        <p style={{ fontSize: 12, color: "#ea580c", margin: 0, fontWeight: 600 }}>{item.resource?.channel} · {item.resource?.duration}</p>
                      </div>
                    </a>
                    {item.topics && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>{item.topics.map(t => <span key={t} style={{ background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{t}</span>)}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 20, padding: 48, border: "1px solid #e2e8f0", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#16a34a" }}>emoji_events</span>
                <h3 style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#0f172a", margin: "16px 0 8px" }}>Great job!</h3>
                <p style={{ color: "#64748b", fontSize: 15 }}>No major skill gaps found. Check the <Link href="/learn" style={{ color: "#2563eb", fontWeight: 600 }}>Learn page</Link> for general resources to stay ahead.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "28px 24px", marginTop: 20 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "Merriweather,serif", fontWeight: 800, color: "#0f172a" }}>Apply<span style={{ color: "#2563eb" }}>Smart</span> AI</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>© 2024 ApplySmart AI. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/contact" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}