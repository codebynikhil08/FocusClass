import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

function getLocalIp(): string {
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

function localStoreApiPlugin(): Plugin {
  let inMemoryData: any = null;
  const sseClients = new Set<any>();

  const handler = (req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = req.url?.split('?')[0];

    if (url === '/api/info') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ip: getLocalIp(), port: 5173 }));
      return;
    }

    if (url === '/api/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });
      res.write(`data: ${JSON.stringify({ timestamp: Date.now(), data: inMemoryData })}\n\n`);
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    if (url === '/api/store') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ data: inMemoryData }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed && parsed.data) {
              inMemoryData = parsed.data;
              const payload = `data: ${JSON.stringify({ timestamp: Date.now(), data: inMemoryData })}\n\n`;
              for (const client of sseClients) {
                try {
                  client.write(payload);
                } catch {
                  sseClients.delete(client);
                }
              }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
    }
    next();
  };

  return {
    name: 'local-store-api-plugin',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), localStoreApiPlugin()],
  server: {
    host: true, // Listen on all local IP addresses so mobile phones can connect
    port: 5173,
    allowedHosts: true, // Allow all hostnames and public tunnels
  },
});
