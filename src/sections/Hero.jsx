import { useEffect, useRef } from 'react'
import { hero } from '../content'

const FRAME_COUNT = hero.frameCount
const PRELOAD_COUNT = 14
const frameUrl = (index) => `/frames/frame-${String(index + 1).padStart(3, '0')}.webp`

function chapterOpacity(progress, start, end) {
  const span = end - start
  const fade = Math.min(0.055, span * 0.32)
  if (progress < start || progress > end) return 0
  if (start > 0 && progress < start + fade) return (progress - start) / fade
  if (progress > end - fade) return (end - progress) / fade
  return 1
}

export default function Hero({ onContact }) {
  const stageRef = useRef(null)
  const viewportRef = useRef(null)
  const mediaRef = useRef(null)
  const canvasRef = useRef(null)
  const loadBarRef = useRef(null)
  const loadingRef = useRef(null)
  const progressRef = useRef(null)
  const indexRef = useRef(null)

  const scrollToProgress = (progress) => {
    const stage = stageRef.current
    if (!stage) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const travel = stage.offsetHeight - window.innerHeight
    window.scrollTo({ top: stage.offsetTop + travel * progress, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onCta = (action) => {
    if (action === 'contact') onContact()
    else scrollToProgress(0.26)
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stage = stageRef.current
    const viewport = viewportRef.current
    const media = mediaRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return undefined
    const ctx = canvas.getContext('2d', { alpha: false })
    document.documentElement.dataset.enhanced = 'true'

    if (reduceMotion) {
      return () => { delete document.documentElement.dataset.enhanced }
    }

    const chapters = [...stage.querySelectorAll('[data-chapter]')]
    const images = new Array(FRAME_COUNT)
    const loaded = new Set()
    const loading = new Map()
    let displayedFrame = -1
    let raf = 0
    let disposed = false

    const updateLoadBar = () => {
      if (!loadBarRef.current || !loadingRef.current) return
      const pct = Math.round((loaded.size / FRAME_COUNT) * 100)
      loadBarRef.current.style.width = `${pct}%`
      if (loaded.size === FRAME_COUNT) {
        loadingRef.current.classList.add('is-ready')
      }
    }

    const loadFrame = (index) => {
      const i = Math.max(0, Math.min(FRAME_COUNT - 1, index))
      if (loaded.has(i)) return Promise.resolve(images[i])
      if (loading.has(i)) return loading.get(i)
      const task = new Promise((resolve) => {
        const image = new Image()
        image.src = frameUrl(i)
        image.onload = () => {
          images[i] = image
          loaded.add(i)
          loading.delete(i)
          updateLoadBar()
          resolve(image)
        }
        image.onerror = () => {
          loading.delete(i)
          resolve(null)
        }
      })
      loading.set(i, task)
      return task
    }

    const drawFrame = (image) => {
      if (!image || !image.complete) return
      const cw = canvas.width
      const ch = canvas.height
      const w = image.naturalWidth
      const h = image.naturalHeight
      const scale = Math.max(cw / w, ch / h)
      const dw = w * scale
      const dh = h * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2
      ctx.drawImage(image, 0, 0, w, h, dx, dy, dw, dh)
    }

    const updateChapters = (progress) => {
      let active = 0
      chapters.forEach((chapter, index) => {
        let opacity = chapterOpacity(progress, Number(chapter.dataset.start), Number(chapter.dataset.end))
        // Keep the final centered chapter (with the CTA) visible until the very end.
        if (chapter.classList.contains('chapter--center') && progress >= Number(chapter.dataset.start)) {
          opacity = 1
        }
        if (opacity > 0.45) active = index
        chapter.style.opacity = opacity.toFixed(3)
        chapter.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'
        const shift = (1 - opacity) * 18
        const isCentered = chapter.classList.contains('chapter--center') || chapter.classList.contains('chapter--hero')
        const base = isCentered ? 'translate(-50%, -50%)' : 'translate(0, 0)'
        chapter.style.transform = `${base} translateY(${shift}px)`
      })
      if (indexRef.current) indexRef.current.textContent = String(active).padStart(2, '0')
    }

    const render = () => {
      raf = 0
      if (disposed) return
      const rect = stage.getBoundingClientRect()
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / travel))
      const frameIndex = Math.floor(progress * (FRAME_COUNT - 1))

      if (displayedFrame !== frameIndex) {
        displayedFrame = frameIndex
        const img = images[frameIndex]
        if (img) drawFrame(img)
        else loadFrame(frameIndex).then(drawFrame)
      }

      updateChapters(progress)
      if (media) media.style.transform = `scale(${1 + progress * 0.12})`
      if (progressRef.current) progressRef.current.style.width = `${progress * 100}%`
    }

    const requestRender = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(render)
    }

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        displayedFrame = -1
        requestRender()
      }
    }

    const warmSequence = (i = 0) => {
      if (disposed || i >= FRAME_COUNT) return
      loadFrame(i)
      setTimeout(() => warmSequence(i + 1), 16)
    }

    const onScroll = () => requestRender()
    const onResize = () => { resizeCanvas(); requestRender() }
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else {
        requestRender()
      }
    }

    resizeCanvas()
    Promise.all(Array.from({ length: PRELOAD_COUNT }, (_, i) => loadFrame(i))).then(() => {
      requestRender()
      warmSequence()
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(raf)
      chapters.forEach((chapter) => chapter.removeAttribute('style'))
      if (media) media.removeAttribute('style')
      if (viewport) viewport.removeAttribute('style')
      delete document.documentElement.dataset.enhanced
    }
  }, [])

  return (
    <section ref={stageRef} className="sequence-stage" id="inicio" aria-label="SCALE: cómo trabajamos" data-sequence>
      <div ref={viewportRef} className="sequence-viewport">
        <div ref={mediaRef} className="sequence-media">
          <img className="sequence-poster" src={frameUrl(0)} alt="" fetchPriority="high" />
          <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
        </div>
        <div className="sequence-scrim" aria-hidden="true" />
        <div className="sequence-grain" aria-hidden="true" />

        <div ref={loadingRef} className="loading-status" role="status" aria-live="polite">
          <span>Preparando la vista</span>
          <span className="loading-status__track"><span ref={loadBarRef} /></span>
        </div>

        {hero.chapters.map((chapter) => {
          const Heading = chapter.variant === 'hero' ? 'h1' : 'h2'
          return (
            <div
              key={chapter.id}
              className={`chapter chapter--${chapter.variant}`}
              data-chapter={chapter.id}
              data-start={chapter.start}
              data-end={chapter.end}
            >
              <p className="eyebrow">{chapter.eyebrow}</p>
              <Heading>
                {chapter.title[0]}
                <br />
                <em>{chapter.title[1]}</em>
              </Heading>
              <p className="chapter__body">{chapter.body}</p>
              {chapter.cta && (
                <button type="button" className="primary-cta" onClick={() => onCta(chapter.cta.action)}>
                  <span>{chapter.cta.label}</span>
                  <span className="primary-cta__icon" aria-hidden="true">{chapter.cta.icon}</span>
                </button>
              )}
            </div>
          )
        })}

        <div className="sequence-meta" aria-hidden="true">
          <span ref={indexRef}>00</span>
          <span className="sequence-meta__line"><span ref={progressRef} /></span>
          <span>04</span>
        </div>

        <div className="sequence-cue" aria-hidden="true">
          <span>Deslice para descubrir</span>
          <i />
        </div>
      </div>
    </section>
  )
}
