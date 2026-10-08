import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { method } from './content'

const SPANS = ['md:col-span-4', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2', 'md:col-span-2']

export default function MethodBento({ onContact }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.ed-method-head > *', {
        opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.ed-method-head', start: 'top 80%' },
      })
      gsap.utils.toArray('.ed-cell').forEach((cell) => {
        gsap.from(cell, {
          opacity: 0, y: 60, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: cell, start: 'top 88%' },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="metodo" ref={rootRef} className="relative bg-void px-4 py-24 text-white md:px-16 md:py-28">
      <div className="ed-method-head mx-auto mb-14 max-w-6xl text-center md:mb-20">
        <span className="ed-micro mb-5 block">{method.eyebrow}</span>
        <h2 className="text-[clamp(2.4rem,6vw,5.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
          {method.title}
          <span className="ed-italic block text-white/60">{method.titleItalic}</span>
        </h2>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-6">
        {method.stages.map((stage, i) => (
          <article
            key={stage.num}
            className={`ed-cell flex min-h-[18rem] flex-col justify-between p-6 md:min-h-[22rem] md:p-8 ${SPANS[i]}`}
            style={{ '--cell': stage.color }}
          >
            <span className="ed-cell__glow" aria-hidden="true" />
            <div className="relative flex items-start justify-between">
              <span className="ed-micro" style={{ color: stage.color }}>{stage.num} // {stage.name}</span>
              <span className="ed-letter text-[clamp(4rem,9vw,7rem)]" style={{ color: stage.color }} aria-hidden="true">{stage.letter}</span>
            </div>
            <div className="relative mt-8 max-w-md">
              <h3 className="mb-3 text-xl font-medium leading-snug tracking-tight md:text-2xl">{stage.title}</h3>
              <p className="ed-italic text-base leading-relaxed text-white/55 md:text-lg">{stage.body}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {stage.tags.map((tag) => <li key={tag} className="ed-tag">{tag}</li>)}
              </ul>
            </div>
          </article>
        ))}

        <article className="ed-cell flex flex-col items-start justify-between gap-6 p-6 md:col-span-6 md:flex-row md:items-center md:p-10" style={{ '--cell': '#F5B041' }}>
          <span className="ed-cell__glow" aria-hidden="true" />
          <div className="relative">
            <span className="ed-micro mb-3 block">{method.closing.num} // Siembra</span>
            <p className="ed-italic text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight">{method.closing.title}</p>
          </div>
          <button type="button" className="ed-btn relative" onClick={onContact}>
            {method.closing.cta}
            <span className="ed-btn__arrow" aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    </section>
  )
}
