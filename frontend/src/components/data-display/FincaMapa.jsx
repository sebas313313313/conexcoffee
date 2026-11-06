// ============================================
// FincaMapa — Mapa embebido con la ubicación de una finca (compartido)
// ============================================
// Extraído de comprador/DetalleVariedadPage para reutilizarse en la landing.
// ============================================

const MAPS_EMBED_KEY = 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY';

export default function FincaMapa({ lat, lng, nombre = 'Finca', zoom = 12, className = 'h-52' }) {
  if (lat === undefined || lng === undefined) return null;

  return (
    <div className={`rounded-xl overflow-hidden border border-surface-200 ${className}`}>
      <iframe
        title={`Mapa ${nombre}`}
        width="100%"
        height="100%"
        loading="lazy"
        sandbox="allow-scripts allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_EMBED_KEY}&q=${lat},${lng}&zoom=${zoom}`}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );
}

