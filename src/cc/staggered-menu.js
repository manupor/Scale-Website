import { gsap } from 'gsap'
import './staggered-menu.css'

export function initStaggeredMenu(root, {
  position = 'right',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  closeOnClickAway = true,
  labels = { open: 'Menu', close: 'Close' },
  onMenuOpen,
  onMenuClose,
} = {}) {
  if (!root) return null

  const panel = root.querySelector('.staggered-menu-panel')
  const preContainer = root.querySelector('.sm-prelayers')
  const preLayers = preContainer ? [...preContainer.querySelectorAll('.sm-prelayer')] : []
  const toggleBtn = root.querySelector('.sm-toggle')
  const icon = root.querySelector('.sm-icon')
  const plusH = root.querySelector('.sm-icon-line')
  const plusV = root.querySelector('.sm-icon-line-v')
  const textInner = root.querySelector('.sm-toggle-textInner')
  if (!panel || !toggleBtn || !icon || !plusH || !plusV || !textInner) return null

  root.dataset.position = position
  const offscreen = position === 'left' ? -100 : 100

  let open = false
  let busy = false
  let openTl = null
  let closeTween = null
  let spinTween = null
  let textCycleAnim = null
  let colorTween = null

  gsap.set([panel, ...preLayers], { x: 0, xPercent: offscreen, opacity: 1 })
  if (preContainer) gsap.set(preContainer, { x: 0, xPercent: 0, opacity: 1 })
  gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 })
  gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 })
  gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' })
  gsap.set(textInner, { yPercent: 0 })
  gsap.set(toggleBtn, { color: menuButtonColor })

  const setTextLines = (lines) => {
    textInner.replaceChildren(...lines.map((l) => {
      const s = document.createElement('span')
      s.className = 'sm-toggle-line'
      s.textContent = l
      return s
    }))
  }
  setTextLines([labels.open, labels.close])

  const query = () => ({
    itemEls: [...panel.querySelectorAll('.sm-panel-itemLabel')],
    numberEls: [...panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')],
    extras: [...panel.querySelectorAll('.sm-extra')],
    socialTitle: panel.querySelector('.sm-socials-title'),
    socialLinks: [...panel.querySelectorAll('.sm-socials-link')],
  })

  const resetContent = () => {
    const { itemEls, numberEls, extras, socialTitle, socialLinks } = query()
    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    if (numberEls.length) gsap.set(numberEls, { '--sm-num-opacity': 0 })
    if (extras.length) gsap.set(extras, { y: 20, opacity: 0 })
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })
  }

  const buildOpenTimeline = () => {
    openTl?.kill()
    if (closeTween) { closeTween.kill(); closeTween = null }

    const { itemEls, numberEls, extras, socialTitle, socialLinks } = query()
    resetContent()

    const tl = gsap.timeline({ paused: true })
    preLayers.forEach((el, i) => {
      tl.fromTo(el, { x: 0, xPercent: offscreen }, { x: 0, xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07)
    })
    const lastTime = preLayers.length ? (preLayers.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (preLayers.length ? 0.08 : 0)
    const panelDuration = 0.65
    tl.fromTo(panel, { x: 0, xPercent: offscreen }, { x: 0, xPercent: 0, duration: panelDuration, ease: 'power4.out' }, panelInsertTime)

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15
      tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } }, itemsStart)
      if (numberEls.length) {
        tl.to(numberEls, { duration: 0.6, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.08, from: 'start' } }, itemsStart + 0.1)
      }
    }

    const socialsStart = panelInsertTime + panelDuration * 0.4
    if (extras.length) {
      tl.to(extras, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.08 }, socialsStart)
    }
    if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart)
    if (socialLinks.length) {
      tl.to(socialLinks, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power3.out',
        stagger: { each: 0.08, from: 'start' },
        onComplete: () => gsap.set(socialLinks, { clearProps: 'opacity' }),
      }, socialsStart + 0.04)
    }

    openTl = tl
    return tl
  }

  const playOpen = () => {
    if (busy) return
    busy = true
    const tl = buildOpenTimeline()
    tl.eventCallback('onComplete', () => { busy = false })
    tl.play(0)
  }

  const playClose = () => {
    openTl?.kill()
    openTl = null
    closeTween?.kill()
    closeTween = gsap.to([...preLayers, panel], {
      x: 0,
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        resetContent()
        busy = false
      },
    })
  }

  const animateIcon = (opening) => {
    spinTween?.kill()
    spinTween = opening
      ? gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' })
      : gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' })
  }

  const animateColor = (opening) => {
    colorTween?.kill()
    if (changeMenuColorOnOpen) {
      colorTween = gsap.to(toggleBtn, {
        color: opening ? openMenuButtonColor : menuButtonColor,
        delay: 0.18,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      gsap.set(toggleBtn, { color: menuButtonColor })
    }
  }

  const animateText = (opening) => {
    textCycleAnim?.kill()
    const currentLabel = opening ? labels.open : labels.close
    const targetLabel = opening ? labels.close : labels.open
    const seq = [currentLabel]
    let last = currentLabel
    for (let i = 0; i < 3; i++) {
      last = last === labels.open ? labels.close : labels.open
      seq.push(last)
    }
    if (last !== targetLabel) seq.push(targetLabel)
    seq.push(targetLabel)
    setTextLines(seq)

    gsap.set(textInner, { yPercent: 0 })
    const finalShift = ((seq.length - 1) / seq.length) * 100
    textCycleAnim = gsap.to(textInner, { yPercent: -finalShift, duration: 0.5 + seq.length * 0.07, ease: 'power4.out' })
  }

  const setOpen = (target) => {
    if (open === target) return
    open = target
    root.toggleAttribute('data-open', open)
    toggleBtn.setAttribute('aria-expanded', String(open))
    toggleBtn.setAttribute('aria-label', open ? labels.close : labels.open)
    panel.setAttribute('aria-hidden', String(!open))
    if (open) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }
    animateIcon(open)
    animateColor(open)
    animateText(open)
  }

  resetContent()
  toggleBtn.addEventListener('click', () => setOpen(!open))
  panel.querySelectorAll('a[href^="#"], [data-open-modal], [data-lang]').forEach((el) => {
    el.addEventListener('click', () => setOpen(false))
  })
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false) })
  if (closeOnClickAway) {
    document.addEventListener('mousedown', (e) => {
      if (open && !panel.contains(e.target) && !toggleBtn.contains(e.target)) setOpen(false)
    })
  }

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    setLabels(next) {
      Object.assign(labels, next)
      setTextLines(open ? [labels.close] : [labels.open, labels.close])
      gsap.set(textInner, { yPercent: 0 })
      toggleBtn.setAttribute('aria-label', open ? labels.close : labels.open)
    },
  }
}
