export function downloadAnalysisPDF(result) {
  const {
    match_score, matched_skills, missing_skills,
    important_keywords, feedback,
    ats_analysis, keyword_analysis, tone_analysis,
    learning_resources
  } = result;

  const matchColor = match_score >= 80 ? "#16a34a" : match_score >= 60 ? "#2563eb" : match_score >= 40 ? "#d97706" : "#dc2626";
  const matchLabel = match_score >= 80 ? "Excellent Match" : match_score >= 60 ? "Strong Match" : match_score >= 40 ? "Moderate Match" : "Needs Work";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>ApplySmart AI — Analysis Report</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;background:#fff;font-size:13px;line-height:1.6}
.page{max-width:800px;margin:0 auto;padding:40px 48px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:28px}
.logo{font-size:20px;font-weight:900;color:#0f172a}.logo span{color:#2563eb}
.date{font-size:11px;color:#64748b}
.score-hero{background:linear-gradient(135deg,#eff6ff,#e0e7ff);border-radius:14px;padding:24px 28px;margin-bottom:28px;display:flex;align-items:center;gap:28px}
.circle{width:100px;height:100px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;border:6px solid ${matchColor};flex-shrink:0}
.circle .num{font-size:28px;font-weight:900;color:#0f172a;line-height:1}
.circle .lbl{font-size:9px;font-weight:700;color:${matchColor};text-transform:uppercase;letter-spacing:.05em;margin-top:2px;text-align:center}
.score-details h2{font-size:18px;font-weight:800;color:#0f172a;margin-bottom:6px}
.score-details p{color:#475569;font-size:12px}
.mini{display:flex;gap:12px;margin-top:12px}
.mini-item{background:#fff;border-radius:8px;padding:7px 12px;text-align:center}
.mini-item .v{font-size:16px;font-weight:800;color:#2563eb}
.mini-item .l{font-size:9px;color:#94a3b8;font-weight:600}
.sec{margin-bottom:24px}
.sec-title{font-size:14px;font-weight:800;color:#0f172a;margin-bottom:12px;padding-bottom:5px;border-bottom:2px solid #e2e8f0}
.fb{display:flex;gap:12px;margin-bottom:12px;background:#f8fafc;border-radius:10px;padding:12px;border-left:3px solid #2563eb}
.fb-n{width:24px;height:24px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;flex-shrink:0}
.fb-t{font-weight:700;color:#0f172a;margin-bottom:2px;font-size:12px}
.fb-d{color:#475569;font-size:11px}
.sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.sb{border-radius:10px;padding:12px;border:1px solid #e2e8f0}
.sb h4{font-size:11px;font-weight:700;margin-bottom:8px}
.bw{display:flex;flex-wrap:wrap;gap:5px}
.badge{padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600}
.bg{background:#f0fdf4;color:#15803d}.br{background:#fef2f2;color:#dc2626}.bb{background:#eff6ff;color:#1d4ed8}
.bar-row{margin-bottom:8px}
.bar-label{display:flex;justify-content:space-between;margin-bottom:3px;font-size:11px}
.bar-bg{height:6px;background:#f1f5f9;border-radius:99px;overflow:hidden}
.bar-fill{height:100%;border-radius:99px}
.iss{background:#f8fafc;border-radius:7px;padding:8px 12px;margin-bottom:7px;border-left:3px solid #e2e8f0}
.iss.high{border-left-color:#dc2626;background:#fef2f2}
.iss.medium{border-left-color:#d97706;background:#fffbeb}
.iss-t{font-weight:700;font-size:11px;color:#0f172a}
.iss-f{font-size:10px;color:#64748b;margin-top:2px}
.lc{border:1px solid #e9d5ff;border-radius:10px;padding:12px;margin-bottom:10px;background:#fdf4ff}
.ls{font-size:10px;font-weight:700;color:#7c3aed;background:#ede9fe;padding:2px 7px;border-radius:4px;display:inline-block;margin-bottom:5px}
.lw{font-size:11px;color:#475569;margin-bottom:8px}
.rb{background:#fff;border:1px solid #e2e8f0;border-radius:7px;padding:9px 11px}
.rt{font-weight:700;font-size:11px;color:#0f172a}
.rc{font-size:10px;color:#ea580c;font-weight:600}
.ru{font-size:9px;color:#2563eb;word-break:break-all;margin-top:2px}
.topics{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.tp{background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600}
.footer{border-top:1px solid #e2e8f0;padding-top:14px;margin-top:28px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:20px}}
</style></head>
<body><div class="page">

<div class="header">
  <div class="logo">Apply<span>Smart</span> AI — Analysis Report</div>
  <div class="date">Generated: ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
</div>

<div class="score-hero">
  <div class="circle">
    <div class="num">${match_score}%</div>
    <div class="lbl">${matchLabel}</div>
  </div>
  <div class="score-details">
    <h2>Job Match Analysis Complete</h2>
    <p>Complete breakdown of your resume against the job description.</p>
    <div class="mini">
      <div class="mini-item"><div class="v">${ats_analysis?.ats_score||"—"}%</div><div class="l">ATS</div></div>
      <div class="mini-item"><div class="v">${keyword_analysis?.keyword_score||"—"}%</div><div class="l">Keywords</div></div>
      <div class="mini-item"><div class="v">${tone_analysis?.tone_score||"—"}%</div><div class="l">Tone</div></div>
      <div class="mini-item"><div class="v">${matched_skills.length}</div><div class="l">Matched</div></div>
      <div class="mini-item"><div class="v">${missing_skills.length}</div><div class="l">Missing</div></div>
    </div>
  </div>
</div>

<div class="sec">
  <div class="sec-title">🤖 AI Career Coach Feedback</div>
  ${feedback.map((f,i)=>`<div class="fb"><div class="fb-n">${i+1}</div><div><div class="fb-t">${f.title}</div><div class="fb-d">${f.description}</div></div></div>`).join("")}
</div>

<div class="sec">
  <div class="sec-title">🎯 Skills Analysis</div>
  <div class="sg">
    <div class="sb"><h4 style="color:#15803d">✓ You Have (${matched_skills.length})</h4><div class="bw">${matched_skills.length===0?'<span style="font-size:10px;color:#94a3b8">None matched</span>':matched_skills.map(s=>`<span class="badge bg">${s}</span>`).join("")}</div></div>
    <div class="sb"><h4 style="color:#dc2626">✗ Missing (${missing_skills.length})</h4><div class="bw">${missing_skills.length===0?'<span style="font-size:10px;color:#16a34a">No gaps!</span>':missing_skills.map(s=>`<span class="badge br">${s}</span>`).join("")}</div></div>
    <div class="sb"><h4 style="color:#1d4ed8">⚑ Key Keywords</h4><div class="bw">${important_keywords.map(k=>`<span class="badge bb">${k}</span>`).join("")}</div></div>
  </div>
</div>

${ats_analysis?`<div class="sec">
  <div class="sec-title">📋 ATS Compatibility — Grade ${ats_analysis.grade} (${ats_analysis.ats_score}/100)</div>
  <p style="color:#475569;font-size:11px;margin-bottom:10px">${ats_analysis.summary}</p>
  ${(ats_analysis.passed_checks||[]).length>0?`<div style="background:#f0fdf4;border-radius:8px;padding:9px 12px;margin-bottom:10px"><div style="font-weight:700;font-size:11px;color:#15803d;margin-bottom:5px">✓ Passed</div>${ats_analysis.passed_checks.map(c=>`<div style="font-size:10px;color:#166534;margin-bottom:2px">• ${c}</div>`).join("")}</div>`:""}
  ${(ats_analysis.issues||[]).map(i=>`<div class="iss ${i.severity}"><div class="iss-t">${i.severity==="high"?"🔴":"🟡"} ${i.issue}</div><div class="iss-f">Fix: ${i.fix}</div></div>`).join("")}
</div>`:""}

${keyword_analysis?`<div class="sec">
  <div class="sec-title">🔑 Keyword Analysis</div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Keyword Match</span><span style="font-weight:700">${keyword_analysis.keyword_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${keyword_analysis.keyword_score}%;background:#9333ea"></div></div></div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Keyword Density</span><span style="font-weight:700">${keyword_analysis.density_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${keyword_analysis.density_score}%;background:#2563eb"></div></div></div>
  <p style="font-size:11px;color:#7c3aed;background:#fdf4ff;padding:7px 11px;border-radius:7px;margin-top:8px">💡 ${keyword_analysis.recommendation}</p>
  ${(keyword_analysis.high_priority||[]).length>0?`<div style="margin-top:10px"><div style="font-weight:700;font-size:11px;color:#0f172a;margin-bottom:7px">High Priority Keywords:</div><div style="display:flex;flex-wrap:wrap;gap:5px">${keyword_analysis.high_priority.map(k=>`<span style="padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600;background:${k.in_resume?"#f0fdf4":"#fef2f2"};color:${k.in_resume?"#15803d":"#dc2626"}">${k.in_resume?"✓":"✗"} ${k.keyword}</span>`).join("")}</div></div>`:""}
</div>`:""}

${tone_analysis?`<div class="sec">
  <div class="sec-title">✍️ Tone & Language Analysis</div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Overall Tone</span><span style="font-weight:700">${tone_analysis.tone_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${tone_analysis.tone_score}%;background:#16a34a"></div></div></div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Authority & Confidence</span><span style="font-weight:700">${tone_analysis.authority_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${tone_analysis.authority_score}%;background:#2563eb"></div></div></div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Clarity</span><span style="font-weight:700">${tone_analysis.clarity_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${tone_analysis.clarity_score}%;background:#9333ea"></div></div></div>
  <div class="bar-row"><div class="bar-label"><span style="color:#475569;font-weight:600">Action Verbs</span><span style="font-weight:700">${tone_analysis.action_verbs_score}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${tone_analysis.action_verbs_score}%;background:#d97706"></div></div></div>
  <p style="font-size:11px;color:#475569;margin-top:8px">${tone_analysis.overall_assessment}</p>
</div>`:""}

${learning_resources&&learning_resources.length>0?`<div class="sec">
  <div class="sec-title">📚 Free Learning Resources for Your Missing Skills</div>
  <p style="font-size:11px;color:#64748b;margin-bottom:12px">Verified free YouTube resources to bridge your skill gaps:</p>
  ${learning_resources.map(item=>`<div class="lc"><span class="ls">${item.skill}</span><div class="lw">${item.why}</div><div class="rb"><div class="rt">${item.resource.title}</div><div class="rc">${item.resource.channel} · ${item.resource.duration}</div><div class="ru">🔗 ${item.resource.url}</div><div class="topics">${(item.topics||[]).map(t=>`<span class="tp">${t}</span>`).join("")}</div></div></div>`).join("")}
</div>`:""}

<div class="footer">
  <span>ApplySmart AI — AI-Powered Resume Analyzer</span>
  <span>Confidential · For personal use only</span>
</div>
</div></body></html>`;

  const win = window.open("", "_blank");
  if (!win) { alert("Please allow popups for this site to download PDF."); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { setTimeout(() => { win.focus(); win.print(); }, 600); };
}