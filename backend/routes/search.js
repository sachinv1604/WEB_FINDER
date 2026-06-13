const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Website = require('../models/Website');
const { sampleWebsites } = require('../addSampleData');

// Helper to get Groq client dynamically
function getGroqClient(req) {
  const apiKey = req.headers['x-groq-api-key'] || process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim().length < 10 || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return null;
  }
  return new Groq({ apiKey: apiKey.trim() });
}

// ─────────────────────────────────────────────────────────
// PRIMARY SEARCH — Uses Groq world knowledge (unlimited)
// ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { query, mode } = req.body; // mode: 'ai' | 'curated'

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // ── CURATED MODE: search only local DB ──
    if (mode === 'curated') {
      return handleCuratedSearch(req, res, query);
    }

    // ── AI DISCOVERY MODE: use Groq world knowledge ──
    const groqClient = getGroqClient(req);
    if (!groqClient) {
      throw new Error('Groq API key is not configured. Please add one in Settings.');
    }

    const prompt = `You are an expert website recommendation engine with deep knowledge of the internet.

User's need: "${query}"

Find the 10 BEST real websites that solve this need. For each website, provide accurate, up-to-date information.

Respond ONLY with a valid JSON array. Each element must have exactly these fields:
[
  {
    "name": "Website Name",
    "url": "https://example.com",
    "description": "One clear sentence about what it does",
    "why_this": "One sentence explaining why this specifically matches the user's need",
    "category": "Category name",
    "pricing": "Free" | "Freemium" | "Paid" | "Free Trial",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Rules:
- Only recommend REAL, currently active websites with valid URLs
- Order by relevance (best match first)
- Be specific in "why_this" — relate it to the user's exact query
- Include a mix of pricing tiers when possible
- Return ONLY the JSON array, no markdown, no explanation`;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2500,
    });

    const aiText = chatCompletion.choices[0]?.message?.content?.trim() || '';

    // Parse AI response — handle markdown blocks, extra text
    let cleanText = aiText;
    if (aiText.includes('```')) {
      const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) cleanText = jsonMatch[1].trim();
    }
    // Try to find array bounds
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    const aiResults = JSON.parse(cleanText);

    // Validate and normalize results
    const results = aiResults
      .filter(site => site.name && site.url && site.description)
      .slice(0, 10)
      .map((site, i) => ({
        _id: `ai-${i}-${Date.now()}`,
        name: site.name || 'Unknown',
        url: site.url || '#',
        description: site.description || '',
        why_this: site.why_this || '',
        category: site.category || 'General',
        pricing: site.pricing || 'Free',
        difficulty: site.difficulty || 'Beginner',
        tags: Array.isArray(site.tags) ? site.tags.slice(0, 5) : [],
        source: 'ai',
      }));

    res.json({
      results,
      query,
      aiPowered: true,
      model: 'Llama 3.3 70B (Groq)',
      mode: 'ai'
    });

  } catch (error) {
    console.error('Search error:', error.message);

    // Fallback to keyword matching on local DB
    try {
      return handleCuratedSearch(req, res, req.body.query, error.message);
    } catch (fallbackError) {
      res.status(500).json({
        error: 'Failed to search websites',
        details: error.message
      });
    }
  }
});

// ─────────────────────────────────────────────────────────
// CURATED SEARCH — keyword search on local database
// ─────────────────────────────────────────────────────────
async function handleCuratedSearch(req, res, query, aiError = null) {
  const allWebsites = await Website.find();

  if (allWebsites.length === 0) {
    return res.json({
      results: [],
      message: 'No websites in database. Please seed the database first.',
      dbEmpty: true
    });
  }

  const scoredWebsites = allWebsites.map(website => ({
    ...website.toObject(),
    relevanceScore: calculateRelevanceScore(query, website),
    source: 'curated',
    pricing: 'Free',
    difficulty: 'Beginner',
    why_this: '',
  }));

  const rankedWebsites = scoredWebsites
    .filter(site => site.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);

  res.json({
    results: rankedWebsites,
    query,
    aiPowered: false,
    fallbackUsed: !!aiError,
    aiError: aiError || undefined,
    mode: 'curated'
  });
}

function calculateRelevanceScore(query, website) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  let score = 0;

  const nameLower = website.name.toLowerCase();
  queryWords.forEach(word => { if (nameLower.includes(word)) score += 10; });

  const descLower = website.description.toLowerCase();
  queryWords.forEach(word => { if (descLower.includes(word)) score += 5; });

  const categoryLower = website.category.toLowerCase();
  queryWords.forEach(word => { if (categoryLower.includes(word)) score += 7; });

  website.tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    queryWords.forEach(word => {
      if (tagLower.includes(word) || word.includes(tagLower)) score += 8;
    });
  });

  if (descLower.includes(queryLower)) score += 15;
  score += website.popularity * 0.1;
  return score;
}

// ─────────────────────────────────────────────────────────
// COMPARE — side-by-side AI comparison of 2-3 websites
// ─────────────────────────────────────────────────────────
router.post('/compare', async (req, res) => {
  try {
    const { websites } = req.body; // array of {name, url}
    if (!websites || websites.length < 2 || websites.length > 3) {
      return res.status(400).json({ error: 'Please provide 2-3 websites to compare.' });
    }

    const groqClient = getGroqClient(req);
    if (!groqClient) {
      return res.status(400).json({ error: 'Groq API key required for comparison.' });
    }

    const siteNames = websites.map(w => `${w.name} (${w.url})`).join('\n- ');

    const prompt = `Compare these websites side-by-side:
- ${siteNames}

Respond ONLY with a valid JSON object with this exact structure:
{
  "summary": "One-paragraph overall comparison",
  "sites": [
    {
      "name": "Site Name",
      "pros": ["pro1", "pro2", "pro3"],
      "cons": ["con1", "con2"],
      "best_for": "One sentence about who should use this",
      "pricing": "Free / Freemium / Paid",
      "verdict_score": 8.5
    }
  ],
  "winner": "Name of the best overall option",
  "winner_reason": "Why this one wins"
}

Be honest, specific, and balanced. Return ONLY the JSON.`;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiText = chatCompletion.choices[0]?.message?.content?.trim() || '';
    let cleanText = aiText;
    if (aiText.includes('```')) {
      const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) cleanText = jsonMatch[1].trim();
    }
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const comparison = JSON.parse(cleanText);
    res.json({ success: true, comparison });

  } catch (error) {
    console.error('Compare error:', error.message);
    res.status(500).json({ error: 'Failed to compare websites', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────
// ALTERNATIVES — find free/cheaper alternatives
// ─────────────────────────────────────────────────────────
router.post('/alternatives', async (req, res) => {
  try {
    const { websiteName } = req.body;
    if (!websiteName) {
      return res.status(400).json({ error: 'Website name is required.' });
    }

    const groqClient = getGroqClient(req);
    if (!groqClient) {
      return res.status(400).json({ error: 'Groq API key required.' });
    }

    const prompt = `Find 5 of the best FREE or cheaper alternatives to "${websiteName}".

Respond ONLY with a valid JSON array:
[
  {
    "name": "Alternative Name",
    "url": "https://...",
    "description": "What it does",
    "why_better": "Why someone might prefer this over ${websiteName}",
    "pricing": "Free" | "Freemium" | "Paid",
    "tags": ["tag1", "tag2"]
  }
]

Focus on legitimate, active websites. Prefer free options. Return ONLY the JSON array.`;

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1200,
    });

    const aiText = chatCompletion.choices[0]?.message?.content?.trim() || '';
    let cleanText = aiText;
    if (aiText.includes('```')) {
      const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) cleanText = jsonMatch[1].trim();
    }
    const firstBracket = cleanText.indexOf('[');
    const lastBracket = cleanText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    const alternatives = JSON.parse(cleanText);
    res.json({
      success: true,
      original: websiteName,
      alternatives: alternatives.slice(0, 5).map((alt, i) => ({
        _id: `alt-${i}-${Date.now()}`,
        ...alt,
        source: 'ai-alternative',
      }))
    });

  } catch (error) {
    console.error('Alternatives error:', error.message);
    res.status(500).json({ error: 'Failed to find alternatives', details: error.message });
  }
});

// ─────────────────────────────────────────────────────────
// EXISTING ENDPOINTS (unchanged)
// ─────────────────────────────────────────────────────────

// Add a new website
router.post('/add-website', async (req, res) => {
  try {
    const { name, url, description, category, tags } = req.body;
    const newWebsite = new Website({ name, url, description, category, tags, popularity: 0 });
    await newWebsite.save();
    res.status(201).json({ message: 'Website added successfully', website: newWebsite });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add website', details: error.message });
  }
});

// Get all websites
router.get('/websites', async (req, res) => {
  try {
    const websites = await Website.find().sort({ popularity: -1 });
    res.json({ websites });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

// Delete a website
router.delete('/delete-website/:id', async (req, res) => {
  try {
    await Website.findByIdAndDelete(req.params.id);
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

// Test connection to Groq API
router.post('/test-connection', async (req, res) => {
  try {
    const groqClient = getGroqClient(req);
    if (!groqClient) {
      return res.status(400).json({ success: false, error: 'API Key is missing or invalid' });
    }

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: "Respond with the single word 'Success'." }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 5,
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim() || '';
    if (text.toLowerCase().includes('success')) {
      res.json({ success: true });
    } else {
      res.json({ success: false, details: text });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed the database
router.post('/seed', async (req, res) => {
  try {
    await Website.deleteMany({});
    const inserted = await Website.insertMany(sampleWebsites);
    res.json({
      success: true,
      message: `Database successfully seeded with ${inserted.length} websites.`,
      count: inserted.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check DB Status
router.get('/db-status', async (req, res) => {
  try {
    const count = await Website.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;