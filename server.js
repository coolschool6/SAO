// Simple static file server for SAO project
// Serves files from the current directory on http://localhost:5500

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5500;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.htm': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/octet-stream'
};

function sendError(res, code, message) {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end(`${code} ${http.STATUS_CODES[code] || ''}\n${message || ''}`);
}

function safeJoin(base, target) {
  const targetPath = '.' + path.normalize('/' + target);
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname || '/');

    // Default to index.html
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    // Prevent path traversal
    const filePath = safeJoin(ROOT, pathname);
    if (!filePath.startsWith(ROOT)) {
      return sendError(res, 403, 'Forbidden');
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return sendError(res, 404, `Not Found: ${pathname}`);
        }
        return sendError(res, 500, err.message);
      }

      if (stats.isDirectory()) {
        const indexPath = path.join(filePath, 'index.html');
        fs.readFile(indexPath, (err2, data) => {
          if (err2) return sendError(res, 404, 'Not Found');
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.end(data);
        });
        return;
      }

      fs.readFile(filePath, (readErr, data) => {
        if (readErr) return sendError(res, 500, readErr.message);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });
  } catch (e) {
    sendError(res, 500, e.message);
  }
});

server.listen(PORT, () => {
  console.log(`\nSAO static server running at http://localhost:${PORT}`);
  console.log(`Serving directory: ${ROOT}`);
});
