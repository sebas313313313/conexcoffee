import { useState, useRef } from 'react';
import {
  Coffee,
  Search,
  Filter,
  Eye,
  X,
  Layers,
} from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminFincas,
  useSuperadminLotes,
} from '../hooks/useSuperadminData';

export default function FincasPage() {
  const [pestanaActiva, setPestanaActiva] = useState('fincas');

  const fincasQuery = useSuperadminFincas();
  const fincas = fincasQuery.data ?? [];

  const lotesQuery = useSuperadminLotes();
  const lotes = lotesQuery.data ?? [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');

  const tableFincasRef = useRef(null);
  const tableLotesRef = useRef(null);

  const [modalDetalleFinca, setModalDetalleFinca] = useState(false);
  const [fincaActual, setFincaActual] = useState(null);

  const abrirDetalleFinca = (f) => {
    setFincaActual(f);
    setModalDetalleFinca(true);
  };

  const departamentosUnicos = Array.from(
    new Set(fincas.map((f) => f.departamento).filter(Boolean))
  );

  const fincasFiltradas = fincas.filter((f) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.nombre.toLowerCase().includes(term) ||
      f.municipio.toLowerCase().includes(term) ||
      f.caficultor.toLowerCase().includes(term);
    const matchesDepto =
      filtroDepartamento === 'todos' || f.departamento === filtroDepartamento;
    return matchesSearch && matchesDepto;
  });

  const lotesFiltrados = lotes.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      l.nombreLote.toLowerCase().includes(term) ||
      l.finca.toLowerCase().includes(term) ||
      l.variedadCafe.toLowerCase().includes(term)
    );
  });

  useTableEntranceAnimation(tableFincasRef, [fincasFiltradas.length, pestanaActiva]);
  useTableEntranceAnimation(tableLotesRef, [lotesFiltrados.length, pestanaActiva]);

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica a components.cabecera-modulo con imagen finca.jpg */}
      <ModuloCabecera
        titulo="Fincas y Lotes"
        subtitulo="Registro catastral cafetero, altimetría y trazabilidad de parcelas productivas"
        imagenPortada="/images/portadas/finca.jpg"
        mensaje="Consulta y supervisión de las fincas y lotes registrados por los productores y las empresas."
        icono={Coffee}
        totalRegistros={pestanaActiva === 'fincas' ? fincasFiltradas.length : lotesFiltrados.length}
      />

      <QueryState query={fincasQuery} />

      {/* Pestañas Submódulos (Fincas y Lotes) */}
      <div className="flex items-center justify-between border-b border-surface-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPestanaActiva('fincas')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              pestanaActiva === 'fincas'
                ? 'border-brand-terracota text-brand-terracota'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <Coffee className="h-4 w-4" />
            Fincas Registradas ({fincas.length})
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('lotes')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              pestanaActiva === 'lotes'
                ? 'border-brand-terracota text-brand-terracota'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Lotes y Variedades ({lotes.length})
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            type="text"
            placeholder={
              pestanaActiva === 'fincas'
                ? 'Buscar por nombre, municipio o caficultor…'
                : 'Buscar por lote, finca o variedad…'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        {pestanaActiva === 'fincas' && (
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
        )}
      </div>

      {/* TABLA OFICIAL FINCAS: Nº, Nombre, Altura, Área café, Acciones */}
      {pestanaActiva === 'fincas' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableFincasRef} className="w-full text-sm text-left">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Nombre</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Altura</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Área café</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Propietario</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {fincasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-surface-500">
                      No se encontraron fincas registradas.
                    </td>
                  </tr>
                ) : (
                  fincasFiltradas.map((f, index) => (
                    <tr key={f.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                        {index + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <span className="font-semibold text-surface-900 block">{f.nombre}</span>
                          <span className="text-[11px] text-surface-400">{f.municipio}, {f.departamento}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-surface-700">
                        {f.altura.toLocaleString('es-CO')} msnm
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-surface-800">
                        {f.areaCafe.toLocaleString('es-CO', { minimumFractionDigits: 2 })} ha
                      </td>
                      <td className="px-5 py-3.5 text-surface-600 text-xs">
                        {f.caficultor}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={Eye}
                            title="Ver Finca"
                            variant="view"
                            onClick={() => abrirDetalleFinca(f)}
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
      )}

      {/* TABLA OFICIAL LOTES */}
      {pestanaActiva === 'lotes' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableLotesRef} className="w-full text-sm text-left">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-bold w-12 text-center">Nº</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Lote</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Finca</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Variedad de Café</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Proceso</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Área (ha)</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {lotesFiltrados.map((l, index) => (
                  <tr key={l.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-surface-500 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-900">
                      {l.nombreLote}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {l.finca}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-brand-terracota">
                      {l.variedadCafe}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 text-xs">
                      {l.proceso}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-surface-800">
                      {l.area.toLocaleString('es-CO', { minimumFractionDigits: 2 })} ha
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {l.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLES FINCA */}
      {modalDetalleFinca && fincaActual && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-tint text-brand-terracota flex items-center justify-center">
                  <Coffee className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-900">{fincaActual.nombre}</h3>
                  <span className="text-xs text-surface-500">{fincaActual.municipio}, {fincaActual.departamento}</span>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleFinca(false)}
                className="p-1 rounded-lg text-surface-400 hover:bg-surface-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200 text-xs">
                <div>
                  <span className="text-surface-500 block">Propietario</span>
                  <span className="font-semibold text-surface-800">{fincaActual.caficultor}</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Altimetría</span>
                  <span className="font-semibold text-brand-terracota">{fincaActual.altura} msnm</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Área Café</span>
                  <span className="font-semibold text-surface-800">{fincaActual.areaCafe} ha</span>
                </div>
                <div>
                  <span className="text-surface-500 block">Área Total</span>
                  <span className="font-semibold text-surface-800">{fincaActual.areaTotal} ha</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-surface-700 block mb-1">Variedades Sembradas</span>
                <div className="flex flex-wrap gap-1.5">
                  {fincaActual.variedades.map((v) => (
                    <span key={v} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-tint text-brand-terracota border border-brand-terracota/20">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalDetalleFinca(false)}
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
