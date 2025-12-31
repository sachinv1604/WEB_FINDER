const mongoose = require('mongoose');
require('dotenv').config();
const Website = require('./models/Website');

const sampleWebsites = [
  {
  name: "ChatGPT",
  url: "https://chat.openai.com",
  description: "AI assistant for writing content, solving coding problems, preparing resumes, answering questions, learning concepts, and boosting productivity. Widely used by students, developers, and professionals.",
  category: "AI & Automation",
  tags: [
    "ai chatbot",
    "chatgpt alternative",
    "coding help ai",
    "resume writing ai",
    "study assistant",
    "ai for students",
    "content writing ai"
  ],
  popularity: 100
},
{
  name: "Perplexity AI",
  url: "https://www.perplexity.ai",
  description: "AI-powered answer engine that provides direct, researched answers with sources. Useful for research, learning, and quick factual queries.",
  category: "AI & Automation",
  tags: [
    "ai search engine",
    "research ai",
    "answer engine",
    "chatgpt competitor",
    "ai for research"
  ],
  popularity: 92
},
{
  name: "Resume.io",
  url: "https://resume.io",
  description: "Online resume builder to create professional resumes and CVs quickly using ready-made templates. Popular among freshers and job seekers.",
  category: "Career & Jobs",
  tags: [
    "resume builder",
    "cv maker online",
    "job resume",
    "placement resume",
    "free resume templates"
  ],
  popularity: 91
},
{
  name: "Novoresume",
  url: "https://novoresume.com",
  description: "Modern resume and cover letter builder designed for professionals and students applying for jobs.",
  category: "Career & Jobs",
  tags: [
    "resume design",
    "cover letter builder",
    "job application",
    "resume for freshers"
  ],
  popularity: 89
},
{
  name: "Canva",
  url: "https://www.canva.com",
  description: "Online design tool to create posters, resumes, presentations, Instagram posts, YouTube thumbnails, logos, and marketing designs without design skills.",
  category: "Design & Creativity",
  tags: [
    "make poster online",
    "resume design",
    "presentation slides",
    "instagram post design",
    "youtube thumbnail",
    "graphic design without photoshop"
  ],
  popularity: 95
},
{
  name: "Photopea",
  url: "https://www.photopea.com",
  description: "Free online photo editor similar to Photoshop for editing images, PSD files, posters, and graphics directly in the browser.",
  category: "Design & Creativity",
  tags: [
    "photoshop alternative",
    "edit psd online",
    "photo editing free",
    "graphic editing tool"
  ],
  popularity: 86
},
{
  name: "Figma",
  url: "https://www.figma.com",
  description: "Collaborative UI/UX design and prototyping tool used by designers and developers to build app and website designs.",
  category: "Design & Creativity",
  tags: [
    "ui ux design",
    "app design tool",
    "website design",
    "figma for beginners"
  ],
  popularity: 90
},
{
  name: "LeetCode",
  url: "https://leetcode.com",
  description: "Platform for practicing data structures and algorithms, commonly used for coding interviews and placement preparation.",
  category: "Education & Learning",
  tags: [
    "coding practice",
    "dsa problems",
    "interview preparation",
    "placement coding"
  ],
  popularity: 91
},
{
  name: "GeeksforGeeks",
  url: "https://www.geeksforgeeks.org",
  description: "Computer science learning platform with tutorials, algorithms, coding problems, and interview preparation material.",
  category: "Education & Learning",
  tags: [
    "learn programming",
    "dsa tutorials",
    "interview questions",
    "computer science basics"
  ],
  popularity: 94
},
{
  name: "FreeCodeCamp",
  url: "https://www.freecodecamp.org",
  description: "Free platform to learn coding with hands-on projects and certifications in web development and programming.",
  category: "Education & Learning",
  tags: [
    "learn coding free",
    "web development",
    "coding certification",
    "practice programming"
  ],
  popularity: 92
},
{
  name: "Coursera",
  url: "https://www.coursera.org",
  description: "Online learning platform offering courses and certificates from universities and companies for career growth.",
  category: "Education & Learning",
  tags: [
    "online courses",
    "professional certificates",
    "learn skills online",
    "career upskilling"
  ],
  popularity: 91
},
{
  name: "Udemy",
  url: "https://www.udemy.com",
  description: "Video-based learning platform with affordable courses on programming, business, design, and personal development.",
  category: "Education & Learning",
  tags: [
    "online tutorials",
    "learn programming",
    "cheap courses",
    "skill development"
  ],
  popularity: 90
},
{
  name: "Notion",
  url: "https://www.notion.so",
  description: "All-in-one workspace for notes, study planning, task management, documentation, and collaboration.",
  category: "Productivity",
  tags: [
    "study planner",
    "notes app",
    "task management",
    "student productivity"
  ],
  popularity: 88
},
{
  name: "Google Drive",
  url: "https://drive.google.com",
  description: "Cloud storage platform to store, share, and collaborate on documents, sheets, and presentations.",
  category: "Productivity",
  tags: [
    "cloud storage",
    "file sharing",
    "online documents",
    "collaboration tool"
  ],
  popularity: 97
},
{
  name: "GitHub",
  url: "https://github.com",
  description: "Code hosting platform for version control, collaboration, and showcasing development projects.",
  category: "Development",
  tags: [
    "host code",
    "git repository",
    "developer portfolio",
    "open source projects"
  ],
  popularity: 98
},
{
  name: "Stack Overflow",
  url: "https://stackoverflow.com",
  description: "Question and answer platform for programmers to solve coding errors and learn new technologies.",
  category: "Development",
  tags: [
    "coding errors",
    "programming help",
    "developer questions",
    "debugging"
  ],
  popularity: 96
},
{
  name: "Vercel",
  url: "https://vercel.com",
  description: "Hosting and deployment platform for frontend applications like React and Next.js.",
  category: "Development",
  tags: [
    "deploy react app",
    "frontend hosting",
    "free hosting",
    "vercel deployment"
  ],
  popularity: 94
},
{
  name: "Netlify",
  url: "https://www.netlify.com",
  description: "Platform to deploy static websites and frontend applications with CI/CD support.",
  category: "Development",
  tags: [
    "static site hosting",
    "deploy website free",
    "frontend deployment"
  ],
  popularity: 93
},
{
  name: "LinkedIn",
  url: "https://www.linkedin.com",
  description: "Professional networking platform for job search, internships, placements, and career growth.",
  category: "Career & Jobs",
  tags: [
    "job search",
    "professional networking",
    "internships",
    "placements"
  ],
  popularity: 93
},
{
  name: "Indeed",
  url: "https://www.indeed.com",
  description: "Job search engine to find full-time, part-time, and remote job opportunities.",
  category: "Career & Jobs",
  tags: [
    "find jobs",
    "job search website",
    "freshers jobs"
  ],
  popularity: 93
},
{
  name: "Internshala",
  url: "https://internshala.com",
  description: "Indian platform for internships, training, and fresher job opportunities.",
  category: "Career & Jobs",
  tags: [
    "internships",
    "freshers jobs",
    "student internships",
    "india jobs"
  ],
  popularity: 92
},
{
  name: "YouTube",
  url: "https://www.youtube.com",
  description: "Video platform for learning, entertainment, tutorials, and content creation.",
  category: "Entertainment & Learning",
  tags: [
    "learn from videos",
    "coding tutorials",
    "educational videos",
    "content creation"
  ],
  popularity: 100
},
{
  name: "Medium",
  url: "https://medium.com",
  description: "Blogging and article platform for reading and writing content on technology, career, and personal growth.",
  category: "Writing & Content",
  tags: [
    "tech blogs",
    "writing articles",
    "learning from blogs"
  ],
  popularity: 88
},
{
  name: "Substack",
  url: "https://substack.com",
  description: "Newsletter publishing platform for writers and content creators.",
  category: "Writing & Content",
  tags: [
    "newsletter platform",
    "content writing",
    "email newsletters"
  ],
  popularity: 84
},
{
  name: "Spotify",
  url: "https://www.spotify.com",
  description: "Music and podcast streaming platform for entertainment and focus sessions.",
  category: "Entertainment",
  tags: [
    "music streaming",
    "podcasts",
    "study music"
  ],
  popularity: 95
},
{
  name: "Netflix",
  url: "https://www.netflix.com",
  description: "Streaming platform for movies, series, documentaries, and originals.",
  category: "Entertainment",
  tags: [
    "movies streaming",
    "web series",
    "watch online"
  ],
  popularity: 98
},
{
  name: "Amazon",
  url: "https://www.amazon.com",
  description: "E-commerce platform to buy products online including electronics, books, and daily essentials.",
  category: "Shopping",
  tags: [
    "online shopping",
    "buy products online",
    "ecommerce website"
  ],
  popularity: 99
},
{
  name: "Claude AI",
  url: "https://claude.ai",
  description: "AI assistant focused on reasoning, writing, summarization, and safe conversations. Popular for long documents and deep analysis.",
  category: "AI & Automation",
  tags: [
    "ai assistant",
    "chatgpt alternative",
    "writing ai",
    "document analysis ai",
    "ai for students"
  ],
  popularity: 94
},
{
  name: "Gemini",
  url: "https://gemini.google.com",
  description: "Googleâ€™s AI assistant for answering questions, writing content, coding help, and research tasks.",
  category: "AI & Automation",
  tags: [
    "google ai",
    "ai chatbot",
    "research ai",
    "coding help ai"
  ],
  popularity: 93
},
{
  name: "Runway ML",
  url: "https://runwayml.com",
  description: "AI-powered creative platform for video editing, background removal, and generative media.",
  category: "AI & Automation",
  tags: [
    "ai video editing",
    "content creation ai",
    "generative video",
    "video background removal"
  ],
  popularity: 88
},
{
  name: "ElevenLabs",
  url: "https://elevenlabs.io",
  description: "AI voice generation and text-to-speech platform with realistic human voices.",
  category: "AI & Automation",
  tags: [
    "ai voice",
    "text to speech",
    "voice generator",
    "ai narration"
  ],
  popularity: 90
},
{
  name: "Copy.ai",
  url: "https://www.copy.ai",
  description: "AI writing tool for marketing copy, social media posts, and content creation.",
  category: "AI & Automation",
  tags: [
    "ai content writing",
    "marketing copy",
    "social media captions"
  ],
  popularity: 87
},
{
  name: "Writesonic",
  url: "https://writesonic.com",
  description: "AI writing platform for blogs, ads, landing pages, and SEO content.",
  category: "AI & Automation",
  tags: [
    "ai blog writer",
    "seo content",
    "marketing ai"
  ],
  popularity: 88
},
{
  name: "Zety",
  url: "https://zety.com",
  description: "Professional resume and cover letter builder used by job seekers worldwide.",
  category: "Career & Jobs",
  tags: [
    "resume builder",
    "cover letter",
    "job application",
    "professional cv"
  ],
  popularity: 90
},
{
  name: "Kickresume",
  url: "https://www.kickresume.com",
  description: "Resume and personal website builder for students and professionals.",
  category: "Career & Jobs",
  tags: [
    "resume maker",
    "personal website",
    "cv templates"
  ],
  popularity: 86
},
{
  name: "Wellfound",
  url: "https://wellfound.com",
  description: "Startup-focused job platform for tech roles and early-career opportunities.",
  category: "Career & Jobs",
  tags: [
    "startup jobs",
    "tech careers",
    "remote startup jobs"
  ],
  popularity: 87
},
{
  name: "Himalayas",
  url: "https://himalayas.app",
  description: "Remote job board focused on tech and startup roles.",
  category: "Career & Jobs",
  tags: [
    "remote jobs",
    "work from home",
    "tech jobs"
  ],
  popularity: 82
},
{
  name: "Roadmap.sh",
  url: "https://roadmap.sh",
  description: "Step-by-step roadmaps for learning frontend, backend, DevOps, and software engineering.",
  category: "Education & Learning",
  tags: [
    "developer roadmap",
    "learn frontend",
    "learn backend",
    "career roadmap"
  ],
  popularity: 91
},
{
  name: "CS50",
  url: "https://cs50.harvard.edu",
  description: "Harvard Universityâ€™s introductory computer science course available online for free.",
  category: "Education & Learning",
  tags: [
    "computer science basics",
    "harvard cs50",
    "learn programming"
  ],
  popularity: 96
},
{
  name: "Scrimba",
  url: "https://scrimba.com",
  description: "Interactive coding courses with in-browser editor and guided lessons.",
  category: "Education & Learning",
  tags: [
    "learn frontend",
    "interactive coding",
    "javascript courses"
  ],
  popularity: 88
},
{
  name: "Frontend Masters",
  url: "https://frontendmasters.com",
  description: "Advanced frontend development courses taught by industry experts.",
  category: "Education & Learning",
  tags: [
    "advanced frontend",
    "javascript mastery",
    "web development courses"
  ],
  popularity: 89
},
{
  name: "Excalidraw",
  url: "https://excalidraw.com",
  description: "Online collaborative whiteboard for diagrams, flowcharts, and rough sketches.",
  category: "Productivity",
  tags: [
    "draw diagrams",
    "whiteboard online",
    "flowchart tool"
  ],
  popularity: 87
},
{
  name: "Miro",
  url: "https://miro.com",
  description: "Collaborative whiteboard platform for brainstorming, planning, and teamwork.",
  category: "Productivity",
  tags: [
    "team collaboration",
    "brainstorming",
    "online whiteboard"
  ],
  popularity: 92
},
{
  name: "Obsidian",
  url: "https://obsidian.md",
  description: "Knowledge management and note-taking app based on linked notes.",
  category: "Productivity",
  tags: [
    "note taking",
    "second brain",
    "study notes"
  ],
  popularity: 90
},
{
  name: "Forest App",
  url: "https://www.forestapp.cc",
  description: "Focus and productivity app that helps users stay away from distractions.",
  category: "Productivity",
  tags: [
    "focus app",
    "study timer",
    "avoid distraction"
  ],
  popularity: 85
},
{
  name: "Pomofocus",
  url: "https://pomofocus.io",
  description: "Simple Pomodoro timer for focused work and study sessions.",
  category: "Productivity",
  tags: [
    "pomodoro timer",
    "study focus",
    "time management"
  ],
  popularity: 84
},
{
  name: "Desmos",
  url: "https://www.desmos.com",
  description: "Graphing calculator and math visualization tool used by students and teachers.",
  category: "Education & Learning",
  tags: [
    "graph calculator",
    "math visualization",
    "study math"
  ],
  popularity: 89
},
{
  name: "Wolfram Alpha",
  url: "https://www.wolframalpha.com",
  description: "Computational knowledge engine for math, science, and data queries.",
  category: "Education & Learning",
  tags: [
    "solve math",
    "math engine",
    "science calculations"
  ],
  popularity: 94
},
{
  name: "Symbolab",
  url: "https://www.symbolab.com",
  description: "Math solver that provides step-by-step solutions.",
  category: "Education & Learning",
  tags: [
    "math solver",
    "step by step math",
    "exam help"
  ],
  popularity: 90
},
{
  name: "Overleaf",
  url: "https://www.overleaf.com",
  description: "Online LaTeX editor for academic papers, reports, and research documents.",
  category: "Education & Learning",
  tags: [
    "latex editor",
    "research paper",
    "academic writing"
  ],
  popularity: 87
},
{
  name: "Hugging Face",
  url: "https://huggingface.co",
  description: "Platform for machine learning models, datasets, and AI demos.",
  category: "AI & Automation",
  tags: [
    "machine learning models",
    "ai research",
    "nlp models"
  ],
  popularity: 91
},
{
  name: "Kaggle",
  url: "https://www.kaggle.com",
  description: "Data science platform with datasets, notebooks, and competitions.",
  category: "AI & Data Science",
  tags: [
    "data science",
    "datasets",
    "machine learning practice"
  ],
  popularity: 92
},
{
  name: "StreamYard",
  url: "https://streamyard.com",
  description: "Live streaming studio for YouTube, LinkedIn, and Facebook.",
  category: "Content Creation",
  tags: [
    "live streaming",
    "youtube live",
    "content creator tools"
  ],
  popularity: 88
},
{
  name: "CapCut",
  url: "https://www.capcut.com",
  description: "Easy-to-use video editing tool popular for reels and short-form content.",
  category: "Content Creation",
  tags: [
    "video editing",
    "reels editing",
    "short video maker"
  ],
  popularity: 95
},
{
  name: "Subtitles.ai",
  url: "https://www.subtitles.ai",
  description: "AI tool to generate subtitles automatically for videos.",
  category: "Content Creation",
  tags: [
    "auto subtitles",
    "video captions",
    "ai subtitles"
  ],
  popularity: 82
},
{
  name: "Loom",
  url: "https://www.loom.com",
  description: "Screen recording tool for creating quick video messages and tutorials.",
  category: "Productivity",
  tags: [
    "screen recording",
    "video tutorials",
    "explain via video"
  ],
  popularity: 91
},
{
  name: "Readwise",
  url: "https://readwise.io",
  description: "Tool to save, review, and remember highlights from articles and books.",
  category: "Productivity",
  tags: [
    "knowledge management",
    "reading highlights",
    "learning retention"
  ],
  popularity: 86
},
{
  name: "Goodreads",
  url: "https://www.goodreads.com",
  description: "Book discovery and review platform for readers.",
  category: "Learning & Lifestyle",
  tags: [
    "book recommendations",
    "reading habit",
    "book reviews"
  ],
  popularity: 93
},
{
  name: "Coursera Projects",
  url: "https://www.coursera.org/projects",
  description: "Short guided projects to gain hands-on experience in tools and technologies.",
  category: "Education & Learning",
  tags: [
    "hands on projects",
    "learn by doing",
    "skill practice"
  ],
  popularity: 85
},
{
  name: "Edabit",
  url: "https://edabit.com",
  description: "Beginner-friendly coding challenges to practice programming skills.",
  category: "Education & Learning",
  tags: [
    "coding practice",
    "beginner programming",
    "learn by challenges"
  ],
  popularity: 84
},
{
  name: "HackerOne",
  url: "https://www.hackerone.com",
  description: "Bug bounty platform where security researchers find and report vulnerabilities.",
  category: "Cybersecurity",
  tags: [
    "bug bounty",
    "cybersecurity",
    "ethical hacking"
  ],
  popularity: 88
},
{
  name: "TryHackMe",
  url: "https://tryhackme.com",
  description: "Hands-on cybersecurity learning platform with labs and challenges.",
  category: "Cybersecurity",
  tags: [
    "learn hacking",
    "cybersecurity labs",
    "ethical hacking practice"
  ],
  popularity: 90
},
{
  name: "Hack The Box",
  url: "https://www.hackthebox.com",
  description: "Advanced cybersecurity training platform for penetration testing skills.",
  category: "Cybersecurity",
  tags: [
    "pentesting",
    "cybersecurity training",
    "ethical hacking"
  ],
  popularity: 91
},
{
  name: "Calendly",
  url: "https://calendly.com",
  description: "Scheduling tool to book meetings without back-and-forth emails.",
  category: "Productivity",
  tags: [
    "meeting scheduling",
    "calendar booking",
    "time management"
  ],
  popularity: 92
},
{
  name: "Trello",
  url: "https://trello.com",
  description: "Visual task management tool using boards and cards.",
  category: "Productivity",
  tags: [
    "task management",
    "kanban board",
    "project tracking"
  ],
  popularity: 87
},
{
  name: "ClickUp",
  url: "https://clickup.com",
  description: "All-in-one productivity and project management platform for teams.",
  category: "Productivity",
  tags: [
    "project management",
    "team productivity",
    "task tracking"
  ],
  popularity: 90
},
{
  name: "Asana",
  url: "https://asana.com",
  description: "Work management tool for planning, tracking, and collaborating on tasks.",
  category: "Productivity",
  tags: [
    "team tasks",
    "work management",
    "project planning"
  ],
  popularity: 89
},
{
  name: "DeepL",
  url: "https://www.deepl.com",
  description: "AI-powered translation tool known for high-quality and natural language translations, widely used by students and professionals.",
  category: "AI & Automation",
  tags: [
    "ai translator",
    "translate documents",
    "language translation",
    "study abroad help"
  ],
  popularity: 93
},
{
  name: "Grammarly",
  url: "https://www.grammarly.com",
  description: "AI writing assistant that improves grammar, clarity, tone, and professionalism in writing.",
  category: "AI & Automation",
  tags: [
    "grammar checker",
    "writing improvement",
    "essay correction",
    "professional writing"
  ],
  popularity: 95
},
{
  name: "QuillBot",
  url: "https://quillbot.com",
  description: "AI paraphrasing and summarization tool used for rewriting content and improving readability.",
  category: "AI & Automation",
  tags: [
    "paraphrase tool",
    "rewrite sentences",
    "summarize text",
    "plagiarism-free writing"
  ],
  popularity: 91
},
{
  name: "Sora",
  url: "https://openai.com/sora",
  description: "AI video generation model that creates realistic videos from text prompts.",
  category: "AI & Automation",
  tags: [
    "ai video generator",
    "text to video",
    "future ai tools"
  ],
  popularity: 89
},
{
  name: "Poe",
  url: "https://poe.com",
  description: "Platform to access multiple AI chatbots in one place including ChatGPT and Claude.",
  category: "AI & Automation",
  tags: [
    "multiple ai chatbots",
    "chatgpt alternative",
    "ai playground"
  ],
  popularity: 88
},
{
  name: "Remote OK",
  url: "https://remoteok.com",
  description: "Job board focused on remote job opportunities across tech and non-tech roles.",
  category: "Career & Jobs",
  tags: [
    "remote jobs",
    "work from home",
    "international jobs"
  ],
  popularity: 90
},
{
  name: "FlexJobs",
  url: "https://www.flexjobs.com",
  description: "Curated job board for remote, flexible, and freelance job opportunities.",
  category: "Career & Jobs",
  tags: [
    "remote work",
    "freelance jobs",
    "flexible careers"
  ],
  popularity: 87
},
{
  name: "Cutshort",
  url: "https://cutshort.io",
  description: "Indian tech-focused hiring platform connecting startups and developers.",
  category: "Career & Jobs",
  tags: [
    "startup jobs india",
    "tech hiring",
    "developer jobs"
  ],
  popularity: 86
},
{
  name: "AngelList Talent",
  url: "https://angel.co/jobs",
  description: "Startup job platform for finding roles in early-stage and growing companies.",
  category: "Career & Jobs",
  tags: [
    "startup careers",
    "tech jobs",
    "early stage startups"
  ],
  popularity: 90
},
{
  name: "Polywork",
  url: "https://polywork.com",
  description: "Professional network showcasing projects, skills, and collaborations beyond resumes.",
  category: "Career & Jobs",
  tags: [
    "professional networking",
    "portfolio showcase",
    "career growth"
  ],
  popularity: 82
},
{
  name: "Exercism",
  url: "https://exercism.org",
  description: "Practice programming languages with mentorship and feedback.",
  category: "Education & Learning",
  tags: [
    "learn programming",
    "coding practice",
    "mentored learning"
  ],
  popularity: 88
},
{
  name: "Codewars",
  url: "https://www.codewars.com",
  description: "Coding challenge platform that helps improve problem-solving skills.",
  category: "Education & Learning",
  tags: [
    "coding challenges",
    "problem solving",
    "practice coding"
  ],
  popularity: 90
},
{
  name: "Brilliant",
  url: "https://brilliant.org",
  description: "Interactive learning platform for math, logic, and science.",
  category: "Education & Learning",
  tags: [
    "learn math",
    "logic problems",
    "science learning"
  ],
  popularity: 91
},
{
  name: "Mathway",
  url: "https://www.mathway.com",
  description: "Math problem solver providing instant answers and steps.",
  category: "Education & Learning",
  tags: [
    "solve math problems",
    "step by step math",
    "exam help"
  ],
  popularity: 89
},
{
  name: "StudySmarter",
  url: "https://www.studysmarter.us",
  description: "Digital learning platform with flashcards, notes, and study plans.",
  category: "Education & Learning",
  tags: [
    "study planner",
    "flashcards",
    "exam preparation"
  ],
  popularity: 84
},
{
  name: "Z-Library",
  url: "https://z-lib.org",
  description: "Online library providing access to books and academic papers.",
  category: "Education & Learning",
  tags: [
    "free books",
    "academic papers",
    "study resources"
  ],
  popularity: 92
},
{
  name: "Project Gutenberg",
  url: "https://www.gutenberg.org",
  description: "Free library of public domain books.",
  category: "Education & Learning",
  tags: [
    "free ebooks",
    "classic books",
    "reading online"
  ],
  popularity: 90
},
{
  name: "DevDocs",
  url: "https://devdocs.io",
  description: "Fast, offline-friendly documentation browser for developers.",
  category: "Development",
  tags: [
    "developer documentation",
    "api docs",
    "programming reference"
  ],
  popularity: 89
},
{
  name: "Glitch",
  url: "https://glitch.com",
  description: "Platform to build and deploy small web apps instantly.",
  category: "Development",
  tags: [
    "build web apps",
    "deploy quickly",
    "learn web development"
  ],
  popularity: 85
},
{
  name: "Railway",
  url: "https://railway.app",
  description: "Cloud platform for deploying backend services and databases easily.",
  category: "Development",
  tags: [
    "deploy backend",
    "cloud hosting",
    "api deployment"
  ],
  popularity: 88
},
{
  name: "Fly.io",
  url: "https://fly.io",
  description: "Deploy applications close to users for low-latency performance.",
  category: "Development",
  tags: [
    "global deployment",
    "backend hosting",
    "cloud apps"
  ],
  popularity: 84
},
{
  name: "Unsplash",
  url: "https://unsplash.com",
  description: "High-quality free stock photos for personal and commercial use.",
  category: "Design & Creativity",
  tags: [
    "free images",
    "stock photos",
    "website images"
  ],
  popularity: 90
},
{
  name: "Pexels",
  url: "https://www.pexels.com",
  description: "Free stock photos and videos for creators and designers.",
  category: "Design & Creativity",
  tags: [
    "free stock photos",
    "videos for content",
    "design resources"
  ],
  popularity: 89
},
{
  name: "Flaticon",
  url: "https://www.flaticon.com",
  description: "Large library of free icons for web and app design.",
  category: "Design & Creativity",
  tags: [
    "icons",
    "ui icons",
    "design assets"
  ],
  popularity: 88
},
{
  name: "Coolors",
  url: "https://coolors.co",
  description: "Color palette generator for designers and developers.",
  category: "Design & Creativity",
  tags: [
    "color palette",
    "ui colors",
    "design inspiration"
  ],
  popularity: 87
},
{
  name: "Dribbble",
  url: "https://dribbble.com",
  description: "Design inspiration platform showcasing UI, UX, and creative work.",
  category: "Design & Creativity",
  tags: [
    "design inspiration",
    "ui ux ideas",
    "creative showcase"
  ],
  popularity: 90
},
{
  name: "Behance",
  url: "https://www.behance.net",
  description: "Portfolio platform to showcase creative and design projects.",
  category: "Design & Creativity",
  tags: [
    "design portfolio",
    "creative projects",
    "showcase work"
  ],
  popularity: 89
},
{
  name: "Anchor",
  url: "https://anchor.fm",
  description: "Podcast creation and hosting platform for beginners.",
  category: "Content Creation",
  tags: [
    "start podcast",
    "audio creation",
    "podcast hosting"
  ],
  popularity: 87
},
{
  name: "Podbean",
  url: "https://www.podbean.com",
  description: "Podcast hosting and monetization platform.",
  category: "Content Creation",
  tags: [
    "podcast hosting",
    "audio publishing",
    "creator tools"
  ],
  popularity: 85
},
{
  name: "BuyMeACoffee",
  url: "https://www.buymeacoffee.com",
  description: "Platform for creators to receive support and donations from fans.",
  category: "Creator Economy",
  tags: [
    "support creators",
    "donations",
    "monetize content"
  ],
  popularity: 88
},
{
  name: "Patreon",
  url: "https://www.patreon.com",
  description: "Membership platform allowing creators to earn recurring income.",
  category: "Creator Economy",
  tags: [
    "creator income",
    "membership platform",
    "fan support"
  ],
  popularity: 92
},
{
  name: "Gumroad",
  url: "https://gumroad.com",
  description: "Platform for selling digital products directly to customers.",
  category: "Creator Economy",
  tags: [
    "sell digital products",
    "ebooks",
    "creator business"
  ],
  popularity: 91
},
{
  name: "Etsy",
  url: "https://www.etsy.com",
  description: "Marketplace for handmade, vintage, and creative products.",
  category: "Shopping",
  tags: [
    "handmade products",
    "creative marketplace",
    "small businesses"
  ],
  popularity: 94
},
{
  name: "Meesho",
  url: "https://www.meesho.com",
  description: "Indian social commerce platform for reselling and shopping.",
  category: "Shopping",
  tags: [
    "reselling business",
    "online shopping india",
    "small sellers"
  ],
  popularity: 93
},
{
  name: "Snapdeal",
  url: "https://www.snapdeal.com",
  description: "Indian e-commerce platform offering budget-friendly products.",
  category: "Shopping",
  tags: [
    "online shopping india",
    "budget products",
    "ecommerce"
  ],
  popularity: 88
},
{
  name: "Google Trends",
  url: "https://trends.google.com",
  description: "Tool to analyze trending search topics and user interest over time.",
  category: "Analytics & Trends",
  tags: [
    "search trends",
    "what is trending",
    "market research"
  ],
  popularity: 95
},
{
  name: "Exploding Topics",
  url: "https://explodingtopics.com",
  description: "Platform to discover rapidly growing trends before they go mainstream.",
  category: "Analytics & Trends",
  tags: [
    "emerging trends",
    "market insights",
    "future products"
  ],
  popularity: 89
},
{
  name: "Statista",
  url: "https://www.statista.com",
  description: "Data and statistics platform for market and industry research.",
  category: "Analytics & Research",
  tags: [
    "market statistics",
    "industry data",
    "research insights"
  ],
  popularity: 94
},
{
  name: "Our World in Data",
  url: "https://ourworldindata.org",
  description: "Research and data on global issues like health, education, and climate.",
  category: "Analytics & Research",
  tags: [
    "global data",
    "research articles",
    "statistics"
  ],
  popularity: 92
},
{
  name: "Resume Worded",
  url: "https://resumeworded.com",
  description: "AI-powered resume and LinkedIn profile feedback tool that scores resumes and suggests improvements based on recruiter standards.",
  category: "Career & Jobs",
  tags: [
    "resume feedback",
    "resume score checker",
    "ats resume review",
    "improve resume",
    "linkedin profile optimization",
    "job application improvement",
    "resume analysis ai",
    "placement resume review",
    "resume mistakes checker",
    "professional resume tips",
    "resume optimization tool",
    "career growth tools"
  ],
  popularity: 88
},
{
  name: "Enhancv",
  url: "https://enhancv.com",
  description: "Modern resume builder focused on storytelling, achievements, and personal branding for job seekers.",
  category: "Career & Jobs",
  tags: [
    "creative resume",
    "modern cv",
    "resume storytelling",
    "personal branding resume",
    "resume for professionals",
    "resume design online",
    "job resume builder",
    "resume templates modern",
    "ats friendly cv",
    "resume builder 2025"
  ],
  popularity: 89
},
{
  name: "Careerflow AI",
  url: "https://www.careerflow.ai",
  description: "AI career assistant for job tracking, resume building, LinkedIn optimization, and interview preparation.",
  category: "Career & Jobs",
  tags: [
    "career assistant ai",
    "job tracker",
    "resume ai",
    "linkedin optimization",
    "interview preparation",
    "job search management",
    "career planning",
    "placement preparation tools"
  ],
  popularity: 84
},
{
  name: "Interviewing.io",
  url: "https://interviewing.io",
  description: "Anonymous technical interview practice platform with real engineers from top companies.",
  category: "Career & Jobs",
  tags: [
    "mock interviews",
    "technical interview practice",
    "coding interviews",
    "interview preparation",
    "software engineer interviews",
    "placement interview practice",
    "real interview experience"
  ],
  popularity: 87
},
{
  name: "Pramp",
  url: "https://www.pramp.com",
  description: "Peer-to-peer mock interview platform for coding and behavioral interview practice.",
  category: "Career & Jobs",
  tags: [
    "mock interviews",
    "coding interview practice",
    "behavioral interview",
    "peer interviews",
    "interview confidence",
    "placement interviews",
    "job preparation"
  ],
  popularity: 85
},
{
  name: "Krisp",
  url: "https://krisp.ai",
  description: "AI-powered noise cancellation app for online meetings, interviews, and remote work.",
  category: "Productivity",
  tags: [
    "noise cancellation",
    "online interview tool",
    "remote work productivity",
    "clear voice calls",
    "work from home tools",
    "meeting enhancement",
    "focus tool"
  ],
  popularity: 90
},
{
  name: "Otter.ai",
  url: "https://otter.ai",
  description: "AI meeting assistant that records, transcribes, and summarizes conversations in real time.",
  category: "Productivity",
  tags: [
    "meeting transcription",
    "voice to text",
    "lecture notes ai",
    "meeting summary",
    "online class notes",
    "study notes automation",
    "productivity ai"
  ],
  popularity: 92
},
{
  name: "Clockify",
  url: "https://clockify.me",
  description: "Time tracking software for students, freelancers, and teams to track productivity.",
  category: "Productivity",
  tags: [
    "time tracking",
    "study time tracker",
    "productivity measurement",
    "freelancer tracking",
    "focus improvement",
    "work tracking",
    "task timing"
  ],
  popularity: 88
},
{
  name: "RescueTime",
  url: "https://www.rescuetime.com",
  description: "Automatic time tracking tool that analyzes digital habits and productivity patterns.",
  category: "Productivity",
  tags: [
    "productivity analysis",
    "track screen time",
    "focus improvement",
    "time management",
    "digital habits",
    "study productivity",
    "work efficiency"
  ],
  popularity: 87
},
{
  name: "Habitica",
  url: "https://habitica.com",
  description: "Gamified habit tracker that turns daily tasks and goals into a role-playing game.",
  category: "Productivity",
  tags: [
    "habit tracker",
    "gamified productivity",
    "daily goals",
    "self improvement",
    "study habits",
    "task motivation",
    "focus building"
  ],
  popularity: 86
},
{
  name: "Anki",
  url: "https://apps.ankiweb.net",
  description: "Spaced repetition flashcard app for memorization and long-term learning.",
  category: "Education & Learning",
  tags: [
    "flashcards",
    "spaced repetition",
    "memory improvement",
    "exam preparation",
    "medical studies",
    "language learning",
    "revision tool"
  ],
  popularity: 91
},
{
  name: "RemNote",
  url: "https://www.remnote.com",
  description: "Note-taking and spaced repetition tool designed for deep learning and long-term retention.",
  category: "Education & Learning",
  tags: [
    "smart notes",
    "spaced repetition notes",
    "study system",
    "active recall",
    "learning optimization",
    "exam preparation",
    "note based learning"
  ],
  popularity: 85
},
{
  name: "StudyStream",
  url: "https://www.studystream.live",
  description: "Virtual study room platform where students study together using live focus sessions.",
  category: "Education & Learning",
  tags: [
    "study with others",
    "virtual study room",
    "focus sessions",
    "study motivation",
    "online study groups",
    "exam preparation",
    "student productivity"
  ],
  popularity: 83
},
{
  name: "Brainly",
  url: "https://brainly.com",
  description: "Homework help platform where students ask and answer academic questions.",
  category: "Education & Learning",
  tags: [
    "homework help",
    "study questions",
    "student doubt solving",
    "exam help",
    "learning community",
    "school studies",
    "college help"
  ],
  popularity: 92
},
{
  name: "Chegg",
  url: "https://www.chegg.com",
  description: "Student learning platform offering textbook solutions, tutoring, and exam help.",
  category: "Education & Learning",
  tags: [
    "exam solutions",
    "textbook answers",
    "homework help",
    "study assistance",
    "college learning",
    "academic support",
    "student services"
  ],
  popularity: 91
},
{
  name: "PDFgear",
  url: "https://www.pdfgear.com",
  description: "Free PDF editor and AI-powered PDF assistant for reading, editing, and summarizing documents.",
  category: "Productivity",
  tags: [
    "pdf editor free",
    "pdf summarizer",
    "edit pdf online",
    "study pdf tool",
    "document management",
    "ai pdf assistant"
  ],
  popularity: 84
},
{
  name: "Smallpdf",
  url: "https://smallpdf.com",
  description: "Online PDF tools for compressing, converting, merging, and editing PDFs.",
  category: "Productivity",
  tags: [
    "compress pdf",
    "convert pdf",
    "merge pdf",
    "edit pdf",
    "document tools",
    "student pdf tools"
  ],
  popularity: 90
},
{
  name: "Scribe",
  url: "https://scribehow.com",
  description: "Tool that automatically creates step-by-step guides and documentation from screen recordings.",
  category: "Productivity",
  tags: [
    "create documentation",
    "how to guides",
    "process documentation",
    "tutorial creation",
    "workflow recording",
    "knowledge sharing"
  ],
  popularity: 83
},
{
  name: "Notion Calendar",
  url: "https://www.notion.so/product/calendar",
  description: "Integrated calendar tool for planning tasks, deadlines, and schedules inside Notion.",
  category: "Productivity",
  tags: [
    "task scheduling",
    "study calendar",
    "project deadlines",
    "time planning",
    "student planner",
    "productivity calendar"
  ],
  popularity: 86
},
{
  name: "Linear",
  url: "https://linear.app",
  description: "Issue tracking and project management tool designed for modern software teams.",
  category: "Development",
  tags: [
    "issue tracking",
    "software project management",
    "developer workflow",
    "bug tracking",
    "team productivity",
    "engineering tools"
  ],
  popularity: 88
},
{
  name: "Raycast",
  url: "https://www.raycast.com",
  description: "Productivity launcher for developers to control tools, workflows, and shortcuts quickly.",
  category: "Productivity",
  tags: [
    "developer productivity",
    "keyboard launcher",
    "workflow automation",
    "mac productivity",
    "fast commands",
    "developer tools"
  ],
  popularity: 87
},
{
  name: "Warp Terminal",
  url: "https://www.warp.dev",
  description: "Modern terminal with AI assistance, command blocks, and collaborative features.",
  category: "Development",
  tags: [
    "modern terminal",
    "developer tools",
    "ai terminal",
    "command line productivity",
    "coding efficiency"
  ],
  popularity: 84
},
{
  name: "Supabase Studio",
  url: "https://supabase.com/studio",
  description: "Visual database management interface for Supabase projects.",
  category: "Development",
  tags: [
    "database dashboard",
    "postgres management",
    "backend tools",
    "database ui",
    "developer productivity"
  ],
  popularity: 82
},
{
  name: "Planetscale Insights",
  url: "https://planetscale.com",
  description: "Serverless MySQL platform with insights for database performance and scaling.",
  category: "Development",
  tags: [
    "serverless database",
    "mysql cloud",
    "database scaling",
    "backend infrastructure",
    "startup database"
  ],
  popularity: 85
},
{
  name: "Explainpaper",
  url: "https://www.explainpaper.com",
  description: "AI tool that explains complex research papers in simple language.",
  category: "AI & Education",
  tags: [
    "research paper explanation",
    "ai for students",
    "simplify papers",
    "academic reading",
    "study research",
    "paper summarizer"
  ],
  popularity: 83
},
{
  name: "Elicit",
  url: "https://elicit.org",
  description: "AI research assistant for literature review and academic discovery.",
  category: "AI & Education",
  tags: [
    "research assistant ai",
    "literature review",
    "academic research",
    "study papers",
    "research automation"
  ],
  popularity: 87
},
{
  name: "Consensus",
  url: "https://consensus.app",
  description: "AI-powered academic search engine that finds answers from research papers.",
  category: "AI & Education",
  tags: [
    "academic search",
    "research answers",
    "study papers ai",
    "science research",
    "evidence based answers"
  ],
  popularity: 86
},
{
  name: "Tactiq",
  url: "https://tactiq.io",
  description: "AI meeting note-taker that generates summaries from Google Meet and Zoom.",
  category: "Productivity",
  tags: [
    "meeting notes ai",
    "lecture transcription",
    "online class notes",
    "zoom notes",
    "study meetings"
  ],
  popularity: 82
},
{
  name: "Motion",
  url: "https://www.usemotion.com",
  description: "AI-powered calendar that automatically schedules tasks and meetings.",
  category: "Productivity",
  tags: [
    "ai scheduling",
    "smart calendar",
    "task automation",
    "time blocking",
    "productivity planning"
  ],
  popularity: 88
},
{
  name: "Reclaim.ai",
  url: "https://reclaim.ai",
  description: "AI scheduling assistant that protects focus time and balances tasks.",
  category: "Productivity",
  tags: [
    "focus time protection",
    "ai calendar",
    "time management",
    "work life balance",
    "productivity ai"
  ],
  popularity: 86
},
{
  name: "Superhuman",
  url: "https://superhuman.com",
  description: "High-speed email client designed for productivity and inbox efficiency.",
  category: "Productivity",
  tags: [
    "email productivity",
    "fast email",
    "inbox zero",
    "professional communication",
    "work efficiency"
  ],
  popularity: 90
},
{
  name: "Spark Mail",
  url: "https://sparkmailapp.com",
  description: "Smart email app with prioritization and collaboration features.",
  category: "Productivity",
  tags: [
    "email management",
    "smart inbox",
    "work emails",
    "collaborative email",
    "communication tools"
  ],
  popularity: 88
},
{
  name: "ShortlyAI",
  url: "https://shortlyai.com",
  description: "AI writing assistant for long-form content, stories, and articles.",
  category: "AI & Automation",
  tags: [
    "ai writing",
    "long form content",
    "story writing ai",
    "article generator",
    "creative writing tool"
  ],
  popularity: 84
},
{
  name: "Sudowrite",
  url: "https://www.sudowrite.com",
  description: "AI writing assistant designed for fiction writers and storytelling.",
  category: "AI & Automation",
  tags: [
    "creative writing ai",
    "story generator",
    "fiction writing",
    "novel writing ai",
    "writing inspiration"
  ],
  popularity: 83
},
{
  name: "Lattice",
  url: "https://lattice.com",
  description: "People management and performance review platform for organizations.",
  category: "Business & HR",
  tags: [
    "performance management",
    "employee feedback",
    "hr tools",
    "career growth",
    "workplace productivity"
  ],
  popularity: 87
},
{
  name: "Culture Amp",
  url: "https://www.cultureamp.com",
  description: "Employee engagement and experience analytics platform.",
  category: "Business & HR",
  tags: [
    "employee engagement",
    "work culture",
    "hr analytics",
    "team feedback",
    "organizational growth"
  ],
  popularity: 88
},
{
  name: "Pitch",
  url: "https://pitch.com",
  description: "Collaborative presentation software for modern teams and startups.",
  category: "Productivity",
  tags: [
    "presentation tool",
    "startup pitch decks",
    "collaborative slides",
    "business presentations",
    "team presentations"
  ],
  popularity: 86
},{
  name: "Arc Browser",
  url: "https://arc.net",
  description: "Modern productivity-focused web browser designed to organize tabs, boost focus, and improve browsing efficiency for students and professionals.",
  category: "Productivity",
  tags: [
    "productivity browser",
    "organize tabs",
    "focus browsing",
    "student browser",
    "developer browser",
    "minimal browser",
    "workflow browser",
    "distraction free browsing",
    "modern web browser",
    "browser productivity",
    "tab management",
    "study browsing"
  ],
  popularity: 88
},
{
  name: "SigmaOS",
  url: "https://sigmaos.com",
  description: "Keyboard-driven productivity browser designed for focused work and fast navigation.",
  category: "Productivity",
  tags: [
    "keyboard browser",
    "focus browser",
    "productivity tools",
    "minimal browsing",
    "fast navigation",
    "developer workflow",
    "deep work browser",
    "study focus tools",
    "tab efficiency"
  ],
  popularity: 82
},
{
  name: "Cursor",
  url: "https://cursor.sh",
  description: "AI-powered code editor built for pair-programming with AI and faster software development.",
  category: "Development",
  tags: [
    "ai code editor",
    "pair programming ai",
    "coding with ai",
    "software development",
    "programmer tools",
    "code completion ai",
    "developer productivity",
    "modern ide",
    "coding faster"
  ],
  popularity: 90
},
{
  name: "Sourcegraph Cody",
  url: "https://sourcegraph.com/cody",
  description: "AI coding assistant that understands large codebases and helps developers navigate, explain, and generate code.",
  category: "Development",
  tags: [
    "ai coding assistant",
    "large codebase ai",
    "code explanation",
    "developer assistant",
    "enterprise coding",
    "software maintenance",
    "code navigation",
    "programming ai"
  ],
  popularity: 86
},
{
  name: "Codeium",
  url: "https://codeium.com",
  description: "Free AI-powered code completion and chat assistant for developers.",
  category: "Development",
  tags: [
    "ai code completion",
    "free coding ai",
    "developer ai tools",
    "programming assistant",
    "autocomplete code",
    "faster coding",
    "software productivity"
  ],
  popularity: 87
},
{
  name: "Mintlify",
  url: "https://mintlify.com",
  description: "Modern documentation platform for creating clean, searchable, and developer-friendly docs.",
  category: "Development",
  tags: [
    "developer documentation",
    "api docs",
    "documentation platform",
    "technical writing",
    "software docs",
    "startup documentation",
    "docs search",
    "knowledge base"
  ],
  popularity: 84
},
{
  name: "Typedream",
  url: "https://typedream.com",
  description: "No-code website builder for startups, landing pages, and personal sites.",
  category: "No-Code",
  tags: [
    "no code website",
    "landing page builder",
    "startup website",
    "build website fast",
    "personal site builder",
    "no coding required",
    "website creation",
    "online presence"
  ],
  popularity: 83
},
{
  name: "Framer",
  url: "https://www.framer.com",
  description: "Design-first website builder for creating high-quality, animated websites without code.",
  category: "Design & Creativity",
  tags: [
    "website design",
    "no code websites",
    "design to website",
    "portfolio websites",
    "animated websites",
    "startup landing pages",
    "modern web design"
  ],
  popularity: 91
},
{
  name: "Spline",
  url: "https://spline.design",
  description: "3D design tool for creating interactive 3D visuals directly in the browser.",
  category: "Design & Creativity",
  tags: [
    "3d design",
    "interactive 3d",
    "web 3d",
    "creative visuals",
    "3d graphics online",
    "ui 3d elements",
    "design innovation"
  ],
  popularity: 85
},
{
  name: "LottieFiles",
  url: "https://lottiefiles.com",
  description: "Platform for lightweight animations used in websites and mobile apps.",
  category: "Design & Creativity",
  tags: [
    "lottie animations",
    "ui animations",
    "web animations",
    "mobile app animations",
    "design motion",
    "frontend animations",
    "creative assets"
  ],
  popularity: 90
},
{
  name: "PitchGrade",
  url: "https://pitchgrade.com",
  description: "AI tool that evaluates pitch decks and business presentations with actionable feedback.",
  category: "Business & Startups",
  tags: [
    "pitch deck review",
    "startup pitching",
    "business presentation",
    "ai feedback",
    "fundraising tools",
    "presentation improvement",
    "startup growth"
  ],
  popularity: 82
},
{
  name: "Slidebean",
  url: "https://slidebean.com",
  description: "Presentation and pitch deck software designed for startups and founders.",
  category: "Business & Startups",
  tags: [
    "pitch deck builder",
    "startup presentations",
    "investor slides",
    "business storytelling",
    "fundraising slides",
    "presentation design"
  ],
  popularity: 88
},
{
  name: "FounderPal",
  url: "https://founderpal.ai",
  description: "AI assistant that helps founders generate startup ideas, validate markets, and write business plans.",
  category: "Business & Startups",
  tags: [
    "startup ideas",
    "business validation",
    "market research ai",
    "founder tools",
    "business planning",
    "entrepreneur ai",
    "startup strategy"
  ],
  popularity: 83
},
{
  name: "Futurepedia",
  url: "https://www.futurepedia.io",
  description: "Directory of AI tools categorized by use case and industry.",
  category: "AI & Trends",
  tags: [
    "ai tools directory",
    "discover ai tools",
    "latest ai websites",
    "ai trends",
    "productivity ai",
    "content ai",
    "developer ai"
  ],
  popularity: 89
},
{
  name: "Thereâ€™s An AI For That",
  url: "https://theresanaiforthat.com",
  description: "Search engine to find AI tools for specific tasks and problems.",
  category: "AI & Trends",
  tags: [
    "find ai tools",
    "ai search engine",
    "task based ai",
    "ai discovery",
    "automation tools",
    "productivity ai"
  ],
  popularity: 90
},
{
  name: "TinyWow",
  url: "https://tinywow.com",
  description: "Free online tools for PDFs, images, videos, and file conversions without signup.",
  category: "Utilities",
  tags: [
    "free online tools",
    "pdf tools",
    "image tools",
    "no login tools",
    "file conversion",
    "student utilities",
    "quick tools"
  ],
  popularity: 86
},
{
  name: "ILovePDF",
  url: "https://www.ilovepdf.com",
  description: "Complete PDF toolkit for editing, compressing, converting, and organizing PDFs.",
  category: "Utilities",
  tags: [
    "pdf tools",
    "edit pdf",
    "merge pdf",
    "compress pdf",
    "student pdf tools",
    "document handling",
    "office utilities"
  ],
  popularity: 92
},
{
  name: "PDF24 Tools",
  url: "https://tools.pdf24.org",
  description: "Free suite of PDF tools for editing and managing documents.",
  category: "Utilities",
  tags: [
    "pdf utilities",
    "free pdf tools",
    "document management",
    "convert pdf",
    "student documents",
    "office productivity"
  ],
  popularity: 85
},
{
  name: "Cleanup.pictures",
  url: "https://cleanup.pictures",
  description: "AI-powered tool to remove unwanted objects from images.",
  category: "Design & Creativity",
  tags: [
    "remove objects from photos",
    "ai photo cleanup",
    "image editing ai",
    "background cleanup",
    "photo retouching",
    "design tools"
  ],
  popularity: 87
},
{
  name: "Looka",
  url: "https://looka.com",
  description: "AI-powered logo maker and brand identity platform.",
  category: "Design & Branding",
  tags: [
    "logo maker ai",
    "brand identity",
    "startup branding",
    "business logo",
    "design without designer",
    "brand kit",
    "visual identity"
  ],
  popularity: 88
},

{
  name: "Brandmark",
  url: "https://brandmark.io",
  description: "AI logo design tool for startups and businesses.",
  category: "Design & Branding",
  tags: [
    "ai logo generator",
    "business branding",
    "startup logo",
    "brand design",
    "visual identity",
    "logo creation online"
  ],
  popularity: 84
},
{
  name: "Namecheap Logo Maker",
  url: "https://www.namecheap.com/logo-maker",
  description: "Free logo maker for startups and small businesses.",
  category: "Design & Branding",
  tags: [
    "free logo maker",
    "startup branding",
    "business logo",
    "easy logo design",
    "brand creation",
    "online logo tool"
  ],
  popularity: 83
},
{
  name: "Noonshot",
  url: "https://noonshot.com",
  description: "Startup validation platform using customer interviews and experiments.",
  category: "Business & Startups",
  tags: [
    "startup validation",
    "idea testing",
    "customer discovery",
    "entrepreneur tools",
    "market validation",
    "lean startup"
  ],
  popularity: 80
},
{
  name: "Indie Hackers",
  url: "https://www.indiehackers.com",
  description: "Community for founders building profitable online businesses.",
  category: "Business & Startups",
  tags: [
    "indie founders",
    "startup community",
    "online business",
    "bootstrapped startups",
    "founder stories",
    "business ideas"
  ],
  popularity: 91
},
{
  name: "Starter Story",
  url: "https://www.starterstory.com",
  description: "Platform sharing real startup stories, revenue breakdowns, and founder journeys.",
  category: "Business & Startups",
  tags: [
    "startup stories",
    "founder interviews",
    "business inspiration",
    "entrepreneur learning",
    "startup case studies"
  ],
  popularity: 90
},
{
  name: "OpenStartup",
  url: "https://openstartup.io",
  description: "Transparency platform where startups share metrics, revenue, and growth publicly.",
  category: "Business & Startups",
  tags: [
    "startup transparency",
    "open metrics",
    "business growth",
    "saas metrics",
    "founder learning"
  ],
  popularity: 82
},
{
  name: "UX Collective",
  url: "https://uxdesign.cc",
  description: "Publication for UX designers sharing articles, case studies, and design insights.",
  category: "Design & Creativity",
  tags: [
    "ux design",
    "design articles",
    "ui ux learning",
    "design case studies",
    "product design",
    "design thinking"
  ],
  popularity: 88
},
{
  name: "UX Tools",
  url: "https://uxtools.co",
  description: "Curated directory of tools for UX designers and product teams.",
  category: "Design & Creativity",
  tags: [
    "ux tools",
    "design resources",
    "ui ux software",
    "product design tools",
    "design workflow"
  ],
  popularity: 84
},
{
  name: "Mobbin",
  url: "https://mobbin.com",
  description: "UI/UX design inspiration library from real mobile apps.",
  category: "Design & Creativity",
  tags: [
    "ui inspiration",
    "mobile app design",
    "ux patterns",
    "design examples",
    "product design inspiration"
  ],
  popularity: 90
},
{
  name: "Refero",
  url: "https://refero.design",
  description: "Collection of real-world web UI design patterns and inspiration.",
  category: "Design & Creativity",
  tags: [
    "web design inspiration",
    "ui patterns",
    "frontend design",
    "website ui examples",
    "design systems"
  ],
  popularity: 85
},

{
  name: "Codedamn",
  url: "https://codedamn.com",
  description: "Interactive coding platform with projects and guided learning paths.",
  category: "Education & Learning",
  tags: [
    "learn coding",
    "coding projects",
    "hands on programming",
    "developer learning",
    "practice coding",
    "career upskilling"
  ],
  popularity: 86
},
{
  name: "Educative",
  url: "https://www.educative.io",
  description: "Text-based learning platform for software engineers and interview preparation.",
  category: "Education & Learning",
  tags: [
    "coding interview prep",
    "system design",
    "learn programming",
    "software engineering",
    "text based courses"
  ],
  popularity: 89
},
{
  name: "AlgoMonster",
  url: "https://algo.monster",
  description: "Structured data structures and algorithms learning platform.",
  category: "Education & Learning",
  tags: [
    "dsa learning",
    "coding interviews",
    "algorithm practice",
    "placement preparation",
    "problem solving"
  ],
  popularity: 84
},

  
];

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Website.deleteMany({});
    console.log('Cleared existing websites');

    // Insert sample data
    await Website.insertMany(sampleWebsites);
    console.log(`âœ… Added ${sampleWebsites.length} sample websites`);

    mongoose.connection.close();
    console.log('Done! You can now search for websites.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleData();