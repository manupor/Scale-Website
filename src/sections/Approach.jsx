import { useEffect, useRef } from 'react'
import { approach, poster } from '../content'
import { AsteriskMark, Badge, BarsMark, RootMark, TargetMark } from '../components/Glyphs'
import { gsap, prefersReducedMotion } from '../lib/motion'

function Num({ children, dark = false }) {
  return (
    <span className={`absolute bottom-8 right-8 font-serif text-5xl font-semibold leading-none ${dark ? 'text-night/40' : 'text-teal/60'}`} aria-hidden="true">
      {children}
    </span>
  )
}

export default function Approach() {
  const ref = useRef(null)
  const [p1, p2, p3] = approach.principles

  useEffect(() => {
    if (prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.bento-card', {
        y: 90,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      })
      gsap.from('.bento-pop', {
        scale: 0,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.7)',
        stagger: 0.09,
        scrollTrigger: { trigger: ref.current, start: 'top 60%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="enfoque" aria-labelledby="approach-title" className="py-[8vh]">
      <div className="mx-auto grid max-w-[1240px] gap-6 px-6 md:grid-cols-2">
        {/* A — the thesis */}
        <article className="bento-card relative flex min-h-[460px] flex-col items-center overflow-hidden rounded-[28px] border border-solid border-line bg-coal px-8 pb-12 pt-14 text-center transition-colors duration-300 hover:border-accent/40 hover:bg-[#0B1624] md:min-h-[520px]">
          <Badge>{approach.badge}</Badge>
          <h2 id="approach-title" className="mt-6 max-w-[380px] font-serif text-[clamp(1.9rem,2.8vw,2.6rem)] font-medium leading-[1.08]">
            {approach.title}
          </h2>
          <p className="mt-4 max-w-[380px] leading-relaxed text-mute">{approach.body}</p>
          <img src={poster} alt="" loading="lazy" className="bento-pop mt-8 block aspect-[16/9] w-full rounded-[22px] object-cover" />
        </article>

        {/* B — principle 01 */}
        <article className="bento-card relative flex min-h-[460px] flex-col items-center justify-center overflow-hidden rounded-[28px] bg-accent px-10 pb-24 text-center md:min-h-[520px]">
          <h3 className="max-w-[420px] font-serif text-[clamp(2rem,3vw,2.8rem)] font-medium leading-[1.08] text-night">
            {p1.text}
          </h3>
          <Num dark>{p1.num}</Num>
        </article>

        {/* C — principle 02 */}
        <article className="bento-card relative flex min-h-[460px] flex-col justify-center overflow-hidden rounded-[28px] border border-solid border-line bg-coal p-10 transition-colors duration-300 hover:border-accent/40 hover:bg-[#0B1624] md:min-h-[520px] md:p-12">
          <div className="flex items-center justify-center py-8 md:py-12" aria-hidden="true">
            <div className="bento-pop grid size-[104px] rotate-[-6deg] place-items-center rounded-[26px] bg-teal text-paper md:size-[124px]">
              <RootMark className="w-1/2" />
            </div>
            <div className="bento-pop z-10 -ml-5 grid size-[104px] rotate-[4deg] place-items-center rounded-[26px] bg-accent text-night md:size-[124px]">
              <BarsMark className="w-1/2" />
            </div>
            <div className="bento-pop -ml-5 grid size-[104px] rotate-[10deg] place-items-center rounded-[26px] bg-paper text-night md:size-[124px]">
              <TargetMark className="w-1/2" />
            </div>
          </div>
          <h3 className="mt-auto max-w-[400px] pr-16 font-serif text-[clamp(1.8rem,2.6vw,2.4rem)] font-medium leading-[1.1]">{p2.text}</h3>
          <Num>{p2.num}</Num>
        </article>

        {/* D — principle 03 */}
        <article className="bento-card relative flex min-h-[460px] flex-col items-center overflow-hidden rounded-[28px] border border-solid border-line bg-coal px-8 pb-24 pt-14 text-center transition-colors duration-300 hover:border-accent/40 hover:bg-[#0B1624] md:min-h-[520px]">
          <h3 className="max-w-[420px] font-serif text-[clamp(1.8rem,2.6vw,2.4rem)] font-medium leading-[1.1]">
            {p3.text}
          </h3>
          <div className="mt-auto flex items-center justify-center pt-10" aria-hidden="true">
            <div className="bento-pop grid size-[130px] place-items-center rounded-full border-4 border-solid border-coal bg-teal text-paper md:size-[150px]">
              <AsteriskMark className="w-2/5" />
            </div>
            <div className="bento-pop -ml-8 grid size-[130px] place-items-center rounded-full border-4 border-solid border-coal bg-accent text-night md:size-[150px]">
              <BarsMark className="w-2/5" />
            </div>
            <div className="bento-pop -ml-8 grid size-[130px] place-items-center rounded-full border-4 border-solid border-coal bg-paper text-night md:size-[150px]">
              <TargetMark className="w-2/5" />
            </div>
          </div>
          <Num>{p3.num}</Num>
        </article>
      </div>
    </section>
  )
}
