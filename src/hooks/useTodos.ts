import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TodoItem } from '../types'

export function useTodos(userId: string) {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('todos')
      .select('id, log_date, text, done')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    setTodos((data ?? []).map((t) => ({ id: t.id, date: t.log_date, text: t.text, done: t.done })))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  async function addTodo(date: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const { error } = await supabase.from('todos').insert({ user_id: userId, log_date: date, text: trimmed })
    if (error) throw error
    await reload()
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const { error } = await supabase.from('todos').update({ done: !todo.done }).eq('id', id)
    if (error) throw error
    await reload()
  }

  async function removeTodo(id: string) {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  return { todos, loading, addTodo, toggleTodo, removeTodo, reload }
}
