import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import {
  Calendar,
  Coffee,
  Users,
  CheckCircle2,
  Clock,
  Search,
  UserPlus,
  Award,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import { useEvaluaciones, useActualizarEvaluacion } from '../hooks/useCatadorData';
import { EvaluacionModal } from '../components';

export default function EvaluacionPage() {
  const query = useEvaluaciones();
  const evaluaciones = query.data ?? [];
  const actualizar = useActualizarEvaluacion();
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluacionActiva, setEvaluacionActiva] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Al hacer clic en "Unirse"
  const handleUnirse = (item) => {
    // Si aún no está unido, lo unimos
    if (!item.unido) {
      actualizar.mutate({
        ...item,
        unido: true,
        cantidadParticipantes: (item.cantidadParticipantes || 0) + 1,
      });
      toast.success(`Te has unido a "${item.nombre}". Se abrirá la hoja de evaluación.`);
    }

    // Despliega el modal de evaluación
    setEvaluacionActiva(item);
    setIsModalOpen(true);
  };

  if (query.isLoading || query.isError) {
    return <QueryState query={query} />;
  }

  // Cancelar la participación
  const handleSalir = (e, id) => {
    e.stopPropagation();
    const item = evaluaciones.find((ev) => ev.id === id);
    if (item) {
      actualizar.mutate({
        ...item,
        unido: false,
        cantidadParticipantes: Math.max(0, (item.cantidadParticipantes || 1) - 1),
      });
      toast('Has salido de la sesión de evaluación');
    }
  };

  // Al finalizar y enviar la evaluación desde el modal
  const handleFinalizarEvaluacion = (resultado) => {
    const item = evaluaciones.find((ev) => ev.id === resultado.evaluacionId);
    if (item) {
      actualizar.mutate({
        ...item,
        estado: 'Completada',
        puntuacionTotal: resultado.puntuacionTotal,
        puntuacion_sca_global: resultado.puntuacionTotal,
        categoria: resultado.categoria,
        unido: true,

      });
    }

    setIsModalOpen(false);
    setEvaluacionActiva(null);
  };

  const listaFiltrada = evaluaciones.filter((ev) => {
    const term = searchTerm.toLowerCase();
    return (
      ev.nombre.toLowerCase().includes(term) ||
      ev.objetivo.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Evaluaciones Pendientes</h1>
        <p className="text-surface-500 mt-1">
          Sesiones y mesas de catación pendientes disponibles para unirse y calificar muestras bajo protocolo SCA
        </p>
      </div>

      {/* Buscador rápido */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre u objetivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-surface-200 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-900"
        />
      </div>

      {/* Lista de Evaluaciones Pendientes */}
      {listaFiltrada.length === 0 ? (
        <Card className="text-center py-12 text-surface-500">
          <Clock className="w-10 h-10 text-surface-300 mx-auto mb-2" />
          <p className="font-semibold text-surface-700">No hay evaluaciones pendientes</p>
          <p className="text-xs text-surface-400 mt-1">No se encontraron sesiones que coincidan con la búsqueda.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {listaFiltrada.map((item) => (
            <Card
              key={item.id}
              className={`p-5 transition-all border ${
                item.estado === 'Completada'
                  ? 'border-emerald-300 bg-emerald-50/15 shadow-xs'
                  : item.unido
                  ? 'border-primary-300 bg-primary-50/20 shadow-xs'
                  : 'border-surface-200 bg-white hover:border-surface-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Contenido principal: Nombre y Objetivo */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-surface-100 text-surface-700">
                      {item.id}
                    </span>
                    {item.estado === 'Completada' ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completada ({item.puntuacionTotal} pts)
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        {item.estado}
                      </span>
                    )}

                    {item.unido && item.estado !== 'Completada' && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary-600" />
                        Unido
                      </span>
                    )}
                  </div>

                  {/* Nombre de la evaluación */}
                  <h2 className="text-lg font-bold text-surface-900 leading-snug">
                    {item.nombre}
                  </h2>

                  {/* Objetivo */}
                  <div className="text-sm text-surface-600 leading-relaxed">
                    <strong className="text-surface-700 font-medium">Objetivo: </strong>
                    {item.objetivo}
                  </div>

                  {/* Datos complementarios: Fecha de creación, Cantidad de Muestras, Cantidad de Participantes */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-surface-600">
                    {/* Fecha de creación */}
                    <div className="flex items-center gap-1.5 bg-surface-50 px-2.5 py-1 rounded-md border border-surface-200">
                      <Calendar className="w-3.5 h-3.5 text-primary-600" />
                      <span>
                        <strong className="text-surface-700">Creada:</strong> {item.fechaCreacion}
                      </span>
                    </div>

                    {/* Cantidad de muestras */}
                    <div className="flex items-center gap-1.5 bg-surface-50 px-2.5 py-1 rounded-md border border-surface-200">
                      <Coffee className="w-3.5 h-3.5 text-primary-600" />
                      <span>
                        <strong className="text-surface-700">Muestras:</strong> {item.cantidadMuestras} lotes
                      </span>
                    </div>

                    {/* Cantidad de participantes */}
                    <div className="flex items-center gap-1.5 bg-surface-50 px-2.5 py-1 rounded-md border border-surface-200">
                      <Users className="w-3.5 h-3.5 text-primary-600" />
                      <span>
                        <strong className="text-surface-700">Participantes:</strong>{' '}
                        {item.cantidadParticipantes} {item.cupoMaximo ? `/ ${item.cupoMaximo}` : ''} catadores
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Unirse / Abrir Evaluación */}
                <div className="shrink-0 flex items-center gap-2 lg:self-center">
                  {item.estado === 'Completada' ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEvaluacionActiva(item);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 text-xs font-semibold"
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      Ver Hoja Enviada
                    </Button>
                  ) : item.unido ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleUnirse(item)}
                        className="flex items-center gap-2 px-4 py-2 font-semibold text-sm shadow-sm"
                      >
                        <Sliders className="w-4 h-4" />
                        Continuar Evaluación
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => handleSalir(e, item.id)}
                        className="text-xs text-surface-500 hover:text-red-600 font-medium underline px-1 cursor-pointer"
                      >
                        Salir
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => handleUnirse(item)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-sm shadow-sm transition-transform active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      Unirse
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criterios de Evaluación Sensorial CVA */}
      <EvaluacionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEvaluacionActiva(null);
        }}
        evaluacion={evaluacionActiva}
        onFinalizar={handleFinalizarEvaluacion}
      />
    </div>
  );
}
