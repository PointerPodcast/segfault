# Segfault

A Pointer Podcast archive for outtakes, off-air recordings, bonus conversations, mistakes, and everything that did not make the main cut.

Production site: <https://segfault.pointerpodcast.it>  
Podcast feed: <https://segfault.pointerpodcast.it/index.xml>

The site is a static Astro project. Audio is hosted separately in Cloudflare R2; **no MP3 files belong in this repository**.

## Local development

This project uses [Bun](https://bun.sh/):

```bash
bun install
bun run dev
bun run build
bun run preview
```

`bun run build` writes the deployable static site to `dist/`.

## Add an episode

1. Export an MP3 and upload it to the public R2 media bucket (see below).
2. Get the exact object size in bytes.
3. Add one Markdown file under `src/content/episodes/`, using a zero-padded filename such as `001.md`.
4. Fill in the metadata, then set `published: true` only when every RSS field is real and reachable.
5. Commit and push. The homepage, episode route, and `index.xml` are generated automatically.

Episode numbers are zero-based and titles are generated consistently as:

```text
Segfault[N]: <title>
```

The only confirmed episode currently in the repository is `Segfault[0]: Ci compri un mac studio`. Its supplied date, duration, audio, and related Pointer episode details are intentionally still blank; it remains visible on the site but is not emitted as an incomplete RSS item.

### Frontmatter

Copy this shape for a new episode and replace every placeholder with confirmed data. Do not invent a publication date, description, duration, audio size, or related Pointer episode.

```yaml
---
published: true
number: 1
title: "A real title"
slug: "a-real-title"
guid: "pointer-segfault-1"
date: 2026-01-01T12:00:00+01:00
description: "A real episode description."
duration: "12:34"
audio:
  url: "https://media.pointerpodcast.it/segfault-1.mp3"
  size: 12345678
  type: "audio/mpeg"
pointerEpisode:
  number: null
  title: ""
  url: ""
explicit: false
---
```

- `number`, `slug`, and `guid` must be unique. GUIDs are permanent: use `pointer-segfault-1`, `pointer-segfault-2`, and so on, and never derive them from titles or dates.
- `date` must be a valid ISO date/time. `duration` must be `MM:SS` or `HH:MM:SS`.
- `audio.url` must be an absolute HTTPS URL. `audio.type` is normally `audio/mpeg`.
- `audio.size` is the exact MP3 size in bytes and becomes RSS enclosure `length`.
- `pointerEpisode` is optional. If the related episode is not confirmed, leave its fields blank/null; the UI omits the relationship.
- A `published: true` entry fails the build if required RSS metadata is incomplete. An unpublished entry can remain visible for preparation and is skipped by the feed.

To read the exact byte size:

```bash
# Linux
stat -c%s segfault-1.mp3

# macOS
stat -f%z segfault-1.mp3
```

The content collection and Zod schema live in `src/content.config.ts`; shared production checks live in `src/lib/episodes.ts`.

## Cloudflare R2 audio

1. Create a private-origin R2 bucket and upload MP3 objects such as `segfault-0.mp3`.
2. In **R2 → bucket → Settings → Public access**, connect the custom domain `media.pointerpodcast.it` (or use the exact HTTPS media origin chosen for the episode metadata).
3. Keep the public custom-domain endpoint unauthenticated. Do not use signed URLs in podcast metadata.
4. Ensure the edge/object response preserves `Content-Type: audio/mpeg`, `Content-Length`, and supports `GET`, `HEAD`, and byte-range requests (`Range` / `206 Partial Content`). R2's public object delivery supports these; do not add a Worker unless testing proves it is necessary.
5. Set long-lived caching for immutable, versioned MP3 objects (for example `Cache-Control: public, max-age=31536000, immutable`). Never overwrite an already-published object with different audio; publish a new URL if the bytes change.
6. If browser playback is blocked by CORS, add an R2 CORS rule allowing `https://segfault.pointerpodcast.it` (and local development if needed) for `GET`, `HEAD`, and the `Range`, `Content-Type`, and `Origin` request headers.

Check an object before publishing:

```bash
curl -I https://media.pointerpodcast.it/segfault-1.mp3
curl -i -H 'Range: bytes=0-1' https://media.pointerpodcast.it/segfault-1.mp3
```

Use MP3 as the default delivery format: 44.1 or 48 kHz, normally 128–192 kbps, with `audio/mpeg`. Astro does not transcode audio during the build.

## Artwork

Replace `public/podcast-cover.jpg` with final square artwork without changing the RSS URL unless the filename is intentionally versioned. The placeholder is referenced as:

```text
https://segfault.pointerpodcast.it/podcast-cover.jpg
```

A broad, directory-friendly recommendation is a square RGB JPEG or PNG at 3,000×3,000 px, without transparency, kept within common directory upload limits (Apple accepts 1,400×1,400 through 3,000×3,000 px; check the current submission UI for any size limit). Apple also recommends 72 dpi and a correct `.jpg`/`.png` extension. Spotify and other directories likewise work best with square JPEG/PNG cover art; verify their current requirements when submitting because directory limits can change.

The RSS feed references artwork with an absolute HTTPS URL and includes both standard RSS `<image>` and `<itunes:image>` metadata.

## RSS and validation

The feed is generated from `src/config/podcast.ts` and the episode collection at:

<https://segfault.pointerpodcast.it/index.xml>

It includes the Podcast Namespace (`https://podcastindex.org/namespace/1.0`) with a
stable channel `podcast:guid`, `podcast:medium`, `podcast:locked`, and
`podcast:episode` metadata. Keep `podcastGuid` unchanged if the feed URL or hosting
provider changes; it is the show's permanent Podcasting 2.0 identity.

No RSS file is edited by hand. Before submitting or changing an episode, validate:

- XML parses as UTF-8 RSS 2.0.
- Every published item has a unique, permanent GUID, a valid RFC publication date, and a direct HTTPS enclosure.
- Enclosure `url`, `length` (exact bytes), and `type` are present and the media responds to `HEAD` and `Range` requests.
- Artwork, episode pages, and audio are publicly reachable over HTTPS.
- Titles and descriptions remain correctly XML-escaped.

Use [Apple Podcasts Connect](https://podcastsconnect.apple.com/), [Cast Feed Validator](https://castfeedvalidator.com/), and [Podbase Podcast Validator](https://podba.se/validate/) before submission. Apple also recommends testing the feed URL in the Podcasts app so artwork, streaming, and downloads can be checked.

## GitHub Pages

`.github/workflows/deploy.yml` uses Astro's `withastro/action@v6` to build with the committed `bun.lock`, then uploads and deploys `dist/` with GitHub Pages. It runs on pushes to `main` and can be started with `workflow_dispatch`.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the source. Enable Pages for the `github-pages` environment if GitHub requests it. `astro.config.ts` sets `site` to `https://segfault.pointerpodcast.it` and intentionally has no repository `base` because this is a custom-domain root site. `public/CNAME` contains `segfault.pointerpodcast.it`.

## DNS

In Cloudflare DNS:

- `segfault.pointerpodcast.it`: use the GitHub Pages custom-domain target shown by GitHub for the repository (typically the Pages `*.github.io` target), configure the custom domain in **Settings → Pages**, and keep HTTPS enforcement enabled after the certificate is issued.
- `media.pointerpodcast.it`: connect this hostname to the R2 bucket from **R2 → Settings → Custom Domains**. Do not point it at GitHub Pages; it is an independent public media origin.

If Cloudflare proxying is enabled, confirm that the media hostname still returns the correct `Content-Type`, `Content-Length`, `HEAD`, and `206` range behavior with the curl checks above.

## Project map

```text
src/content/episodes/   one Markdown file per episode
src/config/podcast.ts   show-level metadata and canonical URLs
src/pages/index.xml.ts  generated podcast RSS endpoint
public/podcast-cover.jpg replaceable show artwork
public/CNAME            GitHub Pages custom domain
.github/workflows/      deployment automation
```
