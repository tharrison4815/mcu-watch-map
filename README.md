# MCU Watch Map

An unofficial, spoiler-safe map of the Marvel Cinematic Universe. Pick a title to see what leads
into it and what follows, mark what you've seen, see what's safe to watch next, and trace a
character's path through the films and series. Not affiliated with Marvel Studios or Disney.

**Use it at https://mcu-watch-map-4ui.pages.dev/**

It covers Phases 1 to 6 up to VisionQuest (autumn 2026): 38 films, 22 Disney+ series (one entry
per season), 3 specials and the I Am Groot shorts. Announced titles that aren't out yet appear as
greyed-out "Coming" boxes with no details. Your progress is saved in your browser only.

## How spoilers are handled

- Titles, release dates, running times and in-story years are always visible.
- For anything you haven't marked as seen, its story, cast, "watch first" and "what follows"
  sections each sit behind their own reveal.
- Links on the map only appear once you've seen the title or revealed the link.
- Cast appearances that are a major twist stay hidden behind a second reveal, even after the cast
  list is shown. Every unseen title has that second reveal, so its presence gives nothing away.
- Character paths show a "?" gap wherever an unseen title sits between two known appearances, and
  hero names only show once the appearance is known.

## Spotted a mistake?

[Report it](https://github.com/tharrison4815/mcu-watch-map/issues/new/choose), or fix it yourself:
all the data is in plain text files in [`data/`](data/), and [CONTRIBUTING.md](CONTRIBUTING.md)
explains how, including the spoiler rules every change must follow. The synopses, casts and link
notes are still being checked against reliable sources, so corrections are very welcome.

## How it's built

The page is a single HTML file, [`src/index.html`](src/index.html), with no framework. `build.ts`
checks the data in `data/` and inserts it into the page:

```
npm install
npm run check   # validate the data
npm run build   # write the site to dist/
```

Requires Node.js 24 or later. The site is hosted on Cloudflare Pages and deploys on every push to
`main`.

Fonts: Anton and Barlow, under the SIL Open Font License (see `src/fonts/`).
