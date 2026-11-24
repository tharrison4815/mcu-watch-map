// Builds the MCU Watch Map page.
//
//   npm run check   validate the data in data/ and stop
//   npm run build   validate, then write dist/ (the page with the data inserted, plus fonts and headers)
//
// The page template is src/index.html. Its script holds four markers (/*@E*/null and so on) that
// are replaced with the data, in the compact shapes the page's code uses:
//   E      titles   {id, up, dm, an, p, ty, ep, t, n, d, rt, lane, so, sy, syn}
//   LANES  rows     [name, colour]
//   L      links    {f, t, s, k, n}
//   C      casts    {titleId: [[name, role, hero?, twist?], ...]}
// Run with Node 24 or later, which runs TypeScript directly.

import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { parse } from 'smol-toml';
import { Script } from 'node:vm';

const errors: string[] = [];
const warnings: string[] = [];
const fail = (where: string, msg: string) => errors.push(`${where}: ${msg}`);

type Table = Record<string, unknown>;

function load(file: string): Table {
  try {
    return parse(readFileSync(file, 'utf8')) as Table;
  } catch (e) {
    fail(file, (e as Error).message);
    return {};
  }
}

const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;
const isDate = (v: unknown): v is Date => v instanceof Date;
const dateStr = (v: Date) => v.toISOString().slice(0, 10);

function onlyKeys(where: string, obj: Table, allowed: string[]) {
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) fail(where, `unknown field "${k}" (allowed: ${allowed.join(', ')})`);
}

// ---------- rows ----------

const rowsFile = 'data/rows.toml';
const rowsRaw = (load(rowsFile).row ?? []) as Table[];
const LANES: [string, string][] = [];
rowsRaw.forEach((r, i) => {
  const where = `${rowsFile} row ${i + 1}`;
  onlyKeys(where, r, ['name', 'colour']);
  if (!isStr(r.name)) return fail(where, 'needs a name');
  if (LANES.some(l => l[0] === r.name)) fail(where, `duplicate row "${r.name}"`);
  if (typeof r.colour !== 'string' || !/^#[0-9a-f]{6}$/i.test(r.colour)) fail(where, 'colour must look like "#d7262b"');
  LANES.push([r.name, String(r.colour)]);
});
const laneIndex = new Map(LANES.map((l, i) => [l[0], i]));

// ---------- titles ----------

const TYPES = ['film', 'show', 'special', 'shorts'];
const ROLES = ['Lead', 'Main', 'Supporting', 'Cameo', 'Post-credits'];
const TITLE_KEYS = ['id', 'title', 'map_lines', 'type', 'upcoming', 'released', 'month_only', 'runtime', 'episodes',
  'animated', 'row', 'story_order', 'story_year', 'synopsis', 'cast'];
const UPCOMING_FORBIDDEN = ['runtime', 'episodes', 'story_order', 'story_year', 'synopsis', 'cast'];

interface Title {
  id: string; up?: 1; dm?: 1; an?: 1; p: number; ty: string; ep?: number; t: string; n: string[];
  d: string; rt?: number; lane: number; so: number; sy: string; syn?: string;
}
type CastRow = [string, string] | [string, string, string | null] | [string, string, string | null, 1];

const titles: { e: Title; cast?: CastRow[]; file: string }[] = [];
const ids = new Set<string>();
const storyOrders = new Map<number, string>();

const phaseFiles = readdirSync('data/titles')
  .filter(f => /^phase-\d+\.toml$/.test(f))
  .sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6)));

for (const f of phaseFiles) {
  const file = `data/titles/${f}`;
  const phase = parseInt(f.slice(6));
  let prev = '';
  for (const [i, x] of ((load(file).title ?? []) as Table[]).entries()) {
    const where = `${file} title ${i + 1}${isStr(x.id) ? ` (${x.id})` : ''}`;
    onlyKeys(where, x, TITLE_KEYS);
    if (typeof x.id !== 'string' || !/^[a-z0-9]+$/.test(x.id)) { fail(where, 'id must be lower-case letters and digits'); continue; }
    if (ids.has(x.id)) fail(where, `duplicate id "${x.id}"`);
    ids.add(x.id);
    if (!isStr(x.title)) fail(where, 'needs a title');
    const lines = x.map_lines;
    if (!Array.isArray(lines) || lines.length < 1 || lines.length > 3 || !lines.every(isStr)) fail(where, 'map_lines must be 1 to 3 short lines');
    else for (const ln of lines) if (ln.length > 18) warnings.push(`${where}: map line "${ln}" may be too wide for its box`);
    if (!TYPES.includes(x.type as string)) fail(where, `type must be one of ${TYPES.join(', ')}`);
    if (!isDate(x.released)) { fail(where, 'released must be a date like 2008-05-02 (no quotes)'); continue; }
    const d = dateStr(x.released);
    if (d < prev) fail(where, `out of release order (${d} comes before the previous title's ${prev})`);
    prev = d;
    if (!laneIndex.has(x.row as string)) fail(where, `row "${x.row}" is not in data/rows.toml`);
    for (const k of ['upcoming', 'month_only', 'animated']) if (k in x && x[k] !== true) fail(where, `${k} can only be true (leave it out otherwise)`);

    const e: Title = {
      id: x.id, p: phase, ty: String(x.type), t: String(x.title), n: lines as string[], d,
      lane: laneIndex.get(x.row as string) ?? 0, so: 0, sy: '',
    };
    if (x.upcoming) e.up = 1;
    if (x.month_only) e.dm = 1;
    if (x.animated) e.an = 1;

    if (x.upcoming) {
      for (const k of UPCOMING_FORBIDDEN) if (k in x) fail(where, `upcoming titles carry no details, so no "${k}"`);
      titles.push({ e, file });
      continue;
    }
    if (x.month_only) fail(where, 'month_only is only for upcoming titles');
    const needsEp = x.type === 'show' || x.type === 'shorts';
    if (needsEp) {
      if (!isInt(x.episodes)) fail(where, 'series and shorts need episodes');
      if ('runtime' in x) fail(where, 'series and shorts have episodes, not runtime');
      e.ep = x.episodes as number;
    } else {
      if (!isInt(x.runtime)) fail(where, 'films and specials need runtime (minutes)');
      if ('episodes' in x) fail(where, 'films and specials have runtime, not episodes');
      e.rt = x.runtime as number;
    }
    if (!isInt(x.story_order) || (x.story_order as number) >= 9000) fail(where, 'story_order must be a whole number below 9000');
    else if (storyOrders.has(x.story_order as number)) fail(where, `story_order ${x.story_order} is already used by ${storyOrders.get(x.story_order as number)}`);
    else storyOrders.set(x.story_order as number, x.id);
    if (!isStr(x.story_year)) fail(where, 'needs story_year');
    if (!isStr(x.synopsis)) fail(where, 'needs a synopsis');
    e.so = x.story_order as number;
    e.sy = String(x.story_year);
    e.syn = String(x.synopsis).trim();

    const cast: CastRow[] = [];
    const castRaw = x.cast;
    if (!Array.isArray(castRaw) || !castRaw.length) fail(where, 'needs a cast list');
    else castRaw.forEach((c: Table, j) => {
      const cw = `${where} cast ${j + 1}`;
      if (typeof c !== 'object' || c === null) return fail(cw, 'each cast entry is { name = "...", role = "..." }');
      onlyKeys(cw, c, ['name', 'role', 'hero', 'twist']);
      if (!isStr(c.name)) return fail(cw, 'needs a name');
      if (cast.some(r => r[0] === c.name)) fail(cw, `"${c.name}" is listed twice`);
      if (!ROLES.includes(c.role as string)) fail(cw, `role must be one of ${ROLES.join(', ')}`);
      if ('hero' in c && !isStr(c.hero)) fail(cw, 'hero must be text (leave it out if there is none)');
      if ('twist' in c && c.twist !== true) fail(cw, 'twist can only be true (leave it out otherwise)');
      const row: CastRow = c.twist ? [c.name, String(c.role), (c.hero as string) ?? null, 1]
        : c.hero ? [c.name, String(c.role), c.hero as string] : [c.name, String(c.role)];
      cast.push(row);
    });
    titles.push({ e, cast, file });
  }
}

// Release order across all phase files (phases overlap in time). Stable, so same-day titles keep file order.
titles.sort((a, b) => a.e.d.localeCompare(b.e.d));
// Upcoming titles sort last in story order, in release order.
let up = 9001;
for (const { e } of titles) if (e.up) { e.so = up++; e.sy = 'Upcoming'; }

const E = titles.map(t => t.e);
const byId = new Map(E.map((e, i) => [e.id, { e, i }]));
const C: Record<string, CastRow[]> = {};
for (const t of titles) if (t.cast) C[t.e.id] = t.cast;

// ---------- links ----------

const linksFile = 'data/links.toml';
const STRENGTH: Record<string, number> = { essential: 3, helpful: 2, minor: 1 };
const ONLY: Record<string, string> = { 'post-credits': 'pc', cameo: 'cameo' };
interface Link { f: string; t: string; s: number; k?: string; n: string }
const L: Link[] = [];
const pairs = new Set<string>();
((load(linksFile).link ?? []) as Table[]).forEach((x, i) => {
  const where = `${linksFile} link ${i + 1} (${x.from} to ${x.to})`;
  onlyKeys(where, x, ['from', 'to', 'strength', 'only', 'note']);
  const a = byId.get(x.from as string), b = byId.get(x.to as string);
  if (!a) return fail(where, `no title with id "${x.from}"`);
  if (!b) return fail(where, `no title with id "${x.to}"`);
  if (a.e.up || b.e.up) fail(where, 'upcoming titles have no links');
  if (a.i >= b.i) fail(where, '"from" must be released before "to"');
  const key = `${x.from}>${x.to}`;
  if (pairs.has(key)) fail(where, 'this link is listed twice');
  pairs.add(key);
  if (!(String(x.strength) in STRENGTH)) fail(where, 'strength must be essential, helpful or minor');
  if ('only' in x && !(String(x.only) in ONLY)) fail(where, 'only must be post-credits or cameo (or left out)');
  if (!isStr(x.note)) fail(where, 'needs a note');
  const l: Link = { f: String(x.from), t: String(x.to), s: STRENGTH[String(x.strength)] ?? 1, n: String(x.note ?? '').trim() };
  if (x.only) l.k = ONLY[String(x.only)];
  L.push(l);
});

// ---------- report ----------

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} problem${errors.length > 1 ? 's' : ''} found:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const released = E.filter(e => !e.up).length;
console.log(`Data OK: ${E.length} titles (${released} released, ${E.length - released} upcoming), ${LANES.length} rows, ${L.length} links.`);

// ---------- build ----------

// JSON is valid JavaScript; escaping "<" keeps "</script>" in any text from ending the script early.
const js = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');
let html = readFileSync('src/index.html', 'utf8');
for (const [name, value] of Object.entries({ E, LANES, L, C })) {
  const marker = `/*@${name}*/null`;
  if (html.split(marker).length !== 2) { console.error(`src/index.html must contain ${marker} exactly once`); process.exit(1); }
  html = html.replace(marker, () => js(value));
}
// Syntax-check every inline script, so a typo in the page can never be deployed.
for (const [, code] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  try { new Script(code); } catch (e) { console.error(`Script error in src/index.html: ${(e as Error).message}`); process.exit(1); }
}
console.log('Page scripts OK.');
if (process.argv.includes('--check')) process.exit(0);
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
writeFileSync('dist/index.html', html);
cpSync('src/fonts', 'dist/fonts', { recursive: true });
cpSync('src/_headers', 'dist/_headers');
console.log(`Built dist/index.html (${(html.length / 1024).toFixed(0)} KB) with fonts and _headers.`);
