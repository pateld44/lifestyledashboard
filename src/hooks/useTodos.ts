import { useCallback, useEffect, useState } from 'react'
import type { TodoItem } from '../types'

const STORAGE_KEY = 'lifestyle-dashboard:todos'

function loadTodos(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TodoItem[]) : []
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(() => loadTodos())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // localStorage unavailable (private mode, quota) — todos just won't persist
    }
  }, [todos])

  const addTodo = useCallback((date: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), date, text: trimmed, done: false }])
  }, [])

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }, [])

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { todos, addTodo, toggleTodo, removeTodo }
}
