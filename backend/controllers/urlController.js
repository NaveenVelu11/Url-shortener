const { nanoid } = require("nanoid");
const Url = require("../models/Url");
const { isValidUrl } = require("../utils/validators");

const getBaseUrl = (req) => {
  if (process.env.BASE_URL && !process.env.BASE_URL.includes('your-domain.com')) {
    return process.env.BASE_URL;
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${req.get('host')}`;
};

exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresIn, password, clickLimit } = req.body;

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({
        shortUrl: `${getBaseUrl(req)}/${existing.shortCode}`,
        shortCode: existing.shortCode
      });
    }

    let shortCode = customAlias || nanoid(6);

    if (customAlias) {
      const aliasExists = await Url.findOne({ shortCode: customAlias });
      if (aliasExists) {
        return res.status(409).json({ error: "Custom alias already taken" });
      }
    }

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;

    const newUrl = new Url({
      originalUrl,
      shortCode,
      expiresAt,
      createdBy: req.ip,
      password: password || undefined,
      clickLimit: clickLimit || undefined
    });

    await newUrl.save();

    res.status(201).json({
      shortUrl: `${getBaseUrl(req)}/${shortCode}`,
      shortCode,
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.query;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    if (url.password && url.password !== password) {
      return res.status(401).json({ error: "Password required" });
    }

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: "URL has expired" });
    }

    if (url.clickLimit && url.clicks >= url.clickLimit) {
      return res.status(410).json({ error: "Click limit reached" });
    }

    url.clicks++;
    url.lastAccessed = new Date();
    url.clickDetails.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get("user-agent")
    });

    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const analytics = {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastAccessed: url.lastAccessed,
      expiresAt: url.expiresAt,
      clickHistory: url.clickDetails.slice(-50)
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { color } = req.query;
    const QRCode = require("qrcode");

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const qrOptions = {
      color: {
        dark: color ? `#${color}` : '#000000',
        light: '#ffffff'
      }
    };

    const qrCodeDataUrl = await QRCode.toDataURL(`${getBaseUrl(req)}/${shortCode}`, qrOptions);

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
