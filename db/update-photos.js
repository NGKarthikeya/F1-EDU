// One-shot script: update driver image_url to local public photo paths
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'f1.db'));

const updates = [
  { slug: 'lewis-hamilton',     file: 'Lewis Hamilton x Ferrari.jpg' },
  { slug: 'michael-schumacher', file: 'michael_schumacher.jpg' },
  { slug: 'ayrton-senna',       file: 'Ayrton Senna.jpg' },
  { slug: 'juan-fangio',        file: 'Juan Manuel Fangio.jpg' },
  { slug: 'alain-prost',        file: 'Alain Prost.jpg' },
  { slug: 'sebastian-vettel',   file: 'Sebastian Vettel.jpg' },
  { slug: 'niki-lauda',         file: 'Niki Lauda.jpg' },
  { slug: 'jim-clark',          file: 'Jim ClarkJim Clark.jpg' },
  { slug: 'jackie-stewart',     file: 'Jackie Stewart.jpg' },
  { slug: 'nelson-piquet',      file: 'Nelson Piquet.jpg' },
  { slug: 'nigel-mansell',      file: 'Nigel Mansell.jpg' },
  { slug: 'mika-hakkinen',      file: 'Mika Häkkinen.jpg' },
  { slug: 'damon-hill',         file: 'Damon Hill.jpg' },
  { slug: 'max-verstappen',     file: 'Max Verstappen.jpg' },
  { slug: 'fernando-alonso',    file: 'Fernando Alonso.jpg' },
  { slug: 'kimi-raikkonen',     file: 'Kimi Räikkönen.jpg' },
  { slug: 'emerson-fittipaldi', file: 'Emerson Fittipaldi.jpg' },
  { slug: 'jenson-button',      file: 'Jenson Button.jpg' },
  { slug: 'gilles-villeneuve',  file: 'Gilles Villeneuve.jpg' },
  { slug: 'stirling-moss',      file: 'Stirling Moss.jpg' },
  { slug: 'jochen-rindt',       file: 'Jochen Rindt.jpg' },
];

const stmt = db.prepare('UPDATE drivers SET image_url = ? WHERE slug = ?');

const doUpdate = db.transaction(() => {
  updates.forEach(({ slug, file }) => {
    const url = '/drivers-photo/' + encodeURIComponent(file);
    const result = stmt.run(url, slug);
    if (result.changes > 0) {
      console.log(`  ✅  ${slug} → ${url}`);
    } else {
      console.log(`  ⚠️  Not found in DB: ${slug}`);
    }
  });
});

doUpdate();
console.log('\n✅ Driver photos updated in database.');
db.close();
