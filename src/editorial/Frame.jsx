export default function Frame({ className = '' }) {
  return (
    <div className={`ed-frame ${className}`.trim()} aria-hidden="true">
      <span className="ed-frame__line ed-frame__line--t" />
      <span className="ed-frame__line ed-frame__line--b" />
      <span className="ed-frame__line ed-frame__line--l" />
      <span className="ed-frame__line ed-frame__line--r" />
      <span className="ed-cross ed-cross--tl" />
      <span className="ed-cross ed-cross--tr" />
      <span className="ed-cross ed-cross--bl" />
      <span className="ed-cross ed-cross--br" />
    </div>
  )
}
