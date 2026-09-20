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
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', userId)
    if (error) throw error
    await reload()
  }

  const MAX_AVATAR_BYTES = 5 * 1024 * 1024
  const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

  async function uploadAvatar(file: File) {
    // Fast client-side feedback only — the Storage bucket's own
    // file_size_limit/allowed_mime_types are the actual enforcement, since a
    // client can always be bypassed.
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      throw new Error('Please choose a PNG, JPEG, WebP, or GIF image.')
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error('Image must be under 5MB.')
    }

    const ext = file.name.split('.').pop() || 'png'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (uploadError) throw uploadError

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    // Cache-bust so the new image shows immediately instead of a stale cached copy at the same URL.
    const url = `${pub.publicUrl}?v=${Date.now()}`

    const { error: profileError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId)
    if (profileError) throw profileError
    await reload()
  }

  return { profile, reload, updateDisplayName, uploadAvatar }
}
