import * as THREE from 'three'
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const clamp01 = (v) => clamp(v, 0, 1)
const lerp = (a, b, t) => a + (b - a) * t
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const HERO_OPACITY = 0.55
const hash = (i) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s) }

export function makeStudioEnv(renderer) {
  const s = new THREE.Scene()
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vP;
      void main(){
        vec3 d = normalize(vP); float u = atan(d.z, d.x); float v = d.y;
        vec3 col = mix(vec3(0.03), vec3(0.9), smoothstep(-0.55, 0.85, v));
        col *= 1.0 - 0.6 * exp(-pow((v + 0.05) / 0.12, 2.0));
        col += vec3(1.0) * 2.2 * exp(-pow((v - 0.62) / 0.085, 2.0));
        col += vec3(1.0) * 0.8 * exp(-pow((v - 0.14) / 0.045, 2.0)) * (0.55 + 0.45 * cos(u * 3.0 + 0.6));
        col += vec3(0.00,0.40,1.00) * 1.4 * exp(-pow((u - 1.9) / 0.65, 2.0)) * exp(-pow((v - 0.02) / 0.45, 2.0));
        col += vec3(0.55,0.33,1.00) * 1.1 * exp(-pow((u + 1.7) / 0.65, 2.0)) * exp(-pow((v + 0.08) / 0.45, 2.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
  s.add(new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), mat))
  const pm = new THREE.PMREMGenerator(renderer)
  const tex = pm.fromScene(s, 0.02).texture
  pm.dispose()
  return tex
}

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
  constructor(scene, low) {
    this.strands = 6
    this.along = low ? 48 : 110
    this.n = this.strands * this.along
    const n = this.n
    this.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.15, roughness: 0.14, transmission: 0, ior: 1.46,
      clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [140, 620],
      envMapIntensity: 2.2, transparent: true, opacity: 0.88, specularIntensity: 1.4,
      emissive: new THREE.Color('#0066ff'), emissiveIntensity: 0.22,
    })
    this.chrome = new THREE.MeshPhysicalMaterial({
      color: 0xe0e0e0, metalness: 1, roughness: 0.1, envMapIntensity: 2.2, clearcoat: 0.4, clearcoatRoughness: 0.06,
      emissive: new THREE.Color('#c6ff34'), emissiveIntensity: 0.06,
    })
    this.chromeStrand = 2
    const nChrome = this.along, nGlass = n - nChrome
    const geo = bladeGeometry()
    this.meshGlass = new THREE.InstancedMesh(geo, this.glass, nGlass)
    this.meshChrome = new THREE.InstancedMesh(geo, this.chrome, nChrome)
    this.meshes = [this.meshGlass, this.meshChrome]
    for (const m of this.meshes) { m.frustumCulled = false; scene.add(m) }
    this.dx = new Float32Array(n * 3); this.dv = new Float32Array(n * 3)
    this.rd = new Float32Array(n); this.rv = new Float32Array(n)
    this.slot = new Int32Array(n)
    this.h1 = new Float32Array(n); this.h2 = new Float32Array(n); this.stagger = new Float32Array(n)
    this.card = new Uint8Array(n); this.gx = new Float32Array(n); this.gy = new Float32Array(n); this.gz = new Float32Array(n)
    const cols = low ? 16 : 30, rows = Math.ceil(n / cols)
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
        const hv = hash(i * 7 + 3)
        c.setHSL(hv < 0.7 ? 0.6 + 0.04 * hv : 0.72, hv < 0.7 ? 0.55 : 0.6, 0.62)
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
  update(dt, { t, p, pointer, camera, vel }) {
    const expand = easeInOut(range(p, 0, 1.0))
    const gridP = range(p, 1.0, 2.0)
    const spread = smooth(range(p, 2.0, 3.0))
    const lum = smooth(range(p, 2.2, 2.8))
    const fade = smooth(range(p, 2.9, 3.4))
    for (const m of this.meshes) m.visible = fade < 1
    if (fade >= 1) return
    this.glass.emissiveIntensity = 0.22 + lum * 0.7
    this.chrome.emissiveIntensity = 0.06 + lum * 0.3
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
      scale *= 1 - fade
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
      _sc.setScalar(scale)
      this.dummy.position.copy(_pos); this.dummy.quaternion.copy(_q); this.dummy.scale.copy(_sc)
      this.dummy.updateMatrix()
        ; (k === this.chromeStrand ? this.meshChrome : this.meshGlass).setMatrixAt(this.slot[i], this.dummy.matrix)
    }
    for (const m of this.meshes) m.instanceMatrix.needsUpdate = true
  }
}

export function initHero(canvas, section, reduced, stage = section) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    canvas.remove()
    return
  }
  const low = innerWidth < 820 || (navigator.hardwareConcurrency || 8) <= 4
  renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  scene.environment = makeStudioEnv(renderer)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 220)
  camera.position.set(0, 0, 14)
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 8, 6); scene.add(key)
  const rim = new THREE.DirectionalLight(0x8c55ff, 2.0); rim.position.set(-7, 3, -3); scene.add(rim)
  const fill = new THREE.DirectionalLight(0x0066ff, 1.4); fill.position.set(-3, -4, 5); scene.add(fill)
  scene.add(new THREE.AmbientLight(0xffffff, 0.25))
  const sculpture = new Sculpture(scene, low)

  const pointer = { nx: 0, ny: 0, active: false }
  addEventListener('pointermove', (e) => {
    pointer.nx = (e.clientX / innerWidth) * 2 - 1
    pointer.ny = -(e.clientY / innerHeight) * 2 + 1
    pointer.active = true
  }, { passive: true })
  document.addEventListener('pointerleave', () => { pointer.active = false })

  function resize() {
    const w = section.clientWidth, h = section.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = Math.min(62, 34 * Math.pow(Math.max(1, 1.2 / camera.aspect), 0.55))
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  const copy = section.querySelector('.hero-copy')
  const statement = section.querySelector('.hero-statement')
  const stEnd = section.querySelector('.st-end')

  let visible = true
  new IntersectionObserver(([e]) => {
    const was = visible
    visible = e.isIntersecting
    if (visible && !was) { clock.getDelta(); requestAnimationFrame(loop) }
  }).observe(stage)

  const clock = new THREE.Clock()
  let t = 0, p = 0, lastY = scrollY, vel = 0
  function loop() {
    if (!visible) return
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!reduced) t += dt
    const target = clamp(-stage.getBoundingClientRect().top / innerHeight, 0, 4.2)
    p += (target - p) * Math.min(1, dt * 6)
    if (copy) {
      const o = 1 - range(p, 0.12, 0.7)
      copy.style.opacity = String(o)
      copy.style.transform = `translate3d(0, ${(-range(p, 0, 0.7) * 8).toFixed(2)}vh, 0)`
      copy.style.visibility = o < 0.01 ? 'hidden' : ''
    }
    if (statement) {
      const o = range(p, 1.05, 1.45)
      statement.style.opacity = String(o)
      statement.style.transform = `translate3d(0, ${((1 - range(p, 1.05, 1.6)) * 6).toFixed(2)}vh, 0)`
    }
    if (stEnd) {
      const e = range(p, 2.95, 3.35)
      stEnd.style.opacity = String(e)
      stEnd.style.transform = `translate3d(0, ${((1 - e) * 0.25).toFixed(3)}em, 0)`
    }
    const v = dt > 0 ? (scrollY - lastY) / dt / innerHeight : 0
    vel += (v - vel) * Math.min(1, dt * 10)
    lastY = scrollY
    sculpture.update(dt, { t, p, pointer, camera, vel })
    canvas.style.opacity = String(HERO_OPACITY * (1 - range(p, 2.9, 3.4)))
    renderer.render(scene, camera)
    if (!reduced) requestAnimationFrame(loop)
  }
  if (reduced) addEventListener('scroll', () => requestAnimationFrame(loop), { passive: true })
  loop()
}
