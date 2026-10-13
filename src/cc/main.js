import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initFloatingLines } from './floating-lines.js'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'hola@tudominio.com'
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

const safe = (name, fn) => {
  try { fn() } catch (e) { console.error(`[${name}]`, e) }
}

/* ---------- global background ---------- */
function initBackground() {
  initFloatingLines($('#floatingLines'), {
    enabledWaves: ['top', 'middle', 'bottom'],
    lineCount: 5,
    lineDistance: 5,
    bendRadius: 5,
    bendStrength: -0.5,
    interactive: true,
    parallax: true,
    linesGradient: ['#3b0764', '#4c1d95', '#2e1065'],
  })
}

/* ---------- cinematic hero ---------- */
function initHero() {
  const container = $('#home')
  const mainCard = $('#mainCard')
  const mockup = $('#mockup')
  const metricValue = 7

  let raf = 0
  addEventListener('mousemove', (e) => {
    if (scrollY > innerHeight * 2) return
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const rect = mainCard.getBoundingClientRect()
      mainCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
      mainCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
      const x = (e.clientX / innerWidth - 0.5) * 2
      const y = (e.clientY / innerHeight - 0.5) * 2
      gsap.to(mockup, { rotationY: x * 12, rotationX: -y * 12, ease: 'power3.out', duration: 1.2 })
    })
  })

  const isMobile = innerWidth < 768
  gsap.context(() => {
    gsap.set('.cc-text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 })
    gsap.set('.cc-text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
    gsap.set('.cc-main-card', { y: innerHeight + 200, autoAlpha: 1 })
    gsap.set(['.cc-card-left', '.cc-card-right', '.cc-mockup-wrapper', '.cc-badge', '.cc-phone-widget'], { autoAlpha: 0 })
    gsap.set('.cc-cta-wrapper', { autoAlpha: 0, scale: 0.8, filter: 'blur(30px)' })

    gsap.timeline({ delay: 0.3 })
      .to('.cc-text-track', { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', rotationX: 0, ease: 'expo.out' })
      .to('.cc-text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0')

    gsap.timeline({
      scrollTrigger: { trigger: container, start: 'top top', end: '+=3500', pin: true, scrub: 1, anticipatePin: 1 },
    })
      .to(['.cc-hero-text', '.cc-bg-grid'], { scale: 1.15, filter: 'blur(20px)', opacity: 0.2, ease: 'power2.inOut', duration: 2 }, 0)
      .to('.cc-main-card', { y: 0, ease: 'power3.inOut', duration: 2 }, 0)
      .to('.cc-main-card', { width: '100%', height: '100%', borderRadius: '0px', ease: 'power3.inOut', duration: 1.5 })
      .fromTo('.cc-mockup-wrapper',
        { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
        { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 2.5 }, '-=0.8')
      .fromTo('.cc-phone-widget', { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: 'back.out(1.2)', duration: 1.5 }, '-=1.5')
      .to('.cc-progress-ring', { strokeDashoffset: 60, duration: 2, ease: 'power3.inOut' }, '-=1.2')
      .to('.cc-counter-val', { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: 'expo.out' }, '-=2.0')
      .fromTo('.cc-badge', { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: 'back.out(1.5)', duration: 1.5, stagger: 0.2 }, '-=2.0')
      .fromTo('.cc-card-left', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: 'power4.out', duration: 1.5 }, '-=1.5')
      .fromTo('.cc-card-right', { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: 'expo.out', duration: 1.5 }, '<')
      .to({}, { duration: 2.5 })
      .set('.cc-hero-text', { autoAlpha: 0 })
      .set('.cc-cta-wrapper', { autoAlpha: 1 })
      .to({}, { duration: 1.5 })
      .to(['.cc-mockup-wrapper', '.cc-badge', '.cc-card-left', '.cc-card-right'], { scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: 'power3.in', duration: 1.2, stagger: 0.05 })
      .to('.cc-main-card', { width: isMobile ? '92vw' : '85vw', height: isMobile ? '92vh' : '85vh', borderRadius: isMobile ? '32px' : '40px', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
      .to('.cc-cta-wrapper', { scale: 1, filter: 'blur(0px)', ease: 'expo.inOut', duration: 1.8 }, 'pullback')
      .to('.cc-main-card', { y: -innerHeight - 300, ease: 'power3.in', duration: 1.5 })
  }, container)
}

/* ---------- staggered menu ---------- */
function initMenu() {
  const wrapper = $('#menu')
  const panel = $('#staggered-menu-panel')
  const layers = $$('.sm-prelayer', wrapper)
  const toggle = $('#smToggle')
  const icon = $('#smIcon')
  const plusH = $('#smPlusH'), plusV = $('#smPlusV')
  const textInner = $('#smTextInner')
  const backdrop = $('#navBackdrop')
  const OPEN = 'Cerrar', CLOSED = 'Menú'
  let open = false, busy = false, openTl = null, closeTween = null

  gsap.set([panel, ...layers], { xPercent: 100 })
  gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
  gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
  gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
  gsap.set(textInner, { yPercent: 0 })

  const items = () => $$('.sm-panel-itemLabel', panel)

  const playOpen = () => {
    if (busy) return
    busy = true
    openTl?.kill(); closeTween?.kill()
    gsap.set(items(), { yPercent: 140, rotate: 10 })
    const tl = gsap.timeline({ onComplete: () => { busy = false } })
    layers.forEach((el, i) => tl.fromTo(el, { xPercent: gsap.getProperty(el, 'xPercent') }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07))
    const panelAt = (layers.length - 1) * 0.07 + (layers.length ? 0.08 : 0)
    tl.fromTo(panel, { xPercent: gsap.getProperty(panel, 'xPercent') }, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, panelAt)
    tl.to(items(), { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, panelAt + 0.65 * 0.15)
    openTl = tl
  }

  const playClose = () => {
    openTl?.kill(); openTl = null
    closeTween?.kill()
    closeTween = gsap.to([...layers, panel], {
      xPercent: 100, duration: 0.32, ease: 'power3.in', overwrite: 'auto',
      onComplete: () => { gsap.set(items(), { yPercent: 140, rotate: 10 }); busy = false },
    })
  }

  const animateText = (opening) => {
    const from = opening ? CLOSED : OPEN, to = opening ? OPEN : CLOSED
    const seq = [from]
    let last = from
    for (let i = 0; i < 3; i++) { last = last === CLOSED ? OPEN : CLOSED; seq.push(last) }
    if (last !== to) seq.push(to)
    seq.push(to)
    textInner.innerHTML = seq.map((l) => `<span class="sm-toggle-line">${l}</span>`).join('')
    gsap.set(textInner, { yPercent: 0 })
    gsap.to(textInner, { yPercent: -((seq.length - 1) / seq.length) * 100, duration: 0.5 + seq.length * 0.07, ease: 'power4.out' })
  }

  const measure = (label) => {
    const s = document.createElement('span')
    s.textContent = label
    s.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit'
    toggle.appendChild(s)
    const w = s.getBoundingClientRect().width
    s.remove()
    return Math.ceil(w)
  }

  const setOpen = (next) => {
    if (next === open) return
    open = next
    wrapper.toggleAttribute('data-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
    panel.setAttribute('aria-hidden', String(!open))
    if (open) playOpen(); else playClose()
    gsap.to(icon, open ? { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' } : { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' })
    animateText(open)
  }

  textInner.parentElement.style.width = `${Math.max(measure(OPEN), measure(CLOSED))}px`
  toggle.addEventListener('click', () => setOpen(!open))
  $$('.sm-panel-item', panel).forEach((a) => a.addEventListener('click', () => setOpen(false)))
  document.addEventListener('mousedown', (e) => {
    if (open && !panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false)
  })

  const onScroll = () => backdrop.classList.toggle('on', scrollY > 20)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

/* ---------- whileInView reveals ---------- */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
  }, { rootMargin: '0px 0px -80px 0px' })
  $$('.reveal').forEach((el) => io.observe(el))
}

/* ---------- draggable logo marquee ---------- */
function initLogos() {
  const viewport = $('#logosViewport'), track = $('#logosTrack')
  track.innerHTML += track.innerHTML
  const DURATION = 35
  let dragging = false, startX = 0, baseX = 0, curX = 0

  const matrixX = () => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41
  viewport.addEventListener('mousedown', (e) => {
    dragging = true
    viewport.classList.add('dragging')
    startX = e.clientX
    baseX = curX = matrixX()
    track.style.animationPlayState = 'paused'
    track.style.transform = `translateX(${baseX}px)`
    track.style.animation = 'none'
  })
  addEventListener('mousemove', (e) => {
    if (!dragging) return
    curX = baseX + (e.clientX - startX)
    track.style.transform = `translateX(${curX}px)`
  })
  addEventListener('mouseup', () => {
    if (!dragging) return
    dragging = false
    viewport.classList.remove('dragging')
    const half = track.scrollWidth / 2
    const progress = ((-curX / half) % 1 + 1) % 1
    track.style.transform = ''
    track.style.animation = ''
    track.style.animationDelay = `${-progress * DURATION}s`
  })
}

function initTech() {
  const track = $('.tech-track')
  track.innerHTML += track.innerHTML
}

/* ---------- faq accordion ---------- */
function initFaq() {
  const items = $$('.faq-item')
  const set = (item, open) => {
    const q = $('.faq-q', item), a = $('.faq-a', item)
    q.setAttribute('aria-expanded', String(open))
    a.style.height = open ? `${a.scrollHeight}px` : '0px'
    a.style.opacity = open ? '1' : '0'
  }
  items.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const willOpen = $('.faq-q', item).getAttribute('aria-expanded') !== 'true'
      items.forEach((other) => set(other, other === item && willOpen))
    })
  })
}

/* ---------- contact modal ---------- */
function initModal() {
  const modal = $('#contactModal')
  const form = $('#contactForm')
  const open = (e) => {
    e?.preventDefault()
    modal.classList.add('open')
    modal.setAttribute('aria-hidden', 'false')
    setTimeout(() => $('input', form)?.focus(), 50)
  }
  const close = () => {
    modal.classList.remove('open')
    modal.setAttribute('aria-hidden', 'true')
  }
  $$('[data-open-modal]').forEach((b) => b.addEventListener('click', open))
  $$('[data-close-modal]', modal).forEach((b) => b.addEventListener('click', close))
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const d = new FormData(form)
    const subject = encodeURIComponent(`Diagnóstico SCALE — ${d.get('name')}`)
    const body = encodeURIComponent(`${d.get('message')}\n\n${d.get('name')} · ${d.get('email')}`)
    location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
    form.reset()
    close()
  })
}

function initMeta() {
  $$('[data-email-href]').forEach((a) => { a.href = `mailto:${EMAIL}` })
  $$('[data-email-text]').forEach((s) => { s.textContent = EMAIL })
  $$('[data-year]').forEach((s) => { s.textContent = String(new Date().getFullYear()) })
}

safe('background', initBackground)
safe('hero', initHero)
safe('menu', initMenu)
safe('reveal', initReveal)
safe('logos', initLogos)
safe('tech', initTech)
safe('faq', initFaq)
safe('modal', initModal)
safe('meta', initMeta)
