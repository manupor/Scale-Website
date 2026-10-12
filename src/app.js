import * as THREE from 'three'
import { initHero } from './hero3d.js'
import { initSistema, initFisica, initEcosistema } from './chapters.js'
import './app.css'

const CONTACT_EMAIL = 'hola@tudominio.com'
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- background: a quiet field of points ---------- */
function initBackground() {
  const canvas = document.getElementById('bg')
  const stage = document.getElementById('heroStage')
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' })
  } catch {
    canvas.remove()
    return
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
  camera.position.set(0, 6, 18)
  camera.lookAt(0, 0, 0)

  const small = innerWidth < 760
  const cols = small ? 90 : 170, rows = small ? 60 : 100
  const W = 64, D = 40
  const pos = new Float32Array(cols * rows * 3)
  let k = 0
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      pos[k++] = (i / (cols - 1) - 0.5) * W
      pos[k++] = 0
      pos[k++] = (j / (rows - 1) - 0.5) * D
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseAmp: { value: 0 },
    uSize: { value: 2.2 * renderer.getPixelRatio() },
    uGray: { value: new THREE.Color('#808080') },
    uBlue: { value: new THREE.Color('#0066ff') },
    uViolet: { value: new THREE.Color('#8c55ff') },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uScroll, uMouseAmp, uSize;
      uniform vec2 uMouse;
      varying float vH;
      varying float vFade;
      void main() {
        vec3 p = position;
        float t = uTime * 0.35 + uScroll * 1.6;
        float h = sin(p.x * 0.22 + t) * 0.9
                + sin(p.z * 0.35 + t * 0.8) * 0.7
                + sin((p.x + p.z) * 0.12 + t * 0.6) * 1.1;
        float d = distance(p.xz, uMouse);
        h += exp(-d * d * 0.02) * sin(d * 0.9 - uTime * 2.4) * 1.2 * uMouseAmp;
        p.y += h;
        vH = h;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vFade = smoothstep(-60.0, -8.0, mv.z) * (1.0 - smoothstep(-6.0, 4.0, mv.z));
        gl_PointSize = uSize * (14.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uGray, uBlue, uViolet;
      varying float vH;
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = dot(c, c);
        if (r > 0.25) discard;
        float a = smoothstep(0.25, 0.0, r);
        vec3 col = mix(uGray, uBlue, smoothstep(0.6, 2.4, vH));
        col = mix(col, uViolet, smoothstep(-0.6, -2.4, vH) * 0.8);
        gl_FragColor = vec4(col, a * vFade * 0.55);
      }`,
  })
  const points = new THREE.Points(geo, mat)
  points.rotation.x = -0.08
  scene.add(points)

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, amp: 0, tamp: 0 }
  addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * W * 0.8
    mouse.ty = (e.clientY / innerHeight - 0.35) * D
    mouse.tamp = 1
  }, { passive: true })

  function resize() {
    const w = innerWidth, h = innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  const clock = new THREE.Clock()
  let scrollP = 0, running = true
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden
    if (running) { clock.getDelta(); loop() }
  })
  function loop() {
    if (!running) return
    const dt = Math.min(clock.getDelta(), 0.05)
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight)
    scrollP += (scrollY / max - scrollP) * Math.min(1, dt * 4)
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3)
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3)
    mouse.tamp *= Math.exp(-dt * 0.8)
    mouse.amp += (mouse.tamp - mouse.amp) * Math.min(1, dt * 2)
    uniforms.uTime.value += reduced ? 0 : dt
    uniforms.uScroll.value = scrollP
    uniforms.uMouse.value.set(mouse.x, mouse.y)
    uniforms.uMouseAmp.value = mouse.amp
    camera.position.x = Math.sin(scrollP * Math.PI) * 3 + mouse.x * 0.02
    camera.position.y = 6 - scrollP * 3
    camera.lookAt(0, -scrollP * 2, 0)
    const stageEnd = stage ? stage.offsetHeight - innerHeight : 0
    canvas.style.opacity = String(Math.min(1, 0.12 + Math.max(0, scrollY - stageEnd) / innerHeight))
    renderer.render(scene, camera)
    if (!reduced) requestAnimationFrame(loop)
  }
  loop()
}

/* ---------- UI ---------- */
function initNav() {
  const container = document.querySelector('.pill-nav-container')
  const pills = [...container.querySelectorAll('.pill')]

  for (const pill of pills) {
    const text = pill.textContent.trim()
    pill.setAttribute('aria-label', text)
    pill.innerHTML = '<span class="hover-circle" aria-hidden="true"></span>'
      + `<span class="label-stack"><span class="pill-label">${text}</span><span class="pill-label-hover" aria-hidden="true">${text}</span></span>`
  }

  const layout = () => {
    for (const pill of pills) {
      const circle = pill.querySelector('.hover-circle')
      const { width: w, height: h } = pill.getBoundingClientRect()
      if (!w || !h) continue
      const R = ((w * w) / 4 + h * h) / (2 * h)
      const D = Math.ceil(2 * R) + 2
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
      circle.style.width = `${D}px`
      circle.style.height = `${D}px`
      circle.style.bottom = `-${delta}px`
      circle.style.transformOrigin = `50% ${D - delta}px`
      pill.style.setProperty('--h', `${h}px`)
    }
  }
  layout()
  addEventListener('resize', layout)
  document.fonts?.ready.then(layout).catch(() => { })

  const onScroll = () => container.classList.toggle('scrolled', scrollY > 20)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const btn = container.querySelector('.mobile-menu-button')
  const setOpen = (open) => {
    container.classList.toggle('open', open)
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú')
  }
  btn.addEventListener('click', () => setOpen(!container.classList.contains('open')))
  for (const a of container.querySelectorAll('.mobile-menu-link')) a.addEventListener('click', () => setOpen(false))
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false) })

}

/* ---------- immersive timeline: fixed layers crossfaded by scroll ---------- */
const FADE = 0.25

function initLayers() {
  const scroller = document.getElementById('scroller')
  if (!scroller) return
  const layers = [...document.querySelectorAll('[data-layer]')].map((el) => ({
    el,
    start: +el.dataset.start,
    end: el.dataset.end ? +el.dataset.end : Infinity,
    content: el.classList.contains('content'),
    active: false,
  }))
  const byId = new Map(layers.map((l) => [l.el.id, l]))
  const tracks = [...scroller.querySelectorAll('.track')]
  const last = Math.max(...layers.map((l) => (Number.isFinite(l.end) ? l.end : l.start)))

  const size = () => {
    const vh = innerHeight
    scroller.style.height = `${Math.round((last + 1.6) * vh)}px`
    for (const t of tracks) {
      t.style.top = `${Math.round(+t.dataset.start * vh)}px`
      t.style.height = `${Math.round((+t.dataset.len + 1) * vh)}px`
    }
  }
  size()
  addEventListener('resize', size)

  const goTo = (id) => {
    const l = byId.get(id)
    if (!l) return false
    const at = id === 'top' ? 0 : l.start + (l.el.id === 'contacto' ? 0.6 : 0.35)
    scrollTo({ top: at * innerHeight, behavior: reduced ? 'auto' : 'smooth' })
    return true
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    if (goTo(a.getAttribute('href').slice(1))) e.preventDefault()
  })

  const navLinks = [...document.querySelectorAll('.pill-nav-container a[href^="#"]')]
  const metodo = byId.get('metodo')
  const stages = metodo ? [...metodo.el.querySelectorAll('.stage')] : []
  const letters = metodo ? [...metodo.el.querySelectorAll('.method-letters span')] : []
  let stageIdx = -1, current = ''

  const update = () => {
    const p = scrollY / innerHeight
    let now = ''
    for (const l of layers) {
      const fin = l.start <= 0 ? 1 : range(p, l.start - FADE, l.start + FADE)
      const fout = Number.isFinite(l.end) ? 1 - range(p, l.end - FADE, l.end + FADE) : 1
      const o = fin * fout
      l.el.style.opacity = o.toFixed(3)
      l.el.style.visibility = o < 0.005 ? 'hidden' : 'visible'
      if (l.content) l.el.style.transform = `translate3d(0, ${((1 - fin) * 5 - (1 - fout) * 5).toFixed(2)}vh, 0)`
      const on = o > 0.5
      if (on !== l.active) {
        l.active = on
        l.el.classList.toggle('active', on)
        if (on) l.el.querySelectorAll('[data-count]').forEach(countUp)
      }
      if (p >= l.start && p < l.end) now = l.el.id
    }
    if (now !== current) {
      current = now
      for (const a of navLinks) a.classList.toggle('is-active', a.getAttribute('href') === `#${now}`)
    }
    if (metodo) {
      const L = (p - metodo.start - 0.15) / (metodo.end - metodo.start - 0.4)
      const i = Math.max(0, Math.min(stages.length - 1, Math.floor(L * stages.length)))
      if (i !== stageIdx) {
        stageIdx = i
        stages.forEach((s, k) => s.classList.toggle('on', k === i))
        letters.forEach((s, k) => s.classList.toggle('on', k === i))
      }
    }
    requestAnimationFrame(update)
  }
  update()
}

function range(v, a, b) {
  return Math.min(1, Math.max(0, (v - a) / (b - a)))
}

function initReveal() {
  const els = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
  els.forEach((e) => io.observe(e))
}

function countUp(el) {
  const to = +el.dataset.count, pad = el.dataset.pad ? +el.dataset.pad : 2
  const t0 = performance.now(), dur = reduced ? 0 : 1400
  const step = (now) => {
    const u = dur ? Math.min(1, (now - t0) / dur) : 1
    const v = Math.round(to * (1 - Math.pow(1 - u, 3)))
    el.textContent = String(v).padStart(pad, '0') + (el.dataset.suffix || '')
    if (u < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function initCards() {
  for (const c of document.querySelectorAll('.card')) {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect()
      c.style.setProperty('--mx', `${e.clientX - r.left}px`)
      c.style.setProperty('--my', `${e.clientY - r.top}px`)
    })
  }
}

function initFaq() {
  const items = [...document.querySelectorAll('.faq details')]
  for (const d of items) {
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false })
    })
  }
}

function initContact() {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Diagnóstico SCALE')}`
  for (const n of document.querySelectorAll('[data-email]')) n.textContent = CONTACT_EMAIL
  for (const n of document.querySelectorAll('[data-email-href]')) n.href = href
  for (const n of document.querySelectorAll('[data-year]')) n.textContent = new Date().getFullYear()
}

function initLogo() {
  for (const img of document.querySelectorAll('img[data-logo]')) {
    const fallback = () => {
      const s = document.createElement('span')
      s.className = 'logo-text'
      s.textContent = 'scale'
      img.replaceWith(s)
    }
    if (img.complete && img.naturalWidth === 0) fallback()
    else img.addEventListener('error', fallback, { once: true })
  }
}

const safe = (name, fn) => {
  try { fn() } catch (err) { console.error(`[scale] ${name} falló → ${err?.name}: ${err?.message}`, err) }
}

requestAnimationFrame(() => document.documentElement.classList.add('loaded'))
safe('logo', initLogo)
safe('nav', initNav)
safe('reveal', initReveal)
safe('layers', initLayers)
safe('cards', initCards)
safe('faq', initFaq)
safe('contact', initContact)
safe('hero3d', () => initHero(document.getElementById('hero3d'), document.querySelector('.hero'), reduced, document.getElementById('heroStage')))
safe('background', initBackground)
safe('sistema', () => initSistema(document.getElementById('sistema'), document.getElementById('sistema-layer')))
safe('fisica', () => initFisica(document.getElementById('estructura'), document.getElementById('estructura-layer')))
safe('ecosistema', () => initEcosistema(document.getElementById('ecosistema'), document.getElementById('ecosistema-layer')))
