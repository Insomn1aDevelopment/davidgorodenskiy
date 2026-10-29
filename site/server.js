'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { promisify } = require('node:util');

const gzip = promisify(zlib.gzip);
const root = __dirname;
const dataDir = path.join(root, 'data');
const feedbackFile = path.join(dataDir, 'feedback.json');
const maxBodyBytes = 10 * 1024;
const maxFeedbackLength = 1000;
const assets = new Map();
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'], ['.webp', 'image/webp'], ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'], ['.woff', 'font/woff'], ['.txt', 'text/plain; charset=utf-8'],
]);

let feedback = [];
let feedbackWriteQueue = Promise.resolve();

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

async function persistFeedback(entry) {
  const operation = feedbackWriteQueue.then(async () => {
    const next = [...feedback, entry];
    const tempFile = `${feedbackFile}.${process.pid}.tmp`;
    await fs.writeFile(tempFile, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, feedbackFile);
    feedback = next;
  });
  feedbackWriteQueue = operation.catch(() => {});
  return operation;
}

async function handleFeedback(req, res) {
  try {
    const body = await readJson(req);
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return json(res, 400, { error: 'Напишите отзыв перед отправкой.' });
    if ([...message].length > maxFeedbackLength) return json(res, 400, { error: 'Отзыв должен быть не длиннее 1000 символов.' });

    await persistFeedback({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), message });
    return json(res, 201, { ok: true, message: 'Спасибо за отзыв.' });
  } catch (error) {
    return json(res, error.status || 500, { error: error.status ? error.message : 'Не удалось сохранить отзыв.' });
  }
}

async function handle(req, res) {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch { return json(res, 400, { error: 'Некорректный URL.' }); }

  if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'ok' });
  if (req.method === 'POST' && url.pathname === '/api/feedback') return handleFeedback(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Метод не поддерживается.' });
  return serveStatic(req, res, url.pathname);
}

async function start() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const saved = JSON.parse(await fs.readFile(feedbackFile, 'utf8'));
    if (Array.isArray(saved)) feedback = saved;
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Не удалось прочитать отзывы:', error.message);
    await fs.writeFile(feedbackFile, '[]\n', 'utf8');
  }

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
