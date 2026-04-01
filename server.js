const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = 3000;
const db = new Database(path.join(__dirname, 'db', 'f1.db'));

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff'
};

// Generic API query helper
function sendJson(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function sendError(res, code, message) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}

function handleApi(res, query, params) {
  try {
    const stmt = db.prepare(query);
    const data = params ? stmt.all(params) : stmt.all();
    sendJson(res, data);
  } catch (err) {
    console.error('[DB Error]', err.message);
    sendError(res, 500, err.message);
  }
}

// Static file helper
function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        sendError(res, 404, 'File not found');
      } else {
        sendError(res, 500, err.message);
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// POST /subscribe handler
function handleSubscribe(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const params = new URLSearchParams(body);
      const name  = params.get('name')  || '';
      const email = params.get('email') || '';

      if (!email || !email.includes('@')) {
        return sendError(res, 400, 'Invalid email address');
      }

      const line = `${new Date().toISOString()},${name},${email}\n`;
      const filePath = path.join(__dirname, 'data', 'subscribers.txt');

      await fs.promises.appendFile(filePath, line, 'utf8');
      sendJson(res, { success: true, message: 'Subscribed successfully!' });
    } catch (err) {
      console.error('[Subscribe Error]', err.message);
      sendError(res, 500, err.message);
    }
  });
}

// HTTP Server
const server = http.createServer((req, res) => {
  const url  = req.url.split('?')[0]; // strip query string
  const method = req.method.toUpperCase();

  // --- API Routes ---
  if (method === 'GET' && url === '/api/cars') {
    return handleApi(res, 'SELECT * FROM cars ORDER BY year_start');
  }

  if (method === 'GET' && url === '/api/drivers') {
    return handleApi(res, 'SELECT * FROM drivers ORDER BY championships DESC, wins DESC');
  }

  if (method === 'GET' && url === '/api/winners') {
    return handleApi(res, 'SELECT * FROM race_winners ORDER BY year DESC');
  }

  if (method === 'GET' && url === '/api/regulations') {
    return handleApi(res, 'SELECT * FROM regulations ORDER BY scroll_order');
  }

  // --- POST Subscribe ---
  if (method === 'POST' && url === '/subscribe') {
    return handleSubscribe(req, res);
  }

  // --- Serve root index.html ---
  if (method === 'GET' && url === '/') {
    return serveStatic(res, path.join(__dirname, 'index.html'));
  }

  // --- Static: /views/* (AngularJS template partials) ---
  if (method === 'GET' && url.startsWith('/views/')) {
    const filePath = path.join(__dirname, url);
    // Guard against path traversal
    if (!filePath.startsWith(__dirname)) return sendError(res, 403, 'Forbidden');
    return serveStatic(res, filePath);
  }

  // --- Static: /public/* ---
  if (method === 'GET' && url.startsWith('/public/')) {
    const filePath = path.join(__dirname, url);
    if (!filePath.startsWith(__dirname)) return sendError(res, 403, 'Forbidden');
    return serveStatic(res, filePath);
  }

  // --- Static: /drivers-photo/* (local driver photos) ---
  if (method === 'GET' && url.startsWith('/drivers-photo/')) {
    const filename = decodeURIComponent(url.slice('/drivers-photo/'.length));
    const filePath = path.join(__dirname, 'drivers photo', filename);
    if (!filePath.startsWith(path.join(__dirname, 'drivers photo'))) return sendError(res, 403, 'Forbidden');
    return serveStatic(res, filePath);
  }

  // --- Static: /cars/* (local car photos) ---
  if (method === 'GET' && url.startsWith('/cars/')) {
    const filename = decodeURIComponent(url.slice('/cars/'.length));
    const filePath = path.join(__dirname, 'cars', filename);
    if (!filePath.startsWith(path.join(__dirname, 'cars'))) return sendError(res, 403, 'Forbidden');
    return serveStatic(res, filePath);
  }

  // --- SPA fallback: serve index.html for #!/ hash routes (browser never sends hash to server) ---
  if (method === 'GET') {
    return serveStatic(res, path.join(__dirname, 'index.html'));
  }

  // --- 404 ---
  sendError(res, 404, `Route not found: ${method} ${url}`);
});

server.listen(PORT, () => {
  console.log(`\n🏎️  F1 Educational Platform running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/drivers\n`);
});
