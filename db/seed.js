const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'f1.db');
const db = new Database(dbPath);

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Load seed data
const seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/seed-data.json'), 'utf8')
);

// Prepared statements
const insertCar = db.prepare(`
  INSERT OR IGNORE INTO cars
    (era, name, engine_type, displacement, horsepower, top_speed, image_url, year_start, year_end, highlight)
  VALUES
    (@era, @name, @engine_type, @displacement, @horsepower, @top_speed, @image_url, @year_start, @year_end, @highlight)
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

// Run all inserts in a transaction
const seedAll = db.transaction(() => {
  seed.cars.forEach(car => insertCar.run(car));
  seed.drivers.forEach(driver => insertDriver.run(driver));
  seed.regulations.forEach(reg => insertRegulation.run(reg));
  seed.race_winners.forEach(winner => insertWinner.run(winner));
});

seedAll();

// Verify
const carCount = db.prepare('SELECT COUNT(*) as count FROM cars').get();
const driverCount = db.prepare('SELECT COUNT(*) as count FROM drivers').get();
const winnerCount = db.prepare('SELECT COUNT(*) as count FROM race_winners').get();
const regCount = db.prepare('SELECT COUNT(*) as count FROM regulations').get();

console.log('✅ Database seeded successfully.');
console.log(`   Cars:        ${carCount.count} records`);
console.log(`   Drivers:     ${driverCount.count} records`);
console.log(`   Race Winners: ${winnerCount.count} records`);
console.log(`   Regulations: ${regCount.count} records`);

db.close();
