import { useState } from 'react'
import { faq } from './content'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="relative bg-void px-6 py-24 text-white md:px-16 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
        <div>
          <span className="ed-micro mb-5 block">{faq.eyebrow}</span>
          <h2 className="text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
            {faq.title}
            <span className="ed-italic block text-white/60">{faq.titleItalic}</span>
          </h2>
        </div>

        <ul className="border-t border-white/10">
          {faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q} className="border-b border-white/10">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent py-6 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="ed-micro text-white/30">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-base font-medium md:text-lg">{item.q}</span>
                  </span>
                  <span
                    className="grid h-8 w-8 flex-none place-items-center rounded-full border border-white/15 text-lg transition-transform duration-500"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'none', color: isOpen ? '#F5B041' : '#fff' }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <p className="ed-italic overflow-hidden pl-10 text-lg leading-relaxed text-white/55">
                    <span className="block pb-7">{item.a}</span>
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
