import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MapPin,
  Building2,
  Navigation,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  X,
  Award,
  AlertCircle,
  FileText,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { sanitizeHTML } from '@/lib/sanitize';

// ============================================
// Empresas Regionales de Café en Colombia
// ============================================

const EMPRESAS_REGIONALES = [
  {
    id: 'emp-cauca',
    name: 'Tecnicafé — Parque Tecnológico de Innovación en Café',
    shortName: 'Tecnicafé',
    department: 'Cauca',
    municipality: 'Cajibío / Popayán',
    logo: '/images/pagina-web/sponsors/logo_tecnicafe.png',
    photo: '/images/pagina-web/cafe2-conexcoffe.png',
    description:
      'Centro de innovación agroindustrial y laboratorio de referencia internacional. Evaluamos física y sensorialmente tu cosecha para compras locales y despachos consolidados de exportación.',
    varieties: ['Castillo', 'Colombia', 'Caturra', 'Geisha', 'Bourbon Rosado'],
    requirements: [
      'Muestra representativa de 250g en pergamino seco',
      'Humedad entre el 10.0% y 11.5%',
      'Puntaje SCA mínimo de 84.0 puntos para compras especiales',
    ],
    contactPhone: '+57 321 711 4140',
    contactEmail: 'compras.cauca@conexcoffee.com',
    mapCoords: { x: 33, y: 72 }, // Porcentajes en mapa de Colombia
    tipoCompra: 'Microlotes y Lotes Comerciales de Especialidad',
  },
  {
    id: 'emp-huila',
    name: 'Café Origen Huila S.A.S.',
    shortName: 'Alianza Huila Sur',
    department: 'Huila',
    municipality: 'Pitalito / San Agustín / Garzón',
    logo: '/images/pagina-web/sponsors/logo_innprocafe.png',
    photo: '/images/pagina-web/cafe2-conexcoffe-2.jpg',
    description:
      'Compañía exportadora regional dedicada a la adquisición de cafés excepcionales en el sur del Huila. Ofrecemos precios prima superiores al mercado por factor de rendimiento y taza limpia.',
    varieties: ['Caturra', 'Bourbon Rosado', 'Tabi', 'Castillo'],
    requirements: [
      'Lotes desde 3 cargas en adelante',
      'Factor de rendimiento menor a 92',
      'Trazabilidad comprobable de finca y beneficiadero',
    ],
    contactPhone: '+57 310 456 7890',
    contactEmail: 'origenhuila@conexcoffee.com',
    mapCoords: { x: 42, y: 68 },
    tipoCompra: 'Lotes de Exportación y Microlotes',
  },
  {
    id: 'emp-narino',
    name: 'Exportadora Nariño Specialty Coffee',
    shortName: 'Nariño Specialty',
    department: 'Nariño',
    municipality: 'Buesaco / La Unión / Pasto',
    logo: '/images/pagina-web/sponsors/logo_procolombia.png',
    photo: '/images/pagina-web/cafe2-conexcoffe-3.png',
    description:
      'Acopiadora especializada en cafés de altitud extrema en el departamento de Nariño. Conectamos directamente con tostadores premium de Asia, Europa y Norteamérica.',
    varieties: ['Geisha', 'Castillo', 'Caturra', 'Maragogipe'],
    requirements: [
      'Cultivos por encima de 1.750 msnm',
      'Secado lento bajo marquesina',
      'Puntaje de taza 85.0+ SCA',
    ],
    contactPhone: '+57 315 789 1234',
    contactEmail: 'narino.specialty@conexcoffee.com',
    mapCoords: { x: 25, y: 82 },
    tipoCompra: 'Cafés de Alta Altitud y Procesos Especiales',
  },
  {
    id: 'emp-antioquia',
    name: 'Cooperativa Antioquia Café de Origen',
    shortName: 'Antioquia Origen',
    department: 'Antioquia',
    municipality: 'Fredonia / Jericó / Andes',
    logo: '/images/pagina-web/sponsors/logo_buxtar.png',
    photo: '/images/pagina-web/img-work-team-3.png',
    description:
      'Consorcio de compra regional en el suroeste y occidente antioqueño. Pago transparente e inmediato contra análisis de laboratorio físico con liquidación clara al caficultor.',
    varieties: ['Colombia', 'Castillo', 'Catuaí', 'Bourbon'],
    requirements: [
      'Humedad estándar 11%',
      'Cédula cafetera o registro de predio',
      'Mínimo 5 cargas de café pergamino seco',
    ],
    contactPhone: '+57 300 234 5678',
    contactEmail: 'antioquia@conexcoffee.com',
    mapCoords: { x: 38, y: 38 },
    tipoCompra: 'Café Pergamino Seco y Pasillas Seleccionadas',
  },
  {
    id: 'emp-tolima',
    name: 'Compañía Cafetera Tolima Real',
    shortName: 'Tolima Real',
    department: 'Tolima',
    municipality: 'Planadas / Ibagué / Chaparral',
    logo: '/images/pagina-web/sponsors/logo_innpulsa.png',
    photo: '/images/pagina-web/img-work-team.png',
    description:
      'Empresa enfocada en la compra directa a familias caficultoras del Tolima y zonas de transición. Apoyamos la sostenibilidad y la certificación de origen.',
    varieties: ['Castillo', 'Caturra', 'Bourbon Amarillo', 'Tabi'],
    requirements: [
      'Taza limpia sin defectos de fermento o tierra',
      'Compromiso de entrega de contra-muestra',
      'Lotes familiares o asociativos',
    ],
    contactPhone: '+57 312 678 9012',
    contactEmail: 'tolima@conexcoffee.com',
    mapCoords: { x: 41, y: 55 },
    tipoCompra: 'Comercio Justo y Cafés de Altura',
  },
  {
    id: 'emp-sierra',
    name: 'AgroCafé Sierra Nevada & Caribe',
    shortName: 'Sierra Nevada Caribe',
    department: 'Magdalena / Cesar',
    municipality: 'Santa Marta / Ciénaga / Valledupar',
    logo: '/images/pagina-web/sponsors/logo_camara.png',
    photo: '/images/pagina-web/img-work-team-2.png',
    description:
      'Líderes en compra y consolidación de café bajo sombra en el macizo de la Sierra Nevada. Alta demanda de cafés orgánicos y con sello de sostenibilidad.',
    varieties: ['Typica', 'Caturra Orgánico', 'Castillo'],
    requirements: [
      'Cultivo bajo sombra',
      'Certificación orgánica o en transición (deseable)',
      'Humedad entre 10.5% y 11.8%',
    ],
    contactPhone: '+57 318 901 2345',
    contactEmail: 'sierranevada@conexcoffee.com',
    mapCoords: { x: 48, y: 15 },
    tipoCompra: 'Cafés Orgánicos y Bajo Sombra',
  },
];

export default function EmpresasRegionalesModal({ isOpen, onClose }) {
  const [selectedEmpresa, setSelectedEmpresa] = useState(EMPRESAS_REGIONALES[0]);
  const [viewStep, setViewStep] = useState('map'); // 'map' | 'form' | 'success'
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [radicadoCode, setRadicadoCode] = useState('');

  // Estados de archivos
  const [fileScaName, setFileScaName] = useState('');
  const [filePredioName, setFilePredioName] = useState('');
  const [fileCertExtraName, setFileCertExtraName] = useState('');

  // Formulario Caficultor
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    cedula: '',
    tipoProductor: 'Propietario de Finca',
    telefono: '',
    email: '',
    departamento: 'Cauca',
    municipio: '',
    vereda: '',
    nombreFinca: '',
    altitud: '',
    variedadCafe: 'Castillo',
    procesoBeneficio: 'Lavado Tradicional',
    cantidadEstimada: '',
    unidadMedida: 'Cargas (125 kg)',
    estadoCafe: 'Pergamino Seco Listo para Despacho',
    precioEsperado: '',
    notasAdicionales: '',
  });

  if (!isOpen) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no es soportada por tu navegador.');
      return;
    }

    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapturingGps(false);
        const loc = {
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy),
        };
        setGpsLocation(loc);
        toast.success(`Ubicación capturada: Lat ${loc.lat}, Lng ${loc.lng}`);
      },
      (err) => {
        setCapturingGps(false);
        toast.error(`No se pudo obtener la ubicación: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const safeNombre = sanitizeHTML(formData.nombreCompleto);
    const code = `RAD-${selectedEmpresa.department.slice(0, 3).toUpperCase()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    setTimeout(() => {
      setSubmitting(false);
      setRadicadoCode(code);
      setViewStep('success');
      toast.success(
        `¡Gracias ${safeNombre || 'Productor'}! Oferta enviada exitosamente a ${selectedEmpresa.name}. Radicado: ${code}`
      );
    }, 900);
  };

  const handleResetModal = () => {
    setViewStep('map');
    setGpsLocation(null);
    setFileScaName('');
    setFilePredioName('');
    setFileCertExtraName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-surface-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-terracota text-white flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange block">
                Plataforma de Conexión Caficultor — Empresa Regional
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {viewStep === 'map' && 'Directorio & Mapa de Empresas Regionales'}
                {viewStep === 'form' && `Enviar Oferta de Cosecha a: ${selectedEmpresa.shortName}`}
                {viewStep === 'success' && 'Oferta Radicada con Éxito'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewStep === 'form' && (
              <button
                type="button"
                onClick={() => setViewStep('map')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Volver al Mapa</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetModal}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-50">
          {/* ====================================================
              VISTA 1: MAPA DE COLOMBIA + EMPRESAS REGIONALES
              ==================================================== */}
          {viewStep === 'map' && (
            <div className="space-y-6">
              {/* Aviso explicativo para el caficultor */}
              <div className="p-4 rounded-xl bg-primary-100 border-l-4 border-brand-terracota flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-brand-terracota shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-surface-800">
                  <p className="font-bold text-brand-terracota">
                    ¿Cómo funciona la venta directa de tu cosecha?
                  </p>
                  <p className="mt-0.5 leading-relaxed text-surface-700">
                    Selecciona en el mapa la empresa de tu región o zona de influencia. Al enviar los datos de tu cosecha,
                    la empresa evaluará la ficha técnica y muestras. <strong>Si tu café es aprobado</strong>, se
                    establecerá contacto directo para convenir precio justo, recolección y formalización comercial.
                  </p>
                </div>
              </div>

              {/* Contenedor Mapa interactivo + Ficha de empresa */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LADO IZQUIERDO: Mapa SVG estilizado de Colombia con Pines */}
                <div className="lg:col-span-5 bg-stone-900 p-5 rounded-xl border border-stone-800 shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 text-xs text-white">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-brand-orange">
                      <Compass className="h-4 w-4" />
                      Mapa de Empresas en Colombia
                    </span>
                    <span className="text-stone-400 text-[11px]">Haz click en un pin</span>
                  </div>

                  {/* Mapa geográfico real; los pines conservan el selector de empresas. */}
                  <div className="relative w-full aspect-4/5 bg-stone-950 rounded-lg border border-stone-800 overflow-hidden flex items-center justify-center p-2">
                    <iframe title="Mapa de Colombia" src="https://www.openstreetmap.org/export/embed.html?bbox=-79.2%2C-4.9%2C-66.7%2C13.8&layer=mapnik" className="absolute inset-0 h-full w-full border-0 opacity-85" loading="lazy" />
                    {/* Silueta vectorial esquemática de Colombia */}
                    <svg
                      viewBox="0 0 300 380"
                      className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] text-stone-800 opacity-35 select-none pointer-events-none"
                    >
                      {/* Océanos / Límites */}
                      <rect width="300" height="380" fill="#0c0a09" />
                      {/* Silueta simplificada de Colombia */}
                      <path
                        d="M130,25 Q170,30 180,60 Q190,85 160,95 Q150,110 165,130 Q195,140 210,170 Q230,200 240,240 Q210,270 190,320 Q160,360 140,370 Q130,350 120,330 Q105,300 90,290 Q65,270 50,260 Q55,230 75,215 Q80,180 85,150 Q95,115 110,80 Q115,50 130,25 Z"
                        fill="#1c1917"
                        stroke="#292524"
                        strokeWidth="2"
                      />
                      {/* Costas Caribe y Pacífica */}
                      <path
                        d="M130,25 Q170,30 180,60"
                        stroke="#F25433"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />
                      <path
                        d="M50,260 Q55,230 75,215 Q80,180 85,150 Q95,115 110,80"
                        stroke="#AD2E01"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="2,2"
                      />

                      {/* Líneas de conexión o radar */}
                      <circle cx="150" cy="190" r="120" stroke="#292524" strokeWidth="0.5" fill="none" />
                      <circle cx="150" cy="190" r="70" stroke="#292524" strokeWidth="0.5" fill="none" />
                    </svg>

                    {/* Pines interactivos sobre el mapa */}
                    {EMPRESAS_REGIONALES.map((emp) => {
                      const isSelected = selectedEmpresa.id === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setSelectedEmpresa(emp)}
                          style={{
                            left: `${emp.mapCoords.x}%`,
                            top: `${emp.mapCoords.y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 z-20 ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                          }`}
                          title={`${emp.name} (${emp.department})`}
                        >
                          <div className="relative flex items-center justify-center">
                            {/* Onda de pulso si está seleccionada */}
                            {isSelected && (
                              <span className="absolute w-8 h-8 rounded-full bg-brand-orange opacity-60 animate-ping" />
                            )}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 ${
                                isSelected
                                  ? 'bg-brand-orange border-white text-white'
                                  : 'bg-brand-terracota border-stone-900 text-white group-hover:bg-brand-orange'
                              }`}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            {/* Etiqueta flotante */}
                            <span
                              className={`absolute left-7 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none transition-opacity ${
                                isSelected
                                  ? 'bg-white text-stone-950 opacity-100'
                                  : 'bg-stone-900 text-stone-300 opacity-80 group-hover:opacity-100'
                              }`}
                            >
                              {emp.department}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector rápido de departamento en móvil */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                      O selecciona la empresa regional por lista:
                    </label>
                    <select
                      value={selectedEmpresa.id}
                      onChange={(e) => {
                        const found = EMPRESAS_REGIONALES.find((emp) => emp.id === e.target.value);
                        if (found) setSelectedEmpresa(found);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-stone-800 text-white border border-stone-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    >
                      {EMPRESAS_REGIONALES.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.department} — {emp.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* LADO DERECHO: Ficha de la Empresa Seleccionada */}
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex flex-col justify-between space-y-5">
                  {/* Cabecera Empresa */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-brand-terracota text-xs font-extrabold uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5" />
                        Región {selectedEmpresa.department}
                      </span>
                      <span className="text-xs font-semibold text-surface-500">
                        {selectedEmpresa.municipality}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-surface-900">
                      {selectedEmpresa.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-surface-600 leading-relaxed">
                      {selectedEmpresa.description}
                    </p>
                  </div>

                  {/* Imagen y Datos Clave */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-surface-50 p-4 rounded-xl border border-surface-200">
                    <div className="sm:col-span-5 aspect-4/3 rounded-lg overflow-hidden bg-stone-900 border border-surface-300">
                      <img
                        src={selectedEmpresa.photo}
                        alt={selectedEmpresa.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-surface-900 block">Tipo de Compra:</span>
                        <span className="text-surface-600">{selectedEmpresa.tipoCompra}</span>
                      </div>
                      <div>
                        <span className="font-bold text-surface-900 block">Variedades de Interés:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedEmpresa.varieties.map((v) => (
                            <span
                              key={v}
                              className="px-2 py-0.5 rounded bg-white text-surface-700 border border-surface-300 text-[10px] font-semibold"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requisitos para Aprobación */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-terracota flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Requisitos de Compra para Aprobación
                    </h4>
                    <div className="space-y-1.5">
                      {selectedEmpresa.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-surface-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-terracota shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Acción Principal */}
                  <div className="pt-2 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-surface-500 text-center sm:text-left">
                      <span>¿Tienes café disponible en esta región?</span>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => setViewStep('form')}
                      className="w-full sm:w-auto gap-2 bg-brand-orange hover:bg-brand-terracota text-white font-bold"
                    >
                      <span>Contactar Empresa / Enviar Oferta</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              VISTA 2: FORMULARIO COMPLETO PARA EL CAFICULTOR
              ==================================================== */}
          {viewStep === 'form' && (
            <form onSubmit={handleSubmitOffer} className="space-y-6">
              {/* Resumen de la Empresa Destino */}
              <div className="p-4 rounded-xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-terracota text-white flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                      Empresa Seleccionada
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {selectedEmpresa.name}
                    </h4>
                    <p className="text-xs text-stone-300">
                      Sede: {selectedEmpresa.municipality} ({selectedEmpresa.department})
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-stone-400">
                  <span>Atención compras: </span>
                  <strong className="text-white block">{selectedEmpresa.contactPhone}</strong>
                </div>
              </div>

              {/* 1. Datos del Caficultor */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-surface-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2 text-brand-terracota">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-brand-terracota text-xs flex items-center justify-center font-extrabold">
                    1
                  </span>
                  Datos del Caficultor / Productor
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Nombre Completo *
                    </label>
                    <Input
                      required
                      placeholder="Ej. Gustavo Morales Perea"
                      value={formData.nombreCompleto}
                      onChange={(e) =>
                        setFormData({ ...formData, nombreCompleto: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Cédula de Ciudadanía *
                    </label>
                    <Input
                      required
                      placeholder="Ej. 10.456.789"
                      value={formData.cedula}
                      onChange={(e) =>
                        setFormData({ ...formData, cedula: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Tipo de Productor *
                    </label>
                    <select
                      value={formData.tipoProductor}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoProductor: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="Propietario de Finca">Propietario de Finca</option>
                      <option value="Administrador / Encargado">Administrador / Encargado</option>
                      <option value="Representante de Cooperativa / Asociación">
                        Representante de Cooperativa / Asociación
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Teléfono Celular / WhatsApp *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="Ej. 320 000 0000"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Correo Electrónico *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="gustavo@ejemplo.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 2. Ubicación de la Finca & Geolocalización */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-surface-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2 text-brand-terracota">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-brand-terracota text-xs flex items-center justify-center font-extrabold">
                      2
                    </span>
                    Ubicación de la Finca & Geolocalización
                  </h3>

                  {/* Botón para Capturar GPS */}
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={capturingGps}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 transition-colors cursor-pointer"
                  >
                    <Navigation className={`h-3.5 w-3.5 text-brand-orange ${capturingGps ? 'animate-spin' : ''}`} />
                    <span>{capturingGps ? 'Obteniendo GPS...' : '📍 Capturar Mi Ubicación Actual'}</span>
                  </button>
                </div>

                {/* Badge de coordenadas GPS capturadas */}
                {gpsLocation && (
                  <div className="p-3 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-between text-xs text-stone-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-terracota" />
                      <span>
                        <strong>Coordenadas GPS fijadas:</strong> Latitud: {gpsLocation.lat}, Longitud: {gpsLocation.lng} (Margen: ±{gpsLocation.accuracy}m)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-brand-terracota uppercase">Verificado</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Departamento *
                    </label>
                    <Input
                      required
                      placeholder="Ej. Cauca"
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({ ...formData, departamento: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Municipio *
                    </label>
                    <Input
                      required
                      placeholder="Ej. Inzá"
                      value={formData.municipio}
                      onChange={(e) =>
                        setFormData({ ...formData, municipio: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Vereda *
                    </label>
                    <Input
                      required
                      placeholder="Ej. San Antonio"
                      value={formData.vereda}
                      onChange={(e) =>
                        setFormData({ ...formData, vereda: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Nombre de la Finca / Predio *
                    </label>
                    <Input
                      required
                      placeholder="Ej. Finca El Mirador"
                      value={formData.nombreFinca}
                      onChange={(e) =>
                        setFormData({ ...formData, nombreFinca: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Altitud Promedio (msnm)
                    </label>
                    <Input
                      type="number"
                      placeholder="Ej. 1820"
                      value={formData.altitud}
                      onChange={(e) =>
                        setFormData({ ...formData, altitud: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 3. Datos Técnicos de la Cosecha */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-surface-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2 text-brand-terracota">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-brand-terracota text-xs flex items-center justify-center font-extrabold">
                    3
                  </span>
                  Datos del Café & Volumen Producido
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Variedad de Café *
                    </label>
                    <select
                      value={formData.variedadCafe}
                      onChange={(e) =>
                        setFormData({ ...formData, variedadCafe: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="Castillo">Castillo</option>
                      <option value="Caturra">Caturra</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Geisha">Geisha</option>
                      <option value="Bourbon Rosado">Bourbon Rosado</option>
                      <option value="Bourbon Amarillo">Bourbon Amarillo</option>
                      <option value="Tabi">Tabi</option>
                      <option value="Typica">Typica</option>
                      <option value="Maragogipe">Maragogipe</option>
                      <option value="Mezcla / Varietal Mixto">Mezcla / Varietal Mixto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Proceso de Beneficio *
                    </label>
                    <select
                      value={formData.procesoBeneficio}
                      onChange={(e) =>
                        setFormData({ ...formData, procesoBeneficio: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="Lavado Tradicional">Lavado Tradicional</option>
                      <option value="Yellow / Red Honey">Yellow / Red Honey</option>
                      <option value="Natural / Secado en Cereza">Natural / Secado en Cereza</option>
                      <option value="Fermentación Anaeróbica">Fermentación Anaeróbica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Estado Actual del Lote *
                    </label>
                    <select
                      value={formData.estadoCafe}
                      onChange={(e) =>
                        setFormData({ ...formData, estadoCafe: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="Pergamino Seco Listo para Despacho">
                        Pergamino Seco Listo para Despacho
                      </option>
                      <option value="En Proceso de Secado">En Proceso de Secado</option>
                      <option value="En Árbol / Próxima Recolección">
                        En Árbol / Próxima Recolección
                      </option>
                      <option value="Café Verde Trillado">Café Verde Trillado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Cantidad Producida / Disponible *
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="Ej. 15"
                      value={formData.cantidadEstimada}
                      onChange={(e) =>
                        setFormData({ ...formData, cantidadEstimada: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Unidad de Medida *
                    </label>
                    <select
                      value={formData.unidadMedida}
                      onChange={(e) =>
                        setFormData({ ...formData, unidadMedida: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="Cargas (125 kg)">Cargas (125 kg pergamino)</option>
                      <option value="Sacos (60 kg)">Sacos (60 kg)</option>
                      <option value="Kilogramos (kg)">Kilogramos (kg)</option>
                      <option value="Arrobas (12.5 kg)">Arrobas (12.5 kg)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Precio Esperado (Opcional)
                    </label>
                    <Input
                      placeholder="Ej. $2.200.000 / carga o A convenir"
                      value={formData.precioEsperado}
                      onChange={(e) =>
                        setFormData({ ...formData, precioEsperado: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 4. Adjuntar Certificados & Estudios (Facilitar Aprobación) */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-surface-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2 text-brand-terracota">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-brand-terracota text-xs flex items-center justify-center font-extrabold">
                      4
                    </span>
                    Certificados & Documentos de Apoyo
                  </h3>
                  <p className="text-xs text-surface-500 mt-1">
                    Adjuntar análisis previos de laboratorio o certificados agiliza de inmediato la aprobación de compra por parte de la empresa.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Documento 1: Análisis Sensorial / SCA previo */}
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Análisis Sensorial / Catación SCA (Opcional)
                    </label>
                    <label className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-surface-300 hover:border-brand-orange bg-surface-50 text-surface-600 text-xs cursor-pointer transition-colors text-center">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFileScaName(e.target.files?.[0]?.name || '')}
                        className="hidden"
                      />
                      <FileCheck className="h-5 w-5 text-brand-terracota mb-1" />
                      <span className="truncate max-w-full font-semibold">
                        {fileScaName || 'Subir reporte de catación'}
                      </span>
                      <span className="text-[10px] text-surface-400">PDF, JPG máx 10MB</span>
                    </label>
                  </div>

                  {/* Documento 2: Registro de Predio / Cédula Cafetera */}
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Registro de Predio o Cédula Cafetera (Opcional)
                    </label>
                    <label className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-surface-300 hover:border-brand-orange bg-surface-50 text-surface-600 text-xs cursor-pointer transition-colors text-center">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFilePredioName(e.target.files?.[0]?.name || '')}
                        className="hidden"
                      />
                      <FileText className="h-5 w-5 text-brand-terracota mb-1" />
                      <span className="truncate max-w-full font-semibold">
                        {filePredioName || 'Subir cédula cafetera / ICA'}
                      </span>
                      <span className="text-[10px] text-surface-400">PDF, JPG máx 10MB</span>
                    </label>
                  </div>

                  {/* Documento 3: Certificado Orgánico / Sostenibilidad */}
                  <div>
                    <label className="block text-xs font-bold text-surface-800 mb-1">
                      Certificación Orgánica / Sello (Opcional)
                    </label>
                    <label className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-surface-300 hover:border-brand-orange bg-surface-50 text-surface-600 text-xs cursor-pointer transition-colors text-center">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFileCertExtraName(e.target.files?.[0]?.name || '')}
                        className="hidden"
                      />
                      <Award className="h-5 w-5 text-brand-terracota mb-1" />
                      <span className="truncate max-w-full font-semibold">
                        {fileCertExtraName || 'Fairtrade, Rainforest, etc.'}
                      </span>
                      <span className="text-[10px] text-surface-400">PDF, JPG máx 10MB</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-800 mb-1">
                    Notas adicionales o descripción del secado
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notasAdicionales}
                    onChange={(e) =>
                      setFormData({ ...formData, notasAdicionales: e.target.value })
                    }
                    placeholder="Menciona detalles de beneficiadero, días de secado, horas de fermentación o disponibilidad..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-surface-300 bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>

              {/* Aviso legal y de aprobación */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-300 text-xs text-stone-700 leading-relaxed">
                <strong>Aviso de Aprobación Comercial:</strong> Al enviar este formulario, la empresa{' '}
                <strong>{selectedEmpresa.name}</strong> recibirá directamente tu radicado. Si tu oferta
                cumple los estándares, recibirás una llamada o mensaje a tu WhatsApp ({formData.telefono || 'teléfono registrado'})
                para coordinar la contra-muestra física y la oferta formal de compra.
              </div>

              {/* Botones de Envío */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setViewStep('map')}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full sm:w-auto gap-2 bg-brand-orange hover:bg-brand-terracota text-white font-extrabold"
                >
                  <UploadCloud className="h-5 w-5" />
                  <span>ENVIAR OFERTA A LA EMPRESA</span>
                </Button>
              </div>
            </form>
          )}

          {/* ====================================================
              VISTA 3: CONFIRMACIÓN Y RADICADO EXITOSO
              ==================================================== */}
          {viewStep === 'success' && (
            <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-brand-terracota flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-terracota block mb-1">
                  Oferta Transmitida
                </span>
                <h3 className="text-2xl font-extrabold text-surface-900">
                  ¡Tu cosecha ha sido postulada exitosamente!
                </h3>
                <p className="text-xs sm:text-sm text-surface-600 mt-2 leading-relaxed">
                  Los datos de tu finca y cosecha han sido radicados en el sistema de compras de{' '}
                  <strong>{selectedEmpresa.name}</strong>.
                </p>
              </div>

              {/* Código de Radicado */}
              <div className="p-4 rounded-xl bg-stone-900 text-white border border-stone-800 max-w-xs mx-auto">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                  Número de Radicado Oficial
                </span>
                <span className="text-lg font-mono font-extrabold text-brand-orange tracking-wider block mt-0.5">
                  {radicadoCode}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-100 text-left text-xs text-surface-700 space-y-2 border border-surface-200">
                <div className="flex items-center gap-2 font-bold text-surface-900">
                  <ShieldCheck className="h-4 w-4 text-brand-terracota" />
                  <span>Siguientes Pasos:</span>
                </div>
                <p>
                  1. Un analista técnico de la empresa revisará la ficha y certificados adjuntos.
                </p>
                <p>
                  2. Si es aprobada, te contactarán al WhatsApp <strong>{formData.telefono}</strong> para programar la toma o envío de muestra física de 250g.
                </p>
                <p>
                  3. Una vez catada, se emitirá la orden de compra con pago justo garantizado.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleResetModal}
                  className="bg-brand-orange hover:bg-brand-terracota text-white"
                >
                  Finalizar y Cerrar
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setViewStep('map');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-surface-700 hover:text-surface-900 bg-white border border-surface-300 rounded-lg cursor-pointer"
                >
                  Explorar Otras Empresas Regionales
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
