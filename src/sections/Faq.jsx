import { useEffect, useRef, useState } from 'react'
import { faq } from '../content'
import { PlusIcon } from '../components/Glyphs'
import { gsap, prefersReducedMotion } from '../lib/motion'

export default function Faq() {
  const ref = useRef(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.faq-el', {
        y: 50,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="faq" aria-labelledby="faq-title" className="py-[12vh]">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-6 md:grid-cols-[1fr_1.5fr] md:gap-20">
        <div className="faq-el">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{faq.eyebrow}</p>
          <h2 id="faq-title" className="mt-6 whitespace-pre-line font-serif text-[clamp(2.6rem,5.4vw,4.8rem)] font-medium uppercase leading-[1]">
            {faq.heading}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className="faq-el overflow-hidden rounded-[20px] border border-solid border-line bg-coal">
                <h3 className="m-0 text-lg font-medium md:text-xl">
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    className="flex min-h-12 w-full items-center justify-between gap-6 px-7 py-6 text-left md:px-9 md:py-7"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {item.q}
                    <PlusIcon className={`size-5 shrink-0 text-accent transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                >
                  <p className="px-7 pb-7 leading-relaxed text-mute md:px-9">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
