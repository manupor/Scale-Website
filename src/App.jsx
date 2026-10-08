import { useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/motion'
import Header from './editorial/Header'
import Hero from './editorial/Hero'
import Manifesto from './editorial/Manifesto'
import Comparison from './editorial/Comparison'
import MethodBento from './editorial/MethodBento'
import Faq from './editorial/Faq'
import FinalCta from './editorial/FinalCta'
import Footer from './editorial/Footer'

function DiagnosisForm() {
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    const endpoint = form.dataset.endpoint
    if (!endpoint) {
      setStatus('Envío en línea aún no conectado: su mensaje no se ha enviado.')
      return
    }

    setSending(true)
    setStatus('Enviando…')
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(res.statusText)
      form.reset()
      setStatus('Gracias. Recibimos su solicitud.')
    } catch {
      setStatus('No pudimos enviar su solicitud. Intente de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="diagnosis-form" data-endpoint="" onSubmit={onSubmit}>
      <label className="field">
        <span>Nombre</span>
        <input type="text" name="nombre" autoComplete="name" required />
      </label>
      <label className="field">
        <span>Empresa</span>
        <input type="text" name="empresa" autoComplete="organization" required />
      </label>
      <label className="field">
        <span>Email</span>
        <input type="email" name="email" autoComplete="email" required />
      </label>
      <label className="field">
        <span>Teléfono (opcional)</span>
        <input type="tel" name="telefono" autoComplete="tel" />
      </label>
      <label className="field field-full">
        <span>¿Qué quiere lograr?</span>
        <textarea name="mensaje" rows="3" />
      </label>
      <label className="consent">
        <input type="checkbox" name="consentimiento" required />
        <span>Acepto que SCALE use estos datos únicamente para responder a mi solicitud.</span>
      </label>
      <div className="form-actions">
        <button className="form-submit" type="submit" disabled={sending}>
          Solicitar diagnóstico ↗
        </button>
        <p className="form-status" role="status" aria-live="polite">{status}</p>
      </div>
    </form>
  )
}

function App() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)

  // Layout shifts once fonts and images arrive; re-measure every scroll trigger.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  useEffect(() => {
    if (!contactOpen) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') setContactOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [contactOpen])

  return (
    <>
      <a className="skip-link" href="#manifiesto">Saltar al contenido</a>
      <Header onContact={openContact} />

      <main className="bg-void text-white">
        <Hero onContact={openContact} />
        <Manifesto />
        <Comparison />
        <MethodBento onContact={openContact} />
        <Faq />
        <FinalCta onContact={openContact} />
      </main>
      <Footer />

      <div className={contactOpen ? 'contact-panel is-open' : 'contact-panel'} role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-hidden={!contactOpen} inert={!contactOpen}>
        <button className="contact-backdrop" type="button" aria-label="Cerrar panel de contacto" onClick={() => setContactOpen(false)} />
        <div className="contact-sheet">
          <button className="contact-close" type="button" onClick={() => setContactOpen(false)} aria-label="Cerrar">Cerrar</button>
          <span className="contact-kicker">Diagnóstico · SCALE Miami</span>
          <h2 id="contact-title">Crecer no es producir más.<br /><em>Es construir un sistema.</em></h2>
          <p>Cuéntenos sobre su marca. El primer paso es entender su estructura.</p>
          <DiagnosisForm />
        </div>
      </div>
    </>
  )
}

export default App
