# AgentHub API Documentation

## Overview

AgentHub provides a RESTful API for managing AI agents, conversations, knowledge bases, plugins, and templates.

## Base URL

```
http://localhost:3001/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "isEmailVerified": true,
    "createdAt": "2025-01-18T00:00:00.000Z"
  },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Agents

#### List Agents
```http
GET /agents?page=1&limit=20&search=query
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "My Agent",
      "description": "A helpful AI assistant",
      "systemPrompt": "You are a helpful AI assistant...",
      "llmProvider": "openai",
      "llmModel": "gpt-4",
      "llmTemperature": 0.7,
      "llmMaxTokens": 4096,
      "isPublic": false,
      "createdAt": "2025-01-18T00:00:00.000Z",
      "updatedAt": "2025-01-18T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### Create Agent
```http
POST /agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Agent",
  "description": "A helpful AI assistant",
  "systemPrompt": "You are a helpful AI assistant...",
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "llmTemperature": 0.7,
  "llmMaxTokens": 4096
}
```

#### Get Agent
```http
GET /agents/:id
Authorization: Bearer <token>
```

#### Update Agent
```http
PUT /agents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Agent Name",
  "description": "Updated description"
}
```

#### Delete Agent
```http
DELETE /agents/:id
Authorization: Bearer <token>
```

**Response (204)**

### Conversations

#### List Conversations
```http
GET /conversations?page=1&limit=20&agentId=uuid
Authorization: Bearer <token>
```

#### Get Messages
```http
GET /conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### Create Conversation
```http
POST /conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "agentId": "uuid",
  "title": "My Conversation"
}
```

#### Send Message
```http
POST /conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?"
}
```

**Response (201):**
```json
{
  "userMessage": {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "user",
    "content": "Hello, how are you?",
    "createdAt": "2025-01-18T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "assistant",
    "content": "I'm doing well, thank you!",
    "createdAt": "2025-01-18T00:00:00.000Z"
  }
}
```

#### Delete Conversation
```http
DELETE /conversations/:id
Authorization: Bearer <token>
```

**Response (204)**

### Knowledge Base

#### List Knowledge Bases
```http
GET /knowledge-base?page=1&limit=20&agentId=uuid
Authorization: Bearer <token>
```

#### List Documents
```http
GET /knowledge-base/:kbId/documents?page=1&limit=20
Authorization: Bearer <token>
```

#### Upload Document
```http
POST /knowledge-base/:kbId/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Document Title",
  "content": "Document content..."
}
```

#### Delete Document
```http
DELETE /knowledge-base/:kbId/documents/:documentId
Authorization: Bearer <token>
```

**Response (204)**

#### Search Knowledge Base
```http
POST /knowledge-base/:kbId/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "search query"
}
```

### Plugins

#### List Marketplace
```http
GET /plugins/marketplace?page=1&limit=20&category=utility&search=search
Authorization: Bearer <token>
```

#### List Installed Plugins
```http
GET /plugins?agentId=uuid
Authorization: Bearer <token>
```

#### Install Plugin
```http
POST /plugins
Authorization: Bearer <token>
Content-Type: application/json

{
  "agentId": "uuid",
  "pluginId": "uuid",
  "config": {}
}
```

#### Update Plugin
```http
PUT /plugins/:agentPluginId
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": {},
  "enabled": true
}
```

#### Uninstall Plugin
```http
DELETE /plugins/:agentPluginId
Authorization: Bearer <token>
```

**Response (204)**

#### Execute Plugin
```http
POST /plugins/:agentPluginId/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "input": {}
}
```

### Templates

#### List Templates
```http
GET /templates?page=1&limit=20&category=utility&search=search
Authorization: Bearer <token>
```

#### Get Template
```http
GET /templates/:id
Authorization: Bearer <token>
```

#### Create Agent from Template
```http
POST /templates/:id/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Agent",
  "description": "Description"
}
```

#### Create Template (Admin)
```http
POST /templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Template Name",
  "description": "Template description",
  "systemPrompt": "System prompt...",
  "llmProvider": "openai",
  "llmModel": "gpt-4",
  "category": "utility",
  "iconUrl": "https://example.com/icon.png"
}
```

#### Update Template (Admin)
```http
PUT /templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Template (Admin)
```http
DELETE /templates/:id
Authorization: Bearer <token>
```

**Response (204)**

### Users

#### List Users (Admin)
```http
GET /users?page=1&limit=20&search=search
Authorization: Bearer <token>
```

#### Get User
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "avatarUrl": "https://example.com/avatar.png"
}
```

#### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Response (204)**

#### Get User's Agents
```http
GET /users/:id/agents
Authorization: Bearer <token>
```

#### Get User's Conversations
```http
GET /users/:id/conversations
Authorization: Bearer <token>
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `MISSING_FIELDS`: Required fields are missing
- `INVALID_CREDENTIALS`: Invalid username or password
- `USER_EXISTS`: User already exists
- `USER_NOT_FOUND`: User not found
- `AGENT_NOT_FOUND`: Agent not found
- `CONVERSATION_NOT_FOUND`: Conversation not found
- `KB_NOT_FOUND`: Knowledge base not found
- `PLUGIN_NOT_FOUND`: Plugin not found
- `TEMPLATE_NOT_FOUND`: Template not found
- `FORBIDDEN`: Insufficient permissions
- `UNAUTHORIZED`: Invalid or missing token
- `INVALID_TOKEN`: Invalid or expired token
- `TOKEN_EXPIRED`: Token has expired
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate-limited:
- 100 requests per minute per IP address
- 1000 requests per hour per user

## Pagination

All list endpoints support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## WebSocket

Real-time communication is available via WebSocket:

```
ws://localhost:3002
```

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3002?token=<jwt-token>');
```

### Events

#### Client → Server

**Send Message**
```json
{
  "event": "message",
  "data": {
    "conversationId": "uuid",
    "content": "Hello"
  }
}
```

#### Server → Client

**Message Received**
```json
{
  "event": "message",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "assistant",
    "content": "Response",
    "createdAt": "2025-01-18T00:00:00.000Z"
  }
}
```

**Message Streaming**
```json
{
  "event": "message_chunk",
  "data": {
    "conversationId": "uuid",
    "chunk": "Partial response",
    "isComplete": false
  }
}
```

**Typing Indicator**
```json
{
  "event": "typing",
  "data": {
    "conversationId": "uuid",
    "isTyping": true
  }
}
```

## SDKs

### JavaScript/TypeScript

```typescript
import { AgentHubClient } from '@agenthub/sdk';

const client = new AgentHubClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3001/v1'
});

// Create agent
const agent = await client.agents.create({
  name: 'My Agent',
  systemPrompt: 'You are helpful...'
});

// Send message
const response = await client.conversations.sendMessage(conversationId, {
  content: 'Hello'
});
```

### Python

```python
from agenthub import AgentHubClient

client = AgentHubClient(
    api_key='your-api-key',
    base_url='http://localhost:3001/v1'
)

# Create agent
agent = client.agents.create(
    name='My Agent',
    system_prompt='You are helpful...'
)

# Send message
response = client.conversations.send_message(
    conversation_id,
    content='Hello'
)
```

## Support

For support, please contact:
- Email: support@agenthub.com
- GitHub: https://github.com/agenthub/platform
- Discord: https://discord.gg/agenthub
