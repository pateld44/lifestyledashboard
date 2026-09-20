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
import { supabase } from './lib/supabaseClient'

function Dashboard({ userId }: { userId: string }) {
  const [showSettings, setShowSettings] = useState(false)
  const { habits, addHabit, removeHabit, toggleHabit, reload: reloadHabits } = useHabits(userId)
  const { vitals, setVitals, reload: reloadVitals } = useVitals(userId)
  const { monthlyBudget, expenses, setBudget, addExpense, removeExpense, reload: reloadFinance } =
    useFinance(userId)
  const { profile, updateDisplayName, uploadAvatar } = useProfile(userId)

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

        <QuickEntry onApplied={refreshAllAfterQuickEntry} />

        <main className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <HabitsCard habits={habits} onToggle={toggleHabit} onAdd={addHabit} onRemove={removeHabit} />
          <HealthCard log={vitals} onChange={setVitals} />
          <FinanceCard
            monthlyBudget={monthlyBudget}
            expenses={expenses}
            onBudgetChange={setBudget}
            onAddExpense={addExpense}
            onRemoveExpense={removeExpense}
          />
        </main>

        <CommunityCard currentUserId={userId} />

        <footer className="pt-4 text-center text-xs text-slate-400">
          Habits and vitals are visible to other invited users. Your budget and expenses stay private.
        </footer>
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
