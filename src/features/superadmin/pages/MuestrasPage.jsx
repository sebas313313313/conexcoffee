import { useState, useRef } from 'react';
import {
  Archive,
  Search,
  Filter,
  Eye,
  X,
  FlaskConical,
  Check,
  Droplets,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminMuestras,
  useCrearSuperadminMuestra,
  useActualizarSuperadminMuestra,
} from '../hooks/useSuperadminData';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

export default function MuestrasPage() {
  const query = useSuperadminMuestras();
  const muestras = query.data ?? [];
  const crearMuestra = useCrearSuperadminMuestra();
  const actualizarMuestra = useActualizarSuperadminMuestra();
  const { laboratorios = [] } = useSuperAdmin();
  const LABORATORIOS_DISPONIBLES =
    laboratorios.length > 0
      ? laboratorios.map((l) => l.nombre)
      : [
          'Laboratorio Central TecniCafé',
          'Laboratorio de Calidad Sur Huila',
          'Centro Sensorial Café Nariño',
        ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroLaboratorio, setFiltroLaboratorio] = useState('todos');
  const tableRef = useRef(null);

  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [muestraActual, setMuestraActual] = useState(null);

  const [formData, setFormData] = useState({
    codigoPreoferta: '',
    fecha: new Date().toISOString().split('T')[0],
    peso: '',
    humedad: '',
    factorRendimiento: '',
    caficultor: '',
    finca: '',
    variedad: '',
    laboratorio: '',
  });

  const abrirModalCrear = () => {
    setFormData({
      codigoPreoferta: `PRE-${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: new Date().toISOString().split('T')[0],
      peso: '',
      humedad: '',
      factorRendimiento: '',
      caficultor: '',
      finca: '',
      variedad: 'Castillo',
      laboratorio: '',
    });
    setModalRegistroAbierto(true);
  };

  const abrirModalAsignar = (m) => {
    setMuestraActual(m);
    setModalAsignarAbierto(true);
  };

  const abrirModalDetalles = (m) => {
    setMuestraActual(m);
    setModalDetalleAbierto(true);
  };

  const guardarCreacion = (e) => {
    e.preventDefault();

    const nueva = {
      ...formData,
      peso: Number(formData.peso),
      humedad: Number(formData.humedad),
      factorRendimiento: Number(formData.factorRendimiento || 88),
      estado: formData.laboratorio ? 'En Análisis' : 'Pendiente Laboratorio',
    };
    crearMuestra.mutate(nueva);
    setModalRegistroAbierto(false);
  };

  const asignarLaboratorio = (nombreLab) => {
    actualizarMuestra.mutate({
      ...muestraActual,
      laboratorio: nombreLab,
      estado: 'En Análisis',
    });
    setModalAsignarAbierto(false);
  };


  const filtradas = muestras.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.codigoPreoferta.toLowerCase().includes(term) ||
      m.caficultor.toLowerCase().includes(term) ||
      m.variedad.toLowerCase().includes(term) ||
      (m.laboratorio && m.laboratorio.toLowerCase().includes(term));

    if (filtroLaboratorio === 'con_lab') return matchesSearch && m.laboratorio;
    if (filtroLaboratorio === 'sin_lab') return matchesSearch && !m.laboratorio;
    return matchesSearch;
  });

  useTableEntranceAnimation(tableRef, [filtradas.length]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo */}
      <ModuloCabecera
        titulo="Muestras de Café"
        subtitulo="Recepción, registro gravimétrico y trazabilidad de muestras para análisis físico y sensorial"
        imagenPortada="/images/portadas/analisis-sensorial.jpg"
        mensaje="Gestión de la información de las muestras recibidas y evaluadas."
        icono={Archive}
        totalRegistros={filtradas.length}
        onRegistrar={abrirModalCrear}
        textoBotonRegistrar="Registrar Muestra"
      />

      <QueryState query={query} />

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder="Buscar por código, caficultor o variedad…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-surface-400 shrink-0" />
          <select
            value={filtroLaboratorio}
            onChange={(e) => setFiltroLaboratorio(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-surface-200 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer"
          >
            <option value="todos">Todas las muestras</option>
            <option value="con_lab">Con laboratorio asignado</option>
            <option value="sin_lab">Sin laboratorio asignado</option>
          </select>
        </div>
      </div>

      {/* Tabla Oficial (Nº, Código/lote, Fecha, Peso (g), Humedad, Acciones) */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full text-sm text-left">
            <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Código / Lote</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Fecha</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Peso (g)</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Humedad</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Laboratorio</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-surface-500">
                    No se encontraron muestras registradas.
                  </td>
                </tr>
              ) : (
                filtradas.map((m, index) => (
                  <tr key={m.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-surface-900 text-xs">{m.codigoPreoferta}</span>
                        <span className="text-[11px] text-surface-500">{m.caficultor} — {m.variedad}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {m.fecha}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-800">
                      {Number(m.pesoNum ?? parseFloat(m.peso) ?? 350).toLocaleString('es-CO', { minimumFractionDigits: 1 })} g
                    </td>
                    <td className="px-5 py-3.5 font-medium text-surface-700">
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        {Number(m.humedadNum ?? parseFloat(m.humedad) ?? 11.2).toFixed(1)}%
                      </span>

                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {m.laboratorio ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FlaskConical className="h-3 w-3" />
                          {m.laboratorio}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Sin Laboratorio
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Asignar laboratorio si aún no tiene */}
                        {!m.laboratorio && (
                          <ActionButton
                            icon={FlaskConical}
                            title="Asignar Laboratorio"
                            variant="success"
                            onClick={() => abrirModalAsignar(m)}
                          />
                        )}
                        <ActionButton
                          icon={Eye}
                          title="Ver Muestra"
                          variant="view"
                          onClick={() => abrirModalDetalles(m)}
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

      {/* MODAL REGISTRAR MUESTRA */}
      {modalRegistroAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-surface-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <Archive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">Registrar Muestra</h3>
                  <p className="text-xs text-surface-500">Recepción y pesaje de lote muestra</p>
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
                  <label className="block text-xs font-bold text-surface-700 mb-1">Código Lote/Preoferta *</label>
                  <input
                    required
                    type="text"
                    value={formData.codigoPreoferta}
                    onChange={(e) => setFormData({ ...formData, codigoPreoferta: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Fecha de Recepción *</label>
                  <input
                    required
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Peso Muestra (gramos) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                    placeholder="Ej. 350"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Humedad (%) *</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    value={formData.humedad}
                    onChange={(e) => setFormData({ ...formData, humedad: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                    placeholder="Ej. 10.8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Caficultor *</label>
                  <input
                    required
                    type="text"
                    value={formData.caficultor}
                    onChange={(e) => setFormData({ ...formData, caficultor: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                    placeholder="Nombre del productor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">Variedad de Café</label>
                  <input
                    type="text"
                    value={formData.variedad}
                    onChange={(e) => setFormData({ ...formData, variedad: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                    placeholder="Ej. Pink Bourbon, Geisha"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">Laboratorio Asignado</label>
                <select
                  value={formData.laboratorio}
                  onChange={(e) => setFormData({ ...formData, laboratorio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-surface-200"
                >
                  <option value="">Dejar pendiente para asignación</option>
                  {LABORATORIOS_DISPONIBLES.map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
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
                  Guardar Muestra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR LABORATORIO */}
      {modalAsignarAbierto && muestraActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-surface-900">Asignar Laboratorio</h3>
              </div>
              <button
                onClick={() => setModalAsignarAbierto(false)}
                className="p-1 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-surface-600 my-3">
              Seleccione el laboratorio para realizar la catación de la muestra{' '}
              <strong className="text-surface-900">{muestraActual.codigoPreoferta}</strong>.
            </p>

            <div className="space-y-2 mt-4">
              {LABORATORIOS_DISPONIBLES.map((lab) => (
                <button
                  key={lab}
                  onClick={() => asignarLaboratorio(lab)}
                  className="w-full text-left p-3 rounded-xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="text-sm font-semibold text-surface-800 group-hover:text-emerald-700">
                    {lab}
                  </span>
                  <Check className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {modalDetalleAbierto && muestraActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <Archive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{muestraActual.codigoPreoferta}</h3>
                  <span className="text-xs text-surface-500">{muestraActual.caficultor} — {muestraActual.variedad}</span>
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
                  <span className="text-surface-500 block">Fecha Muestreo</span>
                  <span className="font-semibold text-surface-800">{muestraActual.fecha}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Peso Muestra</span>
                  <span className="font-semibold text-surface-800">{muestraActual.peso} g</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Humedad Gravimétrica</span>
                  <span className="font-semibold text-blue-600">{muestraActual.humedad}%</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Factor Rendimiento</span>
                  <span className="font-semibold text-surface-800">{muestraActual.factorRendimiento}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Laboratorio Responsable</span>
                <p className="text-xs text-surface-800 bg-surface-50 p-2.5 rounded-lg border border-surface-100 font-medium">
                  {muestraActual.laboratorio || 'Aún no asignado a ningún centro de catación'}
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
    </div>
  );
}
