import { useEffect, useRef } from 'react'
import { philosophy, poster } from '../content'
import { QuoteGlyph } from '../components/Glyphs'
import { gsap, prefersReducedMotion } from '../lib/motion'

export default function Philosophy() {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.tst-card', {
        y: 90,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 74%' },
      })
      gsap.from('.tst-el', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: ref.current, start: 'top 62%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="filosofia" aria-labelledby="philo-title" className="py-[8vh]">
      <div className="mx-auto max-w-[1240px] px-6">
        <figure className="tst-card grid items-center gap-10 rounded-[32px] border border-solid border-line bg-coal p-6 md:grid-cols-2 md:gap-14 md:p-10">
          <div className="overflow-hidden rounded-[24px]">
            <img src={poster} alt="" loading="lazy" className="block aspect-square w-full object-cover" />
          </div>
          <div className="px-2 py-6 text-center md:px-6">
            <p className="tst-el text-xs font-semibold uppercase tracking-[0.16em] text-mute">{philosophy.eyebrow}</p>
            <QuoteGlyph className="tst-el mx-auto mt-8 block w-14 text-accent" />
            <blockquote id="philo-title" className="tst-el mt-8 font-serif text-[clamp(2.4rem,4.4vw,4rem)] font-medium italic leading-[1.05]">
              {philosophy.quote}
            </blockquote>
            <figcaption className="tst-el mt-8 text-lg text-mute">{philosophy.caption}</figcaption>
          </div>
        </figure>
      </div>
    </section>
  )
}
