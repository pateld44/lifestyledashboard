import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { getErrorMessage } from '../lib/errors'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setSession(data.session)
        setLoading(false)
        return
      }

      // No visible login screen: every visitor becomes a unique anonymous
      // Supabase user automatically, so their data stays theirs across
      // reloads (same browser/session) without asking for credentials.
      const { data: anon, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError) {
        setError(getErrorMessage(anonError, 'Could not start a session.'))
        setLoading(false)
        return
      }
      setSession(anon.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { session, loading, error }
}
