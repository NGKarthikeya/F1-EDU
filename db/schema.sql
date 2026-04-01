-- Drop and recreate cars with safety_milestone column
DROP TABLE IF EXISTS cars;
CREATE TABLE IF NOT EXISTS cars (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  era              TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  engine_type      TEXT,
  displacement     TEXT,
  horsepower       INTEGER,
  top_speed        INTEGER,
  downforce        TEXT,
  image_url        TEXT,
  svg_file         TEXT,
  year_start       INTEGER,
  year_end         INTEGER,
  highlight        TEXT,
  safety_milestone TEXT
);

CREATE TABLE IF NOT EXISTS drivers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  nationality   TEXT,
  flag_code     TEXT,
  championships INTEGER DEFAULT 0,
  wins          INTEGER DEFAULT 0,
  poles         INTEGER DEFAULT 0,
  era           TEXT,
  teams         TEXT,
  image_url     TEXT,
  year_debut    INTEGER,
  year_last     INTEGER
);

CREATE TABLE IF NOT EXISTS race_winners (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  year        INTEGER NOT NULL,
  grand_prix  TEXT NOT NULL,
  circuit     TEXT,
  driver_id   INTEGER REFERENCES drivers(id),
  driver_name TEXT,
  team        TEXT,
  laps        INTEGER,
  race_time   TEXT,
  fastest_lap TEXT,
  finish_pos  INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS regulations (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  flag_color      TEXT NOT NULL UNIQUE,
  flag_name       TEXT NOT NULL,
  meaning         TEXT,
  animation_class TEXT,
  bg_color        TEXT,
  text_color      TEXT,
  scroll_order    INTEGER
);

CREATE TABLE IF NOT EXISTS qualifying_rules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  era_start   INTEGER NOT NULL,
  era_end     INTEGER,
  format_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS era_regulations (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  era_start         INTEGER NOT NULL,
  era_end           INTEGER,
  label             TEXT NOT NULL,
  refueling_allowed INTEGER DEFAULT 0,
  avg_pit_seconds   REAL,
  mandatory_stops   INTEGER DEFAULT 1,
  description       TEXT
);

CREATE TABLE IF NOT EXISTS points_systems (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  year_start   INTEGER NOT NULL,
  year_end     INTEGER,
  system_name  TEXT NOT NULL,
  distribution TEXT NOT NULL
);
