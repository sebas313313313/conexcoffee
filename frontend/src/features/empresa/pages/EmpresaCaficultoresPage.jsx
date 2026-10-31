import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';

import {
  Search,
  Eye,
  Pencil,
  X,
  Leaf,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaCaficultores,
  useCrearEmpresaCaficultor,
  useActualizarEmpresaCaficultor,
} from '../hooks/useEmpresaData';

export default function EmpresaCaficultoresPage() {
  const caficultoresQuery = useEmpresaCaficultores();
  const caficultores = caficultoresQuery.data || [];
  const crearMutation = useCrearEmpresaCaficultor();
  const actualizarMutation = useActualizarEmpresaCaficultor();
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [caficultorSeleccionado, setCaficultorSeleccionado] = useState(null);
  const [caficultorEdicion, setCaficultorEdicion] = useState(null);

  // Formulario nuevo caficultor (Campos exactos del sistema original)
  const [nuevoCaficultor, setNuevoCaficultor] = useState({
    numero_identificacion: '',
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '1980-04-18',
    genero: 'Masculino',
    direccion: '',
    telefono: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    numero_hijos: 2,
    estado_civil: 'Casado(a)',
    pais_residencia: 'Colombia',
    departamento_residencia: 'Cauca',
    municipio_residencia: 'Popayán',
    finca_principal: 'La Bonita',
    variedad_predominante: 'Caturra Chiroso',
  });

  const term = searchTerm.toLowerCase();
  const caficultoresFiltrados = caficultores.filter((c) => {
    const fullName = `${c.primer_nombre || ''} ${c.segundo_nombre || ''} ${c.primer_apellido || ''} ${c.segundo_apellido || ''}`.toLowerCase();
    return (
      (c.numero_identificacion || '').includes(term) ||
      fullName.includes(term) ||
      (c.telefono || '').includes(term) ||
      (c.municipio || '').toLowerCase().includes(term)
    );
  });

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (
      !nuevoCaficultor.numero_identificacion ||
      !nuevoCaficultor.nombres ||
      !nuevoCaficultor.apellidos
    ) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    if (!nuevoCaficultor.correo?.trim()) {
      toast.error('El correo electrónico es un campo obligatorio (*)');
      return;
    }

    if (!nuevoCaficultor.contrasena) {
      toast.error('La contraseña es un campo obligatorio (*)');
      return;
    }

    if (nuevoCaficultor.contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevoCaficultor.contrasena !== nuevoCaficultor.confirmarContrasena) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Aún no conectado al backend
    toast.error('Error de conexión con el backend: El servicio de registro con credenciales aún no está conectado al servidor.');
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!caficultorEdicion) return;

    actualizarMutation.mutate(caficultorEdicion, {
      onSuccess: () => {
        setModalEditar(false);
      },
    });
  };

  const abrirEdicion = (c) => {
    setCaficultorEdicion({
      ...c,
      nombres: `${c.primer_nombre || ''} ${c.segundo_nombre || ''}`.trim(),
      apellidos: `${c.primer_apellido || ''} ${c.segundo_apellido || ''}`.trim(),
    });
    setModalEditar(true);
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Caficultores Vinculados"
        subtitulo="Gestión de productores campesinos asociados y red de suministro de café especial"
        imagenPortada="/images/portadas/caficultor.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus caficultores asociados."
        icono={Leaf}
        totalRegistros={caficultores.length}
        textoBotonRegistrar="Registrar Caficultor"
        onRegistrar={() => setModalRegistrar(true)}
      />

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombres o teléfono..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Tabla Oficial de Caficultores */}
      <QueryState query={caficultoresQuery} />
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
              {caficultoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-stone-400">
                    No se encontraron caficultores registrados con esos criterios.
                  </td>
                </tr>
              ) : (
                caficultoresFiltrados.map((c, index) => (
                  <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center text-stone-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      {c.numero_identificacion}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      {c.primer_nombre} {c.segundo_nombre || ''}
                    </td>
                    <td className="py-4 px-4 font-semibold text-stone-900">
                      {c.primer_apellido} {c.segundo_apellido || ''}
                    </td>
                    <td className="py-4 px-4 font-medium text-stone-700">
                      {c.telefono}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEdicion(c)}
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                          title="Editar Caficultor"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Ver */}
                        <button
                          type="button"
                          onClick={() => {
                            setCaficultorSeleccionado(c);
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

      {/* MODAL 1: REGISTRAR CAFICULTOR (Campos exactos del sistema original) */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Leaf className="w-5 h-5 text-amber-700" />
                Registrar Caficultor
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
                    value={nuevoCaficultor.numero_identificacion}
                    onChange={(e) =>
                      setNuevoCaficultor({
                        ...nuevoCaficultor,
                        numero_identificacion: e.target.value,
                      })
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
                    value={nuevoCaficultor.fecha_nacimiento}
                    onChange={(e) =>
                      setNuevoCaficultor({
                        ...nuevoCaficultor,
                        fecha_nacimiento: e.target.value,
                      })
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
                    placeholder="Ej: MIGUEL"
                    value={nuevoCaficultor.nombres}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, nombres: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: FLOREZ"
                    value={nuevoCaficultor.apellidos}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, apellidos: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Género *</label>
                  <select
                    value={nuevoCaficultor.genero}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, genero: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estado Civil *</label>
                  <select
                    value={nuevoCaficultor.estado_civil}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, estado_civil: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Unión Libre">Unión Libre</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Número de Hijos *</label>
                  <input
                    type="number"
                    value={nuevoCaficultor.numero_hijos}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, numero_hijos: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={nuevoCaficultor.telefono}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dirección / Vereda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vereda La Rejoya"
                    value={nuevoCaficultor.direccion}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, direccion: e.target.value })
                    }
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
                    value={nuevoCaficultor.pais_residencia}
                    onChange={(e) =>
                      setNuevoCaficultor({ ...nuevoCaficultor, pais_residencia: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Departamento *</label>
                  <input
                    type="text"
                    required
                    value={nuevoCaficultor.departamento_residencia}
                    onChange={(e) =>
                      setNuevoCaficultor({
                        ...nuevoCaficultor,
                        departamento_residencia: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Municipio *</label>
                  <input
                    type="text"
                    required
                    value={nuevoCaficultor.municipio_residencia}
                    onChange={(e) =>
                      setNuevoCaficultor({
                        ...nuevoCaficultor,
                        municipio_residencia: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

                            <div className="border-t border-stone-100 pt-3 mt-1">
                <p className="font-semibold text-stone-800 mb-2">Credenciales de Acceso a ConexCoffee</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="caficultor@correo.com"
                      value={nuevoCaficultor.correo}
                      onChange={(e) =>
                        setNuevoCaficultor({ ...nuevoCaficultor, correo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Inserta Contraseña *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={nuevoCaficultor.contrasena}
                      onChange={(e) =>
                        setNuevoCaficultor({ ...nuevoCaficultor, contrasena: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Confirma Contraseña *</label>
                    <input
                      type="password"
                      required
                      placeholder="Repite la contraseña"
                      value={nuevoCaficultor.confirmarContrasena}
                      onChange={(e) =>
                        setNuevoCaficultor({
                          ...nuevoCaficultor,
                          confirmarContrasena: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                    />
                  </div>
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

      {/* MODAL 2: DETALLE DEL CAFICULTOR */}
      {modalDetalle && caficultorSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Detalle del Caficultor</h3>
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
                {caficultorSeleccionado.primer_nombre ? caficultorSeleccionado.primer_nombre[0] : 'C'}
                {caficultorSeleccionado.primer_apellido ? caficultorSeleccionado.primer_apellido[0] : ''}
              </div>
              <h4 className="font-bold text-stone-900 text-base">
                {caficultorSeleccionado.primer_nombre} {caficultorSeleccionado.segundo_nombre || ''}{' '}
                {caficultorSeleccionado.primer_apellido} {caficultorSeleccionado.segundo_apellido || ''}
              </h4>
              <p className="text-xs text-stone-500 font-mono">
                C.C. {caficultorSeleccionado.numero_identificacion}
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Teléfono:</span>
                <span className="font-semibold text-stone-800">{caficultorSeleccionado.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Dirección:</span>
                <span className="font-semibold text-stone-800">
                  {caficultorSeleccionado.direccion || 'Vereda La Rejoya'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Municipio:</span>
                <span className="font-semibold text-amber-800">
                  {caficultorSeleccionado.municipio || 'Popayán'}, {caficultorSeleccionado.departamento || 'Cauca'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Finca Principal:</span>
                <span className="font-bold text-stone-900">
                  {caficultorSeleccionado.finca_principal || 'La Bonita'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Variedad Predominante:</span>
                <span className="font-semibold text-stone-800">
                  {caficultorSeleccionado.variedad_predominante || 'Caturra Chiroso'}
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

      {/* MODAL 3: EDITAR CAFICULTOR */}
      {modalEditar && caficultorEdicion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                Editar Caficultor ({caficultorEdicion.numero_identificacion})
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
                    value={caficultorEdicion.primer_nombre}
                    onChange={(e) =>
                      setCaficultorEdicion({
                        ...caficultorEdicion,
                        primer_nombre: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Primer Apellido</label>
                  <input
                    type="text"
                    value={caficultorEdicion.primer_apellido}
                    onChange={(e) =>
                      setCaficultorEdicion({
                        ...caficultorEdicion,
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
                    value={caficultorEdicion.telefono}
                    onChange={(e) =>
                      setCaficultorEdicion({ ...caficultorEdicion, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={caficultorEdicion.municipio}
                    onChange={(e) =>
                      setCaficultorEdicion({ ...caficultorEdicion, municipio: e.target.value })
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
