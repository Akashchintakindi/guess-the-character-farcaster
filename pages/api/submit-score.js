import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { player_text = 'Anonymous', score = 0 } = req.body
  try {
    const { data, error } = await supabase.from('scores').insert([{ player_text, score }])
    if (error) throw error
    res.status(200).json({ ok: true, data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed' })
  }
}
