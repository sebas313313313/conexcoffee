import { useState } from 'react';
import toast from 'react-hot-toast';
import { ModuloCabecera } from '@/components/data-display';

import {
  Search,
  Eye,
  X,
  Archive,
  FlaskConical,
} from 'lucide-react';
import { QueryState } from '@/components/feedback';
import {
  useEmpresaMuestras,
  useCrearEmpresaMuestra,
  useActualizarEmpresaMuestra,
  useEmpresaLaboratorios,
} from '../hooks/useEmpresaData';

export default function EmpresaMuestrasPage() {
  const muestrasQuery = useEmpresaMuestras();
  const muestras = muestrasQuery.data || [];
  const laboratoriosQuery = useEmpresaLaboratorios();
  const laboratorios = laboratoriosQuery.data || [];
  const crearMutation = useCrearEmpresaMuestra();
  const actualizarMutation = useActualizarEmpresaMuestra();
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAsignarLab, setModalAsignarLab] = useState(false);

  const [muestraSeleccionada, setMuestraSeleccionada] = useState(null);
  const [laboratorioDestino, setLaboratorioDestino] = useState(
    laboratorios[0]?.nombre || 'Laboratorio Central TecniCafé'
  );

  // Formulario nueva muestra
  const [nuevaMuestra, setNuevaMuestra] = useState({
    codigo: '',
    lote_origen: '',
    caficultor: '',
    variedad: 'Pink Bourbon',
    fecha: new Date().toISOString().split('T')[0],
    peso_g: 350.0,
    humedad: 10.8,
    factor_rendimiento: 88.5,
    laboratorio: 'Laboratorio Central TecniCafé',
  });

  const muestrasFiltradas = muestras.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.codigo.toLowerCase().includes(term) ||
      m.lote_origen.toLowerCase().includes(term) ||
      m.caficultor.toLowerCase().includes(term) ||
      m.variedad.toLowerCase().includes(term)
    );
  });

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevaMuestra.codigo || !nuevaMuestra.lote_origen || !nuevaMuestra.caficultor) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    const nuevo = {
      id: Date.now(),
      ...nuevaMuestra,
      peso_g: Number(nuevaMuestra.peso_g) || 350,
      humedad: Number(nuevaMuestra.humedad) || 10.5,
      factor_rendimiento: Number(nuevaMuestra.factor_rendimiento) || 88.5,
      puntaje_sca: null,
      estado: 'En Evaluación',
    };

    crearMutation.mutate(nuevo, {
      onSuccess: () => {
        setModalRegistrar(false);
        setNuevaMuestra({
          codigo: '',
          lote_origen: '',
          caficultor: '',
          variedad: 'Pink Bourbon',
          fecha: new Date().toISOString().split('T')[0],
          peso_g: 350.0,
          humedad: 10.8,
          factor_rendimiento: 88.5,
          laboratorio: 'Laboratorio Central TecniCafé',
        });
      },
    });
  };

  const handleAsignarLaboratorio = (e) => {
    e.preventDefault();
    if (!muestraSeleccionada) return;

    actualizarMutation.mutate(
      { ...muestraSeleccionada, laboratorio: laboratorioDestino, estado: 'En Análisis' },
      {
        onSuccess: () => {
          setModalAsignarLab(false);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Muestras de Café"
        subtitulo="Control gravimétrico, humedad, factor de rendimiento y trazabilidad sensorial"
        imagenPortada="/images/portadas/analisis-sensorial.jpg"
        mensaje="En este módulo podrás registrar y gestionar la información detallada de las muestras recibidas de tus caficultores."
        icono={Archive}
        totalRegistros={muestras.length}
        textoBotonRegistrar="Registrar Muestra"
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
            placeholder="Buscar por código, caficultor o variedad..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
          />
        </div>
      </div>

      {/* Tabla Oficial de Muestras */}
      <QueryState query={muestrasQuery} />
      {/* Columnas: N°, Código Pre-oferta, Fecha, Peso (g), Humedad (%), Laboratorio, Acciones */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">N°</th>
                <th className="py-3.5 px-4">Código Muestra / Lote</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4 text-center">Peso (g)</th>
                <th className="py-3.5 px-4 text-center">Humedad (%)</th>
                <th className="py-3.5 px-4">Laboratorio</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {muestrasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-stone-400">
                    No se encontraron muestras registradas con esos criterios.
                  </td>
                </tr>
              ) : (
                muestrasFiltradas.map((m, index) => (
                  <tr key={m.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-4 text-center text-stone-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-stone-900">
                      <div>{m.codigo}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {m.lote_origen} • {m.caficultor}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-stone-600 font-mono">
                      {m.fecha}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-stone-900">
                      {m.peso_g} g
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-stone-800">
                      {m.humedad}%
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-stone-800">
                        {m.laboratorio || 'Pendiente de asignar'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          m.estado === 'Calificada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.estado === 'En Análisis'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {m.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Asignar Laboratorio */}
                        <button
                          type="button"
                          onClick={() => {
                            setMuestraSeleccionada(m);
                            setLaboratorioDestino(
                              m.laboratorio || laboratorios[0]?.nombre || 'Laboratorio Central TecniCafé'
                            );
                            setModalAsignarLab(true);
                          }}
                          className="p-1.5 text-amber-800 hover:text-amber-900 hover:bg-amber-50 rounded-lg"
                          title="Asignar Laboratorio"
                        >
                          <FlaskConical className="w-4 h-4" />
                        </button>

                        {/* Ver Detalle */}
                        <button
                          type="button"
                          onClick={() => {
                            setMuestraSeleccionada(m);
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

      {/* MODAL 1: REGISTRAR MUESTRA */}
      {modalRegistrar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Archive className="w-5 h-5 text-amber-700" />
                Registrar Muestra de Café
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Código de Muestra *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MUE-EMP-2026-095"
                    value={nuevaMuestra.codigo}
                    onChange={(e) => setNuevaMuestra({ ...nuevaMuestra, codigo: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Código Pre-oferta / Lote *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PRE-EMP-007"
                    value={nuevaMuestra.lote_origen}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, lote_origen: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Caficultor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del caficultor"
                    value={nuevaMuestra.caficultor}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, caficultor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Variedad *</label>
                  <input
                    type="text"
                    required
                    value={nuevaMuestra.variedad}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, variedad: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Peso (g) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={nuevaMuestra.peso_g}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, peso_g: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Humedad (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={nuevaMuestra.humedad}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, humedad: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Rendimiento *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={nuevaMuestra.factor_rendimiento}
                    onChange={(e) =>
                      setNuevaMuestra({ ...nuevaMuestra, factor_rendimiento: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Laboratorio Destino
                </label>
                <select
                  value={nuevaMuestra.laboratorio}
                  onChange={(e) =>
                    setNuevaMuestra({ ...nuevaMuestra, laboratorio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white"
                >
                  {laboratorios.map((l) => (
                    <option key={l.id} value={l.nombre}>
                      {l.nombre}
                    </option>
                  ))}
                </select>
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
                  Guardar Muestra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASIGNAR A LABORATORIO */}
      {modalAsignarLab && muestraSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-700" />
                  Asignar a Laboratorio
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  Muestra {muestraSeleccionada.codigo} ({muestraSeleccionada.variedad})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAsignarLab(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAsignarLaboratorio} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Seleccione el Laboratorio Aliado *
                </label>
                <select
                  required
                  value={laboratorioDestino}
                  onChange={(e) => setLaboratorioDestino(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-white font-medium text-stone-800"
                >
                  {laboratorios.map((l) => (
                    <option key={l.id} value={l.nombre}>
                      {l.nombre} ({l.direccion})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                La muestra física pasará al estado <strong>En Análisis</strong> y los catadores Q-Grader del laboratorio podrán emitir la calificación oficial SCA.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalAsignarLab(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 shadow-sm"
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DETALLE DE LA MUESTRA */}
      {modalDetalle && muestraSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-mono">
                  {muestraSeleccionada.codigo}
                </span>
                <h3 className="font-bold text-stone-900 text-base mt-1">
                  Ficha de Control Gravimétrico
                </h3>
              </div>
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
                <span className="text-stone-500">Lote Origen:</span>
                <span className="font-mono font-bold text-stone-900">{muestraSeleccionada.lote_origen}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Caficultor:</span>
                <span className="font-semibold text-stone-800">{muestraSeleccionada.caficultor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Variedad:</span>
                <span className="font-semibold text-stone-800">{muestraSeleccionada.variedad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Peso de Muestra:</span>
                <span className="font-bold text-stone-900">{muestraSeleccionada.peso_g} gramos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Humedad Medida:</span>
                <span className="font-bold text-sky-700">{muestraSeleccionada.humedad}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Laboratorio:</span>
                <span className="font-semibold text-amber-900">{muestraSeleccionada.laboratorio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Puntaje SCA Obtenido:</span>
                <span className="font-bold text-amber-900">
                  {muestraSeleccionada.puntaje_sca ? `${muestraSeleccionada.puntaje_sca} SCA` : 'En proceso'}
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
    </div>
  );
}
