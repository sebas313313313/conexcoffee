import { useState, useRef } from 'react';
import {
  Building2,
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
  useSuperadminEmpresas,
  useCrearSuperadminEmpresa,
  useActualizarSuperadminEmpresa,
} from '../hooks/useSuperadminData';
import { CrearEmpresaModal } from '@/components/usuarios';

export default function EmpresasPage() {
  const query = useSuperadminEmpresas();
  const empresas = query.data ?? [];
  const crearEmpresa = useCrearSuperadminEmpresa();
  const actualizarEmpresa = useActualizarSuperadminEmpresa();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const tableRef = useRef(null);

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [empresaActual, setEmpresaActual] = useState(null);

  const [formData, setFormData] = useState({
    nit: '',
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
    municipio: '',
    departamento: '',
    descripcion: '',
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
      descripcion: '',
    });
    setModalRegistroAbierto(true);
  };

  const abrirModalEditar = (emp) => {
    setEmpresaActual(emp);
    setFormData({
      nit: emp.nit || '',
      nombre: emp.nombre || '',
      telefono: emp.telefono || '',
      correo: emp.correo || '',
      direccion: emp.direccion || '',
      municipio: emp.municipio || '',
      departamento: emp.departamento || '',
      descripcion: emp.descripcion || '',
    });
    setModalEditarAbierto(true);
  };

  const abrirModalDetalles = (emp) => {
    setEmpresaActual(emp);
    setModalDetalleAbierto(true);
  };

  const guardarCreacion = (data) => {
    const nueva = {
      ...data,
      caficultoresCount: 0,
      ofertasActivas: 0,
    };
    crearEmpresa.mutate(nueva);
    setModalRegistroAbierto(false);
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    actualizarEmpresa.mutate({ ...empresaActual, ...formData });
    setModalEditarAbierto(false);
  };


  const departamentosUnicos = Array.from(
    new Set(empresas.map((e) => e.departamento).filter(Boolean))
  );

  const filtradas = empresas.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      emp.nit.toLowerCase().includes(term) ||
      emp.nombre.toLowerCase().includes(term) ||
      emp.telefono.toLowerCase().includes(term) ||
      emp.correo.toLowerCase().includes(term) ||
      (emp.municipio && emp.municipio.toLowerCase().includes(term));
    const matchesDepto =
      filtroDepartamento === 'todos' || emp.departamento === filtroDepartamento;
    return matchesSearch && matchesDepto;
  });

  useTableEntranceAnimation(tableRef, [filtradas.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo */}
      <ModuloCabecera
        titulo="Empresas"
        subtitulo="Empresas tostadoras, exportadoras y comercializadoras regionales registradas"
        imagenPortada="/images/portadas/empresa.jpg"
        mensaje="En este módulo podrás gestionar la información de cada una de las empresas."
        icono={Building2}
        totalRegistros={filtradas.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Registrar Empresa"
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

      {/* Tabla Oficial (Nº, NIT, Nombre, Teléfono, Correo, Acciones) */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm text-left">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                <th scope="col" className="px-5 py-3.5 font-bold">NIT</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Nombre</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Teléfono</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Correo</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-surface-500">
                    No se encontraron empresas registradas.
                  </td>
                </tr>
              ) : (
                filtradas.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-surface-700">
                      {emp.nit}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <span className="font-semibold text-surface-900 block">
                          {emp.nombre}
                        </span>
                        <span className="text-[11px] text-surface-400">
                          {emp.municipio}, {emp.departamento}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {emp.telefono}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {emp.correo}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          icon={Pencil}
                          title="Editar Empresa"
                          variant="primary"
                          onClick={() => abrirModalEditar(emp)}
                        />
                        <ActionButton
                          icon={Eye}
                          title="Ver Empresa"
                          variant="view"
                          onClick={() => abrirModalDetalles(emp)}
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

      {/* MODAL REGISTRAR EMPRESA */}
      <CrearEmpresaModal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onSubmit={guardarCreacion}
        loading={crearEmpresa.isPending}
      />

      {/* MODAL EDITAR EMPRESA */}
      {modalEditarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Editar Empresa</h3>
                  <p className="text-xs text-surface-500">{empresaActual?.nombre}</p>
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
                  <label className="block text-xs font-bold text-surface-700 mb-1">Razón Social</label>
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
                  Actualizar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {modalDetalleAbierto && empresaActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{empresaActual.nombre}</h3>
                  <span className="text-xs text-surface-500">NIT {empresaActual.nit}</span>
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
                  <span className="font-semibold text-surface-800">{empresaActual.telefono}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Correo</span>
                  <span className="font-semibold text-surface-800">{empresaActual.correo}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Ubicación</span>
                  <span className="font-semibold text-surface-800">{empresaActual.municipio}, {empresaActual.departamento}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Dirección</span>
                  <span className="font-semibold text-surface-800">{empresaActual.direccion}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Descripción</span>
                <p className="text-xs text-surface-600 bg-surface-50 p-2.5 rounded-lg border border-surface-100 leading-relaxed">
                  {empresaActual.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-brand-tint p-3 rounded-xl border border-brand-terracota/20 text-center">
                  <span className="text-2xl font-extrabold text-brand-terracota">{empresaActual.caficultoresCount}</span>
                  <div className="text-xs font-semibold text-surface-600">Caficultores Vinculados</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                  <span className="text-2xl font-extrabold text-emerald-700">{empresaActual.ofertasActivas}</span>
                  <div className="text-xs font-semibold text-surface-600">Ofertas en Mercado</div>
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
    </div>
  );
}
