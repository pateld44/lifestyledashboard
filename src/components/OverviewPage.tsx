export function OverviewPage({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 text-slate-900 dark:text-slate-100">
      <header className="py-16 text-center sm:py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-500">Lifestyle Dashboard</p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          One page for today.
          <br />
          Not three apps.
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base text-slate-500 dark:text-slate-400">
          A single, fast, always-available check-in for the habits you're building, the vitals
          you're tracking, and the budget you're trying to stay under — no ads, no subscription,
          no separate logins.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenDashboard}
            className="rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Open the dashboard →
          </button>
          <a
            href="#why-it-matters"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-violet-400 dark:border-slate-700 dark:text-slate-200"
          >
            See why it matters
          </a>
        </div>
      </header>

      <section id="why-it-matters" className="border-t border-slate-200 py-12 dark:border-slate-800">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet-500">Why this matters</p>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Habit trackers, health apps, and budgeting apps shouldn't be three separate logins
        </h2>
        <p className="max-w-2xl text-slate-500 dark:text-slate-400">
          For someone who just wants a daily glance at "did I do my habits, how did I sleep, how
          much have I spent this month," juggling three apps is more overhead than the task
          deserves. This dashboard puts all three on one page.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <blockquote className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm italic text-slate-700 dark:text-slate-200">
              "I have a habit app, a health app, and a budgeting app — and I still don't know how
              my day actually went until I check all three."
            </p>
            <footer className="mt-3 text-xs text-slate-400">
              — user story: someone juggling three separate apps
            </footer>
          </blockquote>
          <blockquote className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm italic text-slate-700 dark:text-slate-200">
              "By the time I notice I'm over budget, it's the 25th and there's nothing left to do
              about it."
            </p>
            <footer className="mt-3 text-xs text-slate-400">
              — user story: everyone who's been surprised by a low-balance alert
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="border-t border-slate-200 py-12 dark:border-slate-800">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-violet-500">What it does</p>
        <ol className="flex flex-col gap-5">
          <li className="flex gap-4">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              1
            </span>
            <div>
              <h3 className="text-sm font-semibold">Check habits off, log vitals, add expenses</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Three widgets, one page, a few taps a day.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              2
            </span>
            <div>
              <h3 className="text-sm font-semibold">Or just type your day in plain language</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                "Slept 7 hours, ran 5k, spent $12 on coffee" — quick entry parses it into the
                right widgets for you, using your own Anthropic API key.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              3
            </span>
            <div>
              <h3 className="text-sm font-semibold">Streaks are computed from real history</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Every day is kept, not overwritten, so your streak is always honest.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              4
            </span>
            <div>
              <h3 className="text-sm font-semibold">See how the rest of the group is doing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Invited users can see each other's habit streaks and vitals for a little friendly
                accountability. Budgets and expenses are never shared.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="border-t border-slate-200 py-12 dark:border-slate-800">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-violet-500">What's inside</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Habits
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add, check off, and track real streaks day over day.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Health
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sleep, water, steps, and workouts at a glance.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Finances
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A monthly budget, running expenses, spent vs. remaining — private to you, always.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Community
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              See other invited users' streaks and vitals for light accountability.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-12 text-center dark:border-slate-800">
        <button
          onClick={onOpenDashboard}
          className="inline-block rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Open the dashboard →
        </button>
        <p className="mt-6 text-xs text-slate-400">
          Invite-only right now.{' '}
          <a href="https://github.com/pateld44/lifestyledashboard" className="underline hover:text-violet-500">
            Source &amp; full PRD on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
