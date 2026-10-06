const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const CITIES = {
  lucknow: {
    city: 'Lucknow',
    coordinates: [26.8467, 80.9462],
    networkHealth: '96.4%',
    activeAlerts: 3,
    qualityScore: 94.1,
    reservoirStatus: '81%',
    demand: '498 MLD',
    peak: 'May–June',
    growth: '+18.2%',
    supply: 520,
    districts: [
      { name: 'North feeder', load: '4.8 MLD', status: 'Stable', pressure: '92 PSI', demand: 4.8, coordinates: [26.891, 80.941] },
      { name: 'Central loop', load: '6.1 MLD', status: 'Watch', pressure: '88 PSI', demand: 6.1, coordinates: [26.857, 80.947] },
      { name: 'Industrial belt', load: '8.4 MLD', status: 'Alert', pressure: '76 PSI', demand: 8.4, coordinates: [26.824, 80.891] },
      { name: 'South storage', load: '5.6 MLD', status: 'Stable', pressure: '90 PSI', demand: 5.6, coordinates: [26.788, 80.929] },
    ],
    report: {
      forecastCoverage: '96.2%',
      waterSaved: '14.6 MLD',
      leakReduction: '11.4%',
      costEfficiency: '₹18.2L',
    },
  },
  kanpur: {
    city: 'Kanpur',
    coordinates: [26.4499, 80.3319],
    networkHealth: '91.2%',
    activeAlerts: 5,
    qualityScore: 90.8,
    reservoirStatus: '73%',
    demand: '612 MLD',
    peak: 'April–July',
    growth: '+12.4%',
    supply: 560,
    districts: [
      { name: 'East trunk', load: '7.2 MLD', status: 'Warning', pressure: '82 PSI', demand: 7.2, coordinates: [26.463, 80.365] },
      { name: 'Industrial corridor', load: '9.5 MLD', status: 'Alert', pressure: '71 PSI', demand: 9.5, coordinates: [26.431, 80.296] },
      { name: 'Old city', load: '6.8 MLD', status: 'Watch', pressure: '84 PSI', demand: 6.8, coordinates: [26.459, 80.321] },
      { name: 'North intake', load: '5.4 MLD', status: 'Stable', pressure: '91 PSI', demand: 5.4, coordinates: [26.492, 80.337] },
    ],
    report: {
      forecastCoverage: '92.8%',
      waterSaved: '12.9 MLD',
      leakReduction: '9.1%',
      costEfficiency: '₹15.7L',
    },
  },
  noida: {
    city: 'Noida',
    coordinates: [28.5355, 77.3910],
    networkHealth: '94.7%',
    activeAlerts: 4,
    qualityScore: 96.3,
    reservoirStatus: '86%',
    demand: '430 MLD',
    peak: 'June–August',
    growth: '+23.8%',
    supply: 490,
    districts: [
      { name: 'Sector 62', load: '4.9 MLD', status: 'Stable', pressure: '94 PSI', demand: 4.9, coordinates: [28.627, 77.372] },
      { name: 'Expressway', load: '5.7 MLD', status: 'Watch', pressure: '87 PSI', demand: 5.7, coordinates: [28.557, 77.367] },
      { name: 'Commercial ring', load: '7.1 MLD', status: 'Alert', pressure: '79 PSI', demand: 7.1, coordinates: [28.535, 77.392] },
      { name: 'Green belt', load: '3.8 MLD', status: 'Stable', pressure: '96 PSI', demand: 3.8, coordinates: [28.492, 77.414] },
    ],
    report: {
      forecastCoverage: '97.5%',
      waterSaved: '17.2 MLD',
      leakReduction: '13.1%',
      costEfficiency: '₹20.4L',
    },
  },
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function serveStaticFile(req, res, pathname) {
  const filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT' && pathname !== '/index.html') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(500);
      res.end('Server error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  });
}

function getCityPayload(cityKey) {
  return CITIES[cityKey] || CITIES.lucknow;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/insights') {
    const cityKey = url.searchParams.get('city') || 'lucknow';
    sendJson(res, 200, getCityPayload(cityKey));
    return;
  }

  if (url.pathname === '/api/report') {
    const cityKey = url.searchParams.get('city') || 'lucknow';
    sendJson(res, 200, {
      city: getCityPayload(cityKey),
      generatedAt: new Date().toISOString(),
    });
    return;
  }

  if (url.pathname === '/api/admin/login') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const username = String(payload.username || '').trim();
        const password = String(payload.password || '');
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
          sendJson(res, 503, { success: false, error: 'Admin login is not configured on this server' });
          return;
        }
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          sendJson(res, 200, {
            success: true,
            user: { name: 'Operations Manager', role: 'Water System Admin' },
          });
          return;
        }
        sendJson(res, 401, { success: false, error: 'Invalid username or password' });
      } catch (error) {
        sendJson(res, 400, { success: false, error: 'Bad request body' });
      }
    });
    return;
  }

  if (url.pathname === '/api/admin/health') {
    sendJson(res, 200, { ok: true, status: 'healthy' });
    return;
  }

  if (url.pathname === '/dashboard') {
    serveStaticFile(req, res, '/dashboard.html');
    return;
  }

  if (url.pathname === '/admin') {
    serveStaticFile(req, res, '/admin.html');
    return;
  }

  if (url.pathname === '/report') {
    serveStaticFile(req, res, '/report.html');
    return;
  }

  serveStaticFile(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`AquaForecast server running at http://localhost:${PORT}`);
});
