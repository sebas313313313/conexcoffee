import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';

import {
  Search,
  Eye,
  Pencil,
  X,
  FlaskConical,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaLaboratorios,
  useCrearEmpresaLaboratorio,
  useActualizarEmpresaLaboratorio,
} from '../hooks/useEmpresaData';

export default function EmpresaLaboratoriosPage() {
  const labsQuery = useEmpresaLaboratorios();
  const laboratorios = labsQuery.data || [];
  const crearMutation = useCrearEmpresaLaboratorio();
  const actualizarMutation = useActualizarEmpresaLaboratorio();
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConsultar, setModalConsultar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);

  const [laboratorioSeleccionado, setLaboratorioSeleccionado] = useState(null);
  const [laboratorioEdicion, setLaboratorioEdicion] = useState(null);

  // Formulario nuevo laboratorio (Campos exactos del sistema original)
  const [nuevoLab, setNuevoLab] = useState({
    nit: '',
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    municipio: 'Cajibío',
    departamento: 'Cauca',
    certificaciones: 'CQI Q-Venue Certified / SCAA Campus',
    q_graders_activos: 2,
  });

  const [criterioConsulta, setCriterioConsulta] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);

  const term = searchTerm.toLowerCase();
  const labsFiltrados = laboratorios.filter((l) => {
    return (
      (l.nit || '').toLowerCase().includes(term) ||
      (l.nombre || '').toLowerCase().includes(term) ||
      (l.telefono || '').includes(term) ||
      (l.direccion || '').toLowerCase().includes(term)
    );
  });

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevoLab.nit || !nuevoLab.nombre || !nuevoLab.telefono) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    const nuevo = {
      id: Date.now(),
      ...nuevoLab,
      muestras_procesadas: 0,
      activo: true,
    };

    crearMutation.mutate(nuevo, {
      onSuccess: () => {
        setModalRegistrar(false);
        setNuevoLab({
          nit: '',
          nombre: '',
          telefono: '',
          correo: '',
          direccion: '',
          municipio: 'Cajibío',
          departamento: 'Cauca',
          certificaciones: 'CQI Q-Venue Certified / SCAA Campus',
          q_graders_activos: 2,
        });
      },
    });
  };

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    if (!laboratorioEdicion) return;

    actualizarMutation.mutate(laboratorioEdicion, {
      onSuccess: () => {
        setModalEditar(false);
      },
    });
  };

  const handleEjecutarConsulta = (e) => {
    e.preventDefault();
    const query = criterioConsulta.trim().toLowerCase();
    if (!query) {
      toast.error('Ingrese un NIT o nombre de laboratorio');
      return;
    }

    const encontrado = laboratorios.find(
      (l) => l.nit.toLowerCase().includes(query) || l.nombre.toLowerCase().includes(query)
    );

    if (encontrado) {
      setResultadoConsulta(encontrado);
      toast.success('Laboratorio encontrado');
    } else {
      setResultadoConsulta(null);
      toast.error('No se encontró laboratorio con ese criterio');
    }
  };

  const abrirEdicion = (l) => {
    setLaboratorioEdicion({ ...l });
    setModalEditar(true);
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Laboratorios de Calidad"
        subtitulo="Red de análisis sensorial, evaluación física gravimétrica y certificación de café"
        imagenPortada="/images/portadas/laboratorio.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de cada uno de tus laboratorios aliados."
        icono={FlaskConical}
        totalRegistros={laboratorios.length}
        textoBotonRegistrar="Registrar Laboratorio"
        textoBotonConsultar="Consultar Laboratorio"
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
            placeholder="Buscar por NIT, nombre o dirección..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Tabla Oficial de Laboratorios */}
      <QueryState query={labsQuery} />
      {/* Columnas: N°, NIT, Nombre, Teléfono, Acciones (Editar, Ver) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">N°</th>
                <th className="py-3.5 px-4">NIT</th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {labsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-stone-400">
                    No se encontraron laboratorios registrados con esos criterios.
                  </td>
                </tr>
              ) : (
                labsFiltrados.map((l, index) => (
                  <tr key={l.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center text-stone-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      {l.nit}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-stone-900">{l.nombre}</div>
                      <div className="text-[11px] text-stone-500">
                        {l.direccion || 'Sede Central'} • {l.municipio || 'Colombia'}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-stone-700">
                      {l.telefono}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEdicion(l)}
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                          title="Editar Laboratorio"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Ver */}
                        <button
                          type="button"
                          onClick={() => {
                            setLaboratorioSeleccionado(l);
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

      {/* MODAL 1: REGISTRAR LABORATORIO */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-700" />
                Registrar Laboratorio
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">NIT *</label>
                  <input
                    type="text"
                    required
                    placeholder="901234567-1"
                    value={nuevoLab.nit}
                    onChange={(e) => setNuevoLab({ ...nuevoLab, nit: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={nuevoLab.telefono}
                    onChange={(e) => setNuevoLab({ ...nuevoLab, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nombre del Laboratorio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio Central TecniCafé"
                  value={nuevoLab.nombre}
                  onChange={(e) => setNuevoLab({ ...nuevoLab, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="calidad@laboratorio.co"
                  value={nuevoLab.correo}
                  onChange={(e) => setNuevoLab({ ...nuevoLab, correo: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  required
                  placeholder="Km 3 Vía Cajibío"
                  value={nuevoLab.direccion}
                  onChange={(e) => setNuevoLab({ ...nuevoLab, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Municipio *</label>
                  <input
                    type="text"
                    required
                    value={nuevoLab.municipio}
                    onChange={(e) => setNuevoLab({ ...nuevoLab, municipio: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Departamento *</label>
                  <input
                    type="text"
                    required
                    value={nuevoLab.departamento}
                    onChange={(e) => setNuevoLab({ ...nuevoLab, departamento: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Certificaciones</label>
                <input
                  type="text"
                  value={nuevoLab.certificaciones}
                  onChange={(e) => setNuevoLab({ ...nuevoLab, certificaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
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

      {/* MODAL 2: CONSULTAR LABORATORIO */}
      {modalConsultar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-700" />
                Consultar Laboratorio
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
                  NIT o Nombre del Laboratorio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="NIT, nombre..."
                  value={criterioConsulta}
                  onChange={(e) => setCriterioConsulta(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                />
              </div>

              {resultadoConsulta && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-stone-800">
                  <div className="font-bold text-amber-950 text-sm">
                    {resultadoConsulta.nombre}
                  </div>
                  <div className="text-[11px] text-stone-600">
                    NIT {resultadoConsulta.nit} • {resultadoConsulta.telefono}
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

      {/* MODAL 3: DETALLE DEL LABORATORIO */}
      {modalDetalle && laboratorioSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-700" />
                Detalle del Laboratorio
              </h3>
              <button
                type="button"
                onClick={() => setModalDetalle(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Nombre:</span>
                <span className="font-bold text-stone-900">{laboratorioSeleccionado.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">NIT:</span>
                <span className="font-mono font-bold text-stone-800">{laboratorioSeleccionado.nit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Teléfono:</span>
                <span className="font-semibold text-stone-800">{laboratorioSeleccionado.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Correo:</span>
                <span className="font-semibold text-stone-800">{laboratorioSeleccionado.correo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ubicación:</span>
                <span className="font-semibold text-amber-800">
                  {laboratorioSeleccionado.direccion}, {laboratorioSeleccionado.municipio || 'Cauca'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Certificaciones:</span>
                <span className="font-medium text-stone-800 text-right">
                  {laboratorioSeleccionado.certificaciones || 'CQI Q-Venue Certified'}
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

      {/* MODAL 4: EDITAR LABORATORIO */}
      {modalEditar && laboratorioEdicion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-700" />
                Editar Laboratorio ({laboratorioEdicion.nit})
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
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={laboratorioEdicion.nombre}
                  onChange={(e) =>
                    setLaboratorioEdicion({ ...laboratorioEdicion, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={laboratorioEdicion.telefono}
                    onChange={(e) =>
                      setLaboratorioEdicion({ ...laboratorioEdicion, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={laboratorioEdicion.correo}
                    onChange={(e) =>
                      setLaboratorioEdicion({ ...laboratorioEdicion, correo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={laboratorioEdicion.direccion}
                  onChange={(e) =>
                    setLaboratorioEdicion({ ...laboratorioEdicion, direccion: e.target.value })
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
