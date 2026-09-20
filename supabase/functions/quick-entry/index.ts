// Parses a free-text daily check-in ("slept 7h, ran 5k, spent $12 on coffee")
// into structured updates across habits, vitals, and expenses.
//
// Calls Anthropic using the *calling user's own* API key (decrypted
// server-side via `get_decrypted_anthropic_key`, service_role only — the key
// is never sent to or stored in the browser after the user first saves it in
// Settings). All database writes go through a Supabase client scoped to the
// caller's own JWT, so every write still passes through normal RLS.

import { createClient } from 'npm:@supabase/supabase-js@2'

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001' // fast/cheap — this is simple extraction, not reasoning

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

const EXTRACTION_TOOL = {
  name: 'record_daily_entry',
  description:
    "Structured extraction of habits completed, vitals logged, and expenses mentioned in a user's free-text daily check-in. Omit any field the user did not actually mention.",
  input_schema: {
    type: 'object',
    properties: {
      habitsCompleted: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of habits the user says they completed today, in their own words.',
      },
      vitals: {
        type: 'object',
        properties: {
          sleepHours: { type: 'number' },
          waterGlasses: { type: 'integer' },
          steps: { type: 'integer' },
          workedOut: { type: 'boolean' },
        },
      },
      expenses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            amount: { type: 'number' },
            category: { type: 'string' },
          },
          required: ['label', 'amount'],
        },
      },
    },
    required: ['habitsCompleted', 'vitals', 'expenses'],
  },
}

interface ParsedEntry {
  habitsCompleted: string[]
  vitals: { sleepHours?: number; waterGlasses?: number; steps?: number; workedOut?: boolean }
  expenses: { label: string; amount: number; category?: string }[]
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Scoped to the calling user — every query below respects their RLS policies.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) return json({ error: 'Invalid session' }, 401)
  const userId = userData.user.id

  let body: { text?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON body" }, 400)
  }
  const text = body.text?.trim()
  if (!text) return json({ error: "Missing 'text'" }, 400)

  // Service-role client used only to decrypt this user's own stored key.
  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: apiKey, error: keyError } = await adminClient.rpc('get_decrypted_anthropic_key', {
    target_user_id: userId,
  })
  if (keyError || !apiKey) {
    return json({ error: 'No Anthropic API key saved. Add one in Settings first.' }, 400)
  }

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: 'tool', name: 'record_daily_entry' },
      messages: [
        {
          role: 'user',
          content: `Extract structured data from this daily check-in. Only include fields the user actually mentioned; do not guess at anything unmentioned.\n\n"${text}"`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text()
    return json({ error: 'Anthropic API call failed', detail }, 502)
  }

  const anthropicJson = await anthropicRes.json()
  const toolUse = anthropicJson.content?.find((b: { type: string }) => b.type === 'tool_use')
  if (!toolUse) return json({ error: "Could not parse a structured entry from that text." }, 422)

  const parsed = toolUse.input as ParsedEntry
  const today = todayStr()

  const summary = {
    habitsMarked: [] as string[],
    habitsCreated: [] as string[],
    vitalsUpdated: false,
    expensesAdded: [] as string[],
  }

  // --- Habits: match an existing habit (case-insensitive substring) or create a new one ---
  if (parsed.habitsCompleted?.length) {
    const { data: existingHabits } = await userClient
      .from('habits')
      .select('id, name')
      .eq('user_id', userId)
      .is('archived_at', null)

    for (const mentioned of parsed.habitsCompleted) {
      const needle = mentioned.trim().toLowerCase()
      if (!needle) continue

      let habit = (existingHabits ?? []).find(
        (h) => h.name.toLowerCase().includes(needle) || needle.includes(h.name.toLowerCase()),
      )

      if (!habit) {
        const { data: created, error: createErr } = await userClient
          .from('habits')
          .insert({ user_id: userId, name: mentioned.trim() })
          .select('id, name')
          .single()
        if (createErr || !created) continue
        habit = created
        summary.habitsCreated.push(created.name)
      }

      await userClient
        .from('habit_logs')
        .upsert(
          { habit_id: habit.id, user_id: userId, log_date: today, done: true },
          { onConflict: 'habit_id,log_date' },
        )
      summary.habitsMarked.push(habit.name)
    }
  }

  // --- Vitals: partial upsert, only overwriting fields the user actually mentioned ---
  const v = parsed.vitals ?? {}
  if (v.sleepHours != null || v.waterGlasses != null || v.steps != null || v.workedOut != null) {
    const { data: existingVitals } = await userClient
      .from('vitals_logs')
      .select('sleep_hours, water_glasses, steps, worked_out')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle()

    await userClient.from('vitals_logs').upsert(
      {
        user_id: userId,
        log_date: today,
        sleep_hours: v.sleepHours ?? existingVitals?.sleep_hours ?? null,
        water_glasses: v.waterGlasses ?? existingVitals?.water_glasses ?? null,
        steps: v.steps ?? existingVitals?.steps ?? null,
        worked_out: v.workedOut ?? existingVitals?.worked_out ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' },
    )
    summary.vitalsUpdated = true
  }

  // --- Expenses: straightforward inserts ---
  if (parsed.expenses?.length) {
    const rows = parsed.expenses
      .filter((e) => e.label && typeof e.amount === 'number')
      .map((e) => ({
        user_id: userId,
        log_date: today,
        label: e.label.trim(),
        amount: e.amount,
        category: e.category?.trim() || 'general',
      }))
    if (rows.length) {
      await userClient.from('expenses').insert(rows)
      summary.expensesAdded = rows.map((r) => `${r.label} ($${r.amount})`)
    }
  }

  return json({ summary })
})
