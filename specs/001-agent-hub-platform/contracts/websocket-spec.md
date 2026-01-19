# WebSocket Protocol Specification

**Feature**: AgentHub Platform
**Date**: 2025-01-18
**Purpose**: Define WebSocket protocol for real-time agent conversations

## Overview

This document specifies the WebSocket protocol used for real-time agent conversations in the AgentHub platform. The protocol enables bidirectional communication between clients and the server for streaming agent responses and live conversation updates.

## Connection

### Endpoint

```
wss://api.agenthub.com/v1/ws/conversations/{conversationId}
```

### Authentication

WebSocket connections must be authenticated via JWT token in the query string:

```
wss://api.agenthub.com/v1/ws/conversations/{conversationId}?token={jwtToken}
```

### Connection Flow

1. Client connects to the WebSocket endpoint with valid JWT token
2. Server validates token and authenticates the connection
3. Server sends `connected` event to confirm successful connection
4. Client can now send messages and receive streaming responses

### Reconnection Strategy

- Client should implement exponential backoff for reconnection
- Initial reconnection attempt: 1 second
- Maximum reconnection delay: 30 seconds
- Maximum reconnection attempts: 5
- After successful reconnection, client should rejoin the conversation room

## Message Format

All WebSocket messages follow this JSON structure:

```typescript
{
  "type": string,      // Event type (required)
  "data": object,      // Event data (required)
  "timestamp": string, // ISO 8601 timestamp (required)
  "id": string        // Unique message ID (optional)
}
```

## Client to Server Events

### `message`

Send a message to the agent.

**Request**:
```json
{
  "type": "message",
  "data": {
    "content": "What is the capital of France?",
    "conversationId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z",
  "id": "msg-123"
}
```

**Response**: Server will stream `message_stream` events with the agent's response.

### `typing`

Indicate that the user is typing.

**Request**:
```json
{
  "type": "typing",
  "data": {
    "isTyping": true,
    "conversationId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

### `pause_generation`

Pause the current agent response generation.

**Request**:
```json
{
  "type": "pause_generation",
  "data": {
    "conversationId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response**: Server will send `generation_paused` event.

### `resume_generation`

Resume a paused agent response generation.

**Request**:
```json
{
  "type": "resume_generation",
  "data": {
    "conversationId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response**: Server will resume streaming `message_stream` events.

### `regenerate`

Regenerate the last assistant message.

**Request**:
```json
{
  "type": "regenerate",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response**: Server will stream `message_stream` events with the new response.

### `ping`

Heartbeat to keep connection alive.

**Request**:
```json
{
  "type": "ping",
  "data": {},
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response**: Server will respond with `pong` event.

### `disconnect`

Gracefully close the connection.

**Request**:
```json
{
  "type": "disconnect",
  "data": {
    "reason": "user_logout"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response**: Server will close the connection with `disconnected` event.

## Server to Client Events

### `connected`

Sent when the connection is successfully established.

**Event**:
```json
{
  "type": "connected",
  "data": {
    "conversationId": "uuid",
    "userId": "uuid",
    "agentId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

### `message_stream`

Streamed chunks of the agent's response.

**Event**:
```json
{
  "type": "message_stream",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "chunk": "The capital of France",
    "isComplete": false,
    "metadata": {
      "plugin": null,
      "latency": 1523
    }
  },
  "timestamp": "2025-01-18T10:30:01Z"
}
```

**Note**: Multiple `message_stream` events will be sent for a single response. The client should concatenate the `chunk` values to build the complete message. When `isComplete` is `true`, the message is fully delivered.

### `message_complete`

Sent when the complete message has been delivered.

**Event**:
```json
{
  "type": "message_complete",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "content": "The capital of France is Paris.",
    "tokens": 15,
    "metadata": {
      "plugin": null,
      "latency": 1523,
      "model": "gpt-4",
      "temperature": 0.7
    }
  },
  "timestamp": "2025-01-18T10:30:02Z"
}
```

### `typing`

Indicate that the agent is generating a response.

**Event**:
```json
{
  "type": "typing",
  "data": {
    "conversationId": "uuid",
    "isTyping": true
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

### `generation_paused`

Sent when generation is successfully paused.

**Event**:
```json
{
  "type": "generation_paused",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:05Z"
}
```

### `generation_resumed`

Sent when generation is successfully resumed.

**Event**:
```json
{
  "type": "generation_resumed",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid"
  },
  "timestamp": "2025-01-18T10:30:06Z"
}
```

### `error`

Sent when an error occurs.

**Event**:
```json
{
  "type": "error",
  "data": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Error Codes**:
- `AUTHENTICATION_FAILED`: Invalid or expired token
- `AUTHORIZATION_FAILED`: User does not have access to this conversation
- `CONVERSATION_NOT_FOUND`: Conversation does not exist
- `AGENT_NOT_FOUND`: Agent does not exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `LLM_ERROR`: Error communicating with LLM provider
- `PLUGIN_ERROR`: Error executing plugin

### `pong`

Response to client `ping` event.

**Event**:
```json
{
  "type": "pong",
  "data": {},
  "timestamp": "2025-01-18T10:30:00Z"
}
```

### `disconnected`

Sent when the connection is closed.

**Event**:
```json
{
  "type": "disconnected",
  "data": {
    "reason": "server_shutdown",
    "code": 1000
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Reason Codes**:
- `user_logout`: User logged out
- `server_shutdown`: Server is shutting down
- `timeout`: Connection timeout
- `error`: Connection error
- `token_expired`: Authentication token expired

### `conversation_updated`

Sent when conversation metadata is updated (e.g., title change).

**Event**:
```json
{
  "type": "conversation_updated",
  "data": {
    "conversationId": "uuid",
    "title": "New Conversation Title",
    "updatedAt": "2025-01-18T10:30:00Z"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

## Error Handling

### Connection Errors

If the WebSocket connection fails to establish, the client should:
1. Display an appropriate error message to the user
2. Attempt to reconnect with exponential backoff
3. Fall back to HTTP polling if WebSocket continues to fail

### Message Errors

If the server sends an `error` event, the client should:
1. Parse the error code and message
2. Display a user-friendly error message
3. Implement retry logic for transient errors
4. Redirect to login page for authentication errors

### Rate Limiting

The server may enforce rate limits on WebSocket connections:
- Maximum 10 messages per minute per conversation
- Maximum 5 concurrent connections per user
- Connection will be closed if limits are exceeded

## Security

### Authentication

- All WebSocket connections must be authenticated with a valid JWT token
- Tokens are validated on connection establishment
- Tokens expire after 1 hour; client must refresh and reconnect
- Invalid tokens result in immediate connection termination

### Authorization

- Users can only access conversations they have created or have been granted access to
- Server validates ownership on every message
- Cross-conversation access is prevented

### Data Privacy

- All messages are encrypted in transit (TLS)
- Message content is logged for audit purposes
- Sensitive information should be redacted in logs

## Performance Considerations

### Message Streaming

- Agent responses are streamed in chunks of ~100 tokens
- Client should buffer chunks and update UI incrementally
- Streaming reduces perceived latency

### Connection Management

- Server maintains connection state in Redis for horizontal scaling
- Idle connections are closed after 30 minutes of inactivity
- Client should send `ping` every 5 minutes to keep connection alive

### Load Balancing

- WebSocket connections are distributed across multiple servers
- Redis pub/sub is used for message broadcasting
- Sticky sessions are not required

## Client Implementation Guidelines

### JavaScript/TypeScript Example

```typescript
class AgentHubWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(
    private conversationId: string,
    private token: string,
    private onMessage: (data: any) => void,
    private onError: (error: any) => void
  ) {}

  connect() {
    const url = `wss://api.agenthub.com/v1/ws/conversations/${this.conversationId}?token=${this.token}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError(error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.attemptReconnect();
    };
  }

  handleMessage(message: any) {
    switch (message.type) {
      case 'connected':
        console.log('Connection confirmed:', message.data);
        break;
      case 'message_stream':
        this.onMessage(message);
        break;
      case 'message_complete':
        this.onMessage(message);
        break;
      case 'error':
        this.onError(message);
        break;
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  sendMessage(content: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message = {
      type: 'message',
      data: {
        content,
        conversationId: this.conversationId
      },
      timestamp: new Date().toISOString(),
      id: `msg-${Date.now()}`
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      const message = {
        type: 'disconnect',
        data: { reason: 'user_logout' },
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(message));
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }
}
```

## Testing

### Unit Tests

- Test message serialization/deserialization
- Test error handling
- Test reconnection logic

### Integration Tests

- Test connection establishment
- Test message streaming
- Test error scenarios
- Test rate limiting

### Load Tests

- Test with 1000 concurrent connections
- Test message throughput
- Test memory usage

## Versioning

The WebSocket protocol version is `1.0.0`. Breaking changes will increment the major version. Clients should be prepared to handle multiple protocol versions.

## Changelog

### Version 1.0.0 (2025-01-18)
- Initial version
- Basic message streaming
- Typing indicators
- Pause/resume generation
- Error handling
