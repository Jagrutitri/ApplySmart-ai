const path = require("path");

console.log("__dirname =", __dirname);
console.log("ENV PATH =", path.join(__dirname, "../.env"));

// require("dotenv").config({
//   path: path.join(__dirname, "../.env")
// });
const fs = require("fs");

console.log("ENV FILE CONTENT:");
console.log(fs.readFileSync(".env", "utf8"));
require("dotenv").config();

console.log(process.env.GROQ_API_KEY);
console.log(process.env.MONGODB_URI);
// const path = require("path");
// require("dotenv").config({ path: path.join(__dirname, "../.env") });

console.log("MONGODB_URI loaded:", process.env.MONGODB_URI ? "YES ✅" : "NO ❌");
console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌");

const express   = require("express");
const cors      = require("cors");
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const Groq      = require("groq-sdk");
const { getLearningResources } = require("./learningData");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── Groq ─────────────────────────────────────────────────────────────────────
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.1-8b-instant";

async function askGroq(systemMsg, userMsg, maxTokens = 800) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemMsg },
      { role: "user",   content: userMsg   },
    ],
    temperature: 0.1,
    max_tokens:  maxTokens,
  });
  return completion.choices[0].message.content.trim();
}

// ─── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => console.error("❌  MongoDB error:", err.message));

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  analyses:  [{
    matchScore:    Number,
    matchedSkills: [String],
    missingSkills: [String],
    atsScore:      Number,
    date:          { type: Date, default: Date.now }
  }]
});
const User = mongoose.model("User", userSchema);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "applysmart_secret");
    next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
};

app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "User already exists! Please login instead." });
    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });
    const token  = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "applysmart_secret",
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required." });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "No account found. Please register first." });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Incorrect password." });
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "applysmart_secret",
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s{3,}/g, " ")
    .trim();
}

function extractJSON(text) {
  if (!text) return null;
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const o1 = clean.indexOf("{"), o2 = clean.lastIndexOf("}");
  if (o1 !== -1 && o2 > o1) { try { return JSON.parse(clean.slice(o1, o2+1)); } catch {} }
  const a1 = clean.indexOf("["), a2 = clean.lastIndexOf("]");
  if (a1 !== -1 && a2 > a1) { try { return JSON.parse(clean.slice(a1, a2+1)); } catch {} }
  return null;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ─── AI: Extract resume skills ────────────────────────────────────────────────
async function extractResumeSkills(resumeText) {
  const system = `You are a skill extractor. Return ONLY a JSON array of strings. No explanation.`;
  const user   = `Extract ALL technical skills, programming languages, frameworks, tools, databases, and technologies from this resume.

Resume:
${resumeText.slice(0, 2500)}

Return ONLY a JSON array like: ["Python","React","MySQL","Git","Docker"]`;

  const raw    = await askGroq(system, user, 500);
  console.log("Resume skills →", raw.slice(0, 120));
  const result = extractJSON(raw);
  return Array.isArray(result) ? result : [];
}

// ─── AI: Extract JD skills ────────────────────────────────────────────────────
async function extractJDSkills(jdText) {
  const system = `You are a skill extractor. Return ONLY a JSON array of strings. No explanation.`;
  const user   = `Extract ALL required technical skills, languages, frameworks, and tools from this job description.

Job Description:
${jdText.slice(0, 2000)}

Return ONLY a JSON array like: ["Python","React","MySQL","Git"]`;

  const raw    = await askGroq(system, user, 400);
  console.log("JD skills →", raw.slice(0, 120));
  const result = extractJSON(raw);
  return Array.isArray(result) ? result : [];
}

// ─── AI: Feedback ─────────────────────────────────────────────────────────────
async function getFeedback(resumeText, jdText, matchScore, missingSkills) {
  const system = `You are a career coach. Return ONLY a JSON array. No explanation.`;
  const user   = `Give 3 specific improvement tips for this resume vs job description.

Resume: ${resumeText.slice(0, 800)}
Job: ${jdText.slice(0, 600)}
Match: ${matchScore}%
Missing skills: ${missingSkills.slice(0, 5).join(", ") || "none"}

Return ONLY this JSON array with exactly 3 objects:
[
  {"title":"tip title","description":"specific advice"},
  {"title":"tip title","description":"specific advice"},
  {"title":"tip title","description":"specific advice"}
]`;

  const raw    = await askGroq(system, user, 500);
  console.log("Feedback →", raw.slice(0, 120));
  const result = extractJSON(raw);
  if (Array.isArray(result) && result.length >= 3) return result.slice(0, 3);
  return [
    { title: "Quantify your achievements", description: "Add numbers and percentages to your project results to show measurable impact." },
    { title: "Add missing keywords", description: `Add ${missingSkills.slice(0, 3).join(", ")} to your skills section or project descriptions.` },
    { title: "Tailor your summary", description: "Rewrite your professional summary to directly address this job's specific requirements." },
  ];
}

// ─── AI: ATS ──────────────────────────────────────────────────────────────────
async function getATS(resumeText) {
  const system = `You are an ATS expert. Return ONLY valid JSON. No explanation.`;
  const user   = `Analyze this resume for ATS compatibility. Score 0-100.

Resume: ${resumeText.slice(0, 1500)}

Return ONLY this JSON:
{
  "ats_score": 78,
  "grade": "B",
  "summary": "One sentence ATS assessment.",
  "passed_checks": ["thing done correctly","another thing"],
  "issues": [
    {"severity":"high","issue":"specific issue","fix":"how to fix"},
    {"severity":"medium","issue":"specific issue","fix":"how to fix"}
  ]
}`;

  const raw    = await askGroq(system, user, 600);
  console.log("ATS →", raw.slice(0, 120));
  const result = extractJSON(raw);
  if (result && typeof result.ats_score === "number") return result;
  return {
    ats_score: 65, grade: "C",
    summary: "Resume has moderate ATS compatibility.",
    passed_checks: ["Contains technical keywords", "Text is readable"],
    issues: [{ severity: "medium", issue: "Add clear section headers", fix: "Use: Summary, Experience, Education, Skills" }]
  };
}

// ─── AI: Keywords ─────────────────────────────────────────────────────────────
async function getKeywords(resumeText, jdText) {
  const system = `You are a keyword analyst. Return ONLY valid JSON. No explanation.`;
  const user   = `Compare keywords: resume vs job description.

Resume: ${resumeText.slice(0, 1000)}
Job: ${jdText.slice(0, 800)}

Return ONLY this JSON:
{
  "keyword_score": 68,
  "density_score": 62,
  "recommendation": "One specific actionable keyword tip.",
  "high_priority": [
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false},
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false},
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false},
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false}
  ],
  "medium_priority": [
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false},
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false},
    {"keyword":"keyword from JD","in_resume":true},
    {"keyword":"keyword from JD","in_resume":false}
  ]
}`;

  const raw    = await askGroq(system, user, 700);
  console.log("Keywords →", raw.slice(0, 120));
  const result = extractJSON(raw);
  if (result && typeof result.keyword_score === "number") return result;
  return {
    keyword_score: 60, density_score: 55,
    recommendation: "Add more specific keywords from the job description.",
    high_priority: [], medium_priority: []
  };
}

// ─── AI: Tone ─────────────────────────────────────────────────────────────────
async function getTone(resumeText) {
  const system = `You are a writing analyst. Return ONLY valid JSON. No explanation.`;
  const user   = `Analyze the professional tone of this resume.

Resume: ${resumeText.slice(0, 1200)}

Return ONLY this JSON:
{
  "tone_score": 72,
  "authority_score": 68,
  "clarity_score": 75,
  "action_verbs_score": 65,
  "tone_type": "confident",
  "overall_assessment": "2-3 sentences about tone quality.",
  "strengths": ["strength1","strength2"],
  "improvements": ["improvement1","improvement2"],
  "weak_phrases": ["weak phrase from resume"],
  "strong_phrases": ["strong phrase from resume"]
}`;

  const raw    = await askGroq(system, user, 600);
  console.log("Tone →", raw.slice(0, 120));
  const result = extractJSON(raw);
  if (result && typeof result.tone_score === "number") return result;
  return {
    tone_score: 65, authority_score: 60, clarity_score: 70, action_verbs_score: 55,
    tone_type: "neutral",
    overall_assessment: "The resume uses professional language but could benefit from stronger action verbs.",
    strengths: ["Professional language used"], improvements: ["Use stronger action verbs"],
    weak_phrases: [], strong_phrases: []
  };
}

// ─── POST /analyze ────────────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  try {
    const { resumetext, jobdescription, userId } = req.body;
    if (!resumetext || !jobdescription)
      return res.status(400).json({ error: "resumetext and jobdescription are required." });

    const cleanResume = cleanText(resumetext);
    const cleanJD     = cleanText(jobdescription);

    console.log(`\n📄 Resume: ${cleanResume.length} chars | JD: ${cleanJD.length} chars`);

    if (cleanResume.length < 50)
      return res.status(400).json({ error: "Resume text too short. Please paste your resume text directly in the text box." });

    // ── Step 1: Extract skills ───────────────────────────────────────────
    console.log("Step 1: Extracting resume skills...");
    const resumeSkills = await extractResumeSkills(cleanResume);
    console.log(`  Found ${resumeSkills.length}:`, resumeSkills.slice(0, 6).join(", "));

    await wait(600);

    console.log("Step 2: Extracting JD skills...");
    const jdSkills = await extractJDSkills(cleanJD);
    console.log(`  Found ${jdSkills.length}:`, jdSkills.slice(0, 6).join(", "));

    // ── Step 2: Match score ──────────────────────────────────────────────
    const resumeLower   = resumeSkills.map(s => s.toLowerCase().trim());
    const matchedSkills = jdSkills.filter(skill => {
      const sl = skill.toLowerCase().trim();
      return resumeLower.some(rs =>
        rs === sl || rs.includes(sl) || sl.includes(rs)
      );
    });
    const missingSkills     = jdSkills.filter(s => !matchedSkills.includes(s));
    const matchScore        = Math.round((matchedSkills.length / Math.max(jdSkills.length, 1)) * 100);
    const importantKeywords = jdSkills.slice(0, 6);

    console.log(`Match: ${matchScore}% (${matchedSkills.length}/${jdSkills.length})`);

    await wait(600);

    // ── Step 3: Feedback ─────────────────────────────────────────────────
    console.log("Step 3: Generating feedback...");
    const feedback = await getFeedback(cleanResume, cleanJD, matchScore, missingSkills);

    await wait(600);

    // ── Step 4: ATS ──────────────────────────────────────────────────────
    console.log("Step 4: ATS analysis...");
    const atsResult = await getATS(cleanResume);

    await wait(600);

    // ── Step 5: Keywords ─────────────────────────────────────────────────
    console.log("Step 5: Keyword analysis...");
    const kwResult = await getKeywords(cleanResume, cleanJD);

    await wait(600);

    // ── Step 6: Tone ─────────────────────────────────────────────────────
    console.log("Step 6: Tone analysis...");
    const toneResult = await getTone(cleanResume);

    // ── Step 7: Learning resources (from verified database — no AI) ──────
    console.log("Step 7: Getting learning resources for missing skills...");
    const learningResources = getLearningResources(missingSkills);
    console.log(`  Resources found: ${learningResources.length}`);

    // ── Save to MongoDB ───────────────────────────────────────────────────
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          analyses: {
            matchScore,
            matchedSkills: matchedSkills.slice(0, 5),
            missingSkills: missingSkills.slice(0, 5),
            atsScore: atsResult?.ats_score || 0,
          }
        }
      }).catch(e => console.error("MongoDB save error:", e.message));
    }

    console.log("✅ Analysis complete!\n");

    res.json({
      match_score:        matchScore,
      matched_skills:     matchedSkills,
      missing_skills:     missingSkills,
      important_keywords: importantKeywords,
      feedback,
      learning_resources: learningResources,
      ats_analysis:       atsResult,
      keyword_analysis:   kwResult,
      tone_analysis:      toneResult,
    });

  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("429") || err.message.includes("rate_limit"))
      return res.status(429).json({ error: "Rate limit hit. Please wait 20 seconds and try again." });
    res.status(500).json({ error: "Analysis failed: " + err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "OK", ai: MODEL }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅  ApplySmart backend running on http://localhost:${PORT}`));