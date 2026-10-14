import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initGhostFibers } from './ghost-fibers.js'
import { initSpecularButton } from './specular-button.js'
import { initStaggeredMenu } from './staggered-menu.js'
import { CONFIG, EN } from './i18n.js'

gsap.registerPlugin(ScrollTrigger)

const EMAIL = 'vanvas@scaleagency.lat,gerardo@scaleagency.lat'
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

const safe = (name, fn) => {
  try { fn() } catch (e) { console.error(`[${name}]`, e) }
}

/* ---------- global background ---------- */
const FIBERS = {
  glowColor: '#2f5bff',
  speed: 0.2,
  scale: 2,
  rotationSpeed: 0.25,
  layers: 4,
  twist: 0.1,
  threads: 1,
  glow: 1.3,
  brightness: 0.9,
  vignette: 0.8,
  rotation: 0,
  waves: 0.015,
  spread: 1,
  thickness: 1,
  grain: 0.03,
  mouseInteraction: true,
  lightMode: false,
}

function initBackground() {
  initGhostFibers($('#floatingLines'), FIBERS)
}

/* ---------- cinematic hero ---------- */
function initHero() {
  const container = $('#inicio')
  const mainCard = $('#mainCard')
  const mockup = $('#mockup')
  const metricValue = 5

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
const MENU_LABELS = { es: { open: 'Menú', close: 'Cerrar' }, en: { open: 'Menu', close: 'Close' } }
let menu = null

function initMenu() {
  const container = $('#menu')
  if (!container) return
  menu = initStaggeredMenu(container, {
    position: 'right',
    menuButtonColor: '#ffffff',
    openMenuButtonColor: '#ffffff',
    changeMenuColorOnOpen: true,
    labels: { ...MENU_LABELS.es },
  })
  initGhostFibers($('#menuFibers'), FIBERS)

  const onScroll = () => container.classList.toggle('is-scrolled', scrollY > 24)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const sections = $$('.cc-section[id], .cc-hero[id]')
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const id = entry.target.id
      container.querySelectorAll('.sm-panel-item').forEach((el) => {
        el.classList.toggle('is-active', el.getAttribute('href') === `#${id}`)
      })
    }
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 })
  sections.forEach((s) => observer.observe(s))
}

/* ---------- whileInView reveals ---------- */
function initReveal() {
  const blocks = $$('.reveal')
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    blocks.forEach((el) => el.classList.add('in'))
    return
  }
  blocks.forEach((el) => {
    const kids = [...el.children]
    const targets = kids.length > 1 ? kids : [el]
    gsap.set(targets, { autoAlpha: 0, y: 48, scale: 0.98, filter: 'blur(10px)', transition: 'none' })
    el.classList.add('in')
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(targets, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        stagger: { each: 0.12, from: 'start' },
        clearProps: 'opacity,visibility,transform,filter,transition',
      }),
    })
  })
}

/* ---------- draggable logo marquee ---------- */
function initLogos() {
  const viewport = $('#logosViewport'), track = $('#logosTrack')
  track.innerHTML += track.innerHTML
  const LOGO_AREA = 5200
  const sizeLogo = (img) => {
    const ratio = img.naturalWidth / img.naturalHeight
    if (!ratio) return
    img.style.height = `${Math.round(Math.sqrt(LOGO_AREA / ratio))}px`
  }
  $$('img', track).forEach((img) => {
    img.loading = 'eager'
    if (img.complete) sizeLogo(img)
    else img.addEventListener('load', () => sizeLogo(img), { once: true })
  })
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
    const q = $('.faq-q', item), a = $('.faq-a', item), p = $('p', a)
    if ((q.getAttribute('aria-expanded') === 'true') === open) return
    q.setAttribute('aria-expanded', String(open))
    item.classList.toggle('is-open', open)
    gsap.killTweensOf([a, p])
    if (open) {
      gsap.to(a, { height: 'auto', duration: 0.65, ease: 'power3.inOut' })
      gsap.fromTo(p,
        { autoAlpha: 0, y: -14, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, delay: 0.18, ease: 'power3.out', clearProps: 'filter' })
    } else {
      gsap.to(p, { autoAlpha: 0, y: -8, duration: 0.25, ease: 'power2.in' })
      gsap.to(a, { height: 0, duration: 0.45, ease: 'power3.inOut' })
    }
  }
  items.forEach((item) => {
    $('.faq-q', item).addEventListener('click', () => {
      const willOpen = $('.faq-q', item).getAttribute('aria-expanded') !== 'true'
      items.forEach((other) => set(other, other === item && willOpen))
    })
  })
}

/* ---------- language (ES markup / EN dictionary) ---------- */
let lang = 'es'
const ES = {}

const waLink = () => (CONFIG.WHATSAPP
  ? `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(CONFIG.WA_MSG[lang])}`
  : '')
const ctaTarget = () => CONFIG.CALENDAR_URL || waLink()

function setLang(next) {
  lang = next === 'en' ? 'en' : 'es'
  const dict = lang === 'en' ? EN : ES
  $$('[data-i18n]').forEach((n) => {
    const v = dict[n.dataset.i18n]
    if (v !== undefined) n.innerHTML = v
  })
  document.documentElement.lang = lang
  document.title = lang === 'en' ? 'SCALE · Commercial direction' : 'SCALE · Dirección comercial'
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)))
  menu?.setLabels(MENU_LABELS[lang])
  $$('.faq-q[aria-expanded="true"] + .faq-a').forEach((a) => { a.style.height = `${a.scrollHeight}px` })
  try { localStorage.setItem('scale-lang', lang) } catch { /* storage unavailable */ }
}

function initI18n() {
  $$('[data-i18n]').forEach((n) => {
    const k = n.dataset.i18n
    if (!(k in ES)) ES[k] = n.innerHTML
  })
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)))
  let saved = null
  try { saved = localStorage.getItem('scale-lang') } catch { /* storage unavailable */ }
  setLang(saved)
}

/* ---------- method pillars ---------- */
function initPillars() {
  const pillars = $$('.m-pillar')
  const activate = (p) => pillars.forEach((x) => {
    const on = x === p
    x.classList.toggle('active', on)
    x.setAttribute('aria-expanded', String(on))
  })
  pillars.forEach((p) => {
    p.addEventListener('click', () => activate(p))
    p.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) activate(p) })
    p.addEventListener('focus', () => activate(p))
  })
}

/* ---------- floating CTA ---------- */
function initFloat() {
  const btn = $('#floatCta')
  const contact = $('#contacto')
  let contactVisible = false
  const update = () => btn.classList.toggle('show', scrollY > innerHeight * 4 && !contactVisible)
  new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; update() }).observe(contact)
  addEventListener('scroll', update, { passive: true })
  update()
}

/* ---------- contact modal ---------- */
function initModal() {
  const modal = $('#contactModal')
  const form = $('#contactForm')
  const open = (e) => {
    e?.preventDefault()
    const target = ctaTarget()
    if (target) { window.open(target, '_blank', 'noopener'); return }
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
safe('specular', () => {
  $$('.btn-violet, .btn-outline, .btn-modern-light, .float-cta').forEach((b) => initSpecularButton(b, {
    radius: 9999,
    lineColor: '#ffffff',
    baseColor: '#7aa5ff',
    intensity: 1,
    idleIntensity: 0.35,
    shineSize: 10,
    shineFade: 34,
    thickness: 1.2,
    glow: 1,
    followMouse: true,
    proximity: 250,
  }))
})
safe('pillars', initPillars)
safe('float', initFloat)
safe('i18n', initI18n)
