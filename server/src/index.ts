import express from "express";
import { db } from "./db.js";

interface CardRow {
  id: string;
  title: string;
  artist: string;
  release_year: number | null;
}

interface Destination {
  provider: string;
  value: string;
}

function getCard(cardId: string) {
  const card = db
    .prepare("SELECT * FROM cards WHERE id = ?")
    .get(cardId) as CardRow | undefined;

  if (!card) return null;

  const destinations = db
    .prepare("SELECT provider, value FROM destinations WHERE card_id = ?")
    .all(cardId) as Destination[];

  return { ...card, destinations };
}

const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/cards/:cardId", (req, res) => {
  const card = getCard(req.params.cardId);
  if (!card) return res.status(404).json({ error: "not_found" });
  return res.json(card);
});

app.get("/api/resolve/spotify/:trackId", (req, res) => {
  const { trackId } = req.params;

  if (!/^[A-Za-z0-9]{22}$/.test(trackId)) {
    return res.status(400).json({ error: "invalid_track_id" });
  }

  const alias = db
    .prepare("SELECT card_id FROM legacy_ids WHERE spotify_track_id = ?")
    .get(trackId) as { card_id: string } | undefined;

  if (!alias) return res.status(404).json({ error: "not_found" });

  const card = getCard(alias.card_id);
  if (!card) return res.status(404).json({ error: "not_found" });
  return res.json(card);
});

const port = Number(process.env.PORT ?? 3000);

// Listen on the network interface so phones on your Wi-Fi can reach the Pi.
app.listen(port, "0.0.0.0", () => {
  console.log(`SpotiSter server listening on port ${port}`);
});