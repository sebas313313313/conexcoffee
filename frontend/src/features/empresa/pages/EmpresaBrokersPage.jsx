import { useState } from 'react';
import { Eye, Handshake, Pencil, Search, X } from 'lucide-react';
import { ModuloCabecera } from '@/components/data-display';
import { QueryState } from '@/components/feedback';
import { CrearBrokerModal } from '@/components/usuarios';
import { useEmpresaBrokers, useCrearEmpresaBroker, useActualizarEmpresaBroker } from '../hooks/useEmpresaData';

export default function EmpresaBrokersPage() {
  const query = useEmpresaBrokers();
  const brokers = query.data ?? [];
  const crearBroker = useCrearEmpresaBroker();
  const actualizarBroker = useActualizarEmpresaBroker();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [brokerEditar, setBrokerEditar] = useState(null);
  const [brokerDetalle, setBrokerDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarCreacion = async (data) => {
    setGuardando(true);
    try {
      await crearBroker.mutateAsync(data);
      setModalCrear(false);
    } finally { setGuardando(false); }
  };
  const guardarEdicion = async (data) => {
    setGuardando(true);
    try {
      await actualizarBroker.mutateAsync({ id: brokerEditar.id, payload: data });
      setBrokerEditar(null);
    } finally { setGuardando(false); }
  };
  const term = searchTerm.trim().toLowerCase();
  const filtrados = brokers.filter((broker) =>
    [broker.nombre_empresa, broker.identificacion_fiscal_pais, broker.pais_operacion,
      broker.ciudad, broker.telefono_contacto, broker.correo]
      .some((value) => String(value || '').toLowerCase().includes(term))
  );

  return (
    <div className="space-y-6">
      <ModuloCabecera
        titulo="Brokers Comerciales"
        subtitulo="Intermediarios vinculados a tu empresa"
        imagenPortada="/images/portadas/broker.jpg"
        mensaje="Registra y consulta los brokers de tu empresa."
        icono={Handshake}
        totalRegistros={filtrados.length}
        textoBotonRegistrar="Registrar Broker"
        onRegistrar={() => setModalCrear(true)}
      />
      <QueryState query={query} />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por empresa, identificación o país"
          aria-label="Buscar brokers"
          className="w-full rounded-xl border border-surface-200 bg-white py-2 pl-10 pr-3 text-sm" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-surface-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50 text-xs uppercase text-surface-600">
            <tr>
              <th className="px-4 py-3">Identificación fiscal</th>
              <th className="px-4 py-3">Broker</th>
              <th className="px-4 py-3">Ubicación</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {filtrados.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-surface-500">No se encontraron brokers.</td></tr>
            ) : filtrados.map((broker) => (
              <tr key={broker.id}>
                <td className="px-4 py-3 font-medium">{broker.identificacion_fiscal_pais}</td>
                <td className="px-4 py-3 font-semibold">{broker.nombre_empresa}</td>
                <td className="px-4 py-3">{broker.ciudad}, {broker.pais_operacion}</td>
                <td className="px-4 py-3">{broker.telefono_contacto}</td>
                <td className="px-4 py-3">{broker.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => setBrokerEditar(broker)} aria-label={`Editar ${broker.nombre_empresa}`} className="p-2 text-surface-600 hover:text-brand-terracota"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setBrokerDetalle(broker)} aria-label={`Ver ${broker.nombre_empresa}`} className="p-2 text-surface-600 hover:text-brand-terracota"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CrearBrokerModal isOpen={modalCrear} onClose={() => setModalCrear(false)} onSubmit={guardarCreacion} loading={guardando} />
      <CrearBrokerModal key={brokerEditar?.id || 'editar'} isOpen={Boolean(brokerEditar)}
        initialData={brokerEditar} titulo="Editar Broker" onClose={() => setBrokerEditar(null)} onSubmit={guardarEdicion} loading={guardando} />
      {brokerDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-label="Detalle del broker" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-3">
            <div className="flex items-start justify-between"><h2 className="text-lg font-bold">{brokerDetalle.nombre_empresa}</h2><button type="button" onClick={() => setBrokerDetalle(null)} aria-label="Cerrar detalle"><X className="h-5 w-5" /></button></div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-surface-500">Identificación fiscal</dt><dd>{brokerDetalle.identificacion_fiscal_pais}</dd></div>
              <div><dt className="text-surface-500">Ubicación</dt><dd>{brokerDetalle.ciudad}, {brokerDetalle.pais_operacion}</dd></div>
              <div><dt className="text-surface-500">Teléfono</dt><dd>{brokerDetalle.telefono_contacto}</dd></div>
              <div><dt className="text-surface-500">Comisión</dt><dd>{brokerDetalle.porcentaje_comision_split}%</dd></div>
              <div className="col-span-2"><dt className="text-surface-500">Dirección de bodega</dt><dd>{brokerDetalle.direccion_bodega}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
