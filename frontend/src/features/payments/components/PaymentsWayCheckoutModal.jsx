import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore, { formatCOP } from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import {
  PAYMENTSWAY_OFFICIAL_URL,
  createCheckoutSession,
  processPaymentsWayCard,
  validateCardLuhn,
  detectFranchise,
  formatCardNumber,
} from '../services/paymentsWayApi';

const INITIAL_BUYER = {
  tipoDocumento: 'CC',
  identificacion: '',
  nombres: '',
  apellidos: '',
  empresa: '',
  email: '',
  telefonoIndicativo: '+57',
  telefono: '',
  pais: 'Colombia',
  ciudad: '',
  direccion: '',
  password: '',
  confirmPassword: '',
  acceptTerms: true,
};

const INITIAL_CARD = {
  cardNumber: '',
  holderName: '',
  expiry: '',
  cvv: '',
  docType: 'CC',
  docNumber: '',
  installments: '1',
};

export default function PaymentsWayCheckoutModal() {
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const closeCheckout = useCartStore((s) => s.closeCheckout);
  const openCart = useCartStore((s) => s.openCart);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);

  // step: 1 = Registro comprador, 2 = Pasarela Payments Way Tarjeta, 3 = Comprobante Aprobado
  const [step, setStep] = useState(1);
  const [buyerForm, setBuyerForm] = useState(INITIAL_BUYER);
  const [buyerErrors, setBuyerErrors] = useState({});
  const [cardForm, setCardForm] = useState(INITIAL_CARD);
  const [cardErrors, setCardErrors] = useState({});
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Prellenar si el usuario ya inició sesión
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setReceipt(null);
      setCheckoutSession(null);
      setCardForm(INITIAL_CARD);
      setBuyerErrors({});
      setCardErrors({});

      if (user) {
        setBuyerForm((prev) => ({
          ...prev,
          nombres: user.nombres || user.name || prev.nombres,
          apellidos: user.apellidos || prev.apellidos,
          email: user.correo_electronico || user.email || prev.email,
        }));
      }
    }
  }, [isCheckoutOpen, user]);

  if (!isCheckoutOpen) return null;

  const totalCOP = items.reduce(
    (sum, i) => sum + Number(i.precioUnitarioCOP || 0) * Number(i.cantidad || 0),
    0
  );

  // ==========================================================
  // PASO 1: Validación y creación de cuenta de comprador + sesión
  // ==========================================================
  const handleBuyerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBuyerForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (buyerErrors[name]) {
      setBuyerErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateBuyerStep = () => {
    const e = {};
    if (!buyerForm.identificacion.trim()) e.identificacion = 'Ingresa tu identificación';
    if (!buyerForm.nombres.trim()) e.nombres = 'Ingresa tus nombres';
    if (!buyerForm.apellidos.trim()) e.apellidos = 'Ingresa tus apellidos';
    if (!buyerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email)) {
      e.email = 'Ingresa un correo electrónico válido';
    }
    if (!buyerForm.telefono.trim()) e.telefono = 'Ingresa tu teléfono de contacto';
    if (!buyerForm.pais.trim()) e.pais = 'Ingresa el país';
    if (!buyerForm.ciudad.trim()) e.ciudad = 'Ingresa la ciudad';
    if (!buyerForm.direccion.trim()) e.direccion = 'Ingresa la dirección de entrega';
    if (!buyerForm.password || buyerForm.password.length < 8) {
      e.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (buyerForm.password !== buyerForm.confirmPassword) {
      e.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!buyerForm.acceptTerms) {
      e.acceptTerms = 'Debes aceptar los términos para continuar';
    }
    return e;
  };

  const handleProceedToGateway = async (e) => {
    e.preventDefault();
    const errs = validateBuyerStep();
    if (Object.keys(errs).length > 0) {
      setBuyerErrors(errs);
      toast.error('Por favor completa los campos obligatorios del comprador');
      return;
    }

    setSubmitting(true);
    try {
      const session = await createCheckoutSession({
        comprador: {
          ...buyerForm,
          crearCuenta: true,
        },
        items,
        clientTotalCOP: totalCOP,
      });

      setCheckoutSession(session);
      setCardForm((prev) => ({
        ...prev,
        holderName: `${buyerForm.nombres} ${buyerForm.apellidos}`.trim().toUpperCase(),
        docType: buyerForm.tipoDocumento,
        docNumber: buyerForm.identificacion,
      }));
      setStep(2);
      toast.success('Cuenta de comprador verificada. Conectado a pasarela Payments Way.');
    } catch (err) {
      toast.error(err.message || 'No fue posible iniciar la sesión de pago');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // PASO 2: Validación de tarjeta y cobro en Payments Way
  // ==========================================================
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cardNumber') {
      formatted = formatCardNumber(value);
    } else if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      formatted = digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    } else if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'holderName') {
      formatted = value.toUpperCase();
    }

    setCardForm((prev) => ({ ...prev, [name]: formatted }));
    if (cardErrors[name]) {
      setCardErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFillTestCard = () => {
    setCardForm((prev) => ({
      ...prev,
      cardNumber: '4532 0151 1283 0366',
      holderName:
        prev.holderName ||
        `${buyerForm.nombres || 'COMPRADOR'} ${buyerForm.apellidos || 'CONEXCOFFEE'}`
          .trim()
          .toUpperCase(),
      expiry: '11/29',
      cvv: '842',
      docType: buyerForm.tipoDocumento || 'CC',
      docNumber: buyerForm.identificacion || '1020304050',
      installments: '1',
    }));
    setCardErrors({});
    toast.success('Tarjeta de prueba Payments Way cargada');
  };

  const validateCardStep = () => {
    const e = {};
    const cleanNum = cardForm.cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 15 || !validateCardLuhn(cleanNum)) {
      e.cardNumber = 'Número de tarjeta inválido (falló verificación Luhn)';
    }
    if (!cardForm.holderName.trim() || cardForm.holderName.trim().length < 4) {
      e.holderName = 'Ingresa el nombre del titular como aparece en la tarjeta';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry)) {
      e.expiry = 'Formato MM/AA inválido';
    }
    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      e.cvv = 'CVV de 3 o 4 dígitos';
    }
    if (!cardForm.docNumber.trim()) {
      e.docNumber = 'Ingresa el documento del titular';
    }
    return e;
  };

  const handlePayWithCard = async (e) => {
    e.preventDefault();
    const errs = validateCardStep();
    if (Object.keys(errs).length > 0) {
      setCardErrors(errs);
      toast.error('Revisa los datos de la tarjeta antes de continuar');
      return;
    }

    setSubmitting(true);
    try {
      const txReceipt = await processPaymentsWayCard({
        session: checkoutSession,
        cardForm,
      });

      // Limpiar inmediatamente datos sensibles de tarjeta en memoria
      setCardForm(INITIAL_CARD);
      setReceipt(txReceipt);
      setStep(3);
      clearCart();
      toast.success('¡Pago aprobado exitosamente por Payments Way Colombia!');
    } catch (err) {
      toast.error(err.message || 'Pago rechazado por la pasarela');
    } finally {
      setSubmitting(false);
    }
  };

  const franchise = detectFranchise(cardForm.cardNumber);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-900/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Registro de Comprador y Pasarela de Pagos Payments Way"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-surface-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* =======================================================
            CABECERA DEL MODAL CON PASOS Y SELLO PAYMENTS WAY
        ======================================================= */}
        <div className="bg-surface-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-surface-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-terracota flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Checkout Oficial ConexCoffee × Payments Way
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-teal/20 text-brand-gold px-2 py-0.5 rounded-full border border-brand-gold/30">
                  PCI-DSS + HMAC
                </span>
              </div>
              <p className="text-xs text-surface-300">
                Pasarela de pagos en Colombia —{' '}
                <a
                  href={PAYMENTSWAY_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold underline hover:text-white inline-flex items-center gap-1"
                >
                  www.paymentsway.co
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`px-2.5 py-1 rounded-full ${
                step === 1
                  ? 'bg-brand-terracota text-white'
                  : 'bg-surface-800 text-surface-300'
              }`}
            >
              1. Cuenta Comprador
            </span>
            <span
              className={`px-2.5 py-1 rounded-full ${
                step === 2
                  ? 'bg-brand-terracota text-white'
                  : 'bg-surface-800 text-surface-300'
              }`}
            >
              2. Tarjeta Payments Way
            </span>
            <span
              className={`px-2.5 py-1 rounded-full ${
                step === 3
                  ? 'bg-brand-teal text-white'
                  : 'bg-surface-800 text-surface-300'
              }`}
            >
              3. Comprobante
            </span>

            <button
              type="button"
              onClick={closeCheckout}
              className="ml-2 p-1.5 rounded-xl text-surface-300 hover:text-white hover:bg-surface-800 transition cursor-pointer"
              aria-label="Cerrar checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =======================================================
            CUERPO DEL MODAL (SEGÚN EL PASO ACTUAL)
        ======================================================= */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* -------------------------------------------------------
              PASO 1: CREAR CUENTA DE COMPRADOR + DATOS DEL PEDIDO
          ------------------------------------------------------- */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Formulario de registro de comprador (7 columnas) */}
              <form
                id="buyer-checkout-form"
                onSubmit={handleProceedToGateway}
                className="lg:col-span-7 space-y-4"
              >
                <div className="bg-brand-tint/40 border border-brand-terracota/25 rounded-2xl p-4 flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-brand-terracota shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-extrabold text-surface-900">
                      Registro de Cuenta de Comprador
                    </h3>
                    <p className="text-xs text-surface-600 mt-0.5">
                      Antes de procesar tu pago en <strong>Payments Way</strong>, completa tus
                      datos para crear tu cuenta de comprador y vincular la trazabilidad del pedido.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Tipo Doc. *
                    </label>
                    <select
                      name="tipoDocumento"
                      value={buyerForm.tipoDocumento}
                      onChange={handleBuyerChange}
                      className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    >
                      <option value="CC">CC — Cédula</option>
                      <option value="NIT">NIT — Empresa</option>
                      <option value="CE">CE — Extranjería</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Número de identificación / NIT *
                    </label>
                    <input
                      type="text"
                      name="identificacion"
                      value={buyerForm.identificacion}
                      onChange={handleBuyerChange}
                      placeholder="Ej. 1020304050"
                      className="w-full px-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.identificacion && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.identificacion}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={buyerForm.nombres}
                      onChange={handleBuyerChange}
                      placeholder="Nombres del comprador"
                      className="w-full px-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.nombres && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.nombres}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={buyerForm.apellidos}
                      onChange={handleBuyerChange}
                      placeholder="Apellidos del comprador"
                      className="w-full px-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.apellidos && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.apellidos}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Correo electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        value={buyerForm.email}
                        onChange={handleBuyerChange}
                        placeholder="comprador@empresa.com"
                        className="w-full pl-9 pr-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                      />
                    </div>
                    {buyerErrors.email && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Teléfono de contacto *
                    </label>
                    <div className="flex border border-surface-300 rounded-xl overflow-hidden bg-white">
                      <select
                        name="telefonoIndicativo"
                        value={buyerForm.telefonoIndicativo}
                        onChange={handleBuyerChange}
                        className="bg-surface-50 px-2 text-xs font-semibold text-surface-700 border-r border-surface-200 focus:outline-none"
                      >
                        <option value="+57">+57 COL</option>
                        <option value="+56">+56 CHL</option>
                        <option value="+54">+54 ARG</option>
                        <option value="+971">+971 EAU</option>
                        <option value="+1">+1 USA</option>
                      </select>
                      <input
                        type="tel"
                        name="telefono"
                        value={buyerForm.telefono}
                        onChange={handleBuyerChange}
                        placeholder="300 123 4567"
                        className="flex-1 px-3 py-2 text-sm text-surface-900 focus:outline-none"
                      />
                    </div>
                    {buyerErrors.telefono && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.telefono}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Empresa / Tostadora
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        name="empresa"
                        value={buyerForm.empresa}
                        onChange={handleBuyerChange}
                        placeholder="Opcional"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      País de destino *
                    </label>
                    <input
                      type="text"
                      name="pais"
                      value={buyerForm.pais}
                      onChange={handleBuyerChange}
                      placeholder="Colombia / Chile / Argentina"
                      className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.pais && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.pais}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={buyerForm.ciudad}
                      onChange={handleBuyerChange}
                      placeholder="Bogotá / Santiago"
                      className="w-full px-3 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.ciudad && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.ciudad}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Dirección de entrega *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="direccion"
                      value={buyerForm.direccion}
                      onChange={handleBuyerChange}
                      placeholder="Calle / Avenida, número, bodega o puerto"
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                  </div>
                  {buyerErrors.direccion && (
                    <p className="text-xs text-danger-600 mt-1">{buyerErrors.direccion}</p>
                  )}
                </div>

                {/* Contraseña y Confirmación para crear cuenta de comprador */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Crear contraseña de comprador *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={buyerForm.password}
                      onChange={handleBuyerChange}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.password && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Confirmar contraseña *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={buyerForm.confirmPassword}
                      onChange={handleBuyerChange}
                      placeholder="Repite tu contraseña"
                      className="w-full px-3.5 py-2 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {buyerErrors.confirmPassword && (
                      <p className="text-xs text-danger-600 mt-1">{buyerErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-surface-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={buyerForm.acceptTerms}
                    onChange={handleBuyerChange}
                    className="mt-0.5 rounded border-surface-300 text-brand-terracota focus:ring-brand-terracota"
                  />
                  <span>
                    Acepto la creación de mi cuenta como <strong>Comprador</strong> en ConexCoffee y
                    el procesamiento seguro del pago mediante <strong>Payments Way Colombia</strong>.
                  </span>
                </label>
                {buyerErrors.acceptTerms && (
                  <p className="text-xs text-danger-600">{buyerErrors.acceptTerms}</p>
                )}
              </form>

              {/* Resumen del pedido en Pesos Colombianos (5 columnas) */}
              <div className="lg:col-span-5 bg-surface-50 border border-surface-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                    <h3 className="text-sm font-extrabold text-surface-900">
                      Resumen del Pedido
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        closeCheckout();
                        openCart();
                      }}
                      className="text-xs font-bold text-brand-terracota hover:underline cursor-pointer"
                    >
                      Editar carrito
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white border border-surface-200 rounded-xl p-2.5"
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-surface-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-surface-900 truncate">
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-surface-500">
                            {item.cantidad} × {item.presentacion} ({formatCOP(item.precioUnitarioCOP)})
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-surface-900 shrink-0">
                          {formatCOP(item.precioUnitarioCOP * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-surface-200">
                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <span>Pasarela asignada:</span>
                    <span className="font-bold text-surface-800">Payments Way Colombia</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-surface-800">Total a pagar:</span>
                    <span className="text-xl font-extrabold text-brand-terracota">
                      {formatCOP(totalCOP)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    form="buyer-checkout-form"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-terracota hover:bg-brand-orange disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    <span>
                      {submitting
                        ? 'Verificando y firmando orden...'
                        : 'Crear cuenta y pasar a pago con tarjeta'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              PASO 2: PASARELA DE PAGOS CON TARJETA (PAYMENTS WAY)
          ------------------------------------------------------- */}
          {step === 2 && checkoutSession && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Columna Izquierda: Tarjeta interactiva y resumen de orden firmada (5 columnas) */}
              <div className="lg:col-span-5 space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-brand-terracota cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Volver a datos del comprador
                </button>

                {/* Representación visual de la tarjeta */}
                <div className="rounded-2xl p-5 bg-gradient-to-br from-surface-900 via-roast-800 to-brand-terracota text-white shadow-xl space-y-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">
                        Payments Way · Colombia
                      </p>
                      <p className="text-xs text-surface-200 mt-0.5">
                        Orden: {checkoutSession.orderNumber}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs text-xs font-extrabold tracking-wider">
                      {franchise}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] uppercase tracking-wider text-surface-300">
                      Número de tarjeta
                    </p>
                    <p className="text-lg sm:text-xl font-mono font-bold tracking-widest mt-0.5">
                      {cardForm.cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4 pt-1">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-surface-300">
                        Titular
                      </p>
                      <p className="text-xs font-bold truncate">
                        {cardForm.holderName || 'NOMBRE EN LA TARJETA'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-surface-300">
                        Vence
                      </p>
                      <p className="text-xs font-bold">{cardForm.expiry || 'MM/AA'}</p>
                    </div>
                  </div>
                </div>

                {/* Resumen financiero firmado por el servidor */}
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Comercio:</span>
                    <span className="font-bold text-surface-900">ConexCoffee Export S.A.S.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Comprador:</span>
                    <span className="font-bold text-surface-900">
                      {checkoutSession.comprador.nombres} {checkoutSession.comprador.apellidos}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-surface-500">Terminal Payments Way:</span>
                    <span className="font-mono font-semibold text-surface-700">
                      {checkoutSession.terminalId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-200">
                    <span className="text-sm font-bold text-surface-800">Total en Pesos:</span>
                    <span className="text-lg font-extrabold text-brand-terracota">
                      {formatCOP(checkoutSession.amountCOP)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-surface-500">
                    <span>Equivalente estimado USD:</span>
                    <span>${checkoutSession.amountUSD} USD</span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Formulario de Tarjeta Payments Way (7 columnas) */}
              <form
                onSubmit={handlePayWithCard}
                className="lg:col-span-7 bg-white border border-surface-200 rounded-2xl p-5 space-y-4"
                autoComplete="off"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-200">
                  <div>
                    <h3 className="text-base font-extrabold text-surface-900">
                      Pago con Tarjeta de Crédito o Débito
                    </h3>
                    <p className="text-xs text-surface-500">
                      Tokenización directa con estándar de seguridad Payments Way Colombia
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-tint text-brand-terracota hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Usar tarjeta de prueba
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Número de la tarjeta (Visa, Mastercard, Amex, Diners) *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-surface-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="cardNumber"
                      inputMode="numeric"
                      value={cardForm.cardNumber}
                      onChange={handleCardChange}
                      placeholder="4532 0151 1283 0366"
                      className="w-full pl-10 pr-24 py-2.5 text-sm font-mono border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-extrabold text-brand-terracota bg-brand-tint px-2 py-0.5 rounded-md">
                      {franchise}
                    </span>
                  </div>
                  {cardErrors.cardNumber && (
                    <p className="text-xs text-danger-600 mt-1">{cardErrors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Nombre del titular como aparece en la tarjeta *
                  </label>
                  <input
                    type="text"
                    name="holderName"
                    value={cardForm.holderName}
                    onChange={handleCardChange}
                    placeholder="EJ. JUAN CARLOS PEREZ"
                    className="w-full px-3.5 py-2.5 text-sm uppercase border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                  />
                  {cardErrors.holderName && (
                    <p className="text-xs text-danger-600 mt-1">{cardErrors.holderName}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Vencimiento (MM/AA) *
                    </label>
                    <input
                      type="text"
                      name="expiry"
                      inputMode="numeric"
                      value={cardForm.expiry}
                      onChange={handleCardChange}
                      placeholder="11/29"
                      className="w-full px-3.5 py-2.5 text-sm font-mono border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {cardErrors.expiry && (
                      <p className="text-xs text-danger-600 mt-1">{cardErrors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Código CVV/CVC *
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      inputMode="numeric"
                      value={cardForm.cvv}
                      onChange={handleCardChange}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 text-sm font-mono border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {cardErrors.cvv && (
                      <p className="text-xs text-danger-600 mt-1">{cardErrors.cvv}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Cuotas
                    </label>
                    <select
                      name="installments"
                      value={cardForm.installments}
                      onChange={handleCardChange}
                      className="w-full px-3 py-2.5 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    >
                      {[1, 2, 3, 6, 12, 24, 36].map((n) => (
                        <option key={n} value={String(n)}>
                          {n} {n === 1 ? 'cuota (Contado)' : 'cuotas'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Tipo Doc. Titular
                    </label>
                    <select
                      name="docType"
                      value={cardForm.docType}
                      onChange={handleCardChange}
                      className="w-full px-3 py-2.5 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    >
                      <option value="CC">CC</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">CE</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Documento del titular *
                    </label>
                    <input
                      type="text"
                      name="docNumber"
                      value={cardForm.docNumber}
                      onChange={handleCardChange}
                      placeholder="Número de documento"
                      className="w-full px-3.5 py-2.5 text-sm border border-surface-300 rounded-xl bg-white text-surface-900 focus:outline-none focus:border-brand-terracota"
                    />
                    {cardErrors.docNumber && (
                      <p className="text-xs text-danger-600 mt-1">{cardErrors.docNumber}</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-surface-600">
                  <Lock className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>
                    Tus datos de tarjeta son tokenizados en memoria y verificados con firma
                    criptográfica <strong>HMAC-SHA256</strong>. Jamás almacenamos tu CVV ni el PAN
                    completo.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-brand-terracota hover:bg-brand-orange disabled:opacity-50 text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {submitting
                      ? 'Procesando transacción segura en Payments Way...'
                      : `Pagar ahora ${formatCOP(checkoutSession.amountCOP)}`}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* -------------------------------------------------------
              PASO 3: COMPROBANTE OFICIAL DE PAGO APROBADO
          ------------------------------------------------------- */}
          {step === 3 && receipt && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-2xl p-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-teal">
                  Voucher Oficial · {receipt.gateway}
                </span>
                <h3 className="text-2xl font-extrabold text-surface-900">
                  ¡Transacción {receipt.status}!
                </h3>
                <p className="text-xs text-surface-600">
                  Tu cuenta de comprador ha sido registrada y tu pago fue procesado exitosamente.
                </p>
              </div>

              <div className="bg-white border border-surface-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-surface-100">
                  <div>
                    <p className="text-xs text-surface-500">Referencia de Orden</p>
                    <p className="font-mono font-extrabold text-surface-900">
                      {receipt.orderNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">ID Transacción Payments Way</p>
                    <p className="font-mono font-extrabold text-brand-terracota">
                      {receipt.externalTransactionId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 border-b border-surface-100">
                  <div>
                    <p className="text-xs text-surface-500">Código Autorización</p>
                    <p className="font-mono font-bold text-surface-900">
                      {receipt.authorizationCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Tarjeta / Franquicia</p>
                    <p className="font-bold text-surface-900">
                      {receipt.paymentMethod.franchise} · {receipt.paymentMethod.maskedCard}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Cuotas</p>
                    <p className="font-bold text-surface-900">
                      {receipt.paymentMethod.installments}{' '}
                      {receipt.paymentMethod.installments === 1 ? 'cuota' : 'cuotas'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-surface-100">
                  <div>
                    <p className="text-xs text-surface-500">Comprador Registrado</p>
                    <p className="font-bold text-surface-900">
                      {receipt.comprador.nombres} {receipt.comprador.apellidos}
                    </p>
                    <p className="text-xs text-surface-500">{receipt.comprador.email}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-surface-500">Destino de Entrega</p>
                    <p className="font-bold text-surface-900">
                      {receipt.comprador.ciudad}, {receipt.comprador.pais}
                    </p>
                    <p className="text-xs text-surface-500">{receipt.comprador.direccion}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-extrabold text-surface-900">
                    Total Pagado (COP):
                  </span>
                  <span className="text-2xl font-extrabold text-brand-terracota">
                    {formatCOP(receipt.amountCOP)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-300 bg-white hover:bg-surface-100 text-surface-800 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir comprobante
                </button>
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-terracota hover:bg-brand-orange text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Finalizar y volver a la tienda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
