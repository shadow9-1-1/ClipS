#!/bin/bash
# Quick Start Script for ClipS Docker Environment (Linux/Mac)

set -e

echo "========================================"
echo "ClipS Docker Environment Setup"
echo "========================================"
echo ""

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update sensitive values."
fi

echo ""
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to become healthy..."
sleep 10

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "========================================"
echo "✅ ClipS is running!"
echo "========================================"
echo ""
echo "Access the application:"
echo "  🌐 Frontend:     http://localhost"
echo "  📡 Backend API:  http://localhost/api"
echo "  📚 API Docs:     http://localhost/api-docs"
echo "  🪣 MinIO:        http://localhost/minio"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
