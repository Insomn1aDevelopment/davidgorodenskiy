'use strict';

// Собирает сайт в один самодостаточный файл dist/index.html: фотографии и шрифты встраиваются внутрь.
// Нужен для хостингов, где можно разместить только одну HTML-страницу. Исходный index.html не меняется.
// Без сервера свечи и голоса работают только на экране посетителя (общий счёт требует server.js).
const fs = require('node:fs/promises');
const path = require('node:path');

const root = __dirname;
const outDir = path.join(root, '..', 'dist');
// Современный браузер в User-Agent — иначе Google Fonts отдаёт старые форматы вместо woff2.
const browserUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const keepSubsets = new Set(['cyrillic', 'latin']); // белорусская «ў» входит в cyrillic

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': browserUA } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function inlineFonts(cssUrl) {
  const css = (await download(cssUrl)).toString('utf8');
  // Google размечает каждый @font-face комментарием с названием набора символов: /* cyrillic */ @font-face {...}
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)].filter(([, subset]) => keepSubsets.has(subset));
  if (!blocks.length) throw new Error('Не удалось разобрать CSS шрифтов Google Fonts');
  const faces = [];
  for (const [, , face] of blocks) {
    const url = face.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
    if (!url) throw new Error('В @font-face нет ссылки на woff2');
    faces.push(face.replace(url, `data:font/woff2;base64,${(await download(url)).toString('base64')}`));
  }
  return faces.join('\n');
}

async function build() {
  let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');

  const images = [...new Set(html.match(/img\/[\w.-]+\.(?:jpe?g|png|webp|svg)/g) || [])];
  for (const ref of images) {
    const ext = path.extname(ref).slice(1).toLowerCase();
    const mime = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
    const data = (await fs.readFile(path.join(root, ref))).toString('base64');
    html = html.split(ref).join(`data:image/${mime};base64,${data}`);
  }

  const fontLink = html.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)">/);
  if (!fontLink) throw new Error('Не найдена ссылка на Google Fonts в index.html');
  html = html
    .replace(fontLink[0], `<style>\n${await inlineFonts(fontLink[1].replace(/&amp;/g, '&'))}\n</style>`)
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.(googleapis|gstatic)\.com"( crossorigin)?>\n?/g, '');

  const left = html.match(/(?:src|href)="(?:https?:)?\/\/[^"]+"/g);
  if (left) throw new Error(`Остались внешние ссылки: ${left.join(', ')}`);

  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  await fs.writeFile(outFile, html);
  console.log(`Готово: ${outFile} (${(Buffer.byteLength(html) / 1024).toFixed(0)} КБ, изображений: ${images.length})`);
}

build().catch(error => { console.error('Сборка не удалась:', error.message); process.exitCode = 1; });
