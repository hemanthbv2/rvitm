// Fetches every user-supplied RVITM page, extracts clean readable text + links, saves per-page files.
const fs = require('fs');
const path = require('path');

const URLS = `https://rvitm.edu.in/
https://rvitm.edu.in/know_rvitm/
https://rvitm.edu.in/key_executives/
https://rvitm.edu.in/leadership_and_governance/
https://rvitm.edu.in/accreditations_affiliations/
https://rvitm.edu.in/achievements/
https://rvitm.edu.in/departments/
https://rvitm.edu.in/departments/library-2/
https://rvitm.edu.in/circular_and_notifications/
https://rvitm.edu.in/admissions/
https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/about_the_program/
https://rvitm.edu.in/departments/department_of_computer_science_and_engineering_aiml/about-the-program-aiml/
https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/about_the_programme/
https://rvitm.edu.in/departments/department-of-master-of-computer-applications/about-the-program-mca/
https://rvitm.edu.in/placement/
https://rvitm.edu.in/clubs/
https://rvitm.edu.in/committee/
https://rvitm.edu.in/events/
https://rvitm.edu.in/facilties/
https://rvitm.edu.in/alumni/
https://rvitm.edu.in/contact_us/
https://rvitm.edu.in/departments/department_of_computer_science_and_engineering/achievements_cse/
https://rvitm.edu.in/departments/department_of_electronics_and_communication_engineering/achievements_ece/
https://rvitm.edu.in/departments/department_of_mechanical_engineering/achievements_mechanical-engineering/
https://rvitm.edu.in/departments/department-of-master-of-computer-applications/achievements-mca/
https://rvitm.edu.in/departments/department_of_physical_education/sports_achievements/
https://rvitm.edu.in/nss/
https://rvitm.edu.in/policies/`.split('\n').map(s => s.trim()).filter(Boolean);

const OUT = 'd:\\hemanth bv\\rvitm Chatbot\\data\\pages';
fs.mkdirSync(OUT, { recursive: true });

const decode = s => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
  .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
  .replace(/&#038;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

function extract(html) {
  // Main content only: drop header/footer templates, scripts, styles, svgs
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

  const links = [];
  body.replace(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const t = decode(txt.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    links.push({ text: t, href });
  });

  // Block-level tags -> newlines so text keeps structure
  const text = decode(
    body
      .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/tr|\/section)[^>]*>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<h([1-6])[^>]*>/gi, '\n## ')
      .replace(/<[^>]+>/g, ' ')
  )
    .split('\n').map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l && !/^(\/\*|#uc_|\.uc_|skip render)/.test(l) && !/[{};]\s*$/.test(l))
    .filter((l, i, arr) => l !== arr[i - 1]) // drop consecutive duplicates (Elementor desktop/mobile copies)
    .join('\n');

  return { text, links };
}

(async () => {
  const index = [];
  for (const url of URLS) {
    const slug = url.replace('https://rvitm.edu.in/', '').replace(/\/$/, '').replace(/[\/]/g, '__') || 'home';
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 RVITM-Chatbot-Indexer' } });
      const html = await res.text();
      const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
      const { text, links } = extract(html);
      const docs = [...new Set(links.filter(l => /\.(pdf|docx?|xlsx?)(\?|$)/i.test(l.href)).map(l => JSON.stringify(l)))].map(s => JSON.parse(s));
      fs.writeFileSync(path.join(OUT, slug + '.txt'), `URL: ${url}\nTITLE: ${title}\n\n${text}\n\n--- DOCUMENTS ---\n${docs.map(d => `${d.text} | ${d.href}`).join('\n')}\n`);
      index.push({ url, slug, title, status: res.status, chars: text.length, docs: docs.length });
      console.log(`${res.status} ${String(text.length).padStart(6)} chars ${String(docs.length).padStart(3)} docs  ${slug}`);
    } catch (e) {
      index.push({ url, slug, error: e.message });
      console.log('ERR', slug, e.message);
    }
  }
  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 2));
})();
