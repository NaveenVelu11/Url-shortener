# URL Shortener Pro 🔗

A professional, production-ready URL shortener with analytics, QR codes, and modern UI/UX.

## Features ✨

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Aliases**: Create memorable custom short codes
- **QR Code Generation**: Automatic QR code for each shortened URL
- **Analytics Dashboard**: Track clicks, timestamps, and user agents
- **Expiration Dates**: Set automatic expiration for temporary links
- **Rate Limiting**: Prevent abuse with request throttling
- **Modern UI/UX**: Responsive design with smooth animations
- **Copy to Clipboard**: One-click copy functionality
- **Security**: Helmet.js, input validation, and sanitization

## Tech Stack 🛠️

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Helmet.js (Security)
- Express Rate Limit
- QRCode generation
- Nanoid (Short code generation)

### Frontend
- React 18
- Axios
- Modern CSS with animations
- Responsive design

## Installation 📦

### Prerequisites
- Node.js (v14+)
- MongoDB

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5002
PORT=5002
```

Start server:
```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Endpoints 🌐

### POST /api/shorten
Create shortened URL
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "mylink",
  "expiresIn": 30
}
```

### GET /:shortCode
Redirect to original URL

### GET /api/analytics/:shortCode
Get analytics for shortened URL

### GET /api/qr/:shortCode
Get QR code for shortened URL

## System Design 🏗️

### Architecture
- MVC pattern with controllers, models, routes
- Middleware for rate limiting and error handling
- Database indexing for performance
- TTL indexes for automatic expiration

### Scalability
- MongoDB indexes on shortCode and createdAt
- Rate limiting (100 requests per 15 minutes)
- Efficient query patterns
- Ready for Redis caching integration

### Security
- Helmet.js for HTTP headers
- Input validation and sanitization
- CORS configuration
- Rate limiting
- No sensitive data exposure

## Performance Optimizations ⚡

- Database indexes for fast lookups
- Minimal dependencies
- Efficient React state management
- CSS animations with GPU acceleration
- Lazy loading ready

## Future Enhancements 🚀

- [ ] Redis caching layer
- [ ] User authentication
- [ ] Link management dashboard
- [ ] Bulk URL shortening
- [ ] API key system
- [ ] Advanced analytics (geolocation, devices)
- [ ] Custom domains
- [ ] Link preview generation

## License

MIT
