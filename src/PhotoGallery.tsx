import {
  useLayoutEffect,
  useRef,
  useState,
  type TouchEvent,
  type TransitionEvent,
} from 'react'
import { PHOTOS } from './content'

const ANIM_MS = 550
const SWIPE_MIN = 45

type Photo = (typeof PHOTOS)[number]

function measureStep(track: HTMLDivElement | null) {
  if (!track) return 0
  const first = track.querySelector('.polaroid') as HTMLElement | null
  if (!first) return 0
  const gap = parseFloat(getComputedStyle(track).gap) || 0
  return first.getBoundingClientRect().width + gap
}

export default function PhotoGallery() {
  const [items, setItems] = useState<Photo[]>(() => [...PHOTOS])
  const [tx, setTx] = useState(0)
  const [animate, setAnimate] = useState(false)

  const trackRef = useRef<HTMLDivElement | null>(null)
  const busyRef = useRef(false)
  const pendingRef = useRef<'next' | 'prev' | null>(null)
  const safetyRef = useRef(0)
  const touchXRef = useRef<number | null>(null)
  const touchYRef = useRef<number | null>(null)
  const swipingRef = useRef(false)
  const prevKickRef = useRef(false)

  const clearBusy = () => {
    window.clearTimeout(safetyRef.current)
    busyRef.current = false
    pendingRef.current = null
    prevKickRef.current = false
  }

  const armSafety = () => {
    window.clearTimeout(safetyRef.current)
    safetyRef.current = window.setTimeout(() => {
      setAnimate(false)
      setTx(0)
      clearBusy()
    }, ANIM_MS + 250)
  }

  const goNext = () => {
    if (busyRef.current) return
    const d = measureStep(trackRef.current)
    if (!d) return
    busyRef.current = true
    pendingRef.current = 'next'
    armSafety()
    setAnimate(true)
    setTx(-d)
  }

  const goPrev = () => {
    if (busyRef.current) return
    const d = measureStep(trackRef.current)
    if (!d) return
    busyRef.current = true
    pendingRef.current = 'prev'
    prevKickRef.current = true
    armSafety()

    setAnimate(false)
    setItems((prev) => {
      const last = prev[prev.length - 1]
      return [last, ...prev.slice(0, -1)]
    })
    setTx(-d)
  }

  useLayoutEffect(() => {
    if (!prevKickRef.current) return
    if (pendingRef.current !== 'prev') return
    if (tx >= 0) return

    prevKickRef.current = false
    const id = requestAnimationFrame(() => {
      setAnimate(true)
      setTx(0)
    })
    return () => cancelAnimationFrame(id)
  }, [items, tx])

  const finishNext = () => {
    setAnimate(false)
    setItems((prev) => [...prev.slice(1), prev[0]])
    setTx(0)
    clearBusy()
  }

  const finishPrev = () => {
    clearBusy()
  }

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return
    if (e.propertyName !== 'transform') return

    const pending = pendingRef.current
    if (pending === 'next') {
      finishNext()
      return
    }
    if (pending === 'prev') {
      finishPrev()
    }
  }

  const onTouchStart = (e: TouchEvent) => {
    if (busyRef.current || e.touches.length !== 1) return
    touchXRef.current = e.touches[0].clientX
    touchYRef.current = e.touches[0].clientY
    swipingRef.current = false
  }

  const onTouchMove = (e: TouchEvent) => {
    if (touchXRef.current == null || touchYRef.current == null) return
    const dx = e.touches[0].clientX - touchXRef.current
    const dy = e.touches[0].clientY - touchYRef.current
    if (!swipingRef.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      // Solo gesto horizontal: no pelear con el scroll vertical
      if (Math.abs(dx) > Math.abs(dy)) {
        swipingRef.current = true
      } else {
        touchXRef.current = null
        touchYRef.current = null
      }
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (touchXRef.current == null) return
    const endX = e.changedTouches[0]?.clientX ?? touchXRef.current
    const dx = endX - touchXRef.current
    touchXRef.current = null
    touchYRef.current = null

    if (!swipingRef.current) return
    swipingRef.current = false

    if (dx <= -SWIPE_MIN) goNext()
    else if (dx >= SWIPE_MIN) goPrev()
  }

  return (
    <div className="gallery reveal" data-delay="1">
      <button
        className="gal-nav gal-prev"
        type="button"
        aria-label="Anterior"
        onClick={goPrev}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div
        className="gal-viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touchXRef.current = null
          touchYRef.current = null
          swipingRef.current = false
        }}
      >
        <div
          className="gal-track"
          ref={trackRef}
          onTransitionEnd={onTransitionEnd}
          style={{
            transform: `translate3d(${tx}px, 0, 0)`,
            transition: animate
              ? `transform ${ANIM_MS}ms cubic-bezier(.2,.7,.2,1)`
              : 'none',
          }}
        >
          {items.map((photo) => (
            <figure className="polaroid" key={photo.src}>
              <div className="photo">
                <img src={photo.src} alt={photo.caption} loading="lazy" draggable={false} />
              </div>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <button
        className="gal-nav gal-next"
        type="button"
        aria-label="Siguiente"
        onClick={goNext}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
