import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';

import {
  Search,
  Eye,
  Pencil,
  X,
  UserCheck,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaTecnicos,
  useCrearEmpresaTecnico,
  useActualizarEmpresaTecnico,
} from '../hooks/useEmpresaData';

export default function EmpresaTecnicosPage() {
  const tecnicosQuery = useEmpresaTecnicos();
  const tecnicos = tecnicosQuery.data || [];
  const crearMutation = useCrearEmpresaTecnico();
  const actualizarMutation = useActualizarEmpresaTecnico();
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalConsultar, setModalConsultar] = useState(false);

  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [tecnicoEdicion, setTecnicoEdicion] = useState(null);

  // Formulario nuevo técnico
  const [nuevoTecnico, setNuevoTecnico] = useState({
    numero_identificacion: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    zona_asignada: 'Huila Sur (Pitalito, San Agustín)',
    fincas_a_cargo: 10,
    especialidad: 'Agrónomo Especialista en Suelos y Q-Grader',
    estado: 'Activo',
  });

  const [criterioConsulta, setCriterioConsulta] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);

  const tecnicosFiltrados = tecnicos.filter((t) => {
    const term = searchTerm.toLowerCase();
    const nombreCompleto = `${t.primer_nombre} ${t.segundo_nombre || ''} ${t.primer_apellido} ${t.segundo_apellido || ''}`.toLowerCase();
    return (
      (t.numero_identificacion || '').toLowerCase().includes(term) ||
      nombreCompleto.includes(term) ||
      (t.correo || '').toLowerCase().includes(term) ||
      (t.zona_asignada || '').toLowerCase().includes(term)
    );
  });

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevoTecnico.numero_identificacion || !nuevoTecnico.primer_nombre || !nuevoTecnico.primer_apellido) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    const nuevo = {
      id: Date.now(),
      ...nuevoTecnico,
      primer_nombre: nuevoTecnico.primer_nombre.toUpperCase(),
      segundo_nombre: nuevoTecnico.segundo_nombre.toUpperCase(),
      primer_apellido: nuevoTecnico.primer_apellido.toUpperCase(),
      segundo_apellido: nuevoTecnico.segundo_apellido.toUpperCase(),
      fincas_a_cargo: Number(nuevoTecnico.fincas_a_cargo) || 0,
    };

    crearMutation.mutate(nuevo, {
      onSuccess: () => {
        setModalRegistrar(false);
        setNuevoTecnico({
          numero_identificacion: '',
          primer_nombre: '',
          segundo_nombre: '',
          primer_apellido: '',
          segundo_apellido: '',
          telefono: '',
          correo: '',
          zona_asignada: 'Huila Sur (Pitalito, San Agustín)',
          fincas_a_cargo: 10,
          especialidad: 'Agrónomo Especialista en Suelos y Q-Grader',
          estado: 'Activo',
        });
      },
    });
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!tecnicoEdicion) return;

    actualizarMutation.mutate(tecnicoEdicion, {
      onSuccess: () => {
        setModalEditar(false);
      },
    });
  };

  const handleEjecutarConsulta = (e) => {
    e.preventDefault();
    const query = criterioConsulta.trim().toLowerCase();
    if (!query) {
      toast.error('Ingrese una cédula o nombre');
      return;
    }

    const encontrado = tecnicos.find((t) => {
      const full = `${t.primer_nombre} ${t.primer_apellido}`.toLowerCase();
      return t.numero_identificacion.includes(query) || full.includes(query);
    });

    if (encontrado) {
      setResultadoConsulta(encontrado);
      toast.success('Técnico encontrado');
    } else {
      setResultadoConsulta(null);
      toast.error('No se encontró técnico con ese criterio');
    }
  };

  const abrirEdicion = (item) => {
    setTecnicoEdicion({ ...item });
    setModalEditar(true);
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Técnicos de Campo"
        subtitulo="Acompañamiento agronómico, supervisión de buenas prácticas agrícolas y visitas"
        imagenPortada="/images/portadas/tecnico.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de los técnicos agrónomos asignados a tus fincas."
        icono={UserCheck}
        totalRegistros={tecnicos.length}
        textoBotonRegistrar="Registrar Técnico"
        textoBotonConsultar="Consultar Técnico"
        onRegistrar={() => setModalRegistrar(true)}
        onConsultar={() => {
          setCriterioConsulta('');
          setResultadoConsulta(null);
          setModalConsultar(true);
        }}
      />

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombre, correo o zona..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Tabla de Técnicos */}
      <QueryState query={tecnicosQuery} />
      {/* Columnas: N°, Identificación, Nombre Completo, Contacto, Zona Asignada, Fincas, Estado, Acciones */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-[11px] uppercase text-stone-500 font-bold border-b border-stone-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">N°</th>
                <th className="py-3.5 px-4">Identificación</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Zona Asignada</th>
                <th className="py-3.5 px-4 text-center">Fincas</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tecnicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-stone-400">
                    No se encontraron técnicos registrados con esos criterios.
                  </td>
                </tr>
              ) : (
                tecnicosFiltrados.map((item, index) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center text-stone-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      {item.numero_identificacion}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-stone-900">
                        {item.primer_nombre} {item.segundo_nombre || ''} {item.primer_apellido} {item.segundo_apellido || ''}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {item.especialidad || 'Agrónomo de Campo'}
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-0.5">
                      <div className="text-stone-700">
                        {item.telefono}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        {item.correo}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-stone-700">
                      {item.zona_asignada}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-stone-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px]">
                        {item.fincas_a_cargo}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEdicion(item)}
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                          title="Editar Técnico"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Ver */}
                        <button
                          type="button"
                          onClick={() => {
                            setTecnicoSeleccionado(item);
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

      {/* MODAL 1: REGISTRAR TÉCNICO */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-700" />
                Registrar Técnico de Campo
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
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Número de Cédula *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoTecnico.numero_identificacion}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, numero_identificacion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Primer Nombre *</label>
                  <input
                    type="text"
                    required
                    value={nuevoTecnico.primer_nombre}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, primer_nombre: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Primer Apellido *</label>
                  <input
                    type="text"
                    required
                    value={nuevoTecnico.primer_apellido}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, primer_apellido: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={nuevoTecnico.telefono}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Correo *</label>
                  <input
                    type="email"
                    required
                    value={nuevoTecnico.correo}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, correo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Zona Asignada *</label>
                  <input
                    type="text"
                    required
                    value={nuevoTecnico.zona_asignada}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, zona_asignada: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Fincas a Cargo *</label>
                  <input
                    type="number"
                    required
                    value={nuevoTecnico.fincas_a_cargo}
                    onChange={(e) =>
                      setNuevoTecnico({ ...nuevoTecnico, fincas_a_cargo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Especialidad Agronómica</label>
                <input
                  type="text"
                  value={nuevoTecnico.especialidad}
                  onChange={(e) =>
                    setNuevoTecnico({ ...nuevoTecnico, especialidad: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
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

      {/* MODAL 2: CONSULTAR TÉCNICO */}
      {modalConsultar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-700" />
                Consultar Técnico
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
                  Cédula o Nombre del Técnico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cédula, nombre..."
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
                  <div className="text-[11px] text-stone-600">
                    Zona: {resultadoConsulta.zona_asignada}
                  </div>
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

      {/* MODAL 3: DETALLE DEL TÉCNICO */}
      {modalDetalle && tecnicoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Ficha del Técnico Agrónomo</h3>
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
                {tecnicoSeleccionado.primer_nombre[0]}
                {tecnicoSeleccionado.primer_apellido[0]}
              </div>
              <h4 className="font-bold text-stone-900 text-base">
                {tecnicoSeleccionado.primer_nombre} {tecnicoSeleccionado.primer_apellido}
              </h4>
              <p className="text-xs text-stone-500 font-mono">
                C.C. {tecnicoSeleccionado.numero_identificacion}
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Teléfono:</span>
                <span className="font-semibold text-stone-800">{tecnicoSeleccionado.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Correo:</span>
                <span className="font-semibold text-stone-800">{tecnicoSeleccionado.correo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Zona Agronómica:</span>
                <span className="font-semibold text-amber-800">{tecnicoSeleccionado.zona_asignada}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Fincas Supervisadas:</span>
                <span className="font-bold text-stone-900">{tecnicoSeleccionado.fincas_a_cargo} fincas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Especialidad:</span>
                <span className="font-medium text-stone-800 text-right">
                  {tecnicoSeleccionado.especialidad || 'Agrónomo de Campo'}
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

      {/* MODAL 4: EDITAR TÉCNICO */}
      {modalEditar && tecnicoEdicion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                Editar Técnico ({tecnicoEdicion.numero_identificacion})
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
                    value={tecnicoEdicion.primer_nombre}
                    onChange={(e) =>
                      setTecnicoEdicion({
                        ...tecnicoEdicion,
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
                    value={tecnicoEdicion.primer_apellido}
                    onChange={(e) =>
                      setTecnicoEdicion({
                        ...tecnicoEdicion,
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
                    value={tecnicoEdicion.telefono}
                    onChange={(e) =>
                      setTecnicoEdicion({ ...tecnicoEdicion, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={tecnicoEdicion.correo}
                    onChange={(e) =>
                      setTecnicoEdicion({ ...tecnicoEdicion, correo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Zona Asignada</label>
                <input
                  type="text"
                  value={tecnicoEdicion.zona_asignada}
                  onChange={(e) =>
                    setTecnicoEdicion({ ...tecnicoEdicion, zona_asignada: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
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
