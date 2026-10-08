import { footer } from './content'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-void px-6 pb-8 pt-20 text-white md:px-16">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a href="#inicio" className="flex items-center gap-2.5" aria-label="SCALE inicio">
            <span className="scale-mark" aria-hidden="true"><i /><i /><i /></span>
            <span className="font-mono text-sm font-bold tracking-[0.3em]">SCALE</span>
          </a>
          <p className="ed-italic mt-6 max-w-xs text-2xl leading-snug text-white/70">{footer.tagline}</p>
        </div>
        {footer.columns.map((col) => (
          <div key={col.title}>
            <span className="ed-micro mb-5 block">{col.title}</span>
            <ul className="grid gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-white/60 transition-colors hover:text-mango">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="pointer-events-none mx-auto mt-20 max-w-6xl select-none text-center text-[clamp(4rem,22vw,18rem)] font-light leading-[0.8] tracking-[-0.05em] text-white/[0.04]" aria-hidden="true">
        SCALE
      </p>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
        <span className="ed-micro text-white/30">{footer.legal}</span>
        <a href="#inicio" className="ed-micro text-white/30 transition-colors hover:text-white">Volver arriba ↑</a>
      </div>
    </footer>
  )
}
