import { useEffect, useRef } from 'react'
import { method } from '../content'
import { ArrowRight, CheckIcon } from '../components/Glyphs'
import { gsap, prefersReducedMotion } from '../lib/motion'

export default function Method({ onContact }) {
  const stageRef = useRef(null)
  const viewportRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    // Mobile fallback: cards are rendered as a normal stacked list (see sections.css).
    if (window.innerWidth <= 800) {
      cardsRef.current.filter(Boolean).forEach((card) => {
        card.style.opacity = '1'
        card.style.transform = 'none'
      })
      return undefined
    }
    const stage = stageRef.current
    const viewport = viewportRef.current
    const cards = cardsRef.current.filter(Boolean)
    const dots = [...stage.querySelectorAll('.method-progress span')]
    if (!stage || !viewport || cards.length === 0) return undefined

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 80, scale: 0.96 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          scrub: 0.6,
          start: 'top top',
          end: () => `+=${stage.offsetHeight - viewport.offsetHeight}`,
          onUpdate: (self) => {
            const idx = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)))
            cards.forEach((card, i) => { card.dataset.active = String(i === idx) })
            dots.forEach((dot, i) => { dot.dataset.active = String(i === idx) })
          },
        },
      })

      const DURATION = 1
      cards.forEach((card, i) => {
        const lines = card.querySelectorAll('.method-line')
        const enterStart = i * DURATION
        const enterEnd = enterStart + DURATION * 0.5
        const exitStart = enterStart + DURATION * 0.72
        const exitEnd = enterStart + DURATION

        tl.fromTo(card, { opacity: 0, y: 80, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ease: 'none', duration: enterEnd - enterStart }, enterStart)
        tl.fromTo(lines, { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, ease: 'none', duration: (enterEnd - enterStart) * 0.85 }, enterStart)

        if (i < cards.length - 1) {
          tl.to(card, { opacity: 0, y: -60, scale: 0.96, ease: 'none', duration: exitEnd - exitStart }, exitStart)
        }
      })
    }, stage)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={stageRef} id="metodo" aria-label="Método SCALE" className="method-stage relative">
      <div ref={viewportRef} className="method-viewport">
        <div className="method-grid">
          <div className="method-head">
            <p className="method-eyebrow">{method.badge}</p>
            <h2 className="method-heading">{method.heading}</h2>
          </div>

          <div className="method-cards">
            {method.stages.map((stage, i) => (
              <article
                key={stage.letter}
                ref={(el) => { cardsRef.current[i] = el }}
                className="method-card"
                data-stage={i + 1}
              >
                <div className="method-line">
                  <span className="method-num">0{i + 1}</span>
                  <span className="method-name">{stage.name}</span>
                </div>
                <h3 className="method-title method-line">{stage.title}</h3>
                <p className="method-body method-line">{stage.body}</p>
                <ul className="method-tags method-line">
                  {stage.tags.map((tag) => (
                    <li key={tag}><CheckIcon className="method-check" aria-hidden="true" /> {tag}</li>
                  ))}
                </ul>
              </article>
            ))}
            <article
              ref={(el) => { cardsRef.current[method.stages.length] = el }}
              className="method-card method-card--cta"
              data-stage={method.stages.length + 1}
            >
              <h3 className="method-title method-line">{method.closing.title}</h3>
              <button
                type="button"
                onClick={onContact}
                className="method-cta method-line group inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-night transition-colors hover:bg-paper"
              >
                {method.closing.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </article>
          </div>
        </div>

        <div className="method-progress" aria-hidden="true">
          {Array.from({ length: method.stages.length + 1 }, (_, i) => (
            <span key={i} data-dot={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
