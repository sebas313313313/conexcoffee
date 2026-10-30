import { useState, useRef } from 'react';
import { ModuloCabecera } from '@/components/data-display';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  X,
  Award,
  Phone,
  Mail,
  Building2,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminCatadores,
  useCrearSuperadminCatador,
  useActualizarSuperadminCatador,
} from '../hooks/useSuperadminData';
import { CrearCatadorModal } from '@/components/usuarios';

export default function CatadoresPage() {
  const query = useSuperadminCatadores();
  const catadores = query.data ?? [];
  const crearCatador = useCrearSuperadminCatador();
  const actualizarCatador = useActualizarSuperadminCatador();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('todos');

  const tableRef = useRef(null);

  // Modales
  const [modalRegistrarAbierto, setModalRegistrarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  // Estados de edición / detalle
  const [catadorSeleccionado, setCatadorSeleccionado] = useState(null);

  // Formulario nuevo
  const [nuevoCatador, setNuevoCatador] = useState({
    tipo_documento: 'CC',
    numero_identificacion: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    certificacion: 'Q-Grader Arábica (CQI)',
    laboratorio: 'Laboratorio Central TecniCafé',
    experiencia: '',
  });

  // Filtrado de catadores
  const catadoresFiltrados = catadores.filter((c) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${c.primer_nombre} ${c.segundo_nombre} ${c.primer_apellido} ${c.segundo_apellido}`.toLowerCase();
    const matchesSearch =
      c.numero_identificacion.includes(term) ||
      fullName.includes(term) ||
      c.telefono.includes(term) ||
      c.certificacion.toLowerCase().includes(term);

    const matchesLab =
      filtroLaboratorio === 'todos' || c.laboratorio === filtroLaboratorio;

    return matchesSearch && matchesLab;
  });

  // Guardar nuevo catador
  const handleGuardarNuevo = (data) => {
    const nuevo = {
      id: Date.now(),
      ...data,
      primer_nombre: (data.primer_nombre || '').toUpperCase(),
      segundo_nombre: (data.segundo_nombre || '').toUpperCase(),
      primer_apellido: (data.primer_apellido || '').toUpperCase(),
      segundo_apellido: (data.segundo_apellido || '').toUpperCase(),
      muestras_evaluadas: 0,
      estado: 'Activo',
    };

    crearCatador.mutate(nuevo);
    toast.success('Catador registrado correctamente');
    setModalRegistrarAbierto(false);
  };

  // Guardar edición
  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!catadorSeleccionado) return;

    actualizarCatador.mutate(catadorSeleccionado);
    toast.success('Catador actualizado correctamente');
    setModalEditarAbierto(false);
  };


  const laboratoriosUnicos = Array.from(new Set(catadores.map((c) => c.laboratorio)));

  useTableEntranceAnimation(tableRef, [catadoresFiltrados.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica al componente Blade original */}
      <ModuloCabecera
        titulo="Catadores"
        subtitulo="Registro de profesionales Q-Grader y acreditaciones de análisis sensorial"
        imagenPortada="/images/portadas/catador.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus catadores."
        icono={Award}
        totalRegistros={catadores.length}
        textoBotonRegistrar="Registrar Catador"
        onRegistrar={() => setModalRegistrarAbierto(true)}
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombre, certificación..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filtroLaboratorio}
            onChange={(e) => setFiltroLaboratorio(e.target.value)}
            className="text-sm border border-surface-200 rounded-xl px-3 py-2 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todos los laboratorios</option>
            {laboratoriosUnicos.map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Catadores */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-left text-sm">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nº</th>
                <th className="py-3 px-4">Identificación</th>
                <th className="py-3 px-4">Nombres</th>
                <th className="py-3 px-4">Apellidos</th>
                <th className="py-3 px-4">Certificación</th>
                <th className="py-3 px-4">Laboratorio</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {catadoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-surface-400">
                    No se encontraron catadores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                catadoresFiltrados.map((catador, index) => (
                  <tr key={catador.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="py-3 px-4 text-surface-500 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-surface-900">
                      {catador.numero_identificacion}
                    </td>
                    <td className="py-3 px-4 text-surface-800 font-medium">
                      {catador.primer_nombre} {catador.segundo_nombre}
                    </td>
                    <td className="py-3 px-4 text-surface-700">
                      {catador.primer_apellido} {catador.segundo_apellido}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Award className="w-3.5 h-3.5" />
                        {catador.certificacion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-600 text-xs">
                      {catador.laboratorio}
                    </td>
                    <td className="py-3 px-4 text-surface-600 text-xs">{catador.telefono}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          icon={Pencil}
                          title="Editar Catador"
                          variant="primary"
                          onClick={() => {
                            setCatadorSeleccionado(catador);
                            setModalEditarAbierto(true);
                          }}
                        />
                        <ActionButton
                          icon={Eye}
                          title="Ver Detalles"
                          variant="view"
                          onClick={() => {
                            setCatadorSeleccionado(catador);
                            setModalDetalleAbierto(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de la tabla */}
        <div className="p-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between text-xs text-surface-500">
          <span>
            Total registros: <b>{catadoresFiltrados.length}</b> de {catadores.length}
          </span>
          <span className="text-stone-400">Página 1 de 1</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR CATADOR                                                  */}
      {/* ========================================================================= */}
      <CrearCatadorModal
        isOpen={modalRegistrarAbierto}
        onClose={() => setModalRegistrarAbierto(false)}
        onSubmit={handleGuardarNuevo}
        loading={crearCatador.isPending}
        laboratoriosDisponibles={laboratoriosUnicos.filter(Boolean)}
      />

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CATADOR                                                     */}
      {/* ========================================================================= */}
      {modalEditarAbierto && catadorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Actualizar Catador</h3>
                  <p className="text-xs text-stone-500">
                    ID: {catadorSeleccionado.numero_identificacion}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEditarAbierto(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primer Nombre
                  </label>
                  <input
                    type="text"
                    value={catadorSeleccionado.primer_nombre}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        primer_nombre: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primer Apellido
                  </label>
                  <input
                    type="text"
                    value={catadorSeleccionado.primer_apellido}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        primer_apellido: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={catadorSeleccionado.telefono}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={catadorSeleccionado.correo}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        correo: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Certificación CQI
                  </label>
                  <input
                    type="text"
                    value={catadorSeleccionado.certificacion}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        certificacion: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Laboratorio
                  </label>
                  <input
                    type="text"
                    value={catadorSeleccionado.laboratorio}
                    onChange={(e) =>
                      setCatadorSeleccionado({
                        ...catadorSeleccionado,
                        laboratorio: e.target.value,
                      })
                    }
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER DETALLE CATADOR                                                */}
      {/* ========================================================================= */}
      {modalDetalleAbierto && catadorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-900 to-stone-900 p-6 text-white relative">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-xl font-bold">
                  {catadorSeleccionado.primer_nombre[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-snug">
                    {catadorSeleccionado.primer_nombre} {catadorSeleccionado.segundo_nombre}{' '}
                    {catadorSeleccionado.primer_apellido} {catadorSeleccionado.segundo_apellido}
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    Catador Profesional Q-Grader Certificado
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block mb-0.5">Identificación</span>
                  <span className="font-semibold text-stone-800">
                    {catadorSeleccionado.tipo_documento} {catadorSeleccionado.numero_identificacion}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block mb-0.5">Experiencia</span>
                  <span className="font-semibold text-stone-800">
                    {catadorSeleccionado.experiencia}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><b>Acreditación:</b> {catadorSeleccionado.certificacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><b>Laboratorio:</b> {catadorSeleccionado.laboratorio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><b>Teléfono:</b> {catadorSeleccionado.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><b>Correo:</b> {catadorSeleccionado.correo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <b>Muestras evaluadas:</b> {catadorSeleccionado.muestras_evaluadas} cataciones
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="px-4 py-2 text-sm bg-stone-800 text-white rounded-xl hover:bg-stone-900 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
