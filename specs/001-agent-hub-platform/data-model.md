# Data Model: AgentHub Platform

**Feature**: AgentHub Platform
**Date**: 2025-01-18
**Purpose**: Database schema and entity relationships

## Overview

This document defines the complete data model for the AgentHub platform, including all entities, relationships, and validation rules. The model is designed to support multi-tenant architecture, real-time conversations, knowledge base integration, and plugin extensibility.

## Entity-Relationship Diagram

```
User (1) ----< (N) Agent (1) ----< (N) Conversation (1) ----< (N) Message
  |                 |                  |
  |                 |                  +----> KnowledgeBase (1) ----< (N) Document
  |                 |
  |                 +----> AgentPlugin (N) ----> Plugin (1)
  |
  +----> UserRole (N) ----> Role (1)
```

## Entities

### User

Represents a platform user with authentication credentials and permissions.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `email` (String, unique, required): User email address
- `passwordHash` (String, required): Hashed password (bcrypt)
- `name` (String, required): User's display name
- `avatarUrl` (String, optional): Profile picture URL
- `isEmailVerified` (Boolean, default: false): Email verification status
- `createdAt` (DateTime, required): Account creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp
- `lastLoginAt` (DateTime, optional): Last login timestamp

**Relationships**:
- One-to-Many with Agent: User can create multiple agents
- Many-to-Many with Role: User can have multiple roles

**Validation Rules**:
- Email must be valid format
- Password must be at least 8 characters
- Name must be 1-100 characters

**Indexes**:
- Unique index on `email`
- Index on `createdAt` for sorting

---

### Role

Represents a set of permissions that can be assigned to users.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `name` (String, unique, required): Role name (e.g., "admin", "user", "viewer")
- `description` (String, optional): Role description
- `permissions` (Json, required): List of permissions (e.g., ["agents:create", "agents:delete"])
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- Many-to-Many with User: Role can be assigned to multiple users

**Validation Rules**:
- Name must be 1-50 characters
- Permissions must be valid permission strings

**Indexes**:
- Unique index on `name`

---

### UserRole

Junction table for User-Role many-to-many relationship.

**Fields**:
- `userId` (UUID, foreign key → User.id, required)
- `roleId` (UUID, foreign key → Role.id, required)
- `assignedAt` (DateTime, required): Assignment timestamp
- `assignedBy` (UUID, foreign key → User.id, optional): User who assigned this role

**Validation Rules**:
- Composite unique index on (userId, roleId)

---

### Agent

Represents an AI assistant with configuration including prompt, tools, and plugins.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `userId` (UUID, foreign key → User.id, required): Owner of the agent
- `name` (String, required): Agent name
- `description` (String, optional): Agent description
- `systemPrompt` (Text, required): System prompt for the agent
- `llmProvider` (String, required): LLM provider (openai, anthropic, google)
- `llmModel` (String, required): Model name (e.g., "gpt-4", "claude-3-opus")
- `llmTemperature` (Float, default: 0.7): Temperature for LLM (0-2)
- `llmMaxTokens` (Int, default: 4096): Maximum tokens per response
- `isPublic` (Boolean, default: false): Whether agent is publicly shareable
- `shareToken` (String, unique, optional): Token for sharing public agents
- `templateId` (UUID, foreign key → Template.id, optional): Template used to create this agent
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- Many-to-One with User: Agent belongs to one user
- One-to-Many with Conversation: Agent can have multiple conversations
- One-to-One with KnowledgeBase: Agent has one knowledge base
- Many-to-Many with Plugin: Agent can use multiple plugins
- Many-to-One with Template: Agent can be created from a template

**Validation Rules**:
- Name must be 1-100 characters
- System prompt must be 1-10000 characters
- Temperature must be between 0 and 2
- Max tokens must be between 1 and 128000

**Indexes**:
- Index on `userId`
- Unique index on `shareToken`
- Index on `isPublic` for fetching public agents
- Index on `createdAt` for sorting

---

### Conversation

Represents a chat session between a user and an agent.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `agentId` (UUID, foreign key → Agent.id, required): Agent in the conversation
- `userId` (UUID, foreign key → User.id, required): User in the conversation
- `title` (String, optional): Auto-generated or user-provided title
- `status` (String, required): Status (active, archived, deleted)
- `messageCount` (Int, default: 0): Number of messages in conversation
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- Many-to-One with Agent: Conversation belongs to one agent
- Many-to-One with User: Conversation belongs to one user
- One-to-Many with Message: Conversation has multiple messages

**Validation Rules**:
- Status must be one of: active, archived, deleted
- Title must be 1-200 characters (if provided)

**Indexes**:
- Composite index on (agentId, userId)
- Index on `userId` for fetching user's conversations
- Index on `status` for filtering
- Index on `updatedAt` for sorting

---

### Message

Represents a single message in a conversation.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `conversationId` (UUID, foreign key → Conversation.id, required): Conversation this message belongs to
- `role` (String, required): Role (user, assistant, system)
- `content` (Text, required): Message content
- `tokens` (Int, optional): Number of tokens in message
- `metadata` (Json, optional): Additional metadata (e.g., plugin used, latency)
- `createdAt` (DateTime, required): Creation timestamp

**Relationships**:
- Many-to-One with Conversation: Message belongs to one conversation

**Validation Rules**:
- Role must be one of: user, assistant, system
- Content must be 1-100000 characters

**Indexes**:
- Index on `conversationId`
- Index on `createdAt` for ordering

---

### KnowledgeBase

Represents a knowledge base for an agent containing uploaded documents.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `agentId` (UUID, foreign key → Agent.id, unique, required): Agent this knowledge base belongs to
- `documentCount` (Int, default: 0): Number of documents
- `totalChunks` (Int, default: 0): Total number of chunks across all documents
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- One-to-One with Agent: Knowledge base belongs to one agent
- One-to-Many with Document: Knowledge base contains multiple documents

**Validation Rules**:
- None

**Indexes**:
- Unique index on `agentId`

---

### Document

Represents a file uploaded to an agent's knowledge base.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `knowledgeBaseId` (UUID, foreign key → KnowledgeBase.id, required): Knowledge base this document belongs to
- `fileName` (String, required): Original file name
- `fileSize` (Int, required): File size in bytes
- `fileType` (String, required): File type (pdf, txt, docx, md)
- `storageUrl` (String, required): URL where file is stored
- `chunkCount` (Int, default: 0): Number of chunks after processing
- `status` (String, required): Processing status (pending, processing, completed, failed)
- `errorMessage` (String, optional): Error message if processing failed
- `createdAt` (DateTime, required): Upload timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- Many-to-One with KnowledgeBase: Document belongs to one knowledge base

**Validation Rules**:
- File size must be <= 10MB
- File type must be one of: pdf, txt, docx, md
- Status must be one of: pending, processing, completed, failed

**Indexes**:
- Index on `knowledgeBaseId`
- Index on `status` for filtering
- Index on `createdAt` for sorting

---

### Plugin

Represents an available plugin in the marketplace.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `name` (String, unique, required): Plugin name
- `version` (String, required): Plugin version (semantic versioning)
- `description` (String, required): Plugin description
- `author` (String, required): Plugin author
- `iconUrl` (String, optional): Plugin icon URL
- `capabilities` (Json, required): List of capabilities (e.g., ["web-search", "calculator"])
- `permissions` (Json, required): Required permissions (e.g., ["network", "external-api"])
- `manifestUrl` (String, required): URL to plugin manifest
- `codeUrl` (String, required): URL to plugin code
- `isOfficial` (Boolean, default: false): Whether this is an official plugin
- `isVerified` (Boolean, default: false): Whether this plugin is verified
- `downloadCount` (Int, default: 0): Number of downloads
- `rating` (Float, default: 0): Average rating (0-5)
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- One-to-Many with AgentPlugin: Plugin can be used by multiple agents

**Validation Rules**:
- Name must be 1-100 characters
- Version must follow semantic versioning
- Description must be 1-500 characters
- Rating must be between 0 and 5

**Indexes**:
- Unique index on (name, version)
- Index on `isOfficial` for filtering
- Index on `downloadCount` for sorting

---

### AgentPlugin

Junction table for Agent-Plugin many-to-many relationship with configuration.

**Fields**:
- `agentId` (UUID, foreign key → Agent.id, required): Agent using this plugin
- `pluginId` (UUID, foreign key → Plugin.id, required): Plugin being used
- `config` (Json, optional): Plugin-specific configuration
- `isEnabled` (Boolean, default: true): Whether plugin is enabled
- `installedAt` (DateTime, required): Installation timestamp

**Validation Rules**:
- Composite unique index on (agentId, pluginId)

---

### Template

Represents a pre-configured agent template.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `name` (String, unique, required): Template name
- `description` (String, required): Template description
- `category` (String, required): Template category (e.g., "productivity", "education", "business")
- `iconUrl` (String, optional): Template icon URL
- `systemPrompt` (Text, required): Pre-configured system prompt
- `llmProvider` (String, required): Recommended LLM provider
- `llmModel` (String, required): Recommended model
- `defaultPlugins` (Json, optional): List of default plugin IDs
- `useCount` (Int, default: 0): Number of times this template has been used
- `isFeatured` (Boolean, default: false): Whether this template is featured
- `createdAt` (DateTime, required): Creation timestamp
- `updatedAt` (DateTime, required): Last update timestamp

**Relationships**:
- One-to-Many with Agent: Template can be used to create multiple agents

**Validation Rules**:
- Name must be 1-100 characters
- Description must be 1-500 characters
- Category must be 1-50 characters

**Indexes**:
- Unique index on `name`
- Index on `category` for filtering
- Index on `isFeatured` for featured templates

---

### AuditLog

Represents an audit log entry for compliance and security.

**Fields**:
- `id` (UUID, primary key): Unique identifier
- `userId` (UUID, foreign key → User.id, optional): User who performed the action
- `action` (String, required): Action performed (e.g., "agent:create", "user:login")
- `resourceType` (String, required): Type of resource (agent, user, document, etc.)
- `resourceId` (String, optional): ID of the resource
- `ipAddress` (String, optional): IP address of the request
- `userAgent` (String, optional): User agent string
- `metadata` (Json, optional): Additional metadata
- `timestamp` (DateTime, required): Action timestamp

**Relationships**:
- Many-to-One with User: Audit log entry may be associated with a user

**Validation Rules**:
- Action must be a valid action string
- Resource type must be a valid resource type

**Indexes**:
- Index on `userId`
- Index on `action`
- Index on `resourceType` and `resourceId`
- Index on `timestamp` for time-based queries

---

## Data Retention Policy

- **Messages**: Retain for 30 days, then archive
- **Conversations**: Retain for 90 days, then soft delete
- **Documents**: Retain indefinitely unless user deletes
- **Audit Logs**: Retain for 1 year for compliance
- **Plugin Usage Logs**: Retain for 90 days

## Migration Strategy

1. **Initial Migration**: Create all tables with indexes
2. **Seed Data**: Insert default roles (admin, user, viewer) and templates
3. **Future Migrations**: Use Prisma migration system for schema changes
4. **Backward Compatibility**: Maintain backward compatibility for at least 2 major versions

## Performance Considerations

- Use connection pooling (Prisma default)
- Implement read replicas for scaling read operations
- Cache frequently accessed data (Redis)
- Use database indexing for common query patterns
- Implement soft deletes for data recovery

## Security Considerations

- All sensitive fields (passwords, API keys) must be encrypted
- Use parameterized queries to prevent SQL injection
- Implement row-level security for multi-tenancy
- Regular backups with point-in-time recovery
- Audit logging for all data access

## Next Steps

1. Generate Prisma schema from this data model
2. Create database migrations
3. Implement repository pattern for data access
4. Add data validation at application layer
5. Create API contracts based on this model
