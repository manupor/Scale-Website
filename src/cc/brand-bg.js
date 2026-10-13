import * as THREE from 'three'

export function initBrandBackground(container) {
  if (!container) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
  container.appendChild(canvas)

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
  const cols = small ? 90 : 170
  const rows = small ? 60 : 100
  const W = 64
  const D = 40
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
    uBase: { value: new THREE.Color('#0a0a0f') },
    uBlue: { value: new THREE.Color('#0066ff') },
    uViolet: { value: new THREE.Color('#8c55ff') },
    uLime: { value: new THREE.Color('#c6ff34') },
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
      uniform vec3 uBase, uBlue, uViolet, uLime;
      varying float vH;
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = dot(c, c);
        if (r > 0.25) discard;
        float a = smoothstep(0.25, 0.0, r);
        vec3 col = mix(uBase, uBlue, smoothstep(0.5, 2.3, vH));
        col = mix(col, uViolet, smoothstep(-0.5, -2.3, vH) * 0.85);
        col = mix(col, uLime, smoothstep(1.8, 3.2, vH) * 0.6);
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
    const w = innerWidth
    const h = innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  const clock = new THREE.Clock()
  let scrollP = 0
  let running = true
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden
    if (running) {
      clock.getDelta()
      loop()
    }
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
    renderer.render(scene, camera)
    if (!reduced) requestAnimationFrame(loop)
  }
  loop()
}
