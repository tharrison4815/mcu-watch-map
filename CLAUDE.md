# MCU Watch Map: notes for Claude

An unofficial, spoiler-safe map of the MCU. The whole app is `index.html`: a single static page
with inline CSS and JS and no build step. It is published as a private claude.ai artifact, and
progress is saved in the browser's localStorage under the key `mcu-watch-map-v1`. The README
covers user-facing behaviour; this file records the rules and decisions behind it.

Status (24 Nov 2026): Phases 1 and 2 (12 films) done. No shows yet.

## Workflow

- Edit `index.html` in this repo, then republish it to the existing artifact with publish_files
  (the slug is in local memory) and commit. Push only when the user asks.
- Artifact page limits: no remote images or fetches (CSP), and no `alert` or `confirm`, so
  confirmations are built into the page (see Reset and "Mark all as seen"). Fonts come from Google Fonts.
- There is no JS runtime in the sandbox, so the page can't be tested here. Read changes carefully
  and tell the user it is untested.

## Data (arrays at the top of the script)

- `E` films: `id`, `p` (phase, defaults to 1), `t` (title), `n` (title split into node lines; keep
  lines short so they fit ~110-150px at 15px Barlow Condensed), `d` (release date), `rt` (minutes),
  `lane` (index into `LANES`), `so` (story-order position), `sy` (in-story year label), `syn`.
  `E` must stay in release order.
- `LANES` franchise rows `[name, colour]`. Rows are based on titles, so they never spoil.
- `L` links: `f` to `t`, `s` strength (3 essential, 2 helpful, 1 minor), optional
  `k: 'pc' | 'cameo'` when the link exists only because of a post-credits scene or cameo, and `n` (note).
- `C[id]` cast rows: `[name, role, heroName?, majorTwist?]`. Roles: Lead, Main, Supporting, Cameo,
  Post-credits. `name` is the character's stable id across films (real name, e.g. "Johann Schmidt"
  with hero name "Red Skull"). The hero name belongs to that appearance only.
- `so` values are consecutive integers. Adding Captain Marvel (set in 1995) or GotG Vol. 2 means
  renumbering, or switching to spaced values.
- All synopses, casts, roles and link notes were written from memory and still need checking
  against reliable sources.

## Spoiler rules (do not weaken these)

- Always visible: titles, release dates, running time, phase, in-story year.
- For an unseen film, each panel section (Story, Characters, Watch first, What follows) has its
  own reveal flap. Marking a film seen opens everything, except What follows links to unseen
  films, which stay behind a flap.
- A map line is drawn only if the target is seen, its "Watch first" is revealed, or the source's
  "What follows" is revealed (`linkVis`). The map must never show more than the panel does.
- Major twists (`C` row with flag 1, currently Bucky in The Winter Soldier and Trevor Slattery in
  Iron Man 3) stay hidden after a cast reveal, behind a second flap. Every unseen film shows that
  second flap, whether or not it has a twist, so the flap itself leaks nothing. The same applies
  to the tracer's twist flap.
- Hero names show only from appearances that are known (`label()`), in story order:
  "Sam Wilson (Falcon / Captain America)".
- A character path shows a "?" gap where any title between two known appearances is undetermined
  for that character (`det()`). It must not depend on whether the character is actually in it.
- Link notes and synopses must not leak twists from other films (the cap to tws note was
  rewritten for this reason).
- Prompts that say how many items are hidden were avoided on purpose; keep reveals count-free.

## Decisions already made with the user

- Names are shown as "Real Name (Hero Name)": not everyone has a hero name, and hero names change.
- No rule that treats lead roles in a character's own title as public. The user found it messy.
- Post-credits and cameo appearances or links can be turned off (header checkboxes). When on, they
  are marked with "Credits" or "Cameo" labels, pale dashed member boxes and thin dashed highlighter.
- Boxes have a background-coloured halo so lines visibly pass behind boxes they don't belong to.
- No official posters or portraits (copyright and likeness). Keep the unofficial-fan-project
  footer and use no Marvel logos.

## Open questions and to-do

- Check all data for accuracy.
- Map width: 12 columns already scroll sideways (~1370px). Before Phase 3, decide between a phase
  filter, zoom, or tighter columns.
- Possibly route character paths around boxes instead of behind them.
- Add shows (Disney+ and possibly Netflix/ABC); `meta` currently always says "Film".
