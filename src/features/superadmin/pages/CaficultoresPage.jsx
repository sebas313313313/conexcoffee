import { useState, useRef } from 'react';
import {
  Leaf,
  Search,
  Filter,
  Pencil,
  Eye,
  Building2,
  X,
  Check,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminCaficultores,
  useCrearSuperadminCaficultor,
  useActualizarSuperadminCaficultor,
} from '../hooks/useSuperadminData';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { CrearCaficultorModal } from '@/components/usuarios';

export default function CaficultoresPage() {
  const query = useSuperadminCaficultores();
  const caficultores = query.data ?? [];
  const crearCaficultor = useCrearSuperadminCaficultor();
  const actualizarCaficultor = useActualizarSuperadminCaficultor();
  const { empresas = [] } = useSuperAdmin();
  const EMPRESAS_DISPONIBLES =
    empresas.length > 0
      ? empresas.map((e) => e.nombre)
      : [
          'Café Especial Huila SAS',
          'Exportadora Andina de Café',
          'Origen Café Colombia',
          'Alianza Cafetera del Sur',
          'BioCafé Santander',
        ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todos');

  const tableRef = useRef(null);

  // Modales
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);

  // Registro seleccionado
  const [caficultorActual, setCaficultorActual] = useState(null);

  // Formulario creación / edición
  const [formData, setFormData] = useState({
    numeroIdentificacion: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '',
    genero: 'M',
    direccion: '',
    municipio: '',
    departamento: '',
    historia: '',
    empresa: '',
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
      fechaNacimiento: '',
      genero: 'M',
      direccion: '',
      municipio: '',
      departamento: '',
      historia: '',
      empresa: '',
    });
    setModalRegistroAbierto(true);
  };

  const abrirModalEditar = (c) => {
    setCaficultorActual(c);
    setFormData({
      numeroIdentificacion: c.numeroIdentificacion || '',
      primerNombre: c.primerNombre || '',
      segundoNombre: c.segundoNombre || '',
      primerApellido: c.primerApellido || '',
      segundoApellido: c.segundoApellido || '',
      telefono: c.telefono || '',
      correo: c.correo || '',
      fechaNacimiento: c.fechaNacimiento || '',
      genero: c.genero || 'M',
      direccion: c.direccion || '',
      municipio: c.municipio || '',
      departamento: c.departamento || '',
      historia: c.historia || '',
      empresa: c.empresa || '',
    });
    setModalEditarAbierto(true);
  };

  const abrirModalDetalles = (c) => {
    setCaficultorActual(c);
    setModalDetalleAbierto(true);
  };

  const abrirModalAsignar = (c) => {
    setCaficultorActual(c);
    setModalAsignarAbierto(true);
  };

  const guardarCreacion = (data) => {
    const nuevo = {
      ...data,
      fincasCount: 0,
      lotesCount: 0,
      avatar: '/images/users/user-dummy-img.jpg',
    };
    crearCaficultor.mutate(nuevo);
    setModalRegistroAbierto(false);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    actualizarCaficultor.mutate({ ...caficultorActual, ...formData });
    setModalEditarAbierto(false);
  };

  const asignarEmpresa = (nombreEmpresa) => {
    actualizarCaficultor.mutate({ ...caficultorActual, empresa: nombreEmpresa });
    setModalAsignarAbierto(false);
  };


  // Filtrado
  const filtrados = caficultores.filter((c) => {
    const term = searchTerm.toLowerCase();
    const coincideTexto =
      c.numeroIdentificacion.toLowerCase().includes(term) ||
      c.primerNombre.toLowerCase().includes(term) ||
      c.primerApellido.toLowerCase().includes(term) ||
      c.telefono.toLowerCase().includes(term) ||
      (c.municipio && c.municipio.toLowerCase().includes(term));

    if (filtroEmpresa === 'asignada') return coincideTexto && c.empresa;
    if (filtroEmpresa === 'sin_empresa') return coincideTexto && !c.empresa;
    return coincideTexto;
  });

  useTableEntranceAnimation(tableRef, [filtrados.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a cabecera-modulo con portada */}
      <ModuloCabecera
        titulo="Caficultores"
        subtitulo="Listado y gestión integral de productores de café asociados a la plataforma"
        imagenPortada="/images/portadas/caficultor.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus caficultores."
        icono={Leaf}
        totalRegistros={filtrados.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Registrar Caficultor"
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por cédula, nombre, teléfono…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-surface-200 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todos los caficultores</option>
            <option value="asignada">Con empresa asignada</option>
            <option value="sin_empresa">Sin empresa asignada</option>
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
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Empresa</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-surface-500">
                    No se encontraron caficultores con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filtrados.map((c, index) => (
                  <tr key={c.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-900">
                      {c.numeroIdentificacion}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.avatar}
                          alt={c.primerNombre}
                          className="h-8 w-8 rounded-full object-cover border border-surface-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/images/users/user-dummy-img.jpg';
                          }}
                        />
                        <span className="font-semibold text-surface-800">
                          {c.primerNombre} {c.segundoNombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-surface-700">
                      {c.primerApellido} {c.segundoApellido}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {c.telefono}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {c.empresa ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Building2 className="h-3 w-3" />
                          {c.empresa}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Sin Asignar
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          icon={Pencil}
                          title="Editar Caficultor"
                          variant="primary"
                          onClick={() => abrirModalEditar(c)}
                        />
                        {!c.empresa && (
                          <ActionButton
                            icon={Building2}
                            title="Asignar Empresa"
                            variant="success"
                            onClick={() => abrirModalAsignar(c)}
                          />
                        )}
                        <ActionButton
                          icon={Eye}
                          title="Ver Detalles"
                          variant="view"
                          onClick={() => abrirModalDetalles(c)}
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

      {/* MODAL REGISTRAR CAFICULTOR */}
      <CrearCaficultorModal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onSubmit={guardarCreacion}
        loading={crearCaficultor.isPending}
        empresasDisponibles={EMPRESAS_DISPONIBLES}
      />

      {/* MODAL EDITAR CAFICULTOR */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-surface-200 animate-in fade-in duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Editar Caficultor</h3>
                  <p className="text-xs text-surface-500">Actualizar datos de {caficultorActual?.primerNombre}</p>
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
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Número de Identificación
                  </label>
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
                    onChange={(e) => setFormData({ ...formData, primerNombre: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    value={formData.primerApellido}
                    onChange={(e) => setFormData({ ...formData, primerApellido: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Empresa</label>
                  <select
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  >
                    <option value="">Sin Asignar</option>
                    {EMPRESAS_DISPONIBLES.map((emp) => (
                      <option key={emp} value={emp}>{emp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
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
                  Actualizar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR EMPRESA */}
      {modalAsignarAbierto && caficultorActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-surface-900">Asignar Empresa</h3>
              </div>
              <button
                onClick={() => setModalAsignarAbierto(false)}
                className="p-1 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-surface-600 my-3">
              Seleccione la empresa regional para asignar al caficultor{' '}
              <strong className="text-surface-900">{caficultorActual.primerNombre} {caficultorActual.primerApellido}</strong>.
            </p>

            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
              {EMPRESAS_DISPONIBLES.map((emp) => (
                <button
                  key={emp}
                  onClick={() => asignarEmpresa(emp)}
                  className="w-full text-left p-3 rounded-xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="text-sm font-semibold text-surface-800 group-hover:text-emerald-700">
                    {emp}
                  </span>
                  <Check className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE CAFICULTOR */}
      {modalDetalleAbierto && caficultorActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <img
                  src={caficultorActual.avatar}
                  alt={caficultorActual.primerNombre}
                  className="h-12 w-12 rounded-full object-cover border-2 border-brand-terracota"
                  onError={(e) => {
                    e.currentTarget.src = '/images/users/user-dummy-img.jpg';
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-surface-900">
                    {caficultorActual.primerNombre} {caficultorActual.segundoNombre} {caficultorActual.primerApellido} {caficultorActual.segundoApellido}
                  </h3>
                  <span className="text-xs text-surface-500">CC {caficultorActual.numeroIdentificacion}</span>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-surface-50 p-3.5 rounded-xl border border-surface-200">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-terracota" />
                  <div>
                    <div className="text-[11px] text-surface-500 font-medium">Teléfono</div>
                    <div className="font-semibold text-surface-800">{caficultorActual.telefono}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-terracota" />
                  <div>
                    <div className="text-[11px] text-surface-500 font-medium">Correo</div>
                    <div className="font-semibold text-surface-800 truncate max-w-[150px]">{caficultorActual.correo || 'No registrado'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-terracota" />
                  <div>
                    <div className="text-[11px] text-surface-500 font-medium">Ubicación</div>
                    <div className="font-semibold text-surface-800">{caficultorActual.municipio}, {caficultorActual.departamento}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-terracota" />
                  <div>
                    <div className="text-[11px] text-surface-500 font-medium">Empresa</div>
                    <div className="font-semibold text-surface-800">{caficultorActual.empresa || 'Sin empresa'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                  Dirección / Finca
                </h4>
                <p className="text-surface-600 bg-surface-50 px-3 py-2 rounded-lg border border-surface-100">
                  {caficultorActual.direccion}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-1">
                  Historia del Caficultor
                </h4>
                <p className="text-surface-600 text-xs leading-relaxed italic bg-surface-50 p-3 rounded-lg border border-surface-100">
                  "{caficultorActual.historia}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-brand-tint p-3 rounded-xl border border-brand-terracota/20 text-center">
                  <span className="text-2xl font-extrabold text-brand-terracota">{caficultorActual.fincasCount}</span>
                  <div className="text-xs font-semibold text-surface-600">Fincas Registradas</div>
                </div>
                <div className="bg-surface-50 p-3 rounded-xl border border-surface-200 text-center">
                  <span className="text-2xl font-extrabold text-surface-800">{caficultorActual.lotesCount}</span>
                  <div className="text-xs font-semibold text-surface-600">Lotes de Café</div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="px-4 py-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold"
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
