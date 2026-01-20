/**
 * Simple Redis-like server for development
 * This is a minimal implementation for testing purposes
 * For production, use a real Redis server
 */

const net = require('net');
const EventEmitter = require('events');

class SimpleRedis extends EventEmitter {
  constructor() {
    super();
    this.data = new Map();
    this.expiry = new Map();
    this.subscribers = new Map();
  }

  set(key, value, expirySeconds = null) {
    this.data.set(key, value);
    if (expirySeconds) {
      this.expiry.set(key, Date.now() + expirySeconds * 1000);
    } else {
      this.expiry.delete(key);
    }
    return 'OK';
  }

  get(key) {
    if (this.expiry.has(key)) {
      const expiryTime = this.expiry.get(key);
      if (Date.now() > expiryTime) {
        this.data.delete(key);
        this.expiry.delete(key);
        return null;
      }
    }
    return this.data.get(key) || null;
  }

  del(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.data.has(key)) {
        this.data.delete(key);
        this.expiry.delete(key);
        count++;
      }
    }
    return count;
  }

  exists(...keys) {
    let count = 0;
    for (const key of keys) {
      if (this.get(key) !== null) {
        count++;
      }
    }
    return count;
  }

  ping() {
    return 'PONG';
  }

  flushdb() {
    this.data.clear();
    this.expiry.clear();
    return 'OK';
  }

  dbsize() {
    return this.data.size;
  }

  keys(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.data.keys()).filter(key => regex.test(key));
  }

  incr(key) {
    const value = parseInt(this.get(key) || '0');
    const newValue = value + 1;
    this.set(key, newValue.toString());
    return newValue;
  }

  decr(key) {
    const value = parseInt(this.get(key) || '0');
    const newValue = value - 1;
    this.set(key, newValue.toString());
    return newValue;
  }

  expire(key, seconds) {
    if (this.data.has(key)) {
      this.expiry.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  ttl(key) {
    if (!this.data.has(key)) {
      return -2;
    }
    if (!this.expiry.has(key)) {
      return -1;
    }
    const expiryTime = this.expiry.get(key);
    const remaining = Math.floor((expiryTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  hset(key, field, value) {
    let hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      hash = {};
      this.data.set(key, hash);
    }
    hash[field] = value;
    return 1;
  }

  hget(key, field) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return null;
    }
    return hash[field] || null;
  }

  hgetall(key) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return {};
    }
    return hash;
  }

  hdel(key, ...fields) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return 0;
    }
    let count = 0;
    for (const field of fields) {
      if (hash[field] !== undefined) {
        delete hash[field];
        count++;
      }
    }
    return count;
  }

  hkeys(key) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return [];
    }
    return Object.keys(hash);
  }

  hvals(key) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return [];
    }
    return Object.values(hash);
  }

  hlen(key) {
    const hash = this.data.get(key);
    if (!hash || typeof hash !== 'object') {
      return 0;
    }
    return Object.keys(hash).length;
  }
}

const redis = new SimpleRedis();

function parseCommand(buffer) {
  const str = buffer.toString();
  const lines = str.split('\r\n').filter(line => line.length > 0);
  
  if (lines[0].startsWith('*')) {
    // RESP Array format
    const args = [];
    for (let i = 1; i < lines.length; i += 2) {
      if (lines[i].startsWith('$')) {
        args.push(lines[i + 1]);
      }
    }
    return args;
  } else {
    // Simple command format
    return str.trim().split(/\s+/);
  }
}

function formatResponse(value) {
  if (value === null) {
    return '$-1\r\n';
  } else if (typeof value === 'string') {
    return `$${value.length}\r\n${value}\r\n`;
  } else if (typeof value === 'number') {
    return `:${value}\r\n`;
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return '*0\r\n';
    }
    let response = `*${value.length}\r\n`;
    for (const item of value) {
      response += formatResponse(item);
    }
    return response;
  } else if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return '*0\r\n';
    }
    let response = `*${keys.length * 2}\r\n`;
    for (const key of keys) {
      response += `$${key.length}\r\n${key}\r\n`;
      response += formatResponse(value[key]);
    }
    return response;
  }
  return `$-1\r\n`;
}

const server = net.createServer((socket) => {
  console.log('Client connected');

  socket.on('data', (data) => {
    try {
      const args = parseCommand(data);
      const command = args[0].toUpperCase();
      const params = args.slice(1);

      console.log(`Command: ${command}`, params);

      let result;
      switch (command) {
        case 'PING':
          result = redis.ping();
          break;
        case 'SET':
          result = redis.set(params[0], params[1], params[2] ? parseInt(params[2]) : null);
          break;
        case 'GET':
          result = redis.get(params[0]);
          break;
        case 'DEL':
          result = redis.del(...params);
          break;
        case 'EXISTS':
          result = redis.exists(...params);
          break;
        case 'FLUSHDB':
          result = redis.flushdb();
          break;
        case 'DBSIZE':
          result = redis.dbsize();
          break;
        case 'KEYS':
          result = redis.keys(params[0] || '*');
          break;
        case 'INCR':
          result = redis.incr(params[0]);
          break;
        case 'DECR':
          result = redis.decr(params[0]);
          break;
        case 'EXPIRE':
          result = redis.expire(params[0], parseInt(params[1]));
          break;
        case 'TTL':
          result = redis.ttl(params[0]);
          break;
        case 'HSET':
          result = redis.hset(params[0], params[1], params[2]);
          break;
        case 'HGET':
          result = redis.hget(params[0], params[1]);
          break;
        case 'HGETALL':
          result = redis.hgetall(params[0]);
          break;
        case 'HDEL':
          result = redis.hdel(params[0], ...params.slice(1));
          break;
        case 'HKEYS':
          result = redis.hkeys(params[0]);
          break;
        case 'HVALS':
          result = redis.hvals(params[0]);
          break;
        case 'HLEN':
          result = redis.hlen(params[0]);
          break;
        case 'INFO':
          result = 'redis_version:6.0.0\r\nos:Windows\r\narch_bits:64';
          break;
        case 'AUTH':
          result = 'OK';
          break;
        default:
          result = null;
      }

      const response = formatResponse(result);
      socket.write(response);
    } catch (error) {
      console.error('Error:', error);
      socket.write('-ERR ' + error.message + '\r\n');
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = 6379;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple Redis server running on 127.0.0.1:${PORT}`);
  console.log('This is a minimal Redis implementation for development');
  console.log('For production, use a real Redis server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Redis server...');
  server.close(() => {
    console.log('Redis server closed');
    process.exit(0);
  });
});
