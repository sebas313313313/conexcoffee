/**
 * Datos iniciales y persistencia sincronizada para el Blog de ConexCoffee.
 * Garantiza que el blog público (/blog) y el módulo de SuperAdmin (/superadmin/blog)
 * funcionen tanto conectados a PostgreSQL como en modo local/respaldo.
 */

const BLOG_STORAGE_KEY = 'conexcoffee_blog_posts_v2';

export const DEFAULT_BLOG_POSTS = [
  {
    id: 'blog-conex-001',
    titulo: 'Protocolo CVA de la SCA: Cómo evaluamos nuestros microlotes de exportación',
    slug: 'protocolo-cva-sca-microlotes-exportacion',
    extracto:
      'Conoce paso a paso cómo nuestros laboratorios aliados y Q-Graders certificados aplican la evaluación descriptiva y afectiva para garantizar cafés superiores a 86 puntos SCA.',
    contenido_markdown: `En ConexCoffee cada lote de café especial atraviesa un riguroso control de calidad antes de ingresar a nuestros contenedores consolidados rumbo a Chile, Emiratos Árabes Unidos y Argentina.

### 1. Análisis Físico en Pergamino y Almendra
Nuestros asistentes técnicos verifican en finca y trilladora que la humedad se mantenga estrictamente entre el 10.0% y el 11.8%, con actividad de agua controlada y cero defectos primarios.

### 2. Evaluación Sensorial bajo el Estándar CVA
El sistema Coffee Value Assessment (CVA) de la Specialty Coffee Association permite separar la intensidad descriptiva de la impresión afectiva de calidad, brindando a los compradores internacionales un perfil transparente de fragancia, acidez, cuerpo, dulzor y residual.

### 3. Empaque Hermético y Doble Precinto QR
Una vez aprobado el lote, cada saco o caja al vacío de 24 kg recibe su precinto con doble código QR para trazabilidad criptográfica desde la finca hasta el puerto de destino.`,
    imagen_destacada_url: '/images/portadas/analisis-sensorial.jpg',
    url_video_youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    url_evento: 'https://sca.coffee/research/coffee-value-assessment',
    publicado: true,
    fecha_publicacion: '2026-03-10T14:00:00.000Z',
  },
  {
    id: 'blog-conex-002',
    titulo: 'Rutas Directas 2026: Apertura de contenedores a Chile, Dubái y Argentina',
    slug: 'rutas-directas-2026-chile-dubai-argentina',
    extracto:
      'Nuestra logística marítima consolidada permite a tostadores adquirir desde 12 kilos o cajas al vacío de 24 kg con entrega directa en puerto y nacionalización simplificada.',
    contenido_markdown: `La exportación directa de café verde de especialidad tradicionalmente exigía comprar un contenedor completo de 19 toneladas. Con el modelo de contenedores virtuales compartidos de ConexCoffee, democratizamos el acceso al mejor café colombiano.

### Beneficios para Tostadores y Compradores
- **Pedido mínimo flexible:** Reserva desde cajas de 24 kg empacadas al vacío o solicita muestras de perfilación de 120 gramos.
- **Normativa internacional:** Almacenamiento certificado bajo estándares ISO 22000, BASC y bolsas herméticas GrainPro.
- **Trazabilidad total:** Consulta la historia del productor, la ubicación GPS de la finca y la gráfica sensorial antes de realizar tu pago.`,
    imagen_destacada_url: '/images/portadas/contenedor.jpg',
    url_video_youtube: null,
    url_evento: 'https://www.conexcoffee.com/destinos',
    publicado: true,
    fecha_publicacion: '2026-03-15T16:30:00.000Z',
  },
  {
    id: 'blog-conex-003',
    titulo: 'Procesos Honey Negro y Fermentaciones Anaeróbicas en el Macizo Colombiano',
    slug: 'procesos-honey-negro-fermentaciones-anaerobicas',
    extracto:
      'Exploramos junto a nuestros caficultores de Huila, Cauca y Nariño las técnicas de secado lento en marquesinas solares que destacan notas florales y frutales únicas.',
    contenido_markdown: `El secado y la fermentación controlada se han convertido en la firma de identidad de las familias caficultoras que hacen parte de ConexCoffee.

### ¿Qué hace especial al proceso Honey Negro?
Al conservar el 100% del mucílago rico en azúcares durante un secado lento en camas africanas bajo sombra regulada entre 18 y 22 días, el grano desarrolla un cuerpo sedoso, acidez brillante y notas pronunciadas a frutos maduros, panela y cacao fino.

Invitamos a todos nuestros compradores a solicitar muestras de 120 gramos en la sección Nuestros Destinos para vivir la experiencia en su propia mesa de catación.`,
    imagen_destacada_url: '/images/portadas/finca.jpg',
    url_video_youtube: null,
    url_evento: 'https://federaciondecafeteros.org/',
    publicado: true,
    fecha_publicacion: '2026-03-18T11:15:00.000Z',
  },
];

export function normalizeBlogPost(raw = {}) {
  return {
    id: String(raw.id || `blog-${Date.now()}`),
    titulo: raw.titulo || 'Sin título',
    slug:
      raw.slug ||
      String(raw.titulo || 'publicacion')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    extracto: raw.extracto || '',
    contenido_markdown: raw.contenido_markdown || raw.contenido || '',
    imagen_destacada_url:
      raw.imagen_destacada_url || raw.imagen || '/images/portadas/lote.jpg',
    url_video_youtube: raw.url_video_youtube || null,
    url_evento: raw.url_evento || raw.urlEvento || null,
    caficultor_destacado_id: raw.caficultor_destacado_id || null,
    publicado: raw.publicado !== undefined ? Boolean(raw.publicado) : true,
    fecha_publicacion: raw.fecha_publicacion || new Date().toISOString(),
  };
}

export function getStoredBlogPosts() {
  if (typeof window === 'undefined') return DEFAULT_BLOG_POSTS;
  try {
    const raw = window.localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(DEFAULT_BLOG_POSTS));
      return DEFAULT_BLOG_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_BLOG_POSTS;
    }
    return parsed.map(normalizeBlogPost);
  } catch {
    return DEFAULT_BLOG_POSTS;
  }
}

export function saveStoredBlogPosts(posts = []) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = posts.map(normalizeBlogPost);
    window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignorar errores de cuota
  }
}

export function mergeApiAndLocalPosts(apiPosts = []) {
  const localPosts = getStoredBlogPosts();
  if (!Array.isArray(apiPosts) || apiPosts.length === 0) {
    return localPosts;
  }

  const normalizedApi = apiPosts.map((p) => {
    const matchLocal = localPosts.find((lp) => lp.id === p.id || lp.slug === p.slug);
    return normalizeBlogPost({
      ...matchLocal,
      ...p,
      url_evento: p.url_evento || p.urlEvento || matchLocal?.url_evento || null,
    });
  });

  // Incluir también artículos creados localmente que aún no estén en el servidor
  const apiSlugs = new Set(normalizedApi.map((p) => p.slug));
  const extraLocal = localPosts.filter((lp) => !apiSlugs.has(lp.slug));

  const merged = [...normalizedApi, ...extraLocal].sort(
    (a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
  );

  saveStoredBlogPosts(merged);
  return merged;
}

