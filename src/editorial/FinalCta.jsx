import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { finalCta } from './content'
import Frame from './Frame'

const Leaf = ({ className, style }) => (
  <svg className={`ed-leaf ${className}`} style={style} viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <path d="M100 195C100 120 60 70 10 40C70 30 140 60 160 130C150 90 120 50 70 25C130 15 190 60 190 130" stroke="currentColor" strokeWidth="1.2" />
    <path d="M100 195C110 140 130 100 190 70" stroke="currentColor" strokeWidth="1.2" />
  </svg>
)

export default function FinalCta({ onContact }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 65%' } })
      tl.from('.ed-frame__line--t, .ed-frame__line--b', { scaleX: 0, duration: 1.4, ease: 'expo.out' }, 0)
        .from('.ed-frame__line--l, .ed-frame__line--r', { scaleY: 0, duration: 1.4, ease: 'expo.out' }, 0)
        .from('.ed-cross', { opacity: 0, duration: 0.6, stagger: 0.06 }, 0.4)
        .from('.ed-reveal', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'expo.out' }, 0.3)
        .from('.ed-cta-fade', { opacity: 0, y: 20, duration: 1, stagger: 0.1, ease: 'expo.out' }, 0.7)
      gsap.fromTo('.ed-sun', { xPercent: -50, x: 0, yPercent: 30, opacity: 0 }, {
        xPercent: -50, x: 0, yPercent: 0, opacity: 0.45, ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'center center', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contacto" ref={rootRef} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-void px-6 py-32 text-white">
      <Frame />
      <span className="ed-sun" aria-hidden="true" />
      <Leaf className="-left-10 top-10 w-64 md:w-96" />
      <Leaf className="-right-10 bottom-0 w-56 md:w-80" style={{ transform: 'scaleX(-1) rotate(20deg)' }} />

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <span className="ed-cta-fade ed-micro mb-6 flex items-center gap-3">
          <span className="ed-pulse" aria-hidden="true" />
          {finalCta.eyebrow}
        </span>
        <h2 className="text-[clamp(2.6rem,7.5vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
          <span className="ed-mask"><span className="ed-reveal">{finalCta.title}</span></span>
          <span className="ed-mask"><span className="ed-reveal ed-italic text-mango">{finalCta.titleItalic}</span></span>
        </h2>
        <p className="ed-cta-fade mt-8 max-w-md text-base font-light leading-relaxed text-white/60">{finalCta.body}</p>
        <div className="ed-cta-fade mt-10">
          <button type="button" className="ed-btn" onClick={onContact}>
            {finalCta.cta}
            <span className="ed-btn__arrow" aria-hidden="true">→</span>
          </button>
        </div>
        <span className="ed-cta-fade ed-micro mt-10 text-selva/80">● {finalCta.status}</span>
      </div>
    </section>
  )
}
