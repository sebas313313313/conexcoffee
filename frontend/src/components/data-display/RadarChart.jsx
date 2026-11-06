import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

// ============================================
// RadarChart — Gráfica de telaraña SVG pura (compartida)
// ============================================
// Sin dependencias de gráficas externas. Renderiza un polígono radial con
// los atributos sensoriales del café (escala 0 – 10). Los colores provienen
// de los tokens semánticos de `src/styles/index.css` vía variables CSS.
// Usada en: comprador/DetalleVariedadPage y landing/DestinoLoteDetallePage.
// ============================================

const TOKENS = {
  grid: 'var(--color-surface-200)',
  axis: 'var(--color-surface-300)',
  label: 'var(--color-surface-500)',
};

export default function RadarChart({
  data,
  size = 280,
  color = 'var(--color-brand-teal)',
  animated = false,
}) {
  const shapeRef = useRef(null);
  const entries = Object.entries(data || {});
  const total = entries.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.36;
  const labelRadius = size * 0.47;
  const levels = 5; // círculos concéntricos
  const maxValue = 10;

  // Animación de entrada del polígono (anime.js)
  useEffect(() => {
    if (!animated || !shapeRef.current) return undefined;
    const anim = animate(shapeRef.current, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 900,
      ease: 'outElastic(1, .7)',
    });
    return () => anim?.pause();
  }, [animated, data]);

  if (total === 0) return null;

  const angle = (index) => (Math.PI * 2 * index) / total - Math.PI / 2;

  const valueToCoords = (value, index) => {
    const r = (Math.min(Number(value) || 0, maxValue) / maxValue) * maxRadius;
    const a = angle(index);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const dataPoints = entries.map(([, val], i) => valueToCoords(val, i));
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Gráfica de análisis sensorial">
      {/* Círculos de escala */}
      {Array.from({ length: levels }, (_, i) => (
        <circle
          key={`grid-${i}`}
          cx={cx}
          cy={cy}
          r={((i + 1) / levels) * maxRadius}
          fill="none"
          style={{ stroke: TOKENS.grid }}
          strokeWidth={1}
        />
      ))}

      {/* Ejes */}
      {entries.map((_, i) => {
        const end = valueToCoords(maxValue, i);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            style={{ stroke: TOKENS.axis }}
            strokeWidth={1}
          />
        );
      })}

      {/* Números de escala en el eje superior */}
      {Array.from({ length: levels }, (_, i) => (
        <text
          key={`scale-${i}`}
          x={cx + 4}
          y={cy - ((i + 1) / levels) * maxRadius + 2}
          fontSize={8}
          style={{ fill: TOKENS.label }}
        >
          {(((i + 1) / levels) * maxValue).toFixed(0)}
        </text>
      ))}

      {/* Polígono de datos + vértices */}
      <g
        ref={shapeRef}
        style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' }}
      >
        <polygon
          points={polygonPoints}
          style={{ fill: color, stroke: color }}
          fillOpacity={0.25}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {dataPoints.map((p, i) => (
          <circle key={`pt-${i}`} cx={p.x} cy={p.y} r={4} style={{ fill: color }} />
        ))}
      </g>

      {/* Etiquetas */}
      {entries.map(([label], i) => {
        const a = angle(i);
        const lx = cx + labelRadius * Math.cos(a);
        const ly = cy + labelRadius * Math.sin(a);
        const anchor =
          Math.abs(a + Math.PI / 2) < 0.1 ? 'middle' : lx > cx + 5 ? 'start' : lx < cx - 5 ? 'end' : 'middle';
        return (
          <text
            key={`label-${i}`}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={9.5}
            style={{ fill: TOKENS.label }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

