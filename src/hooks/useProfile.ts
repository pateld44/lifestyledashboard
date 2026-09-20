import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  async function updateDisplayName(name: string) {
    await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', userId)
    await reload()
  }

  async function uploadAvatar(file: File) {
    const ext = file.name.split('.').pop() || 'png'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (uploadError) throw uploadError

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    // Cache-bust so the new image shows immediately instead of a stale cached copy at the same URL.
    const url = `${pub.publicUrl}?v=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
    await reload()
  }

  return { profile, reload, updateDisplayName, uploadAvatar }
}
