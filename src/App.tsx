import { useState } from 'react'
import { useSession } from './hooks/useSession'
import { useHabits } from './hooks/useHabits'
import { useVitals } from './hooks/useVitals'
import { useFinance } from './hooks/useFinance'
import { useProfile } from './hooks/useProfile'
import { LoginScreen } from './components/LoginScreen'
import { HabitsCard } from './components/HabitsCard'
import { HealthCard } from './components/HealthCard'
import { FinanceCard } from './components/FinanceCard'
import { CommunityCard } from './components/CommunityCard'
import { QuickEntry } from './components/QuickEntry'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryView } from './components/HistoryView'
import { TodoCalendar } from './components/TodoCalendar'
import { supabase } from './lib/supabaseClient'
import { getErrorMessage } from './lib/errors'

const TAB_LABELS = { today: 'Today', todo: 'To-Do', history: 'History' } as const

function Dashboard({ userId }: { userId: string }) {
  const [showSettings, setShowSettings] = useState(false)
  const [actionError, setActionError] = useState('')
  const [tab, setTab] = useState<'today' | 'todo' | 'history'>('today')
  const { habits, addHabit, removeHabit, toggleHabit, reload: reloadHabits } = useHabits(userId)
  const { vitals, setVitals, reload: reloadVitals } = useVitals(userId)
  const { monthlyBudget, expenses, setBudget, addExpense, removeExpense, reload: reloadFinance } =
    useFinance(userId)
  const { profile, updateDisplayName, uploadAvatar } = useProfile(userId)

  // Wraps a fire-and-forget action so a thrown Supabase error shows up as a
  // visible banner instead of silently doing nothing (or logging an unhandled
  // rejection no one sees).
  function wrap<A extends unknown[]>(fn: (...args: A) => Promise<void>) {
    return async (...args: A) => {
      try {
        await fn(...args)
        setActionError('')
      } catch (err) {
        setActionError(getErrorMessage(err, 'Something went wrong saving that.'))
      }
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  async function refreshAllAfterQuickEntry() {
    await Promise.all([reloadHabits(), reloadVitals(), reloadFinance()])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <a href="/" className="text-xs text-slate-400 hover:text-violet-500">
              &larr; About
            </a>
            <h1 className="text-2xl font-semibold tracking-tight">Lifestyle Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-violet-500 dark:text-slate-400"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">
                  {(profile?.display_name || 'You')[0]?.toUpperCase()}
                </span>
              )}
              Settings
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Sign out
            </button>
          </div>
        </header>

        <nav className="flex gap-1 self-start rounded-full border border-slate-200 p-1 dark:border-slate-800">
          {(['today', 'todo', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tab === t
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>

        {actionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {actionError}
          </div>
        )}

        {tab === 'today' ? (
          <>
            <QuickEntry onApplied={refreshAllAfterQuickEntry} />

            <main className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <HabitsCard
                habits={habits}
                onToggle={wrap(toggleHabit)}
                onAdd={wrap(addHabit)}
                onRemove={wrap(removeHabit)}
              />
              <HealthCard log={vitals} onChange={wrap(setVitals)} />
              <FinanceCard
                monthlyBudget={monthlyBudget}
                expenses={expenses}
                onBudgetChange={wrap(setBudget)}
                onAddExpense={wrap(addExpense)}
                onRemoveExpense={wrap(removeExpense)}
              />
            </main>

            <CommunityCard currentUserId={userId} />

            <footer className="pt-4 text-center text-xs text-slate-400">
              Habits and vitals are visible to other invited users. Your budget and expenses stay private.
            </footer>
          </>
        ) : tab === 'todo' ? (
          <TodoCalendar />
        ) : (
          <HistoryView userId={userId} />
        )}
      </div>

      {showSettings && (
        <SettingsPanel
          profile={profile}
          onUpdateDisplayName={updateDisplayName}
          onUploadAvatar={uploadAvatar}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

function App() {
  const { session, loading } = useSession()

  if (loading) return null
  if (!session) return <LoginScreen />

  return <Dashboard userId={session.user.id} />
}

export default App
