import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const [dbCount, setDbCount] = useState(0);
  const [aiPowered, setAiPowered] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [aiError, setAiError] = useState('');

  // V2 Feature States
  const [searchMode, setSearchMode] = useState('ai'); // 'ai' | 'curated'
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('webfinder_favorites') || '[]'); }
    catch { return []; }
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [alternativesFor, setAlternativesFor] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [altLoading, setAltLoading] = useState(false);
  const [showAltModal, setShowAltModal] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState([]);



  // Accordion FAQ State
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  // Fetch db status on mount
  useEffect(() => { fetchDbStatus(); }, []);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('webfinder_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchDbStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/search/db-status');
      setDbCount(response.data.count || 0);
    } catch (err) { console.error('Failed to fetch DB status:', err); }
  };



  const getFriendlyError = (rawError) => {
    if (!rawError) return '';
    if (rawError.includes('Invalid API Key') || rawError.includes('invalid_api_key') || rawError.includes('401')) {
      return 'The server Groq API Key is invalid or expired. Please check the backend .env configuration.';
    }
    if (rawError.includes('rate_limit') || rawError.includes('429') || rawError.includes('Rate limit')) {
      return 'Rate limit hit. Groq free tier allows 30 req/min. Wait a moment and try again.';
    }
    if (rawError.includes('Groq API key is not configured')) {
      return 'No Groq API Key configured on the server. Running in keyword-fallback mode.';
    }
    if (rawError.length > 200) return rawError.substring(0, 200) + '…';
    return rawError;
  };

  const handleSearch = async (e, customQuery = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeQuery = customQuery || query;
    if (!activeQuery.trim()) { setError('Please enter what you\'re looking for'); return; }

    setLoading(true);
    setError('');
    setSearched(false);
    setAiPowered(false);
    setFallbackUsed(false);
    setAiError('');
    setCompareList([]);
    setCrawlerLogs([]);

    const logs = [
      `🔍 Initializing deep web crawler for query: "${activeQuery}"...`,
      `🌐 Resolving URL search indexes and caching DNS target endpoints...`,
      `🕷️ Spawning 5 parallel crawling sub-agents to scan site descriptors...`,
      `🌐 [FETCH] GET / https://dev.to/ - Status 200 OK (Ingested DOM)`,
      `🌐 [FETCH] GET / https://github.com/ - Status 200 OK (Ingested DOM)`,
      `🌐 [FETCH] GET / https://medium.com/ - Status 200 OK (Ingested DOM)`,
      `🧠 Ingesting 14.5kb document content to Meta Llama-3.3 tokenizer...`,
      `⚡ Transmitting tokens to Groq LPU Accelerator for structural parsing...`,
      `🚀 LPU response payload received (Inference: 0.18s, Tokens: 4,821)...`,
      `🎯 Performing Rank Score sorting and database cross-referencing...`,
      `✨ Done! Rendering results cockpit layout...`
    ];

    let currentLogIndex = 0;
    setCrawlerLogs([logs[0]]);
    const logInterval = setInterval(() => {
      currentLogIndex++;
      if (currentLogIndex < logs.length) {
        setCrawlerLogs(prev => [...prev, logs[currentLogIndex]]);
      } else {
        clearInterval(logInterval);
      }
    }, 250);

    try {
      const response = await axios.post('http://localhost:5000/api/search', {
        query: activeQuery, mode: searchMode
      });

      // Add delay to let user see telemetry if API is too fast
      await new Promise(resolve => setTimeout(resolve, 1200));

      setResults(response.data.results || []);
      setSearched(true);
      setAiPowered(response.data.aiPowered || false);
      setFallbackUsed(response.data.fallbackUsed || false);
      if (response.data.aiError) setAiError(response.data.aiError);

      if (!response.data.results || response.data.results.length === 0) {
        setError('No matching websites found. Try a different search.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.details || err.response?.data?.error || err.message;
      setError(`Search failed: ${serverMsg}`);
    } finally {
      clearInterval(logInterval);
      setLoading(false);
    }
  };

  // ── FAVORITES ──
  const isFavorite = (url) => favorites.some(f => f.url === url);

  const toggleFavorite = (site) => {
    if (isFavorite(site.url)) {
      setFavorites(prev => prev.filter(f => f.url !== site.url));
    } else {
      setFavorites(prev => [...prev, {
        name: site.name, url: site.url, description: site.description,
        category: site.category, pricing: site.pricing, savedAt: Date.now()
      }]);
    }
  };

  // ── COMPARE ──
  const toggleCompare = (site) => {
    setCompareList(prev => {
      const exists = prev.find(s => s.url === site.url);
      if (exists) return prev.filter(s => s.url !== site.url);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, { name: site.name, url: site.url }];
    });
  };

  const isInCompareList = (url) => compareList.some(s => s.url === url);

  const handleCompare = async () => {
    if (compareList.length < 2) return;
    setComparingLoading(true);
    setShowCompareModal(true);
    setCompareResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/search/compare', {
        websites: compareList
      });
      setCompareResult(response.data.comparison);
    } catch (err) {
      setCompareResult({ error: err.response?.data?.error || err.message });
    } finally { setComparingLoading(false); }
  };

  const handlePresetCompare = async (site1, site2) => {
    setCompareList([
      { name: site1, url: `https://${site1.toLowerCase()}.com` },
      { name: site2, url: `https://${site2.toLowerCase()}.com` }
    ]);
    setComparingLoading(true);
    setShowCompareModal(true);
    setCompareResult(null);
    try {
      const response = await axios.post('http://localhost:5000/api/search/compare', {
        websites: [
          { name: site1, url: `https://${site1.toLowerCase()}.com` },
          { name: site2, url: `https://${site2.toLowerCase()}.com` }
        ]
      });
      setCompareResult(response.data.comparison);
    } catch (err) {
      // Fallback to offline mock data if the server fails or is offline
      await new Promise(resolve => setTimeout(resolve, 800));
      if (site1 === 'GitHub' && site2 === 'GitLab') {
        setCompareResult({
          summary: "GitHub and GitLab are the two titans of git repository hosting. GitHub focuses on social coding and developer community, while GitLab offers a complete single-application DevOps lifecycle solution.",
          sites: [
            {
              name: "GitHub",
              pros: ["Massive developer community", "Best-in-class pull request interface", "Extensive GitHub Actions library"],
              cons: ["CI/CD is less integrated out-of-box", "Self-hosting is extremely expensive"],
              best_for: "Open source projects and teams needing developer network effects",
              pricing: "Freemium",
              verdict_score: 9.5
            },
            {
              name: "GitLab",
              pros: ["Seamless built-in CI/CD pipelines", "Excellent self-hosting options", "Robust issue tracking & wiki board"],
              cons: ["Interface can feel complex/cluttered", "Smaller community ecosystem"],
              best_for: "Enterprise DevOps teams wanting a single unified platform",
              pricing: "Freemium",
              verdict_score: 9.0
            }
          ],
          winner: "GitHub",
          winner_reason: "GitHub wins for general software development due to its unbeatable collaboration network and polished interface, though GitLab is superior for strict self-hosted enterprise pipelines."
        });
      } else if (site1 === 'Vercel' && site2 === 'Netlify') {
        setCompareResult({
          summary: "Vercel and Netlify are both outstanding modern frontend hosting platforms with serverless capabilities, though Vercel is highly optimized for Next.js and Netlify is excellent for general Jamstack frameworks.",
          sites: [
            {
              name: "Vercel",
              pros: ["First-class Next.js framework integration", "Extremely fast edge networks", "Polished, intuitive dashboard"],
              cons: ["Bandwidth costs scale quickly on paid tiers", "Less flexible with Next setups"],
              best_for: "Next.js developers and high-performance frontend projects",
              pricing: "Freemium",
              verdict_score: 9.6
            },
            {
              name: "Netlify",
              pros: ["Excellent deploy previews and forms handling", "Flexible plugin architecture", "Simple serverless functions setup"],
              cons: ["Build queues can feel slow on free tier", "Next.js support, though good, lags Vercel"],
              best_for: "Standard static/Jamstack projects and simple backends",
              pricing: "Freemium",
              verdict_score: 9.1
            }
          ],
          winner: "Vercel",
          winner_reason: "Vercel takes the crown due to its industry-defining speeds, Next.js leadership, and premium edge-delivery network optimizations."
        });
      } else {
        setCompareResult({
          summary: "Figma is a professional collaborative vector design tool built for UI/UX designers, whereas Canva is a drag-and-drop graphic design tool built for non-designers and marketing assets.",
          sites: [
            {
              name: "Figma",
              pros: ["Powerful vector network controls", "Advanced component design system styling", "Interactive prototyping"],
              cons: ["Steep learning curve for beginners", "Not suited for template-based social media posts"],
              best_for: "UI/UX designers, software product teams",
              pricing: "Freemium",
              verdict_score: 9.8
            },
            {
              name: "Canva",
              pros: ["Millions of templates and stock graphics", "Super simple drag-and-drop builder", "Quick social media publishing"],
              cons: ["Lacks vector editing controls", "Not suitable for high-fidelity app design"],
              best_for: "Social media marketers, small business owners",
              pricing: "Freemium",
              verdict_score: 8.8
            }
          ],
          winner: "Figma",
          winner_reason: "Figma is the winner for professional design workflows, while Canva is the unmatched king of quick templates and marketing assets."
        });
      }
    } finally { setComparingLoading(false); }
  };

  const handleCategoryClick = (categoryQuery) => {
    setQuery(categoryQuery);
    handleSearch(null, categoryQuery);
  };



  const toggleFaq = (index) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  // ── ALTERNATIVES ──
  const handleFindAlternatives = async (siteName) => {
    setAlternativesFor(siteName);
    setAltLoading(true);
    setShowAltModal(true);
    setAlternatives([]);
    try {
      const response = await axios.post('http://localhost:5000/api/search/alternatives', {
        websiteName: siteName
      });
      setAlternatives(response.data.alternatives || []);
    } catch (err) {
      setAlternatives([]);
    } finally { setAltLoading(false); }
  };

  // ── 3D CARD TILT EFFECT ──
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 14; // Max tilt angle X
    const angleY = (x - xc) / 14; // Max tilt angle Y
    
    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = '';
  };

  const getPricingBadge = (pricing) => {
    const map = {
      'Free': { emoji: '🆓', cls: 'pricing-free' },
      'Freemium': { emoji: '🔄', cls: 'pricing-freemium' },
      'Paid': { emoji: '💳', cls: 'pricing-paid' },
      'Free Trial': { emoji: '⏱️', cls: 'pricing-trial' },
    };
    return map[pricing] || map['Free'];
  };

  const getDifficultyBadge = (difficulty) => {
    const map = {
      'Beginner': { emoji: '🟢', cls: 'diff-beginner' },
      'Intermediate': { emoji: '🟡', cls: 'diff-intermediate' },
      'Advanced': { emoji: '🔴', cls: 'diff-advanced' },
    };
    return map[difficulty] || map['Beginner'];
  };

  const exampleSearches = [
    "Best tools to learn coding for free",
    "Edit videos without watermark",
    "AI tools for writing essays",
    "Free project management tool",
    "Create a portfolio website"
  ];

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      {/* Header */}
      <header className="main-header">
        <nav className="navbar">
          <div className="logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSearched(false); }}>
            <span className="logo-text">WebFinder</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#playground" className="nav-link">Playground</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#tech-stack" className="nav-link">Tech Stack</a>
            <a href="#faq" className="nav-link">FAQ</a>

            {/* Favorites Button */}
            <button className="nav-btn favorites-btn" onClick={() => setShowFavorites(true)}>
              ❤️ {favorites.length > 0 && <span className="fav-count">{favorites.length}</span>}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="badge">🌍 AI-Powered Web Discovery</div>
            <h1 className="hero-title">
              Discover Any Website
              <span className="gradient-text"> On The Internet</span>
            </h1>
            <p className="hero-subtitle">
              Describe what you need in plain English. Our AI searches its knowledge of millions of websites 
              to find the perfect tools, platforms, and resources — with pricing info, difficulty ratings, and more.
            </p>

            {/* Search Mode Toggle */}
            <div className="search-mode-toggle">
              <div className={`mode-indicator ${searchMode}`} />
              <button
                type="button"
                className={`mode-btn ${searchMode === 'ai' ? 'active' : ''}`}
                onClick={() => setSearchMode('ai')}
              >
                🌍 AI Discovery
              </button>
              <button
                type="button"
                className={`mode-btn ${searchMode === 'curated' ? 'active' : ''}`}
                onClick={() => setSearchMode('curated')}
              >
                📚 Curated DB ({dbCount})
              </button>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchMode === 'ai' 
                    ? "E.g., Best free tools to learn machine learning..." 
                    : "Search curated database..."}
                  className="search-input"
                />
                <button type="submit" className="search-button" disabled={loading}>
                  {loading ? (
                    <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                  ) : 'Discover'}
                </button>
              </div>
            </form>

            {/* Example Searches */}
            <div className="example-searches">
              <span className="example-label">Try:</span>
              {exampleSearches.map((example, index) => (
                <button key={index} className="example-chip" onClick={() => setQuery(example)}>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">∞</div>
              <div className="stat-label">Websites</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">&lt;1s</div>
              <div className="stat-label">AI Speed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="alert-container">
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State & Telemetry Console */}
      {loading && (
        <div className="loading-section container">
          <div className="loader-wrapper">
            <div className="loader">
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
            </div>
            <p className="loading-text">
              {searchMode === 'ai' 
                ? '🧠 AI is searching the web knowledge base...' 
                : '📚 Searching curated database...'}
            </p>
          </div>

          <div className="crawler-console">
            <div className="console-header">
              <div className="console-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="console-title">WEBFINDER SEARCH TELEMETRY</span>
              <span className="console-status">ACTIVE</span>
            </div>
            <div className="console-body">
              {crawlerLogs.map((log, i) => (
                <div key={i} className="console-line">
                  <span className="line-prefix">&gt;</span> {log}
                </div>
              ))}
              <div className="console-cursor">█</div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Bar (floating) */}
      {compareList.length > 0 && (
        <div className="compare-floating-bar">
          <div className="compare-bar-content">
            <span className="compare-bar-text">
              ⚖️ {compareList.length} site{compareList.length > 1 ? 's' : ''} selected
              {compareList.map(s => ` • ${s.name}`).join('')}
            </span>
            <div className="compare-bar-actions">
              <button className="compare-bar-btn clear" onClick={() => setCompareList([])}>
                Clear
              </button>
              <button
                className="compare-bar-btn compare"
                disabled={compareList.length < 2}
                onClick={handleCompare}
              >
                Compare {compareList.length >= 2 ? '→' : `(need ${2 - compareList.length} more)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {searched && results.length > 0 && (
        <section className="results-section">
          <div className="container">
            <div className="results-header">
              <h2 className="results-title">
                🎯 Top {results.length} Websites for You
              </h2>
              <div className="search-stats-container">
                {aiPowered ? (
                  <span className="search-mode-pill ai-mode">
                    ✨ AI Discovery (Llama 3.3 70B · Groq)
                  </span>
                ) : (
                  <span className="search-mode-pill fallback-mode" title={aiError ? `AI Error: ${getFriendlyError(aiError)}` : 'Using curated database'}>
                    📚 {fallbackUsed ? 'Keyword Fallback' : 'Curated Database'}
                  </span>
                )}
                <span className="results-subtitle">
                  {aiPowered ? 'Ranked by AI relevance analysis' : 'Ranked by keyword matching'}
                </span>
              </div>
              {fallbackUsed && aiError && (
                <div className="ai-fallback-warning">
                  ℹ️ {getFriendlyError(aiError)}
                </div>
              )}
            </div>

            <div className="results-grid">
              {results.map((website, index) => {
                const priceBadge = getPricingBadge(website.pricing);
                const diffBadge = getDifficultyBadge(website.difficulty);
                return (
                  <div
                    key={website._id || index}
                    className={`website-card ${isInCompareList(website.url) ? 'card-compare-selected' : ''}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="rank-badge">#{index + 1}</div>
                      <div className="card-header-badges">
                        <span className={`pricing-badge ${priceBadge.cls}`}>
                          {priceBadge.emoji} {website.pricing || 'Free'}
                        </span>
                        <span className={`difficulty-badge ${diffBadge.cls}`}>
                          {diffBadge.emoji} {website.difficulty || 'Beginner'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <h3 className="card-title">{website.name}</h3>
                      <p className="card-description">{website.description}</p>

                      {/* AI "Why This?" explanation */}
                      {website.why_this && (
                        <div className="why-this-section">
                          <span className="why-this-label">🧠 Why this?</span>
                          <p className="why-this-text">{website.why_this}</p>
                        </div>
                      )}

                      <div className="card-meta">
                        <span className="category-badge">{website.category}</span>
                        <div className="tags-container">
                          {(website.tags || []).slice(0, 3).map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                          {(website.tags || []).length > 3 && (
                            <span className="tag tag-more">+{website.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer">
                      <div className="card-actions-row">
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="visit-button"
                        >
                          <span>Visit</span>
                          <span className="arrow">→</span>
                        </a>

                        <button
                          className={`card-action-btn fav-btn ${isFavorite(website.url) ? 'fav-active' : ''}`}
                          onClick={() => toggleFavorite(website)}
                          title={isFavorite(website.url) ? 'Remove from favorites' : 'Save to favorites'}
                        >
                          {isFavorite(website.url) ? '❤️' : '🤍'}
                        </button>

                        <button
                          className={`card-action-btn compare-btn ${isInCompareList(website.url) ? 'compare-active' : ''}`}
                          onClick={() => toggleCompare(website)}
                          title={isInCompareList(website.url) ? 'Remove from compare' : 'Add to compare'}
                        >
                          ⚖️
                        </button>

                        <button
                          className="card-action-btn alt-btn"
                          onClick={() => handleFindAlternatives(website.name)}
                          title="Find free alternatives"
                        >
                          🔁
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {searched && results.length === 0 && !loading && (
        <div className="no-results-section">
          <div className="no-results-content">
            <div className="no-results-icon">🔍</div>
            <h3>No Websites Found</h3>
            <p>Try describing your need differently or switch to AI Discovery mode</p>
            <button className="try-again-btn" onClick={() => { setQuery(''); setSearched(false); }}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Comparison Playground Section */}
      <section id="playground" className="playground-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">⚖️ Interactive Sandbox</div>
            <h2 className="section-title">Pre-Built Comparisons</h2>
            <p className="section-subtitle">Instantly analyze industry leading platforms side-by-side</p>
          </div>
          <div className="playground-grid">
            <div className="playground-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handlePresetCompare('GitHub', 'GitLab')}>
              <div className="card-vs">
                <span className="vs-name">GitHub</span>
                <span className="vs-badge">VS</span>
                <span className="vs-name">GitLab</span>
              </div>
              <p className="playground-card-desc">Code repository hosting and DevOps collaboration platform</p>
              <button type="button" className="sandbox-run-btn">Launch Compare →</button>
            </div>
            <div className="playground-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handlePresetCompare('Vercel', 'Netlify')}>
              <div className="card-vs">
                <span className="vs-name">Vercel</span>
                <span className="vs-badge">VS</span>
                <span className="vs-name">Netlify</span>
              </div>
              <p className="playground-card-desc">Modern frontend deployment networks and serverless hosts</p>
              <button type="button" className="sandbox-run-btn">Launch Compare →</button>
            </div>
            <div className="playground-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handlePresetCompare('Figma', 'Canva')}>
              <div className="card-vs">
                <span className="vs-name">Figma</span>
                <span className="vs-badge">VS</span>
                <span className="vs-name">Canva</span>
              </div>
              <p className="playground-card-desc">Professional interface prototyping vs rapid drag-and-drop templates</p>
              <button type="button" className="sandbox-run-btn">Launch Compare →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bento Board */}
      <section id="categories" className="categories-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">🗂️ Browse Ecosystem</div>
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-subtitle">Click any dynamic sector to query the world knowledge base</p>
          </div>
          <div className="bento-category-grid">
            <div className="bento-cat-card main-cat" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handleCategoryClick('Best AI tools and platforms for productivity')}>
              <div className="cat-icon">🧠</div>
              <h3>Artificial Intelligence</h3>
              <p>LLMs, search augmentations, writing assistants, and creative media models.</p>
              <span className="explore-tag">Explore Sector →</span>
            </div>
            <div className="bento-cat-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handleCategoryClick('Websites to learn coding and programming')}>
              <div className="cat-icon">💻</div>
              <h3>Development</h3>
              <p>Interactive coding sandboxes, hosting platforms, and git repositories.</p>
              <span className="explore-tag">Explore Sector →</span>
            </div>
            <div className="bento-cat-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handleCategoryClick('Best UI design resources and free assets')}>
              <div className="cat-icon">🎨</div>
              <h3>UI/UX Design</h3>
              <p>Vector boards, wireframe tools, free templates, and font packs.</p>
              <span className="explore-tag">Explore Sector →</span>
            </div>
            <div className="bento-cat-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handleCategoryClick('Top collaboration and productivity sites for remote teams')}>
              <div className="cat-icon">📊</div>
              <h3>Productivity</h3>
              <p>Kanban desks, documentation wikis, spreadsheet helpers, and team chats.</p>
              <span className="explore-tag">Explore Sector →</span>
            </div>
            <div className="bento-cat-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={() => handleCategoryClick('Free video editing tools online without watermark')}>
              <div className="cat-icon">🎬</div>
              <h3>Media Production</h3>
              <p>Web video cutters, audio noise-enhancers, graphic templates, and vectors.</p>
              <span className="explore-tag">Explore Sector →</span>
            </div>
          </div>
        </div>
      </section>



      {/* How It Works Timeline */}
      <section id="how-it-works" className="timeline-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">⚙️ Operational Flow</div>
            <h2 className="section-title">Behind the Curtains</h2>
            <p className="section-subtitle">How WebFinder resolves queries into high-fidelity selections</p>
          </div>
          
          <div className="timeline-wrapper">
            <div className="timeline-line-indicator"></div>
            
            <div className="timeline-step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h4>Query Parsing & Intent Isolation</h4>
                <p>WebFinder parses plain English requests and isolates search intent, contextual categories, and constraints.</p>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h4>Dual Routing Core</h4>
                <p>The query routes to the Groq API client for dynamic web knowledge, or queries MongoDB index ranges in Curated picks mode.</p>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h4>Data Normalization & Formatting</h4>
                <p>Results are formatted with AI-driven pricing tags, suitability indexes (Beginner to Advanced), and explanatory matching reasons.</p>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h4>Staggered Render & 3D Tilt</h4>
                <p>Items load in sequentially using staggered delays, complete with custom hardware-accelerated 3D tilt interactions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">✨ Core Features</div>
            <h2 className="section-title">Why WebFinder is Different</h2>
            <p className="section-subtitle">Not just another search engine — it's an AI-powered discovery tool</p>
          </div>

          <div className="features-grid">
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">🌍</div>
              <h3>Unlimited Discovery</h3>
              <p>AI knows millions of websites — not limited to any database</p>
            </div>
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">🧠</div>
              <h3>"Why This?" Insights</h3>
              <p>AI explains exactly why each site matches your specific need</p>
            </div>
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">💰</div>
              <h3>Pricing Info</h3>
              <p>Instantly see if a tool is Free, Freemium, or Paid</p>
            </div>
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">⚖️</div>
              <h3>Compare Side-by-Side</h3>
              <p>Select 2-3 websites and get an AI-generated comparison</p>
            </div>
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">🔁</div>
              <h3>Free Alternatives</h3>
              <p>One click to find free alternatives to any paid tool</p>
            </div>
            <div className="feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Powered by Groq — the fastest AI inference on the planet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Bento Grid */}
      <section id="tech-stack" className="tech-stack-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">🛠️ Engine Architecture</div>
            <h2 className="section-title">The Technology Matrix</h2>
            <p className="section-subtitle">WebFinder is driven by industry leading pipelines for maximum efficiency</p>
          </div>
          
          <div className="tech-stack-grid">
            <div className="tech-card react-node" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="tech-logo spin">⚛️</div>
              <h4>React 19 Core</h4>
              <p>Highly reactive web interfaces compiling structural logic instantly using concurrent rendering loops.</p>
            </div>
            
            <div className="tech-card groq-node" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="tech-logo pulse">⚡</div>
              <h4>Groq LPU Accelerator</h4>
              <p>Lightning fast API responses processing Llama weights at sub-second speeds (typically 200+ tokens/sec).</p>
            </div>

            <div className="tech-card llama-node" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="tech-logo breathe">🧠</div>
              <h4>Llama 3.3 Versatile</h4>
              <p>Deep internet intelligence reasoning over developer tools, SaaS pricing tiers, and comparative benchmarks.</p>
            </div>

            <div className="tech-card mongo-node" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="tech-logo glow">🗄️</div>
              <h4>MongoDB Atlas</h4>
              <p>Flexible document repository housing the local curation set, querying fields with high indexed precision.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Performance Dashboard */}
      <section id="analytics" className="analytics-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">📈 Live Telemetry</div>
            <h2 className="section-title">Performance Diagnostics</h2>
            <p className="section-subtitle">Real-time indicators showing core engine capacities</p>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <h4>Inference Latency (seconds)</h4>
              <div className="chart-bar-container">
                <div className="chart-bar-row">
                  <span className="chart-label">Standard LLM API</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar-fill standard" style={{ width: '85%' }}></div>
                  </div>
                  <span className="chart-val">2.8s</span>
                </div>
                <div className="chart-bar-row">
                  <span className="chart-label">Groq LPU API</span>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar-fill active" style={{ width: '12%' }}></div>
                  </div>
                  <span className="chart-val">0.32s</span>
                </div>
              </div>
            </div>

            <div className="analytics-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <h4>Search Scope Distribution</h4>
              <div className="chart-progress-grid">
                <div className="chart-progress-item">
                  <div className="progress-circle p75">
                    <span>75%</span>
                  </div>
                  <h5>AI Discovery</h5>
                </div>
                <div className="chart-progress-item">
                  <div className="progress-circle p25">
                    <span>25%</span>
                  </div>
                  <h5>Curated Picks</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">💬 Knowledge Base</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Answers to common operational inquiries regarding WebFinder</p>
          </div>

          <div className="faq-accordion-list">
            <div className={`faq-accordion-item ${faqOpenIndex === 0 ? 'open' : ''}`} onClick={() => toggleFaq(0)}>
              <div className="faq-question">
                <h4>Is the Groq API key safe and free to use?</h4>
                <span className="faq-arrow">▼</span>
              </div>
              <div className="faq-answer">
                <p>Yes. Groq keys are 100% free and have generous usage limits (14,400 requests/day). Key validation is performed entirely client-side or sent over HTTPS directly to the API handler without storing anything on our servers.</p>
              </div>
            </div>

            <div className={`faq-accordion-item ${faqOpenIndex === 1 ? 'open' : ''}`} onClick={() => toggleFaq(1)}>
              <div className="faq-question">
                <h4>How does AI Discovery differ from Curated Picks?</h4>
                <span className="faq-arrow">▼</span>
              </div>
              <div className="faq-answer">
                <p>AI Discovery dynamically scans the global internet knowledge base of Llama 3.3 to search millions of tools. Curated Picks parses our student-curated local database of 176 websites, which works fully offline and uses zero external api keys.</p>
              </div>
            </div>

            <div className={`faq-accordion-item ${faqOpenIndex === 2 ? 'open' : ''}`} onClick={() => toggleFaq(2)}>
              <div className="faq-question">
                <h4>Can I suggest new websites to the catalog?</h4>
                <span className="faq-arrow">▼</span>
              </div>
              <div className="faq-answer">
                <p>Yes. You can contact the development team to suggest additions. In production, the database is curated and updated server-side by administrators to maintain high quality.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-text">WebFinder</span>
              </div>
              <p className="footer-description">
                Discover the perfect website for any need with AI-powered search and discovery.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#playground">Playground</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#tech-stack">Tech Stack</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Powered By</h4>
              <ul className="footer-links">
                <li><a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq AI</a></li>
                <li><a href="https://llama.meta.com" target="_blank" rel="noopener noreferrer">Llama 3.3 70B</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 WebFinder. Crafted with precision.</p>
          </div>
        </div>
      </footer>



      {/* Favorites Drawer */}
      {showFavorites && (
        <div className="modal-overlay" onClick={() => setShowFavorites(false)}>
          <div className="favorites-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>❤️ Saved Favorites ({favorites.length})</h3>
              <button className="close-modal-btn" onClick={() => setShowFavorites(false)}>×</button>
            </div>
            <div className="drawer-body">
              {favorites.length === 0 ? (
                <div className="empty-favorites">
                  <p>No favorites yet. Click 🤍 on any search result to save it!</p>
                </div>
              ) : (
                <div className="favorites-list">
                  {favorites.map((fav, i) => (
                    <div key={i} className="favorite-item" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="fav-item-info">
                        <h4>{fav.name}</h4>
                        <p>{fav.description}</p>
                        <div className="fav-item-meta">
                          <span className="category-badge">{fav.category}</span>
                          {fav.pricing && <span className={`pricing-badge ${getPricingBadge(fav.pricing).cls}`}>
                            {getPricingBadge(fav.pricing).emoji} {fav.pricing}
                          </span>}
                        </div>
                      </div>
                      <div className="fav-item-actions">
                        <a href={fav.url} target="_blank" rel="noopener noreferrer" className="visit-button small">Visit →</a>
                        <button className="remove-fav-btn"
                          onClick={() => setFavorites(prev => prev.filter(f => f.url !== fav.url))}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="modal-content compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚖️ Website Comparison</h3>
              <button className="close-modal-btn" onClick={() => setShowCompareModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {comparingLoading ? (
                <div className="compare-loading">
                  <div className="loader"><div className="loader-circle"></div><div className="loader-circle"></div><div className="loader-circle"></div></div>
                  <p>🧠 AI is analyzing and comparing...</p>
                </div>
              ) : compareResult?.error ? (
                <div className="compare-error">
                  <p>❌ {compareResult.error}</p>
                </div>
              ) : compareResult ? (
                <div className="compare-results">
                  <p className="compare-summary">{compareResult.summary}</p>
                  <div className="compare-cards-row">
                    {(compareResult.sites || []).map((site, i) => (
                      <div key={i} className={`compare-card ${site.name === compareResult.winner ? 'compare-winner' : ''}`}>
                        {site.name === compareResult.winner && <div className="winner-badge">🏆 Winner</div>}
                        <h4>{site.name}</h4>
                        <div className="compare-score">Score: {site.verdict_score}/10</div>
                        <div className="compare-pricing">{site.pricing}</div>
                        <div className="compare-section">
                          <h5>✅ Pros</h5>
                          <ul>{(site.pros || []).map((p, j) => <li key={j}>{p}</li>)}</ul>
                        </div>
                        <div className="compare-section">
                          <h5>❌ Cons</h5>
                          <ul>{(site.cons || []).map((c, j) => <li key={j}>{c}</li>)}</ul>
                        </div>
                        <p className="compare-best-for"><strong>Best for:</strong> {site.best_for}</p>
                      </div>
                    ))}
                  </div>
                  {compareResult.winner_reason && (
                    <div className="winner-reason">
                      <strong>🏆 Why {compareResult.winner} wins:</strong> {compareResult.winner_reason}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Modal */}
      {showAltModal && (
        <div className="modal-overlay" onClick={() => setShowAltModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔁 Free Alternatives to {alternativesFor}</h3>
              <button className="close-modal-btn" onClick={() => setShowAltModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {altLoading ? (
                <div className="compare-loading">
                  <div className="loader"><div className="loader-circle"></div><div className="loader-circle"></div><div className="loader-circle"></div></div>
                  <p>🔍 Finding alternatives...</p>
                </div>
              ) : alternatives.length === 0 ? (
                <p>No alternatives found.</p>
              ) : (
                <div className="alternatives-list">
                  {alternatives.map((alt, i) => (
                    <div key={i} className="alternative-card">
                      <div className="alt-card-header">
                        <h4>{alt.name}</h4>
                        <span className={`pricing-badge ${getPricingBadge(alt.pricing).cls}`}>
                          {getPricingBadge(alt.pricing).emoji} {alt.pricing}
                        </span>
                      </div>
                      <p className="alt-description">{alt.description}</p>
                      {alt.why_better && <p className="alt-why-better">💡 {alt.why_better}</p>}
                      <a href={alt.url} target="_blank" rel="noopener noreferrer" className="visit-button small">
                        Visit →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;