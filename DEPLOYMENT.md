# FinLit Academy - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis 7+ installed and running
- Git installed

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd finlit-academy
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both frontend and backend due to the workspace configuration.

### 3. Set Up Environment Variables

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit [.env.local](frontend/.env.local) with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_PLAID_ENV=sandbox
NEXT_PUBLIC_PLAID_PUBLIC_KEY=your_plaid_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

#### Backend (.env)

```bash
cd ../backend
cp .env.example .env
```

Edit [.env](backend/.env) with your configuration:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost:5432/finlit_academy
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finlit_academy
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_URL=redis://localhost:6379

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret

ENABLE_AI_CHATBOT=true
```

### 4. Set Up Database

Create the PostgreSQL database:

```bash
createdb finlit_academy
```

Run migrations:

```bash
cd backend
npm run db:migrate
```

Seed initial data (optional):

```bash
npm run db:seed
```

### 5. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start both frontend and backend concurrently.

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql

## Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard

#### Deploy Backend to Railway

1. Create a Railway account at railway.app
2. Create new project
3. Add PostgreSQL and Redis services
4. Deploy from GitHub or CLI
5. Set environment variables in Railway dashboard

### Option 2: AWS (Full Stack)

#### Frontend (S3 + CloudFront)

```bash
cd frontend
npm run build
```

Upload the `out/` directory to S3 and configure CloudFront.

#### Backend (EC2 or ECS)

1. Create EC2 instance or ECS cluster
2. Install Node.js, PostgreSQL, Redis
3. Clone repository and set environment variables
4. Use PM2 for process management:

```bash
npm install -g pm2
cd backend
npm run build
pm2 start dist/index.js --name finlit-api
pm2 save
pm2 startup
```

### Option 3: Docker Deployment

Create Docker Compose configuration:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000/graphql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/finlit_academy
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=finlit_academy
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Deploy with:

```bash
docker-compose up -d
```

## Environment-Specific Configuration

### API Keys Required

1. **OpenAI API** (for AI chatbot)
   - Get at: https://platform.openai.com/api-keys
   - Cost: Pay-as-you-go

2. **Alpha Vantage** (for stock data)
   - Get at: https://www.alphavantage.co/support/#api-key
   - Free tier available

3. **Plaid** (optional, for bank integration)
   - Get at: https://dashboard.plaid.com/
   - Sandbox mode is free

### Database Migrations

After deployment, run migrations:

```bash
npm run db:migrate
```

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Set secure cookie flags
- [ ] Enable helmet.js security headers
- [ ] Set up database backups
- [ ] Configure Redis persistence
- [ ] Use environment variables for all secrets
- [ ] Enable logging and monitoring

## Monitoring & Maintenance

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Analytics**: Google Analytics, Mixpanel

### Backup Strategy

1. Database: Daily automated backups
2. Redis: Enable AOF persistence
3. User uploads: S3 versioning

### Performance Optimization

1. Enable Redis caching for stock quotes
2. Use CDN for static assets
3. Implement database query optimization
4. Enable Next.js image optimization
5. Use connection pooling for database

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check DATABASE_URL is correct
   - Verify PostgreSQL is running
   - Check firewall settings

2. **Redis connection fails**
   - Check REDIS_URL is correct
   - Verify Redis is running
   - Check network connectivity

3. **GraphQL queries fail**
   - Check backend is running
   - Verify CORS configuration
   - Check authentication tokens

4. **Stock data not loading**
   - Verify Alpha Vantage API key
   - Check API rate limits
   - Review Redis cache

## Support

For issues and questions:
- GitHub Issues: <repository-url>/issues
- Documentation: See README.md
