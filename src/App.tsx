import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type SyntheticEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  COUNTER_START,
  DEDICATORIA,
  FINAL,
  FP_HINT,
  FP_MESSAGES,
  FP_SUBTITLE,
  FP_SUCCESS,
  FP_WELCOME,
  HERO,
  LETTER,
  TIMELINE,
} from './content'
import musicaFondo from './music/una-noche.mp3'
import PhotoGallery from './PhotoGallery'
import './App.css'

const HOLD_MS = 2600
const PETAL_COUNT = 22

type Counter = { days: number; hours: string; mins: string; secs: string }

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function calcCounter(startMs: number): Counter {
  let diff = Math.abs(Date.now() - startMs)
  const days = Math.floor(diff / 86400000)
  diff -= days * 86400000
  const hrs = Math.floor(diff / 3600000)
  diff -= hrs * 3600000
  const mins = Math.floor(diff / 60000)
  diff -= mins * 60000
  const secs = Math.floor(diff / 1000)
  return { days, hours: pad(hrs), mins: pad(mins), secs: pad(secs) }
}

function Ornament() {
  return (
    <div className="ornament-rule">
      <span className="line" />
      <span className="dot" />
      <span className="line" />
    </div>
  )
}

function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [gateHidden, setGateHidden] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [fpSuccess, setFpSuccess] = useState(false)
  const [fpHint, setFpHint] = useState<string>(FP_HINT)
  const [dashOffset, setDashOffset] = useState(1000)
  const [counter, setCounter] = useState(() =>
    calcCounter(new Date(`${COUNTER_START}T00:00:00`).getTime()),
  )
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [volumeVisible, setVolumeVisible] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [letterOpen, setLetterOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const pressingRef = useRef(false)
  const startTsRef = useRef(0)
  const rafRef = useRef(0)
  const doneRef = useRef(false)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const scanAudioRef = useRef<HTMLAudioElement | null>(null)
  const failAudioRef = useRef<HTMLAudioElement | null>(null)
  const completeAudioRef = useRef<HTMLAudioElement | null>(null)
  const volumeHideRef = useRef(0)
  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const confettiFiredRef = useRef(false)
  const petals = useRef(
    Array.from({ length: PETAL_COUNT }, () => {
      const dur = 14 + Math.random() * 18
      return {
        left: `${Math.random() * 100}vw`,
        duration: `${dur}s`,
        delay: `${-Math.random() * dur}s`,
        scale: 0.5 + Math.random() * 1.4,
        opacity: (0.4 + Math.random() * 0.4).toFixed(2),
      }
    }),
  ).current

  useEffect(() => {
    document.body.classList.add('is-locked')
    scanAudioRef.current = new Audio('/assets/scan.m4a')
    scanAudioRef.current.loop = true
    scanAudioRef.current.preload = 'auto'
    failAudioRef.current = new Audio('/assets/fail.m4a')
    failAudioRef.current.preload = 'auto'
    completeAudioRef.current = new Audio('/assets/complete.m4a')
    completeAudioRef.current.preload = 'auto'
    return () => {
      document.body.classList.remove('is-locked')
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const start = new Date(`${COUNTER_START}T00:00:00`).getTime()
    const id = window.setInterval(() => setCounter(calcCounter(start)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setProgress(p * 100)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!unlocked) return
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    // Hero already visible
    document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('in'))
    return () => io.disconnect()
  }, [unlocked])

  const fireConfetti = useEffectEvent(() => {
    const canvas = confettiRef.current
    if (!canvas || confettiFiredRef.current) return
    confettiFiredRef.current = true
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)
    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    type Part = {
      x: number
      y: number
      vx: number
      vy: number
      a: number
      va: number
      s: number
      c: string
      life: number
      max: number
    }
    const parts: Part[] = []
    const colors = ['#c1294a', '#e8a4b0', '#f5d5d8', '#c9a25f', '#8e0e26']

    const burst = (n: number) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W,
          y: -20 - Math.random() * 200,
          vx: (Math.random() - 0.5) * 1.6,
          vy: 1.2 + Math.random() * 2.4,
          a: Math.random() * Math.PI * 2,
          va: (Math.random() - 0.5) * 0.12,
          s: 4 + Math.random() * 7,
          c: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          max: 320 + Math.random() * 220,
        })
      }
    }

    let running = true
    const loop = () => {
      if (!running) return
      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx
        p.y += p.vy
        p.a += p.va
        p.life++
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.a)
        ctx.fillStyle = p.c
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.max)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.s, p.s * 1.6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        if (p.y > H + 50 || p.life > p.max) parts.splice(i, 1)
      }
      if (parts.length > 0) requestAnimationFrame(loop)
      else {
        running = false
        window.removeEventListener('resize', onResize)
      }
    }

    burst(80)
    window.setTimeout(() => burst(60), 400)
    window.setTimeout(() => burst(50), 900)
    requestAnimationFrame(loop)
  })

  useEffect(() => {
    if (!unlocked) return
    const finalSec = document.getElementById('finalSec')
    if (!finalSec) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            fireConfetti()
            io.unobserve(finalSec)
          }
        })
      },
      { threshold: 0.35 },
    )
    io.observe(finalSec)
    return () => io.disconnect()
  }, [unlocked])

  const successUnlock = () => {
    doneRef.current = true
    pressingRef.current = false
    cancelAnimationFrame(rafRef.current)
    setDashOffset(0)
    setScanning(false)
    setFpSuccess(true)
    scanAudioRef.current?.pause()
    if (scanAudioRef.current) scanAudioRef.current.currentTime = 0
    if (completeAudioRef.current) {
      completeAudioRef.current.currentTime = 0
      completeAudioRef.current.play().catch(() => {})
    }
    setFpHint(FP_SUCCESS)
    const bg = musicRef.current
    if (bg) {
      bg.play()
        .then(() => setMusicPlaying(true))
        .catch(() => {})
    }
    window.setTimeout(() => setFpHint(FP_WELCOME), 1100)
    window.setTimeout(() => {
      setGateHidden(true)
      setUnlocked(true)
      document.body.classList.remove('is-locked')
    }, 2200)
  }

  const tickPress = () => {
    if (!pressingRef.current || doneRef.current) return
    const elapsed = performance.now() - startTsRef.current
    const pct = Math.min(1, elapsed / HOLD_MS)
    setDashOffset(1000 - 1000 * pct)
    let msg: string = FP_MESSAGES[0].text
    for (const x of FP_MESSAGES) {
      if (elapsed >= x.at) msg = x.text
    }
    setFpHint(msg)
    if (pct >= 1) {
      successUnlock()
      return
    }
    rafRef.current = requestAnimationFrame(tickPress)
  }

  const startPress = (e: SyntheticEvent) => {
    if (doneRef.current || pressingRef.current) return
    e.preventDefault()
    pressingRef.current = true
    startTsRef.current = performance.now()
    setScanning(true)
    setFpHint(FP_MESSAGES[0].text)
    if (scanAudioRef.current) {
      scanAudioRef.current.currentTime = 0
      scanAudioRef.current.play().catch(() => {})
    }
    rafRef.current = requestAnimationFrame(tickPress)
  }

  const endPress = () => {
    if (doneRef.current || !pressingRef.current) return
    pressingRef.current = false
    cancelAnimationFrame(rafRef.current)
    setScanning(false)
    if (scanAudioRef.current) {
      scanAudioRef.current.pause()
      scanAudioRef.current.currentTime = 0
    }
    if (failAudioRef.current) {
      failAudioRef.current.currentTime = 0
      failAudioRef.current.play().catch(() => {})
    }
    setDashOffset(1000)
    setFpHint(FP_HINT)
  }

  useEffect(() => {
    window.addEventListener('mouseup', endPress)
    window.addEventListener('touchend', endPress)
    window.addEventListener('touchcancel', endPress)
    return () => {
      window.removeEventListener('mouseup', endPress)
      window.removeEventListener('touchend', endPress)
      window.removeEventListener('touchcancel', endPress)
    }
  }, [])

  const toggleMusic = () => {
    const music = musicRef.current
    if (!music) return
    if (music.paused) {
      music.play()
        .then(() => setMusicPlaying(true))
        .catch(() => {})
    } else {
      music.pause()
      setMusicPlaying(false)
    }
  }

  const showVolumeTemporarily = () => {
    setVolumeVisible(true)
    window.clearTimeout(volumeHideRef.current)
    volumeHideRef.current = window.setTimeout(() => setVolumeVisible(false), 2000)
  }

  useEffect(() => {
    if (!letterOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLetterOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [letterOpen])

  const gateClass = [
    'fp-gate',
    scanning ? 'is-scanning' : '',
    fpSuccess ? 'is-success' : '',
    gateHidden ? 'hidden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div className={gateClass} id="fpGate">
        <div className="subtitle">{FP_SUBTITLE}</div>
        <div
          className="fp-wrap"
          id="fp"
          role="button"
          tabIndex={0}
          aria-label={FP_HINT}
          onMouseDown={startPress}
          onTouchStart={startPress}
          onMouseLeave={endPress}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !pressingRef.current) startPress(e)
          }}
          onKeyUp={(e) => {
            if (e.key === ' ' || e.key === 'Enter') endPress()
          }}
        >
          <span className="fp-pulse" />
          <span className="fp-pulse" />
          <span className="fp-pulse" />
          <div className="fp-ring" />
          <svg className="fp-progress" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              className="bar"
              cx="100"
              cy="100"
              r="96"
              pathLength="1000"
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <div className="fp-scan" />
          <img
            className="fp-svg fp-img"
            src="/assets/fingerprint-real.svg"
            alt=""
            aria-hidden="true"
          />
          <span className="fp-tint" aria-hidden="true" />
        </div>
        <div className="fp-hint">{fpHint}</div>
      </div>

      <audio ref={musicRef} id="backgroundMusic" loop preload="auto">
        <source src={musicaFondo} type="audio/mpeg" />
      </audio>

      {unlocked && (
        <>
          <div className="music-control" id="musicControl">
            <button
              className="music-btn"
              type="button"
              aria-label="Música"
              onClick={(e) => {
                e.stopPropagation()
                toggleMusic()
                if (!volumeVisible) showVolumeTemporarily()
                else setVolumeVisible(false)
              }}
            >
              {!musicPlaying ? (
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6zm8-14v14h4V5z" />
                </svg>
              )}
            </button>
            <div className={`volume-control${volumeVisible ? ' visible' : ''}`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                aria-label="Volumen"
                onChange={(e) => {
                  setVolume(Number(e.target.value))
                  showVolumeTemporarily()
                }}
                onMouseEnter={() => window.clearTimeout(volumeHideRef.current)}
                onMouseLeave={showVolumeTemporarily}
              />
            </div>
          </div>

          <div className="ambient" />
          <div className="petals" id="petals" aria-hidden="true">
            {petals.map((p, i) => (
              <div
                key={i}
                className="petal"
                style={{
                  left: p.left,
                  animationDuration: p.duration,
                  animationDelay: p.delay,
                  transform: `scale(${p.scale})`,
                  opacity: Number(p.opacity),
                }}
              />
            ))}
          </div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <canvas ref={confettiRef} className="confetti" id="confetti" />

          <section className="hero">
            <img
              className="hero-roses hero-roses-left"
              src="/assets/roses-left.webp"
              alt=""
              aria-hidden="true"
            />
            <img
              className="hero-roses hero-roses-right"
              src="/assets/roses.webp"
              alt=""
              aria-hidden="true"
            />
            <img
              className="hero-roses-top"
              src="/assets/cel-top.webp"
              alt=""
              aria-hidden="true"
            />
            <img
              className="hero-roses-bottom"
              src="/assets/cel-bottom.webp"
              alt=""
              aria-hidden="true"
            />
            <div className="wrap">
              <h1 className="hero-title reveal" data-delay="1">
                {HERO.titleBefore} <span className="amp">{HERO.titleAmp}</span>{' '}
                {HERO.titleAfter}
              </h1>
              <div className="ornament-rule reveal" data-delay="2">
                <span className="line" />
                <span className="dot" />
                <span className="line" />
              </div>
              <div className="hero-sub reveal" data-delay="2">
                <span>{HERO.subtitle}</span>
              </div>
              <div className="counter reveal" data-delay="3">
                <div className="unit">
                  <div className="num">{counter.days}</div>
                  <div className="label">días</div>
                </div>
                <div className="unit">
                  <div className="num">{counter.hours}</div>
                  <div className="label">horas</div>
                </div>
                <div className="unit">
                  <div className="num">{counter.mins}</div>
                  <div className="label">minutos</div>
                </div>
                <div className="unit">
                  <div className="num">{counter.secs}</div>
                  <div className="label">segundos</div>
                </div>
              </div>
            </div>
            <div className="scroll-hint" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </section>

          <section className="dedicatoria">
            <div className="wrap">
              <div className="section-head reveal">
                <Ornament />
                <h2>{DEDICATORIA.title}</h2>
              </div>
              <div className="body reveal" data-delay="1">
                {DEDICATORIA.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <p className="sign">{DEDICATORIA.sign}</p>
              </div>
            </div>
          </section>

          <section className="galeria">
            <div className="wrap">
              <div className="section-head reveal">
                <div className="eyebrow">Memorias</div>
                <Ornament />
                <h2>Nuestras fotos</h2>
              </div>
              <PhotoGallery />
            </div>
          </section>

          <section className="timeline-sec">
            <div className="wrap">
              <div className="section-head reveal">
                <div className="eyebrow">Nuestra historia</div>
                <Ornament />
                <h2>Línea del tiempo</h2>
              </div>
              <div className="timeline">
                {TIMELINE.map((item, i) => (
                  <div key={item.title}>
                    {i > 0 && (
                      <>
                        <div className="tl-connector" />
                        <div className="tl-node">♥</div>
                        <div className="tl-connector" />
                      </>
                    )}
                    <article className="tl-card reveal">
                      <div className="tl-thumb">
                        <img src={item.image} alt={item.title} loading="lazy" />
                      </div>
                      <div className="tl-content">
                        <div className="tl-date">{item.date}</div>
                        <h3 className="tl-title">{item.title}</h3>
                        <p className="tl-body">{item.body}</p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="carta">
            <div className="wrap">
              <div className="section-head reveal">
                <Ornament />
                <h2>Abre la carta</h2>
              </div>
              <div
                className="envelope-stage reveal"
                data-delay="1"
                data-open={letterOpen ? 'true' : 'false'}
                id="envStage"
              >
                <div className="envelope-frame">
                  <div
                    className="envelope"
                    role="button"
                    tabIndex={0}
                    aria-label="Abrir la carta"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLetterOpen(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setLetterOpen(true)
                      }
                    }}
                  >
                    <div className="env-body" />
                    <div className="env-pocket" />
                    <div className="env-pocket-bottom" />
                    <div className="env-flap" />
                    <div className="env-seal" aria-hidden="true" />
                  </div>
                </div>
                <div className="envelope-hint">toca el sobre para abrir</div>
              </div>
              {createPortal(
                <article
                  className={`letter${letterOpen ? ' is-open' : ''}`}
                  id="letterPanel"
                  aria-hidden={!letterOpen}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="letter-close"
                    type="button"
                    aria-label="Cerrar carta"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLetterOpen(false)
                    }}
                  >
                    ✕
                  </button>
                  <h3>{LETTER.greeting}</h3>
                  {LETTER.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  <div className="signoff">{LETTER.signoff}</div>
                </article>,
                document.body,
              )}
              {letterOpen &&
                createPortal(
                  <div
                    className="letter-backdrop"
                    aria-hidden="true"
                    onClick={() => setLetterOpen(false)}
                  />,
                  document.body,
                )}
            </div>
          </section>

          <section className="final" id="finalSec">
            <div className="wrap">
              <div className="final-title reveal" data-delay="1">
                {FINAL.title}
              </div>
              <div className="final-name reveal" data-delay="2">
                {FINAL.name}
              </div>
              <div className="final-tag reveal" data-delay="3">
                {FINAL.tag}
              </div>
              <div className="final-sign reveal" data-delay="4">
                {FINAL.sign}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default App
