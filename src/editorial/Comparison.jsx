import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { comparison } from './content'

export default function Comparison() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    if (prefersReducedMotion()) {
      root.querySelectorAll('.ed-strike').forEach((el) => el.style.setProperty('--strike', '1'))
      return undefined
    }
    const ctx = gsap.context(() => {
      gsap.from('.ed-comp-head > *', {
        opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.ed-comp-head', start: 'top 80%' },
      })
      gsap.utils.toArray('.ed-comp-row').forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 80%', end: 'center 45%', scrub: true } })
        tl.fromTo(row.querySelector('.ed-strike'), { '--strike': 0 }, { '--strike': 1, ease: 'none' }, 0)
          .fromTo(row.querySelector('.ed-legacy'), { opacity: 1 }, { opacity: 0.35, ease: 'none' }, 0.3)
          .fromTo(row.querySelector('.ed-scale'), { opacity: 0.12, x: 30 }, { opacity: 1, x: 0, ease: 'none' }, 0.2)
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="diferencia" ref={rootRef} className="relative bg-void px-6 py-24 text-white md:px-16 md:py-28">
      <div className="ed-comp-head mx-auto mb-16 max-w-6xl md:mb-24">
        <span className="ed-micro mb-5 block">{comparison.eyebrow}</span>
        <h2 className="text-[clamp(2.4rem,6vw,5.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
          {comparison.title} <span className="ed-italic text-white/60">{comparison.titleItalic}</span>
        </h2>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-4 hidden grid-cols-2 gap-16 md:grid">
          <span className="ed-micro text-hibisco/80">Improvisado</span>
          <span className="ed-micro text-selva/80">Con SCALE</span>
        </div>
        {comparison.rows.map((row) => (
          <article key={row.label} className="ed-comp-row grid gap-6 border-t border-white/10 py-10 md:grid-cols-2 md:gap-16 md:py-14">
            <div className="ed-legacy">
              <span className="ed-micro mb-4 block text-white/30">{row.label}</span>
              <p className="ed-italic text-[clamp(1.4rem,2.8vw,2.3rem)] leading-tight text-neutral-400">
                <span className="ed-strike">{row.legacy}</span>
              </p>
            </div>
            <div className="ed-scale">
              <span className="ed-micro mb-4 block" style={{ color: row.color }}>Cultivado ↗</span>
              <p className="text-[clamp(1.4rem,2.8vw,2.3rem)] font-medium leading-tight tracking-tight">{row.scale}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
