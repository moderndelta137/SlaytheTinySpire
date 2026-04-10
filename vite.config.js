import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const signalingPlugin = () => {
  const rooms = new Map();

  const getRoomClients = (roomId) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    return rooms.get(roomId);
  };

  const sendJson = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify(payload));
  };

  return {
    name: 'local-signaling',
    configureServer(server) {
      server.middlewares.use('/__signal', (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        if (req.method === 'GET' && url.pathname === '/events') {
          const roomId = url.searchParams.get('roomId');
          const playerId = url.searchParams.get('playerId');
          if (!roomId || !playerId) {
            sendJson(res, 400, { error: 'roomId and playerId are required' });
            return;
          }

          const clients = getRoomClients(roomId);
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(`data: ${JSON.stringify({ type: 'signal_ready', roomId, playerId })}\n\n`);
          clients.set(playerId, res);

          req.on('close', () => {
            clients.delete(playerId);
            if (clients.size === 0) {
              rooms.delete(roomId);
            }
          });
          return;
        }

        if (req.method === 'POST' && url.pathname === '/message') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const roomId = payload.roomId;
              const senderId = payload.playerId;
              if (!roomId || !senderId) {
                sendJson(res, 400, { error: 'roomId and playerId are required' });
                return;
              }

              const clients = getRoomClients(roomId);
              for (const [clientId, clientRes] of clients.entries()) {
                if (clientId === senderId) continue;
                if (payload.targetPlayerId && payload.targetPlayerId !== clientId) continue;
                clientRes.write(`data: ${JSON.stringify(payload)}\n\n`);
              }
              sendJson(res, 200, { ok: true });
            } catch (error) {
              sendJson(res, 400, { error: 'invalid json' });
            }
          });
          return;
        }

        next();
      });
    }
  };
};

export default defineConfig({
  base: '/SlaytheTinySpire/',
  plugins: [react(), signalingPlugin()],
});
