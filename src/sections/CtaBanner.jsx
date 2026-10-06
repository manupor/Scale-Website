import { useEffect, useRef } from 'react'
import { cta } from '../content'
import MaskedHeading from '../components/MaskedHeading'

function chapterOpacity(progress, start, end) {
  const span = end - start
  const fade = Math.min(0.06, span * 0.28)
  if (progress < start || progress > end) return 0
  if (progress < start + fade) return (progress - start) / fade
  if (progress > end - fade) return (end - progress) / fade
  return 1
}

export default function CtaBanner({ onContact }) {
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const maskedVideoRef = useRef(null)
  const maskedRef = useRef(null)
  const scrimRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const stage = stageRef.current
    const video = videoRef.current
    const maskedVideo = maskedVideoRef.current
    const masked = maskedRef.current
    const scrim = scrimRef.current
    if (!stage || !video) return undefined

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      video.currentTime = 0
      if (maskedVideo) maskedVideo.currentTime = 0
      return undefined
    }

    const chapters = [...stage.querySelectorAll('[data-cta-chapter]')]

    const update = () => {
      rafRef.current = 0
      const rect = stage.getBoundingClientRect()
      const travel = Math.max(1, stage.offsetHeight - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / travel))
      const duration = video.duration || 8
      const time = progress * duration

      if (video.readyState >= 2) video.currentTime = time
      if (maskedVideo && maskedVideo.readyState >= 2) maskedVideo.currentTime = time

      // Background video is hidden at first, then revealed as the masked text zooms in.
      if (video) {
        video.style.opacity = progress < 0.18 ? '0' : progress < 0.42 ? String(((progress - 0.18) / 0.24).toFixed(3)) : '1'
      }

      // Masked heading intro: hold, then zoom-in and fade out.
      if (masked) {
        if (progress < 0.18) {
          masked.style.opacity = '1'
          masked.style.transform = 'scale(1)'
        } else if (progress < 0.42) {
          const t = (progress - 0.18) / 0.24
          masked.style.opacity = String(1 - t)
          masked.style.transform = `scale(${1 + t * 6})`
        } else {
          masked.style.opacity = '0'
          masked.style.transform = 'scale(7)'
        }
      }

      // Fade in the dark scrim as the mask reveals the full video.
      if (scrim) {
        const s = Math.min(1, Math.max(0, (progress - 0.18) / 0.24))
        scrim.style.opacity = String(s)
      }

      chapters.forEach((chapter) => {
        const opacity = chapterOpacity(progress, Number(chapter.dataset.start), Number(chapter.dataset.end))
        const shift = (1 - opacity) * 30
        const baseX = chapter.classList.contains('cta-chapter--right') ? shift : -shift
        chapter.style.opacity = opacity.toFixed(3)
        chapter.style.visibility = opacity > 0.01 ? 'visible' : 'hidden'
        chapter.style.transform = `translate3d(${baseX}px, 0, 0)`
      })
    }

    const onScroll = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(update) }
    const onLoaded = () => update()
    window.addEventListener('scroll', onScroll, { passive: true })
    video.addEventListener('loadedmetadata', onLoaded)
    if (maskedVideo) maskedVideo.addEventListener('loadedmetadata', onLoaded)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      video.removeEventListener('loadedmetadata', onLoaded)
      if (maskedVideo) maskedVideo.removeEventListener('loadedmetadata', onLoaded)
      cancelAnimationFrame(rafRef.current)
      chapters.forEach((chapter) => chapter.removeAttribute('style'))
      if (masked) masked.removeAttribute('style')
      if (scrim) scrim.removeAttribute('style')
    }
  }, [])

  const onCta = () => onContact()

  return (
    <section ref={stageRef} id="contacto" aria-label="Comienza el diagnóstico" className="cta-stage">
      <div className="cta-viewport">
        <video
          ref={videoRef}
          className="cta-video"
          src="/media/cta-motion.mp4"
          poster="/media/cta-motion-poster.jpg"
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          aria-hidden="true"
        />
        <div ref={scrimRef} className="cta-scrim" aria-hidden="true" />

        <div ref={maskedRef} className="masked-intro">
          <MaskedHeading
            text="Diseñado en los detalles"
            mediaType="video"
            src="/media/cta-motion.mp4"
            poster="/media/cta-motion-poster.jpg"
            mediaRef={maskedVideoRef}
            autoPlay={false}
            loop={false}
            reveal="rise"
            trigger="view"
            align="center"
            duration={1.2}
            stagger={0.1}
            textScale={0.13}
            weight={600}
            parallax={0}
            drift={8}
          />
        </div>

        {cta.chapters.map((chapter) => {
          const isRight = chapter.variant.includes('right')
          return (
            <div
              key={chapter.id}
              data-cta-chapter={chapter.id}
              data-start={chapter.start}
              data-end={chapter.end}
              className={`cta-chapter cta-chapter--${chapter.variant}`}
            >
              <p className="cta-chapter__eyebrow">{chapter.eyebrow}</p>
              <h2 className="cta-chapter__title">
                {chapter.title[0]}
                <br />
                {chapter.title[1]}
              </h2>
              <p className="cta-chapter__body">{chapter.body}</p>
              {chapter.cta && (
                <button
                  type="button"
                  onClick={onCta}
                  className={`group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full ${isRight ? 'bg-paper hover:bg-accent' : 'bg-accent hover:bg-paper'} px-7 py-4 text-sm font-semibold text-night transition-colors`}
                >
                  {chapter.cta.label}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-night text-paper" aria-hidden="true">{chapter.cta.icon}</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
