import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function sendMagicLink() {
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('sending')
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOtp({ email: trimmed })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Lifestyle Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in with a magic link sent to your email.
          </p>
        </div>

        {status === 'sent' ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Check {email} for a sign-in link.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
              placeholder="you@example.com"
              autoComplete="email"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              onClick={sendMagicLink}
              disabled={status === 'sending' || !email.trim()}
              className="rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
