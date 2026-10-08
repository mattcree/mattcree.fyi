// Regenerates public/playthings/index.html from the folders in public/playthings/,
// and refreshes the "latest" list on the home page between its marker comments.
import { readdir, readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { renderCv } from './cv.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const pub = path.join(root, 'public');
const dir = path.join(pub, 'playthings');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function firstCommitDate(folder) {
  try {
    const out = execSync(`git log --diff-filter=A --format=%as --reverse -- "${folder}"`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim().split('\n')[0];
    if (out) return out;
  } catch {}
  return null;
}

async function readPlaything(slug) {
  const folder = path.join(dir, slug);
  const page = path.join(folder, 'index.html');
  if (!existsSync(page)) return null;
  const html = await readFile(page, 'utf8');
  let meta = {};
  if (existsSync(path.join(folder, 'meta.json'))) {
    meta = JSON.parse(await readFile(path.join(folder, 'meta.json'), 'utf8'));
  }
  const title = meta.title ?? html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? slug;
  const blurb = meta.blurb ?? html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] ?? '';
  const date = meta.date ?? firstCommitDate(path.relative(root, folder)) ?? (await stat(page)).mtime.toISOString().slice(0, 10);
  return { slug, title, blurb, date, wide: Boolean(meta.wide) };
}

const entries = (await readdir(dir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const things = (await Promise.all(entries.map(readPlaything))).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));

const fmt = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const tile = (t) => `      <a class="cell${t.wide ? ' wide' : ''}" href="/playthings/${esc(t.slug)}">
        <strong>${esc(t.title)}</strong>
        ${t.blurb ? `<span>${esc(t.blurb)}</span>` : ''}
        <time datetime="${esc(t.date)}">${fmt(t.date)}</time>
      </a>`;

const tray = (list) => list.length
  ? `    <div class="tray">\n${list.map(tile).join('\n')}\n    </div>`
  : `    <div class="tray empty"><p>Nothing in the tray yet.</p></div>`;

const indexPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Playthings</title>
  <meta name="description" content="Small things Matthew Cree built, mostly with Claude, mostly for no good reason.">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main>
    <nav><a class="tape small" href="/">mattcree.fyi</a></nav>
    <h1>Playthings</h1>
    <p class="lede">Small things built when a question needed a toy to answer it. Some are useful. Most are not. Each one is a single page, so open it and poke.</p>
${tray(things)}
  </main>
</body>
</html>
`;

await writeFile(path.join(dir, 'index.html'), indexPage);

// Home page: swap the block between the markers.
const homePath = path.join(pub, 'index.html');
const home = await readFile(homePath, 'utf8');
const latest = things.slice(0, 4);
const block = `<!-- playthings:start -->\n${tray(latest)}\n    <!-- playthings:end -->`;
const next = home.replace(/<!-- playthings:start -->[\s\S]*?<!-- playthings:end -->/, block);
if (next === home && !home.includes('playthings:start')) throw new Error('home page is missing the playthings markers');
await writeFile(homePath, next);

// CV
const cv = JSON.parse(await readFile(path.join(root, 'cv', 'cv.json'), 'utf8'));
await mkdir(path.join(pub, 'cv'), { recursive: true });
await writeFile(path.join(pub, 'cv', 'index.html'), renderCv(cv));

console.log(`${things.length} plaything(s) indexed: ${things.map((t) => t.slug).join(', ') || 'none'}`);
