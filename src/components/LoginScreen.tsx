import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handle(action: 'signIn' | 'signUp') {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) return

    setStatus('working')
    setErrorMessage('')

    const { error } =
      action === 'signIn'
        ? await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
        : await supabase.auth.signUp({ email: trimmedEmail, password })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('idle')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Lifestyle Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in, or create an account if you're on the invite list.
          </p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handle('signIn')}
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
        />

        <div className="flex gap-2">
          <button
            onClick={() => handle('signIn')}
            disabled={status === 'working' || !email.trim() || !password}
            className="flex-1 rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
          >
            {status === 'working' ? 'Working…' : 'Sign in'}
          </button>
          <button
            onClick={() => handle('signUp')}
            disabled={status === 'working' || !email.trim() || !password}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-400 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            Create account
          </button>
        </div>

        {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>
    </div>
  )
}
