import { useState, useRef } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Pencil,
  Eye,
  X,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminTecnicos,
  useCrearSuperadminTecnico,
  useActualizarSuperadminTecnico,
} from '../hooks/useSuperadminData';
import { CrearTecnicoModal } from '@/components/usuarios';

export default function TecnicosPage() {
  const query = useSuperadminTecnicos();
  const tecnicos = query.data ?? [];
  const crearTecnico = useCrearSuperadminTecnico();
  const actualizarTecnico = useActualizarSuperadminTecnico();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroZona, setFiltroZona] = useState('todos');
  const tableRef = useRef(null);

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [tecnicoActual, setTecnicoActual] = useState(null);

  const [formData, setFormData] = useState({
    numeroIdentificacion: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    telefono: '',
    correo: '',
    especialidad: '',
    zonaAsignada: '',
  });

  const abrirModalCrear = () => {
    setFormData({
      numeroIdentificacion: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      telefono: '',
      correo: '',
      especialidad: '',
      zonaAsignada: '',
    });
    setModalRegistroAbierto(true);
  };

  const abrirModalEditar = (t) => {
    setTecnicoActual(t);
    setFormData({
      numeroIdentificacion: t.numeroIdentificacion || '',
      primerNombre: t.primerNombre || '',
      segundoNombre: t.segundoNombre || '',
      primerApellido: t.primerApellido || '',
      segundoApellido: t.segundoApellido || '',
      telefono: t.telefono || '',
      correo: t.correo || '',
      especialidad: t.especialidad || '',
      zonaAsignada: t.zonaAsignada || '',
    });
    setModalEditarAbierto(true);
  };

  const abrirModalDetalles = (t) => {
    setTecnicoActual(t);
    setModalDetalleAbierto(true);
  };

  const guardarCreacion = (data) => {
    const nuevo = {
      ...data,
      visitasRealizadas: 0,
      activo: true,
      avatar: '/images/users/user-dummy-img.jpg',
    };
    crearTecnico.mutate(nuevo);
    setModalRegistroAbierto(false);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    actualizarTecnico.mutate({ ...tecnicoActual, ...formData });
    setModalEditarAbierto(false);
  };


  const zonasUnicas = Array.from(
    new Set(tecnicos.map((t) => t.zonaAsignada).filter(Boolean))
  );

  const filtrados = tecnicos.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.numeroIdentificacion.toLowerCase().includes(term) ||
      t.primerNombre.toLowerCase().includes(term) ||
      t.primerApellido.toLowerCase().includes(term) ||
      t.telefono.toLowerCase().includes(term) ||
      t.zonaAsignada.toLowerCase().includes(term);
    const matchesZona = filtroZona === 'todos' || t.zonaAsignada === filtroZona;
    return matchesSearch && matchesZona;
  });

  useTableEntranceAnimation(tableRef, [filtrados.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo con imagen tecnico.jpg */}
      <ModuloCabecera
        titulo="Técnicos y Extensionistas"
        subtitulo="Personal agronómico y catadores autorizados para visitas de campo y muestreo"
        imagenPortada="/images/portadas/tecnico.jpg"
        mensaje="Gestión de la información de los técnicos y catadores en campo."
        icono={UserCheck}
        totalRegistros={filtrados.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Registrar Técnico"
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, teléfono o zona…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-surface-200 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todas las zonas</option>
            {zonasUnicas.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Oficial (Nº, Identificación, Nombres, Apellidos, Teléfono, Acciones) */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm text-left">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Identificación</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Nombres</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Apellidos</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Teléfono</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Zona Asignada</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-surface-500">
                    No se encontraron técnicos registrados.
                  </td>
                </tr>
              ) : (
                filtrados.map((t, index) => (
                  <tr key={t.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-900 text-xs">
                      {t.numeroIdentificacion}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.avatar}
                          alt={t.primerNombre}
                          className="h-8 w-8 rounded-full object-cover border border-surface-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/users/user-dummy-img.jpg';
                          }}
                        />
                        <span className="font-semibold text-surface-800">
                          {t.primerNombre} {t.segundoNombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-surface-700">
                      {t.primerApellido} {t.segundoApellido}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {t.telefono}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-tint text-brand-terracota border border-brand-terracota/20">
                        {t.zonaAsignada}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          icon={Pencil}
                          title="Editar Técnico"
                          variant="primary"
                          onClick={() => abrirModalEditar(t)}
                        />
                        <ActionButton
                          icon={Eye}
                          title="Ver Técnico"
                          variant="view"
                          onClick={() => abrirModalDetalles(t)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR TÉCNICO */}
      <CrearTecnicoModal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onSubmit={guardarCreacion}
        loading={crearTecnico.isPending}
      />

      {/* MODAL DETALLES */}
      {modalDetalleAbierto && tecnicoActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <img
                  src={tecnicoActual.avatar}
                  alt={tecnicoActual.primerNombre}
                  className="h-12 w-12 rounded-full object-cover border-2 border-brand-terracota"
                  onError={(e) => {
                    e.currentTarget.src = '/images/users/user-dummy-img.jpg';
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-surface-900">
                    {tecnicoActual.primerNombre} {tecnicoActual.primerApellido}
                  </h3>
                  <span className="text-xs text-surface-500">CC {tecnicoActual.numeroIdentificacion}</span>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="p-1 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200 text-xs">
                <div>
                  <span className="text-surface-500 block">Teléfono</span>
                  <span className="font-semibold text-surface-800">{tecnicoActual.telefono}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Correo</span>
                  <span className="font-semibold text-surface-800">{tecnicoActual.correo}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Zona de Acción</span>
                  <span className="font-semibold text-brand-terracota">{tecnicoActual.zonaAsignada}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Visitas a Fincas</span>
                  <span className="font-semibold text-emerald-700">{tecnicoActual.visitasRealizadas} auditorías</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Especialidad</span>
                <p className="text-xs text-surface-700 bg-surface-50 p-2.5 rounded-lg border border-surface-100 font-medium">
                  {tecnicoActual.especialidad}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="px-4 py-2 rounded-xl bg-surface-900 text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TÉCNICO */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Editar Técnico</h3>
                  <p className="text-xs text-surface-500">{tecnicoActual?.primerNombre} {tecnicoActual?.primerApellido}</p>
                </div>
              </div>
              <button
                onClick={() => setModalEditarAbierto(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Cédula</label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacion}
                    onChange={(e) => setFormData({ ...formData, numeroIdentificacion: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Primer Nombre</label>
                  <input
                    type="text"
                    value={formData.primerNombre}
                    onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    value={formData.primerApellido}
                    onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Zona Asignada</label>
                  <input
                    type="text"
                    value={formData.zonaAsignada}
                    onChange={(e) => setFormData({ ...formData, zonaAsignada: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">Especialidad</label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md cursor-pointer"
                >
                  Actualizar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
