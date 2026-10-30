import { useState, useRef } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  Pencil,
  Eye,
  X,
  Award,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminLaboratorios,
  useCrearSuperadminLaboratorio,
  useActualizarSuperadminLaboratorio,
} from '../hooks/useSuperadminData';

export default function LaboratoriosPage() {
  const query = useSuperadminLaboratorios();
  const laboratorios = query.data ?? [];
  const crearLaboratorio = useCrearSuperadminLaboratorio();
  const actualizarLaboratorio = useActualizarSuperadminLaboratorio();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const tableRef = useRef(null);

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [laboratorioActual, setLaboratorioActual] = useState(null);

  const [formData, setFormData] = useState({
    nit: '',
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    municipio: '',
    departamento: '',
    certificaciones: '',
  });

  const abrirModalCrear = () => {
    setFormData({
      nit: '',
      nombre: '',
      telefono: '',
      correo: '',
      direccion: '',
      municipio: '',
      departamento: '',
      certificaciones: '',
    });
    setModalRegistroAbierto(true);
  };

  const abrirModalEditar = (lab) => {
    setLaboratorioActual(lab);
    setFormData({
      nit: lab.nit || '',
      nombre: lab.nombre || '',
      telefono: lab.telefono || '',
      correo: lab.correo || '',
      direccion: lab.direccion || '',
      municipio: lab.municipio || '',
      departamento: lab.departamento || '',
      certificaciones: lab.certificaciones || '',
    });
    setModalEditarAbierto(true);
  };

  const abrirModalDetalles = (lab) => {
    setLaboratorioActual(lab);
    setModalDetalleAbierto(true);
  };

  const guardarCreacion = (e) => {
    e.preventDefault();
    const nuevo = {
      ...formData,
      muestrasAnalizadas: 0,
      activo: true,
    };
    crearLaboratorio.mutate(nuevo);
    setModalRegistroAbierto(false);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    actualizarLaboratorio.mutate({ ...laboratorioActual, ...formData });
    setModalEditarAbierto(false);
  };


  const departamentosUnicos = Array.from(
    new Set(laboratorios.map((l) => l.departamento).filter(Boolean))
  );

  const filtrados = laboratorios.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.nit.toLowerCase().includes(term) ||
      l.nombre.toLowerCase().includes(term) ||
      l.telefono.toLowerCase().includes(term) ||
      l.correo.toLowerCase().includes(term) ||
      (l.municipio && l.municipio.toLowerCase().includes(term));
    const matchesDepto =
      filtroDepartamento === 'todos' || l.departamento === filtroDepartamento;
    return matchesSearch && matchesDepto;
  });

  useTableEntranceAnimation(tableRef, [filtrados.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo con imagen laboratorio.jpg */}
      <ModuloCabecera
        titulo="Laboratorios"
        subtitulo="Centros de catación certificados y análisis de calidad física y sensorial"
        imagenPortada="/images/portadas/laboratorio.jpg"
        mensaje="En este módulo podrás gestionar y consultar los laboratorios acreditados para análisis de café."
        icono={FlaskConical}
        totalRegistros={filtrados.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Registrar Laboratorio"
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por NIT, nombre o correo…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filtroDepartamento}
            onChange={(e) => setFiltroDepartamento(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-surface-200 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todos los departamentos</option>
            {departamentosUnicos.map((depto) => (
              <option key={depto} value={depto}>
                {depto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Oficial (Nº, NIT, Nombre, Teléfono, Correo electrónico, Acciones) */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm text-left">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                <th scope="col" className="px-5 py-3.5 font-bold">NIT</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Nombre</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Teléfono</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Correo electrónico</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-surface-500">
                    No se encontraron laboratorios registrados.
                  </td>
                </tr>
              ) : (
                filtrados.map((lab, index) => (
                  <tr key={lab.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-surface-700">
                      {lab.nit}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-semibold text-surface-900 block">{lab.nombre}</span>
                        <span className="text-[11px] text-surface-400">{lab.municipio}, {lab.departamento}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {lab.telefono}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {lab.correo}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          icon={Pencil}
                          title="Editar Laboratorio"
                          variant="primary"
                          onClick={() => abrirModalEditar(lab)}
                        />
                        <ActionButton
                          icon={Eye}
                          title="Ver Laboratorio"
                          variant="view"
                          onClick={() => abrirModalDetalles(lab)}
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

      {/* MODAL REGISTRAR LABORATORIO */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Registrar Laboratorio</h3>
                  <p className="text-xs text-surface-500">Acreditación y datos del centro de análisis</p>
                </div>
              </div>
              <button
                onClick={() => setModalRegistroAbierto(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardarCreacion} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">NIT *</label>
                  <input
                    required
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                    placeholder="901456789-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Nombre del Laboratorio *</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Teléfono *</label>
                  <input
                    required
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Correo Electrónico *</label>
                  <input
                    required
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">Certificaciones / Acreditaciones</label>
                <input
                  type="text"
                  value={formData.certificaciones}
                  onChange={(e) => setFormData({ ...formData, certificaciones: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  placeholder="Ej. CQI Q-Venue, SCA Campus, Almacafé"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => setModalRegistroAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-terracota hover:bg-brand-terracota-dark text-white text-sm font-semibold shadow-md cursor-pointer"
                >
                  Guardar Laboratorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {modalDetalleAbierto && laboratorioActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{laboratorioActual.nombre}</h3>
                  <span className="text-xs text-surface-500">NIT {laboratorioActual.nit}</span>
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
                  <span className="font-semibold text-surface-800">{laboratorioActual.telefono}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Correo</span>
                  <span className="font-semibold text-surface-800">{laboratorioActual.correo}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Ubicación</span>
                  <span className="font-semibold text-surface-800">{laboratorioActual.municipio}, {laboratorioActual.departamento}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Muestras Analizadas</span>
                  <span className="font-semibold text-brand-terracota">{laboratorioActual.muestrasAnalizadas} cataciones</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Acreditación Oficial</span>
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  {laboratorioActual.certificaciones}
                </div>
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

      {/* MODAL EDITAR LABORATORIO */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Editar Laboratorio</h3>
                  <p className="text-xs text-surface-500">{laboratorioActual?.nombre}</p>
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
                  <label className="block text-xs font-bold text-surface-700 mb-1">NIT</label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                  <label className="block text-xs font-bold text-surface-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Certificaciones</label>
                  <input
                    type="text"
                    value={formData.certificaciones}
                    onChange={(e) => setFormData({ ...formData, certificaciones: e.target.value })}
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
                  Actualizar Laboratorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
