// ============================================
// FincaMapa — Mapa embebido con la ubicación de una finca (compartido)
// ============================================
// Extraído de comprador/DetalleVariedadPage para reutilizarse en la landing.
// ============================================

export default function FincaMapa({ lat, lng, nombre = 'Finca', zoom = 12, className = 'h-52' }) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const spread = zoom >= 14 ? 0.025 : zoom >= 12 ? 0.07 : 0.18;
  const bbox = [longitude - spread, latitude - spread, longitude + spread, latitude + spread]
    .map((coordinate) => coordinate.toFixed(6))
    .join('%2C');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-surface-200 ${className}`}>
      <iframe
        title={`Mapa ${nombre}`}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={src}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );
}

