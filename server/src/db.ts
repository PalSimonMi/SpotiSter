import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const databasePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/cards.sqlite"
);

mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    release_year INTEGER
  );

  CREATE TABLE IF NOT EXISTS legacy_ids (
    spotify_track_id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS destinations (
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (card_id, provider)
  );
`);