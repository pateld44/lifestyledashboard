# Lifestyle Dashboard — PRD

**Status:** Phase 1 shipped. Phase 2 shipped and verified end-to-end against
a live Supabase project (accounts, dated history, AI quick-entry) — widget
framework and goal tracking remain deferred within it. Phase 3 (Connections:
cross-user habit/vitals visibility, avatars) and Phase 4 (History & trends:
vitals line charts, spending-by-category donut chart) also shipped. Phase 5
(single-page Overview/Dashboard + public GitHub Pages deploy) and Phase 6
(open anonymous access, no login screen, per-user To-Do calendar) also
shipped — live at https://pateld44.github.io/lifestyledashboard/.
See [Setting up Supabase](#setting-up-supabase-required-before-phase-2-works)
to stand up your own instance.
**Owner:** pateld44
**Last updated:** 2026-09-20

## Summary

A single-user personal dashboard for tracking daily habits, basic health vitals, and
spending against a monthly budget. Phase 1 delivers one day's worth of state — no
history, accounts, or syncing — as a fast, private, always-available check-in tool.

## Problem

Habit trackers, health apps, and budgeting apps are usually three separate tools, each
with their own login, ads, or subscription. For someone who just wants a daily glance
at "did I do my habits, how did I sleep, how much have I spent this month," that's more
overhead than the task deserves.

## Goals

- One page shows today's habits, vitals, and spending — no navigation required.
- Data entry is fast enough for a genuine daily habit (a few taps/clicks).
- Works without an account, server, or internet connection after first load.
- Available in two forms: a real codebase (for ongoing development) and a
  shareable single-file version (for viewing on any device instantly).

## Success criteria (Phase 1)

- [x] User can add, complete, and remove habits, with a running streak count.
- [x] User can log sleep, water, steps, and workout status for the day.
- [x] User can set a monthly budget, log expenses, and see remaining balance.
- [x] State persists across page reloads (browser `localStorage`).
- [x] Coded app type-checks and builds with no errors.
- [x] Both deliverables (coded app + artifact) reflect the same feature set.

## Users

Phase 1: single user (project owner). Phase 2 introduces real accounts
(still effectively single-player — each user's data is their own). Phase 3
introduces a small, invite-only group of users (see `allowed_emails`) who
can see each other's habit streaks and vitals for light accountability —
still not a public or shared-household product; budgets and expenses remain
private to each individual.

## Scope

**In scope — Phase 1**
- Habit tracking: add/remove habits, daily complete toggle, streak counter.
- Vitals: sleep hours, water glasses, step count, workout yes/no.
- Finance: editable monthly budget, add/remove expenses, spent vs. remaining.
- Local persistence only (per-browser `localStorage`), no accounts.
- Two parallel deliverables:
  1. **Coded app** — Vite + React + TypeScript + Tailwind, versioned in this repo.
  2. **Artifact** — a standalone HTML file ("Daybook") published for instant,
     no-install viewing and light sharing.

**Out of scope — Phase 1**
- Historical data, trends, or charts across multiple days.
- Multiple users, accounts, authentication, or shared/synced data across devices.
- Notifications, reminders, or scheduled check-ins.
- Native mobile app.
- Server, database, or API of any kind — everything is client-side.

## Features

### Habits
Add a habit by name; check it off for the day; a streak counter increments on
completion and decrements if unchecked. Habits can be removed at any time.

### Vitals
Numeric log of sleep (hours), water (glasses), and steps, plus a workout toggle.
Steps are shown against a fixed daily goal (8,000) as a progress bar.

### Ledger (finance)
A monthly budget with a running list of expenses. A progress bar and caption show
amount spent vs. remaining, switching to a warning state once over budget.

## Technical approach

| | Coded app | Artifact |
|---|---|---|
| Stack | Vite, React, TypeScript, Tailwind CSS | Vanilla HTML/CSS/JS |
| Persistence | `localStorage` | `localStorage` |
| Distribution | GitHub repo, run locally (`npm run dev`) | Published Claude Artifact link |
| Purpose | Ongoing development, future features | Instant viewing/sharing, no install |

The two stay in sync manually: when a feature is added, it's implemented in the coded
app and the artifact is updated and re-exported into `artifact/daybook.html`.

## Constraints & assumptions

- No backend — all data lives in one browser's local storage, so it does not follow
  the user across devices or browsers.
- Clearing browser storage or opening a private window loses all data.
- Single day of state at a time; no date-based history is stored.

## Phase 2 (shipped, partially): Accounts, dated history & AI quick-entry

### Summary

Phase 2 moves the dashboard off single-browser `localStorage` onto a real backend
(Supabase: Postgres + Auth), so a signed-in user's data follows them across
devices and each day is kept as history instead of overwritten. It also ships
"quick entry" — a free-text box that uses the user's own Anthropic key to turn
a plain-language check-in into structured widget updates, so daily logging
needs less manual form-filling. The originally-planned generic widget
framework and goal-tracking widget are not built; see Deferred, below.

### Goals

- Users can create an account and sign in; their dashboard data follows them across
  browsers/devices instead of being tied to one browser's `localStorage`.
- Each day's habits, vitals, and spending is kept as its own record instead of being
  overwritten, so streaks can be computed from real history and trends become
  possible later.
- Any panel becomes a **widget**: addable, removable, and reorderable without a
  redesign each time a new one is introduced. Phase 1's three panels (Habits,
  Vitals, Ledger) become the first widgets under this framework, unchanged in
  behavior.
- Users can optionally provide their **own Anthropic API key** so AI-powered
  widgets (starting with goal tracking) run on their own usage and billing, never
  the app owner's.
- The user can define a **goal** (e.g., "apply to 5 jobs this week," "no more than 2
  takeout orders this month") and log progress toward it, with a widget showing
  **goal vs. actual** at a glance.

### Success criteria (Phase 2)

- [x] User can sign up, log in, and log out; dashboard data is scoped to their
      account and no one else's. *(email+password auth via Supabase; switched
      from magic-link after hitting Supabase's default email rate limit during
      testing — see Open Questions. Verified end-to-end against a live project.)*
- [x] Habits, vitals, and ledger data persists as dated history (not a single
      overwritten record) and follows the signed-in user across devices/browsers.
      *(verified live — this is also where a missing-`GRANT` bug was caught;
      see Technical considerations)*
- [x] Habit streaks are computed from actual day-over-day completion history,
      rather than a manual increment/decrement counter.
- [ ] User can add, remove, and reorder widgets on their dashboard. *(not yet
      built — the panels are still a fixed layout, not a generic widget
      framework; see Deferred, below)*
- [x] User can enter their own Anthropic API key in a settings screen; it is stored
      encrypted (Supabase Vault) and never displayed again after saving.
- [ ] User can define one or more goals with a target and log progress entries
      against each; the goal-tracking widget shows target vs. actual. *(not yet
      built)*
- [x] The "Daybook" artifact is explicitly unaffected — it keeps its current
      no-login, `localStorage`-only, anyone-with-the-link behavior.
- [x] "Quick entry": a free-text box parses a plain-language daily check-in
      ("slept 7h, ran 5k, spent $12 on coffee") into habit completions, vitals,
      and expenses via the user's own Anthropic key, called server-side from an
      Edge Function. Verified live.

**Added beyond the original Phase 2 scope, per a later request:**
- [x] A public landing page explaining the problem/solution and including two
      illustrative user-story quotes. *(Originally a separate `index.html` /
      `app.html` pair; later merged into a single page with "Overview" and
      "Dashboard" tabs — see Phase 5.)*

*(Cross-user visibility and profile pictures were also added beyond the
original Phase 2 scope, but are substantial enough to be their own phase —
see Phase 3, below.)*

### Scope

**In scope — Phase 2**
- Real accounts via Supabase Auth (sign up, log in, log out, session persistence).
- Supabase Postgres as the system of record for habits, vitals, and ledger data in
  the coded app, replacing `localStorage` as the source of truth (the artifact is
  unaffected — see Out of scope).
- Date-based history for all three existing panels, with streaks derived from real
  completion history instead of a manual counter.
- A public landing page introducing the product *(later merged with the app
  into a single tabbed page — see Phase 5)*.
- "Quick entry": free-text daily check-ins parsed into habits/vitals/expenses
  by Claude, using the user's own Anthropic key.
- User-managed Anthropic API key storage (encrypted at rest via Supabase Vault,
  write-only after save) for use by AI-assisted widgets.

**Deferred within Phase 2 (not built yet):**
- A generic widget framework (contract: title, accent color, render, persist)
  that would let users add/remove/reorder widgets. The current panels
  (Habits, Health, Finances, Community) are still a fixed layout.
- A goal-tracking widget with manual progress entry, optionally using the user's
  own Claude key to help categorize or summarize entries.

**Out of scope — Phase 2 (deferred to a later phase)**
- Live email account connection (e.g., Gmail OAuth) and automatic inbox parsing for
  goal evidence — the goal-tracking widget ships with manual entry only; the data
  model stays open (e.g., a `source` field) so this can be added later without a
  schema rewrite.
- Any backend changes to the "Daybook" artifact — it intentionally stays a
  standalone, no-login, `localStorage`-only file so it can keep being shared as
  "anyone with the link" without restricting access to signed-in users only.
- Notifications, reminders, or scheduled check-ins.
- Native mobile app.

### Features

**Accounts & history**
Users sign up and log in via Supabase Auth. Habits, vitals, and ledger entries are
stored per-user, per-day in Postgres instead of a single `localStorage` blob, so
history accumulates instead of being overwritten and data follows the user across
devices.

**Widget framework** *(deferred — not built)*
- Common widget contract (title, accent color, render, persist) so new panels can be
  added without touching the rest of the layout.
- Users can add, remove, and reorder widgets from the dashboard itself.
- Phase 1's three panels (Habits, Vitals, Ledger) become the first widgets under this
  framework, unchanged in behavior.

**Bring-your-own Claude key**
User enters their own Anthropic API key in a settings screen. The key is stored
encrypted server-side (Supabase Vault) and is never returned to the browser after
it's saved. The quick-entry Edge Function decrypts and uses each user's own key
server-side, so usage and billing are attributed to that user, not the app owner.

**Quick entry**
A free-text box ("slept 7h, ran 5k, spent $12 on coffee") is parsed by Claude into
structured updates: habit completions (matched to an existing habit, or a new one
created if none matches), a partial vitals update (only the fields mentioned), and
new expense rows. Runs entirely through the quick-entry Edge Function using the
user's own key; falls back to the manual widgets if no key is configured.

**Goal-tracking widget (manual entry)** *(deferred — not built)*
User defines one or more goals with a target (count, frequency, or amount) and logs
progress entries manually. The widget displays each goal next to its actual tally
(e.g., target 5 / actual 2). If the user has provided a Claude key, the widget may
use it to help categorize or summarize free-text progress entries. Live
email-connected auto-tallying is a later phase (see "Beyond Phase 2").

### Technical considerations

This phase moves the project from fully client-side (Phase 1) to one with a real
backend:
- Supabase (Postgres + Auth) is the chosen backend — hosted, minimal server code to
  maintain, and built-in row-level security for per-user data isolation.
- The Anthropic API key must never be sent to or stored in the browser after initial
  entry; it is held and used server-side (e.g. a Supabase Edge Function) to call the
  Anthropic API on the user's behalf.
- Goal definitions and progress entries need a real store (Postgres), not
  `localStorage`.
- The artifact ("Daybook") is explicitly excluded from this backend — it has no
  login and the Artifact sandbox blocks arbitrary outbound network calls, so it
  keeps its current standalone, shareable form.
- **Found during live setup:** enabling RLS and writing policies is not
  sufficient on its own — Postgres also requires an explicit `GRANT` of base
  table privileges to the `authenticated` role, or every operation fails with
  a flat "permission denied" before RLS is ever evaluated. Every Phase 2/3
  table hit this; fixed in
  `supabase/migrations/20260920000001_grant_authenticated_table_access.sql`.
  Worth remembering for any future table.

### Open questions

- ~~Auth method~~ — started with magic link (`signInWithOtp`), switched to
  email+password (`signInWithPassword`/`signUp`) after hitting Supabase's
  default email rate limit (a handful of emails/hour on a fresh project) during
  testing. Requires "Confirm email" disabled in Auth settings so `signUp`
  doesn't also try to send an email. Revisit if a custom SMTP provider gets
  configured later — magic link is arguably nicer UX once email isn't rate-limited.
- ~~Where/how is the per-user Anthropic key encrypted at rest~~ — resolved:
  Supabase Vault (`vault.create_secret`/`update_secret`/`decrypted_secrets`),
  readable only by `service_role` via a dedicated Postgres function.
- Should widget layout (order/visibility) be stored per-user in Postgres, or is a
  local-only widget layout acceptable for now? — still open; no generic widget
  framework exists yet, so this doesn't apply until that's built.

## Phase 3 (shipped): Connections

### Summary

Phase 3 turns the invite-only user base from a set of isolated single-user
dashboards into a small connected group. Any invited user can see how the
others are doing today — habit streaks, sleep, steps, workouts — for light,
passive accountability, and can put a face (a profile picture) to their name.
Budgets and expenses stay strictly private throughout: connection here means
encouragement, not financial transparency.

### Goals

- A user can see which other invited users exist and how they're doing today,
  without needing to ask them directly.
- Identity is legible in that view — a profile picture and display name, not
  just a list of anonymous streak counts.
- Privacy is structurally guaranteed: nothing about a person's spending is
  ever readable by anyone but themselves, enforced by the database itself,
  not just left out of the UI.

### Success criteria (Phase 3)

- [x] Any invited user can see every other invited user's current habit
      streaks and today's vitals in a Community widget.
- [x] A user can upload and change their own profile picture; it appears next
      to their name in the header, Settings, and the Community widget.
- [x] Budgets and expenses are provably inaccessible to other users —
      enforced via Postgres RLS policies scoped per-table, not
      application-layer filtering that a UI bug could bypass.
- [x] Verified end-to-end against a live Supabase project.

### Scope

**In scope — Phase 3**
- Cross-user visibility for habits and vitals only, via a dedicated
  "Community" widget (habit streaks, today's steps, workout status).
- Profile pictures: upload/change from Settings, stored in Supabase Storage,
  shown throughout the app.
- A `public_profiles` view exposing only the safe columns (`id`,
  `display_name`, `avatar_url`) to any authenticated user, while the base
  `profiles` table (which also holds the Anthropic key reference) stays
  locked to "own row only."

**Out of scope — Phase 3 (deferred to a later phase)**
- Any interaction between users beyond passive viewing — no comments,
  reactions, encouragement messages, or nudges.
- An opt-in connection model (friend requests, following) — every invited
  user currently sees every other invited user; there's no follow/block list.
- Any visibility into another user's finances, under any circumstance.
- Leaderboards, rankings, or gamification beyond the raw numbers shown today.

### Features

**Community**
Any invited user can see the other invited users' habit streaks and today's
vitals (steps, workout status) in a dedicated widget — light, passive
accountability. Budgets and expenses are never included; this is enforced by
RLS policies on the database, not just left out of the UI.

**Profile pictures**
Users can upload a profile picture from Settings, stored in a public Supabase
Storage bucket scoped so only the owner can write to their own folder, with
server-side file size/type limits as the authoritative check (client-side
validation is just fast feedback).

### Technical considerations

- Cross-user reads are enabled by a deliberately permissive `for select
  using (true)` RLS policy on `habits`, `habit_logs`, and `vitals_logs`
  only. `budgets` and `expenses` have no such policy, so there is no code
  path — buggy or otherwise — that can read another user's financial data.
- `profiles` itself stays locked to "own row only" (it holds
  `anthropic_key_secret_id`, which has no reason to be visible to anyone
  else); the `public_profiles` view exposes just the three columns the
  Community widget actually needs. This was tightened mid-build after
  initially taking the simpler-but-wrong path of opening up the whole
  `profiles` table.
- Avatar storage uses a public Supabase Storage bucket (`avatars`) with
  folder-scoped write policies (`(storage.foldername(name))[1] =
  auth.uid()::text`) so a user can only write inside their own folder, plus
  bucket-level `file_size_limit` (5MB) and `allowed_mime_types` as the real
  enforcement.

### Open questions

- How much of another user's data should be visible? Current answer: habit
  streaks and today's vitals only, never budgets or expenses. Revisit if
  this needs to be finer-grained (e.g., opting a specific habit out of
  sharing).
- Should connections eventually be opt-in (friend requests) instead of
  "every invited user sees every other invited user"? Fine for a small
  trusted circle today; worth revisiting if the allowlist grows.

## Phase 4 (shipped): History & trends

### Summary

Phase 2 stored habits, vitals, and expenses as real dated history from day
one, but nothing in the UI ever looked backward — the Health widget showed
only today, and Finance only the current month. Phase 4 adds a second tab
("History") with actual charts over that data: rolling 30-day trend lines
for sleep/steps/water, a workout-frequency stat, and a spending-by-category
donut chart for Finance.

### Goals

- A user can see how their vitals have trended over the last 30 days, not
  just today's snapshot.
- A user can see where their money actually goes by category, not just a
  single spent-vs-budget number.
- Charts follow a real design system (form chosen by the data's job, a
  validated colorblind-safe palette, consistent mark/label rules) rather than
  default library styling.

### Success criteria (Phase 4)

- [x] A "History" tab shows sleep, steps, and water as line charts over a
      rolling 30-day window, and workouts as a simple frequency stat.
- [x] A donut chart shows spending by category over the same window, with a
      legend and center total.
- [x] Manual expense entry now includes a category picker, so the donut
      chart has real data to show (previously every expense defaulted to
      "general").
- [x] The category palette is validated colorblind-safe (adjacent CVD +
      normal-vision floors) against both the light and dark chart surfaces,
      not eyeballed.

### Scope

**In scope — Phase 4**
- A second tab in the app (`Today` / `History`) — no new page/route.
- `TrendLineChart`: single-series line chart (sleep, steps, water), each its
  own small multiple; steps includes a reference line at the existing
  8,000-step goal.
- `CategoryDonutChart`: categorical donut chart with hover, a legend list,
  and a center total/selection readout.
- A fixed 7-category expense taxonomy (Food, Transport, Shopping, Bills,
  Entertainment, Health, Other) with a validated color per category, used by
  both the picker and the chart.

**Out of scope — Phase 4 (deferred to a later phase)**
- Habit completion history (a streak exists, but there's no visible
  day-by-day calendar/heatmap view yet).
- Custom date ranges — the window is a fixed rolling 30 days, no picker.
- Editing an expense's category after the fact, or re-categorizing
  quick-entry expenses (Claude's free-text category guess is stored as-is;
  if it doesn't match one of the 7 fixed keys, the chart falls back to the
  "Other" color and shows the raw text as the label).

### Technical considerations

- Charts are hand-rolled SVG (no charting library added) — the app's
  dependency footprint stays Vite/React/Tailwind/Supabase only.
- Followed the project's `dataviz` skill: form chosen per chart (line for
  change-over-time, donut for categorical share), color assigned last, and
  the category palette run through `validate_palette.js` against both
  `#fcfcfb` (light) and this app's actual `#020617` dark surface before use
  — not just the skill's generic reference surfaces.
- `useVitalsHistory` and `useExpenseHistory` are separate hooks from the
  live-dashboard `useVitals`/`useFinance` (different scope: rolling 30 days
  vs. today / current month) rather than overloading the existing hooks with
  a second mode.

### Open questions

- Should the 30-day window become user-configurable (7/30/90 days), or is a
  fixed window fine for how small the dataset realistically stays for a
  single user?
- Should quick-entry's Claude prompt be constrained to the 7 fixed category
  keys (via an enum in the tool schema) instead of free text, so every
  expense reliably lands in a real category slice instead of sometimes
  falling back to "Other"?

## Phase 5 (shipped): Single-page site + GitHub Pages

### Summary

The landing page (`index.html`) and the app (`app.html`) were previously two
separate multi-page-build entries, linked to each other by URL. Phase 5
merges them into one page with two tabs — "Overview" (why this matters, what
it does) and "Dashboard" (the actual app, session-gated behind Supabase
Auth) — and deploys that single page publicly via GitHub Pages.

### Success criteria (Phase 5)

- [x] The site opens on an "Overview" tab explaining the problem and what
      the product does, and a "Dashboard" tab with the real app, both on one
      page with no full navigation/reload between them.
- [x] The repo is public and deployed via GitHub Actions to GitHub Pages,
      live at https://pateld44.github.io/lifestyledashboard/.
- [x] The Pages build works from a `/lifestyledashboard/` subpath (asset URLs,
      the favicon, and in-page navigation all resolve correctly there), while
      local dev and any future root-domain host (Vercel/Netlify-style) still
      serve correctly from `/`.

### Technical considerations

- `vite.config.ts`'s `base` is conditional on a `GH_PAGES` build-time env var
  (`/lifestyledashboard/` when set, `/` otherwise) so Pages' subpath
  requirement doesn't leak into local dev or a future root-domain deploy.
- The old hand-written `<a href="/app.html">` links only worked because they
  were root-absolute on a root-domain deploy; they're gone now that
  Dashboard is a tab, not a separate page.
- `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are baked in at build time via
  GitHub Actions repo secrets (`Settings → Secrets and variables → Actions`);
  the anon key is safe to expose client-side by design (RLS enforces access),
  same as in local `.env.local`.
- Making the repo public was required — GitHub Pages isn't available for
  private repos on a Free plan. Checked history and `.gitignore` first to
  confirm no real Supabase/Anthropic keys were ever committed (`.env.local`
  matches the `*.local` gitignore pattern; only `.env.example` is tracked).

## Phase 6 (shipped): Open, anonymous access; per-user To-Do calendar

### Summary

Phase 6 removes the login screen. Every visitor is silently signed in as a
unique anonymous Supabase user on first load — no email/password, no invite
allowlist gate — while still getting a real per-user account (`auth.uid()`)
behind the scenes, so their habits/vitals/finance data stays theirs across
reloads on that browser exactly like a named account did. It also adds a
To-Do calendar widget backed by the same per-user Supabase model (replacing
an earlier `localStorage`-only version), and removes the Community widget,
since "every invited user sees every other invited user" doesn't make sense
once there's no curated invite list anymore — a stranger's habit streak
isn't useful information to another stranger.

### Success criteria (Phase 6)

- [x] Opening the "Dashboard" tab requires no email, password, or account
      creation step — a working session exists within moments of first load.
- [x] Each anonymous visitor's data (habits, vitals, finance, to-dos) is
      private to them and persists across reloads on the same browser,
      backed by a real Postgres row per user, not `localStorage`.
- [x] The invite allowlist (`allowed_emails`) no longer blocks signup —
      anonymous sign-ins are exempted at the trigger level.
- [x] The Community widget and its "visible to other invited users" copy are
      removed from the open-access UI.
- [x] A To-Do calendar widget: click a day, add/check/remove items for that
      date, backed by a new per-user `todos` table (RLS + grants, same
      pattern as habits/vitals/finance).
- [x] The calendar grid is a real `<table>` with `scope="col"` weekday
      headers, one tabbable cell (roving `tabindex`), arrow-key/Home/End/
      PageUp/PageDown navigation between dates, and an `aria-label` per cell
      announcing the full date and item count — not just a styled `<div>`
      grid of click targets.

### Scope

**In scope — Phase 6**
- Automatic anonymous sign-in (`supabase.auth.signInAnonymously()`) in place
  of the login screen; `LoginScreen` removed.
- `enforce_allowed_email()` trigger updated to allow any `is_anonymous` user
  through, regardless of the `allowed_emails` table.
- `todos` table: per-user, RLS-scoped, never shared with other users.
- To-Do calendar UI: month grid, day selection, add/check/remove items,
  full keyboard navigation and screen-reader labeling.
- Community widget removed from the rendered UI (component and its
  database policies are untouched/left in place, just unused).

**Out of scope — Phase 6 (deferred to a later phase)**
- A path to upgrade an anonymous session into a named account
  (`supabase.auth.updateUser` / account linking) so a visitor could
  optionally keep their data across devices/browsers.
- Automated daily email/text summaries of the day's to-dos — still needs a
  server-side scheduled job with access to the data; deferred from the
  original To-Do request for the same reason.
- Re-introducing any cross-visitor visibility now that there's no curated
  invite group.

### Technical considerations

- Anonymous Supabase users get a real JWT with `role: authenticated` and a
  real `auth.uid()`, identical to a named account for RLS/grant purposes —
  the existing `habits`/`vitals_logs`/`budgets`/`expenses` policies and
  grants needed zero changes. Only the allowlist trigger (which explicitly
  checked `new.email`) needed to special-case `is_anonymous` rows, since
  anonymous users have no email at all.
- An anonymous identity lives in that browser's Supabase session token
  (refreshed automatically, survives reloads) — it is not a `localStorage`
  hand-rolled identity like the Daybook artifact's. Clearing site data,
  using a private window, or switching browsers/devices produces a new,
  empty anonymous identity with no link back to the old one, since nothing
  connects them without a real credential.
- The To-Do calendar uses a real `<table>` (not `role="grid"` on `<div>`s)
  so screen readers get native row/column-header semantics for free, plus a
  roving-`tabindex` pattern (one focusable cell at a time, arrow keys move
  it) — the standard accessible date-grid pattern, rather than making every
  date individually Tab-stoppable.

### Open questions

- Should there be an explicit, opt-in way to convert an anonymous session
  into a permanent account later (so a visitor who wants cross-device sync
  can get it), reusing the `allowed_emails`/email-password flow that's still
  in the schema but currently has no UI path to reach it?
- Now that Community is unused, should its table/policies be dropped, or
  left in place in case a future "opt-in named accounts" mode wants it back?

## Beyond Phase 2/3/4 (later candidates)

- Live email connection (Gmail OAuth, and later Outlook) for automatic
  goal-evidence tallying — deferred from Phase 2's manual-entry goal-tracking
  widget.
- A habit completion heatmap/calendar (day-by-day history view, not just the
  aggregate streak count).
- Reminders/notifications for unlogged habits or vitals.
- Multiple budget categories instead of one flat monthly total.
- Reactions or light encouragement on another user's streak (Phase 3
  currently supports viewing only).
- An opt-in/friend-request connection model instead of "every invited user
  sees every other invited user."

## Getting started (coded app)

```
npm install
npm run dev
```

This serves the app at `/`, opening on the "Overview" tab. Switching to the
"Dashboard" tab needs a connected Supabase project to do anything past the
login screen — see below.

Type-check / production build:

```
npm run build
```

## Setting up Supabase (required before Phase 2 works)

No Supabase project is connected yet. Until one is, `npm run dev` will throw
on load (`supabaseClient.ts` requires `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY`). Steps to get a working project:

1. **Create the project.** Go to [supabase.com/dashboard](https://supabase.com/dashboard),
   sign in (GitHub sign-in is fine), and create a new project. Pick any name/region,
   set a database password (save it somewhere — it's for direct Postgres access,
   not app login), and wait ~2 minutes for provisioning.
2. **Get the frontend credentials.** In the project, go to
   *Project Settings → API*. Copy the **Project URL** and the **anon public**
   key into a new `.env.local` file (copy `.env.example` as a starting point).
   These are safe to expose in the browser.
3. **Apply the migrations, in order.** In the dashboard's *SQL Editor*, run
   the contents of each file in `supabase/migrations/`, oldest first:
   `20260913000001_auth_foundation.sql`,
   `20260919000001_phase2_data_sharing_and_ai_key.sql`,
   `20260920000001_grant_authenticated_table_access.sql` (without this one,
   every widget fails with "permission denied" — RLS policies alone aren't
   enough, see Phase 2's Technical considerations), then
   `20260921000001_phase6_anonymous_access_and_todos.sql`. Or, once you've run
   `supabase login` and `supabase link --project-ref <your-ref>` locally,
   `supabase db push` applies all four.
4. **Enable anonymous sign-ins.** *Authentication → Sign In / Providers →
   Anonymous* → turn this on. The app has no login screen — every visitor is
   silently signed in as a unique anonymous user (see Phase 6) — and without
   this toggle that call fails and the Dashboard tab shows an error instead
   of loading.
5. **(Optional) Invite named accounts too.** The invite-only allowlist from
   Phase 1/2 still exists in the schema (`allowed_emails`) for any future
   permanent, email-based signup flow, but nothing in the current UI creates
   one — every visitor today is anonymous. To add an email for later:
   ```sql
   insert into allowed_emails (email) values ('you@example.com');
   ```
6. **Deploy the Edge Function.** Quick-entry needs to run server-side (it's
   what keeps Anthropic keys out of the browser). Either with the CLI linked
   (`supabase functions deploy quick-entry`) or by pasting
   `supabase/functions/quick-entry/index.ts` into the dashboard's Edge
   Functions → Deploy a new function UI. No extra secrets to set —
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
   injected automatically for every Edge Function, and the Anthropic key
   itself is per-user (stored via Vault, not a platform-wide secret).
7. **Open the app.** `npm run dev`, switch to the "Dashboard" tab — no sign-in
   step, it loads straight in as a fresh anonymous user.
8. **(Optional) Add your Anthropic key.** In the app's Settings panel, to
   enable Quick Entry. Get one at [console.anthropic.com](https://console.anthropic.com).

## Links

- Live app: https://pateld44.github.io/lifestyledashboard/
- Artifact ("Daybook"/"Vantage"): https://claude.ai/code/artifact/dd0e5337-1126-4eb9-b262-907c4d48341b
- Repo: https://github.com/pateld44/lifestyledashboard
