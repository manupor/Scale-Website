import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js'

const CONTACT_EMAIL = 'hola@tudominio.com'

/* ---------- math ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const clamp01 = (v) => clamp(v, 0, 1)
const lerp = (a, b, t) => a + (b - a) * t
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeIn = (t) => t * t * t
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt))
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s) }
const isTouch = () => matchMedia('(hover: none)').matches
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

class Spring {
  constructor(value = 0, stiffness = 120, damping = 16) {
    this.v = value; this.vel = 0; this.k = stiffness; this.d = damping; this.target = value
  }
  update(target, dt) {
    if (target !== undefined) this.target = target
    const h = Math.min(dt, 1 / 30)
    const a = this.k * (this.target - this.v) - this.d * this.vel
    this.vel += a * h
    this.v += this.vel * h
    return this.v
  }
}

/* ---------- scroll ---------- */
class ScrollState {
  constructor(totalVh) {
    this.totalVh = totalVh
    this.sizer = document.getElementById('sizer')
    this.y = 0; this.target = 0; this.vel = 0; this.p = 0; this.vh = 1
    history.scrollRestoration = 'manual'
    this.resize()
    addEventListener('resize', () => this.resize())
  }
  resize() {
    this.vh = innerHeight
    this.sizer.style.height = Math.round((this.totalVh + 1) * this.vh) + 'px'
  }
  update(dt) {
    this.target = scrollY
    const prev = this.y
    this.y = damp(this.y, this.target, 7.5, dt)
    const v = dt > 0 ? (this.y - prev) / dt / this.vh : 0
    this.vel = damp(this.vel, v, 12, dt)
    this.p = this.y / this.vh
  }
}

/* ---------- DOM kinetics ---------- */
function splitChars(el) {
  const out = []
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment()
        for (const ch of child.textContent) {
          const s = document.createElement('span')
          s.className = 'ch-char' + (ch === ' ' ? ' sp' : '')
          s.textContent = ch === ' ' ? '\u00a0' : ch
          frag.appendChild(s); out.push(s)
        }
        child.replaceWith(frag)
      } else if (child.nodeType === 1 && !child.classList.contains('ch-char')) walk(child)
    }
  }
  walk(el)
  return out
}
function revealChars(el, { step = 28, delay = 0 } = {}) {
  el.querySelectorAll('.ch-char').forEach((c, i) => { c.style.transitionDelay = (delay + i * step) + 'ms' })
  el.classList.add('reveal')
  void el.offsetWidth
  el.classList.add('in')
}
const unreveal = (el) => el.classList.remove('in')

class Magnetic {
  constructor(el, { radius = 110, strength = 0.42 } = {}) {
    this.el = el; this.R = radius; this.S = strength
    this.chars = [...el.querySelectorAll('.ch-char')]
    if (!this.chars.length) this.chars = splitChars(el)
    this.sx = this.chars.map(() => new Spring(0, 160, 15))
    this.sy = this.chars.map(() => new Spring(0, 160, 15))
    this.arrow = el.querySelector('.arrow')
    this.ax = new Spring(1, 140, 9)
    this.rects = null; this.box = null; this.hot = false
  }
  measure() {
    this.box = this.el.getBoundingClientRect()
    this.rects = this.chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  }
  update(dt, pointer) {
    if (!this.el.offsetParent && !this.el.closest('.ch.on')) { this.hot = false; return }
    if (!this.box || (performance.now() % 500) < 20) this.measure()
    const b = this.box
    const near = pointer.active && pointer.x > b.left - this.R && pointer.x < b.right + this.R && pointer.y > b.top - this.R && pointer.y < b.bottom + this.R
    if (!near && !this.hot) return
    if (near) this.measure()
    let moving = false
    for (let i = 0; i < this.chars.length; i++) {
      let tx = 0, ty = 0
      if (near) {
        const dx = pointer.x - this.rects[i].x, dy = pointer.y - this.rects[i].y
        const d = Math.hypot(dx, dy)
        if (d < this.R) { const f = (1 - d / this.R) * this.S; tx = dx * f; ty = dy * f }
      }
      const x = this.sx[i].update(tx, dt), y = this.sy[i].update(ty, dt)
      this.chars[i].style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      if (Math.abs(x) + Math.abs(y) > 0.05) moving = true
    }
    if (this.arrow) {
      const inside = pointer.active && pointer.x > b.left && pointer.x < b.right && pointer.y > b.top && pointer.y < b.bottom
      const a = this.ax.update(inside ? 1.55 : 1, dt)
      this.arrow.style.transform = `scaleX(${a.toFixed(3)}) translateX(${((a - 1) * 4).toFixed(2)}px)`
      if (Math.abs(a - 1) > 0.01) moving = true
    }
    this.hot = near || moving
  }
}

class Counter {
  constructor(el, digits = 2) {
    this.el = el; this.digits = digits; this.cols = []
    el.innerHTML = ''
    for (let d = 0; d < digits; d++) {
      const col = document.createElement('span'); col.className = 'col'
      for (let n = 0; n < 10; n++) { const s = document.createElement('span'); s.textContent = n; col.appendChild(s) }
      el.appendChild(col); this.cols.push(col)
    }
    this.value = null
  }
  set(n) {
    if (n === this.value) return
    this.value = n
    const str = String(Math.max(0, Math.round(n))).padStart(this.digits, '0')
    this.cols.forEach((col, i) => { col.style.transform = `translateY(${-(+str[i]) * 1.1}em)` })
  }
}

class Underline {
  constructor(el) {
    this.el = el
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    svg.appendChild(this.path); el.appendChild(svg)
    this.amp = new Spring(0, 90, 8); this.phase = 0; this.hover = false
    el.addEventListener('pointerenter', () => { this.hover = true; this.amp.vel += 40 })
    el.addEventListener('pointerleave', () => { this.hover = false })
    this.draw(0)
  }
  draw(a) {
    const w = this.el.offsetWidth || 100, n = 8
    let d = 'M0 4'
    for (let i = 1; i <= n; i++) { const x = w * i / n; const y = 4 + Math.sin(i * 1.4 + this.phase) * a; d += ` L${x.toFixed(1)} ${y.toFixed(2)}` }
    this.path.setAttribute('d', d)
  }
  update(dt) {
    const a = this.amp.update(this.hover ? 2.6 : 0, dt)
    if (Math.abs(a) < 0.02 && !this.hover) { if (this.lastA !== 0) { this.draw(0); this.lastA = 0 } return }
    this.phase += dt * 9; this.draw(a); this.lastA = a
  }
}

function initCursor() {
  const dot = document.getElementById('cursor'), ring = document.getElementById('ring'), label = ring.querySelector('span')
  let rx = innerWidth / 2, ry = innerHeight / 2, state = ''
  return {
    update(dt, pointer) {
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
      rx = damp(rx, pointer.x, 22, dt); ry = damp(ry, pointer.y, 22, dt)
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`
      const vis = pointer.active ? 1 : 0
      dot.style.opacity = vis; ring.style.opacity = vis
    },
    set(s, text = '') {
      if (s === state && label.textContent === text) return
      state = s; ring.className = s; label.textContent = text
    },
  }
}

function initNav(onGo) {
  const html = document.documentElement, btn = document.getElementById('menuBtn'), panel = document.getElementById('panel')
  const toggle = (open) => {
    html.classList.toggle('menu', open)
    const isOpen = html.classList.contains('menu')
    html.style.overflow = isOpen ? 'hidden' : ''
    panel.setAttribute('aria-hidden', String(!isOpen))
  }
  btn.addEventListener('click', () => toggle())
  addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false) })
  for (const a of document.querySelectorAll('[data-go]')) {
    a.addEventListener('click', (e) => { e.preventDefault(); toggle(false); onGo(+a.dataset.go) })
  }
  return { isOpen: () => html.classList.contains('menu') }
}

/* ---------- scene: warm sand by day, jungle night in the dark chapters ---------- */
const SAND = new THREE.Color('#f2ede3')
const NIGHT = new THREE.Color('#030a07')

function makeStudioEnv(renderer) {
  const s = new THREE.Scene()
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vP;
      void main(){
        vec3 d = normalize(vP); float u = atan(d.z, d.x); float v = d.y;
        vec3 col = mix(vec3(0.07,0.11,0.09), vec3(1.03,1.0,0.95), smoothstep(-0.55, 0.85, v));
        col *= 1.0 - 0.55 * exp(-pow((v + 0.05) / 0.12, 2.0));
        col += vec3(1.0,0.97,0.9) * 2.4 * exp(-pow((v - 0.62) / 0.085, 2.0));
        col += vec3(1.0) * 0.9 * exp(-pow((v - 0.14) / 0.045, 2.0)) * (0.55 + 0.45 * cos(u * 3.0 + 0.6));
        col += vec3(0.10,0.80,0.52) * 1.1 * exp(-pow((u - 1.9) / 0.65, 2.0)) * exp(-pow((v - 0.02) / 0.45, 2.0));
        col += vec3(1.00,0.60,0.22) * 0.85 * exp(-pow((u + 1.7) / 0.65, 2.0)) * exp(-pow((v + 0.08) / 0.45, 2.0));
        col += vec3(1.00,0.95,0.86) * 0.16 * exp(-pow((v + 0.62) / 0.22, 2.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
  s.add(new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), mat))
  const pm = new THREE.PMREMGenerator(renderer)
  const tex = pm.fromScene(s, 0.02).texture
  pm.dispose()
  return tex
}

function makeShadowBlob(size = 6, opacity = 0.32) {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128)
  grd.addColorStop(0, 'rgba(10,22,15,1)'); grd.addColorStop(0.45, 'rgba(10,22,15,.45)'); grd.addColorStop(1, 'rgba(10,22,15,0)')
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false }))
  m.rotation.x = -Math.PI / 2
  return m
}

function createScene(quality) {
  const canvas = document.getElementById('gl')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.low ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = quality.low ? 0.4 : 0.6
  const scene = new THREE.Scene()
  scene.background = SAND.clone()
  scene.environment = makeStudioEnv(renderer)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 220)
  camera.position.set(0, 0, 14)
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(4, 8, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(0xcff5e2, 0.9); rim.position.set(-7, 3, -3); scene.add(rim)
  const fill = new THREE.DirectionalLight(0xfff3e0, 0.35); fill.position.set(-3, -4, 5); scene.add(fill)
  const accent = new THREE.PointLight(0x0f9d6b, 0, 30, 1.6); accent.position.set(0, 2, 4); scene.add(accent)
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.05, transmission: quality.low ? 0 : 1, thickness: 0.8, ior: 1.46,
    clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.75, iridescenceIOR: 1.3, iridescenceThicknessRange: [140, 520],
    attenuationColor: new THREE.Color('#b6eed6'), attenuationDistance: 1.4, envMapIntensity: 1.2,
    transparent: quality.low, opacity: quality.low ? 0.84 : 1, specularIntensity: 1.1,
  })
  if (quality.low) glass.color.set('#e0f2e8')
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xf6f3ec, metalness: 1, roughness: 0.07, envMapIntensity: 1.35, clearcoat: 0.4, clearcoatRoughness: 0.05,
  })
  const tint = (hex) => {
    const m = glass.clone(); m.color.set(hex).lerp(new THREE.Color('#ffffff'), 0.8); m.roughness = 0.02
    m.attenuationColor.set(hex).lerp(new THREE.Color('#ffffff'), 0.4); m.attenuationDistance = 1.8
    return m
  }
  let composer = null, bloom = null
  if (!quality.low) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.0, 0.6, 0.92)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
  }
  function resize() {
    const w = innerWidth, h = innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = Math.min(62, 34 * Math.pow(Math.max(1, 1.2 / camera.aspect), 0.55))
    camera.updateProjectionMatrix()
    if (composer) { composer.setSize(w, h); bloom.setSize(w, h) }
  }
  addEventListener('resize', resize)
  resize()
  return {
    scene, camera, key, accent, mats: { glass, chrome, tint },
    setBackground(dark) {
      scene.background.copy(SAND).lerp(NIGHT, dark)
      scene.environmentIntensity = 1 - 0.78 * dark
      key.intensity = 1.3 - 1.15 * dark; rim.intensity = 0.9 - 0.7 * dark; fill.intensity = 0.35 - 0.3 * dark
    },
    setBloom(strength) { if (bloom) bloom.strength = strength },
    render() { if (composer) composer.render(); else renderer.render(scene, camera) },
  }
}

/* ---------- 01–02 kinetic sculpture: a river of glass blades ---------- */
const _P = new THREE.Vector3(), _T = new THREE.Vector3(), _W = new THREE.Vector3(), _N = new THREE.Vector3()
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _pos = new THREE.Vector3(), _gpos = new THREE.Vector3()
const _q = new THREE.Quaternion(), _qg = new THREE.Quaternion(), _qx = new THREE.Quaternion(), _m4 = new THREE.Matrix4()
const _sc = new THREE.Vector3(), _ndc = new THREE.Vector3(), _dir = new THREE.Vector3(), _Q = new THREE.Vector3()
const AX_Z = new THREE.Vector3(0, 0, 1), AX_X = new THREE.Vector3(1, 0, 0), AX_Y = new THREE.Vector3(0, 1, 0)
const CARD_Q = new THREE.Quaternion().setFromAxisAngle(AX_Z, Math.PI / 2)
const ID_Q = new THREE.Quaternion()

function bladeGeometry() {
  const w = 1.15, h = 0.32, r = 0.07
  const s = new THREE.Shape()
  const x = -w / 2, y = -h / 2
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0)
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  let g = new THREE.ExtrudeGeometry(s, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 2, curveSegments: 6 })
  g = BGU.mergeVertices(g, 1e-4)
  g.center()
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i)
    p.setZ(i, p.getZ(i) + 0.06 * Math.pow(px / (w / 2), 2) - 0.03)
  }
  g.computeVertexNormals()
  return g
}

class Sculpture {
  constructor(scene, quality) {
    this.strands = 6
    this.along = quality.low ? 48 : 110
    this.n = this.strands * this.along
    const n = this.n
    this.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.05, transmission: quality.low ? 0 : 1, thickness: 0.45, ior: 1.46,
      clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.85, iridescenceIOR: 1.32, iridescenceThicknessRange: [120, 560],
      attenuationColor: new THREE.Color('#a6e9cc'), attenuationDistance: 1.1, envMapIntensity: 1.2,
      transparent: quality.low, opacity: quality.low ? 0.86 : 1, specularIntensity: 1.2,
      emissive: new THREE.Color('#12c58a'), emissiveIntensity: 0,
    })
    if (quality.low) this.glass.color.set('#e0f2e8')
    this.chrome = new THREE.MeshPhysicalMaterial({
      color: 0xf6f3ec, metalness: 1, roughness: 0.08, envMapIntensity: 1.3, clearcoat: 0.3, clearcoatRoughness: 0.06,
      emissive: new THREE.Color('#ffb547'), emissiveIntensity: 0,
    })
    this.chromeStrand = 2
    const nChrome = this.along, nGlass = n - nChrome
    const geo = bladeGeometry()
    this.meshGlass = new THREE.InstancedMesh(geo, this.glass, nGlass)
    this.meshChrome = new THREE.InstancedMesh(geo, this.chrome, nChrome)
    for (const m of [this.meshGlass, this.meshChrome]) { m.frustumCulled = false; scene.add(m) }
    this.meshes = [this.meshGlass, this.meshChrome]
    this.h1 = new Float32Array(n); this.h2 = new Float32Array(n); this.stagger = new Float32Array(n)
    this.card = new Uint8Array(n); this.gx = new Float32Array(n); this.gy = new Float32Array(n); this.gz = new Float32Array(n)
    this.dx = new Float32Array(n * 3); this.dv = new Float32Array(n * 3)
    this.rd = new Float32Array(n); this.rv = new Float32Array(n)
    this.slot = new Int32Array(n)
    const cols = quality.low ? 16 : 30, rows = Math.ceil(n / cols)
    const c = new THREE.Color()
    let gi = 0, ci = 0
    for (let i = 0; i < n; i++) {
      const k = i % this.strands
      this.h1[i] = hash(i + 1); this.h2[i] = hash(i * 7 + 3); this.stagger[i] = hash(i * 13 + 5)
      this.card[i] = hash(i * 3 + 11) < 0.16 ? 1 : 0
      this.gx[i] = ((i % cols) - (cols - 1) / 2) * 1.35
      this.gy[i] = ((rows - 1) / 2 - Math.floor(i / cols)) * 1.25
      this.gz[i] = -2 - hash(i * 17 + 2) * 30
      if (k === this.chromeStrand) { this.slot[i] = ci++ }
      else {
        this.slot[i] = gi
        c.setHSL(0.42 + 0.1 * (this.h2[i] - 0.5), 0.45, 0.92)
        this.meshGlass.setColorAt(gi, c); gi++
      }
    }
    this.meshGlass.instanceColor.needsUpdate = true
    this.dummy = new THREE.Object3D()
  }
  spine(s, t, out) {
    return out.set(
      lerp(-13, 13, s),
      lerp(7.4, -7.4, s) + 1.6 * Math.sin(s * 6.283 + t * 0.22),
      lerp(2.5, -5.0, s) + 1.2 * Math.sin(s * 9.4 - t * 0.17),
    )
  }
  update(dt, ctx) {
    const { t, p, pointer, camera, vel } = ctx
    const expand = easeInOut(range(p, 0, 1.3))
    const gridP = range(p, 1.3, 2.6)
    const spread = smooth(range(p, 2.6, 4.0))
    const lum = smooth(range(p, 2.8, 3.6))
    const fade = smooth(range(p, 6.35, 6.95))
    this.glass.emissiveIntensity = lum * 0.9
    this.chrome.emissiveIntensity = lum * 0.35
    const vis = p < 7
    for (const m of this.meshes) m.visible = vis
    if (!vis) return
    const bend = 1 + clamp(Math.abs(vel) * 0.28, 0, 0.7)
    const strands = this.strands, along = this.along, n = this.n
    const h = Math.min(dt, 1 / 30)
    let haveRay = false
    if (pointer.active) {
      _ndc.set(pointer.nx, pointer.ny, 0.5).unproject(camera)
      _dir.copy(_ndc).sub(camera.position).normalize()
      haveRay = Math.abs(_dir.z) > 1e-4
    }
    const R = 2.4
    for (let i = 0; i < n; i++) {
      const k = i % strands, j = (i - k) / strands
      const s = (j + 0.5) / along
      this.spine(s, t, _P)
      this.spine(s + 0.008, t, _a); this.spine(s - 0.008, t, _b)
      _T.subVectors(_a, _b).normalize()
      _W.crossVectors(_T, AX_Z).normalize()
      _N.crossVectors(_W, _T).normalize()
      const offK = (k - (strands - 1) / 2) * (0.44 + 0.75 * expand)
      const wave = 0.3 * Math.sin(t * 0.8 + s * 6.3 + k * 0.55) * (1 + expand * 0.8)
      _pos.copy(_P).addScaledVector(_W, offK).addScaledVector(_N, wave)
      const th = (0.62 * Math.sin(s * 11 - t * 0.9 + k * 0.7) + 0.32 * Math.sin(s * 27 + t * 0.5 + k * 0.3)) * bend * (1 + expand * 0.9)
      const ph = 0.24 * Math.sin(s * 5 + t * 0.4 + k * 1.1) * (1 + expand)
      _m4.makeBasis(_W, _T, _N)
      _q.setFromRotationMatrix(_m4)
      _qx.setFromAxisAngle(AX_X, th); _q.multiply(_qx)
      _qx.setFromAxisAngle(AX_Y, ph); _q.multiply(_qx)
      let scale = 1
      const w = smooth(range(gridP, this.stagger[i] * 0.55, this.stagger[i] * 0.55 + 0.45))
      if (w > 0) {
        _gpos.set(this.gx[i], this.gy[i] + 0.06 * Math.sin(t * 1.2 + i), this.gz[i] * spread)
        _gpos.x += spread * (1.2 * Math.sin(t * 0.13 + i * 1.7))
        _gpos.y += spread * (0.8 * Math.sin(t * 0.11 + i * 2.3))
        _pos.lerp(_gpos, w)
        _qg.copy(this.card[i] ? CARD_Q : ID_Q)
        if (spread > 0) { _qx.setFromAxisAngle(AX_Y, spread * (this.h1[i] - 0.5) * 1.8 + t * 0.06 * (this.h2[i] - 0.5)); _qg.multiply(_qx) }
        _q.slerp(_qg, w)
        scale = lerp(1, this.card[i] ? 1.0 : 0.95, w)
      }
      scale *= (1 - fade)
      const i3 = i * 3
      let fx = 0, fy = 0, fz = 0, tq = 0
      if (haveRay) {
        const tt = (_pos.z - camera.position.z) / _dir.z
        if (tt > 0) {
          _Q.copy(camera.position).addScaledVector(_dir, tt)
          const ddx = _pos.x - _Q.x, ddy = _pos.y - _Q.y
          const d = Math.hypot(ddx, ddy)
          if (d < R && d > 1e-4) {
            const f = Math.pow(1 - d / R, 2) * 7.0
            fx = ddx / d * f; fy = ddy / d * f; fz = f * 0.35
            tq = f * 0.24 * (ddx >= 0 ? 1 : -1)
          }
        }
      }
      for (let c = 0; c < 3; c++) {
        const f = c === 0 ? fx : c === 1 ? fy : fz
        this.dv[i3 + c] += (-90 * this.dx[i3 + c] - 11 * this.dv[i3 + c] + f) * h
        this.dx[i3 + c] += this.dv[i3 + c] * h
      }
      this.rv[i] += (-70 * this.rd[i] - 9 * this.rv[i] + tq) * h
      this.rd[i] += this.rv[i] * h
      _pos.x += this.dx[i3]; _pos.y += this.dx[i3 + 1]; _pos.z += this.dx[i3 + 2]
      if (this.rd[i] !== 0) { _qx.setFromAxisAngle(AX_X, this.rd[i]); _q.multiply(_qx) }
      _sc.setScalar(Math.max(0, scale))
      this.dummy.position.copy(_pos); this.dummy.quaternion.copy(_q); this.dummy.scale.copy(_sc)
      this.dummy.updateMatrix()
        ; (k === this.chromeStrand ? this.meshChrome : this.meshGlass).setMatrixAt(this.slot[i], this.dummy.matrix)
    }
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true
  }
}

/* ---------- 03 gallery: the five S.C.A.L.E. stages ---------- */
const STAGES = [
  {
    letter: 'S', title: 'Estrategia', kind: 'S — Primero, la raíz', accent: '#0f9d6b',
    desc: 'Antes de hacer más, entendemos qué frena a su empresa. Modelo, oferta, mercado y proceso comercial: el obstáculo real, no sus síntomas.',
    specs: [['Etapa', '01 · Strategy'], ['Enfoque', 'Diagnóstico, modelo, oferta'], ['Pregunta', '¿Qué frena a su empresa?'], ['Resultado', 'Prioridades claras']],
  },
  {
    letter: 'C', title: 'Contenido', kind: 'C — El mensaje', accent: '#ffb547',
    desc: 'Traducimos la estrategia en mensajes claros: narrativa, mensajes y activos que comunican el valor de su marca.',
    specs: [['Etapa', '02 · Content'], ['Enfoque', 'Narrativa, mensajes, activos'], ['Pregunta', '¿Se entiende su valor?'], ['Resultado', 'Una voz coherente']],
  },
  {
    letter: 'A', title: 'Adquisición', kind: 'A — El recorrido', accent: '#ff6b57',
    desc: 'Diseñamos el recorrido que conecta la atracción con la venta, pensado para convertir prospectos en clientes.',
    specs: [['Etapa', '03 · Acquisition'], ['Enfoque', 'Embudos, seguimiento, CRM'], ['Pregunta', '¿Dónde se pierden los prospectos?'], ['Resultado', 'Un recorrido medible']],
  },
  {
    letter: 'L', title: 'Aprendizaje', kind: 'L — La evidencia', accent: '#1fb5c4',
    desc: 'Los datos deciden dónde invertir. Concentramos recursos en lo que realmente funciona.',
    specs: [['Etapa', '04 · Learning'], ['Enfoque', 'Datos, inversión, retorno'], ['Pregunta', '¿Qué funciona de verdad?'], ['Resultado', 'Inversión concentrada']],
  },
  {
    letter: 'E', title: 'Expansión', kind: 'E — La cosecha', accent: '#a8c93a',
    desc: 'Incorporamos tecnología cuando la evidencia lo valida. Optimizamos y documentamos el sistema antes de automatizar.',
    specs: [['Etapa', '05 · Expansion'], ['Enfoque', 'Procesos, automatización'], ['Pregunta', '¿Qué puede crecer sin usted?'], ['Resultado', 'Un sistema que escala']],
  },
]

function part(mesh, dir, spin) {
  return { obj: mesh, home: mesh.position.clone(), rot: mesh.rotation.clone(), dir: dir.clone().normalize(), spin: spin || new THREE.Vector3() }
}

function buildObject(i, mats) {
  const g = new THREE.Group()
  const parts = []
  const d = STAGES[i]
  if (i === 0) {
    const outer = new THREE.Mesh(new THREE.TorusKnotGeometry(1.25, 0.34, 160, 24), mats.glass)
    const core = new THREE.Mesh(new THREE.TorusKnotGeometry(1.25, 0.12, 120, 12), mats.chrome)
    core.rotation.z = Math.PI / 2
    g.add(outer, core)
    parts.push(part(outer, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.4, 0.2, 0)), part(core, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.6, 0)))
    for (let k = 0; k < 3; k++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), mats.chrome)
      const a = k / 3 * Math.PI * 2; s.position.set(Math.cos(a) * 2.1, Math.sin(a) * 0.4, Math.sin(a) * 2.1)
      g.add(s); parts.push(part(s, s.position, new THREE.Vector3(0, 1, 0)))
    }
  } else if (i === 1) {
    for (let k = 0; k < 7; k++) {
      const r = 1.45 - k * 0.13, y = (k - 3) * 0.42
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.16, 96), mats.chrome)
      m.position.set(Math.sin(k * 1.3) * 0.18, y, Math.cos(k * 1.1) * 0.18)
      g.add(m); parts.push(part(m, new THREE.Vector3(Math.sin(k * 2.1), (k - 3) * 0.6, Math.cos(k * 2.1)), new THREE.Vector3(0, (k % 2 ? 1 : -1) * 0.9, 0)))
    }
  } else if (i === 2) {
    const m = mats.tint(d.accent)
    for (let k = 0; k < 6; k++) {
      const pane = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.5, 0.14, 1, 1, 1), m)
      const sgn = k % 2 ? 1 : -1
      pane.position.set((k - 2.5) * 0.86, 0, 0)
      pane.rotation.y = sgn * 0.62
      g.add(pane)
      parts.push(part(pane, new THREE.Vector3(0, (k % 3 - 1) * 0.35, sgn), new THREE.Vector3(0, sgn * 0.35, 0)))
    }
    for (let k = 0; k <= 6; k++) {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.62, 24), mats.chrome)
      const sgn = k % 2 ? 1 : -1
      rod.position.set((k - 3) * 0.86, 0, sgn * 0.28)
      g.add(rod)
      parts.push(part(rod, new THREE.Vector3(0, 0, sgn * 1.4)))
    }
  } else if (i === 3) {
    const ico = new THREE.IcosahedronGeometry(1.55, 0)
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.75, 1), mats.glass)
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), mats.chrome)
    g.add(shell, core)
    parts.push(part(shell, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.2, 0.2, 0)), part(core, new THREE.Vector3(0, -1, 0)))
    const pos = ico.attributes.position
    const seen = new Set()
    for (let k = 0; k < pos.count; k++) {
      const key = [pos.getX(k), pos.getY(k), pos.getZ(k)].map((v) => v.toFixed(2)).join(',')
      if (seen.has(key)) continue
      seen.add(key)
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), mats.chrome)
      s.position.set(pos.getX(k), pos.getY(k), pos.getZ(k))
      g.add(s); parts.push(part(s, s.position))
    }
  } else {
    const m = mats.tint(d.accent)
    for (let k = 0; k < 6; k++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.6, 3, 1), m)
      const a = k / 6 * Math.PI * 2
      p.position.set(Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9)
      p.rotation.set(0.35 * Math.sin(a), -a, 0.35 * Math.cos(a))
      g.add(p); parts.push(part(p, p.position, new THREE.Vector3(0, 0.5, 0)))
    }
  }
  g.userData.parts = parts
  return g
}

class Gallery {
  constructor(scene, mats) {
    this.root = new THREE.Group(); scene.add(this.root)
    this.objects = STAGES.map((_, i) => { const o = buildObject(i, mats); this.root.add(o); return o })
    const radii = [2.3, 1.75, 2.4, 2.0, 1.95]
    this.hits = this.objects.map((o, i) => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(radii[i], 12, 8), new THREE.MeshBasicMaterial({ visible: false }))
      h.userData.index = i; o.add(h); return h
    })
    this.dis = this.objects.map(() => new Spring(0, 70, 11))
    this.focus = new Spring(0, 40, 9)
    this.shadow = makeShadowBlob(9, 0.28); this.shadow.position.y = -2.6; this.root.add(this.shadow)
    this.ray = new THREE.Raycaster()
    this.hovered = -1; this.selected = -1
    this.root.visible = false
  }
  update(dt, ctx) {
    const { t, g, appear, pointer, camera, enabled } = ctx
    if (appear <= 0) { this.root.visible = false; return }
    this.root.visible = true
    const a = easeOut(appear)
    const fx = this.focus.update(ctx.detailOpen ? 1 : 0, dt)
    for (let i = 0; i < this.objects.length; i++) {
      const o = this.objects[i]
      const d = i - g
      const ad = Math.abs(d)
      const x = d * 6.4 - fx * 3.4
      const z = -ad * 4.6 - 1.2 + fx * 1.6 * (ad < 0.5 ? 1 : 0)
      o.position.set(x, 0.18 * Math.sin(t * 0.7 + i) + (1 - a) * -3, z)
      const sc = (1 - 0.26 * Math.min(ad, 1.6)) * a * (1 + fx * 0.12 * (ad < 0.5 ? 1 : 0))
      o.scale.setScalar(Math.max(0.001, sc))
      o.rotation.y = d * 0.42 + t * 0.16 + (i === 3 ? t * 0.1 : 0)
      o.rotation.x = 0.15 * Math.sin(t * 0.3 + i) + d * 0.12
      o.visible = ad < 1.85
      const dis = this.dis[i].update(this.hovered === i && this.selected !== i ? 1 : 0, dt)
      for (const p of o.userData.parts) {
        p.obj.position.copy(p.home).addScaledVector(p.dir, dis * 0.95)
        p.obj.rotation.set(p.rot.x + p.spin.x * dis, p.rot.y + p.spin.y * dis, p.rot.z + p.spin.z * dis)
      }
    }
    this.shadow.position.x = -fx * 3.4
    this.shadow.material.opacity = 0.3 * a
    this.hovered = -1
    if (enabled && pointer.active && !ctx.detailOpen) {
      this.ray.setFromCamera({ x: pointer.nx, y: pointer.ny }, camera)
      const hits = this.ray.intersectObjects(this.hits.filter((h) => h.parent.visible), false)
      if (hits.length) this.hovered = hits[0].object.userData.index
    }
  }
}

/* ---------- 05 gravity: without structure, everything falls ---------- */
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(), _pe = new THREE.Euler(), _ps = new THREE.Vector3(), _pp = new THREE.Vector3()

class Physics {
  constructor(scene, quality, mats) {
    this.n = quality.low ? 36 : 66
    const n = this.n
    this.root = new THREE.Group(); scene.add(this.root); this.root.visible = false
    const per = Math.ceil(n / 3)
    const geos = [
      new THREE.SphereGeometry(0.32, 40, 28),
      new THREE.TetrahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.36, 0.09, 20, 48),
    ]
    const mat = [mats.chrome, mats.glass, mats.chrome]
    this.meshes = geos.map((g, k) => { const m = new THREE.InstancedMesh(g, mat[k], per); m.frustumCulled = false; this.root.add(m); return m })
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.home = new Float32Array(n * 3)
    this.rot = new Float32Array(n * 3); this.ang = new Float32Array(n * 3); this.rad = new Float32Array(n); this.sc = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      this.home[i3] = (hash(i * 3 + 1) - 0.5) * 15; this.home[i3 + 1] = (hash(i * 5 + 2) - 0.5) * 7 + 0.5; this.home[i3 + 2] = (hash(i * 7 + 3) - 0.5) * 5
      this.pos.set([this.home[i3], this.home[i3 + 1], this.home[i3 + 2]], i3)
      this.rot[i3] = hash(i * 11) * 6; this.rot[i3 + 1] = hash(i * 13) * 6; this.rot[i3 + 2] = hash(i * 17) * 6
      this.ang[i3] = (hash(i * 19) - 0.5) * 0.6; this.ang[i3 + 1] = (hash(i * 23) - 0.5) * 0.6; this.ang[i3 + 2] = (hash(i * 29) - 0.5) * 0.6
      this.rad[i] = 0.32 + 0.1 * (i % 3 === 1 ? 0.5 : 0)
      this.sc[i] = 0.75 + hash(i * 31) * 0.6
    }
    this.floor = -4.9; this.wallX = 9.2; this.wallZ = 3.2
    this.shadow = makeShadowBlob(30, 0.12); this.shadow.position.y = this.floor - 0.01; this.root.add(this.shadow)
    this.mode = 'free'; this.modeT = 0
  }
  scatter() {
    for (let i = 0; i < this.n; i++) {
      const i3 = i * 3
      const a = hash(i * 41 + this.modeT) * 6.283, b = (hash(i * 43 + 1) - 0.5) * 2
      const s = 5 + hash(i * 47 + 2) * 6
      this.vel[i3] += Math.cos(a) * s; this.vel[i3 + 1] += Math.abs(b) * s * 0.9 + 2; this.vel[i3 + 2] += Math.sin(a) * s * 0.35
      this.ang[i3] += (hash(i * 53) - 0.5) * 6; this.ang[i3 + 1] += (hash(i * 59) - 0.5) * 6
    }
    this.mode = 'scatter'; this.modeT = 0
  }
  update(dt, ctx) {
    const { t, appear, gravity, pointerWorld } = ctx
    if (appear <= 0) { this.root.visible = false; return }
    this.root.visible = true
    const h = Math.min(dt, 1 / 40)
    const n = this.n
    const a = easeOut(appear)
    this.modeT += h
    if (this.mode === 'scatter' && this.modeT > 1.5) { this.mode = 'rebuild'; this.modeT = 0 }
    if (this.mode === 'rebuild' && this.modeT > 3.2) { this.mode = 'free'; this.modeT = 0 }
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      let vx = this.vel[i3], vy = this.vel[i3 + 1], vz = this.vel[i3 + 2]
      let px = this.pos[i3], py = this.pos[i3 + 1], pz = this.pos[i3 + 2]
      if (this.mode === 'rebuild') {
        const k = 16, d = 6.5
        vx += ((this.home[i3] - px) * k - vx * d) * h
        vy += ((this.home[i3 + 1] - py) * k - vy * d) * h
        vz += ((this.home[i3 + 2] - pz) * k - vz * d) * h
      } else {
        const susp = 1 - clamp(gravity, 0, 1)
        vy += (-9.8 * 0.55 * gravity) * h + susp * (this.home[i3 + 1] - py) * 0.9 * h + susp * 0.35 * Math.sin(t * 0.8 + i) * h
        vx += susp * (this.home[i3] - px) * 0.6 * h
        vz += susp * (this.home[i3 + 2] - pz) * 0.6 * h
        const drag = 1 - (0.55 + susp * 0.9) * h
        vx *= drag; vy *= drag; vz *= drag
        if (pointerWorld) {
          const ddx = px - pointerWorld.x, ddy = py - pointerWorld.y, ddz = (pz - pointerWorld.z) * 0.4
          const d = Math.hypot(ddx, ddy, ddz)
          if (d < 3.2 && d > 1e-3) { const f = (3.2 - d) / 3.2 * 10; vx += ddx / d * f * h; vy += ddy / d * f * h; vz += ddz / d * f * 0.5 * h }
        }
      }
      px += vx * h; py += vy * h; pz += vz * h
      const r = this.rad[i] * this.sc[i]
      if (py - r < this.floor) { py = this.floor + r; if (vy < 0) vy = -vy * 0.32; vx *= 0.92; vz *= 0.92; this.ang[i3] *= 0.9; this.ang[i3 + 2] *= 0.9 }
      if (px < -this.wallX + r) { px = -this.wallX + r; vx = Math.abs(vx) * 0.5 }
      if (px > this.wallX - r) { px = this.wallX - r; vx = -Math.abs(vx) * 0.5 }
      if (pz < -this.wallZ) { pz = -this.wallZ; vz = Math.abs(vz) * 0.5 }
      if (pz > this.wallZ) { pz = this.wallZ; vz = -Math.abs(vz) * 0.5 }
      if (py > 7) { py = 7; vy = -Math.abs(vy) * 0.3 }
      this.vel[i3] = vx; this.vel[i3 + 1] = vy; this.vel[i3 + 2] = vz
      this.pos[i3] = px; this.pos[i3 + 1] = py; this.pos[i3 + 2] = pz
      this.rot[i3] += this.ang[i3] * h; this.rot[i3 + 1] += this.ang[i3 + 1] * h; this.rot[i3 + 2] += this.ang[i3 + 2] * h
      const ad = 1 - 0.8 * h
      this.ang[i3] *= ad; this.ang[i3 + 1] *= ad; this.ang[i3 + 2] *= ad
      _pe.set(this.rot[i3], this.rot[i3 + 1], this.rot[i3 + 2]); _pq.setFromEuler(_pe)
      _pp.set(px, py + (1 - a) * 4, pz)
      _ps.setScalar(this.sc[i] * a)
      _pm.compose(_pp, _pq, _ps)
      this.meshes[i % 3].setMatrixAt(Math.floor(i / 3), _pm)
    }
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true
    this.shadow.material.opacity = 0.11 * a
  }
}

/* ---------- 06 finale: a glass seed that bursts into a sunset ---------- */
const _fa = new THREE.Vector3(), _fb = new THREE.Vector3(), _fc = new THREE.Vector3()

class Finale {
  constructor(scene, mats) {
    this.root = new THREE.Group(); scene.add(this.root); this.root.visible = false
    const ico = new THREE.IcosahedronGeometry(2.3, 1)
    const pos = ico.attributes.position
    this.shards = []
    const m = mats.glass.clone(); m.emissive = new THREE.Color('#ff6a3d'); m.emissiveIntensity = 0.06
    m.attenuationColor.set('#ffd08a'); m.color.lerp(new THREE.Color('#ffe2b8'), 0.35)
    this.shardMat = m
    for (let f = 0; f < pos.count / 3; f++) {
      _fa.fromBufferAttribute(pos, f * 3); _fb.fromBufferAttribute(pos, f * 3 + 1); _fc.fromBufferAttribute(pos, f * 3 + 2)
      const center = new THREE.Vector3().add(_fa).add(_fb).add(_fc).multiplyScalar(1 / 3)
      const normal = center.clone().normalize()
      const g = new THREE.BufferGeometry()
      const inA = _fa.clone().addScaledVector(normal, -0.09), inB = _fb.clone().addScaledVector(normal, -0.09), inC = _fc.clone().addScaledVector(normal, -0.09)
      const tri = [_fa, _fb, _fc, inA, inB, inC].map((v) => v.clone().sub(center))
      const verts = [
        tri[0], tri[1], tri[2], tri[5], tri[4], tri[3],
        tri[0], tri[3], tri[1], tri[1], tri[3], tri[4],
        tri[1], tri[4], tri[2], tri[2], tri[4], tri[5],
        tri[2], tri[5], tri[0], tri[0], tri[5], tri[3],
      ]
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts.flatMap((v) => [v.x, v.y, v.z]), 3))
      g.computeVertexNormals()
      const mesh = new THREE.Mesh(g, m)
      mesh.position.copy(center)
      this.root.add(mesh)
      this.shards.push({
        mesh, center, normal, stagger: hash(f * 7 + 1),
        spin: new THREE.Vector3(hash(f * 3) - 0.5, hash(f * 5) - 0.5, hash(f * 11) - 0.5).multiplyScalar(4),
        drift: new THREE.Vector3(hash(f * 13) - 0.5, hash(f * 17) - 0.5, hash(f * 19) - 0.5).multiplyScalar(2.2),
      })
    }
    this.core = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 40), mats.chrome)
    this.root.add(this.core)
    const N = this.shards.length * 6
    this.pn = N
    this.pBase = new Float32Array(N * 3); this.pDir = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const s = this.shards[Math.floor(i / 6)]
      const j = i % 6, r = 0.5 * hash(i * 3 + 2)
      const ang = j / 6 * 6.283 + hash(i)
      this.pBase[i * 3] = s.center.x + Math.cos(ang) * r; this.pBase[i * 3 + 1] = s.center.y + Math.sin(ang) * r; this.pBase[i * 3 + 2] = s.center.z + (hash(i * 5) - 0.5) * r
      this.pDir[i * 3] = s.normal.x + (hash(i * 7) - 0.5); this.pDir[i * 3 + 1] = s.normal.y + (hash(i * 11) - 0.5) + 0.3; this.pDir[i * 3 + 2] = s.normal.z + (hash(i * 13) - 0.5)
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    this.points = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.05, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
    this.root.add(this.points)
    this.light = new THREE.PointLight(0xff7a45, 0, 24, 1.8); this.root.add(this.light)
  }
  update(dt, ctx) {
    const { t, appear, breakT } = ctx
    if (appear <= 0) { this.root.visible = false; return }
    this.root.visible = true
    const a = easeOut(appear)
    this.root.rotation.y = t * 0.22; this.root.rotation.x = Math.sin(t * 0.19) * 0.22; this.root.rotation.z = Math.sin(t * 0.13) * 0.1
    this.root.scale.setScalar(lerp(0.6, 1, a))
    this.light.intensity = 1.6 * a * (1 - range(breakT, 0.7, 1))
    this.shardMat.emissiveIntensity = 0.06 + 0.9 * smooth(range(breakT, 0.05, 0.6))
    for (const s of this.shards) {
      const e = easeOut(range(breakT, s.stagger * 0.45, s.stagger * 0.45 + 0.55))
      s.mesh.position.copy(s.center).addScaledVector(s.normal, e * 3.0).addScaledVector(s.drift, e * e * 0.6)
      s.mesh.rotation.set(s.spin.x * e, s.spin.y * e, s.spin.z * e)
      s.mesh.scale.setScalar(Math.max(0.0001, 1 - smooth(range(breakT, 0.4, 0.92))))
    }
    this.core.scale.setScalar(Math.max(0.0001, 1 - smooth(range(breakT, 0.5, 0.85))))
    const pin = smooth(range(breakT, 0.55, 0.85)), pout = smooth(range(breakT, 0.86, 1.0))
    this.points.material.opacity = pin * (1 - pout) * 0.95
    this.points.material.size = 0.05 + 0.06 * pin
    if (pin > 0) {
      const p = this.points.geometry.attributes.position.array
      const k = easeIn(range(breakT, 0.6, 1.0)) * 7
      for (let i = 0; i < this.pn; i++) {
        const i3 = i * 3
        p[i3] = this.pBase[i3] + this.pDir[i3] * k; p[i3 + 1] = this.pBase[i3 + 1] + this.pDir[i3 + 1] * k; p[i3 + 2] = this.pBase[i3 + 2] + this.pDir[i3 + 2] * k
      }
      this.points.geometry.attributes.position.needsUpdate = true
    }
  }
}

/* ---------- app: seven chapters across 22 viewports ---------- */
const TOTAL = 22
const quality = { low: innerWidth < 820 || (isTouch() && innerWidth < 1100) || (navigator.hardwareConcurrency || 8) <= 4 }
const reduced = reducedMotion()
const S = createScene(quality)
const scroll = new ScrollState(TOTAL)
const sculpture = new Sculpture(S.scene, quality)
const gallery = new Gallery(S.scene, S.mats)
const physics = new Physics(S.scene, quality, S.mats)
const finale = new Finale(S.scene, S.mats)
const $ = (s) => document.querySelector(s)
const html = document.documentElement

for (const n of document.querySelectorAll('[data-email]')) n.textContent = CONTACT_EMAIL
for (const n of document.querySelectorAll('[data-email-href]')) n.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Diagnóstico SCALE')}`

const el = {
  hero: $('#ch-hero'), heroH1: $('#ch-hero h1'), heroLabel: $('#ch-hero .label'), heroCta: $('#ch-hero .cta'), heroMeta: $('#ch-hero .meta'), heroHint: $('#ch-hero .hint'),
  matter: $('#ch-matter'), line1: $('#ch-matter .line1'), line2: $('#ch-matter .line2'), note: $('#ch-matter .note'),
  mask: $('#maskLayer'), maskText: $('#maskText'),
  gallery: $('#ch-gallery'), gTitle: $('#gTitle'), gKind: $('#gKind'), gDesc: $('#gDesc'), gHint: $('#ch-gallery .hint'), gIdx: $('#ch-gallery .idx'), gOpen: $('#gOpen'),
  detail: $('#detail'), dTitle: $('#dTitle'), dDesc: $('#dDesc'), dSpecs: $('#dSpecs'), dLetter: $('#dLetter'),
  typo: $('#ch-typo'), words: [...document.querySelectorAll('#ch-typo .word')], typoLabel: $('#ch-typo .label'), typoNote: $('#ch-typo .note'),
  physics: $('#ch-physics'), phH2: $('#phH2'), phLabel: $('#ch-physics .label'), phHint: $('#ch-physics .hint'), phStats: $('#ch-physics .stats'),
  final: $('#ch-final'), finalH2: $('#finalH2'),
  footer: $('#ch-footer'), footMark: $('#footMark'), footCols: $('#ch-footer .cols'), footLegal: $('#ch-footer .legal'),
  footOutro: $('#ch-footer .outro'), footH2: $('#footH2'),
  rail: $('#rail i'), loader: $('#loader'),
}
const chapters = [[el.hero, 0, 4], [el.matter, 4, 7], [el.gallery, 7, 11], [el.typo, 11, 15], [el.physics, 15, 18], [el.final, 18, 21], [el.footer, 21, 22]]
for (const n of document.querySelectorAll('[data-chars]')) splitChars(n)
const wordChars = el.words.map((w) => [...w.querySelectorAll('.ch-char')])
const magnetics = [...document.querySelectorAll('[data-magnetic]')].map((n) => new Magnetic(n))
const underlines = [...document.querySelectorAll('[data-ul]')].map((n) => new Underline(n))
const gCounter = new Counter($('#gCounter'), 2)
const stCap = new Counter($('#stObj'), 2), stStages = new Counter($('#stFps'), 2), stImpro = new Counter($('#stTex'), 1)
const setStats = () => { stCap.set(7); stStages.set(5); stImpro.set(0) }
const cursor = initCursor()

let scrollAnim = null
function smoothScrollTo(vh) {
  const from = scrollY, to = vh * innerHeight, t0 = performance.now(), dur = 1400
  cancelAnimationFrame(scrollAnim)
  const step = (now) => {
    const u = easeInOut(clamp01((now - t0) / dur))
    scrollTo(0, lerp(from, to, u))
    if (u < 1) scrollAnim = requestAnimationFrame(step)
  }
  scrollAnim = requestAnimationFrame(step)
}
const nav = initNav((vh) => smoothScrollTo(vh))
$('#nav .wordmark').addEventListener('click', (e) => { e.preventDefault(); smoothScrollTo(0) })

const pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false }
addEventListener('pointermove', (e) => {
  pointer.x = e.clientX; pointer.y = e.clientY
  pointer.nx = (e.clientX / innerWidth) * 2 - 1; pointer.ny = -(e.clientY / innerHeight) * 2 + 1
  pointer.active = true
}, { passive: true })
document.addEventListener('pointerleave', () => { pointer.active = false })
addEventListener('blur', () => { pointer.active = false })

const drag = { on: false, lastX: 0, lastT: 0, moved: 0, offset: 0, v: 0 }
const dragZone = $('#ch-gallery .dragzone')
dragZone.addEventListener('pointerdown', (e) => {
  drag.on = true; drag.lastX = e.clientX; drag.lastT = performance.now(); drag.moved = 0; drag.v = 0
  dragZone.setPointerCapture(e.pointerId)
})
dragZone.addEventListener('pointermove', (e) => {
  if (!drag.on) return
  const now = performance.now(), dx = e.clientX - drag.lastX, dt = Math.max(1, now - drag.lastT) / 1000
  drag.offset -= dx / 520; drag.v = -(dx / 520) / dt; drag.moved += Math.abs(dx)
  drag.lastX = e.clientX; drag.lastT = now
})
const endDrag = () => {
  if (!drag.on) return
  drag.on = false
  if (drag.moved < 5 && gallery.hovered >= 0) openDetail(gallery.hovered)
}
dragZone.addEventListener('pointerup', endDrag); dragZone.addEventListener('pointercancel', endDrag)
$('#ch-physics .zone').addEventListener('pointerdown', () => { if (scroll.p > 15 && scroll.p < 18.2) physics.scatter() })

let detailOpen = false
function openDetail(i) {
  const d = STAGES[i]
  detailOpen = true; gallery.selected = i
  el.dTitle.textContent = d.title; el.dDesc.textContent = d.desc; el.dLetter.textContent = d.letter
  el.dSpecs.innerHTML = d.specs.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')
  el.detail.style.setProperty('--accent', d.accent)
  el.detail.classList.add('open'); el.detail.setAttribute('aria-hidden', 'false')
}
function closeDetail() { detailOpen = false; gallery.selected = -1; el.detail.classList.remove('open'); el.detail.setAttribute('aria-hidden', 'true') }
$('#detailClose').addEventListener('click', closeDetail)
el.gOpen.addEventListener('click', (e) => { e.preventDefault(); openDetail(clamp(Math.round(gallery.g ?? 0), 0, 4)) })
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail() })

const gNav = document.createElement('nav')
gNav.className = 'letters ia'
gNav.setAttribute('aria-label', 'Etapas S.C.A.L.E.')
gNav.innerHTML = '<button type="button" class="step" data-dir="-1" aria-label="Etapa anterior">←</button>'
  + STAGES.map((s, i) => `<button type="button" data-i="${i}" aria-label="${s.title}">${s.letter}</button>`).join('')
  + '<button type="button" class="step" data-dir="1" aria-label="Etapa siguiente">→</button>'
el.gIdx.after(gNav)
const gLetterEls = [...gNav.querySelectorAll('[data-i]')]
function goStage(i) {
  i = clamp(i, 0, STAGES.length - 1)
  drag.offset = i - range(scroll.p, 7.0, 11.0) * 4
  drag.v = 0
  if (detailOpen) openDetail(i)
}
gNav.addEventListener('click', (e) => {
  const b = e.target.closest('button')
  if (!b) return
  const cur = clamp(Math.round(gallery.g ?? 0), 0, STAGES.length - 1)
  goStage(b.dataset.dir ? cur + +b.dataset.dir : +b.dataset.i)
})
addEventListener('keydown', (e) => {
  if (scroll.p < 6.9 || scroll.p > 11.5) return
  const cur = clamp(Math.round(gallery.g ?? 0), 0, STAGES.length - 1)
  if (e.key === 'ArrowRight') goStage(cur + 1)
  else if (e.key === 'ArrowLeft') goStage(cur - 1)
})

let gActive = -1
function setGalleryText(i, instant) {
  const d = STAGES[i]
  gLetterEls.forEach((b, k) => b.classList.toggle('on', k === i))
  const apply = () => {
    if (el.gTitle) el.gTitle.textContent = d.title
    if (el.gKind) el.gKind.textContent = d.kind
    if (el.gDesc) el.gDesc.textContent = d.desc
    el.gallery.style.setProperty('--accent', d.accent)
    el.gallery.classList.remove('swap')
  }
  if (gCounter) gCounter.set(i + 1)
  if (instant) { apply(); return }
  el.gallery.classList.add('swap')
  setTimeout(apply, 260)
}

/* Mask zoom: the screen dives into a solid letter of the mask word */
const measureCanvas = document.createElement('canvas').getContext('2d')
let maskGeo = { ox: 0, oy: 0 }
function layoutMask() {
  const W = innerWidth, H = innerHeight
  const text = el.maskText.textContent
  const zi = text.lastIndexOf('I') >= 0 ? text.lastIndexOf('I') : text.length - 1
  el.mask.setAttribute('viewBox', `0 0 ${W} ${H}`)
  const fs = Math.min(W * 0.125, 190)
  measureCanvas.font = `800 ${fs}px Archivo, Helvetica, Arial, sans-serif`
  const ls = -0.045 * fs
  const wAll = measureCanvas.measureText(text).width + ls * (text.length - 1)
  const wPre = measureCanvas.measureText(text.slice(0, zi)).width + ls * zi
  const wZ = measureCanvas.measureText(text[zi]).width
  const x = W / 2, y = H * 0.70
  maskGeo = { ox: x - wAll / 2 + wPre + wZ / 2, oy: y }
  el.maskText.setAttribute('x', x); el.maskText.setAttribute('y', y)
  el.maskText.setAttribute('font-size', fs)
  el.maskText.setAttribute('letter-spacing', ls)
}
addEventListener('resize', layoutMask)

const stretch = new Spring(1, 60, 10)
let mblur = 0
const camX = new Spring(0, 30, 8), camY = new Spring(0, 30, 8)
const _wn = new THREE.Vector3(), _wd = new THREE.Vector3(), _pw = new THREE.Vector3()
function pointerOnPlane(z) {
  _wn.set(pointer.nx, pointer.ny, 0.5).unproject(S.camera)
  _wd.copy(_wn).sub(S.camera.position).normalize()
  const t = (z - S.camera.position.z) / _wd.z
  if (t <= 0) return null
  return _pw.copy(S.camera.position).addScaledVector(_wd, t)
}
const keyBase = new THREE.Color('#ffffff'), keyTarget = new THREE.Color()
const revealed = { ph: false, final: false, foot: false }
let hintOff = false
let last = performance.now()
const t0 = last

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const t = (now - t0) / 1000
  scroll.update(dt)
  const p = scroll.p, vel = reduced ? 0 : scroll.vel
  const menu = nav.isOpen()
  for (const [node, a, b] of chapters) node.classList.toggle('on', p > a - 0.12 && p < b + 0.12)
  const dark = p < 7 ? smooth(range(p, 2.7, 3.45)) : smooth(range(p, 17.5, 18.2))
  S.setBackground(dark)
  html.classList.toggle('dark', dark > 0.5)
  S.setBloom(dark * 0.55 + (0.25 + 0.5 * range(p, 20.1, 20.7)) * range(p, 18, 18.6) * (1 - range(p, 21, 21.6)))

  let cz = 14, cx = 0
  if (p < 7) {
    cz = 14 - 5 * easeInOut(range(p, 0, 1.3)) - 13 * easeInOut(range(p, 2.6, 4)) - 6 * range(p, 4, 7)
    cx = 1.3 * Math.sin(range(p, 0, 1.3) * Math.PI)
  }
  const par = p < 7 ? 0.35 : 1
  camX.update(pointer.active ? pointer.nx * 0.5 * par : 0, dt)
  camY.update(pointer.active ? pointer.ny * 0.3 * par : 0, dt)
  S.camera.position.set(cx + camX.v, camY.v, cz)
  S.camera.lookAt(camX.v * 0.4, camY.v * 0.4, cz - 12)
  sculpture.update(dt, { t, p, pointer, camera: S.camera, vel })

  /* 01 hero */
  const hp = range(p, 0, 1.35), hfade = 1 - range(p, 0.55, 1.05)
  el.heroH1.style.transform = `translate3d(0, ${(-hp * 34).toFixed(2)}vh, 0) scaleY(${stretch.v.toFixed(4)})`
  el.heroH1.style.opacity = hfade
  el.heroMeta.style.transform = `translate3d(0, ${(-hp * 18).toFixed(2)}vh, 0)`
  el.heroCta.style.transform = `translate3d(0, ${(-hp * 26).toFixed(2)}vh, 0)`
  el.heroLabel.style.transform = `translate3d(0, ${(-hp * 12).toFixed(2)}vh, 0)`
  for (const n of [el.heroMeta, el.heroCta, el.heroLabel, el.heroHint]) n.style.opacity = n === el.heroHint ? hfade * (hintOff ? 0 : 1) : hfade
  if (p > 0.2 && !hintOff) hintOff = true

  /* 02 crecer sin raíz */
  if (p >= 3.9 && p < 7) {
    const mu = range(p, 4.0, 6.6), mo = range(p, 4.0, 4.4)
    el.line1.style.transform = `translate3d(${lerp(14, -46, mu).toFixed(2)}vw, ${(-range(p, 4, 7) * 6).toFixed(2)}vh, 0) scaleY(${stretch.v.toFixed(4)})`
    el.line2.style.transform = `translate3d(${lerp(-14, 46, mu).toFixed(2)}vw, ${(-range(p, 4, 7) * 3).toFixed(2)}vh, 0) scaleY(${stretch.v.toFixed(4)})`
    el.line1.style.opacity = el.line2.style.opacity = mo * (1 - range(p, 6.35, 6.7))
    el.note.style.opacity = range(p, 4.3, 4.8) * (1 - range(p, 6.0, 6.35))
    el.mask.style.display = 'block'
    const s = 1 + 0.6 * range(p, 4.2, 6.3) + 72 * easeIn(range(p, 6.3, 7.0))
    const { ox, oy } = maskGeo
    el.maskText.setAttribute('transform', `translate(${ox} ${oy}) scale(${s.toFixed(4)}) translate(${-ox} ${-oy})`)
    el.maskText.setAttribute('opacity', mo)
  } else el.mask.style.display = 'none'

  /* 03 método */
  const gAppear = range(p, 6.98, 7.6) * (1 - range(p, 11.0, 11.5))
  if (!drag.on) {
    drag.v = damp(drag.v, 0, 5, dt)
    drag.offset += drag.v * dt
    const gScroll = range(p, 7.0, 11.0) * 4
    const snap = Math.round(gScroll + drag.offset) - gScroll
    if (Math.abs(drag.v) < 0.4) drag.offset = damp(drag.offset, snap, 6, dt)
  }
  const g = clamp(range(p, 7.0, 11.0) * 4 + drag.offset, -0.7, 4.7)
  gallery.g = g
  const galleryOn = p > 6.9 && p < 11.5
  gallery.update(dt, { t, g, appear: gAppear, pointer, camera: S.camera, enabled: galleryOn && !menu, detailOpen })
  if (galleryOn) {
    const ai = clamp(Math.round(g), 0, 4)
    if (ai !== gActive) { setGalleryText(ai, gActive < 0); gActive = ai }
    keyTarget.set(STAGES[ai].accent).lerp(keyBase, 0.55)
    S.accent.color.set(STAGES[ai].accent)
    S.accent.intensity = damp(S.accent.intensity, 9 * gAppear, 4, dt)
    el.gallery.classList.toggle('lit', gAppear > 0.5)
    el.gTitle.style.transform = `translate3d(0, ${((1 - gAppear) * 10).toFixed(2)}vh, 0) scaleY(${stretch.v.toFixed(4)})`
    for (const n of [el.gTitle, el.gKind, el.gDesc?.parentElement, el.gHint, el.gIdx, gNav]) if (n) n.style.opacity = gAppear
    if (detailOpen && (p < 7 || p > 11.5)) closeDetail()
  } else {
    S.accent.intensity = damp(S.accent.intensity, 0, 4, dt)
    keyTarget.copy(keyBase)
    el.gallery.classList.remove('lit')
  }
  S.key.color.lerp(keyTarget, 1 - Math.exp(-3 * dt))

  /* 04 sistema */
  if (p > 10.9 && p < 15.2) {
    const lo = range(p, 11.05, 11.4) * (1 - range(p, 14.6, 15.0))
    el.typoLabel.style.opacity = lo; el.typoNote.style.opacity = lo
    for (let k = 0; k < 4; k++) {
      const u = range(p, 11 + k, 12 + k)
      const w = el.words[k]
      const vis = u > 0 && u < 1
      w.style.opacity = vis ? range(u, 0, 0.08) * (1 - range(u, 0.86, 1)) : 0
      if (!vis) continue
      const travel = u * u * 1900
      w.querySelector('.stage').style.transform = `translate3d(0,0,${travel.toFixed(1)}px) scaleY(${stretch.v.toFixed(4)})`
      const chars = wordChars[k]
      for (let i = 0; i < chars.length; i++) {
        const side = (i % 2 ? 1 : -1) * (0.35 + 0.65 * ((i * 7919) % 97) / 97)
        const z = -side * 1500 * u * (i === Math.floor(chars.length / 2) ? 0.35 : 1)
        chars[i].style.transform = `translate3d(${(side * 9 * u).toFixed(2)}vw, ${((i % 3 - 1) * 6 * u).toFixed(2)}vh, ${z.toFixed(1)}px) rotateY(${(side * 42 * u).toFixed(2)}deg)`
      }
    }
  }

  /* 05 estructura */
  const phAppear = range(p, 13.7, 15.2) * (1 - range(p, 17.9, 18.45))
  const phOn = p > 14.8 && p < 18.3
  const gravity = clamp(vel * 0.6, -0.4, 1) + (p > 15.3 ? 0.12 : 0)
  physics.update(dt, { t, appear: phAppear, gravity, pointerWorld: phOn && pointer.active && !menu ? pointerOnPlane(0) : null })
  if (phOn) {
    if (!revealed.ph && p > 15.1) { revealed.ph = true; revealChars(el.phH2, { step: 26 }); setStats() }
    const o = range(p, 15.05, 15.4) * (1 - range(p, 17.7, 18.1))
    for (const n of [el.phLabel, el.phHint, el.phStats]) n.style.opacity = o
    el.phH2.style.opacity = o
    el.phH2.style.transform = `translate3d(0, ${(-range(p, 15, 18) * 6).toFixed(2)}vh, 0) scaleY(${stretch.v.toFixed(4)})`
  } else if (p < 14.8 && revealed.ph) { revealed.ph = false; unreveal(el.phH2) }

  /* 06 ecosistema */
  finale.update(dt, { t, appear: range(p, 18.0, 18.7), breakT: range(p, 19.9, 21.0) })
  if (p > 17.9 && p < 21.2) {
    if (!revealed.final && p > 18.3) { revealed.final = true; revealChars(el.finalH2, { step: 30 }) }
    el.finalH2.style.opacity = range(p, 18.3, 18.8) * (1 - range(p, 20.3, 20.8))
    el.finalH2.style.transform = `translate(-50%,-50%) scale(${(1 + 0.08 * range(p, 18, 21)).toFixed(4)}) scaleY(${stretch.v.toFixed(4)})`
  } else if (p < 17.9 && revealed.final) { revealed.final = false; unreveal(el.finalH2) }

  /* 07 contacto */
  if (p > 20.9) {
    const fo = easeOut(range(p, 21.05, 21.8))
    if (!revealed.foot && p > 21.1) {
      revealed.foot = true
      revealChars(el.footH2, { step: 30, delay: 120 })
      revealChars(el.footMark, { step: 45, delay: 380 })
    }
    el.footOutro.style.opacity = fo; el.footOutro.style.transform = `translate3d(0, ${((1 - fo) * 4).toFixed(2)}vh, 0)`
    el.footCols.style.opacity = fo; el.footCols.style.transform = `translate3d(0, ${((1 - fo) * 6).toFixed(2)}vh, 0)`
    el.footLegal.style.opacity = fo
  } else if (revealed.foot) { revealed.foot = false; unreveal(el.footMark); unreveal(el.footH2) }

  /* velocity stretch, rail, cursor */
  const vmag = Math.abs(vel)
  stretch.update(1 + clamp(vmag * 0.035, 0, 0.14), dt)
  mblur = damp(mblur, clamp(vmag * 0.32, 0, 2.4), 8, dt)
  html.style.setProperty('--stretch', stretch.v.toFixed(4))
  html.style.setProperty('--mblur', mblur.toFixed(2) + 'px')
  el.rail.style.top = (clamp01(p / TOTAL) * 100).toFixed(2) + '%'
  let cs = '', ct = ''
  if (menu) cs = 'link'
  else if (galleryOn && !detailOpen) {
    cs = gallery.hovered >= 0 ? 'view' : (pointer.y > innerHeight * 0.24 && pointer.y < innerHeight * 0.74 ? 'drag' : '')
    ct = cs === 'view' ? 'VER' : cs === 'drag' ? 'MOVER' : ''
  } else if (phOn) { cs = 'drag'; ct = 'EMPUJE' }
  cursor.set(cs, ct)
  cursor.update(dt, pointer)
  for (const m of magnetics) m.update(dt, pointer)
  for (const u of underlines) u.update(dt)
  S.render()
}

function runIntro() {
  el.heroH1.classList.add('go'); el.hero.classList.add('go')
  el.heroH1.querySelectorAll('.l1 .ch-char').forEach((c, i) => { c.style.transitionDelay = (120 + i * 55) + 'ms' })
  el.heroH1.querySelectorAll('.l2 .ch-char').forEach((c, i) => { c.style.transitionDelay = (700 + i * 45) + 'ms' })
}

Promise.resolve(document.fonts ? document.fonts.ready : null).then(() => {
  layoutMask()
  el.loader.classList.add('off')
  runIntro()
  const loop = (now) => { frame(now); requestAnimationFrame(loop) }
  requestAnimationFrame(loop)
})
