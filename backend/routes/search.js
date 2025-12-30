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




