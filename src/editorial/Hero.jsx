import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { hero, palette } from './content'
import Frame from './Frame'

const NODE_POS = [
  'left-[4%] top-[13%] md:left-[7%] md:top-[11%]',
  'right-[5%] top-[15%] md:right-auto md:left-[76%] md:top-[14%]',
  'left-[6%] bottom-[9%] md:left-[18%] md:bottom-auto md:top-[64%]',
  'right-[3%] bottom-[11%] md:right-auto md:left-[66%] md:bottom-auto md:top-[70%]',
]

export default function Hero({ onContact }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      if (reduced) return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.ed-frame__line--t, .ed-frame__line--b', { scaleX: 0, duration: 1.6 }, 0)
        .from('.ed-frame__line--l, .ed-frame__line--r', { scaleY: 0, duration: 1.6 }, 0)
        .from('.ed-cross', { opacity: 0, scale: 0, duration: 0.8, stagger: 0.08 }, 0.6)
        .from('.ed-micro-hero', { opacity: 0, y: 10, duration: 1, stagger: 0.1 }, 0.8)
        .from('.ed-ring', { opacity: 0, scale: 0.6, duration: 1.8 }, 0.4)
        .from('.ed-node', { opacity: 0, scale: 0.4, rotate: (i) => [-14, 10, -8, 12][i], y: 60, duration: 1.4, stagger: 0.12 }, 0.5)
        .from('.ed-reveal', { yPercent: 110, duration: 1.3, stagger: 0.1 }, 0.7)
        .from('.ed-hero-cta', { opacity: 0, y: 20, duration: 1 }, 1.2)

      gsap.utils.toArray('.ed-node').forEach((node, i) => {
        gsap.to(node, { y: i % 2 ? 14 : -14, rotate: i % 2 ? 3 : -3, duration: 3.5 + i * 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 })
      })

      gsap.to('.ed-node-layer', {
        scale: 1.25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.ed-hero-copy', {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'center center', end: 'bottom top', scrub: true },
      })
    }, root)

    const layer = root.querySelector('.ed-node-parallax')
    const onMove = (e) => {
      if (reduced || !layer) return
      const x = (e.clientX / window.innerWidth - 0.5) * 24
      const y = (e.clientY / window.innerHeight - 0.5) * 24
      gsap.to(layer, { x, y, duration: 1.2, ease: 'power3.out' })
    }
    window.addEventListener('pointermove', onMove)

    return () => {
      window.removeEventListener('pointermove', onMove)
      ctx.revert()
    }
  }, [])

  return (
    <section id="inicio" ref={rootRef} className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-void text-white">
      <Frame />

      <span className="ed-micro ed-micro-hero absolute bottom-[calc(var(--frame)-1.6rem)] left-[calc(var(--frame)+1rem)] hidden md:block">{hero.micro[0]}</span>
      <span className="ed-micro ed-micro-hero absolute bottom-[calc(var(--frame)-1.6rem)] right-[calc(var(--frame)+1rem)] hidden md:block">{hero.micro[2]}</span>
      <span className="ed-micro ed-micro-hero absolute right-4 top-1/2 hidden origin-right -translate-y-1/2 rotate-90 whitespace-nowrap text-white/30 lg:block">{hero.micro[1]}</span>

      <div className="ed-node-layer pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="ed-node-parallax absolute inset-0">
          <span className="ed-ring left-1/2 top-1/2 h-[min(80vw,34rem)] w-[min(80vw,34rem)] -translate-x-1/2 -translate-y-1/2" />
          <span className="ed-ring left-1/2 top-1/2 h-[min(120vw,52rem)] w-[min(120vw,52rem)] -translate-x-1/2 -translate-y-1/2" />
          {palette.map((node, i) => (
            <div key={node.name} className={`absolute ${NODE_POS[i]}`}>
              <div className={`ed-node ed-node--${node.shape}`} style={{ background: node.shape === 'wide' ? '#1E1E1E' : node.hex }}>
                <b>{node.name}</b>
                <span>{node.role}<br />{node.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ed-hero-copy relative z-20 flex mix-blend-difference flex-col items-center px-6 text-center">
        <span className="ed-mask mb-5">
          <span className="ed-reveal ed-micro text-white/70">{hero.eyebrow}</span>
        </span>
        <h1 className="text-[clamp(2.6rem,9vw,7.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
          <span className="ed-mask"><span className="ed-reveal">{hero.title}</span></span>
          <span className="ed-mask"><span className="ed-reveal ed-italic pl-[0.8em] text-white/80">{hero.titleItalic}</span></span>
        </h1>
        <span className="ed-mask mt-7 max-w-md">
          <span className="ed-reveal text-sm font-light leading-relaxed text-neutral-400 md:text-base">{hero.body}</span>
        </span>
        <div className="ed-hero-cta mt-10">
          <button type="button" className="ed-btn" onClick={onContact}>
            {hero.cta}
            <span className="ed-btn__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <span className="ed-scroll-line z-20" aria-hidden="true" />
    </section>
  )
}
