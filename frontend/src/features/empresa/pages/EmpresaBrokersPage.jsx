import { useState } from 'react';
import { ModuloCabecera } from '@/components/data-display';
import {
  Search,
  Eye,
  Pencil,
  X,
  Handshake,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaBrokers,
  useCrearEmpresaBroker,
  useActualizarEmpresaBroker,
} from '../hooks/useEmpresaData';

export default function EmpresaBrokersPage() {
  const query = useEmpresaBrokers();
  const brokers = query.data ?? [];
  const crearBroker = useCrearEmpresaBroker();
  const actualizarBroker = useActualizarEmpresaBroker();
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConsultar, setModalConsultar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [brokerSeleccionado, setBrokerSeleccionado] = useState(null);
  const [brokerEdicion, setBrokerEdicion] = useState(null);

  // Formulario nuevo broker (Campos exactos del sistema original)
  const [nuevoBroker, setNuevoBroker] = useState({
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '1985-05-12',
    direccion: '',
    telefono: '',
    genero: 'Masculino',
    pais_residencia: 'Colombia',
    departamento_residencia: 'Cauca',
    municipio_residencia: 'Popayán',
    correo: '',
    password: '',
    confirmPassword: '',
    zona_comercial: 'Norteamérica & Unión Europea',
  });

  // Búsqueda en modal consultar
  const [criterioConsulta, setCriterioConsulta] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);

  const term = searchTerm.toLowerCase();
  const brokersFiltrados = brokers.filter((b) => {
    const fullName = `${b.primer_nombre || ''} ${b.segundo_nombre || ''} ${b.primer_apellido || ''} ${b.segundo_apellido || ''}`.toLowerCase();
    return (
      (b.numero_identificacion || '').toLowerCase().includes(term) ||
      fullName.includes(term) ||
      (b.telefono || '').includes(term) ||
      (b.correo || '').toLowerCase().includes(term)
    );
  });

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (
      !nuevoBroker.numero_identificacion ||
      !nuevoBroker.nombres ||
      !nuevoBroker.apellidos
    ) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    if (!nuevoBroker.correo?.trim()) {
      toast.error('El correo electrónico es un campo obligatorio (*)');
      return;
    }

    if (!nuevoBroker.password) {
      toast.error('La contraseña es un campo obligatorio (*)');
      return;
    }

    if (nuevoBroker.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevoBroker.password !== nuevoBroker.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Aún no conectado al backend
    toast.error('Error de conexión con el backend: El servicio de registro con credenciales aún no está conectado al servidor.');
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!brokerEdicion) return;

    actualizarBroker.mutate(brokerEdicion);
    setModalEditar(false);
  };

  if (query.isLoading || query.isError) {
    return <QueryState query={query} />;
  }

  const handleEjecutarConsulta = (e) => {
    e.preventDefault();
    const query = criterioConsulta.trim().toLowerCase();
    if (!query) {
      toast.error('Ingrese un número de identificación o nombre');
      return;
    }

    const encontrado = brokers.find((b) => {
      const full = `${b.primer_nombre} ${b.primer_apellido}`.toLowerCase();
      return b.numero_identificacion.includes(query) || full.includes(query);
    });

    if (encontrado) {
      setResultadoConsulta(encontrado);
      toast.success('Broker encontrado');
    } else {
      setResultadoConsulta(null);
      toast.error('No se encontró ningún broker con ese criterio');
    }
  };

  const abrirEdicion = (b) => {
    setBrokerEdicion({
      ...b,
      nombres: `${b.primer_nombre || ''} ${b.segundo_nombre || ''}`.trim(),
      apellidos: `${b.primer_apellido || ''} ${b.segundo_apellido || ''}`.trim(),
    });
    setModalEditar(true);
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Brokers Comerciales"
        subtitulo="Gestión de intermediarios autorizados, representación y contratos comerciales"
        imagenPortada="/images/portadas/broker.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus brokers aliados."
        icono={Handshake}
        totalRegistros={brokers.length}
        textoBotonRegistrar="Registrar Broker"
        textoBotonConsultar="Consultar Broker"
        onRegistrar={() => setModalRegistrar(true)}
        onConsultar={() => {
          setCriterioConsulta('');
          setResultadoConsulta(null);
          setModalConsultar(true);
        }}
      />

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombre o teléfono..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Tabla Oficial de Brokers */}
      {/* Columnas: N°, Identificación, Nombres, Apellidos, Teléfono, Acciones (Editar, Ver) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">N°</th>
                <th className="py-3.5 px-4">Identificación</th>
                <th className="py-3.5 px-4">Nombres</th>
                <th className="py-3.5 px-4">Apellidos</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {brokersFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-stone-400">
                    No se encontraron brokers registrados con esos criterios.
                  </td>
                </tr>
              ) : (
                brokersFiltrados.map((b, index) => (
                  <tr key={b.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center text-stone-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      {b.numero_identificacion}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      {b.primer_nombre} {b.segundo_nombre || ''}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      {b.primer_apellido} {b.segundo_apellido || ''}
                    </td>
                    <td className="py-4 px-4 font-medium text-stone-700">
                      {b.telefono}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEdicion(b)}
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                          title="Editar Broker"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Ver */}
                        <button
                          type="button"
                          onClick={() => {
                            setBrokerSeleccionado(b);
                            setModalDetalle(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTRAR BROKER (Campos exactos del sistema original) */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-700" />
                Registrar Broker
              </h3>
              <button
                type="button"
                onClick={() => setModalRegistrar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevo} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Número de Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoBroker.numero_identificacion}
                    onChange={(e) =>
                      setNuevoBroker({ ...nuevoBroker, numero_identificacion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoBroker.fecha_nacimiento}
                    onChange={(e) =>
                      setNuevoBroker({ ...nuevoBroker, fecha_nacimiento: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: OSCAR"
                    value={nuevoBroker.nombres}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, nombres: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: VALVERDE"
                    value={nuevoBroker.apellidos}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, apellidos: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Género *</label>
                  <select
                    value={nuevoBroker.genero}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, genero: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={nuevoBroker.telefono}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dirección *</label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, carrera..."
                    value={nuevoBroker.direccion}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, direccion: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">País *</label>
                  <input
                    type="text"
                    required
                    value={nuevoBroker.pais_residencia}
                    onChange={(e) =>
                      setNuevoBroker({ ...nuevoBroker, pais_residencia: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Departamento *</label>
                  <input
                    type="text"
                    required
                    value={nuevoBroker.departamento_residencia}
                    onChange={(e) =>
                      setNuevoBroker({ ...nuevoBroker, departamento_residencia: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Municipio *</label>
                  <input
                    type="text"
                    required
                    value={nuevoBroker.municipio_residencia}
                    onChange={(e) =>
                      setNuevoBroker({ ...nuevoBroker, municipio_residencia: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

                            <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="broker@empresa.com"
                  value={nuevoBroker.correo}
                  onChange={(e) => setNuevoBroker({ ...nuevoBroker, correo: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Inserta Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={nuevoBroker.password}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, password: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Confirma Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repite la contraseña"
                    value={nuevoBroker.confirmPassword}
                    onChange={(e) => setNuevoBroker({ ...nuevoBroker, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalRegistrar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONSULTAR BROKER */}
      {modalConsultar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-700" />
                Consultar Broker
              </h3>
              <button
                type="button"
                onClick={() => setModalConsultar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEjecutarConsulta} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Búsqueda por Identificación o Nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Identificación, nombre..."
                  value={criterioConsulta}
                  onChange={(e) => setCriterioConsulta(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              {resultadoConsulta && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-stone-800">
                  <div className="font-bold text-amber-950 text-sm">
                    {resultadoConsulta.primer_nombre} {resultadoConsulta.primer_apellido}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    C.C. {resultadoConsulta.numero_identificacion} • {resultadoConsulta.telefono}
                  </div>
                  <div className="text-[11px] text-stone-600">{resultadoConsulta.correo}</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalConsultar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Consultar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DETALLE DEL BROKER */}
      {modalDetalle && brokerSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Detalle del Broker</h3>
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl mx-auto mb-2 border border-amber-200">
                {brokerSeleccionado.primer_nombre ? brokerSeleccionado.primer_nombre[0] : 'B'}
                {brokerSeleccionado.primer_apellido ? brokerSeleccionado.primer_apellido[0] : ''}
              </div>
              <h4 className="font-bold text-stone-900 text-base">
                {brokerSeleccionado.primer_nombre} {brokerSeleccionado.segundo_nombre || ''}{' '}
                {brokerSeleccionado.primer_apellido} {brokerSeleccionado.segundo_apellido || ''}
              </h4>
              <p className="text-xs text-stone-500 font-mono">
                C.C. {brokerSeleccionado.numero_identificacion}
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Fecha de Nacimiento:</span>
                <span className="font-semibold text-stone-800">
                  {brokerSeleccionado.fecha_nacimiento || '1985-05-12'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Teléfono:</span>
                <span className="font-semibold text-stone-800">{brokerSeleccionado.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Dirección:</span>
                <span className="font-semibold text-stone-800">
                  {brokerSeleccionado.direccion || 'Calle 4 # 12-45'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Correo Electrónico:</span>
                <span className="font-semibold text-stone-800">{brokerSeleccionado.correo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">País y Municipio:</span>
                <span className="font-semibold text-amber-800">
                  {brokerSeleccionado.municipio || 'Popayán'}, {brokerSeleccionado.pais || 'Colombia'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-black"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDITAR BROKER */}
      {modalEditar && brokerEdicion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                Editar Broker ({brokerEdicion.numero_identificacion})
              </h3>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Primer Nombre</label>
                  <input
                    type="text"
                    value={brokerEdicion.primer_nombre}
                    onChange={(e) =>
                      setBrokerEdicion({ ...brokerEdicion, primer_nombre: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    value={brokerEdicion.primer_apellido}
                    onChange={(e) =>
                      setBrokerEdicion({
                        ...brokerEdicion,
                        primer_apellido: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={brokerEdicion.telefono}
                    onChange={(e) =>
                      setBrokerEdicion({ ...brokerEdicion, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={brokerEdicion.correo}
                    onChange={(e) =>
                      setBrokerEdicion({ ...brokerEdicion, correo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
