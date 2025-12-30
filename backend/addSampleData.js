const mongoose = require('mongoose');
require('dotenv').config();
const Website = require('./models/Website');

const sampleWebsites = [
  {
    name: "Canva",
    url: "https://www.canva.com",
    description: "Free online graphic design tool for creating graphics, presentations, posters, social media posts, videos, logos, and more. Easy drag and drop interface with thousands of templates.",
    category: "Design",
    tags: ["graphic design", "templates", "social media", "presentations", "photo editor", "logo maker", "poster", "flyer", "free", "easy"],
    popularity: 95
  },
  {
    name: "Figma",
    url: "https://www.figma.com",
    description: "Collaborative interface design tool for creating UI/UX designs, prototypes, wireframes, and design systems. Perfect for web and app designers working in teams.",
    category: "Design",
    tags: ["UI design", "UX design", "prototyping", "collaboration", "wireframes", "interface", "web design", "app design"],
    popularity: 90
  },
  {
    name: "Notion",
    url: "https://www.notion.so",
    description: "All-in-one workspace for notes, docs, wikis, projects, databases, and team collaboration. Organize your life and work in one place.",
    category: "Productivity",
    tags: ["notes", "documentation", "project management", "collaboration", "workspace", "organize", "tasks", "wiki", "database"],
    popularity: 88
  },
  {
    name: "Grammarly",
    url: "https://www.grammarly.com",
    description: "AI-powered writing assistant that checks grammar, spelling, punctuation, and writing style. Helps improve your writing quality and clarity.",
    category: "Writing",
    tags: ["grammar", "writing", "editing", "proofreading", "spell check", "writing assistant", "improve writing"],
    popularity: 85
  },
  {
    name: "Trello",
    url: "https://trello.com",
    description: "Visual project management tool using boards, lists, and cards. Organize tasks, track progress, and collaborate with your team using kanban boards.",
    category: "Productivity",
    tags: ["project management", "kanban", "tasks", "organization", "team collaboration", "boards", "task tracking"],
    popularity: 87
  },
  {
    name: "GitHub",
    url: "https://github.com",
    description: "Platform for version control and collaboration for developers. Host code, review code, manage projects, and build software together.",
    category: "Development",
    tags: ["code", "git", "version control", "collaboration", "programming", "developer", "repository", "open source"],
    popularity: 98
  },
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com",
    description: "Q&A community for programmers to ask and answer coding questions. Get help with programming problems, debugging, and learning new technologies.",
    category: "Development",
    tags: ["programming", "coding", "questions", "community", "help", "debugging", "developer", "learn coding"],
    popularity: 96
  },
  {
    name: "Duolingo",
    url: "https://www.duolingo.com",
    description: "Free language learning platform with gamified lessons. Learn Spanish, French, German, and 40+ other languages through fun, bite-sized lessons.",
    category: "Education",
    tags: ["language learning", "education", "courses", "practice", "learn languages", "spanish", "french", "free learning"],
    popularity: 92
  },
  {
    name: "Khan Academy",
    url: "https://www.khanacademy.org",
    description: "Free online courses and lessons in math, science, programming, history, and more. Learn anything for free with video lessons and practice exercises.",
    category: "Education",
    tags: ["education", "courses", "math", "science", "free learning", "students", "homework help", "study"],
    popularity: 94
  },
  {
    name: "Unsplash",
    url: "https://unsplash.com",
    description: "Free high-quality stock photos and images for personal and commercial use. Beautiful photos donated by talented photographers worldwide.",
    category: "Resources",
    tags: ["photos", "stock images", "free", "photography", "images", "pictures", "download", "high quality"],
    popularity: 89
  },
  {
    name: "Google Drive",
    url: "https://drive.google.com",
    description: "Cloud storage and file sharing service with Google Docs, Sheets, and Slides. Store files, create documents, and collaborate with others online.",
    category: "Productivity",
    tags: ["cloud storage", "documents", "file sharing", "collaboration", "google docs", "spreadsheets", "presentations"],
    popularity: 97
  },
  {
    name: "Spotify",
    url: "https://www.spotify.com",
    description: "Music streaming service with millions of songs, podcasts, and playlists. Listen to your favorite artists and discover new music.",
    category: "Entertainment",
    tags: ["music", "streaming", "podcasts", "audio", "songs", "playlists", "listen"],
    popularity: 95
  },
  {
    name: "Photopea",
    url: "https://www.photopea.com",
    description: "Free online photo editor similar to Photoshop. Edit photos, create graphics, work with layers, and use professional editing tools in your browser.",
    category: "Design",
    tags: ["photo editing", "graphics", "image editor", "free", "photoshop alternative", "edit photos", "remove background"],
    popularity: 82
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com",
    description: "Professional networking platform for career development, job searching, and business networking. Connect with professionals and find job opportunities.",
    category: "Career",
    tags: ["networking", "jobs", "career", "professional", "job search", "resume", "business", "employment"],
    popularity: 93
  },
  {
    name: "Coursera",
    url: "https://www.coursera.org",
    description: "Online learning platform with courses, certificates, and degrees from top universities and companies. Learn new skills and advance your career.",
    category: "Education",
    tags: ["online courses", "certifications", "university", "skills", "learn", "degree", "professional development"],
    popularity: 91
  },
  {
    name: "CodePen",
    url: "https://codepen.io",
    description: "Online code editor and community for front-end developers. Write HTML, CSS, and JavaScript code and see live results instantly.",
    category: "Development",
    tags: ["code editor", "html", "css", "javascript", "web development", "frontend", "coding", "practice"],
    popularity: 84
  },
  {
    name: "Behance",
    url: "https://www.behance.net",
    description: "Showcase and discover creative work. Portfolio platform for designers, illustrators, photographers, and creative professionals.",
    category: "Design",
    tags: ["portfolio", "creative", "design showcase", "inspiration", "designers", "artists", "projects"],
    popularity: 86
  },
  {
    name: "Medium",
    url: "https://medium.com",
    description: "Online publishing platform for reading and writing articles, stories, and blogs on various topics. Share your ideas and learn from others.",
    category: "Writing",
    tags: ["blogging", "articles", "writing", "reading", "stories", "publishing", "blog platform"],
    popularity: 88
  },
  {
    name: "Udemy",
    url: "https://www.udemy.com",
    description: "Online learning platform with thousands of video courses on programming, business, design, marketing, and personal development.",
    category: "Education",
    tags: ["online courses", "video tutorials", "learn programming", "business", "skills", "training"],
    popularity: 90
  },
  {
    name: "Codecademy",
    url: "https://www.codecademy.com",
    description: "Interactive platform to learn coding and programming. Learn Python, JavaScript, HTML, CSS, SQL, and more through hands-on practice.",
    category: "Education",
    tags: ["learn coding", "programming", "python", "javascript", "html", "css", "interactive learning", "coding practice"],
    popularity: 87
  }
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
    console.log(`✅ Added ${sampleWebsites.length} sample websites`);

    mongoose.connection.close();
    console.log('Done! You can now search for websites.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleData();