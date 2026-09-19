# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with TypeScript, Astro Content Collections, plain CSS, Bun, and static GitHub Pages deployment.

## Users

Existing Pointer Podcast listeners looking for outtakes and bonus material, plus curious newcomers who should understand the project without prior context.

## Product Purpose

Segfault is Pointer Podcast's static side-quest for publishing outtakes, off-air recordings, bonus conversations, mistakes, and other extra material. Success means a visitor can quickly understand the project, listen in the browser, follow episode links, or subscribe through a standards-compatible RSS feed.

## Positioning

A deliberately small, nerdy archive of the material that falls outside the main Pointer Podcast episodes: the useful, funny, and accidental parts of the process.

## Operating Context

Episodes are published by uploading MP3 audio to Cloudflare R2, adding one content file to the repository, and pushing to GitHub. GitHub Actions rebuilds the static site and feed; no database or backend is part of the workflow.

## Capabilities and Constraints

- The public site is `https://segfault.pointerpodcast.it`.
- The site has a homepage, episode pages, a `Chi siamo` page, and an RSS feed at `/index.xml`.
- Episode names use the exact zero-based `Segfault[N]: <title>` convention.
- The initial real content is only `Segfault[0]: Ci compri un mac studio`.
- Audio stays outside Git in Cloudflare R2, preferably at `https://media.pointerpodcast.it`.
- The site is static, fast, responsive, accessible, and uses native HTML audio with no eager downloads.
- Episode metadata must preserve stable GUIDs and complete RSS enclosure data before an episode is marked published.
- Missing facts such as the initial episode's date, duration, audio URL, byte size, and related Pointer episode must not be fabricated.

## Brand Commitments

The name is Segfault and it belongs to Pointer Podcast. The visual voice is dark, readable, terminal-inspired, playful, slightly weird, and restrained. Do not call it Pointer Club and do not use `club.pointerpodcast.it`.

## Evidence on Hand

The only confirmed production episode is `Segfault[0]: Ci compri un mac studio`. No publication date, duration, description, audio location/size, or related Pointer Podcast episode details were supplied; the repository must keep those fields explicitly configurable rather than inventing them.

## Product Principles

- Make listening and subscribing immediate.
- Keep the publishing workflow to upload, add metadata, and push.
- Prefer native web platform features and static output.
- Preserve facts and stable identifiers; never invent episode metadata.
- Keep the archive small enough to understand and maintain at a glance.

## Accessibility & Inclusion

Use semantic HTML, a clear heading hierarchy, readable contrast, visible keyboard focus, accessible navigation, responsive layout, and native audio controls.
