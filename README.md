# ClipS - Short-Video Social Platform

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)

A high-performance, full-stack short-video social platform designed as a comprehensive ecosystem for modern video content creation and consumption.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ClipS is a production-ready short-video social platform built with modern web technologies. It provides a complete ecosystem for users to create, share, discover, and interact with short-form video content. The platform is designed for scalability, performance, and exceptional user experience.

### Key Highlights

- 🚀 **High-Performance Architecture** - Optimized for speed and scalability
- 🔐 **Enterprise-Grade Security** - JWT authentication, rate limiting, and data validation
- 💰 **Integrated Payments** - Stripe integration for monetization
- 🔄 **Real-time Notifications** - WebSocket support via Socket.io
- 📧 **Email Services** - Nodemailer integration for transactional emails
- 🎥 **Video Processing** - FFmpeg integration for video transcoding
- 💾 **Cloud Storage** - AWS S3 integration for media management
- 🎨 **Modern UI/UX** - Next.js 16 with React 19 and Tailwind CSS
- 🔍 **Advanced Search** - Efficient video discovery and filtering
- 📊 **Admin Dashboard** - Comprehensive administrative controls

---

## Features

### User Features
- **Video Management** - Upload, edit, and manage video content
- **Social Interactions** - Like, comment, and save videos
- **User Following** - Build and manage follower networks
- **Search & Discovery** - Find videos and users efficiently
- **Notifications** - Real-time updates on interactions
- **User Profiles** - Customizable profile management

### Content Management
- **Video Upload** - Support for multiple video formats
- **Automatic Transcoding** - FFmpeg-powered video processing
- **Thumbnail Generation** - Automatic poster generation
- **Video Validation** - Pre-upload validation

### Monetization
- **Payment Processing** - Stripe integration
- **Transaction Tracking** - Complete transaction history
- **Wallet Management** - User balance management

### Administration
- **User Management** - Admin controls for users
- **Content Moderation** - Video and review management
- **Analytics** - System-wide analytics and reporting
- **System Health** - Health monitoring and status checks

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.21+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **API Documentation**: Swagger/OpenAPI
- **Security**:
  - Helmet.js - HTTP security headers
  - Express Rate Limit - DDoS protection
  - Bcrypt - Password hashing
  - Express Mongo Sanitize - NoSQL injection prevention
- **Media Processing**:
  - FFmpeg - Video transcoding
  - Multer - File upload handling
  - AWS S3 SDK - Cloud storage
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Payments**: Stripe API
- **Queue System**: BullMQ with Redis
- **Caching**: Redis
- **Validation**: Zod schema validation
- **Request Logging**: Morgan

### Frontend
- **Framework**: Next.js 16.2+
- **Runtime**: React 19+
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Notifications**: Sonner Toast
- **Utilities**: clsx, class-variance-authority

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Databases**:
  - MongoDB (Primary Database)
  - Redis (Caching & Queue)
  - MinIO (S3-compatible storage)

---

## Project Architecture

```
ClipS (Full-Stack)
├── Backend (Node.js/Express)
│   ├── API Server (Port 5000)
│   ├── Socket.io Real-time Server
│   ├── Worker Process (Job Queue)
│   └── External Services (S3, Stripe, Email)
├── Frontend (Next.js/React)
│   ├── Web App (Port 3000)
│   └── Client-side State Management
├── Database Layer
│   ├── MongoDB
│   ├── Redis Cache
│   └── MinIO Object Storage
└── Infrastructure
    ├── Docker Containers
    ├── Nginx Reverse Proxy
    └── Network Orchestration
```

### Service Communication
- **Frontend → Backend**: REST API + WebSocket
- **Backend → Database**: Direct connection with connection pooling
- **Backend → External Services**: AWS S3, Stripe, Email services
- **Real-time**: Socket.io for instant notifications

---

## Prerequisites

### Required
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MongoDB**: v5.0 or higher (local or cloud instance)
- **Redis**: v6.0 or higher

### Optional (for Docker setup)
- **Docker**: v20.0+
- **Docker Compose**: v2.0+

### Optional (for development)
- **FFmpeg**: For local video processing
- **AWS Account**: For S3 storage (or use MinIO locally)

---

## Getting Started

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ClipS
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend/clips
npm install
```

### Configuration

1. **Backend Configuration** (`backend/.env`)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/clips

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

2. **Frontend Configuration** (`frontend/clips/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=ClipS
```

### Option A: Local Development

1. **Start MongoDB**
```bash
mongod
```

2. **Start Redis**
```bash
redis-server
```

3. **Start Backend**
```bash
cd backend
npm run dev
```

4. **Start Frontend** (in another terminal)
```bash
cd frontend/clips
npm run dev
```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - API Docs: http://localhost:5000/api-docs

### Option B: Docker Setup

1. **Start all services**
```bash
docker-compose up -d
```

Or on Windows with PowerShell:
```powershell
.\docker-start.ps1
```

2. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost:5000
   - Nginx: http://localhost

3. **View logs**
```bash
docker-compose logs -f
```

4. **Stop services**
```bash
docker-compose down
```

---

## Development

### Running the Backend

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start

# Start background worker
npm run worker
```

### Running the Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run with different bundler
npm run dev:webpack
```

### API Testing

- **Postman Collections**: Located in `backend/postman/`
  - `ClipS API test.postman_collection.json`
  - `ClipS Phase 2 API test.postman_collection.json`
  - `ClipS test.postman_environment.json`

- **Swagger/OpenAPI**: Available at `http://localhost:5000/api-docs`

### Code Quality

```bash
# Frontend linting
npm run lint

# Backend (add to backend/package.json if needed)
npm run test
```

---

## Project Structure

### Backend
```
backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   ├── worker.js              # Background worker
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   ├── queueConnection.js # Queue setup
│   │   ├── redis.js           # Redis configuration
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/           # Request handlers
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── workers/               # Background job handlers
│   ├── sockets/               # WebSocket handlers
│   └── queues/                # Job queue definitions
├── Dockerfile
├── package.json
└── postman/                   # API testing collections
```

### Frontend
```
frontend/clips/
├── app/                       # Next.js app directory
├── components/                # Reusable React components
├── context/                   # React context
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── public/                    # Static assets
├── middleware.ts              # Next.js middleware
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── eslint.config.mjs         # ESLint configuration
├── Dockerfile
├── package.json
└── README.md
```

---

## API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

#### Videos
- `GET /api/videos` - Get video feed
- `POST /api/videos` - Create video
- `GET /api/videos/:id` - Get video details
- `PATCH /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id/reviews` - Get video reviews

#### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update profile
- `GET /api/users/:id/videos` - Get user videos
- `GET /api/users/:id/followers` - Get followers

#### Social Interactions
- `POST /api/likes` - Like a video
- `DELETE /api/likes/:id` - Unlike video
- `POST /api/saves` - Save video
- `DELETE /api/saves/:id` - Unsave video
- `POST /api/follows` - Follow user
- `DELETE /api/follows/:id` - Unfollow user

#### Payments
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/transactions` - Get transaction history

#### Admin
- `GET /api/admin/users` - List users
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id` - Update user
- `GET /api/admin/analytics` - Get analytics

Complete API documentation available at `/api-docs` (Swagger UI)

---

## Configuration

### Environment Variables

#### Backend
See `backend/.env` configuration section above.

#### Frontend
See `frontend/clips/.env.local` configuration section above.

### Database

**MongoDB Collections**:
- `users` - User accounts and profiles
- `videos` - Video content metadata
- `videolikes` - Video like relationships
- `videosaves` - Video save relationships
- `follows` - User follow relationships
- `reviews` - Video reviews and comments
- `payments` - Payment records
- `transactions` - Transaction history

### Redis

- Cache storage for sessions and frequently accessed data
- BullMQ job queue for background tasks
- Socket.io adapter for multi-instance support

---

## Docker Compose Services

When running with Docker Compose, the following services are available:

- **MongoDB**: Port 27017
- **Redis**: Port 6379
- **MinIO**: Port 9000 (S3-compatible storage)
- **Backend API**: Port 5000
- **Frontend**: Port 3000
- **Nginx**: Port 80

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow project naming conventions
- Write clear commit messages
- Include relevant documentation
- Test changes thoroughly

---

## Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
mongod

# Check connection string in .env
```

**Redis Connection Error**
```bash
# Ensure Redis is running
redis-server

# Verify Redis is accessible
redis-cli ping
```

**Port Already in Use**
```bash
# Change port in .env
PORT=5001
```

### Performance Tips

- Enable Redis caching for frequently accessed data
- Use MongoDB indexes for common queries
- Implement video CDN for media delivery
- Use Nginx reverse proxy for production

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with modern web technologies and best practices for scalability, security, and developer experience.

---

<div align="center">

**[Back to top](#clips---short-video-social-platform)**


</div>
