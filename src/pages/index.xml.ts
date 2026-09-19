import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { podcast } from "../config/podcast";
import {
  episodeTitle,
  episodeUrl,
  incompleteReason,
  sortEpisodes,
  validateEpisodes,
  type Episode,
} from "../lib/episodes";

export const prerender = true;

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] ?? character,
  );
}

function explicitValue(value: boolean): string {
  return value ? "true" : "false";
}

function episodeItem(episode: Episode): string {
  const { data } = episode;
  const title = episodeTitle(episode);
  const url = episodeUrl(episode);

  return `
    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(data.description)}</description>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${escapeXml(data.guid)}</guid>
      <pubDate>${data.date!.toUTCString()}</pubDate>
      <enclosure url="${escapeXml(data.audio.url)}" length="${data.audio.size}" type="${escapeXml(data.audio.type)}" />
      <itunes:duration>${escapeXml(data.duration)}</itunes:duration>
      <itunes:episode>${data.number}</itunes:episode>
      <podcast:episode>${data.number}</podcast:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>${explicitValue(data.explicit)}</itunes:explicit>
    </item>`;
}

export const GET: APIRoute = async () => {
  const episodes = sortEpisodes(await getCollection("episodes"));
  validateEpisodes(episodes);

  const publishedEpisodes = episodes.filter(
    (episode) => episode.data.published,
  );
  const skippedEpisodes = episodes.filter((episode) => !episode.data.published);
  for (const episode of skippedEpisodes) {
    console.warn(
      `[RSS] Skipping unpublished ${episodeTitle(episode)}: ${incompleteReason(episode)}.`,
    );
  }

  const latestDate = publishedEpisodes[0]?.data.date;
  const homepageUrl = new URL("/", podcast.site).toString();
  const items = publishedEpisodes.map(episodeItem).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${escapeXml(homepageUrl)}</link>
    <description>${escapeXml(podcast.description)}</description>
    <language>${escapeXml(podcast.language)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${latestDate ? `<pubDate>${latestDate.toUTCString()}</pubDate>` : ""}
    <atom:link href="${escapeXml(podcast.feed)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(podcast.artwork)}</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>${escapeXml(homepageUrl)}</link>
    </image>
    <itunes:author>${escapeXml(podcast.author)}</itunes:author>
    <podcast:guid>${escapeXml(podcast.podcastGuid)}</podcast:guid>
    <podcast:medium>${escapeXml(podcast.medium)}</podcast:medium>
    <podcast:locked>no</podcast:locked>
    <itunes:image href="${escapeXml(podcast.artwork)}" />
    <itunes:explicit>${explicitValue(podcast.explicit)}</itunes:explicit>
    <itunes:type>${escapeXml(podcast.type)}</itunes:type>
    <itunes:category text="${escapeXml(podcast.category)}" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
