# 🐳 Docker Setup Guide for Trend Analysis Platform

This guide will help you run the Trend Analysis Platform using Docker on your laptop.

## 📋 Prerequisites

- Docker Desktop installed and running
- At least 4GB of available RAM
- Ports 8000 and 3000 available on your system

## 🚀 Quick Start

### Option 1: Simple Backend Only (Recommended for Development)

```bash
# 1. Navigate to the project directory
cd /path/to/trend-analysis-platform

# 2. Create environment files from existing examples
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 3. Edit the .env files with your API keys
# Backend: backend/.env
# Frontend: frontend/.env

# 4. Start the backend service
docker-compose -f docker-compose.dev.yml up --build
```

### Option 2: Full Stack (Backend + Frontend + Database)

```bash
# 1. Navigate to the project directory
cd /path/to/trend-analysis-platform

# 2. Create environment files from existing examples
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# 3. Edit the .env files with your API keys
# Backend: backend/.env
# Frontend: frontend/.env

# 4. Start all services
docker-compose up --build -d
```

### Option 3: Using the Startup Script

```bash
# 1. Make the script executable (if not already)
chmod +x start-docker.sh

# 2. Run the startup script
./start-docker.sh
```

## 🔧 Configuration

### Environment Variables

The Docker setup uses the existing environment files in your project:

- **Backend**: `backend/.env` (created from `backend/env.example`)
- **Frontend**: `frontend/.env` (created from `frontend/env.example`)

These files contain comprehensive configuration options including:

**Backend Environment Variables** (`backend/.env`):
- Database configuration (PostgreSQL/SQLite)
- Redis configuration
- Security settings (JWT, CORS)
- External API keys (Supabase, OpenAI, Anthropic, etc.)
- Rate limiting and performance settings

**Frontend Environment Variables** (`frontend/.env`):
- Supabase configuration
- API base URL
- Application settings

The Docker containers will automatically load these environment files, so you only need to:
1. Copy the example files: `cp backend/env.example backend/.env`
2. Edit the `.env` files with your actual API keys and configuration

## 🌐 Access Points

Once running, you can access:

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Frontend** (if using full stack): http://localhost:3000

## 📊 Available Services

### Development Setup (`docker-compose.dev.yml`)
- **Backend API**: FastAPI application with hot reload
- **Redis**: Caching and session storage

### Full Stack Setup (`docker-compose.yml`)
- **Backend API**: FastAPI application
- **Frontend**: React/TypeScript application
- **PostgreSQL**: Primary database
- **Redis**: Caching and session storage
- **Nginx**: Reverse proxy (optional)

## 🛠️ Common Commands

### Start Services
```bash
# Development mode (backend only)
docker-compose -f docker-compose.dev.yml up

# Full stack
docker-compose up -d

# With rebuild
docker-compose up --build
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Rebuild Services
```bash
# Rebuild specific service
docker-compose build backend

# Rebuild all services
docker-compose build
```

## 🔍 Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start
```bash
# Check container logs
docker-compose logs backend

# Check if image exists
docker images | grep trend-analysis

# Rebuild the image
docker-compose build --no-cache backend
```

### Database Connection Issues
```bash
# Check if Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Memory Issues
If you're running out of memory:
```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Or use the minimal setup with docker-compose.dev.yml
```

## 🧪 Testing the Setup

### Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# API documentation
open http://localhost:8000/docs
```

### Test Database Connection
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# List keys
KEYS *
```

## 📁 File Structure

```
trend-analysis-platform/
├── docker-compose.yml          # Full stack setup
├── docker-compose.dev.yml      # Development setup
├── docker.env.example          # Environment template
├── start-docker.sh             # Startup script
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── requirements.txt        # Python dependencies
│   └── main.py                 # Main application file
└── frontend/
    └── Dockerfile              # Frontend container config
```

## 🔐 Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update base images
- Use secrets management for API keys

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure Docker Desktop is running
4. Check available disk space and memory
5. Try rebuilding containers: `docker-compose build --no-cache`

---

**Happy coding! 🚀**
