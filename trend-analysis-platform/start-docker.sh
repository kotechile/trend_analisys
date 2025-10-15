#!/bin/bash

# Trend Analysis Platform - Docker Startup Script
# This script helps you start the application using Docker

echo "🚀 Starting Trend Analysis Platform with Docker..."

# Check if .env files exist in backend and frontend
if [ ! -f backend/.env ]; then
    echo "⚠️  No backend/.env file found. Creating from example..."
    cp backend/env.example backend/.env
    echo "📝 Please edit backend/.env file with your actual API keys and configuration"
fi

if [ ! -f frontend/.env ]; then
    echo "⚠️  No frontend/.env file found. Creating from example..."
    cp frontend/env.example frontend/.env
    echo "📝 Please edit frontend/.env file with your actual API keys and configuration"
fi

if [ ! -f backend/.env ] || [ ! -f frontend/.env ]; then
    echo ""
    echo "🔧 Environment files created. Please update them with your API keys:"
    echo "   Backend: backend/.env"
    echo "   Frontend: frontend/.env"
    echo ""
    read -p "Press Enter after updating the .env files to continue..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "✅ Services started! Access your application at:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8000"
echo "   📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
