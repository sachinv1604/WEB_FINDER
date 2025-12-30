const express = require('express');
const router = express.Router();
const Website = require('../models/Website');

/* -------------------- SMART SEARCH LOGIC -------------------- */

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

const STOP_WORDS = [
  "the", "for", "and", "with", "best", "top", "website", "site", "online"
];

function calculateRelevanceScore(query, website) {
  const normalizedQuery = normalizeText(query);

  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.includes(word));

  let score = 0;

  const name = normalizeText(website.name);
  const description = normalizeText(website.description);
  const category = normalizeText(website.category);
  const tags = website.tags.map(tag => normalizeText(tag));

  /* 🔥 1. Exact phrase match (highest priority) */
  if (name.includes(normalizedQuery)) score += 50;
  if (description.includes(normalizedQuery)) score += 35;
  if (category.includes(normalizedQuery)) score += 30;

  /* 🔥 2. Word-by-word scoring */
  queryWords.forEach(word => {
    if (name.includes(word)) score += 18;
    if (description.includes(word)) score += 10;
    if (category.includes(word)) score += 12;

    tags.forEach(tag => {
      if (tag === word) score += 25;
      else if (tag.includes(word)) score += 15;
    });
  });

  /* 🔥 3. Intent-based understanding */
  const intentMap = {
    learn: ["education", "course", "tutorial", "learning"],
    design: ["design", "ui", "ux", "graphics"],
    job: ["career", "jobs", "resume", "interview"],
    code: ["development", "programming", "coding"],
    music: ["music", "audio", "streaming"],
    video: ["video", "movies", "streaming"]
  };

  Object.entries(intentMap).forEach(([intent, keywords]) => {
    if (queryWords.includes(intent)) {
      if (
        keywords.some(k =>
          description.includes(k) ||
          category.includes(k) ||
          tags.includes(k)
        )
      ) {
        score += 30;
      }
    }
  });

  /* 🔥 4. Popularity (soft boost) */
  score += Math.log10(website.popularity + 1) * 10;

  return score;
}

/* -------------------- SEARCH ROUTE -------------------- */

router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const allWebsites = await Website.find();

    if (allWebsites.length === 0) {
      return res.json({
        results: [],
        message: 'No websites found in database'
      });
    }

    const scoredWebsites = allWebsites.map(site => ({
      ...site.toObject(),
      relevanceScore: calculateRelevanceScore(query, site)
    }));

    const rankedWebsites = scoredWebsites
      .filter(site => site.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    res.json({
      query,
      results: rankedWebsites
    });

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      error: 'Failed to search websites',
      details: error.message
    });
  }
});

/* -------------------- ADD WEBSITE -------------------- */

router.post('/add-website', async (req, res) => {
  try {
    const { name, url, description, category, tags } = req.body;

    if (!name || !url || !description || !category || !tags) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newWebsite = new Website({
      name,
      url,
      description,
      category,
      tags,
      popularity: 0
    });

    await newWebsite.save();

    res.status(201).json({
      message: 'Website added successfully',
      website: newWebsite
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to add website',
      details: error.message
    });
  }
});

/* -------------------- GET ALL WEBSITES -------------------- */

router.get('/websites', async (req, res) => {
  try {
    const websites = await Website.find().sort({ popularity: -1 });
    res.json({ websites });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

/* -------------------- DELETE WEBSITE -------------------- */

router.delete('/delete-website/:id', async (req, res) => {
  try {
    await Website.findByIdAndDelete(req.params.id);
    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

module.exports = router;
