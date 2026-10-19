// Full-site crawler for https://rvitm.edu.in/
// Discovers every HTML page (sitemap + breadth-first link following) and saves clean text
// to data/pages/<slug>.txt plus data/pages/_index.json.
// Uses curl.exe because Node's fetch gets ECONNRESET against this host on this network.
//
// Usage: node scripts/crawl_site.js [maxPages=1500] [concurrency=4]
// Resumable: pages already saved (non-empty) are re-used instead of re-downloaded.

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = 'https://rvitm.edu.in/';
const OUT = path.join(__dirname, '..', 'data', 'pages');
const MAX_PAGES = parseInt(process.argv[2] || '1500', 10);
const CONCURRENCY = parseInt(process.argv[3] || '4', 10);
fs.mkdirSync(OUT, { recursive: true });

const SEEDS = [
  ROOT, 'know_rvitm/', 'key_executives/', 'leadership_and_governance/', 'accreditations_affiliations/',
  'achievements/', 'departments/', 'departments/library-2/', 'circular_and_notifications/', 'admissions/',
  'placement/', 'clubs/', 'committee/', 'events/', 'facilties/', 'alumni/', 'contact_us/', 'nss/', 'policies/'
].map(u => (u.startsWith('http') ? u : ROOT + u));

// ---------- helpers ----------
function curl(url, timeoutSec = 90) {
  return new Promise(resolve => {
    execFile('curl.exe', ['-sL', '--compressed', '-m', String(timeoutSec), '--connect-timeout', '60',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RVITM-Chatbot-Indexer',
      '-w', '\n__HTTP_STATUS__%{http_code}__FINAL__%{url_effective}', url],
      { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout) => {
        const m = (stdout || '').match(/\n__HTTP_STATUS__(\d+)__FINAL__(\S*)$/);
        if (!m) return resolve({ status: 0, body: '', finalUrl: url, error: err ? err.message : 'no output' });
        resolve({ status: +m[1], body: stdout.slice(0, m.index), finalUrl: m[2] || url });
      });
  });
}

const decode = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
  .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
  .replace(/&#038;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

function normalizeUrl(href, base) {
  try {
    const u = new URL(decode(href), base);
    if (!/^(www\.)?rvitm\.edu\.in$/i.test(u.hostname)) return null;
    u.protocol = 'https:'; u.hostname = 'rvitm.edu.in'; u.hash = ''; u.search = '';
    let p = u.pathname;
    if (/\/(wp-content|wp-json|wp-admin|wp-includes|feed|comments|xmlrpc\.php|author|tag|page\/\d+)/i.test(p)) return null;
    if (/\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|svg|zip|mp4|mp3|css|js|xml|ico)$/i.test(p)) return null;
    if (!p.endsWith('/')) p += '/';
    u.pathname = p;
    return u.toString();
  } catch { return null; }
}

function slugFor(url) {
  return url.replace(ROOT, '').replace(/\/$/, '').replace(/[\/]/g, '__').replace(/[^a-zA-Z0-9_\-]/g, '_') || 'home';
}

function extract(html, url) {
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  // Collect links from the whole page (incl. header menus) for discovery
  const links = [];
  body.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = decode(txt.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    links.push({ text: t, href: decode(href) });
  });

  // Text: drop header/footer templates so only main content is kept
  const main = body.replace(/<header[\s\S]*?<\/header>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  const text = decode(
    main
      .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/tr|\/section|\/td|\/th)[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<h([1-6])[^>]*>/gi, '\n## ')
      .replace(/<[^>]+>/g, ' ')
  )
    .split('\n').map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l && !/^(\/\*|#uc_|\.uc_|skip render)/.test(l) && !/[{};]\s*$/.test(l))
    .filter((l, i, arr) => l !== arr[i - 1])
    .join('\n');

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/\s+/g, ' ').trim();
  const desc = decode((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1] || '').trim();
  return { title, desc, text, links };
}

async function sitemapUrls() {
  const found = new Set();
  const queue = [ROOT + 'wp-sitemap.xml', ROOT + 'sitemap_index.xml', ROOT + 'page-sitemap.xml'];
  const seen = new Set();
  while (queue.length) {
    const sm = queue.shift();
    if (seen.has(sm)) continue; seen.add(sm);
    const r = await curl(sm, 120);
    console.log(`[sitemap] ${r.status} ${sm}`);
    if (r.status !== 200 || !/<(urlset|sitemapindex)/i.test(r.body)) continue;
    const locs = [...r.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => decode(m[1]));
    for (const loc of locs) {
      if (/\.xml(\?|$)/i.test(loc)) {
        if (!/(user|users|author|taxonomies-post_tag)/i.test(loc)) queue.push(loc);
      } else {
        const n = normalizeUrl(loc, ROOT);
        if (n) found.add(n);
      }
    }
  }
  return [...found];
}

// ---------- main ----------
(async () => {
  const t0 = Date.now();
  const fromSitemap = await sitemapUrls();
  console.log(`[sitemap] ${fromSitemap.length} page URLs discovered`);

  const queued = new Set();
  const queue = [];
  const enqueue = u => { if (u && !queued.has(u) && queued.size < MAX_PAGES) { queued.add(u); queue.push(u); } };
  SEEDS.forEach(enqueue);
  fromSitemap.forEach(enqueue);

  const index = [];
  const done = new Set();
  let active = 0;

  async function processUrl(url) {
    const slug = slugFor(url);
    const file = path.join(OUT, slug + '.txt');
    let html = null, status = 0, finalUrl = url;

    // Resume support: keep raw HTML cache so link discovery works on re-runs too
    const cacheFile = path.join(OUT, '_html', slug + '.html');
    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
      html = fs.readFileSync(cacheFile, 'utf8'); status = 200;
    } else {
      for (let attempt = 1; attempt <= 3 && status !== 200; attempt++) {
        const r = await curl(url);
        status = r.status; finalUrl = r.finalUrl;
        if (status === 200) html = r.body;
        else if (status === 404) break;
      }
      if (html) { fs.mkdirSync(path.dirname(cacheFile), { recursive: true }); fs.writeFileSync(cacheFile, html); }
    }

    if (!html) { index.push({ url, slug, status, error: 'fetch failed' }); console.log(`ERR ${status} ${url}`); return; }

    // If redirected to another internal page, record the canonical one
    const canonical = normalizeUrl(finalUrl, ROOT) || url;
    const { title, desc, text, links } = extract(html, canonical);
    const docs = [...new Map(links.filter(l => /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(l.href))
      .map(l => [l.href, l])).values()];

    fs.writeFileSync(file,
      `URL: ${canonical}\nTITLE: ${title}\nDESCRIPTION: ${desc}\n\n${text}\n\n--- DOCUMENTS ---\n` +
      docs.map(d => `${d.text || 'Document'} | ${d.href}`).join('\n') + '\n');
    index.push({ url: canonical, slug, title, status, chars: text.length, docs: docs.length });
    console.log(`${status} ${String(text.length).padStart(6)}c ${String(docs.length).padStart(3)}d  [${done.size + 1}/${queued.size}] ${canonical}`);

    for (const l of links) enqueue(normalizeUrl(l.href, canonical));
  }

  await new Promise(resolve => {
    const pump = () => {
      if (!queue.length && active === 0) return resolve();
      while (active < CONCURRENCY && queue.length) {
        const url = queue.shift();
        active++;
        processUrl(url).catch(e => console.log('ERR', url, e.message)).finally(() => {
          done.add(url); active--;
          if (done.size % 10 === 0) fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 2));
          pump();
        });
      }
    };
    pump();
  });

  // De-duplicate by canonical URL (redirects can map several URLs to one page)
  const byUrl = new Map();
  for (const e of index) if (!byUrl.has(e.url) || e.status === 200) byUrl.set(e.url, e);
  const finalIndex = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(finalIndex, null, 2));

  const ok = finalIndex.filter(e => e.status === 200).length;
  console.log(`\nDONE: ${ok} pages saved, ${finalIndex.length - ok} failed, ${Math.round((Date.now() - t0) / 1000)}s`);
})();
