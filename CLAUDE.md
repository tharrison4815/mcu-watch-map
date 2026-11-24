# MCU Watch Map: notes for Claude

An unofficial, spoiler-safe map of the MCU. The app is one static page, `src/index.html` (inline
CSS and JS, no framework), with its data kept in TOML files in `data/`. `build.ts` validates the
data and inserts it into the page, writing `dist/`. Progress is saved in the browser's
localStorage under the key `mcu-watch-map-v1`. The README covers user-facing behaviour,
CONTRIBUTING.md is the guide for outside contributors (keep its spoiler rules in step with the
ones below), and this file records the rules and decisions behind it all.

Status (24 Nov 2026): Phases 1 to 6 done up to VisionQuest: 38 films, 22 series, 3 specials and the
2 seasons of I Am Groot shorts, plus 5 upcoming Phase 6 titles (Avengers: Doomsday, Your Friendly
Neighborhood Spider-Man S2, Daredevil: Born Again S3, Marvel Zombies: The Winter Soldier, Avengers:
Secret Wars). Left out on purpose: X-Men '97, which Marvel releases
alongside the phases but not as part of them. The Phase 5 list follows Wikipedia's Phase Five
article; Eyes of Wakanda and Marvel Zombies are not in it.

## Workflow

- The repo (github.com/tharrison4815/mcu-watch-map) is public, so people can open issues (forms in
  .github/ISSUE_TEMPLATE: data, spoiler, bug) and send pull requests for data fixes. Review every
  outside PR against the spoiler rules: the build can't catch a spoiler in a sentence.
- Node runs on the host, not in Claude's sandbox: Node (Homebrew) is at
  /home/linuxbrew/.linuxbrew/bin. Run through `flatpak-spawn --host --directory=<repo> env
  PATH=/home/linuxbrew/.linuxbrew/bin:/usr/bin:/bin npm run build` (or `npm run check`). Scratch files
  for host commands must live under the repo or home, since the host can't see the sandbox's /tmp.
- `npm run check` validates the data and syntax-checks the page's scripts; `npm run build` also
  writes `dist/` (index.html with the data, fonts, _headers). `dist/` and node_modules are
  gitignored. The build still can't run the page, so behaviour changes remain untested in a
  browser: tell the user.
- Edit `src/index.html` or the data, build, then republish `dist/` to the artifact with
  publish_files (the slug is in local memory): `as: index.html` from `dist/index.html`, plus
  `fonts/*.woff2` only if the fonts change (never `_headers` or the OFL files). Then commit.
- Environments: the claude.ai artifact is the test (non-production) copy and the Cloudflare site is
  production. Publish changes to the artifact first for the user to try; push only when they ask.
- Public site: https://mcu-watch-map-4ui.pages.dev/ on Cloudflare Pages (free plan), connected to
  the GitHub repo: every push to `main` runs `npm run build` and deploys `dist/` (Node version from
  `.node-version`). So a push is a public release. Pull requests get preview deploys, and the
  GitHub Action in .github/workflows/check.yml runs `npm run check` on them.
- Cloudflare Web Analytics (cookie-free) is switched on in the Pages project, which injects its
  beacon script on the live site. `_headers` allows static.cloudflareinsights.com (script) and
  cloudflareinsights.com (connect) for it; nothing else external is allowed.
- Artifact page limits: no remote images or fetches (CSP), and no `alert` or `confirm`, so
  confirmations are built into the page (see Reset and "Mark all as seen").
- Fonts are self-hosted in src/fonts (no Google requests, for privacy), declared in an inline
  @font-face block: Anton 400, Barlow 400/600, Barlow Condensed 500/600/700. They are subset with
  fonttools' pyftsubset to ASCII plus a few characters (U+00A0, é, ’, –, —, …) to halve their size.
  If page text gains other non-ASCII characters, re-subset from the full fonts (or those characters
  fall back to a system font). OFL licences sit beside them.
- `src/_headers` (Cloudflare Pages / Netlify format) sets a CSP, security headers and a long cache
  for fonts.

## Data

The TOML files are what people edit; each starts with a field guide. The build turns them into the
compact shapes the page's code uses, inserted at the `/*@E*/null`-style markers:

- `data/titles/phase-N.toml` (phase comes from the file name, entries in release order) becomes
  `E`: `id`, `up` (upcoming), `dm` (month_only), `an` (animated), `p` (phase), `ty` (type: film,
  show, special, shorts), `ep` (episodes), `t` (title), `n` (map_lines: up to 3 short lines, which
  fit ~110-150px at 15px Barlow Condensed), `d` (released), `rt` (runtime), `lane` (row, as an index
  into `LANES`), `so` (story_order), `sy` (story_year), `syn` (synopsis). The build sorts all
  titles by release date; upcoming titles get `so` 9001+ and `sy` 'Upcoming' automatically.
  Shows are tracked one entry per season ("Loki (Season 1)", id `loki1`); a new season is a new
  entry, normally in the same row.
- Each title's `cast` becomes `C[id]` rows `[name, role, hero?, twist?]`. Roles: Lead, Main,
  Supporting, Cameo, Post-credits. `name` is the character's stable id across titles (real name,
  e.g. "Johann Schmidt" with hero "Red Skull"). The hero name belongs to that appearance only.
- `data/rows.toml` becomes `LANES` `[name, colour]`. Rows are based on titles, so they never spoil.
- `data/links.toml` becomes `L`: `f` to `t` (from, to), `s` strength (3 essential, 2 helpful,
  1 minor), optional `k: 'pc' | 'cameo'` (only = post-credits or cameo) when the link exists only
  because of a post-credits scene or cameo, and `n` (note).
- A character id means one instance of that character. Alternate-universe versions get their own
  id, "Name, <where they're from>" (e.g. "Peggy Carter, What If...?", "Karl Mordo, Earth-838"), so
  the tracer never joins them to the main one. Time travel to an earlier point in the same person's
  life keeps the same id (Endgame's 2012 Loki and 2014 Gamora, and Loki in Loki season 1).
- story_order values are spaced (multiples of 10, with 15 and 105 slotted in), so a new title can
  take an unused number between its neighbours without renumbering. Only the order matters.
- story_year for Endgame is '2018' (where it opens), not '2023', so the always-visible year doesn't
  give away its time jump. Far From Home shows '2024'.
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
- More hero names left off to avoid cross-title leaks: Bucky in The Falcon and the Winter Soldier,
  John Walker ("Captain America" would give away Endgame), Xu Wenwu ("The Mandarin" touches the
  Iron Man 3 twist), Shuri in Wakanda Forever, Layla in Moon Knight. What If...? casts are
  alternate versions with their own ids (see Data), and only uncontroversial hero names are given.
- Upcoming titles (`up:1`) show only title, phase, type and expected date: no synopsis, cast, links
  or story position (they sort last, `so` 9001+, `sy` 'Upcoming'). This was the user's choice: no
  details from news or trailers. They are drawn as faint dotted boxes with a "Coming" tag, cannot be
  selected, and are left out of the seen list, search, tracer and spoiler flaps (`real()`). Once the
  date passes, the tag says "Out now" until the title is filled in: then remove `up`, give it a
  proper `so`, `sy`, synopsis, cast and links, and add it to `C`.
- Phase 6 data comes from the post-release Wikipedia articles (plot and cast sections), except
  Fantastic Four: First Steps (from memory). Marvel Zombies' plot past episode 1 was only seen in a
  summary, so its entry describes only the setup and flags no twists.
- Phase 6 choices: Jean Grey in Brand New Day is twist-flagged (her identity is the film's
  mystery). Jocasta, Virgil Horton and the credits scenes (Wanda, Doom) in VisionQuest are flagged,
  as are Doom in Fantastic Four's credits, Luke Cage in Born Again S2, and the last Black Panther and
  Killmonger in Eyes of Wakanda. Wonder Man's Trevor link comes from Shang-Chi, not Iron Man 3, since
  Trevor in Iron Man 3 is a twist. Eyes of Wakanda is in the Black Panther row, VisionQuest in the
  WandaVision row. Fantastic Four characters are the Earth-828 ones (no other versions on the map
  except Johnny Storm, the Void).
- Phase 5 choices: Sam is "Captain America" in Brave New World (the title's own premise, so
  unavoidable). Agatha All Along has its own row, not WandaVision's, because Agatha is a WandaVision
  twist. Teen in Agatha All Along is listed as Billy Maximoff, twist-flagged. Kang, Victor Timely
  and He Who Remains are separate ids (different variants). No Hawkeye to Thunderbolts* link (Yelena).
  Your Friendly Neighborhood Spider-Man is set in another universe, so its versions of existing
  characters get their own ids.
- No Black Widow to Hawkeye link, for the same reason as the one below (Yelena in Hawkeye is a
  twist).
- No Captain Marvel to Far From Home link: any note on it would hint at Far From Home's
  post-credits twist.
- Character search (tracer) only filters the chips already listed, matching their visible text
  (`label()`), so it can never find an unknown character or a hero name that isn't unlocked yet.
  Its "no match" message must not differ for characters that exist but are hidden. Title search
  is free to search everything, since titles are always public.
- Prompts that say how many items are hidden were avoided on purpose; keep reveals count-free.

## Decisions already made with the user

- Names are shown as "Real Name (Hero Name)": not everyone has a hero name, and hero names change.
- No rule that treats lead roles in a character's own title as public. The user found it messy.
- Animated titles (What If...?, Your Friendly Neighborhood Spider-Man, I Am Groot) are hidden unless
  the Animated checkbox is ticked (`S.anim`, off by default). Most viewers treat them as skippable.
  Off means out of scope for the map, links and watch-first chains, the map's character path and
  "?" gaps, seen list, mark-all and mark-before (`inS`, `ordS`). Opening one from search or a
  panel link turns the setting on.
- Search ignores the map filters (user's choice): title search covers every released title, and
  the tracer's character list and appearance list cover all released titles (`allS`, `apps(ch,1)`)
  whatever the phase, Animated or linked-only settings. Appearances not on the map get a tag
  ("Animated hidden", "Phase hidden", "Hidden on map"). The spoiler rules still decide which
  characters are listed.
- Selecting the selected title again deselects it.
- "Safe to watch next" (`ready()`, right column): unseen titles in scope (`ordS`) whose whole
  watch-first chain (`anc`, the same one the panel lists, so it follows the Paths shown checkboxes)
  is seen, in the map's order. First one is tagged "Next"; it shows 6 until "Show all" (`S.rx`), and
  each has a "Seen it" button. Phase filter is ignored (tag "Hidden on map"). Known, accepted leak:
  a title missing from the list tells you some link into it comes from a title you haven't seen.
  Opt-in "Put titles that nothing follows yet last" (`S.de`, off by default) splits the list into
  titles with a "What follows" link (by `linkOn`) and a "Nothing follows yet" group, so people can
  prioritise what leads somewhere as of current releases. It is a spoiler hint (says whether a
  story continues), hence opt-in with a note. Not called "skippable": many recent titles only look
  like dead ends because upcoming titles have no links; revisit after Secret Wars.
- Watch-status filter in Titles shown: "Seen", "Safe to watch", "Not safe yet" (`S.st` holds the
  hidden ones, keys s / r / n; at least one stays ticked). Each title is in exactly one group
  (`stOf`); upcoming titles count as "Not safe yet". "Not seen" was avoided as a label because safe
  titles are unseen too. `RD` (the safe set) is computed once per render. The selected title always
  stays on the map.
- Header controls are grouped: "Titles shown" (phases, Animated) decides which titles are on the
  map; "Paths shown" (Helpful, Minor, Post-credits, Cameos) decides which lines are drawn. Keep new
  controls in the right group.
- "Linked to selected only" (`S.rel`, in Titles shown) narrows the map to the selected title and
  the titles joined to it by a drawn line (`linkVis`), direct links only, so it never shows more than
  the map would. While it is on the phase filter is ignored (buttons dimmed); Animated and the path
  checkboxes still apply. Titles linked to the selection get a red ring.
- Helpful and minor links can be turned off with header checkboxes (`S.hlp`, `S.mnr`; essential
  links always show). These replaced an All / Helpful / Essential dropdown.
- Post-credits and cameo appearances or links can be turned off (header checkboxes). When on, they
  are marked with "Credits" or "Cameo" labels, pale dashed member boxes and thin dashed highlighter.
- Boxes have a background-coloured halo so lines visibly pass behind boxes they don't belong to.
- Rows: every franchise has its own row by default. The Rows dialog lets you untick franchises
  (`S.off`, keyed by lane name), and unticked ones share an "Other" row at the bottom, keeping their
  colour stripe. FATWS sits in the Captain America row and She-Hulk in the Hulk row (title-based).
- Series and specials get a "TV" or "Special" tag on their map box; the panel shows the episode
  count for series.
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
- Phase 5 onwards. Possibly the Netflix/ABC shows (not decided).
