import { Globe } from 'lucide-react';
import ContenedoresDestinoAnimation from './ContenedoresDestinoAnimation';
import { useSEO } from '@/hooks';

// ============================================
// DestinosPage — Destinos Internacionales & Contenedores
// ============================================

export default function DestinosPage() {
  useSEO({
    title: 'Destinos y Rutas de Exportación',
    description: 'Explora nuestros contenedores activos y destinos de exportación de café verde de especialidad hacia México, Chile, Brasil, Canadá y más.',
  });

  return (
    <div className="bg-surface-50 text-surface-900">
      {/* Hero de Destinos: Título y subetiqueta a la izquierda, descripción al lado derecho */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8 bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-surface-900 tracking-tight mb-2">
                Nuestros Destinos
              </h1>
              <div className="inline-flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider">
                <Globe className="h-4 w-4" />
                <span>Rutas Internacionales de Exportación</span>
              </div>
            </div>

            <div className="max-w-xl md:text-right">
              <p className="text-surface-600 text-sm sm:text-base leading-relaxed">
                Explora nuestros contenedores activos por país, monitorea las fechas de apertura y cierre de carga, y conoce las variedades de café de especialidad asignadas a cada envío.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Animación Interactiva de Contenedores por Destino (México, Chile, Brasil, Canadá) */}
      <ContenedoresDestinoAnimation />
    </div>
  );
}
