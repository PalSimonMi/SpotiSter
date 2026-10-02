import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { db } from "./db.js";

type JsonRecord = Record<string, unknown>;

interface CardImport {
  id: string;
  title: string;
  artist: string;
  releaseYear: number | null;
  provider: string;
  trackUri: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(record: JsonRecord, key: string, rowNumber: number): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Row ${rowNumber}: "${key}" must be a non-empty string.`);
  }
  return value.trim();
}

function parseCard(value: unknown, index: number): CardImport {
  const rowNumber = index + 1;
  if (!isRecord(value)) {
    throw new Error(`Row ${rowNumber}: expected a JSON object.`);
  }

  const rawYear = value["Release Year"];
  let releaseYear: number | null = null;
  if (rawYear !== undefined && rawYear !== null && rawYear !== "") {
    releaseYear = typeof rawYear === "number" ? rawYear : Number(rawYear);
    if (!Number.isInteger(releaseYear)) {
      throw new Error(`Row ${rowNumber}: "Release Year" must be a whole number.`);
    }
  }

  return {
    id: requiredText(value, "Id", rowNumber),
    title: requiredText(value, "Title", rowNumber),
    artist: requiredText(value, "Artist", rowNumber),
    releaseYear,
    provider: requiredText(value, "Provider", rowNumber).toLowerCase(),
    trackUri: requiredText(value, "Track URI", rowNumber),
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: npm run import:cards -- <path-to-json>");
  }

  const contents = await readFile(resolve(inputPath), "utf8");
  const parsed: unknown = JSON.parse(contents);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  if (rows.length === 0) {
    throw new Error("The JSON file contains no card records.");
  }

  const cards = rows.map(parseCard);
  const importCards = db.transaction((records: CardImport[]) => {
    const insertCard = db.prepare(`
      INSERT INTO cards (id, title, artist, release_year)
      VALUES (@id, @title, @artist, @releaseYear)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        artist = excluded.artist,
        release_year = excluded.release_year
    `);
    const insertDestination = db.prepare(`
      INSERT INTO destinations (card_id, provider, value)
      VALUES (@id, @provider, @trackUri)
      ON CONFLICT(card_id, provider) DO UPDATE SET value = excluded.value
    `);

    for (const card of records) {
      insertCard.run(card);
      insertDestination.run(card);
    }
  });

  importCards(cards);
  console.log(`Imported ${cards.length} card record(s) from ${inputPath}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});