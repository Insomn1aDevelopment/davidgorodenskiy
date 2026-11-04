'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');

const gzip = promisify(zlib.gzip);
const root = __dirname;
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, 'data');
const dbFile = path.join(dataDir, 'site.db');
const legacyFeedbackFile = path.join(dataDir, 'feedback.json');
const maxBodyBytes = 10 * 1024;
const maxFeedbackLength = 1000;
const riddleCount = 3; // загадки с двумя версиями, за которые можно голосовать
const visitorPattern = /^[\w-]{8,64}$/;
const assets = new Map();
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'], ['.webp', 'image/webp'], ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'], ['.woff', 'font/woff'], ['.txt', 'text/plain; charset=utf-8'],
]);

let db;

function json(res, status, body) {
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(payload);
}

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) throw httpError('Request body is too large', 413);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw httpError('Request body must be valid JSON', 400);
  }
}

async function cacheAsset(filePath) {
  const existing = assets.get(filePath);
  if (existing) return existing;

  const pending = (async () => {
    const body = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const type = mimeTypes.get(extension) || 'application/octet-stream';
    const etag = `"${crypto.createHash('sha1').update(body).digest('base64url')}"`;
    const compressible = /^(text\/|application\/(javascript|json|xml))/.test(type) && body.length > 1024;
    const compressed = compressible ? await gzip(body, { level: 6 }) : null;
    const gzipEtag = compressed ? `"${crypto.createHash('sha1').update(compressed).digest('base64url')}"` : null;
    const asset = { body, compressed, type, etag, gzipEtag, modified: new Date((await fs.stat(filePath)).mtimeMs).toUTCString() };
    assets.set(filePath, asset);
    return asset;
  })();

  assets.set(filePath, pending);
  try {
    const asset = await pending;
    assets.set(filePath, asset);
    return asset;
  } catch (error) {
    assets.delete(filePath);
    throw error;
  }
}

function acceptsGzip(req) {
  return (req.headers['accept-encoding'] || '').split(',').some(token => {
    const [encoding, ...parameters] = token.trim().toLowerCase().split(';');
    if (encoding !== 'gzip') return false;
    const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
    return !quality || Number(quality.trim().slice(2)) > 0;
  });
}

function publicFilePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); }
  catch { throw httpError('Некорректный URL.', 400); }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  if (!relative || relative.startsWith('.') || relative.split(/[\\/]/).some(part => part.startsWith('.'))) return null;
  if (relative !== 'index.html' && !/^(img|css|js)\//.test(relative)) return null;

  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root + path.sep)) throw httpError('Доступ запрещён.', 403);
  return filePath;
}

async function serveStatic(req, res, pathname) {
  const filePath = publicFilePath(pathname);
  if (!filePath) return json(res, 404, { error: 'Not found' });

  let asset;
  try { asset = await cacheAsset(filePath); }
  catch { return json(res, 404, { error: 'Not found' }); }

  const useGzip = Boolean(asset.compressed && acceptsGzip(req));
  const etag = useGzip ? asset.gzipEtag : asset.etag;
  const validators = (req.headers['if-none-match'] || '').split(',').map(value => value.trim());
  if (validators.includes('*') || validators.includes(etag)) {
    res.writeHead(304, {
      ETag: etag,
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400',
      ...(asset.compressed ? { Vary: 'Accept-Encoding' } : {}),
    });
    return res.end();
  }

  const body = useGzip ? asset.compressed : asset.body;
  res.writeHead(200, {
    'Content-Type': asset.type,
    'Content-Length': body.length,
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400',
    ETag: etag,
    'Last-Modified': asset.modified,
    'X-Content-Type-Options': 'nosniff',
    ...(asset.compressed ? { Vary: 'Accept-Encoding' } : {}),
    ...(useGzip ? { 'Content-Encoding': 'gzip' } : {}),
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

function openDatabase() {
  db = new DatabaseSync(dbFile);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, message TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS candles (visitor TEXT PRIMARY KEY, lit_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS votes (
      visitor TEXT NOT NULL,
      riddle INTEGER NOT NULL CHECK (riddle BETWEEN 0 AND ${riddleCount - 1}),
      choice INTEGER NOT NULL CHECK (choice IN (0, 1)),
      voted_at TEXT NOT NULL,
      PRIMARY KEY (visitor, riddle)
    );
  `);
}

// Отзывы раньше хранились в data/feedback.json — переносим их в базу один раз, пока таблица пуста.
async function importLegacyFeedback() {
  if (db.prepare('SELECT COUNT(*) AS n FROM feedback').get().n > 0) return;
  let saved;
  try { saved = JSON.parse(await fs.readFile(legacyFeedbackFile, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') console.error('Не удалось прочитать старые отзывы:', error.message);
    return;
  }
  if (!Array.isArray(saved)) return;
  const insert = db.prepare('INSERT OR IGNORE INTO feedback (id, created_at, message) VALUES (?, ?, ?)');
  for (const f of saved) if (f && typeof f.message === 'string') insert.run(String(f.id || crypto.randomUUID()), String(f.createdAt || new Date().toISOString()), f.message);
}

function visitorFrom(value) {
  return typeof value === 'string' && visitorPattern.test(value) ? value : null;
}

function candleState(visitor) {
  return {
    count: db.prepare('SELECT COUNT(*) AS n FROM candles').get().n,
    mine: Boolean(visitor && db.prepare('SELECT 1 FROM candles WHERE visitor = ?').get(visitor)),
  };
}

function voteState(visitor) {
  const tally = Array.from({ length: riddleCount }, () => [0, 0]);
  for (const row of db.prepare('SELECT riddle, choice, COUNT(*) AS n FROM votes GROUP BY riddle, choice').all()) tally[row.riddle][row.choice] = row.n;
  const mine = Array(riddleCount).fill(null);
  if (visitor) for (const row of db.prepare('SELECT riddle, choice FROM votes WHERE visitor = ?').all(visitor)) mine[row.riddle] = row.choice;
  return { tally, mine };
}

async function handleFeedback(req, res) {
  const body = await readJson(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return json(res, 400, { error: 'Напишите отзыв перед отправкой.' });
  if ([...message].length > maxFeedbackLength) return json(res, 400, { error: 'Отзыв должен быть не длиннее 1000 символов.' });

  db.prepare('INSERT INTO feedback (id, created_at, message) VALUES (?, ?, ?)').run(crypto.randomUUID(), new Date().toISOString(), message);
  return json(res, 201, { ok: true, message: 'Спасибо за отзыв.' });
}

async function handleCandle(req, res) {
  const visitor = visitorFrom((await readJson(req)).visitor);
  if (!visitor) return json(res, 400, { error: 'Некорректный идентификатор посетителя.' });
  db.prepare('INSERT OR IGNORE INTO candles (visitor, lit_at) VALUES (?, ?)').run(visitor, new Date().toISOString());
  return json(res, 201, candleState(visitor));
}

async function handleVote(req, res) {
  const body = await readJson(req);
  const visitor = visitorFrom(body.visitor);
  if (!visitor) return json(res, 400, { error: 'Некорректный идентификатор посетителя.' });
  if (!Number.isInteger(body.riddle) || body.riddle < 0 || body.riddle >= riddleCount) return json(res, 400, { error: 'Некорректный номер загадки.' });
  if (body.choice !== 0 && body.choice !== 1) return json(res, 400, { error: 'Некорректная версия.' });
  db.prepare(`INSERT INTO votes (visitor, riddle, choice, voted_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (visitor, riddle) DO UPDATE SET choice = excluded.choice, voted_at = excluded.voted_at`)
    .run(visitor, body.riddle, body.choice, new Date().toISOString());
  return json(res, 201, voteState(visitor));
}

// Ошибки API превращаются в JSON-ответ; внутренние детали наружу не уходят.
const apiRoute = fn => async (req, res, url) => {
  try { return await fn(req, res, url); }
  catch (error) {
    if (!error.status) console.error('Ошибка API:', error);
    return json(res, error.status || 500, { error: error.status ? error.message : 'Не удалось сохранить данные.' });
  }
};

const routes = {
  'GET /api/health': (req, res) => json(res, 200, { status: 'ok' }),
  'POST /api/feedback': apiRoute(handleFeedback),
  'GET /api/candles': apiRoute((req, res, url) => json(res, 200, candleState(visitorFrom(url.searchParams.get('visitor'))))),
  'POST /api/candles': apiRoute(handleCandle),
  'GET /api/votes': apiRoute((req, res, url) => json(res, 200, voteState(visitorFrom(url.searchParams.get('visitor'))))),
  'POST /api/votes': apiRoute(handleVote),
};

async function handle(req, res) {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch { return json(res, 400, { error: 'Некорректный URL.' }); }

  const route = routes[`${req.method} ${url.pathname}`];
  if (route) return route(req, res, url);
  if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Not found' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Метод не поддерживается.' });
  return serveStatic(req, res, url.pathname);
}

async function start() {
  await fs.mkdir(dataDir, { recursive: true });
  openDatabase();
  await importLegacyFeedback();

  await cacheAsset(path.join(root, 'index.html'));
  const imageDir = path.join(root, 'img');
  for (const name of await fs.readdir(imageDir)) {
    const filePath = path.join(imageDir, name);
    if ((await fs.stat(filePath)).isFile()) await cacheAsset(filePath);
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch(error => {
      if (!res.headersSent) json(res, 500, { error: 'Внутренняя ошибка сервера.' });
      else res.destroy(error);
    });
  });
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 10000;
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => console.log(`Сайт доступен: http://localhost:${port}`));
}

start().catch(error => {
  console.error('Не удалось запустить сервер:', error);
  process.exitCode = 1;
});
