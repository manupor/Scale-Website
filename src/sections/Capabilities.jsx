import { capabilities, capabilitiesIntro } from '../content'
import { AsteriskMark, BarsMark, RootMark, TargetMark } from '../components/Glyphs'

const GLYPHS = [BarsMark, TargetMark, RootMark, AsteriskMark]

function Item({ name, index }) {
  const Glyph = GLYPHS[index % GLYPHS.length]
  return (
    <li className="flex shrink-0 items-center gap-3 px-10 text-mute md:px-14">
      <Glyph className="size-6" />
      <span className="font-serif text-2xl font-semibold md:text-3xl">{name}</span>
    </li>
  )
}

export default function Capabilities() {
  return (
    <section id="capacidades" aria-labelledby="caps-title" className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-[1240px] px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-mute">{capabilitiesIntro.eyebrow}</p>
        <h2 id="caps-title" className="mx-auto mt-4 max-w-[640px] font-serif text-[clamp(2rem,3.6vw,3rem)] font-medium leading-[1.05]">
          {capabilitiesIntro.title}
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] leading-relaxed text-mute">{capabilitiesIntro.body}</p>
      </div>

      {/* Static, readable list for assistive tech; the marquee below is a visual duplicate. */}
      <ul className="sr-only">
        {capabilities.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <div className="marquee-mask" aria-hidden="true">
        <ul className="animate-marquee flex w-max items-center">
          {[...capabilities, ...capabilities].map((name, i) => (
            <Item key={`${name}-${i}`} name={name} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
