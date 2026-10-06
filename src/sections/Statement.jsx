import { useEffect, useRef } from 'react'
import { poster, statement } from '../content'
import { ArrowRight, AsteriskMark, BarsMark, TargetMark } from '../components/Glyphs'
import { gsap, prefersReducedMotion } from '../lib/motion'

const LINE_COLORS = ['text-accent', 'text-paper', 'text-teal']

export default function Statement() {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.stmt-line', {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.stmt-lines', start: 'top 78%' },
      })
      gsap.from('.stmt-shape', {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'back.out(1.6)',
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: 'top 65%' },
      })
      gsap.from('.stmt-cta', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.stmt-ctas', start: 'top 88%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} aria-label="Estrategia, marca, crecimiento" className="relative overflow-hidden py-[16vh] md:py-[20vh]">
      <div className="stmt-shape absolute left-[6%] top-[10%] hidden size-24 place-items-center rounded-full bg-accent text-night md:grid lg:size-28">
        <BarsMark className="w-1/2" />
      </div>
      <div className="stmt-shape absolute right-[4%] top-[6%] hidden h-36 w-64 place-items-center rounded-full bg-teal text-paper md:grid lg:h-44 lg:w-80">
        <AsteriskMark className="size-16 lg:size-20" />
      </div>
      <div className="stmt-shape absolute bottom-[10%] left-[7%] hidden w-44 overflow-hidden rounded-t-full md:block lg:w-52">
        <img src={poster} alt="" loading="lazy" className="block aspect-[3/4] w-full object-cover" />
      </div>
      <div className="stmt-shape absolute bottom-[8%] right-[7%] hidden size-24 place-items-center rounded-full bg-paper text-night md:grid lg:size-28">
        <TargetMark className="size-10 lg:size-12" />
      </div>

      <p className="stmt-lines mx-auto max-w-[1400px] px-6 text-center">
        {statement.lines.map((line, i) => (
          <span key={line} className="block overflow-hidden py-[0.5vw]">
            <span className={`stmt-line block font-serif text-[clamp(3.4rem,10.5vw,10.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.01em] ${LINE_COLORS[i]}`}>
              {line}
            </span>
          </span>
        ))}
      </p>

      <div className="stmt-ctas mt-16 flex flex-col items-center justify-center gap-6 px-6 sm:flex-row">
        <a
          href={statement.primaryCta.href}
          className="stmt-cta group flex min-h-12 items-center gap-3 rounded-full bg-coal px-8 py-4 text-sm font-semibold text-paper transition-colors hover:bg-dim"
        >
          {statement.primaryCta.label}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <a
          href={statement.secondaryCta.href}
          className="stmt-cta text-sm font-semibold text-paper underline decoration-line underline-offset-8 transition-colors hover:decoration-paper"
        >
          {statement.secondaryCta.label}
        </a>
      </div>
    </section>
  )
}
