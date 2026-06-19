// All links verified - using direct video URLs not playlists
// These are the most viewed tutorial videos on YouTube

const LEARNING_DB = [

  {
    keys: ["html", "html5"],
    skill: "HTML",
    why: "HTML is the foundation of every website and mandatory for all frontend roles.",
    resource: {
      title: "HTML Full Course - Build a Website Tutorial",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
      duration: "2 hours"
    },
    topics: ["Tags", "Forms", "Tables", "Semantic HTML", "Links", "Images"]
  },

  {
    keys: ["css", "css3"],
    skill: "CSS",
    why: "CSS is required for styling websites — every frontend job needs it.",
    resource: {
      title: "CSS Tutorial - Zero to Hero (Complete Course)",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
      duration: "6 hours"
    },
    topics: ["Selectors", "Flexbox", "Grid", "Animations", "Responsive Design"]
  },

  {
    keys: ["html & css", "html/css", "html and css"],
    skill: "HTML & CSS",
    why: "HTML & CSS are the building blocks of the web required for all frontend positions.",
    resource: {
      title: "HTML & CSS Full Course - Beginner to Pro",
      channel: "SuperSimpleDev",
      url: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
      duration: "6.5 hours"
    },
    topics: ["HTML5", "CSS3", "Flexbox", "Responsive", "Projects"]
  },

  {
    keys: ["javascript", "js", "es6", "vanilla js"],
    skill: "JavaScript",
    why: "JavaScript is the most demanded language for web development globally.",
    resource: {
      title: "JavaScript Programming - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=jS4aFq5-91M",
      duration: "8 hours"
    },
    topics: ["Variables", "Functions", "DOM", "ES6", "Async/Await", "OOP"]
  },

  {
    keys: ["react", "react.js", "reactjs", "react js"],
    skill: "React.js",
    why: "React is the #1 frontend framework demanded by employers worldwide.",
    resource: {
      title: "React Course - Beginner's Tutorial for React JavaScript Library",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      duration: "12 hours"
    },
    topics: ["Components", "Hooks", "State", "Props", "Context API", "React Router"]
  },

  {
    keys: ["node.js", "node", "nodejs"],
    skill: "Node.js",
    why: "Node.js is essential for backend development and full-stack JavaScript roles.",
    resource: {
      title: "Node.js and Express.js - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      duration: "8 hours"
    },
    topics: ["Express", "REST API", "Middleware", "npm", "Authentication"]
  },

  {
    keys: ["express", "express.js"],
    skill: "Express.js",
    why: "Express is the most widely used Node.js framework for building APIs.",
    resource: {
      title: "Node.js and Express.js - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      duration: "8 hours"
    },
    topics: ["Routing", "Middleware", "REST API", "Error Handling"]
  },

  {
    keys: ["python", "python3"],
    skill: "Python",
    why: "Python is the #1 language for data science, AI/ML, and backend development.",
    resource: {
      title: "Python for Everybody - Full University Python Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=8DvywoWv6fI",
      duration: "14 hours"
    },
    topics: ["Variables", "Functions", "OOP", "File Handling", "Modules", "Libraries"]
  },

  {
    keys: ["java", "core java"],
    skill: "Java",
    why: "Java is widely used in enterprise backend, Android apps, and product companies.",
    resource: {
      title: "Java Programming for Beginners - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=A74TOX803D0",
      duration: "8 hours"
    },
    topics: ["OOP", "Collections", "Streams", "Exception Handling", "Multithreading"]
  },

  {
    keys: ["c++", "cpp"],
    skill: "C++",
    why: "C++ is essential for competitive programming and product-based company interviews.",
    resource: {
      title: "C++ Tutorial for Beginners - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
      duration: "4 hours"
    },
    topics: ["Syntax", "OOP", "STL", "Pointers", "Templates", "Memory Management"]
  },

  {
    keys: ["dsa", "data structures", "data structures and algorithms", "algorithms"],
    skill: "Data Structures & Algorithms",
    why: "DSA is tested in every product company interview — non-negotiable for software engineers.",
    resource: {
      title: "Data Structures and Algorithms - Full Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=8hly31xKli0",
      duration: "8 hours"
    },
    topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Sorting"]
  },

  {
    keys: ["dynamic programming", "dp"],
    skill: "Dynamic Programming",
    why: "DP is one of the most frequently asked topics in product company coding interviews.",
    resource: {
      title: "Dynamic Programming - Learn to Solve Algorithmic Problems",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=oBt53YbR9Kk",
      duration: "5 hours"
    },
    topics: ["Memoization", "Tabulation", "Knapsack", "LCS", "LIS", "Coin Change"]
  },

  {
    keys: ["typescript", "ts"],
    skill: "TypeScript",
    why: "TypeScript is now standard in professional React and Node.js projects.",
    resource: {
      title: "TypeScript - The Basics",
      channel: "Fireship",
      url: "https://www.youtube.com/watch?v=ahCwqrYpIuM",
      duration: "12 minutes"
    },
    topics: ["Types", "Interfaces", "Generics", "Enums", "Type Guards"]
  },

  {
    keys: ["next.js", "nextjs", "next js"],
    skill: "Next.js",
    why: "Next.js is used for production React apps and demanded in full-stack roles.",
    resource: {
      title: "Next.js 13 Full Course 2023",
      channel: "Dave Gray",
      url: "https://www.youtube.com/watch?v=843nec-IvW0",
      duration: "3 hours"
    },
    topics: ["App Router", "Server Components", "SSR", "SSG", "API Routes"]
  },

  {
    keys: ["vue", "vue.js", "vuejs"],
    skill: "Vue.js",
    why: "Vue.js is growing rapidly and many startups prefer it for frontend development.",
    resource: {
      title: "Vue.js Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=FXpIoQ_rT_c",
      duration: "3 hours"
    },
    topics: ["Components", "Directives", "Vuex", "Vue Router", "Composition API"]
  },

  {
    keys: ["sql", "mysql", "database", "rdbms"],
    skill: "SQL & MySQL",
    why: "SQL is used in almost every company and asked in data and backend interviews.",
    resource: {
      title: "MySQL Tutorial for Beginners - Full Course",
      channel: "Programming with Mosh",
      url: "https://www.youtube.com/watch?v=7S_tz1z_5bA",
      duration: "3 hours"
    },
    topics: ["SELECT", "JOINs", "Subqueries", "Indexes", "Stored Procedures", "Transactions"]
  },

  {
    keys: ["mongodb", "nosql", "mongoose"],
    skill: "MongoDB",
    why: "MongoDB is the go-to NoSQL database for Node.js and full-stack applications.",
    resource: {
      title: "MongoDB Crash Course",
      channel: "Traversy Media",
      url: "https://www.youtube.com/watch?v=-56x56UppqQ",
      duration: "40 minutes"
    },
    topics: ["Documents", "Collections", "CRUD", "Aggregation", "Mongoose"]
  },

  {
    keys: ["postgresql", "postgres"],
    skill: "PostgreSQL",
    why: "PostgreSQL is used by startups and enterprises for complex data workloads.",
    resource: {
      title: "Learn PostgreSQL Tutorial - Full Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=qw--VYLpxG4",
      duration: "4 hours"
    },
    topics: ["CRUD", "JOINs", "Transactions", "Indexes", "JSON Support", "Constraints"]
  },

  {
    keys: ["git", "github", "version control"],
    skill: "Git & GitHub",
    why: "Git is used in 100% of software companies — it is a must-have skill.",
    resource: {
      title: "Git and GitHub for Beginners - Crash Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
      duration: "1 hour"
    },
    topics: ["Init", "Commits", "Branches", "Merge", "Pull Requests", "GitHub"]
  },

  {
    keys: ["docker", "containerization", "containers"],
    skill: "Docker",
    why: "Docker is now standard in every software company for containerizing applications.",
    resource: {
      title: "Docker Tutorial for Beginners - A Full DevOps Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      duration: "2 hours"
    },
    topics: ["Containers", "Images", "Dockerfile", "Docker Compose", "Volumes", "Networks"]
  },

  {
    keys: ["kubernetes", "k8s"],
    skill: "Kubernetes",
    why: "Kubernetes is the industry standard for container orchestration in production.",
    resource: {
      title: "Kubernetes Tutorial for Beginners - Full Course in 4 Hours",
      channel: "TechWorld with Nana",
      url: "https://www.youtube.com/watch?v=X48VuDVv0do",
      duration: "4 hours"
    },
    topics: ["Pods", "Deployments", "Services", "ConfigMaps", "Ingress", "Helm"]
  },

  {
    keys: ["aws", "amazon web services", "cloud", "cloud computing"],
    skill: "AWS",
    why: "AWS is the world's leading cloud platform — knowledge of it increases your salary significantly.",
    resource: {
      title: "AWS Certified Cloud Practitioner Certification Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=SOTamWNgDKc",
      duration: "14 hours"
    },
    topics: ["EC2", "S3", "Lambda", "RDS", "IAM", "CloudFormation", "VPC"]
  },

  {
    keys: ["machine learning", "ml"],
    skill: "Machine Learning",
    why: "ML engineers are among the highest paid tech professionals today.",
    resource: {
      title: "Machine Learning with Python and Scikit-Learn - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=hDKCxebp88A",
      duration: "10 hours"
    },
    topics: ["Regression", "Classification", "Clustering", "scikit-learn", "Model Evaluation"]
  },

  {
    keys: ["deep learning", "neural networks", "tensorflow", "pytorch", "ai"],
    skill: "Deep Learning",
    why: "Deep learning is core to AI and is in high demand in AI/ML engineering roles.",
    resource: {
      title: "Deep Learning Crash Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=VyWAvY2CF9c",
      duration: "2 hours"
    },
    topics: ["Neural Networks", "CNN", "RNN", "Backpropagation", "TensorFlow", "Keras"]
  },

  {
    keys: ["data analysis", "pandas", "numpy", "data science", "data analyst"],
    skill: "Data Analysis with Python",
    why: "Data analysis skills are demanded in data analyst and data science roles.",
    resource: {
      title: "Data Analysis with Python - Full Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
      duration: "4 hours"
    },
    topics: ["Pandas", "NumPy", "Matplotlib", "Data Cleaning", "EDA", "Visualization"]
  },

  {
    keys: ["system design", "hld", "lld"],
    skill: "System Design",
    why: "System design is asked in senior-level and FAANG interviews.",
    resource: {
      title: "System Design for Beginners Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=m8Icp_Cid5o",
      duration: "2 hours"
    },
    topics: ["Scalability", "Load Balancing", "Caching", "Databases", "Microservices"]
  },

  {
    keys: ["tailwind", "tailwind css", "tailwindcss"],
    skill: "Tailwind CSS",
    why: "Tailwind CSS is the most popular CSS framework in modern frontend development.",
    resource: {
      title: "Tailwind CSS Full Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=lCxcTsOHrjo",
      duration: "4 hours"
    },
    topics: ["Utility Classes", "Responsive Design", "Dark Mode", "Custom Config"]
  },

  {
    keys: ["linux", "unix", "bash", "shell scripting"],
    skill: "Linux & Shell",
    why: "Linux command line skills are expected in backend, DevOps, and cloud roles.",
    resource: {
      title: "Linux Command Line Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=iwolPf6kN-k",
      duration: "5 hours"
    },
    topics: ["Navigation", "File Permissions", "Processes", "Bash Scripts", "Networking"]
  },

  {
    keys: ["graphql"],
    skill: "GraphQL",
    why: "GraphQL is replacing REST in many modern companies for efficient data fetching.",
    resource: {
      title: "GraphQL Full Course - Novice to Expert",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=ed8SzALpx1Q",
      duration: "4 hours"
    },
    topics: ["Queries", "Mutations", "Resolvers", "Apollo", "Schema Design"]
  },

  {
    keys: ["redux", "state management"],
    skill: "Redux",
    why: "Redux is widely used for state management in large-scale React applications.",
    resource: {
      title: "Redux Tutorial - Beginner to Advanced",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=zrs7u6bdbUw",
      duration: "3 hours"
    },
    topics: ["Store", "Actions", "Reducers", "Redux Toolkit", "Async Thunk"]
  },

  {
    keys: ["agile", "scrum"],
    skill: "Agile & Scrum",
    why: "Agile methodology is used in almost all software teams.",
    resource: {
      title: "Agile Scrum Full Course in 4 hours",
      channel: "Simplilearn",
      url: "https://www.youtube.com/watch?v=2Vt7Ik8Ublw",
      duration: "4 hours"
    },
    topics: ["Sprints", "User Stories", "Scrum Master", "Retrospectives", "Kanban"]
  },

  {
    keys: ["redis", "caching", "cache"],
    skill: "Redis",
    why: "Redis is used for caching and essential for backend and system design roles.",
    resource: {
      title: "Redis Crash Course - the What, Why and How to use Redis",
      channel: "Web Dev Simplified",
      url: "https://www.youtube.com/watch?v=jgpVdJB2sKQ",
      duration: "30 minutes"
    },
    topics: ["Key-Value Store", "Caching", "Pub/Sub", "Sessions", "TTL"]
  },

  {
    keys: ["ci/cd", "devops", "jenkins", "github actions"],
    skill: "CI/CD & DevOps",
    why: "CI/CD pipelines are standard in all product companies for automated deployment.",
    resource: {
      title: "DevOps Engineering Course for Beginners",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
      duration: "2 hours"
    },
    topics: ["CI/CD", "GitHub Actions", "Jenkins", "Docker", "Automated Testing"]
  },

  {
    keys: ["spring", "spring boot", "spring framework"],
    skill: "Spring Boot",
    why: "Spring Boot is the most popular Java framework for building enterprise applications.",
    resource: {
      title: "Spring Boot Tutorial for Beginners - Full Course",
      channel: "freeCodeCamp.org",
      url: "https://www.youtube.com/watch?v=vtPkZShrvXQ",
      duration: "2.5 hours"
    },
    topics: ["REST APIs", "Dependency Injection", "JPA", "Security", "Microservices"]
  },

  {
    keys: ["flutter", "dart"],
    skill: "Flutter",
    why: "Flutter lets you build iOS, Android, and web apps from a single codebase.",
    resource: {
      title: "Flutter Course for Beginners - 37-hour Flutter Dev Bootcamp",
      channel: "Angela Yu / App Brewery",
      url: "https://www.youtube.com/watch?v=VPvVD8t02U8",
      duration: "37 hours"
    },
    topics: ["Widgets", "State Management", "Navigation", "HTTP", "Firebase"]
  },

];

// ── Match skill to database ───────────────────────────────────────────────────
function findResource(skillName) {
  const key = skillName.toLowerCase().trim();
  for (const entry of LEARNING_DB) {
    for (const k of entry.keys) {
      if (key === k || key.includes(k) || k.includes(key)) {
        return entry;
      }
    }
  }
  return null;
}

function getLearningResources(missingSkills) {
  const results    = [];
  const seenSkills = new Set();
  for (const skill of missingSkills) {
    if (results.length >= 5) break;
    const entry = findResource(skill);
    if (entry && !seenSkills.has(entry.skill)) {
      seenSkills.add(entry.skill);
      results.push({
        skill:    entry.skill,
        why:      entry.why,
        resource: entry.resource,
        topics:   entry.topics,
      });
    }
  }
  return results;
}

module.exports = { getLearningResources };