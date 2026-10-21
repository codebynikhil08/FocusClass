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

  return {
    name: 'local-store-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/info') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ip: getLocalIp(), port: 5173 }));
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
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                if (parsed && parsed.data) {
                  inMemoryData = parsed.data;
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }
        }
        next();
      });
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
