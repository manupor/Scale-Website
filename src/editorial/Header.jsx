import { useEffect, useState } from 'react'
import { nav } from './content'

export default function Header({ onContact }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-5">
      <div
        className={`flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border px-4 py-2.5 transition-all duration-500 md:px-6 ${
          scrolled ? 'border-white/10 bg-black/60 backdrop-blur-xl' : 'border-transparent bg-transparent'
        }`}
      >
        <a href="#inicio" className="flex items-center gap-2.5 text-white" aria-label="SCALE inicio">
          <span className="scale-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="font-mono text-sm font-bold tracking-[0.3em]">SCALE</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="ed-micro transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <button type="button" onClick={onContact} className="ed-btn !px-4 !py-2 !text-[10px]">
          Diagnóstico
        </button>
      </div>
    </header>
  )
}
