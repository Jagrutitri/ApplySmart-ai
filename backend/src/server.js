require("dotenv").config();

console.log("MONGODB_URI loaded:", process.env.MONGODB_URI ? "YES ✅" : "NO ❌");
console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌");

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const Groq     = require("groq-sdk");
const { getLearningResources } = require("./learningData");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─── Groq setup ───────────────────────────────────────────────────────────────
const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "openai/gpt-oss-20b";

async function askGroq(prompt, maxTokens = 1200) {
  const base = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a JSON API. Respond with ONLY valid JSON. No markdown, no code fences, no explanation."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: maxTokens,
  };

  let completion;
  try {
    // gpt-oss is a reasoning model: low effort keeps it from using up the token budget on thinking
    completion = await groq.chat.completions.create({ ...base, reasoning_effort: "low" });
  } catch (e) {
    if (e.status === 400) completion = await groq.chat.completions.create(base);
    else throw e;
  }

  const choice = completion.choices[0];
  const raw = (choice.message.content || "").trim();
  console.log(`AI [finish=${choice.finish_reason}, len=${raw.length}] →`, raw.slice(0, 120));
  return raw;
}

function extractJSON(text) {
  if (!text) return null;
  const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const o1 = clean.indexOf("{"), o2 = clean.lastIndexOf("}");
  if (o1 !== -1 && o2 > o1) { try { return JSON.parse(clean.slice(o1, o2 + 1)); } catch {} }
  const a1 = clean.indexOf("["), a2 = clean.lastIndexOf("]");
  if (a1 !== -1 && a2 > a1) { try { return JSON.parse(clean.slice(a1, a2 + 1)); } catch {} }
  try { return JSON.parse(clean.replace(/,\s*([}\]])/g, "$1")); } catch {}
  console.error("extractJSON FAILED on:", clean.slice(0, 200));
  return null;
}

// Accepts ["a","b"] OR {"skills":["a","b"]} and always returns an array of strings
function toSkillArray(result) {
  if (Array.isArray(result)) return result.filter(s => typeof s === "string");
  if (result && typeof result === "object") {
    for (const v of Object.values(result)) {
      if (Array.isArray(v)) return v.filter(s => typeof s === "string");
    }
  }
  return [];
}

// ─── Skill dictionary (works even when the AI fails) ─────────────────────────
const SKILL_DB = [
  ["JavaScript", ["js", "es6", "ecmascript"]],
  ["TypeScript", ["ts"]],
  ["Python", ["python3"]],
  ["Java", ["core java"]],
  ["C++", ["cpp"]],
  ["C#", ["csharp"]],
  ["Golang", ["go lang"]],
  ["Rust", []],
  ["PHP", []],
  ["Ruby", ["ruby on rails", "rails"]],
  ["Kotlin", []],
  ["Swift", []],
  ["SQL", []],
  ["MySQL", []],
  ["PostgreSQL", ["postgres"]],
  ["MongoDB", ["mongo db", "mongoose"]],
  ["NoSQL", []],
  ["Redis", []],
  ["DynamoDB", []],
  ["Firebase", []],
  ["HTML", ["html5"]],
  ["CSS", ["css3"]],
  ["React", ["react.js", "reactjs", "react js"]],
  ["Next.js", ["nextjs", "next js"]],
  ["Node.js", ["nodejs", "node js"]],
  ["Express.js", ["expressjs", "express js"]],
  ["Angular", ["angularjs"]],
  ["Vue.js", ["vue", "vuejs"]],
  ["Redux", []],
  ["Tailwind CSS", ["tailwind", "tailwindcss"]],
  ["Bootstrap", []],
  ["Django", []],
  ["Flask", []],
  ["Spring Boot", ["spring", "springboot"]],
  ["REST API", ["rest apis", "restful", "restful api", "restful apis", "rest"]],
  ["GraphQL", []],
  ["WebSocket", ["websockets", "socket.io"]],
  ["JWT", ["json web token"]],
  ["Docker", []],
  ["Kubernetes", ["k8s"]],
  ["AWS", ["amazon web services"]],
  ["Azure", []],
  ["GCP", ["google cloud"]],
  ["EC2", []],
  ["S3", []],
  ["Lambda", ["aws lambda"]],
  ["Terraform", []],
  ["Git", []],
  ["GitHub", []],
  ["CI/CD", ["cicd", "ci cd", "continuous integration"]],
  ["Jenkins", []],
  ["Linux", ["unix"]],
  ["Agile", []],
  ["Scrum", []],
  ["Data Structures", ["data structure", "dsa"]],
  ["Algorithms", ["algorithm", "algorithmic", "dsa"]],
  ["Object-Oriented Design", ["oop", "oops", "object oriented", "object-oriented", "object oriented design", "object oriented programming", "object-oriented programming"]],
  ["System Design", ["hld", "lld", "low level design", "high level design"]],
  ["Design Patterns", []],
  ["Operating Systems", ["os concepts"]],
  ["Computer Networks", ["networking"]],
  ["DBMS", ["database management"]],
  ["Multithreading", ["concurrency", "multi-threading"]],
  ["Distributed Systems", []],
  ["Microservices", ["microservice"]],
  ["Complexity Analysis", ["time complexity", "space complexity", "big o"]],
  ["Machine Learning", ["ml"]],
  ["Deep Learning", ["neural networks"]],
  ["TensorFlow", []],
  ["PyTorch", []],
  ["Pandas", []],
  ["NumPy", []],
  ["Unit Testing", ["unit tests", "junit", "jest", "mocha"]],
  ["Kafka", []],
  ["RabbitMQ", []],
  ["Elasticsearch", []],
  ["Postman", []],
  ["Figma", []],
  ["LLM", ["llms", "large language model", "large language models"]],
  ["RAG", ["retrieval augmented generation", "retrieval-augmented generation"]],
  ["LangChain", []],
  ["OpenAI API", ["openai", "gpt-4", "gpt"]],
  ["Prompt Engineering", []],
  ["Hugging Face", ["huggingface"]],
  ["Vector Database", ["vector databases", "pinecone", "chromadb", "faiss"]],
  ["NLP", ["natural language processing"]],
  ["Generative AI", ["genai", "gen ai"]],
  ["Scikit-learn", ["sklearn", "scikit learn"]],
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BOUNDARY_L = "(?<![A-Za-z0-9+#.])";
const BOUNDARY_R = "(?![A-Za-z0-9+#])";

const SKILL_REGEX = SKILL_DB.map(([name, aliases]) => ({
  name,
  aliases: aliases.map(a => a.toLowerCase()),
  re: new RegExp(
    BOUNDARY_L + "(?:" + [name.toLowerCase(), ...aliases.map(a => a.toLowerCase())].map(escapeRe).join("|") + ")" + BOUNDARY_R,
    "gi"
  ),
}));

function detectSkills(text) {
  const found = [];
  for (const { name, re } of SKILL_REGEX) {
    if ((text.match(re) || []).length > 0) found.push(name);
  }
  return found;
}

function canonical(skill) {
  const lower = skill.toLowerCase().trim();
  for (const e of SKILL_REGEX) {
    if (e.name.toLowerCase() === lower || e.aliases.includes(lower)) return e.name;
  }
  return skill.trim();
}

function countInText(skill, text) {
  const known = SKILL_REGEX.find(e => e.name.toLowerCase() === skill.toLowerCase());
  const re = known
    ? known.re
    : new RegExp(BOUNDARY_L + escapeRe(skill.toLowerCase()) + BOUNDARY_R, "gi");
  return (text.match(re) || []).length;
}

function mergeSkills(detected, aiList) {
  const map = new Map();
  detected.forEach(n => map.set(n.toLowerCase(), n));
  aiList.forEach(s => {
    const c = canonical(s);
    if (c.length > 1 && c.length < 40 && !map.has(c.toLowerCase())) map.set(c.toLowerCase(), c);
  });
  return [...map.values()];
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
      { expiresIn: "1h" }
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
  return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, " ").trim();
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// ─── AI: skills (extra coverage on top of the dictionary) ────────────────────
async function aiSkills(text, kind) {
  const what = kind === "resume" ? "this resume" : "this job description (required and preferred skills)";
  const prompt = `List the technical skills, programming languages, frameworks, tools, databases, cloud services and CS fundamentals mentioned in ${what}.

Text:
${text.slice(0, 2500)}

Respond with ONLY a JSON array of short skill names, like ["Python","React","MySQL"].`;
  try {
    const raw = await askGroq(prompt, 1200);
    return toSkillArray(extractJSON(raw));
  } catch (e) {
    console.error(`AI ${kind} skills failed:`, e.message);
    return [];
  }
}

// ─── AI: feedback ─────────────────────────────────────────────────────────────
async function getFeedback(resumeText, jdText, matchScore, missingSkills) {
  const prompt = `You are a career coach. Give 3 personalized improvement tips for this resume against this job description.

Resume:
${resumeText.slice(0, 1000)}

Job Description:
${jdText.slice(0, 700)}

Match score: ${matchScore}%
Skills the candidate is missing: ${missingSkills.slice(0, 6).join(", ") || "none"}

Respond with ONLY a JSON array of exactly 3 objects: [{"title":"...","description":"..."}]`;
  try {
    const result = extractJSON(await askGroq(prompt, 1500));
    const arr = Array.isArray(result) ? result : toSkillArrayObjects(result);
    if (arr.length >= 3) return arr.slice(0, 3);
  } catch (e) { console.error("Feedback failed:", e.message); }
  return [
    { title: "Quantify your achievements", description: "Add numbers and percentages to project results to show measurable impact." },
    { title: "Close the skill gaps", description: `Learn and mention ${missingSkills.slice(0, 3).join(", ") || "the missing skills"} in your projects.` },
    { title: "Tailor your summary", description: "Rewrite your summary to mirror the language of this job description." },
  ];
}
function toSkillArrayObjects(result) {
  if (result && typeof result === "object") {
    for (const v of Object.values(result)) if (Array.isArray(v)) return v;
  }
  return [];
}

// ─── AI: ATS ──────────────────────────────────────────────────────────────────
async function getATS(resumeText) {
  const prompt = `You are a strict ATS expert. Score this specific resume for ATS compatibility.

Resume:
${resumeText.slice(0, 2000)}

Criteria: standard section headers (20), no tables/columns (15), contact info (15), bullet points (10), keyword density (20), clean formatting (10), quantified achievements (10).

Respond with ONLY this JSON:
{"ats_score": <0-100>, "grade": "<A|B|C|D|F>", "summary": "<one sentence about THIS resume>", "passed_checks": ["..."], "issues": [{"severity":"high|medium|low","issue":"...","fix":"..."}]}`;
  try {
    const r = extractJSON(await askGroq(prompt, 1500));
    if (r && typeof r.ats_score === "number") return r;
  } catch (e) { console.error("ATS failed:", e.message); }

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resumeText);
  const hasPhone = /\+?\d[\d\s\-()]{8,}\d/.test(resumeText);
  const hasBullets = /[•\-*]/.test(resumeText);
  const hasSkills = /skills?|technologies|tools/i.test(resumeText);
  const hasExp = /experience|internship|employment/i.test(resumeText);
  const hasEdu = /education|university|college|b\.?tech|bachelor/i.test(resumeText);
  const hasMetrics = /\d+\s?%|\d+\+/.test(resumeText);
  const score = 25 + (hasEmail ? 12 : 0) + (hasPhone ? 8 : 0) + (hasBullets ? 10 : 0) + (hasSkills ? 15 : 0) + (hasExp ? 12 : 0) + (hasEdu ? 8 : 0) + (hasMetrics ? 10 : 0);
  return {
    ats_score: score,
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F",
    summary: `Structural check scored this resume ${score}/100.`,
    passed_checks: [hasEmail && "Email found", hasPhone && "Phone number found", hasSkills && "Skills section found", hasExp && "Experience section found"].filter(Boolean),
    issues: [
      !hasMetrics && { severity: "high", issue: "No quantified achievements", fix: "Add numbers like 'reduced load time by 30%'" },
      !hasBullets && { severity: "medium", issue: "No bullet points detected", fix: "Use bullet points for project and job descriptions" },
    ].filter(Boolean),
  };
}

// ─── AI: Tone ─────────────────────────────────────────────────────────────────
async function getTone(resumeText) {
  const prompt = `Analyze the professional tone of this specific resume. Be accurate, not generic.

Resume:
${resumeText.slice(0, 1500)}

Respond with ONLY this JSON:
{"tone_score":<0-100>,"authority_score":<0-100>,"clarity_score":<0-100>,"action_verbs_score":<0-100>,"tone_type":"passive|neutral|confident|authoritative","overall_assessment":"<2-3 sentences about THIS resume>","strengths":["..."],"improvements":["..."],"weak_phrases":["<phrase actually in the resume>"],"strong_phrases":["<phrase actually in the resume>"]}`;
  try {
    const r = extractJSON(await askGroq(prompt, 1500));
    if (r && typeof r.tone_score === "number") return r;
  } catch (e) { console.error("Tone failed:", e.message); }

  const verbs = ["led", "built", "developed", "created", "designed", "implemented", "managed", "improved", "reduced", "increased", "achieved", "delivered", "launched", "optimized", "deployed"];
  const verbCount = verbs.filter(v => resumeText.toLowerCase().includes(v)).length;
  const hasNumbers = /\d+\s?%|\d+\+/.test(resumeText);
  const toneScore = Math.min(95, 45 + verbCount * 5 + (hasNumbers ? 15 : 0));
  return {
    tone_score: toneScore,
    authority_score: Math.max(35, toneScore - 8),
    clarity_score: Math.min(95, toneScore + 5),
    action_verbs_score: Math.min(95, verbCount * 10),
    tone_type: toneScore >= 75 ? "confident" : toneScore >= 60 ? "neutral" : "passive",
    overall_assessment: `Found ${verbCount} action verbs${hasNumbers ? " and quantified results." : " but no quantified results."}`,
    strengths: [verbCount > 3 ? "Uses action verbs" : "Clear structure"],
    improvements: [hasNumbers ? "Add more metrics" : "Add measurable results", "Use stronger action verbs"],
    weak_phrases: [], strong_phrases: [],
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
      return res.status(400).json({ error: "Resume text too short. Please paste your resume text directly." });

    // 1) Skills: dictionary (always works) + AI (extra coverage)
    const dictResume = detectSkills(cleanResume);
    const dictJD     = detectSkills(cleanJD);
    console.log("Dictionary → resume:", dictResume.length, "| JD:", dictJD.length);

    const aiResume = await aiSkills(cleanResume, "resume");
    await wait(700);
    const aiJD = await aiSkills(cleanJD, "jd");
    console.log("AI → resume:", aiResume.length, "| JD:", aiJD.length);

    const resumeSkills = mergeSkills(dictResume, aiResume);
    const jdSkills     = mergeSkills(dictJD, aiJD).slice(0, 25);

    if (jdSkills.length === 0)
      return res.status(422).json({ error: "Could not find any skills in the job description. Please paste the full job description, including the requirements section." });

    // 2) Match: a JD skill counts as matched if it appears in the resume text or in the resume skill list
    const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));
    const matchedSkills = jdSkills.filter(s => resumeSet.has(s.toLowerCase()) || countInText(s, cleanResume) > 0);
    const missingSkills = jdSkills.filter(s => !matchedSkills.includes(s));
    const matchScore    = Math.round((matchedSkills.length / jdSkills.length) * 100);
    console.log(`✅ Match ${matchScore}% | matched: ${matchedSkills.join(", ")} | missing: ${missingSkills.join(", ")}`);

    // 3) Keywords — computed from real data, not guessed by the AI
    const top = jdSkills.slice(0, 14);
    const mentionedTwice = top.filter(s => countInText(s, cleanResume) >= 2).length;
    const keyword_analysis = {
      keyword_score: Math.round((top.filter(s => matchedSkills.includes(s)).length / top.length) * 100),
      density_score: Math.round((mentionedTwice / top.length) * 100),
      recommendation: missingSkills.length
        ? `Add ${missingSkills.slice(0, 4).join(", ")} to your skills section or project descriptions, but only if you have real experience with them.`
        : "Your resume covers all the keywords. Mention the key ones in more than one place (skills and projects).",
      high_priority:   top.slice(0, 8).map(k => ({ keyword: k, in_resume: matchedSkills.includes(k) })),
      medium_priority: top.slice(8).map(k => ({ keyword: k, in_resume: matchedSkills.includes(k) })),
    };

    // 4) AI parts
    await wait(700);
    const feedback = await getFeedback(cleanResume, cleanJD, matchScore, missingSkills);
    await wait(700);
    const atsResult = await getATS(cleanResume);
    await wait(700);
    const toneResult = await getTone(cleanResume);

    const learningResources = getLearningResources(missingSkills);

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: { analyses: { matchScore, matchedSkills: matchedSkills.slice(0, 5), missingSkills: missingSkills.slice(0, 5), atsScore: atsResult?.ats_score || 0 } }
      }).catch(e => console.error("MongoDB save error:", e.message));
    }

    console.log("✅ Analysis complete!");

    res.json({
      match_score:        matchScore,
      matched_skills:     matchedSkills,
      missing_skills:     missingSkills,
      important_keywords: jdSkills.slice(0, 6),
      feedback,
      learning_resources: learningResources,
      ats_analysis:       atsResult,
      keyword_analysis,
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