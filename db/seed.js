const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'f1.db');

// Delete existing DB so schema changes take effect cleanly
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);

// Run schema (re-creates all tables fresh)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Load seed data
const seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/seed-data.json'), 'utf8')
);

// --- Prepared statements ---
const insertCar = db.prepare(`
  INSERT OR IGNORE INTO cars
    (era, name, engine_type, displacement, horsepower, top_speed, svg_file, image_url, year_start, year_end, highlight, safety_milestone)
  VALUES
    (@era, @name, @engine_type, @displacement, @horsepower, @top_speed, @svg_file, @image_url, @year_start, @year_end, @highlight, @safety_milestone)
`);

const insertDriver = db.prepare(`
  INSERT OR IGNORE INTO drivers
    (slug, name, nationality, flag_code, championships, wins, poles, era, teams, image_url, year_debut, year_last)
  VALUES
    (@slug, @name, @nationality, @flag_code, @championships, @wins, @poles, @era, @teams, @image_url, @year_debut, @year_last)
`);

const insertRegulation = db.prepare(`
  INSERT OR IGNORE INTO regulations
    (flag_color, flag_name, meaning, animation_class, bg_color, text_color, scroll_order)
  VALUES
    (@flag_color, @flag_name, @meaning, @animation_class, @bg_color, @text_color, @scroll_order)
`);

const insertWinner = db.prepare(`
  INSERT OR IGNORE INTO race_winners
    (year, grand_prix, circuit, driver_name, team, laps, race_time)
  VALUES
    (@year, @grand_prix, @circuit, @driver_name, @team, @laps, @race_time)
`);

const insertQualRule = db.prepare(`
  INSERT OR IGNORE INTO qualifying_rules
    (era_start, era_end, format_name, description, sort_order)
  VALUES
    (@era_start, @era_end, @format_name, @description, @sort_order)
`);

const insertEraReg = db.prepare(`
  INSERT OR IGNORE INTO era_regulations
    (era_start, era_end, label, refueling_allowed, avg_pit_seconds, mandatory_stops, description)
  VALUES
    (@era_start, @era_end, @label, @refueling_allowed, @avg_pit_seconds, @mandatory_stops, @description)
`);

const insertPoints = db.prepare(`
  INSERT OR IGNORE INTO points_systems
    (year_start, year_end, system_name, distribution)
  VALUES
    (@year_start, @year_end, @system_name, @distribution)
`);

// --- Update driver photos after seeding ---
const updateDriverPhoto = db.prepare('UPDATE drivers SET image_url = ? WHERE slug = ?');
const driverPhotos = [
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

// --- Update car photos after seeding ---
const updateCarPhoto = db.prepare('UPDATE cars SET image_url = ? WHERE name = ?');
const carPhotos = [
  { name: 'Alfa Romeo 158 Alfetta',      file: 'Alfa Romeo 158 Alfetta.jpg' },
  { name: 'Lotus 49 Ford',               file: 'Lotus 49 Ford.jpg' },
  { name: 'Tyrrell P34',                 file: 'Tyrrell P34.jpg' },
  { name: 'McLaren MP4/4 Honda',         file: 'McLaren_MP4_Honda.jpg' },
  { name: 'Williams FW14B Renault',      file: 'Williams FW14B Renault.jpg' },
  { name: 'Ferrari F2004',               file: 'Ferrari F2004.jpg' },
  { name: 'Mercedes W11 EQ Performance', file: 'Mercedes W11 EQ Performance.jpg' }
];

// Run all inserts in one transaction
const seedAll = db.transaction(() => {
  seed.cars.forEach(car => insertCar.run(car));
  seed.drivers.forEach(driver => insertDriver.run(driver));
  seed.regulations.forEach(reg => insertRegulation.run(reg));
  seed.race_winners.forEach(winner => insertWinner.run(winner));
  seed.qualifying_rules.forEach(rule => insertQualRule.run(rule));
  seed.era_regulations.forEach(er => insertEraReg.run(er));
  seed.points_systems.forEach(ps => insertPoints.run(ps));

  // Apply local driver photos
  driverPhotos.forEach(({ slug, file }) => {
    updateDriverPhoto.run('/drivers-photo/' + file, slug);
  });
  
  // Apply local car photos
  carPhotos.forEach(({ name, file }) => {
    updateCarPhoto.run('/cars/' + file, name);
  });
});

seedAll();

// Verify counts
const counts = {
  cars:            db.prepare('SELECT COUNT(*) as c FROM cars').get().c,
  drivers:         db.prepare('SELECT COUNT(*) as c FROM drivers').get().c,
  winners:         db.prepare('SELECT COUNT(*) as c FROM race_winners').get().c,
  regulations:     db.prepare('SELECT COUNT(*) as c FROM regulations').get().c,
  qualifying:      db.prepare('SELECT COUNT(*) as c FROM qualifying_rules').get().c,
  era_regulations: db.prepare('SELECT COUNT(*) as c FROM era_regulations').get().c,
  points_systems:  db.prepare('SELECT COUNT(*) as c FROM points_systems').get().c,
};

console.log('✅ Database seeded successfully.');
Object.entries(counts).forEach(([k, v]) => console.log(`   ${k.padEnd(16)}: ${v} records`));
db.close();
