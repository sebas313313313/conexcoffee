import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowRight,
  Package,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore, { formatCOP } from '@/store/useCartStore';

export default function CartDrawerModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const openCheckout = useCartStore((s) => s.openCheckout);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  if (!isCartOpen) return null;

  const totalUnidades = items.reduce((sum, i) => sum + Number(i.cantidad || 0), 0);
  const totalCOP = items.reduce(
    (sum, i) => sum + Number(i.precioUnitarioCOP || 0) * Number(i.cantidad || 0),
    0
  );

  const handleContinuarOfertas = () => {
    closeCart();
    if (!location.pathname.startsWith('/destinos')) {
      navigate('/destinos');
    }
  };

  const handleBorrarCarrito = () => {
    if (items.length === 0) return;
    clearCart();
    toast.success('Se ha vaciado el carrito de compras');
  };

  const handleRealizarPago = () => {
    if (items.length === 0) {
      toast.error('Añade al menos un producto o muestra al carrito antes de realizar el pago');
      return;
    }
    openCheckout();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-surface-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras ConexCoffee"
    >
      {/* Clic fuera para cerrar */}
      <div className="flex-1" onClick={closeCart} />

      {/* Panel lateral del carrito */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-surface-200 flex flex-col justify-between overflow-hidden">
        {/* =======================================================
            PARTE SUPERIOR: Encabezado + Contador Total en COP
        ======================================================= */}
        <div className="border-b border-surface-200 bg-surface-50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-terracota text-white flex items-center justify-center shadow-xs">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-surface-900 leading-tight">
                  Tu Carrito de Café
                </h2>
                <p className="text-xs text-surface-500">
                  {totalUnidades}{' '}
                  {totalUnidades === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-200/60 transition cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contador total superior en Pesos Colombianos (COP) */}
          <div className="bg-white border border-brand-terracota/25 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
                Total acumulado (Pesos Colombianos)
              </p>
              <p className="text-2xl font-extrabold text-brand-terracota mt-0.5">
                {formatCOP(totalCOP)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-brand-tint text-brand-terracota px-3 py-1.5 rounded-full">
              {totalUnidades} {totalUnidades === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
        </div>

        {/* =======================================================
            LISTA DE PRODUCTOS AÑADIDOS AL CARRITO
        ======================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-surface-400" />
              </div>
              <p className="text-base font-bold text-surface-800">
                Tu carrito está vacío por ahora
              </p>
              <p className="text-sm text-surface-500 mt-1 max-w-xs">
                Explora nuestros contenedores activos y añade cajas de 24 kg o muestras de 120
                gramos.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const subtotalCOP = Number(item.precioUnitarioCOP) * Number(item.cantidad);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-surface-200 rounded-2xl p-3.5 shadow-2xs hover:border-brand-orange/40 transition flex gap-3.5"
                >
                  {/* Imagen del producto */}
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-20 h-20 rounded-xl object-cover border border-surface-200 shrink-0 bg-surface-100"
                  />

                  {/* Información de precio unitario, subtotal y contador */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 ${
                            item.tipo === 'caja'
                              ? 'bg-brand-tint text-brand-terracota'
                              : 'bg-brand-teal/15 text-brand-teal'
                          }`}
                        >
                          {item.presentacion} · {item.destinoNombre}
                        </span>
                        <h3 className="text-sm font-bold text-surface-900 truncate">
                          {item.nombre}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-surface-400 hover:text-danger-600 p-1 rounded-lg transition cursor-pointer shrink-0"
                        title="Eliminar este producto"
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Precio unitario y Subtotal en Pesos Colombianos */}
                    <div className="mt-2 space-y-0.5 text-xs">
                      <div className="flex items-center justify-between text-surface-500">
                        <span>Precio unitario:</span>
                        <span className="font-semibold text-surface-700">
                          {formatCOP(item.precioUnitarioCOP)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-surface-700">Subtotal:</span>
                        <span className="font-extrabold text-brand-terracota text-sm">
                          {formatCOP(subtotalCOP)}
                        </span>
                      </div>
                    </div>

                    {/* Contadorcito para añadir más muestras o cajas del producto */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-surface-100">
                      <span className="text-[11px] text-surface-500 font-medium">
                        {item.tipo === 'muestra' ? 'Cantidad de muestras:' : 'Cantidad de cajas:'}
                      </span>

                      <div className="inline-flex items-center border border-surface-200 rounded-xl overflow-hidden bg-surface-50">
                        <button
                          type="button"
                          onClick={() => decrementItem(item.id)}
                          className="px-2.5 py-1 text-surface-700 hover:bg-surface-200 transition cursor-pointer"
                          aria-label="Restar unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-extrabold text-surface-900 bg-white">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementItem(item.id)}
                          className="px-2.5 py-1 text-surface-700 hover:bg-surface-200 transition cursor-pointer"
                          aria-label="Sumar unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* =======================================================
            PARTE INFERIOR: Botones de acción y sello Payments Way
        ======================================================= */}
        <div className="border-t border-surface-200 bg-surface-50 p-5 space-y-3">
          {/* Resumen rápido antes de pagar */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-surface-600">Total a pagar:</span>
            <span className="text-lg font-extrabold text-surface-900">
              {formatCOP(totalCOP)}
            </span>
          </div>

          {/* Botón principal: Realizar pago (abre registro de comprador + pasarela Payments Way) */}
          <button
            type="button"
            onClick={handleRealizarPago}
            disabled={items.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-terracota hover:bg-brand-orange disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Realizar pago con Payments Way</span>
          </button>

          {/* Dos botones secundarios: Continuar con las ofertas / Borrar carrito */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleContinuarOfertas}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-surface-300 bg-white hover:bg-surface-100 text-surface-800 font-semibold text-xs transition cursor-pointer"
            >
              <span>Continuar con las ofertas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleBorrarCarrito}
              disabled={items.length === 0}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-danger-500/30 bg-danger-500/10 hover:bg-danger-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-danger-600 font-semibold text-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar carrito</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-surface-500">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            <span>Pagos protegidos por pasarela Payments Way Colombia</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

