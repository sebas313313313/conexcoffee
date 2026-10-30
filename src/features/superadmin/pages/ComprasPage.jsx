import { useState, useRef } from 'react';
import { ModuloCabecera } from '@/components/data-display';
import {
  Search,
  Eye,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Pencil,
  Plus,
  Globe2,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QueryState } from '@/components/feedback';
import ActionButton from '../components/ActionButton';
import { useTableEntranceAnimation } from '../hooks/useSuperadminAnimations';
import {
  useSuperadminPedidos,
  useSuperadminCompradores,
  useCrearSuperadminComprador,
  useActualizarSuperadminComprador,
} from '../hooks/useSuperadminData';

export default function ComprasPage() {
  const [pestanaActiva, setPestanaActiva] = useState('compras'); // 'compras' | 'compradores'

  const pedidosQuery = useSuperadminPedidos();
  const pedidos = pedidosQuery.data ?? [];

  const compradoresQuery = useSuperadminCompradores();
  const compradores = compradoresQuery.data ?? [];
  const crearCompradorMutation = useCrearSuperadminComprador();
  const actualizarCompradorMutation = useActualizarSuperadminComprador();


  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const tableComprasRef = useRef(null);
  const tableCompradoresRef = useRef(null);

  // Modales
  const [modalDetallePedido, setModalDetallePedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const [modalRegistrarComprador, setModalRegistrarComprador] = useState(false);
  const [modalEditarComprador, setModalEditarComprador] = useState(false);
  const [modalDetalleComprador, setModalDetalleComprador] = useState(false);
  const [compradorSeleccionado, setCompradorSeleccionado] = useState(null);

  // Formulario nuevo comprador
  const [nuevoComprador, setNuevoComprador] = useState({
    numero_identificacion: '',
    tipo_documento: 'PAS',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: '',
    correo: '',
    empresa: '',
    pais: 'Estados Unidos',
    ciudad: '',
  });

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.codigo_pedido.toLowerCase().includes(term) ||
      p.comprador_nombre.toLowerCase().includes(term) ||
      p.comprador_empresa.toLowerCase().includes(term) ||
      p.pais_destino.toLowerCase().includes(term);

    const matchesEstado =
      filtroEstado === 'todos' || p.estado.toLowerCase() === filtroEstado.toLowerCase();

    return matchesSearch && matchesEstado;
  });

  // Filtrado de compradores
  const compradoresFiltrados = compradores.filter((c) => {
    const term = searchTerm.toLowerCase();
    const id = c.numero_identificacion || c.numeroIdentificacion || '';
    const pNombre = c.primer_nombre || c.primerNombre || '';
    const sNombre = c.segundo_nombre || c.segundoNombre || '';
    const pApellido = c.primer_apellido || c.primerApellido || '';
    const sApellido = c.segundo_apellido || c.segundoApellido || '';
    const fullName = `${pNombre} ${sNombre} ${pApellido} ${sApellido}`.toLowerCase();
    const empresa = c.empresa || c.empresaCompradora || '';
    const pais = c.pais || '';
    const correo = c.correo || '';
    return (
      id.toLowerCase().includes(term) ||
      fullName.includes(term) ||
      empresa.toLowerCase().includes(term) ||
      pais.toLowerCase().includes(term) ||
      correo.toLowerCase().includes(term)
    );
  });

  useTableEntranceAnimation(tableComprasRef, [pedidosFiltrados.length, pestanaActiva]);
  useTableEntranceAnimation(tableCompradoresRef, [compradoresFiltrados.length, pestanaActiva]);

  // Guardar nuevo comprador
  const handleGuardarComprador = async (e) => {
    e.preventDefault();
    if (!nuevoComprador.numero_identificacion || !nuevoComprador.primer_nombre || !nuevoComprador.primer_apellido) {
      toast.error('Complete los campos obligatorios (*)');
      return;
    }

    const nuevo = {
      ...nuevoComprador,
      numeroIdentificacion: nuevoComprador.numero_identificacion,
      primerNombre: nuevoComprador.primer_nombre.toUpperCase(),
      segundoNombre: nuevoComprador.segundo_nombre.toUpperCase(),
      primerApellido: nuevoComprador.primer_apellido.toUpperCase(),
      segundoApellido: nuevoComprador.segundo_apellido.toUpperCase(),
      empresaCompradora: nuevoComprador.empresa,
      primer_nombre: nuevoComprador.primer_nombre.toUpperCase(),
      segundo_nombre: nuevoComprador.segundo_nombre.toUpperCase(),
      primer_apellido: nuevoComprador.primer_apellido.toUpperCase(),
      segundo_apellido: nuevoComprador.segundo_apellido.toUpperCase(),
      pedidos_totales: 0,
      pedidosCount: 0,
      volumen_kg: 0,
      volumenSacos: 0,
      estado: 'Activo',
    };

    crearCompradorMutation.mutate(nuevo);
    toast.success('Comprador internacional registrado correctamente');
    setModalRegistrarComprador(false);
    setNuevoComprador({
      numero_identificacion: '',
      tipo_documento: 'PAS',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      telefono: '',
      correo: '',
      empresa: '',
      pais: 'Estados Unidos',
      ciudad: '',
    });
  };

  // Guardar edición comprador
  const handleGuardarEdicionComprador = (e) => {
    e.preventDefault();
    if (!compradorSeleccionado) return;
    actualizarCompradorMutation.mutate({
      ...compradorSeleccionado,
      empresaCompradora: compradorSeleccionado.empresa || compradorSeleccionado.empresaCompradora,
    });
    toast.success('Comprador actualizado correctamente');
    setModalEditarComprador(false);
  };


  // Badge de estado de compra
  const renderBadgeEstado = (estado) => {
    switch (estado) {
      case 'Pago aceptado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pago aceptado
          </span>
        );
      case 'Compra en camino':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Truck className="w-3.5 h-3.5" /> Compra en camino
          </span>
        );
      case 'Pago pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pago pendiente
          </span>
        );
      case 'Entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
          </span>
        );
      case 'Pago rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Pago rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera idéntica al componente Blade original (portada comprador.jpg) */}
      <ModuloCabecera
        titulo="Compras y Compradores"
        subtitulo="Gestión centralizada de pedidos internacionales, transacciones de café y cartera de compradores"
        imagenPortada="/images/portadas/comprador.jpg"
        mensaje="En este módulo podrás visualizar tus pedidos y gestionar la información detallada de cada uno de tus compradores."
        totalRegistros={pestanaActiva === 'compras' ? pedidos.length : compradores.length}
        textoBotonRegistrar="Registrar Comprador"
        onRegistrar={() => setModalRegistrarComprador(true)}
      />

      <QueryState query={pedidosQuery} />

      {/* Pestañas de Navegación: Compras / Pedidos vs Compradores */}
      <div className="flex border-b border-surface-200 gap-8">
        <button
          onClick={() => {
            setPestanaActiva('compras');
            setSearchTerm('');
          }}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
            pestanaActiva === 'compras'
              ? 'text-brand-terracota border-b-2 border-brand-terracota'
              : 'text-surface-500 hover:text-surface-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Historial de Compras y Pedidos ({pedidos.length})</span>
        </button>

        <button
          onClick={() => {
            setPestanaActiva('compradores');
            setSearchTerm('');
          }}
          className={`pb-3.5 text-sm font-bold flex items-center gap-2 relative transition-colors cursor-pointer ${
            pestanaActiva === 'compradores'
              ? 'text-brand-terracota border-b-2 border-brand-terracota'
              : 'text-surface-500 hover:text-surface-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directorio de Compradores ({compradores.length})</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-2xl p-4 border border-surface-200 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              pestanaActiva === 'compras'
                ? 'Buscar por código, comprador, país...'
                : 'Buscar por cédula, nombre, empresa, país...'
            }
            className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 focus:border-brand-terracota"
          />
        </div>

        {pestanaActiva === 'compras' && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-medium text-surface-500">Estado Pedido:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-sm border border-surface-200 rounded-xl px-3 py-2 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-brand-terracota/20 cursor-pointer text-surface-700"
            >
              <option value="todos">Todos los estados</option>
              <option value="pago aceptado">Pago aceptado</option>
              <option value="compra en camino">Compra en camino</option>
              <option value="pago pendiente">Pago pendiente</option>
              <option value="entregado">Entregado</option>
              <option value="pago rechazado">Pago rechazado</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: HISTORIAL DE COMPRAS / PEDIDOS */}
      {pestanaActiva === 'compras' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableComprasRef} className="w-full text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Código Pedido</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Comprador / Empresa</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4 text-right">Total (USD)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-surface-400">
                      No se encontraron pedidos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido, index) => (
                    <tr key={pedido.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="py-3 px-4 text-surface-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-normal text-surface-800">
                        <span>{pedido.codigo_pedido}</span>
                      </td>
                      <td className="py-3 px-4 text-surface-600 text-xs">{pedido.fecha}</td>
                      <td className="py-3 px-4 text-surface-800">
                        <span className="font-semibold block text-xs">{pedido.comprador_nombre}</span>
                        <span className="text-[11px] text-surface-500">{pedido.comprador_empresa}</span>
                      </td>
                      <td className="py-3 px-4 text-surface-600 text-xs">
                        <span>{pedido.pais_destino}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-surface-900">
                        ${pedido.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">{renderBadgeEstado(pedido.estado)}</td>
                      <td className="py-3 px-4 text-center">
                        <ActionButton
                          icon={Eye}
                          title="Ver detalle del pedido"
                          variant="view"
                          onClick={() => {
                            setPedidoSeleccionado(pedido);
                            setModalDetallePedido(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between text-xs text-surface-500">
            <span>
              Total pedidos: <b>{pedidosFiltrados.length}</b> de {pedidos.length}
            </span>
            <span className="text-surface-400">Página 1 de 1</span>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORIO DE COMPRADORES */}
      {pestanaActiva === 'compradores' && (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table ref={tableCompradoresRef} className="w-full text-left text-sm">
              <thead className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Identificación</th>
                  <th className="py-3 px-4">Nombres</th>
                  <th className="py-3 px-4">Apellidos</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">País / Empresa</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {compradoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-surface-400">
                      No se encontraron compradores registrados.
                    </td>
                  </tr>
                ) : (
                  compradoresFiltrados.map((comp, index) => (
                    <tr key={comp.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="py-3 px-4 text-surface-500 font-medium">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-surface-900">{comp.numero_identificacion || comp.numeroIdentificacion}</td>
                      <td className="py-3 px-4 text-surface-800 font-medium">
                        {comp.primer_nombre || comp.primerNombre} {comp.segundo_nombre || comp.segundoNombre || ''}
                      </td>
                      <td className="py-3 px-4 text-surface-700">
                        {comp.primer_apellido || comp.primerApellido} {comp.segundo_apellido || comp.segundoApellido || ''}
                      </td>
                      <td className="py-3 px-4 text-surface-600 text-xs">{comp.telefono}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold block text-xs text-surface-800">{comp.empresa || comp.empresaCompradora}</span>
                        <span className="text-[11px] text-surface-500">{comp.pais}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={Pencil}
                            title="Editar comprador"
                            variant="primary"
                            onClick={() => {
                              setCompradorSeleccionado(comp);
                              setModalEditarComprador(true);
                            }}
                          />
                          <ActionButton
                            icon={Eye}
                            title="Ver detalles"
                            variant="view"
                            onClick={() => {
                              setCompradorSeleccionado(comp);
                              setModalDetalleComprador(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-surface-200 bg-surface-50 flex items-center justify-between text-xs text-surface-500">
            <span>
              Total compradores: <b>{compradoresFiltrados.length}</b> de {compradores.length}
            </span>
            <span className="text-surface-400">Página 1 de 1</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETALLE DE PEDIDO / COMPRA                                         */}
      {/* ========================================================================= */}
      {modalDetallePedido && pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="bg-gradient-to-r from-amber-950 to-stone-900 p-6 text-white relative">
              <button
                onClick={() => setModalDetallePedido(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-800/60 border border-amber-600/30 flex items-center justify-center text-amber-300">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Detalle del Pedido #{pedidoSeleccionado.codigo_pedido}</h3>
                  <p className="text-xs text-amber-200/80">
                    Fecha de orden: {pedidoSeleccionado.fecha} • {pedidoSeleccionado.estado}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 text-sm">
              {/* Información Comprador y Envío */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <span className="text-stone-400 block font-semibold uppercase">Comprador</span>
                  <span className="font-bold text-stone-800 block text-sm">{pedidoSeleccionado.comprador_nombre}</span>
                  <span className="text-stone-600 block">{pedidoSeleccionado.comprador_empresa}</span>
                  <span className="text-stone-500 block">{pedidoSeleccionado.pais_destino}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <span className="text-stone-400 block font-semibold uppercase">Pago y Logística</span>
                  <span className="font-semibold text-stone-800 block">{pedidoSeleccionado.metodo_pago}</span>
                  <span className="text-stone-500 block">Ref: {pedidoSeleccionado.referencia_pago}</span>
                  <span className="text-stone-500 block">Naviera: {pedidoSeleccionado.naviera}</span>
                </div>
              </div>

              {/* Desglose de Lotes */}
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-600 mb-2">Lotes de Café Especial</h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Variedad</th>
                        <th className="py-2.5 px-3 text-right">Sacos</th>
                        <th className="py-2.5 px-3 text-right">Peso (Kg)</th>
                        <th className="py-2.5 px-3 text-right">Precio/Kg</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pedidoSeleccionado.lotes.map((lote, i) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 font-bold text-stone-900">{lote.codigo}</td>
                          <td className="py-2.5 px-3 text-stone-700">{lote.variedad}</td>
                          <td className="py-2.5 px-3 text-right text-stone-700">{lote.cantidad_sacos}</td>
                          <td className="py-2.5 px-3 text-right text-stone-700">{lote.peso_kg} kg</td>
                          <td className="py-2.5 px-3 text-right text-stone-700">${lote.precio_kg.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                            ${(lote.peso_kg * lote.precio_kg).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal Café:</span>
                    <span>${pedidoSeleccionado.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Flete Marítimo y Seguro:</span>
                    <span>${pedidoSeleccionado.flete.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Facturado:</span>
                    <span className="text-amber-900">${pedidoSeleccionado.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setModalDetallePedido(false)}
                className="px-4 py-2 text-sm bg-stone-800 text-white rounded-xl hover:bg-stone-900 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR COMPRADOR                                                */}
      {/* ========================================================================= */}
      {modalRegistrarComprador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Registrar Comprador Internacional</h3>
                  <p className="text-xs text-stone-500">Ingrese datos corporativos y de contacto para subastas</p>
                </div>
              </div>
              <button onClick={() => setModalRegistrarComprador(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarComprador} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tipo de Documento *</label>
                  <select
                    value={nuevoComprador.tipo_documento}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, tipo_documento: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="PAS">Pasaporte</option>
                    <option value="TAX_ID">Tax ID / Registro Fiscal</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Identificación / Tax ID *</label>
                  <input
                    type="text"
                    required
                    value={nuevoComprador.numero_identificacion}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, numero_identificacion: e.target.value })}
                    placeholder="Ej. US-9823412"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Primer Nombre *</label>
                  <input
                    type="text"
                    required
                    value={nuevoComprador.primer_nombre}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, primer_nombre: e.target.value })}
                    placeholder="Ej. John"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Primer Apellido *</label>
                  <input
                    type="text"
                    required
                    value={nuevoComprador.primer_apellido}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, primer_apellido: e.target.value })}
                    placeholder="Ej. Smith"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Empresa / Tostaduría *</label>
                  <input
                    type="text"
                    required
                    value={nuevoComprador.empresa}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, empresa: e.target.value })}
                    placeholder="Ej. Blue Coffee Roasters Inc."
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">País *</label>
                  <input
                    type="text"
                    required
                    value={nuevoComprador.pais}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, pais: e.target.value })}
                    placeholder="Ej. Estados Unidos"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Teléfono Internacional</label>
                  <input
                    type="tel"
                    value={nuevoComprador.telefono}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, telefono: e.target.value })}
                    placeholder="Ej. +1 415 892 3411"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={nuevoComprador.correo}
                    onChange={(e) => setNuevoComprador({ ...nuevoComprador, correo: e.target.value })}
                    placeholder="Ej. buyer@roasters.com"
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalRegistrarComprador(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 transition-colors"
                >
                  Guardar Comprador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR COMPRADOR                                                   */}
      {/* ========================================================================= */}
      {modalEditarComprador && compradorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Editar Comprador</h3>
                  <p className="text-xs text-stone-500">{compradorSeleccionado.numero_identificacion || compradorSeleccionado.numeroIdentificacion}</p>
                </div>
              </div>
              <button onClick={() => setModalEditarComprador(false)} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionComprador} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={compradorSeleccionado.empresa || compradorSeleccionado.empresaCompradora || ''}
                    onChange={(e) => setCompradorSeleccionado({ ...compradorSeleccionado, empresa: e.target.value, empresaCompradora: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">País</label>
                  <input
                    type="text"
                    value={compradorSeleccionado.pais}
                    onChange={(e) => setCompradorSeleccionado({ ...compradorSeleccionado, pais: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={compradorSeleccionado.telefono}
                    onChange={(e) => setCompradorSeleccionado({ ...compradorSeleccionado, telefono: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={compradorSeleccionado.correo}
                    onChange={(e) => setCompradorSeleccionado({ ...compradorSeleccionado, correo: e.target.value })}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalEditarComprador(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-amber-800 text-white font-semibold rounded-xl hover:bg-amber-900 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER DETALLE COMPRADOR                                              */}
      {/* ========================================================================= */}
      {modalDetalleComprador && compradorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-950 to-stone-900 p-6 text-white relative">
              <button
                onClick={() => setModalDetalleComprador(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-xl font-bold">
                  {(compradorSeleccionado.primer_nombre || compradorSeleccionado.primerNombre || 'C')[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {compradorSeleccionado.primer_nombre || compradorSeleccionado.primerNombre} {compradorSeleccionado.primer_apellido || compradorSeleccionado.primerApellido}
                  </h3>
                  <p className="text-xs text-amber-200/80">{compradorSeleccionado.empresa || compradorSeleccionado.empresaCompradora}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span><b>País / Ciudad:</b> {compradorSeleccionado.pais} ({compradorSeleccionado.ciudad || 'No especificada'})</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                <span><b>Correo:</b> {compradorSeleccionado.correo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <span><b>Teléfono:</b> {compradorSeleccionado.telefono}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                <span><b>Historial:</b> {compradorSeleccionado.pedidos_totales ?? compradorSeleccionado.pedidosCount ?? 0} pedidos ({((compradorSeleccionado.volumen_kg ?? (compradorSeleccionado.volumenSacos ? compradorSeleccionado.volumenSacos * 60 : 0))).toLocaleString('es-CO')} kg café)</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setModalDetalleComprador(false)}
                className="px-4 py-2 text-sm bg-stone-800 text-white rounded-xl hover:bg-stone-900 font-medium"
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
