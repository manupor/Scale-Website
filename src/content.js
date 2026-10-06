/** SCALE — all copy for the content sections, taken from the approved SCALE site. */

export const poster = '/media/monolith-poster.webp'

/** Scroll-sequence hero: chapters fade in/out across the sequence progress (0–1). */
export const hero = {
  frameCount: 157,
  chapters: [
    {
      id: 'hero', variant: 'hero', start: 0, end: 0.19,
      eyebrow: 'Firma internacional de desarrollo empresarial · Miami',
      title: ['Su marca no se improvisa.', 'Se eleva.'],
      body: 'Alineamos estrategia, marca, adquisición, ventas, datos y tecnología para que su negocio vuele a la altura que le corresponde.',
      cta: { label: 'Comenzar el ascenso', icon: '↘', action: 'next' },
    },
    {
      id: 'origen', variant: 'bottom-right', start: 0.18, end: 0.40,
      eyebrow: '01 — Punto de partida',
      title: ['Primero,', 'el origen.'],
      body: 'Revisamos modelo y operación para definir el rumbo correcto antes de despegar.',
    },
    {
      id: 'trayectoria', variant: 'top-left', start: 0.38, end: 0.60,
      eyebrow: '02 — Trayectoria',
      title: ['Un sistema,', 'no turbulencia.'],
      body: 'Diseñamos la ruta: prioridades claras, recursos ajustados, objetivo en la mira.',
    },
    {
      id: 'altitud', variant: 'bottom-left', start: 0.58, end: 0.80,
      eyebrow: '03 — Altitud',
      title: ['De la claridad', 'a la altura.'],
      body: 'Ejecutamos estrategia, marca, ventas y tecnología con precisión de vuelo.',
    },
    {
      id: 'arribo', variant: 'center', start: 0.78, end: 1,
      eyebrow: '04 — Arribo',
      title: ['Llegar,', 'no es bajar.'],
      body: 'Medimos, ajustamos y escalamos: la marca aterriza más alta de la que despegó.',
      cta: { label: 'Agendar diagnóstico', icon: '↗', action: 'contact' },
    },
  ],
}

export const nav = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Enfoque', href: '#enfoque' },
  { label: 'Método', href: '#metodo' },
  { label: 'Preguntas', href: '#faq' },
]

export const capabilities = [
  'Estrategia y modelo de negocio',
  'Marca y posicionamiento',
  'Contenido y narrativa',
  'Embudos y adquisición',
  'Procesos comerciales y CRM',
  'Datos y medición',
  'Automatización y tecnología',
]

export const capabilitiesIntro = {
  eyebrow: 'Capacidades',
  title: 'Activamos solo lo que su marca necesita.',
  body: 'Proponemos solo las capacidades que impactan su objetivo. Un sistema coherente, no un catálogo.',
}

export const statement = {
  lines: ['Estrategia', 'Marca', 'Crecimiento'],
  primaryCta: { label: 'Conozca el método', href: '#metodo' },
  secondaryCta: { label: 'Por qué pasa esto', href: '#problema' },
}

export const problem = {
  eyebrow: 'El problema',
  text: 'Vender más no alcanza si la estructura no acompaña.',
  body: 'Muchas empresas invierten en marketing, diseño y herramientas, pero sus áreas avanzan separadas. Crecer sin estructura amplifica el desorden.',
}

export const approach = {
  badge: 'Enfoque',
  title: 'El problema es el sistema, no una sola pieza.',
  body: 'Acompañamos a marcas de lujo y agentes inmobiliarios de alto valor cuyo crecimiento depende demasiado de ellos.',
  principles: [
    { num: '01', text: 'Entendemos la empresa antes de proponer.' },
    { num: '02', text: 'Convertimos esfuerzo en estructura.' },
    { num: '03', text: 'Implementamos con enfoque práctico, medible y alineado a resultados.' },
  ],
}

export const method = {
  badge: 'Método S.C.A.L.E.',
  heading: 'Cinco etapas. Una estrategia a su medida.',
  stages: [
    {
      letter: 'S', num: '01', name: 'Strategy',
      title: 'Antes de hacer más, entendemos qué frena a su empresa.',
      body: 'Analizamos modelo, oferta, mercado y proceso comercial para encontrar el obstáculo real, no sus síntomas.',
      tags: ['Diagnóstico', 'Modelo de negocio', 'Oferta'],
    },
    {
      letter: 'C', num: '02', name: 'Content',
      title: 'Traducimos la estrategia en mensajes claros.',
      body: 'Narrativa, mensajes y activos que comunican el valor de su marca con claridad.',
      tags: ['Narrativa', 'Mensajes', 'Contenido'],
    },
    {
      letter: 'A', num: '03', name: 'Acquisition',
      title: 'Diseñamos el recorrido que conecta la atracción con la venta.',
      body: 'Un recorrido comercial pensado para convertir prospectos en clientes.',
      tags: ['Embudos', 'Seguimiento', 'CRM'],
    },
    {
      letter: 'L', num: '04', name: 'Learning',
      title: 'Los datos deciden dónde invertir.',
      body: 'Analizamos datos e inversión para concentrar recursos en lo que realmente funciona.',
      tags: ['Datos', 'Inversión', 'Retorno'],
    },
    {
      letter: 'E', num: '05', name: 'Expansion',
      title: 'Incorporamos tecnología cuando la evidencia lo valida.',
      body: 'Optimizamos procesos y documentamos el sistema antes de automatizar.',
      tags: ['Procesos', 'Automatización', 'Tecnología'],
    },
  ],
  closing: { title: '¿Qué etapa necesita su marca?', cta: 'Empezar por el diagnóstico' },
}

export const philosophy = {
  eyebrow: 'Nuestra filosofía',
  quote: 'Primero la raíz, después la altura.',
  caption: 'Estrategia para dirigir. Humanidad para acompañar.',
}

export const process = {
  eyebrow: 'Cómo trabajamos',
  heading: 'De la claridad a la ejecución.',
  steps: [
    { num: '01', name: 'Diagnóstico', body: 'Revisamos modelo y operación para encontrar la oportunidad real.' },
    { num: '02', name: 'Diseño', body: 'Definimos el sistema de crecimiento y las prioridades.' },
    { num: '03', name: 'Ejecución', body: 'Implementamos estrategia, marca, ventas y tecnología según lo acordado.' },
    { num: '04', name: 'Evolución', body: 'Medimos, ajustamos y escalamos lo que funciona.' },
  ],
}

export const faq = {
  eyebrow: 'Preguntas frecuentes',
  heading: 'Antes de\nempezar.',
  items: [
    {
      q: '¿Con qué tipo de empresas trabajan?',
      a: 'Con marcas de lujo, agentes inmobiliarios y profesionales de alto valor cuyo crecimiento depende demasiado de ellos.',
    },
    {
      q: '¿Tengo que contratar todas las capacidades?',
      a: 'No. Después del diagnóstico proponemos solo lo que impacta su objetivo.',
    },
    {
      q: '¿Por dónde se empieza?',
      a: 'Por un diagnóstico: revisamos modelo y operación para encontrar la oportunidad real.',
    },
    {
      q: '¿Dónde está SCALE?',
      a: 'SCALE es una firma internacional con base en Miami.',
    },
  ],
}

export const cta = {
  chapters: [
    {
      id: 'cta-start', variant: 'top-left', start: 0.42, end: 0.62,
      eyebrow: 'Diagnóstico',
      title: ['Crecer no es producir más.', 'Es construir un sistema.'],
      body: 'Cuéntenos sobre su marca. El primer paso es entender su estructura.',
    },
    {
      id: 'cta-mid', variant: 'bottom-right', start: 0.58, end: 0.82,
      eyebrow: 'El sistema',
      title: ['Estructura antes', 'de escala.'],
      body: 'Alineamos estrategia, marca, ventas, datos y tecnología para que nada dependa de una sola persona.',
    },
    {
      id: 'cta-end', variant: 'top-left', start: 0.78, end: 1,
      eyebrow: 'Agende',
      title: ['Su próximo', 'paso.'],
      body: 'Reserve una sesión de diagnóstico y vea dónde está su oportunidad real.',
      cta: { label: 'Agendar diagnóstico', icon: '↗', action: 'contact' },
    },
  ],
}

export const signature = 'Su marca, a la altura correcta.'

export const footer = {
  tagline: 'Firma internacional de desarrollo empresarial. Miami.',
  columns: [
    {
      title: 'Método',
      links: [
        { label: 'Strategy', href: '#metodo' },
        { label: 'Content', href: '#metodo' },
        { label: 'Acquisition', href: '#metodo' },
        { label: 'Learning', href: '#metodo' },
        { label: 'Expansion', href: '#metodo' },
      ],
    },
    {
      title: 'SCALE',
      links: [
        { label: 'El problema', href: '#problema' },
        { label: 'Enfoque', href: '#enfoque' },
        { label: 'Cómo trabajamos', href: '#inicio' },
        { label: 'Preguntas', href: '#faq' },
        { label: 'Contacto', href: '#contacto' },
      ],
    },
  ],
  signature,
}
