import type { CollectionEntry } from "astro:content";
import { podcast } from "../config/podcast";

export type Episode = CollectionEntry<"episodes">;

export function episodeTitle(episode: Episode): string {
  return `Segfault[${episode.data.number}]: ${episode.data.title}`;
}

export function episodeUrl(episode: Episode): string {
  return new URL(`/episodes/${episode.data.slug}/`, podcast.site).toString();
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function sortEpisodes(episodes: Episode[]): Episode[] {
  return [...episodes].sort((a, b) => {
    const dateA = a.data.date?.getTime() ?? Number.NEGATIVE_INFINITY;
    const dateB = b.data.date?.getTime() ?? Number.NEGATIVE_INFINITY;
    return dateB - dateA || b.data.number - a.data.number;
  });
}

export function validateEpisodes(episodes: Episode[]): void {
  const fields = [
    ["number", (episode: Episode) => episode.data.number.toString()],
    ["slug", (episode: Episode) => episode.data.slug],
    ["GUID", (episode: Episode) => episode.data.guid],
  ] as const;

  for (const [field, valueFor] of fields) {
    const seen = new Map<string, string>();
    for (const episode of episodes) {
      const value = valueFor(episode);
      const previous = seen.get(value);
      if (previous) {
        throw new Error(
          `Duplicate episode ${field} "${value}" in ${previous} and ${episode.id}.`,
        );
      }
      seen.set(value, episode.id);
    }
  }

  for (const episode of episodes) {
    if (!episode.data.published) continue;
    validatePublishedEpisode(episode);
  }
}

export function validatePublishedEpisode(episode: Episode): void {
  const { data } = episode;
  const label = episodeTitle(episode);
  const problems: string[] = [];

  if (!data.date || Number.isNaN(data.date.getTime())) problems.push("date");
  if (!data.description.trim()) problems.push("description");
  if (!data.duration || !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(data.duration)) {
    problems.push("duration (MM:SS or HH:MM:SS)");
  }
  if (!isHttpsUrl(data.audio.url))
    problems.push("audio.url (absolute HTTPS URL)");
  if (!data.audio.size || data.audio.size <= 0)
    problems.push("audio.size (exact bytes)");
  if (!data.audio.type) problems.push("audio.type");

  if (problems.length) {
    throw new Error(
      `${label} cannot be published; fix: ${problems.join(", ")}.`,
    );
  }
}

export function incompleteReason(episode: Episode): string {
  const { data } = episode;
  const missing: string[] = [];
  if (!data.date) missing.push("publication date");
  if (!data.duration) missing.push("duration");
  if (!data.audio.url) missing.push("audio URL");
  if (!data.audio.size) missing.push("exact audio size");
  return missing.join(", ") || "publication metadata";
}
