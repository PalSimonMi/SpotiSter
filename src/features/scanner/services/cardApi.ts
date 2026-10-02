import { ENV } from "../../../config/env";

interface CardDestination {
	provider: string;
	value: string;
}

export interface ResolvedCard {
	id: string;
	title: string;
	artist: string;
	destinations: CardDestination[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isDestination(value: unknown): value is CardDestination {
	return (
		isRecord(value) &&
		typeof value.provider === "string" &&
		typeof value.value === "string"
	);
}

async function fetchCard(path: string): Promise<ResolvedCard | null> {
	const baseUrl = ENV.CARD_API_URL.trim().replace(/\/+$/, "");
	if (!baseUrl) return null;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(`${baseUrl}${path}`, {
			signal: controller.signal,
		});

		if (response.status === 404) return null;
		if (!response.ok) {
			throw new Error(`Card lookup failed with status ${response.status}.`);
		}

		const body: unknown = await response.json();
		if (
			!isRecord(body) ||
			typeof body.id !== "string" ||
			typeof body.title !== "string" ||
			typeof body.artist !== "string"
		) {
			throw new Error("Card lookup returned an invalid response.");
		}

		return {
			id: body.id,
			title: body.title,
			artist: body.artist,
			destinations: Array.isArray(body.destinations)
				? body.destinations.filter(isDestination)
				: [],
		};
	} finally {
		clearTimeout(timeout);
	}
}

export function resolveCardById(cardId: string): Promise<ResolvedCard | null> {
	if (!/^[A-Za-z0-9_-]{1,128}$/.test(cardId)) {
		return Promise.resolve(null);
	}

	return fetchCard(`/api/cards/${encodeURIComponent(cardId)}`);
}

export function resolveSpotifyTrack(
	trackId: string
): Promise<ResolvedCard | null> {
	return fetchCard(
		`/api/resolve/spotify/${encodeURIComponent(trackId)}`
	);
}
