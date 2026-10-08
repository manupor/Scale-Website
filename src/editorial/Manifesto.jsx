import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/motion'
import { manifesto } from './content'
import Frame from './Frame'

const COLORS = ['#5FD3A0', '#F5B041', '#FF7A6B', '#EBD9B4']

export default function Manifesto() {
  const stageRef = useRef(null)
  const barRef = useRef(null)
  const [active, setActive] = useState(0)
  const count = manifesto.statements.length

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setActive(Math.min(count - 1, Math.floor(self.progress * count)))
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  }, [count])

  return (
    <section id="manifiesto" ref={stageRef} className="relative bg-void text-white" style={{ height: `${count * 90 + 30}vh` }}>
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        <Frame />

        <span className="ed-micro absolute left-1/2 top-[calc(var(--frame)+2rem)] -translate-x-1/2">{manifesto.eyebrow}</span>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute rounded-full border transition-all duration-1000 ease-out"
              style={{
                width: `${18 + i * 14}vmin`,
                height: `${18 + i * 14}vmin`,
                borderColor: i <= active ? `${COLORS[i]}55` : 'rgba(255,255,255,0.05)',
                transform: `scale(${i <= active ? 1 : 0.85})`,
                boxShadow: i === active ? `0 0 80px ${COLORS[i]}22` : 'none',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 grid w-full max-w-4xl px-6 text-center">
          {manifesto.statements.map((s, i) => (
            <div
              key={s.kicker}
              className="col-start-1 row-start-1 transition-all duration-700 ease-out"
              style={{
                opacity: i === active ? 1 : 0,
                transform: `translateY(${i === active ? 0 : i < active ? -40 : 40}px)`,
                filter: i === active ? 'none' : 'blur(6px)',
              }}
              aria-hidden={i !== active}
            >
              <span className="ed-italic mb-4 block text-xl md:text-3xl" style={{ color: COLORS[i] }}>{s.kicker}</span>
              <p className="text-[clamp(1.6rem,4.4vw,3.4rem)] font-light leading-[1.1] tracking-tight">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-[calc(var(--frame)+2rem)] left-1/2 flex w-[min(20rem,70vw)] -translate-x-1/2 flex-col items-center gap-3">
          <span className="ed-micro">{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
          <span className="relative h-px w-full bg-white/10">
            <span ref={barRef} className="absolute inset-0 origin-left bg-white" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>
      </div>
    </section>
  )
}
