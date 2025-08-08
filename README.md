# Kruger Browser - Full Stack Application

A privacy-first browser application built with React, TypeScript, Express, and modern web technologies.

## 🚀 Features

### Frontend
- **React 18** with TypeScript and Vite
- **Modern UI** with Tailwind CSS and Radix UI components
- **Advanced Browser Simulation** with tabs, bookmarks, and history
- **AI Assistant** with voice recognition and natural language processing
- **Privacy Dashboard** with real-time statistics
- **VPN Integration** with server selection and connection management
- **Responsive Design** with mobile, tablet, and desktop support

### Backend
- **Express.js** server with TypeScript
- **Authentication** with JWT tokens and bcrypt password hashing
- **Rate Limiting** with different limits for various endpoints
- **Security** with Helmet.js and CORS protection
- **Validation** with Zod schemas
- **Logging** with Morgan and custom error handling
- **Health Checks** for monitoring and deployment

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI for components
- Framer Motion for animations
- React Query for state management
- React Router for navigation

### Backend
- Express.js with TypeScript
- JWT for authentication
- Bcrypt for password hashing
- Helmet for security headers
- Morgan for logging
- Rate limiting with rate-limiter-flexible
- Zod for validation

## 📦 Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run setup script:**
```bash
npm run setup
```

4. **Start development server:**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

**Required:**
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 8080)

**Optional:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration
- `GOOGLE_SEARCH_API_KEY`, `BING_SEARCH_API_KEY` - Search API keys
- `LOG_LEVEL` - Logging level (default: info)

### Security Configuration

The application includes comprehensive security measures:

- **Helmet.js** for security headers
- **CORS** protection with configurable origins
- **Rate limiting** with different limits per endpoint type
- **JWT authentication** with secure token handling
- **Password hashing** with bcrypt (12 rounds)
- **Input validation** with Zod schemas

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/signup     - Create new user account
POST /api/auth/signin     - Sign in with email/password
GET  /api/auth/profile    - Get user profile (authenticated)
PUT  /api/auth/profile    - Update user profile (authenticated)
```

### Bookmark Endpoints

```
GET    /api/bookmarks           - Get user bookmarks (authenticated)
POST   /api/bookmarks           - Create new bookmark (authenticated)
PUT    /api/bookmarks/:id       - Update bookmark (authenticated)
DELETE /api/bookmarks/:id       - Delete bookmark (authenticated)
POST   /api/bookmarks/:id/favorite - Toggle favorite status (authenticated)
POST   /api/bookmarks/folders   - Create bookmark folder (authenticated)
DELETE /api/bookmarks/folders/:id - Delete bookmark folder (authenticated)
```

### Search Endpoints

```
GET /api/search              - Search the web
GET /api/search/suggestions  - Get search suggestions
```

### Settings Endpoints

```
GET  /api/settings       - Get user settings (authenticated)
PUT  /api/settings       - Update user settings (authenticated)
POST /api/settings/reset - Reset settings to defaults (authenticated)
```

### Analytics Endpoints

```
GET  /api/analytics       - Get user analytics (authenticated)
POST /api/analytics       - Update analytics data (authenticated)
POST /api/analytics/reset - Reset analytics (authenticated)
```

### Health Check Endpoints

```
GET /health       - General health check
GET /health/ready - Readiness probe
GET /health/live  - Liveness probe
```

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Security Headers** via Helmet.js
- **Input Validation** with comprehensive schemas
- **Password Hashing** with bcrypt
- **Error Handling** without information leakage

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Health Monitoring
```bash
# Check application health
npm run health

# Or directly
curl http://localhost:8080/health
```

## 📊 Monitoring

The application includes comprehensive health checks and monitoring:

- **Health endpoint** (`/health`) - Overall application health
- **Readiness probe** (`/health/ready`) - Ready to serve requests
- **Liveness probe** (`/health/live`) - Application is alive
- **Performance metrics** - Memory usage, CPU usage, response times
- **Service status** - Database, cache, and external API availability

## 🧪 Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔧 Development Scripts

```bash
npm run setup         # Run setup script
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run typecheck     # Type checking
npm run format.fix    # Format code
npm run lint          # Lint and fix code
npm run clean         # Clean build artifacts
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   └── lib/              # Utilities
├── server/                # Express backend
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   └── utils/            # Server utilities
├── shared/               # Shared types and utilities
├── scripts/              # Setup and utility scripts
└── logs/                 # Application logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `npm run typecheck` and `npm test`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.# Browser
