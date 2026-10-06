import { footer } from '../content'
import { BarsMark } from '../components/Glyphs'

export default function Footer() {
  return (
    <footer className="site-footer bg-night text-paper">
      <div className="mx-auto max-w-[1760px] px-6 pb-10 pt-16 md:px-14 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <a href="#inicio" aria-label="SCALE, volver al inicio" className="inline-flex items-center gap-3 text-paper">
              <BarsMark className="h-8 w-8 text-teal" />
              <span className="font-serif text-3xl font-semibold tracking-[0.24em]">SCALE</span>
            </a>
            <p className="mt-7 max-w-[300px] text-xl leading-snug text-paper/65">{footer.tagline}</p>
          </div>

          <nav aria-label="Pie de página" className="grid grid-cols-2 gap-10 lg:justify-items-end">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[15px] font-bold">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-[15px] text-paper/65 transition-colors hover:text-teal">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 pt-8 text-sm text-paper/65 md:mt-20 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} SCALE · Miami</span>
          <span className="font-serif text-lg italic">{footer.signature}</span>
        </div>
      </div>
    </footer>
  )
}
