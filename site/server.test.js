'use strict';

// Запускает сервер на временной базе и проверяет API свечей, голосов и отзывов.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('свечи, голоса и отзывы сохраняются в базе', async t => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dg-test-'));
  fs.writeFileSync(path.join(dataDir, 'feedback.json'), JSON.stringify([{ id: 'old', createdAt: '2026-01-01T00:00:00Z', message: 'старый отзыв' }]));
  const port = 3900 + Math.floor(Math.random() * 90);
  const server = spawn(process.execPath, [path.join(__dirname, 'server.js')], { env: { ...process.env, PORT: port, DATA_DIR: dataDir }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(async () => {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited; // на Windows файл базы занят, пока процесс жив
    fs.rmSync(dataDir, { recursive: true, force: true });
  });
  await new Promise((resolve, reject) => {
    server.stdout.on('data', d => String(d).includes('Сайт доступен') && resolve());
    server.on('exit', code => reject(new Error(`сервер завершился с кодом ${code}`)));
  });

  const base = `http://localhost:${port}/api/`;
  const get = p => fetch(base + p).then(async r => ({ status: r.status, body: await r.json() }));
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(async r => ({ status: r.status, body: await r.json() }));
  const a = 'visitor-aaaa', b = 'visitor-bbbb';

  assert.deepEqual((await get(`candles?visitor=${a}`)).body, { count: 0, mine: false });
  assert.deepEqual((await post('candles', { visitor: a })).body, { count: 1, mine: true });
  assert.deepEqual((await post('candles', { visitor: a })).body, { count: 1, mine: true }, 'повторная свеча того же посетителя не считается');
  assert.deepEqual((await post('candles', { visitor: b })).body, { count: 2, mine: true });
  assert.equal((await post('candles', { visitor: 'bad id!' })).status, 400);

  await post('votes', { visitor: a, riddle: 0, choice: 1 });
  await post('votes', { visitor: b, riddle: 0, choice: 1 });
  const changed = await post('votes', { visitor: a, riddle: 0, choice: 0 });
  assert.deepEqual(changed.body.tally[0], [1, 1], 'повторный голос меняет выбор, а не добавляет голос');
  assert.deepEqual(changed.body.mine, [0, null, null]);
  assert.deepEqual((await get(`votes?visitor=${b}`)).body.mine, [1, null, null]);
  assert.equal((await post('votes', { visitor: a, riddle: 3, choice: 0 })).status, 400);
  assert.equal((await post('votes', { visitor: a, riddle: 0, choice: 2 })).status, 400);

  assert.equal((await post('feedback', { message: 'Спасибо!' })).status, 201);
  assert.equal((await post('feedback', { message: '' })).status, 400);
  assert.equal((await get('nope')).status, 404);

  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path.join(dataDir, 'site.db'));
  assert.deepEqual(db.prepare('SELECT message FROM feedback ORDER BY created_at').all().map(r => r.message), ['старый отзыв', 'Спасибо!']);
  db.close();
});
