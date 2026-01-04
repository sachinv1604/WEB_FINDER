const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Website = require('../models/Website');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Search endpoint using FREE Gemini AI
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get all websites from database
    const allWebsites = await Website.find();

    if (allWebsites.length === 0) {
      return res.json({ 
        results: [], 
        message: 'No websites in database yet. Please add some websites first.' 
      });
    }

    // Prepare website list for AI
    const websiteList = allWebsites.map((site, index) => 
      `${index + 1}. ${site.name}
   URL: ${site.url}
   Description: ${site.description}
   Category: ${site.category}
   Tags: ${site.tags.join(', ')}
   Popularity: ${site.popularity}`
    ).join('\n\n');

    // Create AI prompt
    const prompt = `You are an intelligent website recommendation system. Analyze the user's needs and recommend the most relevant websites.

User's Need: "${query}"

Available Websites:
${websiteList}

Task: Analyze the user's need carefully and rank the top 10 most relevant websites from the list above. Consider:
1. How well the website's description matches the user's need
2. Relevant tags and categories
3. Website popularity as a tiebreaker

Respond ONLY with a JSON array of website numbers (1-${allWebsites.length}) in order of relevance (most relevant first).

Example format: [5, 12, 3, 8, 1, 19, 7, 15, 2, 11]

Return exactly 10 numbers or fewer if there aren't enough relevant websites. Return ONLY the JSON array, nothing else.`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();

    // Parse AI response - handle markdown code blocks
    let cleanText = aiText;
    if (aiText.includes('```')) {
      // Extract JSON from markdown code blocks
      const jsonMatch = aiText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        cleanText = jsonMatch[1];
      }
    }

    // Parse the ranked indices
    const rankedIndices = JSON.parse(cleanText);

    // Validate and get ranked websites
    const rankedWebsites = rankedIndices
      .filter(index => index >= 1 && index <= allWebsites.length) // Validate indices
      .slice(0, 10) // Top 10
      .map(index => allWebsites[index - 1])
      .filter(site => site); // Remove any undefined entries

    res.json({ 
      results: rankedWebsites, 
      query,
      aiPowered: true 
    });

  } catch (error) {
    console.error('Search error:', error.message);
    
    // Fallback to keyword matching if AI fails
    try {
      const allWebsites = await Website.find();
      const scoredWebsites = allWebsites.map(website => ({
        ...website.toObject(),
        relevanceScore: calculateRelevanceScore(req.body.query, website)
      }));

      const rankedWebsites = scoredWebsites
        .filter(site => site.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);

      res.json({ 
        results: rankedWebsites, 
        query: req.body.query,
        aiPowered: false,
        fallbackUsed: true
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Failed to search websites',
        details: error.message 
      });
    }
  }
});

// Fallback keyword matching function
function calculateRelevanceScore(query, website) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  let score = 0;
  
  const nameLower = website.name.toLowerCase();
  queryWords.forEach(word => {
    if (nameLower.includes(word)) score += 10;
  });
  
  const descLower = website.description.toLowerCase();
  queryWords.forEach(word => {
    if (descLower.includes(word)) score += 5;
  });
  
  const categoryLower = website.category.toLowerCase();
  queryWords.forEach(word => {
    if (categoryLower.includes(word)) score += 7;
  });
  
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

// Add a new website
router.post('/add-website', async (req, res) => {
  try {
    const { name, url, description, category, tags } = req.body;

    const newWebsite = new Website({
      name,
      url,
      description,
      category,
      tags,
      popularity: 0
    });

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

module.exports = router;
/*
const express = require('express');
const router = express.Router();
const Website = require('../models/Website');

// Smart keyword matching function (NO API NEEDED!)
function calculateRelevanceScore(query, website) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  let score = 0;
  
  // Check name (highest weight)
  const nameLower = website.name.toLowerCase();
  queryWords.forEach(word => {
    if (nameLower.includes(word)) {
      score += 10;
    }
  });
  
  // Check description (medium weight)
  const descLower = website.description.toLowerCase();
  queryWords.forEach(word => {
    if (descLower.includes(word)) {
      score += 5;
    }
  });
  
  // Check category (medium weight)
  const categoryLower = website.category.toLowerCase();
  queryWords.forEach(word => {
    if (categoryLower.includes(word)) {
      score += 7;
    }
  });
  
  // Check tags (high weight for exact matches)
  website.tags.forEach(tag => {
    const tagLower = tag.toLowerCase();
    queryWords.forEach(word => {
      if (tagLower.includes(word) || word.includes(tagLower)) {
        score += 8;
      }
    });
  });
  
  // Bonus for exact phrase matches
  if (descLower.includes(queryLower)) {
    score += 15;
  }
  
  // Add popularity bonus
  score += website.popularity * 0.1;
  
  return score;
}

// Search endpoint using FREE algorithm
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get all websites from database
    const allWebsites = await Website.find();

    if (allWebsites.length === 0) {
      return res.json({ 
        results: [], 
        message: 'No websites in database yet. Please add some websites first.' 
      });
    }

    // Calculate relevance scores for all websites
    const scoredWebsites = allWebsites.map(website => ({
      ...website.toObject(),
      relevanceScore: calculateRelevanceScore(query, website)
    }));

    // Filter websites with score > 0 and sort by score
    const rankedWebsites = scoredWebsites
      .filter(site => site.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Top 10 results

    res.json({ results: rankedWebsites, query });

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search websites',
      details: error.message 
    });
  }
});

// Add a new website
router.post('/add-website', async (req, res) => {
  try {
    const { name, url, description, category, tags } = req.body;

    const newWebsite = new Website({
      name,
      url,
      description,
      category,
      tags,
      popularity: 0
    });

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

module.exports = router;
*/