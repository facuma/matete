# Docker & PostgreSQL Setup Guide

## Prerequisites

Before starting, make sure you have installed:
- **Docker Desktop** (https://www.docker.com/products/docker-desktop/)
- **Docker Compose** (included with Docker Desktop)

## Quick Start

### 1. Build and Start Services

```bash
# Build and start both app and database
docker-compose up --build
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Run database migrations
- Seed the database with existing JSON data
- Start the application on http://localhost:3000

### 2. Stop Services

```bash
# Stop services (keeps data)
docker-compose down

# Stop services and remove volumes (deletes all data)
docker-compose down -v
```

## Development Workflow

### Local Development (without Docker)

If you want to develop locally without Docker:

```bash
# 1. Start only the database
docker-compose up db

# 2. In another terminal, run migrations
npm run prisma:migrate

# 3. Seed the database
npm run prisma:seed

# 4. Start development server
npm run dev
```

### Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Deploy migrations (production)
npm run prisma:deploy

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View app logs only
docker-compose logs app

# View database logs only
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f
```

## Database Connection

### From Docker Container
```
Host: db
Port: 5432
Database: matete_db
User: matete
Password: matete123
```

### From Local Machine
```
Host: localhost
Port: 5432
Database: matete_db
User: matete
Password: matete123
```

Connection String:
```
postgresql://matete:matete123@localhost:5432/matete_db
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5432 is already in use:

```bash
# Stop the conflicting service
# For the dev server:
# Press Ctrl+C in the terminal running npm run dev

# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5432
```

### Database Connection Failed

```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild from scratch
docker-compose up --build
```

## Production Deployment

For production, update the `docker-compose.yml`:

1. Change database password
2. Set `NODE_ENV=production`
3. Use environment variables for sensitive data
4. Configure proper volumes for data persistence

## Prisma Studio

To explore your database visually:

```bash
# If using Docker
docker-compose exec app npx prisma studio

# If running locally
npm run prisma:studio
```

Then open http://localhost:5555 in your browser.
