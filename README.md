# MCU Watch Map

An unofficial, spoiler-safe map of the Marvel Cinematic Universe. Pick a film to see what leads
into it and what follows, mark what you've seen, and trace a character's path through the
films. Not affiliated with Marvel Studios or Disney.

Currently covers Phases 1 to 4: 30 films, the 8 Phase 4 Disney+ series (one entry per season) and
2 specials. The Phase buttons in the header choose which phases the map shows, and the Rows dialog
chooses which franchises get their own row. It is a single static page: open `index.html` in a
browser. Progress is stored in the browser's localStorage.

## How spoilers are handled

- Titles, release dates and running times are always visible.
- For any film you haven't marked as seen, its story, cast, "watch first" and "what follows"
  sections each sit behind their own reveal flap.
- Links on the map only appear once you've seen the target film or revealed the link.
- Cast appearances flagged as a major twist stay hidden behind a second flap, even after the cast
  list is revealed. Every unseen film shows that flap, so its presence gives nothing away.
- Character paths show a "?" gap wherever an unseen title sits between two known appearances.
- Hero names are attached to each appearance and only show once that appearance is known.
- Post-credits scenes and cameos can be left off the map with the header checkboxes.

## Data

All data lives in arrays near the top of the script in `index.html`:

- `E`: films, series and specials (id, type, title, release date, phase, story order, franchise row, synopsis)
- `L`: links between films (strength 1 to 3, optional `k: 'pc' | 'cameo'`, note)
- `C`: cast per film as `[name, role, hero name, major twist flag]`

The synopses, casts and link notes were written from memory and still need checking.
