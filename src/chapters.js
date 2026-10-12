import * as THREE from 'three'
import { makeStudioEnv } from './hero3d.js'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const clamp01 = (v) => clamp(v, 0, 1)
const lerp = (a, b, t) => a + (b - a) * t
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeIn = (t) => t * t * t
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s) }
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

const BRAND = ['#0066ff', '#8c55ff', '#c6ff34', '#f5023f']
const BRAND_WEIGHTS = [0.36, 0.3, 0.2, 0.14]
const pickBrand = (u) => {
  let acc = 0
  for (let k = 0; k < BRAND.length; k++) { acc += BRAND_WEIGHTS[k]; if (u < acc) return k }
  return BRAND.length - 1
}

const stageProgress = (stage) => -stage.getBoundingClientRect().top / innerHeight

function whileVisible(stage, frame) {
  let visible = false, last = performance.now()
  const loop = (now) => {
    if (!visible) return
    frame(Math.min((now - last) / 1000, 0.05))
    last = now
    requestAnimationFrame(loop)
  }
  new IntersectionObserver(([e]) => {
    const was = visible
    visible = e.isIntersecting
    if (visible && !was) { last = performance.now(); requestAnimationFrame(loop) }
  }, { rootMargin: '60% 0px' }).observe(stage)
}

function velocityTracker() {
  let last = scrollY, v = 0
  return (dt) => {
    const raw = dt > 0 ? (scrollY - last) / dt / innerHeight : 0
    last = scrollY
    v += (raw - v) * Math.min(1, dt * 10)
    return v
  }
}

function create3D(canvas, section, { fov = 34, z = 14 } = {}) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    canvas.remove()
    return null
  }
  const low = innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4
  renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  scene.environment = makeStudioEnv(renderer)
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200)
  camera.position.set(0, 0, z)
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 8, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(0x8c55ff, 2.0); rim.position.set(-7, 3, -3); scene.add(rim)
  const fill = new THREE.DirectionalLight(0x0066ff, 1.4); fill.position.set(-3, -4, 5); scene.add(fill)
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa9c1ff, metalness: 0.15, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04,
    iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [140, 620],
    envMapIntensity: 2.2, transparent: true, opacity: 0.9, specularIntensity: 1.4,
    emissive: new THREE.Color('#0066ff'), emissiveIntensity: 0.18,
  })
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xe0e0e0, metalness: 1, roughness: 0.1, envMapIntensity: 2.2, clearcoat: 0.4, clearcoatRoughness: 0.06,
  })
  const resize = () => {
    const w = section.clientWidth, h = section.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = Math.min(62, fov * Math.pow(Math.max(1, 1.2 / camera.aspect), 0.55))
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()
  return { renderer, scene, camera, glass, chrome, low }
}

/* ---------- Sistema: four words that open as you pass through them ---------- */
export function initSistema(stage, sec = stage.querySelector('.chapter')) {
  const words = [...sec.querySelectorAll('.word')]
  const chars = words.map((w) => {
    const st = w.querySelector('.word-in')
    const letters = [...st.textContent.trim()]
    st.textContent = ''
    return letters.map((ch) => {
      const s = document.createElement('span')
      s.className = 'ch-char'
      s.textContent = ch
      st.appendChild(s)
      return s
    })
  })
  const fades = [...sec.querySelectorAll('[data-ch-fade]')]
  let p = 0
  whileVisible(stage, (dt) => {
    const target = clamp(stageProgress(stage), -1, 4)
    p += (target - p) * Math.min(1, dt * 8)
    const lo = range(p, -0.4, 0.05) * (1 - range(p, 3.6, 4))
    for (const n of fades) n.style.opacity = String(lo)
    for (let k = 0; k < words.length; k++) {
      const u = range(p, k, k + 1)
      const w = words[k]
      const vis = u > 0 && u < 1
      w.style.opacity = vis ? String(range(u, 0, 0.08) * (1 - range(u, 0.86, 1))) : '0'
      if (!vis) continue
      w.querySelector('.word-in').style.transform = `translate3d(0,0,${(u * u * 1900).toFixed(1)}px)`
      const cs = chars[k]
      for (let i = 0; i < cs.length; i++) {
        const side = (i % 2 ? 1 : -1) * (0.35 + 0.65 * ((i * 7919) % 97) / 97)
        const z = -side * 1500 * u * (i === Math.floor(cs.length / 2) ? 0.35 : 1)
        cs[i].style.transform = `translate3d(${(side * 9 * u).toFixed(2)}vw, ${((i % 3 - 1) * 6 * u).toFixed(2)}vh, ${z.toFixed(1)}px) rotateY(${(side * 42 * u).toFixed(2)}deg)`
      }
    }
  })
}

/* ---------- Estructura: without a root, everything falls ---------- */
const _pm = new THREE.Matrix4(), _pq = new THREE.Quaternion(), _pe = new THREE.Euler(), _ps = new THREE.Vector3(), _pp = new THREE.Vector3()

class Physics {
  constructor(scene, low, mats) {
    this.n = low ? 36 : 66
    const n = this.n
    this.root = new THREE.Group(); scene.add(this.root)
    const per = Math.ceil(n / 3)
    const geos = [
      new THREE.SphereGeometry(0.32, 40, 28),
      new THREE.TetrahedronGeometry(0.5, 0),
      new THREE.TorusGeometry(0.36, 0.09, 20, 48),
    ]
    const mat = [mats.chrome, mats.glass, mats.chrome]
    this.meshes = geos.map((g, k) => { const m = new THREE.InstancedMesh(g, mat[k], per); m.frustumCulled = false; this.root.add(m); return m })
    const tint = new THREE.Color(), white = new THREE.Color('#ffffff')
    for (let i = 0; i < n; i++) {
      const u = hash(i * 71 + 9)
      if (u < 0.3) tint.set('#e0e0e0')
      else tint.set(BRAND[pickBrand((u - 0.3) / 0.7)]).lerp(white, i % 3 === 1 ? 0.1 : 0.35)
      this.meshes[i % 3].setColorAt(Math.floor(i / 3), tint)
    }
    for (const m of this.meshes) if (m.instanceColor) m.instanceColor.needsUpdate = true
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.home = new Float32Array(n * 3)
    this.rot = new Float32Array(n * 3); this.ang = new Float32Array(n * 3); this.rad = new Float32Array(n); this.sc = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const i3 = i * 3
      this.home[i3] = (hash(i * 3 + 1) - 0.5) * 15; this.home[i3 + 1] = 6.2 + hash(i * 5 + 2) * 7; this.home[i3 + 2] = (hash(i * 7 + 3) - 0.5) * 5
      this.pos.set([this.home[i3], this.home[i3 + 1], this.home[i3 + 2]], i3)
      this.rot[i3] = hash(i * 11) * 6; this.rot[i3 + 1] = hash(i * 13) * 6; this.rot[i3 + 2] = hash(i * 17) * 6
      this.ang[i3] = (hash(i * 19) - 0.5) * 0.6; this.ang[i3 + 1] = (hash(i * 23) - 0.5) * 0.6; this.ang[i3 + 2] = (hash(i * 29) - 0.5) * 0.6
      this.rad[i] = 0.32 + 0.1 * (i % 3 === 1 ? 0.5 : 0)
      this.sc[i] = 0.75 + hash(i * 31) * 0.6
    }
    this.floor = -4.9; this.wallX = 9.2; this.wallZ = 3.2
    this.rest = new Float32Array(n)
    for (let i = 0; i < n; i++) this.rest[i] = this.floor + 0.4 + hash(i * 61 + 7) * 1.4
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
  update(dt, { t, appear, gravity, drop = 0, pointerWorld }) {
    this.root.visible = appear > 0
    if (appear <= 0) return
    const h = Math.min(dt, 1 / 40)
    const a = easeOut(appear)
    this.modeT += h
    if (this.mode === 'scatter' && this.modeT > 1.5) { this.mode = 'rebuild'; this.modeT = 0 }
    if (this.mode === 'rebuild' && this.modeT > 3.2) { this.mode = 'free'; this.modeT = 0 }
    for (let i = 0; i < this.n; i++) {
      const i3 = i * 3
      let vx = this.vel[i3], vy = this.vel[i3 + 1], vz = this.vel[i3 + 2]
      let px = this.pos[i3], py = this.pos[i3 + 1], pz = this.pos[i3 + 2]
      const ty = lerp(this.home[i3 + 1], this.rest[i], drop)
      if (this.mode === 'rebuild') {
        const k = 16, d = 6.5
        vx += ((this.home[i3] - px) * k - vx * d) * h
        vy += ((ty - py) * k - vy * d) * h
        vz += ((this.home[i3 + 2] - pz) * k - vz * d) * h
      } else {
        const susp = 1 - clamp(gravity, 0, 1)
        vy += (-9.8 * 0.55 * gravity) * h + susp * (ty - py) * 6 * h + susp * 0.35 * Math.sin(t * 0.8 + i) * h
        vx += susp * (this.home[i3] - px) * 0.6 * h
        vz += susp * (this.home[i3 + 2] - pz) * 0.6 * h
        const drag = 1 - (0.55 + susp * 2.6) * h
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
      if (py > 16) { py = 16; vy = -Math.abs(vy) * 0.3 }
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
  }
}

export function initFisica(stage, sec = stage.querySelector('.chapter')) {
  const g = create3D(sec.querySelector('canvas'), sec, { fov: 38, z: 15 })
  if (!g) return
  const physics = new Physics(g.scene, g.low, g)
  const fades = [...sec.querySelectorAll('[data-ch-fade]')]
  const h2 = sec.querySelector('h2')
  const vel = velocityTracker()
  const pointer = { x: 0, y: 0, active: false }
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3()
  sec.addEventListener('pointermove', (e) => {
    const r = sec.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
    pointer.active = true
  })
  sec.addEventListener('pointerleave', () => { pointer.active = false })
  sec.addEventListener('pointerdown', () => physics.scatter())
  let t = 0, p = 0
  whileVisible(stage, (dt) => {
    if (!reduced) t += dt
    const target = clamp(stageProgress(stage), -1.6, 3)
    p += (target - p) * Math.min(1, dt * 8)
    const v = vel(dt)
    const appear = range(p, -1.1, -0.15) * (1 - range(p, 2.6, 3.0))
    const drop = smooth(range(p, -0.3, 1.3))
    const gravity = clamp(smooth(range(drop, 0.8, 1)) + Math.max(0, v * 0.25) * drop, 0, 1)
    let pw = null
    if (pointer.active) {
      ray.setFromCamera({ x: pointer.x, y: pointer.y }, g.camera)
      if (ray.ray.intersectPlane(plane, hit)) pw = hit
    }
    physics.update(dt, { t, appear, gravity, drop, pointerWorld: pw })
    const o = range(p, -0.25, 0.15) * (1 - range(p, 2.4, 2.8))
    for (const n of fades) n.style.opacity = String(o)
    sec.classList.toggle('in', p > -0.2)
    if (h2) h2.style.transform = `translate3d(0, ${(-range(p, 0, 3) * 6).toFixed(2)}vh, 0)`
    g.renderer.render(g.scene, g.camera)
  })
}

/* ---------- Ecosistema: a glass seed that bursts into light ---------- */
const _fa = new THREE.Vector3(), _fb = new THREE.Vector3(), _fc = new THREE.Vector3()

class Finale {
  constructor(scene, mats) {
    this.root = new THREE.Group(); scene.add(this.root)
    const ico = new THREE.IcosahedronGeometry(2.3, 1)
    const pos = ico.attributes.position
    this.shards = []
    const white = new THREE.Color('#ffffff'), graphite = new THREE.Color('#363a3d')
    this.shardMats = BRAND.map((hex) => {
      const m = mats.glass.clone()
      m.color.set(hex).lerp(white, 0.18)
      m.emissive = new THREE.Color(hex)
      m.emissiveIntensity = 0.2
      m.iridescence = 0.6
      m.opacity = 0.94
      return m
    })
    const shardColor = []
    for (let f = 0; f < pos.count / 3; f++) {
      const k = pickBrand(hash(f * 23 + 4))
      const m = this.shardMats[k]
      shardColor.push(new THREE.Color(BRAND[k]))
      _fa.fromBufferAttribute(pos, f * 3); _fb.fromBufferAttribute(pos, f * 3 + 1); _fc.fromBufferAttribute(pos, f * 3 + 2)
      const center = new THREE.Vector3().add(_fa).add(_fb).add(_fc).multiplyScalar(1 / 3)
      const normal = center.clone().normalize()
      const geo = new THREE.BufferGeometry()
      const inA = _fa.clone().addScaledVector(normal, -0.09), inB = _fb.clone().addScaledVector(normal, -0.09), inC = _fc.clone().addScaledVector(normal, -0.09)
      const tri = [_fa, _fb, _fc, inA, inB, inC].map((v) => v.clone().sub(center))
      const verts = [
        tri[0], tri[1], tri[2], tri[5], tri[4], tri[3],
        tri[0], tri[3], tri[1], tri[1], tri[3], tri[4],
        tri[1], tri[4], tri[2], tri[2], tri[4], tri[5],
        tri[2], tri[5], tri[0], tri[0], tri[5], tri[3],
      ]
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts.flatMap((v) => [v.x, v.y, v.z]), 3))
      geo.computeVertexNormals()
      const mesh = new THREE.Mesh(geo, m)
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
    const pc = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const c = hash(i * 17 + 3) < 0.25 ? graphite : shardColor[Math.floor(i / 6)]
      pc[i * 3] = c.r; pc[i * 3 + 1] = c.g; pc[i * 3 + 2] = c.b
    }
    pg.setAttribute('color', new THREE.BufferAttribute(pc, 3))
    this.points = new THREE.Points(pg, new THREE.PointsMaterial({ vertexColors: true, size: 0.05, transparent: true, opacity: 0, depthWrite: false }))
    this.root.add(this.points)
    this.lights = [
      new THREE.PointLight(0x0066ff, 0, 22, 1.6),
      new THREE.PointLight(0x8c55ff, 0, 22, 1.6),
      new THREE.PointLight(0xc6ff34, 0, 18, 1.8),
    ]
    this.lights[0].position.set(4, 2, 3); this.lights[1].position.set(-4, -1, 3); this.lights[2].position.set(0, 4, -3)
    for (const l of this.lights) scene.add(l)
  }
  update(dt, { t, appear, breakT }) {
    this.root.visible = appear > 0
    if (appear <= 0) { for (const l of this.lights) l.intensity = 0; return }
    const a = easeOut(appear)
    this.root.rotation.y = t * 0.22; this.root.rotation.x = Math.sin(t * 0.19) * 0.22; this.root.rotation.z = Math.sin(t * 0.13) * 0.1
    this.root.scale.setScalar(lerp(0.6, 1, a))
    const glow = smooth(range(breakT, 0.05, 0.6))
    const lit = a * (1 - range(breakT, 0.7, 1))
    this.lights[0].intensity = 6 * lit; this.lights[1].intensity = 6 * lit; this.lights[2].intensity = 3.5 * lit * (0.4 + glow)
    this.lights[0].position.set(Math.cos(t * 0.5) * 4.5, 2, Math.sin(t * 0.5) * 4.5)
    this.lights[1].position.set(Math.cos(t * 0.5 + Math.PI) * 4.5, -1, Math.sin(t * 0.5 + Math.PI) * 4.5)
    for (const m of this.shardMats) m.emissiveIntensity = 0.22 + 1.1 * glow
    for (const s of this.shards) {
      const e = easeOut(range(breakT, s.stagger * 0.45, s.stagger * 0.45 + 0.55))
      s.mesh.position.copy(s.center).addScaledVector(s.normal, e * 3.0).addScaledVector(s.drift, e * e * 0.6)
      s.mesh.rotation.set(s.spin.x * e, s.spin.y * e, s.spin.z * e)
      s.mesh.scale.setScalar(Math.max(0.0001, 1 - smooth(range(breakT, 0.4, 0.92))))
    }
    this.core.scale.setScalar(Math.max(0.0001, 1 - smooth(range(breakT, 0.5, 0.85))))
    const pin = smooth(range(breakT, 0.55, 0.85)), pout = smooth(range(breakT, 0.86, 1.0))
    this.points.material.opacity = pin * (1 - pout)
    this.points.material.size = 0.06 + 0.08 * pin
    if (pin > 0) {
      const arr = this.points.geometry.attributes.position.array
      const k = easeIn(range(breakT, 0.6, 1.0)) * 7
      for (let i = 0; i < this.pn; i++) {
        const i3 = i * 3
        arr[i3] = this.pBase[i3] + this.pDir[i3] * k; arr[i3 + 1] = this.pBase[i3 + 1] + this.pDir[i3 + 1] * k; arr[i3 + 2] = this.pBase[i3 + 2] + this.pDir[i3 + 2] * k
      }
      this.points.geometry.attributes.position.needsUpdate = true
    }
  }
}

export function initEcosistema(stage, sec = stage.querySelector('.chapter')) {
  const g = create3D(sec.querySelector('canvas'), sec)
  if (!g) return
  const finale = new Finale(g.scene, g)
  const h2 = sec.querySelector('h2')
  let t = 0, p = 0
  whileVisible(stage, (dt) => {
    if (!reduced) t += dt
    const target = clamp(stageProgress(stage), -1, 3)
    p += (target - p) * Math.min(1, dt * 8)
    finale.update(dt, { t, appear: range(p, -0.8, 0), breakT: range(p, 1.2, 2.6) })
    if (h2) {
      h2.style.opacity = String(range(p, -0.3, 0.2) * (1 - range(p, 1.8, 2.3)))
      h2.style.transform = `translate(-50%, -50%) scale(${(1 + 0.08 * range(p, 0, 3)).toFixed(4)})`
    }
    g.renderer.render(g.scene, g.camera)
  })
}
