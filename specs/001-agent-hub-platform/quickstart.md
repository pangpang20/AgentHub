# AgentHub Platform - Developer Quickstart

**Feature**: AgentHub Platform
**Date**: 2025-01-18
**Purpose**: Quick start guide for developers working on the AgentHub platform

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** 20+ and npm
- **Python** 3.11+ (for some development tools)
- **Docker** and Docker Compose
- **Git**
- **PostgreSQL** client (optional, for direct database access)
- **Redis** client (optional, for direct cache access)

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coze-clone
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install shared dependencies
cd ../shared
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/agenthub"
REDIS_URL="redis://localhost:6379"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# LLM Providers
OPENAI_API_KEY="sk-your-openai-api-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Vector Database
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_ENVIRONMENT="your-pinecone-environment"
PINECONE_INDEX="agenthub-kb"

# Storage
S3_ACCESS_KEY_ID="your-s3-access-key"
S3_SECRET_ACCESS_KEY="your-s3-secret-key"
S3_BUCKET="agenthub-documents"
S3_REGION="us-east-1"

# Application
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:3001"

# WebSocket
WS_PORT=3002
WS_URL="ws://localhost:3002"
```

### 4. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and other services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5. Initialize Database

```bash
cd backend

# Run database migrations
npm run db:migrate

# Seed initial data (roles, templates, etc.)
npm run db:seed
```

### 6. Start Development Servers

```bash
# Terminal 1: Start backend API
cd backend
npm run dev

# Terminal 2: Start WebSocket server
cd backend
npm run ws:dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002
- API Documentation: http://localhost:3001/v1/docs

## Project Structure

```
coze-clone/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── models/      # Prisma models
│   │   ├── services/    # Business logic
│   │   ├── api/         # REST API endpoints
│   │   ├── websockets/  # WebSocket handlers
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utility functions
│   ├── prisma/
│   │   └── schema.prisma
│   └── tests/
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/         # App Router pages
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities
│   │   └── store/       # Zustand stores
│   └── tests/
└── shared/              # Shared code
    ├── types/           # TypeScript types
    └── constants/       # Constants
```

## Common Development Tasks

### Creating a New Agent

1. Navigate to the Agent Builder page
2. Fill in agent details:
   - Name: "Customer Support Bot"
   - Description: "Handles customer inquiries"
   - System Prompt: "You are a helpful customer support agent..."
3. Select LLM provider and model
4. Save the agent

### Adding a Plugin to an Agent

1. Open the Agent Builder
2. Navigate to the Plugins section
3. Browse the Plugin Marketplace
4. Select and configure the plugin
5. Save the agent configuration

### Uploading Documents to Knowledge Base

1. Open the Agent Builder
2. Navigate to the Knowledge Base section
3. Click "Upload Document"
4. Select a file (PDF, TXT, DOCX, MD)
5. Wait for processing to complete

### Having a Conversation

1. Navigate to the Conversations page
2. Click "New Conversation"
3. Select an agent
4. Start chatting with the agent

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:3001/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Create an Agent

```bash
curl -X POST http://localhost:3001/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Agent",
    "description": "A helpful AI assistant",
    "systemPrompt": "You are a helpful assistant.",
    "llmProvider": "openai",
    "llmModel": "gpt-4"
  }'
```

### Create a Conversation

```bash
curl -X POST http://localhost:3001/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "agentId": "AGENT_UUID"
  }'
```

### Send a Message

```bash
curl -X POST http://localhost:3001/v1/conversations/CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Hello, how are you?"
  }'
```

## WebSocket Usage Example

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3002/v1/ws/conversations/CONVERSATION_ID?token=YOUR_JWT_TOKEN');

// Handle incoming messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'connected':
      console.log('Connected to conversation');
      break;
    case 'message_stream':
      console.log('Agent response chunk:', message.data.chunk);
      break;
    case 'message_complete':
      console.log('Complete agent response:', message.data.content);
      break;
    case 'error':
      console.error('Error:', message.data.message);
      break;
  }
};

// Send a message
ws.send(JSON.stringify({
  type: 'message',
  data: {
    content: 'Hello, agent!',
    conversationId: 'CONVERSATION_ID'
  },
  timestamp: new Date().toISOString()
}));
```

## Testing

### Run Unit Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

### Run Integration Tests

```bash
# Backend integration tests
cd backend
npm run test:integration

# Frontend e2e tests
cd frontend
npm run test:e2e
```

### Run Tests with Coverage

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

## Database Management

### Create a Migration

```bash
cd backend
npx prisma migrate dev --name add_new_field
```

### Run Migrations

```bash
cd backend
npx prisma migrate deploy
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

### View Database in Prisma Studio

```bash
cd backend
npx prisma studio
```

## Debugging

### Backend Debugging

```bash
cd backend
npm run dev:debug
```

Then connect your debugger (VS Code, Chrome DevTools, etc.) to port 9229.

### Frontend Debugging

1. Open Chrome DevTools (F12)
2. Go to the "Sources" tab
3. Set breakpoints in your code
4. Refresh the page to trigger breakpoints

### View Logs

```bash
# Backend logs
cd backend
npm run dev

# Frontend logs (in browser console)
# Open Chrome DevTools (F12) and go to the "Console" tab
```

## Common Issues and Solutions

### Issue: Database Connection Failed

**Solution**:
1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL in `.env`
3. Verify database credentials

### Issue: Redis Connection Failed

**Solution**:
1. Ensure Redis is running: `docker-compose ps`
2. Check REDIS_URL in `.env`
3. Verify Redis is accessible: `redis-cli ping`

### Issue: LLM API Errors

**Solution**:
1. Verify API keys in `.env`
2. Check API key quotas and limits
3. Ensure network connectivity to LLM providers

### Issue: WebSocket Connection Failed

**Solution**:
1. Verify WebSocket server is running
2. Check JWT token is valid and not expired
3. Ensure correct WebSocket URL

### Issue: Frontend Build Errors

**Solution**:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Check for TypeScript errors: `npm run type-check`

## Performance Optimization

### Backend

- Enable query logging to identify slow queries
- Use database indexes for frequently queried fields
- Implement caching for expensive operations
- Use connection pooling for database connections

### Frontend

- Use code splitting for large components
- Implement lazy loading for images
- Optimize bundle size with tree shaking
- Use React.memo for expensive components

## Deployment

### Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Deploy to Production

```bash
# Deploy backend
cd backend
npm run deploy

# Deploy frontend
cd frontend
npm run deploy
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests: `npm run test`
4. Commit your changes
5. Push to your branch
6. Create a pull request

## Resources

- [API Documentation](http://localhost:3001/v1/docs)
- [WebSocket Protocol](./contracts/websocket-spec.md)
- [Data Model](./data-model.md)
- [Research Findings](./research.md)

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-org/agenthub/issues) page
2. Join our [Discord](https://discord.gg/agenthub) community
3. Email us at support@agenthub.com

## Next Steps

- Read the [Implementation Plan](./plan.md) for detailed technical decisions
- Review the [Feature Specification](./spec.md) for requirements
- Explore the [API Specification](./contracts/api-spec.json) for endpoint details
- Check out the [Data Model](./data-model.md) for database schema

Happy coding! 🚀
