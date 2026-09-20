import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { todayStr } from '../lib/streak'
import type { Expense } from '../types'

function monthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function useFinance(userId: string) {
  const [monthlyBudget, setMonthlyBudgetState] = useState(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const month = monthKey()
    const [{ data: budgetRow }, { data: expenseRows }] = await Promise.all([
      supabase.from('budgets').select('monthly_budget').eq('user_id', userId).eq('month', month).maybeSingle(),
      supabase
        .from('expenses')
        .select('id, label, amount, category')
        .eq('user_id', userId)
        .gte('log_date', month)
        .order('created_at', { ascending: false }),
    ])
    setMonthlyBudgetState(budgetRow?.monthly_budget ?? 0)
    setExpenses(expenseRows ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  async function setBudget(amount: number) {
    setMonthlyBudgetState(amount)
    const { error } = await supabase
      .from('budgets')
      .upsert({ user_id: userId, month: monthKey(), monthly_budget: amount }, { onConflict: 'user_id,month' })
    if (error) throw error
  }

  async function addExpense(label: string, amount: number, category = 'general') {
    const trimmed = label.trim()
    if (!trimmed || !amount) return
    const { data, error } = await supabase
      .from('expenses')
      .insert({ user_id: userId, log_date: todayStr(), label: trimmed, amount, category })
      .select('id, label, amount, category')
      .single()
    if (error) throw error
    if (data) setExpenses((prev) => [data, ...prev])
  }

  async function removeExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) throw error
  }

  return { monthlyBudget, expenses, loading, setBudget, addExpense, removeExpense, reload }
}
