const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = 'https://rvitm.edu.in/';
const OUT = path.join(__dirname, '..', 'data', 'pages');

const FAILED_URLS = [
  'https://rvitm.edu.in/circular_and_notifications/examination_circulars/',
  'https://rvitm.edu.in/clubs/',
  'https://rvitm.edu.in/departments/department_of_applied_sciences_and_humanities/faculties_of_applied_science_and_humanities/dr_srinatha_n/',
  'https://rvitm.edu.in/departments/department_of_information_science_and_engineering/faculties_of_ise/mrs_namrata_brahamaprakash/',
  'https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mr-prashanth-b/',
  'https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mr-vasanth-c-bhagawat/',
  'https://rvitm.edu.in/departments/department-of-master-of-computer-applications/faculties-of-mca/mrs-k-sravanthi/',
  'https://rvitm.edu.in/know_rvitm/dr-m-p-shyam/'
];

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

function slugFor(url) {
  return url.replace(ROOT, '').replace(/\/$/, '').replace(/[\/]/g, '__').replace(/[^a-zA-Z0-9_\-]/g, '_') || 'home';
}

function extract(html, url) {
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  const links = [];
  body.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = decode(txt.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    links.push({ text: t, href: decode(href) });
  });

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

(async () => {
  console.log(`Retrying ${FAILED_URLS.length} failed URLs...`);
  const indexPath = path.join(OUT, '_index.json');
  let index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

  for (const url of FAILED_URLS) {
    const slug = slugFor(url);
    const file = path.join(OUT, slug + '.txt');
    console.log(`Fetching ${url}...`);
    let res = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      res = await curl(url, 90);
      if (res.status === 200) break;
      console.log(` Attempt ${attempt} returned status ${res.status}, retrying...`);
    }

    if (res && res.status === 200 && res.body) {
      const { title, desc, text, links } = extract(res.body, url);
      const docs = [...new Map(links.filter(l => /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(l.href))
        .map(l => [l.href, l])).values()];
      fs.writeFileSync(file,
        `URL: ${url}\nTITLE: ${title}\nDESCRIPTION: ${desc}\n\n${text}\n\n--- DOCUMENTS ---\n` +
        docs.map(d => `${d.text || 'Document'} | ${d.href}`).join('\n') + '\n');
      console.log(` SUCCESS: ${url} (${text.length} chars, ${docs.length} docs)`);

      // Update index
      const existing = index.find(e => e.url === url);
      if (existing) {
        existing.status = 200;
        existing.title = title;
        existing.chars = text.length;
        existing.docs = docs.length;
        delete existing.error;
      } else {
        index.push({ url, slug, title, status: 200, chars: text.length, docs: docs.length });
      }
    } else {
      console.log(` FAILED STILL: ${url} (status: ${res ? res.status : 0})`);
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('Retry pass complete!');
})();
