import { useState } from 'react';
import { Settings, Ship } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card } from '@/components/ui';
import { ModalBase } from '@/components/modals';
import useAuthStore from '@/store/useAuthStore';
import { useActualizarEmpresaContenedor, useEmpresaContenedores, useEmpresaOfertas } from '../hooks/useEmpresaData';
import ConfigurarOfertaModal from '../components/ConfigurarOfertaModal';
import { calcularEmpaque, esOfertaAceptada } from '../lib/configuracionOferta';

const kg = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const sca = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const espacio = (contenedor) => Number(contenedor.capacidad_total_kg) - Number(contenedor.cantidad_cafe_kg ?? 0);

const obtenerProductor = (item) =>
  item.productor ||
  item.caficultor_nombre ||
  (typeof item.caficultor === 'string' ? item.caficultor : item.caficultor?.nombre) ||
  'Sin productor asignado';

const obtenerPuntajeSca = (item) => {
  const valor = Number(item.puntaje_sca ?? item.puntajeSca ?? item.puntuacion_sca_global);
  return Number.isFinite(valor) && valor > 0 ? `${sca.format(valor)} pts` : 'Sin registrar';
};

function leerConfiguraciones(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? {};
  } catch {
    return {};
  }
}

function ConfigurarOfertas({ empresaId }) {
  const ofertas = useEmpresaOfertas();
  const contenedores = useEmpresaContenedores();
  const actualizarContenedor = useActualizarEmpresaContenedor();
  const clave = `empresa:configuracion-ofertas:v1:${empresaId}`;
  const [configuraciones, setConfiguraciones] = useState(() => leerConfiguraciones(clave));
  const [editar, setEditar] = useState(null);
  const [asignar, setAsignar] = useState(null);
  const [destino, setDestino] = useState('');
  const [guardando, setGuardando] = useState(false);
  const aceptadas = (ofertas.data ?? []).filter((item) => esOfertaAceptada(item)
    && (!item.empresa_aliada_asignada_id || item.empresa_aliada_asignada_id === empresaId));
  const disponibles = (contenedores.data ?? []).filter((item) => item.empresa_exportadora_id === empresaId
    && item.estadoLogistico === 'ABIERTO_RECOLECCION'
    && asignar && espacio(item) >= Number(asignar.cantidad_kg));

  const guardarConfiguracion = (id, configuracion) => {
    const siguientes = { ...configuraciones, [id]: configuracion };
    setConfiguraciones(siguientes);
    try {
      localStorage.setItem(clave, JSON.stringify(siguientes));
    } catch {
      toast.error('La configuración solo estará disponible mientras esta pantalla siga abierta.');
    }
  };

  const confirmarAsignacion = async (event) => {
    event.preventDefault();
    if (guardando || !asignar) return;
    const configuracion = configuraciones[asignar.id];
    const contenedor = disponibles.find((item) => String(item.id) === destino);
    if (!configuracion || configuracion.contenedorId || !contenedor) return;
    const ofertasPrevias = contenedor.ofertas_asignadas ?? [];
    if (ofertasPrevias.some((item) => item.id === asignar.id || item.codigo === asignar.codigo)) {
      toast.error('La oferta ya figura en ese contenedor.');
      return;
    }
    const peso = Number(asignar.cantidad_kg);
    const nuevoPeso = Number(contenedor.cantidad_cafe_kg ?? 0) + peso;
    const { sacos } = calcularEmpaque(peso, configuracion.empaqueKg);
    setGuardando(true);
    try {
      await actualizarContenedor.mutateAsync({
        id: contenedor.id,
        payload: {
          kilos_reservados: nuevoPeso,
          cantidad_cafe_kg: nuevoPeso,
          ofertas_asignadas: [...ofertasPrevias, {
            id: asignar.id, codigo: asignar.codigo, variedad: asignar.variedad, peso_kg: peso, sacos,
          }],
        },
      });
      guardarConfiguracion(asignar.id, { ...configuracion, contenedorId: contenedor.id, contenedorCodigo: contenedor.codigo });
      setAsignar(null);
    } catch {
      // El provider muestra el error y permite reintentar con la misma selección.
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold text-surface-900">Configurar oferta</h1>
        <p className="mt-1 text-sm text-surface-600">Confirma el precio y el empaque de las ofertas aceptadas antes de asignarlas.</p>
      </header>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-200 bg-surface-50 text-xs text-surface-600">
              <tr>{['Código', 'Variedad', 'Peso', 'Puntaje SCA', 'Productor', 'Acciones'].map((columna) => (
                <th key={columna} scope="col" className="px-3 py-3">{columna}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {aceptadas.map((item) => {
                const config = configuraciones[item.id];
                return (
                  <tr key={item.id}>
                    <td className="px-3 py-3 font-mono font-semibold text-surface-900">{item.codigo}</td>
                    <td className="px-3 py-3">{item.variedad}</td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums">{kg.format(item.cantidad_kg)} kg</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand-terracota tabular-nums">
                        {obtenerPuntajeSca(item)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-surface-800">{obtenerProductor(item)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" disabled={Boolean(config?.contenedorId)} onClick={() => setEditar(item)}>
                          <Settings className="h-4 w-4" aria-hidden="true" /> Configurar
                        </Button>
                        <Button size="sm" disabled={!config || Boolean(config.contenedorId) || Number(item.cantidad_kg) <= 0}
                          onClick={() => { setDestino(''); setAsignar(item); }}>
                          <Ship className="h-4 w-4" aria-hidden="true" /> Asignar a contenedor marítimo
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-surface-600">
                        {config?.contenedorId ? `Contenedor ${config.contenedorCodigo}`
                          : config ? 'Configuración aceptada' : 'Pendiente de configurar'}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {!aceptadas.length && (
                <tr><td colSpan={6} className="px-3 py-7 text-center text-surface-600">
                  {ofertas.isLoading ? 'Cargando ofertas…' : ofertas.error ? 'No se pudieron cargar las ofertas.' : 'No hay ofertas aceptadas.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-surface-600">La configuración y el detalle de asignación se conservan en este navegador.</p>
      </Card>
      {editar && (
        <ConfigurarOfertaModal oferta={editar} configuracion={configuraciones[editar.id]} onClose={() => setEditar(null)}
          onConfirmar={(configuracion) => {
            guardarConfiguracion(editar.id, configuracion);
            setEditar(null);
          }} />
      )}
      {asignar && (
        <ModalBase isOpen onClose={() => { if (!guardando) setAsignar(null); }}
          title={`Asignar a contenedor · ${asignar.codigo}`} size="lg">
          <form onSubmit={confirmarAsignacion} className="space-y-4">
            <label className="block text-sm font-semibold text-surface-700">Contenedor marítimo
              <select required disabled={guardando || !disponibles.length} value={destino} onChange={(event) => setDestino(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-300 bg-white px-3 py-2">
                <option value="">Selecciona un contenedor</option>
                {disponibles.map((item) => (
                  <option key={item.id} value={item.id}>{item.codigo} · {item.pais_destino} · {kg.format(espacio(item))} kg libres</option>
                ))}
              </select>
            </label>
            {!disponibles.length && <p className="text-sm text-surface-600">No hay contenedores abiertos con capacidad suficiente para esta oferta.</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" disabled={guardando} onClick={() => setAsignar(null)}>Cancelar</Button>
              <Button type="submit" disabled={!destino} loading={guardando}>Confirmar asignación</Button>
            </div>
          </form>
        </ModalBase>
      )}
    </div>
  );
}

export default function EmpresaConfigurarOfertaPage() {
  const empresaId = useAuthStore((state) => state.user?.empresa_id);
  return empresaId ? <ConfigurarOfertas key={empresaId} empresaId={empresaId} />
    : <p className="text-sm text-surface-600">Tu cuenta no tiene una empresa vinculada.</p>;
}
