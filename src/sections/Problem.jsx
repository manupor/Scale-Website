import { useEffect, useRef } from 'react'
import { problem } from '../content'
import { gsap, prefersReducedMotion } from '../lib/motion'

export default function Problem() {
  const ref = useRef(null)
  const words = problem.text.split(' ')

  useEffect(() => {
    if (prefersReducedMotion()) {
      ref.current?.querySelectorAll('.mani-word').forEach((w) => w.style.setProperty('color', '#F7F5EF'))
      return undefined
    }
    const ctx = gsap.context(() => {
      gsap.to('.mani-word', {
        color: '#F7F5EF',
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 78%',
          end: 'bottom 55%',
          scrub: 0.5,
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="problema" aria-labelledby="problem-title" className="py-[16vh] text-center md:py-[20vh]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{problem.eyebrow}</p>
      <h2 id="problem-title" className="mx-auto mt-8 max-w-[1150px] px-6 font-serif text-[clamp(2.4rem,5.6vw,5.4rem)] font-medium uppercase leading-[1.04]">
        {words.map((word, i) => (
          <span key={i}>
            <span className="mani-word inline-block text-dim">{word}</span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h2>
      <p className="mx-auto mt-10 max-w-[560px] px-6 text-lg leading-relaxed text-mute">{problem.body}</p>
    </section>
  )
}
