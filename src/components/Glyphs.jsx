/** Recurring geometric glyphs for the SCALE content sections. All decorative. */

export function BarsMark({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="currentColor">
      <rect x="4" y="22" width="8" height="14" rx="1" opacity="0.55" />
      <rect x="16" y="13" width="8" height="23" rx="1" opacity="0.8" />
      <rect x="28" y="4" width="8" height="32" rx="1" />
    </svg>
  )
}

export function AsteriskMark({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="currentColor">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="29" y="2" width="6" height="60" rx="3" transform={`rotate(${i * 22.5} 32 32)`} />
      ))}
    </svg>
  )
}

export function TargetMark({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4">
      <circle cx="24" cy="24" r="20" />
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function RootMark({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
      <path d="M24 4v22M24 26c-6 4-10 9-12 16M24 26c6 4 10 9 12 16M24 26v16" />
    </svg>
  )
}

export function QuoteGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 72 44" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16 0c9 0 16 7 16 16 0 12-8 22-20 28l-4-6c7-4 11-9 12-14-1 1-3 1-4 1C7 25 0 18 0 10 0 4 7 0 16 0Zm40 0c9 0 16 7 16 16 0 12-8 22-20 28l-4-6c7-4 11-9 12-14-1 1-3 1-4 1-9 0-16-7-16-15 0-6 7-10 16-10Z" />
    </svg>
  )
}

export function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="11" fill="#0B1322" />
      <path d="m7 12.5 3.2 3.2L17 9" stroke="#D4C5A9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRight({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15m-6-7 7 7-7 7" />
    </svg>
  )
}

export function PlusIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-coal px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent ${className}`}>
      <span className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  )
}
