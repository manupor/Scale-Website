/** SCALE editorial — copy adapted from the SCALE site, tropical "cultivate" voice. */

export const palette = [
  { name: 'Raíz', role: 'Estrategia', hex: '#5FD3A0', shape: 'card' },
  { name: 'Tallo', role: 'Contenido', hex: '#F5B041', shape: 'pill' },
  { name: 'Flor', role: 'Marca', hex: '#FF7A6B', shape: 'square' },
  { name: 'Fruto', role: 'Crecimiento', hex: '#1E1E1E', shape: 'wide' },
]

export const nav = [
  { label: 'Manifiesto', href: '#manifiesto' },
  { label: 'Diferencia', href: '#diferencia' },
  { label: 'Método', href: '#metodo' },
  { label: 'Preguntas', href: '#faq' },
]

export const hero = {
  micro: ['SCALE // Miami — Latinoamérica', 'Estrategia · Marca · Crecimiento', 'Lat 25.76° N // Long 80.19° W'],
  eyebrow: 'Firma de desarrollo empresarial',
  title: 'Su marca no se improvisa.',
  titleItalic: 'Se cultiva.',
  body: 'Alineamos estrategia, marca, adquisición, ventas, datos y tecnología para que su negocio crezca con raíz, no con ruido.',
  cta: 'Agendar diagnóstico',
}

export const manifesto = {
  eyebrow: 'Manifiesto // 01',
  statements: [
    { kicker: 'El problema', text: 'Vender más no alcanza si la estructura no acompaña.' },
    { kicker: 'El síntoma', text: 'Marketing, diseño y herramientas avanzan separados. Crecer así amplifica el desorden.' },
    { kicker: 'La raíz', text: 'El problema es el sistema, no una sola pieza.' },
    { kicker: 'La cosecha', text: 'Primero la raíz, después la altura.' },
  ],
}

export const comparison = {
  eyebrow: 'Sin comparación // 02',
  title: 'Improvisar',
  titleItalic: 'vs. cultivar.',
  rows: [
    { label: '01 // Estrategia', legacy: 'Acciones sueltas según la urgencia del mes.', scale: 'Diagnóstico de modelo, oferta y mercado.', color: '#5FD3A0' },
    { label: '02 // Marca', legacy: 'Un logo bonito sin narrativa detrás.', scale: 'Narrativa y mensajes que comunican valor.', color: '#F5B041' },
    { label: '03 // Ventas', legacy: 'Prospectos que se pierden entre WhatsApps.', scale: 'Un recorrido comercial medible con CRM.', color: '#FF7A6B' },
    { label: '04 // Escala', legacy: 'Todo depende del dueño.', scale: 'Un sistema documentado que crece sin usted.', color: '#EBD9B4' },
  ],
}

export const method = {
  eyebrow: 'Método S.C.A.L.E. // 03',
  title: 'Cinco etapas.',
  titleItalic: 'Una estrategia a su medida.',
  stages: [
    { num: '01', letter: 'S', name: 'Strategy', title: 'Entendemos qué frena a su empresa.', body: 'Modelo, oferta, mercado y proceso comercial: encontramos el obstáculo real, no sus síntomas.', tags: ['Diagnóstico', 'Modelo', 'Oferta'], color: '#5FD3A0' },
    { num: '02', letter: 'C', name: 'Content', title: 'La estrategia, en mensajes claros.', body: 'Narrativa, mensajes y activos que comunican el valor de su marca.', tags: ['Narrativa', 'Mensajes'], color: '#F5B041' },
    { num: '03', letter: 'A', name: 'Acquisition', title: 'De la atracción a la venta.', body: 'Un recorrido comercial pensado para convertir prospectos en clientes.', tags: ['Embudos', 'CRM'], color: '#FF7A6B' },
    { num: '04', letter: 'L', name: 'Learning', title: 'Los datos deciden.', body: 'Concentramos inversión en lo que realmente funciona.', tags: ['Datos', 'Retorno'], color: '#EBD9B4' },
    { num: '05', letter: 'E', name: 'Expansion', title: 'Tecnología cuando la evidencia la valida.', body: 'Optimizamos y documentamos el sistema antes de automatizar.', tags: ['Procesos', 'Automatización'], color: '#5FD3A0' },
  ],
  closing: { num: '06', title: '¿Qué etapa necesita su marca?', cta: 'Empezar por el diagnóstico' },
}

export const faq = {
  eyebrow: 'Preguntas // 04',
  title: 'Antes de',
  titleItalic: 'empezar.',
  items: [
    { q: '¿Con qué tipo de empresas trabajan?', a: 'Con marcas de lujo, agentes inmobiliarios y profesionales de alto valor cuyo crecimiento depende demasiado de ellos.' },
    { q: '¿Tengo que contratar todas las capacidades?', a: 'No. Después del diagnóstico proponemos solo lo que impacta su objetivo.' },
    { q: '¿Por dónde se empieza?', a: 'Por un diagnóstico: revisamos modelo y operación para encontrar la oportunidad real.' },
    { q: '¿Dónde está SCALE?', a: 'Somos una firma internacional con base en Miami, acompañando marcas en toda Latinoamérica.' },
  ],
}

export const finalCta = {
  eyebrow: 'Temporada de siembra // 05',
  title: 'Cultive su marca.',
  titleItalic: 'Coseche el sistema.',
  body: 'Reserve una sesión de diagnóstico y vea dónde está su oportunidad real.',
  cta: 'Agendar diagnóstico',
  status: 'Agenda abierta',
}

export const footer = {
  tagline: 'Su marca, a la altura correcta.',
  columns: [
    { title: '01 // Directorio', links: [{ label: 'Manifiesto', href: '#manifiesto' }, { label: 'Diferencia', href: '#diferencia' }, { label: 'Método', href: '#metodo' }, { label: 'Preguntas', href: '#faq' }] },
    { title: '02 // Red', links: [{ label: 'Instagram', href: 'https://instagram.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }, { label: 'Contacto', href: '#contacto' }] },
  ],
  legal: '© 2026 SCALE // Miami',
}
