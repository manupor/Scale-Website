import { useEffect, useRef, useState } from 'react'
import { nav, signature } from '../content'

function ScaleMark() {
  return (
    <span className="scale-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  )
}

export default function Header({ onContact }) {
  const [open, setOpen] = useState(false)
  const [calm, setCalm] = useState(false)
  const [solid, setSolid] = useState(false)
  const [current, setCurrent] = useState('#inicio')
  const triggerRef = useRef(null)
  const closeRef = useRef(null)

  // Velune behaviour: fade the header while descending through the sequence; solid once past it.
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const stage = document.querySelector('[data-sequence]')
      const y = window.scrollY
      if (stage) {
        const travel = Math.max(1, stage.offsetHeight - window.innerHeight)
        const progress = Math.min(1, Math.max(0, (y - stage.offsetTop) / travel))
        setCalm(progress > 0.08 && progress < 0.92 && y > last)
        setSolid(y > stage.offsetTop + travel)
      }
      last = y
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Mark the nav item for the section in view.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setCurrent(`#${entry.target.id}`) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    nav.forEach(({ href }) => {
      const el = document.querySelector(href)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return undefined
    const t = setTimeout(() => closeRef.current?.focus(), 120)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  return (
    <>
      <header className={solid ? 'site-header is-solid' : 'site-header'} data-calm={String(calm && !open)}>
        <a className="brand" href="#inicio" aria-label="SCALE, inicio">
          <ScaleMark />
          <span>SCALE</span>
        </a>

        <nav className="nav-pill" aria-label="Principal">
          {nav.map((item) => (
            <a key={item.href} href={item.href} aria-current={current === item.href ? 'true' : undefined}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button className="header-cta header-cta--bar" type="button" onClick={onContact}>
            Agendar diagnóstico
          </button>
          <button
            ref={triggerRef}
            className="menu-trigger"
            type="button"
            aria-expanded={open}
            aria-controls="menu-panel"
            onClick={() => setOpen(true)}
          >
            <span>Menú</span>
            <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 6h12M3 12h12" /></svg>
          </button>
        </div>
      </header>

      <div className={open ? 'menu-backdrop is-open' : 'menu-backdrop'} onClick={() => close(true)} aria-hidden="true" />
      <aside className={open ? 'menu-panel is-open' : 'menu-panel'} id="menu-panel" aria-label="Menú" aria-hidden={!open} inert={!open}>
        <div className="menu-panel__top">
          <span>SCALE / MIAMI</span>
          <button ref={closeRef} className="menu-close" type="button" aria-label="Cerrar menú" onClick={() => close(true)}>
            <svg viewBox="0 0 18 18" aria-hidden="true"><path d="m4 4 10 10M14 4 4 14" /></svg>
          </button>
        </div>
        <nav aria-label="Menú ampliado">
          {nav.map((item, i) => (
            <a key={item.href} href={item.href} onClick={() => close()}>
              <span>{String(i + 1).padStart(2, '0')}</span> {item.label}
            </a>
          ))}
        </nav>
        <button className="header-cta" type="button" onClick={() => { close(); onContact() }}>
          Agendar diagnóstico ↗
        </button>
        <p>{signature}</p>
      </aside>
    </>
  )
}
