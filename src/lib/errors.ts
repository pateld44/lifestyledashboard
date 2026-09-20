/**
 * Supabase's error shapes (StorageError, PostgrestError, FunctionsError, ...)
 * don't all reliably extend the native Error class across versions, so
 * `instanceof Error` alone can miss a real `.message` and fall back to a
 * useless generic string. Check for a `.message` field structurally instead.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}
