# Contributing to MCU Watch Map

Thanks for helping. This is an unofficial fan project, and its whole point is to be
**spoiler-safe**, so most of this page is about keeping it that way.

## Reporting a problem

[Open an issue](https://github.com/tharrison4815/mcu-watch-map/issues/new/choose) and pick the
form that fits: wrong or missing information, a spoiler problem, or a bug. Issues are public, so
**describe where a spoiler is, not what it gives away**, and keep spoilers out of issue titles.

## Fixing the data yourself

All the data lives in plain text files in [`data/`](data/), in [TOML](https://toml.io), a simple
config format. You don't need to know it: copy the pattern of the entries around the one you're
changing.

| File | What's in it |
| --- | --- |
| `data/titles/phase-1.toml` … `phase-6.toml` | Every film, series season and special, in release order, each with its cast |
| `data/links.toml` | The "watch this first" links between titles |
| `data/rows.toml` | The franchise rows on the map |

Each file starts with a comment explaining its fields. A title looks like this (shortened):

```toml
[[title]]
id = "im3"
title = "Iron Man 3"
map_lines = ["Iron Man 3"]
type = "film"
released = 2013-05-03
runtime = 130
row = "Iron Man"
story_order = 70
story_year = "2012"
synopsis = """
Shaken by the Battle of New York, Tony Stark buries himself in building suits until a \
terrorist called the Mandarin strikes his home."""
cast = [
  { name = "Tony Stark", role = "Lead", hero = "Iron Man" },
  { name = "Trevor Slattery", role = "Main", hero = "The Mandarin", twist = true },
]
```

And a link:

```toml
[[link]]
from = "im"
to = "im2"
strength = "essential"   # essential, helpful or minor
note = "Direct sequel, picking up right after Tony tells the world he is Iron Man."
```

The quickest way to suggest a change is to open the file on GitHub, click the pencil icon, edit,
and propose the change. GitHub turns that into a pull request for you.

### Checking your change

Every pull request is checked automatically, and you'll get a preview link to try the map with
your change. To check on your own computer instead, install [Node.js](https://nodejs.org) 24 or
later, then:

```
npm install
npm run check    # checks the data and reports any problems
npm run build    # also writes the page to dist/index.html, which you can open in a browser
```

The check catches structural mistakes (a misspelt id, a link to a title that doesn't exist, a
title out of release order, a missing field). It can't catch a spoiler, so please read the rules
below.

## The spoiler rules

These matter more than anything else here. A pull request that breaks one won't be merged, even
if the information is correct.

**What's always visible:** titles, release dates, running times, phase and the in-story year.
Everything else about a title sits behind a reveal until you've seen it.

**Synopses** describe the premise only, as if you were deciding whether to watch it. No twists,
nothing from the second half, and for a sequel, nothing about how the earlier title ended.

**Link notes** can be read by someone who has seen only one of the two titles. So a note must
not spoil either title, or any other one. If a link can't be described without a spoiler, leave
it out: some links are missing on purpose for exactly that reason.

**Cast lists:**

- `name` is the character's stable id across every title (their real name, e.g. "Johann
  Schmidt", not "Red Skull"), so the character tracer can follow them. Spell it exactly as the
  other titles do.
- An alternate-universe version of a character is a different character, with its own name:
  "Peggy Carter, What If...?", "Karl Mordo, Earth-838".
- `hero` is the hero name in *that* title. Leave it out if it would give something away, even
  about another title.
- `twist = true` is for an appearance that is itself a spoiler: a surprise return, a hidden
  identity, a post-credits reveal. It stays hidden even after someone reveals the cast list.
  When in doubt, flag it.

**Upcoming titles** (`upcoming = true`) show only their title, type, row and expected date. We
don't add anything from news, trailers or casting announcements. Once a title is out, it gets
its full entry.

## What we don't accept

- Details for upcoming titles from news, trailers or leaks.
- Official posters, logos, photos or other artwork.
- Titles outside the MCU's numbered phases (for now, that includes the Netflix shows and
  X-Men '97).

## Code changes

The page itself is [`src/index.html`](src/index.html): plain HTML, CSS and JavaScript, no
framework. `build.ts` checks the data and inserts it into the page. For anything bigger than a
small fix, please open an issue first to talk it through.
