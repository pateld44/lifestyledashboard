// Fixed categorical order — validated colorblind-safe (adjacent CVD + normal-vision
// floors) against both light (#fcfcfb) and dark (#020617) chart surfaces via
// dataviz's palette validator. Never reorder without re-validating: the order
// itself is part of the CVD-safety mechanism, not cosmetic.
export interface ExpenseCategory {
  key: string
  label: string
  light: string
  dark: string
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: 'food', label: 'Food', light: '#f97316', dark: '#ea580c' },
  { key: 'transport', label: 'Transport', light: '#3b82f6', dark: '#3b82f6' },
  { key: 'shopping', label: 'Shopping', light: '#14b8a6', dark: '#0d9488' },
  { key: 'bills', label: 'Bills', light: '#f43f5e', dark: '#f43f5e' },
  { key: 'entertainment', label: 'Entertainment', light: '#8b5cf6', dark: '#8b5cf6' },
  { key: 'health', label: 'Health', light: '#84cc16', dark: '#65a30d' },
  { key: 'general', label: 'Other', light: '#d946ef', dark: '#d946ef' },
]

const FALLBACK = EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]

export function categoryColor(key: string, isDark: boolean): string {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === key) ?? FALLBACK
  return isDark ? cat.dark : cat.light
}

export function categoryLabel(key: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.label ?? key
}
