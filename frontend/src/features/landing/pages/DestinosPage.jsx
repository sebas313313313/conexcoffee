import { useState, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { Calendar, ExternalLink, Package, Ship, Sparkles, CheckCircle2 } from 'lucide-react';
import { DESTINOS_DATA } from '../data/destinosData';

export function DestinosPage() {
  const [selectedId, setSelectedId] = useState(null);
  const pageRef = useRef(null);
  const cardRef = useRef(null);

  const selectedDestino = DESTINOS_DATA.find((d) => d.id === selectedId) || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animación de entrada de título y cinta de banderas
  useEffect(() => {
    const scope = pageRef.current;
    if (!scope) return;

    animate(scope.querySelectorAll('[data-anim="hero"]'), {
      translateY: [24, 0],
      opacity: [0, 1],
      delay: stagger(90, { start: 80 }),
      duration: 650,
      ease: 'outCubic',
    });

    animate(scope.querySelectorAll('[data-anim="flag-item"]'), {
      scale: [0.9, 1],
      translateY: [18, 0],
      opacity: [0, 1],
      delay: stagger(110, { start: 220 }),
      duration: 600,
      ease: 'outBack',
    });
  }, []);

  // Animación cuando se despliega o cambia la tarjeta del contenedor
  useEffect(() => {
    if (!selectedDestino || !cardRef.current) return;

    animate(cardRef.current, {
      translateY: [28, 0],
      scale: [0.97, 1],
      opacity: [0, 1],
      duration: 520,
      ease: 'outCubic',
    });
  }, [selectedDestino]);

  const handleSelectFlag = (id) => {
    setSelectedId((prev) => (prev === id ? id : id));
  };

  return (
    <div ref={pageRef} className="bg-surface-50 min-h-screen pt-24 pb-24">
      {/* Header — Nuestros Destinos tal cual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 text-center">
        <span
          data-anim="hero"
          className="inline-flex items-center gap-1.5 text-brand-orange font-semibold tracking-wider uppercase text-xs mb-2 opacity-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Exportación Directa
        </span>
        <h1
          data-anim="hero"
          className="text-4xl md:text-5xl font-extrabold text-surface-900 tracking-tight mb-3 opacity-0"
        >
          Nuestros Destinos
        </h1>
        <p
          data-anim="hero"
          className="text-base text-surface-600 max-w-xl mx-auto leading-relaxed opacity-0"
        >
          Selecciona una bandera en la cinta para consultar el contenedor activo, sus fechas de
          apertura y cierre, y explorar los lotes de café disponibles.
        </p>
      </section>

      {/* Cinta de tres banderas: Chile, Emiratos Árabes y Argentina */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DESTINOS_DATA.map((destino) => {
              const isSelected = selectedId === destino.id;
              return (
                <button
                  key={destino.id}
                  type="button"
                  data-anim="flag-item"
                  onClick={() => handleSelectFlag(destino.id)}
                  aria-pressed={isSelected}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300 cursor-pointer opacity-0 ${
                    isSelected
                      ? 'border-brand-terracota bg-brand-tint/40 shadow-md ring-2 ring-brand-terracota/20'
                      : 'border-surface-200 bg-surface-50/70 hover:border-brand-orange/60 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-surface-200 shadow-xs shrink-0 bg-white">
                    <img
                      src={destino.bandera}
                      alt={`Bandera de ${destino.nombre}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                      Destino
                    </p>
                    <p className="text-base font-bold text-surface-900 truncate">
                      {destino.nombre}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-terracota mt-0.5">
                      <Ship className="w-3.5 h-3.5" />
                      {destino.lotes.length} lotes en contenedor
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-brand-terracota text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tarjeta desplegable del contenedor debajo de la cinta de banderas */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {selectedDestino ? (
          <div
            ref={cardRef}
            key={selectedDestino.id}
            className="relative rounded-2xl overflow-hidden border border-surface-200 shadow-lg bg-surface-900"
          >
            {/* Imagen del contenedor con overlay */}
            <div className="relative h-80 sm:h-96 w-full">
              <img
                src={selectedDestino.contenedor.imagenContenedor}
                alt={`Contenedor con destino a ${selectedDestino.nombre}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/65 to-surface-900/25" />

              {/* Cabecera sobre el contenedor */}
              <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-sm">
                  <img
                    src={selectedDestino.bandera}
                    alt={selectedDestino.nombre}
                    className="w-7 h-5 object-cover rounded-xs border border-surface-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-surface-900 leading-tight">
                      Contenedor destino {selectedDestino.nombre}
                    </p>
                    <p className="text-[11px] text-surface-500 leading-tight">
                      {selectedDestino.contenedor.codigo} · {selectedDestino.puertoDestino}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-terracota text-white shadow-sm">
                  <Package className="w-3.5 h-3.5" />
                  {selectedDestino.contenedor.empresa}
                </span>
              </div>

              {/* Contenido inferior sobre el contenedor: Fechas y botón Ver todos */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-gold">
                    Programación de Embarque Consolidado
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Contenedor Colombia — {selectedDestino.nombre}
                  </h2>

                  {/* Fechas de apertura y cierre sobre el contenedor */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-white">
                      <Calendar className="w-4 h-4 text-brand-gold shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-surface-200">
                          Fecha de apertura
                        </p>
                        <p className="text-sm font-bold">
                          {selectedDestino.contenedor.fechaApertura}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 text-white">
                      <Calendar className="w-4 h-4 text-brand-orange shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-surface-200">
                          Fecha de cierre
                        </p>
                        <p className="text-sm font-bold">
                          {selectedDestino.contenedor.fechaCierre}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón Ver todos — abre en una nueva pestaña de nuestra app */}
                <a
                  href={`/destinos/${selectedDestino.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white font-bold text-sm shadow-lg transition-all duration-200 shrink-0 cursor-pointer"
                >
                  <span>Ver todos</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-10 text-center">
            <Ship className="w-10 h-10 text-brand-terracota mx-auto mb-3 opacity-80" />
            <p className="text-base font-semibold text-surface-800">
              Presiona una de las banderas de arriba para desplegar su contenedor
            </p>
            <p className="text-sm text-surface-500 mt-1">
              Verás la imagen del contenedor, la fecha de apertura, la fecha de cierre y el acceso a
              todos sus lotes de café.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default DestinosPage;
