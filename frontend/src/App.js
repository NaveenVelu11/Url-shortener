import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = (process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes('your-domain.com')) 
  ? process.env.REACT_APP_API_URL 
  : (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5002');

function App() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [password, setPassword] = useState("");
  const [clickLimit, setClickLimit] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("urlHistory") || "[]");
    setHistory(savedHistory);
    const savedTheme = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedTheme);
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const shorten = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/shorten`, {
        originalUrl: url,
        customAlias: customAlias || undefined,
        expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
        password: password || undefined,
        clickLimit: clickLimit ? parseInt(clickLimit) : undefined
      });

      setResult(res.data);
      if (res.data.shortCode) {
        loadQRCode(res.data.shortCode);
        saveToHistory(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const bulkShorten = async () => {
    const urls = bulkUrls.split("\n").filter(u => u.trim());
    if (urls.length === 0) return;

    setLoading(true);
    const results = [];

    for (const u of urls) {
      try {
        const res = await axios.post(`${API_URL}/api/shorten`, {
          originalUrl: u.trim()
        });
        results.push(res.data);
        saveToHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(false);
    alert(`Shortened ${results.length} URLs! Check history.`);
    setBulkUrls("");
    setShowBulk(false);
  };

  const saveToHistory = (data) => {
    const newHistory = [{ ...data, timestamp: Date.now() }, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("urlHistory", JSON.stringify(newHistory));
  };

  const deleteFromHistory = (shortCode) => {
    const newHistory = history.filter(h => h.shortCode !== shortCode);
    setHistory(newHistory);
    localStorage.setItem("urlHistory", JSON.stringify(newHistory));
  };

  const loadQRCode = async (shortCode) => {
    if (!shortCode) return;
    try {
      const res = await axios.get(`${API_URL}/api/qr/${shortCode}?color=${qrColor.replace('#', '')}`);
      setQrCode(res.data.qrCode);
    } catch (err) {
      console.error("Failed to load QR code", err);
    }
  };

  const loadAnalytics = async () => {
    if (!result?.shortCode) return;

    try {
      const res = await axios.get(`${API_URL}/api/analytics/${result.shortCode}`);
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to load analytics");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform) => {
    const text = `Check out this link: ${result.shortUrl}`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(result.shortUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(result.shortUrl)}`
    };
    window.open(urls[platform], '_blank');
  };

  const reset = () => {
    setUrl("");
    setCustomAlias("");
    setExpiresIn("");
    setPassword("");
    setClickLimit("");
    setResult(null);
    setAnalytics(null);
    setQrCode("");
    setError("");
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-top">
            <div className="logo">🔗</div>
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <h1>URL Shortener Pro</h1>
          <p className="subtitle">Transform long URLs into short, shareable links</p>
        </header>

        <div className="card">
          <div className="tabs">
            <button className={!showBulk ? "tab active" : "tab"} onClick={() => setShowBulk(false)}>Single URL</button>
            <button className={showBulk ? "tab active" : "tab"} onClick={() => setShowBulk(true)}>Bulk URLs</button>
          </div>

          {!showBulk ? (
            <>
              <div className="input-group">
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && shorten()}
                />
              </div>

              <div className="advanced-options">
                <input
                  type="text"
                  className="input-small"
                  placeholder="Custom alias (optional)"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
                <input
                  type="number"
                  className="input-small"
                  placeholder="Expires in (days)"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                />
                <input
                  type="password"
                  className="input-small"
                  placeholder="Password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input
                  type="number"
                  className="input-small"
                  placeholder="Click limit"
                  value={clickLimit}
                  onChange={(e) => setClickLimit(e.target.value)}
                />
              </div>

              <button
                className={`btn ${loading ? "loading" : ""}`}
                onClick={shorten}
                disabled={loading}
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </button>
            </>
          ) : (
            <>
              <div className="input-group">
                <textarea
                  className="input textarea"
                  placeholder="Enter multiple URLs (one per line)..."
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  rows="6"
                />
              </div>
              <button
                className={`btn ${loading ? "loading" : ""}`}
                onClick={bulkShorten}
                disabled={loading}
              >
                {loading ? "Processing..." : "Shorten All URLs"}
              </button>
            </>
          )}

          {error && <div className="error">{error}</div>}

          {result && (
            <div className="result">
              <div className="result-header">
                <h3>✓ Success!</h3>
                <button className="btn-reset" onClick={reset}>New URL</button>
              </div>

              <div className="short-url-box">
                <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                  {result.shortUrl}
                </a>
                <button className="btn-copy" onClick={() => copyToClipboard()}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <div className="social-share">
                <button onClick={() => shareToSocial('twitter')}>🐦 Twitter</button>
                <button onClick={() => shareToSocial('whatsapp')}>💬 WhatsApp</button>
                <button onClick={() => shareToSocial('facebook')}>📘 Facebook</button>
                <button onClick={() => shareToSocial('linkedin')}>💼 LinkedIn</button>
              </div>

              <button className="btn-analytics" onClick={loadAnalytics}>
                {analytics ? "Refresh Analytics" : "View Analytics"}
              </button>

              {analytics && (
                <div className="analytics">
                  <h4>📊 Analytics</h4>
                  <div className="stats">
                    <div className="stat">
                      <span className="stat-label">Total Clicks</span>
                      <span className="stat-value">{analytics.clicks}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Created</span>
                      <span className="stat-value">
                        {new Date(analytics.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {analytics.lastAccessed && (
                      <div className="stat">
                        <span className="stat-label">Last Accessed</span>
                        <span className="stat-value">
                          {new Date(analytics.lastAccessed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="card history-card">
            <h3>📜 Recent Links</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.shortCode} className="history-item">
                  <div className="history-info">
                    <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
                      {item.shortUrl}
                    </a>
                    <span className="history-time">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-actions">
                    <button onClick={() => copyToClipboard(item.shortUrl)}>📋</button>
                    <button onClick={() => deleteFromHistory(item.shortCode)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
