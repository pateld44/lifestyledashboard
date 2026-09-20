import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getErrorMessage } from '../lib/errors'
import type { Profile } from '../hooks/useProfile'

export function SettingsPanel({
  profile,
  onUpdateDisplayName,
  onUploadAvatar,
  onClose,
}: {
  profile: Profile | null
  onUpdateDisplayName: (name: string) => Promise<void>
  onUploadAvatar: (file: File) => Promise<void>
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [nameError, setNameError] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [keyStatus, setKeyStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasKey, setHasKey] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.rpc('has_anthropic_key').then(({ data }) => setHasKey(!!data))
  }, [])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setAvatarError('')
    try {
      await onUploadAvatar(file)
    } catch (err) {
      setAvatarError(getErrorMessage(err, 'Could not upload that image.'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveKey() {
    const trimmed = anthropicKey.trim()
    if (!trimmed) return
    setKeyStatus('saving')
    const { error } = await supabase.rpc('set_my_anthropic_key', { new_key: trimmed })
    if (error) {
      setKeyStatus('error')
      return
    }
    setAnthropicKey('')
    setHasKey(true)
    setKeyStatus('saved')
  }

  async function clearKey() {
    await supabase.rpc('clear_my_anthropic_key')
    setHasKey(false)
    setKeyStatus('idle')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Profile picture
            </label>
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500 dark:bg-slate-800">
                  {(profile?.display_name || 'You')[0]?.toUpperCase()}
                </span>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:border-violet-400 disabled:opacity-50 dark:border-slate-700"
              >
                {uploading ? 'Uploading…' : 'Change photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            {avatarError && <p className="mt-2 text-xs text-red-500">{avatarError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                onClick={() => {
                  setNameError('')
                  onUpdateDisplayName(displayName).catch((err) =>
                    setNameError(getErrorMessage(err, 'Could not save display name.')),
                  )
                }}
                className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                Save
              </button>
            </div>
            {nameError && <p className="mt-2 text-xs text-red-500">{nameError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Anthropic API key {hasKey ? '(saved)' : ''}
            </label>
            <p className="mb-2 text-[11px] text-slate-400">
              Used only for Quick Entry parsing. Stored encrypted server-side; never shown again after saving.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                onClick={saveKey}
                disabled={keyStatus === 'saving'}
                className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {hasKey && (
              <button onClick={clearKey} className="mt-2 text-xs text-red-500 hover:underline">
                Remove saved key
              </button>
            )}
            {keyStatus === 'error' && <p className="mt-1 text-xs text-red-500">Couldn't save key.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
