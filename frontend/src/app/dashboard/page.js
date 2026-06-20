"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../lib/config";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText]   = useState("");
  const [fileName, setFileName]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError]             = useState("");
  const [dragOver, setDragOver]       = useState(false);
  const [resumeMode, setResumeMode]   = useState("upload"); // "upload" or "paste"
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Clean extracted text ──────────────────────────────────────────────────
  function cleanExtracted(text) {
    return text
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/[ \t]{3,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // ── Extract text from TXT ─────────────────────────────────────────────────
  async function extractFromTxt(file) {
    return await file.text();
  }

  // ── Extract text from DOCX ────────────────────────────────────────────────
  async function extractFromDocx(file) {
    const arrayBuffer = await file.arrayBuffer();
    const arr = new Uint8Array(arrayBuffer);
    // DOCX is a ZIP — look for word/document.xml content
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(arr);
    // Extract text between <w:t> tags
    const matches = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const text = matches
      .map(m => m.replace(/<[^>]+>/g, ""))
      .filter(t => t.trim().length > 0)
      .join(" ");
    if (text.length > 100) return text;
    // Fallback: strip all XML and return readable text
    return raw.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").slice(0, 8000);
  }

  // ── Extract text from PDF ─────────────────────────────────────────────────
  async function extractFromPdf(file) {
    const { extractTextFromPDF } = await import("../../lib/pdfExtract");
    return await extractTextFromPDF(file);
  }

  // ── Handle file upload ────────────────────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!file) return;
    setError("");
    setFileLoading(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let text = "";

      if (ext === "txt")        text = await extractFromTxt(file);
      else if (ext === "docx")  text = await extractFromDocx(file);
      else if (ext === "pdf")   text = await extractFromPdf(file);
      else throw new Error("Please upload PDF, DOCX, or TXT file.");

      text = cleanExtracted(text);

      if (!text || text.length < 80) {
        setError("⚠️ Could not read text from this file. Please use the 'Paste Text' option below and paste your resume text directly.");
        setResumeMode("paste");
        return;
      }

      setResumeText(text);
      setFileName(file.name);
      console.log("Extracted text preview:", text.slice(0, 200));
    } catch (err) {
      setError(err.message || "Failed to read file. Try pasting your resume text instead.");
      setResumeMode("paste");
    } finally {
      setFileLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    if (!resumeText.trim())     { setError("Please upload your resume or paste your resume text."); return; }
    if (resumeText.trim().length < 80) { setError("Resume text is too short. Please paste more complete resume content."); return; }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resumetext:     resumeText,
          jobdescription: jobDescription,
          userId:         user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      router.push("/analysis");
    } catch (err) {
      setError(err.message || "Failed to connect to backend. Is it running on port 4000?");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#2563eb" }}>progress_activity</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4ff 0%,#e8f0fe 100%)" }}>
      <Navbar />

      {/* Blobs */}
      <div style={{ position: "fixed", top: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.06),transparent)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-5%", width: "40%", height: "40%", background: "radial-gradient(circle,rgba(16,185,129,0.05),transparent)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      <main style={{ position: "relative", zIndex: 1, paddingTop: 88, paddingBottom: 80, padding: "88px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Hero */}
        <header style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#2563eb" }}>auto_awesome</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Optimize Your Career</span>
          </div>
          <h1 style={{ fontFamily: "Merriweather,serif", fontSize: 42, fontWeight: 900, color: "#0f172a", margin: "0 0 14px", lineHeight: 1.2 }}>
            Align your profile with<br /><span style={{ color: "#2563eb" }}>your dream role.</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            Our AI analyzes your experience against specific job requirements to highlight your strengths and bridge the gaps.
          </p>
          {user && (
            <p style={{ marginTop: 10, fontSize: 14, color: "#2563eb", fontWeight: 600 }}>Welcome back, {user.name}! 👋</p>
          )}
        </header>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24, marginBottom: 24 }}>

          {/* LEFT: Job Description */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(37,99,235,0.08)", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "#2563eb", fontSize: 20 }}>description</span>
                </div>
                <h2 style={{ fontFamily: "Merriweather,serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Job Description</h2>
              </div>
              <span style={{ background: "#f1f5f9", padding: "4px 12px", borderRadius: 20, fontSize: 12, color: "#64748b", fontWeight: 600 }}>Step 1</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here...&#10;&#10;Our AI will extract required skills, keywords, and qualifications to compare against your resume."
              style={{ width: "100%", height: 320, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 18, fontSize: 14, color: "#334155", lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "Inter,sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
            />
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
              Paste the complete job description for best results
            </p>
          </div>

          {/* RIGHT: Resume + Action */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Step 2 label */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "Merriweather,serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Your Resume</h2>
              <span style={{ background: "#f1f5f9", padding: "4px 12px", borderRadius: 20, fontSize: 12, color: "#64748b", fontWeight: 600 }}>Step 2</span>
            </div>

            {/* Toggle: Upload vs Paste */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 12, padding: 4, gap: 4 }}>
              {["upload", "paste"].map(mode => (
                <button key={mode} onClick={() => setResumeMode(mode)}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    background: resumeMode === mode ? "#fff" : "transparent",
                    color:      resumeMode === mode ? "#2563eb" : "#64748b",
                    boxShadow:  resumeMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                  {mode === "upload" ? "📎 Upload File" : "✏️ Paste Text"}
                </button>
              ))}
            </div>

            {/* Upload Mode */}
            {resumeMode === "upload" && (
              <div
                onClick={() => !fileLoading && fileInputRef.current?.click()}
                onDragOver={e  => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
                style={{ background: dragOver ? "#eff6ff" : "#fff", border: `2px dashed ${dragOver ? "#2563eb" : "#bfdbfe"}`, borderRadius: 16, padding: 28, textAlign: "center", cursor: fileLoading ? "wait" : "pointer", transition: "all 0.2s" }}>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }}
                  onChange={e => handleFileUpload(e.target.files[0])} />
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "#2563eb" }}>
                    {fileLoading ? "progress_activity" : fileName ? "task_alt" : "cloud_upload"}
                  </span>
                </div>
                {fileLoading ? (
                  <p style={{ color: "#2563eb", fontWeight: 600, margin: 0 }}>Reading file...</p>
                ) : fileName ? (
                  <>
                    <p style={{ fontFamily: "Merriweather,serif", fontWeight: 700, color: "#16a34a", margin: "0 0 4px", fontSize: 15 }}>✓ Resume Loaded</p>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px" }}>{fileName}</p>
                    <p style={{ color: "#16a34a", fontSize: 12, margin: 0 }}>{resumeText.length} characters extracted</p>
                    <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: "Merriweather,serif", fontWeight: 700, fontSize: 15, color: "#0f172a", margin: "0 0 8px" }}>Upload Resume</p>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>Drag & drop or click to browse<br/><span style={{ fontSize: 12, color: "#94a3b8" }}>PDF, DOCX, TXT up to 5MB</span></p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      {["PDF", "DOCX", "TXT"].map(f => <span key={f} style={{ padding: "3px 10px", background: "#f1f5f9", borderRadius: 20, fontSize: 11, fontWeight: 700, color: "#64748b" }}>{f}</span>)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Paste Mode */}
            {resumeMode === "paste" && (
              <div>
                <textarea
                  value={resumeText}
                  onChange={e => { setResumeText(e.target.value); setFileName(""); }}
                  placeholder="Paste your complete resume text here...&#10;&#10;Include: Skills, Work Experience, Education, Projects&#10;&#10;Tip: Copy all text from your resume (Ctrl+A, Ctrl+C) and paste here."
                  style={{ width: "100%", height: 200, background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 16, fontSize: 13, color: "#334155", lineHeight: 1.6, resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "Inter,sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#2563eb"}
                  onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
                />
                {resumeText.length > 0 && (
                  <p style={{ fontSize: 12, color: resumeText.length > 200 ? "#16a34a" : "#d97706", marginTop: 6, fontWeight: 600 }}>
                    {resumeText.length > 200 ? `✓ ${resumeText.length} characters — good length` : `⚠️ Only ${resumeText.length} characters — paste more content for better results`}
                  </p>
                )}
              </div>
            )}

            {/* AI tip box */}
            <div style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 14, padding: 18, color: "#fff" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.9, flexShrink: 0 }}>auto_awesome</span>
                <div>
                  <p style={{ fontFamily: "Merriweather,serif", fontWeight: 700, fontSize: 13, margin: "0 0 5px" }}>Pro Tip</p>
                  <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
                    If file upload shows 0% match, switch to <strong>Paste Text</strong> mode and paste your resume directly — it gives the most accurate results.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: 18, flexShrink: 0 }}>error</span>
                <span style={{ color: "#dc2626", fontSize: 13, lineHeight: 1.5 }}>{error}</span>
              </div>
            )}

            {/* Analyze Button */}
            <button onClick={handleAnalyze} disabled={loading}
              style={{ width: "100%", padding: "16px", background: loading ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Merriweather,serif", boxShadow: loading ? "none" : "0 8px 24px rgba(37,99,235,0.3)", transition: "all 0.2s" }}>
              {loading ? (
                <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>progress_activity</span> Analyzing... (30-60s)</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>rocket_launch</span> Analyze Now</>
              )}
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: "data_thresholding", title: "ATS Compatibility", desc: "Get your ATS score and fix formatting issues before applying.", color: "#eff6ff", iconColor: "#2563eb" },
            { icon: "psychology",        title: "Keyword Matching",  desc: "See exactly which keywords from the JD are missing in your resume.", color: "#f0fdf4", iconColor: "#16a34a" },
            { icon: "history_edu",       title: "Tone Analysis",     desc: "Measure authority, clarity, and action verb strength.", color: "#fdf4ff", iconColor: "#9333ea" },
          ].map(card => (
            <div key={card.title} style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: card.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <span className="material-symbols-outlined" style={{ color: card.iconColor, fontSize: 20 }}>{card.icon}</span>
              </div>
              <p style={{ fontFamily: "Merriweather,serif", fontWeight: 700, fontSize: 14, margin: "0 0 6px" }}>{card.title}</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #e2e8f0", background: "#fff", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "Merriweather,serif", fontWeight: 800, color: "#0f172a" }}>Apply<span style={{ color: "#2563eb" }}>Smart</span> AI</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>© 2024 ApplySmart AI. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms"   style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/contact" style={{ fontSize: 12, color: "#94a3b8", textDecoration: "none" }}>Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}