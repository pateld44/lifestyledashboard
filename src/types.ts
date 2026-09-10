export interface Habit {
  id: string
  name: string
  streak: number
  doneToday: boolean
}

export interface HealthLog {
  sleepHours: number
  waterGlasses: number
  steps: number
  workedOut: boolean
}

export interface Expense {
  id: string
  label: string
  amount: number
  category: string
}

export interface FinanceState {
  monthlyBudget: number
  expenses: Expense[]
}
