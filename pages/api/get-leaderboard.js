import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase.from('scores').select('player_text,score,created_at').order('score', { ascending: false }).limit(10)
    if (error) throw error
    res.status(200).json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get leaderboard' })
  }
}
