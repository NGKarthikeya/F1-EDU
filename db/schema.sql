CREATE TABLE IF NOT EXISTS cars (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  era          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  engine_type  TEXT,
  displacement TEXT,
  horsepower   INTEGER,
  top_speed    INTEGER,
  downforce    TEXT,
  image_url    TEXT,
  year_start   INTEGER,
  year_end     INTEGER,
  highlight    TEXT
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
  fastest_lap TEXT
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
