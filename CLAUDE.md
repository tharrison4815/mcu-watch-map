# MCU Watch Map: notes for Claude

An unofficial, spoiler-safe map of the MCU. The whole app is `index.html`: a single static page
with inline CSS and JS and no build step. It is published as a private claude.ai artifact, and
progress is saved in the browser's localStorage under the key `mcu-watch-map-v1`. The README
covers user-facing behaviour; this file records the rules and decisions behind it.

Status (24 Nov 2026): Phases 1 to 3 (23 films, Iron Man to Far From Home) done. No shows yet.

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
- `so` values are spaced (multiples of 10, with 15 and 105 slotted in), so a new title can take an
  unused number between its neighbours without renumbering. Only the order matters.
- `sy` for Endgame is '2018' (where it opens), not '2023', so the always-visible year doesn't give
  away its time jump. Far From Home shows '2024'.
- All synopses, casts, roles and link notes were written from memory and still need checking
  against reliable sources.

## Spoiler rules (do not weaken these)

- Always visible: titles, release dates, running time, phase, in-story year.
- For an unseen film, each panel section (Story, Characters, Watch first, What follows) has its
  own reveal flap. Marking a film seen opens everything, except What follows links to unseen
  films, which stay behind a flap.
- A map line is drawn only if the target is seen, its "Watch first" is revealed, or the source's
  "What follows" is revealed (`linkVis`). The map must never show more than the panel does.
- Major twists (`C` row with flag 1: Bucky in The Winter Soldier, Trevor Slattery in Iron Man 3,
  Red Skull in Infinity War, Wendy Lawson in Captain Marvel, the post-credits characters in Far From
  Home, and in Endgame everyone who returns or appears from the past) stay hidden after a cast reveal, behind a second flap. Every unseen film shows that
  second flap, whether or not it has a twist, so the flap itself leaks nothing. The same applies
  to the tracer's twist flap.
- Hero names show only from appearances that are known (`label()`), in story order:
  "Sam Wilson (Falcon / Captain America)".
- A character path shows a "?" gap where any title between two known appearances is undetermined
  for that character (`det()`). It must not depend on whether the character is actually in it.
- Link notes, synopses and cast hero names must not leak twists from other films (the cap to tws
  note was rewritten for this reason; Bucky has no hero name in Civil War or Infinity War because
  "Winter Soldier" would give away The Winter Soldier's twist; Sam is "Falcon" in Endgame). Sequel
  synopses describe the premise without saying how the previous film ended.
- No Captain Marvel to Far From Home link: any note on it would hint at Far From Home's
  post-credits twist.
- Prompts that say how many items are hidden were avoided on purpose; keep reveals count-free.

## Decisions already made with the user

- Names are shown as "Real Name (Hero Name)": not everyone has a hero name, and hero names change.
- No rule that treats lead roles in a character's own title as public. The user found it messy.
- Post-credits and cameo appearances or links can be turned off (header checkboxes). When on, they
  are marked with "Credits" or "Cameo" labels, pale dashed member boxes and thin dashed highlighter.
- Boxes have a background-coloured halo so lines visibly pass behind boxes they don't belong to.
- Map width is handled by a phase filter (Phase 1/2/3 toggles, `S.hp` holds hidden phases; at
  least one phase stays on). Hidden phases drop their columns, rows with no shown titles collapse,
  and links or path segments to hidden titles aren't drawn. Panels still list them, and following
  a link to a hidden title turns its phase back on. With all phases on the map still scrolls
  sideways (~2600px).
- No official posters or portraits (copyright and likeness). Keep the unofficial-fan-project
  footer and use no Marvel logos.

## Open questions and to-do

- Check all data for accuracy.
- Possibly route character paths around boxes instead of behind them.
- Add shows (Disney+ and possibly Netflix/ABC); `meta` currently always says "Film".
