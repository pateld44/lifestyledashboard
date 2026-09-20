import { useState } from 'react'
import { Card } from './Card'
import { EXPENSE_CATEGORIES, categoryLabel } from '../lib/categories'
import type { Expense } from '../types'

export function FinanceCard({
  monthlyBudget,
  expenses,
  onBudgetChange,
  onAddExpense,
  onRemoveExpense,
}: {
  monthlyBudget: number
  expenses: Expense[]
  onBudgetChange: (amount: number) => void
  onAddExpense: (label: string, amount: number, category: string) => void
  onRemoveExpense: (id: string) => void
}) {
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].key)

  const spent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = monthlyBudget - spent
  const pct = monthlyBudget > 0 ? Math.min(100, (spent / monthlyBudget) * 100) : 0

  function handleAdd() {
    const value = Number(amount)
    if (!label.trim() || !value) return
    onAddExpense(label.trim(), value, category)
    setLabel('')
    setAmount('')
  }

  return (
    <Card title="Finances" accent="bg-amber-500">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Monthly budget</span>
        <input
          type="number"
          value={monthlyBudget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-24 rounded-md border border-slate-200 bg-transparent px-2 py-1 text-right outline-none focus:border-amber-400 dark:border-slate-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${remaining < 0 ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ${spent.toFixed(2)} spent · $
          {remaining.toFixed(2)} {remaining < 0 ? 'over' : 'left'}
        </p>
      </div>

      <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
        {expenses.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-1.5 text-sm dark:border-slate-800"
          >
            <span className="text-slate-700 dark:text-slate-200">
              {e.label} <span className="text-xs text-slate-400">· {categoryLabel(e.category)}</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                ${e.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onRemoveExpense(e.id)}
                aria-label={`Remove ${e.label}`}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
        {expenses.length === 0 && (
          <p className="text-sm text-slate-400">No expenses logged yet.</p>
        )}
      </ul>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Expense"
            maxLength={200}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            type="number"
            placeholder="$"
            className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
          >
            Add
          </button>
        </div>
      </div>
    </Card>
  )
}
