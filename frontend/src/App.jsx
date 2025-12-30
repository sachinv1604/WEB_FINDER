import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter what you\'re looking for');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(false);

    try {
      const response = await axios.post('http://localhost:5000/api/search', {
        query: query
      });

      setResults(response.data.results);
      setSearched(true);
      
      if (response.data.results.length === 0) {
        setError('No matching websites found. Try a different search.');
      }
    } catch (err) {
      setError('Something went wrong. Make sure the backend server is running!');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exampleSearches = [
    "Learn programming",
    "Edit photos online",
    "Project management",
    "Find a job",
    "Learn Spanish"
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
          <div className="logo">
            <span className="logo-icon">🔍</span>
            <span className="logo-text">WebFinder</span>
          </div>
          <div className="nav-links">
            <a href="#home" className="nav-link active">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <button className="nav-btn">Contact</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="badge">✨ Smart Website Discovery</div>
            <h1 className="hero-title">
              Find the Perfect Website
              <span className="gradient-text"> For Your Needs</span>
            </h1>
            <p className="hero-subtitle">
              Don't remember the name? No problem! Just describe what you need, 
              and our intelligent search will find the best websites for you.
            </p>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="E.g., I need a tool to edit photos online..."
                  className="search-input"
                />
                <button type="submit" className="search-button" disabled={loading}>
                  {loading ? (
                    <span className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </form>

            {/* Example Searches */}
            <div className="example-searches">
              <span className="example-label">Try:</span>
              {exampleSearches.map((example, index) => (
                <button
                  key={index}
                  className="example-chip"
                  onClick={() => setQuery(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">20+</div>
              <div className="stat-label">Websites</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10+</div>
              <div className="stat-label">Categories</div>
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

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="loader">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
          </div>
          <p className="loading-text">Analyzing your needs...</p>
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
              <p className="results-subtitle">
                Ranked by relevance to your search
              </p>
            </div>

            <div className="results-grid">
              {results.map((website, index) => (
                <div 
                  key={website._id} 
                  className="website-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="popularity-badge">
                      ⭐ {website.popularity}
                    </div>
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{website.name}</h3>
                    <p className="card-description">{website.description}</p>

                    <div className="card-meta">
                      <span className="category-badge">{website.category}</span>
                      <div className="tags-container">
                        {website.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                        {website.tags.length > 3 && (
                          <span className="tag tag-more">+{website.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <a 
                      href={website.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="visit-button"
                    >
                      <span>Visit Website</span>
                      <span className="arrow">→</span>
                    </a>
                  </div>
                </div>
              ))}
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
            <p>Try describing your need differently or use different keywords</p>
            <button 
              className="try-again-btn"
              onClick={() => {
                setQuery('');
                setSearched(false);
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose WebFinder?</h2>
            <p className="section-subtitle">Discover the benefits of smart website discovery</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>Our algorithm finds the most relevant websites based on your description</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Get instant results without any delays or waiting time</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🆓</div>
              <h3>100% Free</h3>
              <p>No subscriptions, no hidden fees. Completely free forever</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Works perfectly on all devices - desktop, tablet, and mobile</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy First</h3>
              <p>We don't track your searches or collect personal data</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Curated Quality</h3>
              <p>Only the best and most popular websites in our database</p>
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
                <span className="logo-icon">🔍</span>
                <span className="logo-text">WebFinder</span>
              </div>
              <p className="footer-description">
                Discover the perfect website for your needs with intelligent search technology.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="social-link">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.18 2.042-1.007 7.028-1.424 9.32-.176 1-.523 1.334-.858 1.367-.728.067-1.281-.481-1.987-.943-1.106-.722-1.732-1.171-2.807-1.875-1.243-.815-.437-1.264.271-1.996.185-.191 3.408-3.127 3.471-3.394.008-.033.016-.156-.058-.221s-.177-.047-.253-.028c-.107.027-1.816 1.154-5.13 3.385-.485.333-.924.494-1.317.482-.433-.01-1.265-.245-1.884-.446-.759-.246-1.362-.376-1.309-.795.027-.218.324-.442.892-.671 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.139.121.098.154.228.17.32.017.092.038.303.021.467z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Categories</h4>
              <ul className="footer-links">
                <li><a href="#">Design Tools</a></li>
                <li><a href="#">Productivity</a></li>
                <li><a href="#">Development</a></li>
                <li><a href="#">Education</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 WebFinder. All rights reserved. Made with ❤️ by Students</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;