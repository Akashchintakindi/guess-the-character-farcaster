import Head from 'next/head'
import { useEffect, useState } from 'react'
import characters from '../data/characters'

export default function Home() {
  const [round, setRound] = useState(0)
  const [current, setCurrent] = useState(null)
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => nextRound(), [])

  function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5) }

  function nextRound() {
    setRevealed(false)
    setSelected(null)
    const ch = characters[Math.floor(Math.random() * characters.length)]
    const others = shuffle(characters.filter(c => c.id !== ch.id)).slice(0, 3)
    const opts = shuffle([ch, ...others]).map(o => ({ id: o.id, label: o.name }))
    setCurrent(ch)
    setOptions(opts)
    setRound(prev => prev + 1)
  }

  async function handleChoose(optId) {
    if (revealed) return
    setSelected(optId)
    const correct = optId === current.id
    setRevealed(true)
    if (correct) setScore(s => s + 1)
  }

  async function submitScore(name) {
    try {
      await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_text: name, score })
      })
      fetchLeaderboard()
    } catch (err) { console.error(err) }
  }

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/get-leaderboard')
      const json = await res.json()
      if (json.ok) setLeaderboard(json.data)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="container">
      <Head>
        <title>Guess the Character</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={current?.src || '/characters/naruto.svg'} />
        <meta property="fc:frame:button:1" content="Play Now" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:post_url" content="/api/post-result" />
      </Head>

      <main>
        <h1>Guess the Character</h1>
        <p className="muted">Round {round} • Score {score}</p>

        <div className="card">
          {current ? (
            <div className={`image-wrap ${revealed ? 'revealed' : ''}`}>
              <img src={current.src} alt="character" className="character-img" />
            </div>
          ) : (
            <div className="image-wrap placeholder">Loading...</div>
          )}

          <div className="options">
            {options.map(opt => {
              const isCorrect = revealed && opt.id === current.id
              const isWrong = revealed && selected === opt.id && !isCorrect
              return (
                <button
                  key={opt.id}
                  className={`opt ${selected === opt.id ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                  onClick={() => handleChoose(opt.id)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <div className="actions">
            <button onClick={() => { setScore(0); nextRound() }} className="small">Restart</button>
            <button onClick={() => nextRound()} className="small">Next</button>
            <button
              className="small"
              onClick={() => {
                const text = `I scored ${score} in Guess the Character! Can you beat me?`;
                const shareUrl = `https://warpcast.com/intent/post?text=${encodeURIComponent(text)}`;
                window.open(shareUrl, '_blank')
              }}
            >Share</button>
          </div>

          {revealed && (
            <div className="reveal">
              {selected === current.id ? (
                <p>🎉 Correct! This is <strong>{current.name}</strong>.</p>
              ) : (
                <p>❌ Oops — it was <strong>{current.name}</strong>.</p>
              )}
            </div>
          )}
        </div>

        <div style={{marginTop:20}}>
          <h3>Leaderboard</h3>
          <button onClick={() => fetchLeaderboard()} className="small">Refresh</button>
          <ol>
            {leaderboard.map((r, i) => <li key={i}>{r.player_text} — {r.score}</li>)}
          </ol>
          <div style={{marginTop:8}}>
            <input id="playerName" placeholder="Your name" />
            <button onClick={() => { const el = document.getElementById('playerName'); submitScore(el.value || 'Anonymous') }} className="small">Submit Score</button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container { display:flex; min-height:100vh; align-items:center; justify-content:center; padding:24px; }
        main { width:100%; max-width:720px; }
        h1 { margin:0 0 4px 0; }
        .muted { color: #666; }
        .card { background: #fff; padding:20px; border-radius:12px; box-shadow:0 6px 24px rgba(0,0,0,0.08); }
        .image-wrap { width:100%; height:420px; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:8px; background:#f3f3f3; }
        .image-wrap.placeholder { color:#999 }
        img.character-img { width:100%; height:100%; object-fit:cover; filter: blur(12px) grayscale(0.1) contrast(0.9); transition: filter 400ms ease; }
        .image-wrap.revealed img.character-img { filter: none; }
        .options { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
        .opt { padding:12px; border-radius:8px; border:1px solid #eee; background:#fafafa; cursor:pointer; font-weight:600; }
        .opt.selected { outline: 2px solid #cbd5e1; }
        .opt.correct { background:#daf6e0; border-color:#b3e6b7 }
        .opt.wrong { background:#fde2e2; border-color:#f5bcbc }
        .actions { display:flex; gap:8px; margin-top:10px }
        .small { padding:8px 10px; border-radius:8px; background:#111; color:#fff; border:none; cursor:pointer }
        .reveal { margin-top:12px; padding:10px; border-radius:8px; background:#f9fafb; }
      `}</style>
    </div>
  )
}
