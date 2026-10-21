import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, 'dist');
const CACHE_FILE = path.join(__dirname, '.store_cache.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

// Seed initial schema
const initialData = {
  users: {
    'teacher-1': {
      uid: 'teacher-1',
      name: 'Prof. Anita Sharma',
      email: 'teacher@focusclass.edu',
      role: 'teacher',
      createdAt: new Date().toISOString(),
    }
  },
  sessions: {},
  participants: {},
  events: [],
  reports: {}
};

// Load cache if available
let inMemoryStore = initialData;
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    inMemoryStore = JSON.parse(raw);
  }
} catch (e) {
  inMemoryStore = initialData;
}

function persistStore() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(inMemoryStore, null, 2));
  } catch (e) {
    // ignore
  }
}

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Connected SSE clients for instant push
const sseClients = new Set();

function broadcastStore() {
  const payload = `data: ${JSON.stringify({ timestamp: Date.now(), data: inMemoryStore })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

const server = http.createServer((req, res) => {
  // Enable CORS for all devices on network
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // API: Local network & server info
  if (pathname === '/api/info') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ip: getLocalIp(), port: Number(PORT) }));
    return;
  }

  // API: Real-Time SSE Stream
  if (pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`data: ${JSON.stringify({ timestamp: Date.now(), data: inMemoryStore })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // API: Store GET & POST
  if (pathname === '/api/store') {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ data: inMemoryStore }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && parsed.data) {
            inMemoryStore = parsed.data;
            persistStore();
            broadcastStore();
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
        } catch (err) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // Serve static assets from dist/
  let filePath = path.join(DIST_DIR, pathname);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      // Cache assets with hash
      if (pathname.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } else {
      // SPA Fallback: serve dist/index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, content) => {
        if (indexErr) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('FocusClass static assets not built yet. Run `npm run build` first.');
        } else {
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(content);
        }
      });
    }
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`\n=================================================`);
  console.log(`🚀 FocusClass Universal Multi-Device Server Active`);
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`📱 Mobile:  http://${localIp}:${PORT} (same Wi-Fi)`);
  console.log(`🌐 Public:  Deployable directly to Render / Cloud`);
  console.log(`=================================================\n`);
});
