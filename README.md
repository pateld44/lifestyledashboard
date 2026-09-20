# Lifestyle Dashboard — PRD

**Status:** Phase 1 shipped. Phase 2 code written (accounts, dated history,
cross-user habit/vitals visibility, avatars, AI quick-entry) but **not yet
verified end-to-end** — no Supabase project is connected yet. See
[Setting up Supabase](#setting-up-supabase-required-before-phase-2-works)
before running the app.
**Owner:** pateld44
**Last updated:** 2026-09-19

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

Phase 1: single user (project owner). Phase 2 introduces a small, invite-only
group of users (see `allowed_emails`) who can see each other's habit streaks
and vitals for light accountability — still not a public or shared-household
product; budgets and expenses remain private to each individual.

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

## Phase 2 (planned): Accounts, widget framework & goal tracking

### Summary

Phase 2 moves the dashboard off single-browser `localStorage` onto a real backend
(Supabase: Postgres + Auth), so a signed-in user's data follows them across
devices, each day is kept as history instead of overwritten, the fixed three-panel
layout becomes an extensible widget framework, and a new goal-tracking widget lets
users define goals and log progress toward them — optionally assisted by their own
Claude API key so AI-powered widgets run on their own usage/billing, not the app
owner's.

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
      account and no one else's. *(magic-link auth via Supabase; code written,
      untested against a live project)*
- [x] Habits, vitals, and ledger data persists as dated history (not a single
      overwritten record) and follows the signed-in user across devices/browsers.
      *(code written, untested against a live project)*
- [x] Habit streaks are computed from actual day-over-day completion history,
      rather than a manual increment/decrement counter.
- [ ] User can add, remove, and reorder widgets on their dashboard. *(not yet
      built — the three original panels plus Community are still a fixed
      layout, not a generic widget framework)*
- [x] User can enter their own Anthropic API key in a settings screen; it is stored
      encrypted (Supabase Vault) and never displayed again after saving.
- [ ] User can define one or more goals with a target and log progress entries
      against each; the goal-tracking widget shows target vs. actual. *(not yet
      built)*
- [x] The "Daybook" artifact is explicitly unaffected — it keeps its current
      no-login, `localStorage`-only, anyone-with-the-link behavior.

**Added beyond the original Phase 2 scope, per a later request:**
- [x] A public landing page (`index.html`) separate from the app (`app.html`),
      explaining the problem/solution and including two illustrative user-story
      quotes.
- [x] Profile pictures, stored in Supabase Storage.
- [x] Cross-user visibility: any invited user can see other invited users'
      habit streaks and today's vitals (steps, workout) in a "Community" widget.
      Budgets and expenses are never shared — enforced at the RLS layer, not
      just hidden in the UI.
- [x] "Quick entry": a free-text box parses a plain-language daily check-in
      ("slept 7h, ran 5k, spent $12 on coffee") into habit completions, vitals,
      and expenses via the user's own Anthropic key, called server-side from an
      Edge Function.

### Scope

**In scope — Phase 2**
- Real accounts via Supabase Auth (sign up, log in, log out, session persistence).
- Supabase Postgres as the system of record for habits, vitals, and ledger data in
  the coded app, replacing `localStorage` as the source of truth (the artifact is
  unaffected — see Out of scope).
- Date-based history for all three existing panels, with streaks derived from real
  completion history instead of a manual counter.
- A public landing page (`index.html`) introducing the product, separate from
  the app itself (`app.html`).
- Profile pictures (Supabase Storage), editable from a Settings panel.
- Cross-user visibility for habits and vitals only (a "Community" widget) —
  budgets and expenses are never visible to other users, enforced via RLS.
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

**Community**
Any invited user can see the other invited users' habit streaks and today's
vitals (steps, workout status) in a dedicated widget — light, passive
accountability. Budgets and expenses are never included; this is enforced by
RLS policies on the database, not just left out of the UI.

**Profile pictures**
Users can upload a profile picture from Settings, stored in a public Supabase
Storage bucket scoped so only the owner can write to their own folder.

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

### Open questions

- ~~Auth method~~ — resolved: magic link (`supabase.auth.signInWithOtp`).
- ~~Where/how is the per-user Anthropic key encrypted at rest~~ — resolved:
  Supabase Vault (`vault.create_secret`/`update_secret`/`decrypted_secrets`),
  readable only by `service_role` via a dedicated Postgres function.
- Should widget layout (order/visibility) be stored per-user in Postgres, or is a
  local-only widget layout acceptable for now? — still open; no generic widget
  framework exists yet, so this doesn't apply until that's built.
- New: how much of another user's data should "connect with other users" show?
  Current answer — habit streaks and today's vitals only, never budgets or
  expenses. Revisit if this needs to be finer-grained (e.g., opt-out per habit).

## Beyond Phase 2 (later candidates)

- Live email connection (Gmail OAuth, and later Outlook) for automatic
  goal-evidence tallying — deferred from Phase 2's manual-entry goal-tracking
  widget.
- Trend charts over the dated history introduced in Phase 2 (streaks, sleep,
  spending over time).
- Reminders/notifications for unlogged habits or vitals.
- Multiple budget categories instead of one flat monthly total.

## Getting started (coded app)

```
npm install
npm run dev
```

This serves the landing page at `/` and the app at `/app.html`. The app
itself needs a connected Supabase project to do anything past the login
screen — see below.

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
3. **Apply the migrations.** In the dashboard's *SQL Editor*, run the contents
   of `supabase/migrations/20260913000001_auth_foundation.sql`, then
   `supabase/migrations/20260919000001_phase2_data_sharing_and_ai_key.sql`, in
   that order. (Or, once you've run `supabase login` and `supabase link
   --project-ref <your-ref>` locally, `supabase db push` applies both.)
4. **Add yourself to the allowlist.** This app is invite-only — signup fails
   for any email not in `allowed_emails`. In the SQL Editor:
   ```sql
   insert into allowed_emails (email) values ('you@example.com');
   ```
   Add each friend you want on the platform the same way.
5. **Deploy the Edge Function.** Quick-entry needs to run server-side (it's
   what keeps Anthropic keys out of the browser). With the Supabase CLI linked:
   ```
   supabase functions deploy quick-entry
   ```
   No extra secrets to set — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` are injected automatically for every Edge
   Function, and the Anthropic key itself is per-user (stored via Vault, not a
   platform-wide secret).
6. **Sign in.** `npm run dev`, open `/app.html`, enter your allowlisted email,
   and use the magic link sent to your inbox.
7. **(Optional) Add your Anthropic key.** In the app's Settings panel, to
   enable Quick Entry. Get one at [console.anthropic.com](https://console.anthropic.com).

## Links

- Artifact ("Daybook"): https://claude.ai/code/artifact/dd0e5337-1126-4eb9-b262-907c4d48341b
- Repo: https://github.com/pateld44/lifestyledashboard
