// Strona Pondoodle Games (GitHub Pages): polityki prywatności wszystkich gier pod jednym adresem.
// Źródła: src/<gra>.md (nagłówek z slug, title, desc; sekcje językowe zaczynają się od :en i :pl). Wynik: <slug>/index.html, privacy/index.html i index.html.
// Użycie: node build.mjs   (potem commit i push; GitHub Pages publikuje gałąź main bez Jekylla, plik .nojekyll)
// Strony są samodzielne: bez zewnętrznych krojów, skryptów, ciasteczek i liczników.
import fs from 'fs';
import path from 'path';
const ROOT = path.dirname(new URL(import.meta.url).pathname);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Markdown w zakresie, którego używają polityki: nagłówki, akapity, listy, linki, kod, pogrubienie */
const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
function md(src) {
  const out = []; let list = null;
  const flush = () => { if (list) { out.push('<ul>' + list.map(i => `<li>${inline(i)}</li>`).join('') + '</ul>'); list = null; } };
  for (const block of src.trim().split(/\n\s*\n/)) {
    const b = block.trim();
    if (/^# /.test(b)) { flush(); out.push(`<h1>${inline(b.slice(2))}</h1>`); }
    else if (/^## /.test(b)) { flush(); const t = b.slice(3); out.push(`<h2>${inline(t)}</h2>`); }
    else if (/^- /m.test(b) && b.split('\n').every(l => /^- /.test(l))) { list = (list || []).concat(b.split('\n').map(l => l.slice(2))); flush(); }
    else { flush(); out.push(`<p>${inline(b.replace(/\n/g, ' '))}</p>`); }
  }
  flush(); return out.join('\n');
}
const CSS = `:root{--bg:#fffdf7;--fg:#2b2236;--muted:#6a5a7a;--accent:#7a4a8c;--line:#e8e0f0;--code:#f3eef8}
@media (prefers-color-scheme:dark){:root{--bg:#1c1628;--fg:#efe9f7;--muted:#b6a8c6;--accent:#d7a8ff;--line:#3a3050;--code:#2a2238}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 64px}h1{font-size:1.7em;line-height:1.25;margin:.6em 0 .3em}h2{font-size:1.2em;margin:1.6em 0 .3em}
a{color:var(--accent)}code{background:var(--code);padding:.1em .35em;border-radius:4px;font-size:.88em;word-break:break-all}
nav{display:flex;gap:16px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--line);padding-bottom:12px;font-size:.95em}nav .brand{font-weight:700;color:var(--fg);text-decoration:none;margin-right:auto}
section+section{border-top:1px solid var(--line);margin-top:48px;padding-top:8px}footer{color:var(--muted);font-size:.85em;margin-top:56px;border-top:1px solid var(--line);padding-top:12px}
ul.games{padding-left:1.1em}ul.games li{margin:.5em 0}`;
const page = ({ title, desc, lang = 'en', body, depth }) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<style>${CSS}</style>
</head>
<body>
<main>
<nav><a class="brand" href="${'../'.repeat(depth)}">Pondoodle Games</a><a href="${'../'.repeat(depth)}privacy/">Privacy · Prywatność</a></nav>
${body}
<footer>Pondoodle Games · pondoodlegames@yahoo.com</footer>
</main>
</body>
</html>
`;
const write = (rel, html) => { const f = path.join(ROOT, rel, 'index.html'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); console.log('zapisano', path.relative(ROOT, f)); };
const games = [];
for (const f of fs.readdirSync(path.join(ROOT, 'src')).filter(f => f.endsWith('.md')).sort()) {
  const src = fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/); if (!m) throw new Error(f + ': brak nagłówka');
  const meta = Object.fromEntries(m[1].split('\n').map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  const parts = m[2].split(/^:(\w+)\s*$/m).slice(1), sections = [];
  for (let i = 0; i < parts.length; i += 2) sections.push({ lang: parts[i], html: md(parts[i + 1]) });
  const NAMES = { en: 'English', pl: 'Polski' };
  /* na górze przełącznik języków, a każda sekcja ma swój atrybut lang (czytniki ekranu, tłumacze przeglądarek) */
  const body = `<p>${sections.map(s => `<a href="#${s.lang}">${NAMES[s.lang] || s.lang}</a>`).join(' · ')}</p>\n` + sections.map(s => `<section id="${s.lang}" lang="${s.lang}">\n${s.html}\n</section>`).join('\n');
  write(meta.slug, page({ title: 'Privacy · ' + meta.title, desc: meta.desc, body, depth: meta.slug.split('/').length }));
  games.push(meta);
}
/* Strony pomocy: src/help/<gra>.<lang>.md, jedna strona na język (nagłówek: slug, title, desc, lang, alt = adres drugiej wersji językowej) */
const HELP = path.join(ROOT, 'src', 'help'), LANG_NAMES = { en: 'English', pl: 'Polski' };
for (const f of fs.existsSync(HELP) ? fs.readdirSync(HELP).filter(f => f.endsWith('.md')).sort() : []) {
  const src = fs.readFileSync(path.join(HELP, f), 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/); if (!m) throw new Error(f + ': brak nagłówka');
  const meta = Object.fromEntries(m[1].split('\n').map(l => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
  const sw = ['en', 'pl'].map(l => l === meta.lang ? LANG_NAMES[l] : `<a href="${meta.alt}" lang="${l}" hreflang="${l}">${LANG_NAMES[l]}</a>`).join(' · ');
  const body = `<p>${sw}</p>\n<section lang="${meta.lang}">\n${md(m[2])}\n</section>`;
  write(meta.slug, page({ title: meta.title, desc: meta.desc, lang: meta.lang, body, depth: meta.slug.split('/').length }));
}
const list = games.map(g => `<li><a href="${g.slug.replace(/^privacy\//, '')}/">${esc(g.title)}</a></li>`).join('\n');
write('privacy', page({ title: 'Privacy · Pondoodle Games', desc: 'Privacy policies of Pondoodle Games apps', depth: 1, body: `<section lang="en"><h1>Privacy policies</h1>
<p>Our games have no accounts, ads or analytics, and their code sends nothing over the internet. Each game has its own policy:</p>
<ul class="games">\n${list}\n</ul></section>
<section lang="pl"><h1>Polityki prywatności</h1>
<p>Nasze gry nie mają kont, reklam ani analityki, a ich kod niczego nie wysyła przez internet. Każda gra ma własną politykę:</p>
<ul class="games">\n${list}\n</ul></section>` }));
write('', page({ title: 'Pondoodle Games', desc: 'Pondoodle Games: small games without ads', depth: 0, body: `<section lang="en"><h1>Pondoodle Games</h1>
<p>Small games without ads, energy or loot boxes. Contact: pondoodlegames@yahoo.com.</p>
<p><a href="privacy/">Privacy policies of our games</a></p></section>
<section lang="pl"><h1>Pondoodle Games</h1>
<p>Małe gry bez reklam, energii i skrzynek. Kontakt: pondoodlegames@yahoo.com.</p>
<p><a href="privacy/">Polityki prywatności naszych gier</a></p></section>` }));
