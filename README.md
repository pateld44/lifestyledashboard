# Lifestyle Dashboard — PRD

**Status:** Phase 1 shipped, Phase 2 planned
**Owner:** pateld44
**Last updated:** 2026-09-09

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

Single user (project owner). Not designed for multi-user or shared household use in
this phase.

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

## Phase 2 (planned): Widgets & email-based goal tracking

### Summary

Phase 2 turns the dashboard from a fixed three-panel layout into an extensible
surface, and adds automated goal-vs-execution tracking by connecting the dashboard
to the user's email — so progress on stated goals can be checked against what
actually happened in the inbox, instead of relying only on manual entry.

### Goals

- Any panel becomes a **widget**: addable, removable, and reorderable without a
  redesign each time a new one is introduced.
- The user can define a **goal** (e.g., "apply to 5 jobs this week," "no more than 2
  takeout orders this month").
- The dashboard **connects to email**, reads relevant messages, and tallies evidence
  of execution against each goal automatically.
- A widget shows **goal vs. actual** at a glance, so the gap is visible without the
  user manually tracking it elsewhere.

### Features

**Widget framework**
- Common widget contract (title, accent color, render, persist) so new panels can be
  added without touching the rest of the layout.
- Users can add, remove, and reorder widgets from the dashboard itself.
- Phase 1's three panels (Habits, Vitals, Ledger) become the first widgets under this
  framework, unchanged in behavior.

**Email-connected goal tracking widget**
- User connects an email account (e.g., Gmail) to the dashboard.
- User defines one or more goals with a target (count, frequency, or amount).
- The dashboard automatically checks the connected inbox for messages matching each
  goal (confirmation emails, receipts, calendar invites, application confirmations,
  etc.) and counts them as evidence of execution.
- Widget displays each goal next to its actual tally (e.g., target 5 / actual 2) and
  the messages counted toward it.

### Technical considerations

This phase moves the project from fully client-side (Phase 1) to one that needs a
backend:
- OAuth with an email provider (e.g., Gmail API) requires a server or serverless
  function to hold tokens — this cannot be done securely from a static page alone.
- Matching rules and goal definitions need a real store, not `localStorage`.
- Email access should be scoped as narrowly as possible (read-only, ideally limited
  to specific labels/folders) to limit privacy exposure.
- The artifact ("Daybook") likely can't host this widget directly, since it has no
  backend and the Artifact sandbox blocks arbitrary outbound network calls; the
  artifact would show a manual-entry or read-only version of the same widget, while
  the coded app hosts the live email connection.

### Open questions

- Which email provider(s) first — Gmail only, or Gmail plus Outlook?
- How are goals defined — free-text with keyword matching, or structured rules per
  goal (sender, subject pattern, label)?
- Fully automatic matching, or does the user confirm/correct matches before they
  count, to avoid silent false positives?
- Where do OAuth tokens and goal data live — a small self-hosted backend, or a
  managed auth/database provider?

## Beyond Phase 2 (later candidates)

- Persist history across days (trends for streaks, sleep, spending over time).
- Cross-device sync of dashboard state itself (not just the email connection).
- Reminders/notifications for unlogged habits or vitals.
- Multiple budget categories instead of one flat monthly total.

## Getting started (coded app)

```
npm install
npm run dev
```

Type-check / production build:

```
npm run build
```

## Links

- Artifact ("Daybook"): https://claude.ai/code/artifact/dd0e5337-1126-4eb9-b262-907c4d48341b
- Repo: https://github.com/pateld44/lifestyledashboard
