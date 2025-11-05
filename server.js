const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3000;
const crypto = require('crypto');

app.use(express.json({ limit: '1mb' }));

// Serve the Frontend folder as static site
const frontendPath = path.join(__dirname, 'Frontend');
app.use(express.static(frontendPath));

// Ensure data files exist (inscricoes/contatos/contratacoes) with empty arrays
function ensureDataFiles() {
  const files = ['inscricoes.json', 'contatos.json', 'contratacoes.json'];
  for (const f of files) {
    const p = path.join(frontendPath, f);
    try {
      if (!fs.existsSync(p)) {
        fs.writeFileSync(p, JSON.stringify([], null, 2), 'utf8');
        console.log(`Created missing data file: ${p}`);
      } else {
        // Validate JSON — if invalid, reinitialize to empty array to avoid runtime errors
        try {
          const raw = fs.readFileSync(p, 'utf8') || '';
          if (raw.trim() === '') {
            fs.writeFileSync(p, JSON.stringify([], null, 2), 'utf8');
            console.log(`Reinitialized empty data file: ${p}`);
          } else {
            JSON.parse(raw);
          }
        } catch (e) {
          fs.writeFileSync(p, JSON.stringify([], null, 2), 'utf8');
          console.warn(`Rewrote corrupted data file as empty array: ${p}`);
        }
      }
    } catch (err) {
      console.error('Error ensuring data file', p, err);
    }
  }
}

ensureDataFiles();

// GET /events.json is served statically by express.static if exists in Frontend

// API endpoint to update events.json (used by admin in the frontend)
app.post('/api/events', (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Expected an array of events' });
  }

  const filePath = path.join(frontendPath, 'events.json');
  fs.writeFile(filePath, JSON.stringify(events, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing events.json:', err);
      return res.status(500).json({ error: 'Failed to write events.json' });
    }
    console.log('events.json updated by admin via /api/events');
    return res.json({ ok: true });
  });
});

// Função para limpar dados sensíveis
function sanitizeData(data) {
  const { ip, ...cleanData } = data;
  return cleanData;
}

// Endpoint to receive inscrições (Seletiva)
app.post('/api/inscricao', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const data = req.body || {};
  // minimal validation
  if (!data.nome || !data.telefone) return res.status(400).json({ error: 'Missing required fields' });

  const filePath = path.join(frontendPath, 'inscricoes.json');
  const entry = sanitizeData({ ...data, receivedAt: Date.now() });

  fs.readFile(filePath, 'utf8', (err, content) => {
    let arr = [];
    if (!err && content) {
      try { arr = JSON.parse(content); } catch (e) { arr = []; }
    }
    arr.push(entry);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8', (werr) => {
      if (werr) { console.error('Failed to write inscricoes.json', werr); return res.status(500).json({ error: 'Failed to save' }); }
      console.log('New inscricao saved');
      return res.json({ ok: true });
    });
  });
});

// Endpoint to receive general contacts
app.post('/api/contato', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const data = sanitizeData(req.body || {});
  if (!data.nome || !data.email || !data.mensagem) return res.status(400).json({ error: 'Missing required fields' });

  const filePath = path.join(frontendPath, 'contatos.json');
  const entry = Object.assign({}, data, { receivedAt: Date.now(), ip });

  fs.readFile(filePath, 'utf8', (err, content) => {
    let arr = [];
    if (!err && content) {
      try { arr = JSON.parse(content); } catch (e) { arr = []; }
    }
    arr.push(entry);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8', (werr) => {
      if (werr) { console.error('Failed to write contatos.json', werr); return res.status(500).json({ error: 'Failed to save' }); }
      console.log('New contato saved');
      return res.json({ ok: true });
    });
  });
});

// Endpoint to receive contratação requests
app.post('/api/contratacao', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' });

  const data = req.body || {};
  if (!data.nomeContratante || !data.emailContratante || !data.telefoneContratante) return res.status(400).json({ error: 'Missing required fields' });

  const filePath = path.join(frontendPath, 'contratacoes.json');
  const entry = Object.assign({}, data, { receivedAt: Date.now(), ip });

  fs.readFile(filePath, 'utf8', (err, content) => {
    let arr = [];
    if (!err && content) {
      try { arr = JSON.parse(content); } catch (e) { arr = []; }
    }
    arr.push(entry);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8', (werr) => {
      if (werr) { console.error('Failed to write contratacoes.json', werr); return res.status(500).json({ error: 'Failed to save' }); }
      console.log('New contratacao saved');
      return res.json({ ok: true });
    });
  });
});

// Simple in-memory rate limiter per IP (basic protection)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 60; // max requests per window per IP
const rateMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  return entry.count <= RATE_LIMIT_MAX;
}

// Chat proxy endpoint that forces model: gpt-5-mini
app.post('/api/chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Expected messages array' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const payload = {
      model: 'gpt-5-mini',
      messages,
      max_tokens: 800
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('OpenAI error', data);
      return res.status(502).json({ error: 'Upstream error', details: data });
    }

    return res.json(data);
  } catch (err) {
    console.error('Chat proxy error', err);
    return res.status(500).json({ error: 'Chat proxy failed' });
  }
});

// Create HTTP server and attach WebSocket server to it so both share the same port
const server = http.createServer(app);

// Simple admin session store (in-memory). For production use a persistent store.
const adminSessions = new Map(); // token -> { created: Date }

// Ensure admin password is set — if not, generate a random one for this run and warn
if (!process.env.ADMIN_PASSWORD) {
  const gen = crypto.randomBytes(8).toString('hex');
  process.env.ADMIN_PASSWORD = gen;
  console.warn('WARNING: ADMIN_PASSWORD was not set. A temporary admin password has been generated for this run:');
  console.warn(`  ${gen}`);
  console.warn('Set the ADMIN_PASSWORD environment variable to a stable, strong password to avoid this behavior.');
}

// Clean up expired admin sessions periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, info] of adminSessions.entries()) {
    if (now - (info.created || 0) > 1000 * 60 * 60) { // 1 hour
      adminSessions.delete(token);
    }
  }
}, 1000 * 60 * 10);

function parseCookies(req) {
  const header = req.headers && req.headers.cookie;
  if (!header) return {};
  return header.split(';').map(c => c.trim()).reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req);
  const token = cookies['admin_token'];
  if (token && adminSessions.has(token)) return next();
  // redirect to login for HTML routes, or 401 for API
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  return res.redirect('/admin-login.html');
}

// Admin login endpoint (checks ADMIN_PASSWORD env var)
app.post('/admin/login', express.json(), (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!password || password !== adminPassword) return res.status(401).json({ error: 'Invalid password' });
  const token = crypto.randomBytes(24).toString('hex');
  adminSessions.set(token, { created: Date.now() });
  // set HttpOnly cookie for 1 hour
  res.setHeader('Set-Cookie', `admin_token=${token}; HttpOnly; Path=/; Max-Age=3600`);
  return res.json({ ok: true });
});

app.post('/admin/logout', (req, res) => {
  const cookies = parseCookies(req);
  const token = cookies['admin_token'];
  if (token) adminSessions.delete(token);
  res.setHeader('Set-Cookie', `admin_token=; HttpOnly; Path=/; Max-Age=0`);
  return res.json({ ok: true });
});

// Serve protected admin page route - will redirect to login when not authenticated
app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

// Protected API endpoints for admin to list stored submissions
app.get('/api/admin/inscricoes', requireAdmin, (req, res) => {
  const filePath = path.join(frontendPath, 'inscricoes.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.json([]);
    try { return res.json(JSON.parse(content)); } catch (e) { return res.json([]); }
  });
});

app.get('/api/admin/contatos', requireAdmin, (req, res) => {
  const filePath = path.join(frontendPath, 'contatos.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.json([]);
    try { return res.json(JSON.parse(content)); } catch (e) { return res.json([]); }
  });
});

app.get('/api/admin/contratacoes', requireAdmin, (req, res) => {
  const filePath = path.join(frontendPath, 'contratacoes.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.json([]);
    try { return res.json(JSON.parse(content)); } catch (e) { return res.json([]); }
  });
});

// Admin action: clear all contatos
app.post('/api/admin/contatos/clear', requireAdmin, (req, res) => {
  const filePath = path.join(frontendPath, 'contatos.json');
  fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf8', (err) => {
    if (err) { console.error('Failed to clear contatos.json', err); return res.status(500).json({ error: 'Failed to clear' }); }
    console.log('contatos.json cleared by admin');
    return res.json({ ok: true });
  });
});

// Admin action: delete a contratacao by index
app.post('/api/admin/contratacoes/delete', requireAdmin, (req, res) => {
  const idx = Number(req.body && req.body.index);
  if (Number.isNaN(idx)) return res.status(400).json({ error: 'Missing or invalid index' });
  const filePath = path.join(frontendPath, 'contratacoes.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    let arr = [];
    if (!err && content) {
      try { arr = JSON.parse(content); } catch (e) { arr = []; }
    }
    if (idx < 0 || idx >= arr.length) return res.status(400).json({ error: 'Index out of range' });
    const removed = arr.splice(idx, 1);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8', (werr) => {
      if (werr) { console.error('Failed to write contratacoes.json', werr); return res.status(500).json({ error: 'Failed to save' }); }
      console.log('Contratacao removed by admin', removed);
      return res.json({ ok: true });
    });
  });
});

// Admin action: delete an inscricao by index
app.post('/api/admin/inscricoes/delete', requireAdmin, (req, res) => {
  const idx = Number(req.body && req.body.index);
  if (Number.isNaN(idx)) return res.status(400).json({ error: 'Missing or invalid index' });
  const filePath = path.join(frontendPath, 'inscricoes.json');
  fs.readFile(filePath, 'utf8', (err, content) => {
    let arr = [];
    if (!err && content) {
      try { arr = JSON.parse(content); } catch (e) { arr = []; }
    }
    if (idx < 0 || idx >= arr.length) return res.status(400).json({ error: 'Index out of range' });
    const removed = arr.splice(idx, 1);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8', (werr) => {
      if (werr) { console.error('Failed to write inscricoes.json', werr); return res.status(500).json({ error: 'Failed to save' }); }
      console.log('Inscricao removed by admin', removed);
      return res.json({ ok: true });
    });
  });
});

// WebSocket server for real-time chat
const wss = new WebSocket.Server({ server });

function broadcastJSON(obj) {
  const s = JSON.stringify(obj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(s);
    }
  });
}

// Helper to call OpenAI (same behavior as /api/chat) and return assistant content
async function callOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const payload = { model: 'gpt-5-mini', messages, max_tokens: 800 };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('OpenAI error', data);
      return null;
    }
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return content || null;
  } catch (e) {
    console.error('callOpenAI error', e);
    return null;
  }
}

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  ws.on('message', async (raw) => {
    let msg = null;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    // Expect messages like: { type: 'chat', user: 'Nome', text: '...' }
    if (msg && msg.type === 'chat' && msg.text) {
      const payload = {
        type: 'chat',
        user: msg.user || 'Visitante',
        text: msg.text,
        ts: Date.now()
      };

      // Broadcast user message to everyone
      broadcastJSON(payload);

      // If OPENAI_API_KEY is configured, ask assistant and broadcast reply too
      if (process.env.OPENAI_API_KEY) {
        try {
          const assistantContent = await callOpenAI([{ role: 'user', content: msg.text }]);
          if (assistantContent) {
            broadcastJSON({ type: 'chat', user: 'Assistente', text: assistantContent, ts: Date.now(), role: 'assistant' });
          }
        } catch (e) {
          console.error('Error generating assistant reply:', e);
        }
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Dev server running: http://localhost:${PORT}`);
  console.log(`Serving static files from: ${frontendPath}`);
});
