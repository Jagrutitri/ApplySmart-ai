require("dotenv").config();

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

// ─── Groq Setup ───────────────────────────────────────────────────────────────
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-20b";

// Ultra-robust JSON extractor
function extractJSON(text) {
  if (!text) return null;

  // Step 1: Remove markdown fences
  let clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // Step 2: Try direct parse
  try { return JSON.parse(clean); } catch {}

  // Step 3: Find JSON object { }
  const o1 = clean.indexOf("{");
  const o2 = clean.lastIndexOf("}");
  if (o1 !== -1 && o2 > o1) {
    try { return JSON.parse(clean.slice(o1, o2 + 1)); } catch {}
  }

  // Step 4: Find JSON array [ ]
  const a1 = clean.indexOf("[");
  const a2 = clean.lastIndexOf("]");
  if (a1 !== -1 && a2 > a1) {
    try { return JSON.parse(clean.slice(a1, a2 + 1)); } catch {}
  }

  // Step 5: Fix common issues — trailing commas, unquoted keys
  try {
    const fixed = clean
      .replace(/,\s*([}\]])/g, "$1")       // remove trailing commas
      .replace(/(['"])?([a-zA-Z_]+)(['"])?\s*:/g, '"$2":') // quote keys
      .replace(/:\s*'([^']*)'/g, ': "$1"'); // single to double quotes
    return JSON.parse(fixed);
  } catch {}

  console.error("extractJSON FAILED on:", clean.slice(0, 300));
  return null;
}

async function askGroq(prompt, maxTokens = 800) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a JSON API. You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanation, no text before or after the JSON. Start your response directly with { or [."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: maxTokens,
  });

  const raw = completion.choices[0].message.content.trim();
  console.log("RAW AI →", raw.slice(0, 150));
  return raw;
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

function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s{3,}/g, " ")
    .trim();
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ─── AI: Extract Resume Skills ────────────────────────────────────────────────
async function extractResumeSkills(resumeText) {
  const prompt = `Extract ALL technical skills from this resume. Include: programming languages, frameworks, libraries, tools, databases, cloud services, and technologies.

Resume text:
${resumeText.slice(0, 2500)}

Respond with ONLY a JSON array of skill strings. Example format:
["JavaScript", "React", "Node.js", "MongoDB", "Python", "Git", "Docker", "AWS", "MySQL", "Express.js"]

Include every technical skill you can find. Start directly with [`;

  const raw    = await askGroq(prompt, 600);
  const result = extractJSON(raw);
  const skills = Array.isArray(result) ? result : [];
  console.log(`Resume skills (${skills.length}):`, skills.slice(0, 8).join(", "));
  return skills;
}

// ─── AI: Extract JD Skills ────────────────────────────────────────────────────
async function extractJDSkills(jdText) {
  const prompt = `Extract ALL required technical skills from this job description. Include: programming languages, frameworks, tools, databases, and technologies mentioned.

Job description:
${jdText.slice(0, 2000)}

Respond with ONLY a JSON array of skill strings. Example format:
["Python", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "REST API"]

Include every technical requirement you find. Start directly with [`;

  const raw    = await askGroq(prompt, 500);
  const result = extractJSON(raw);
  const skills = Array.isArray(result) ? result : [];
  console.log(`JD skills (${skills.length}):`, skills.slice(0, 8).join(", "));
  return skills;
}

// ─── AI: Feedback ─────────────────────────────────────────────────────────────
async function getFeedback(resumeText, jdText, matchScore, missingSkills) {
  const prompt = `You are a career coach. Analyze this specific resume against this specific job description and give 3 personalized improvement tips.

Resume:
${resumeText.slice(0, 1000)}

Job Description:
${jdText.slice(0, 700)}

Match Score: ${matchScore}%
Skills the candidate is missing: ${missingSkills.slice(0, 6).join(", ") || "none identified"}

Give 3 specific, actionable tips based on what you actually see in THIS resume vs THIS job.

Respond with ONLY this JSON array:
[
  {"title": "specific tip title", "description": "specific advice based on this resume and job"},
  {"title": "specific tip title", "description": "specific advice based on this resume and job"},
  {"title": "specific tip title", "description": "specific advice based on this resume and job"}
]

Start directly with [`;

  const raw    = await askGroq(prompt, 600);
  const result = extractJSON(raw);
  if (Array.isArray(result) && result.length >= 3) return result.slice(0, 3);
  return [
    { title: "Quantify your achievements", description: "Add specific numbers and percentages to your project results to demonstrate measurable impact." },
    { title: "Add missing technical skills", description: `Consider adding ${missingSkills.slice(0, 3).join(", ")} to your skillset and mention them in project descriptions.` },
    { title: "Tailor your professional summary", description: "Rewrite your summary to directly mirror the language and requirements in this job description." },
  ];
}

// ─── AI: ATS Analysis ─────────────────────────────────────────────────────────
async function getATS(resumeText) {
  const prompt = `You are an ATS (Applicant Tracking System) expert. Carefully analyze this specific resume and give it a real ATS compatibility score.

Resume:
${resumeText.slice(0, 2000)}

Score this resume on these criteria (be strict and accurate, not generous):
- Standard section headers like Experience, Education, Skills, Summary (20 points)
- No complex tables, columns, or text boxes (15 points)
- Contact information with email and phone present (15 points)
- Bullet points used for job descriptions (10 points)
- Good keyword density matching typical job descriptions (20 points)
- Clean consistent formatting (10 points)
- Quantified achievements present (10 points)

Look at the actual resume content and give a REAL score based on what you see.

Respond with ONLY this JSON object:
{
  "ats_score": <actual score 0-100 based on this specific resume>,
  "grade": "<A if 90+, B if 75-89, C if 60-74, D if 45-59, F if below 45>",
  "summary": "<one specific sentence about THIS resume's ATS compatibility>",
  "passed_checks": ["<specific thing this resume does correctly>", "<another specific thing>"],
  "issues": [
    {"severity": "high", "issue": "<specific issue found in this resume>", "fix": "<specific fix>"},
    {"severity": "medium", "issue": "<specific issue found>", "fix": "<specific fix>"}
  ]
}

Start directly with {`;

  const raw    = await askGroq(prompt, 700);
  const result = extractJSON(raw);
  console.log("ATS result:", result ? `score=${result.ats_score}` : "FAILED - using fallback");
  if (result && typeof result.ats_score === "number") return result;

  // If AI fails, calculate a rough score from resume content
  const hasEmail    = /[\w.]+@[\w.]+/.test(resumeText);
  const hasPhone    = /[+]?[\d\s\-()]{10,}/.test(resumeText);
  const hasBullets  = resumeText.includes("•") || resumeText.includes("-") || resumeText.includes("*");
  const hasSkills   = /skill|technology|tools/i.test(resumeText);
  const hasExp      = /experience|work|employment|internship/i.test(resumeText);
  const hasEdu      = /education|university|college|degree|bachelor/i.test(resumeText);
  let score = 40;
  if (hasEmail)   score += 10;
  if (hasPhone)   score += 8;
  if (hasBullets) score += 10;
  if (hasSkills)  score += 12;
  if (hasExp)     score += 10;
  if (hasEdu)     score += 10;
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";

  return {
    ats_score: score,
    grade,
    summary: `Resume scored ${score}/100 on ATS compatibility based on structural analysis.`,
    passed_checks: [
      hasEmail ? "Email address found" : "Add your email address",
      hasPhone ? "Phone number present" : "Add your phone number",
      hasExp   ? "Work experience section detected" : "Add work experience",
    ].filter(c => !c.startsWith("Add")),
    issues: [
      !hasBullets ? { severity: "high", issue: "No bullet points detected", fix: "Use bullet points for all job/project descriptions" } : null,
      !hasSkills  ? { severity: "high", issue: "No skills section found", fix: "Add a dedicated Technical Skills section" } : null,
    ].filter(Boolean)
  };
}

// ─── AI: Keywords ─────────────────────────────────────────────────────────────
async function getKeywords(resumeText, jdText) {
  const prompt = `Analyze keyword matching between this resume and job description. Find the most important keywords from the job description and check each one in the resume.

Resume:
${resumeText.slice(0, 1200)}

Job Description:
${jdText.slice(0, 1000)}

Check each important keyword from the JD: does it appear in the resume? Be thorough and accurate.

Calculate:
- keyword_score: percentage of important JD keywords found in resume (0-100)
- density_score: how well the resume uses keywords throughout (0-100)

Respond with ONLY this JSON:
{
  "keyword_score": <real calculated percentage>,
  "density_score": <real score based on resume>,
  "recommendation": "<one specific tip for this resume>",
  "high_priority": [
    {"keyword": "<actual keyword from JD>", "in_resume": <true if found in resume, false if not>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>}
  ],
  "medium_priority": [
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>},
    {"keyword": "<actual keyword from JD>", "in_resume": <true or false>}
  ]
}

Start directly with {`;

  const raw    = await askGroq(prompt, 800);
  const result = extractJSON(raw);
  console.log("Keywords result:", result ? `score=${result.keyword_score}` : "FAILED - using fallback");
  if (result && typeof result.keyword_score === "number") return result;
  return {
    keyword_score: 50, density_score: 45,
    recommendation: "Add more specific technical keywords from the job description into your resume.",
    high_priority: [], medium_priority: []
  };
}

// ─── AI: Tone ─────────────────────────────────────────────────────────────────
async function getTone(resumeText) {
  const prompt = `Analyze the professional writing tone and quality of this specific resume. Be accurate and critical, not generic.

Resume:
${resumeText.slice(0, 1500)}

Evaluate this specific resume on:
- tone_score: overall professional tone (0-100)
- authority_score: confidence and leadership language (0-100)  
- clarity_score: how clear and readable (0-100)
- action_verbs_score: use of strong action verbs like "Led", "Built", "Achieved" (0-100)

Look at the actual language used and give REAL scores.

Respond with ONLY this JSON:
{
  "tone_score": <real score for THIS resume>,
  "authority_score": <real score>,
  "clarity_score": <real score>,
  "action_verbs_score": <real score>,
  "tone_type": "<passive/neutral/confident/authoritative based on actual language>",
  "overall_assessment": "<2-3 specific sentences about THIS resume's tone with examples>",
  "strengths": ["<specific strength seen in this resume>", "<another specific strength>"],
  "improvements": ["<specific improvement needed>", "<another improvement>"],
  "weak_phrases": ["<actual weak phrase found in the resume>", "<another weak phrase>"],
  "strong_phrases": ["<actual strong phrase found in resume>", "<another strong phrase>"]
}

Start directly with {`;

  const raw    = await askGroq(prompt, 700);
  const result = extractJSON(raw);
  console.log("Tone result:", result ? `score=${result.tone_score}` : "FAILED - using fallback");
  if (result && typeof result.tone_score === "number") return result;

  // Smart fallback — analyze the resume ourselves
  const actionVerbs = ["led", "built", "developed", "created", "designed", "implemented",
                       "managed", "improved", "reduced", "increased", "achieved", "delivered",
                       "launched", "optimized", "architected", "engineered"];
  const verbCount   = actionVerbs.filter(v => resumeText.toLowerCase().includes(v)).length;
  const hasNumbers  = /\d+%|\d+x|\d+ users|\d+ projects/i.test(resumeText);
  const verbScore   = Math.min(100, verbCount * 12);
  const toneScore   = Math.min(100, 50 + verbCount * 6 + (hasNumbers ? 15 : 0));

  return {
    tone_score: toneScore,
    authority_score: Math.max(40, toneScore - 8),
    clarity_score: Math.min(100, toneScore + 5),
    action_verbs_score: verbScore,
    tone_type: toneScore >= 75 ? "confident" : toneScore >= 60 ? "neutral" : "passive",
    overall_assessment: `Resume uses ${verbCount} action verbs${hasNumbers ? " and includes quantified achievements" : " but lacks quantified achievements"}. ${toneScore >= 70 ? "Overall tone is professional and confident." : "Adding stronger action verbs and measurable results would improve the tone significantly."}`,
    strengths: [
      verbCount > 3 ? "Uses action verbs in descriptions" : "Has clear structure",
      hasNumbers ? "Includes quantified achievements" : "Professional language used"
    ],
    improvements: [
      verbCount < 5 ? "Add more strong action verbs (Led, Built, Achieved, Delivered)" : "Vary action verbs across sections",
      !hasNumbers ? "Add measurable results (increased by 30%, served 500+ users)" : "Add more metrics to project descriptions"
    ],
    weak_phrases: [],
    strong_phrases: []
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
    console.log("Resume preview:", cleanResume.slice(0, 100));

    if (cleanResume.length < 50)
      return res.status(400).json({ error: "Resume text too short. Please paste your resume text directly." });

    // Step 1: Extract skills
    console.log("\nStep 1: Resume skills...");
    const resumeSkills = await extractResumeSkills(cleanResume);

    await wait(700);

    console.log("Step 2: JD skills...");
    const jdSkills = await extractJDSkills(cleanJD);

    // Match calculation
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

    console.log(`\n✅ Match: ${matchScore}% | Matched: ${matchedSkills.length} | Missing: ${missingSkills.length}`);

    await wait(700);

    console.log("Step 3: Feedback...");
    const feedback = await getFeedback(cleanResume, cleanJD, matchScore, missingSkills);

    await wait(700);

    console.log("Step 4: ATS...");
    const atsResult = await getATS(cleanResume);

    await wait(700);

    console.log("Step 5: Keywords...");
    const kwResult = await getKeywords(cleanResume, cleanJD);

    await wait(700);

    console.log("Step 6: Tone...");
    const toneResult = await getTone(cleanResume);

    console.log("Step 7: Learning resources...");
    const learningResources = getLearningResources(missingSkills);

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

    console.log("\n✅ Analysis complete!");

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