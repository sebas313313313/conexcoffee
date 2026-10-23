import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Calendar,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Card, Input } from '@/components/ui';
import { useSEO } from '@/hooks';


// ============================================
// BlogPage — Artículos & Actualidad Cafetera
// ============================================

const POSTS = [
  {
    id: 1,
    title: 'Tendencias del Café Arábica en el Mercado Internacional 2026',
    category: 'Mercado',
    date: '02 Mar 2026',
    readTime: '4 min lectura',
    excerpt: 'Análisis de factores climáticos, cotización de futuros y la creciente demanda de micro-lotes diferenciados.',
    autor: 'Equipo de Análisis ConexCoffee',
  },
  {
    id: 2,
    title: 'Guía de Catación SCA: Cómo Identificar Notas Complejas en Taza',
    category: 'Calidad',
    date: '24 Feb 2026',
    readTime: '6 min lectura',
    excerpt: 'Protocolos esenciales para evaluar fragancia, aroma, acidez y balance en cafés de altura colombianos.',
    autor: 'Q-Grader Certificado ConexCoffee',
  },
  {
    id: 3,
    title: 'Prácticas Regenerativas y Café con Huella de Carbono Neutral',
    category: 'Sostenibilidad',
    date: '15 Feb 2026',
    readTime: '5 min lectura',
    excerpt: 'Cómo los productores están implementando agroforestería y bioprocesos para acceder a primas de exportación.',
    autor: 'Ingeniería Agronómica ConexCoffee',
  },
  {
    id: 4,
    title: 'Fermentaciones Controladas: Maceración Carbónica vs Anaeróbico',
    category: 'Procesamiento',
    date: '08 Feb 2026',
    readTime: '7 min lectura',
    excerpt: 'Comparativa técnica de procesos post-cosecha para resaltar perfiles frutales y vinotintos en cafés exóticos.',
    autor: 'Laboratorio Sensorial',
  },
  {
    id: 5,
    title: 'Cómo Negociar Lotes de Café Verde: Guía para Compradores Mayoristas',
    category: 'Comercio',
    date: '29 Ene 2026',
    readTime: '5 min lectura',
    excerpt: 'Factores clave al revisar contratos de compraventa, cláusulas de humedad, merma y tiempos de embarque marítimo.',
    autor: 'Asesoría de Comercio Exterior',
  },
];

export default function BlogPage() {
  useSEO({
    title: 'Blog Cafetero | Mercado, Procesos y Calidad SCA',
    description: 'Artículos, análisis del mercado internacional del café, tendencias de precios, notas sensoriales y novedades de la industria cafetera.',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface-50 text-surface-900">
      {/* Hero Blog */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-3">
            <BookOpen className="h-4 w-4" />
            <span>Conocimiento, Mercado & Innovación</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-surface-900 tracking-tight mb-4">
            Blog Cafetero & Noticias
          </h1>
          <p className="text-surface-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Explora las últimas tendencias en café de especialidad, prácticas de cultivo, procesos sensoriales y dinámicas comerciales.
          </p>

          <div className="max-w-md mx-auto relative">
            <Input
              type="text"
              placeholder="Buscar artículos por título o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="h-4 w-4 text-surface-400 absolute right-3 top-3" />
          </div>
        </div>
      </section>

      {/* Listado de Artículos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="flex flex-col justify-between hover:border-primary-400 hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex items-center justify-between text-xs text-surface-500 mb-3">
                  <span className="font-semibold text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-surface-900 mb-2 hover:text-primary-700 transition-colors">
                  {post.title}
                </h2>
                <p className="text-xs text-surface-500 mb-4 font-medium">Por: {post.autor}</p>

                <p className="text-sm text-surface-600 leading-relaxed mb-6">{post.excerpt}</p>
              </div>

              <div className="pt-4 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
                <button
                  onClick={() => toast('Próximamente disponible el artículo completo.', { icon: '☕' })}
                  className="font-bold text-primary-700 hover:text-primary-800 cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Leer más</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
