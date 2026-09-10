import { useLocalStorage } from './hooks/useLocalStorage'
import { HabitsCard } from './components/HabitsCard'
import { HealthCard } from './components/HealthCard'
import { FinanceCard } from './components/FinanceCard'
import type { FinanceState, HealthLog, Habit } from './types'

const defaultHabits: Habit[] = [
  { id: 'water', name: 'Drink 8 glasses of water', streak: 0, doneToday: false },
  { id: 'read', name: 'Read for 20 minutes', streak: 0, doneToday: false },
]

const defaultHealth: HealthLog = {
  sleepHours: 7,
  waterGlasses: 0,
  steps: 0,
  workedOut: false,
}

const defaultFinance: FinanceState = {
  monthlyBudget: 2000,
  expenses: [],
}

function App() {
  const [habits, setHabits] = useLocalStorage('lifestyle:habits', defaultHabits)
  const [health, setHealth] = useLocalStorage('lifestyle:health', defaultHealth)
  const [finance, setFinance] = useLocalStorage('lifestyle:finance', defaultFinance)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Lifestyle Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
        </header>

        <main className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <HabitsCard habits={habits} onChange={setHabits} />
          <HealthCard log={health} onChange={setHealth} />
          <FinanceCard finance={finance} onChange={setFinance} />
        </main>

        <footer className="pt-4 text-center text-xs text-slate-400">
          Your data is stored locally in this browser.
        </footer>
      </div>
    </div>
  )
}

export default App
