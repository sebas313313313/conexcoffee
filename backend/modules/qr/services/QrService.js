import QRCode from 'qrcode';

// Logo SVG por defecto de ConexCoffee (Grano de Café estilizado en Terracota)
const DEFAULT_COFFEE_LOGO_SVG = `
<g transform="translate(0, 0)">
  <!-- Fondo circular blanco con borde terracota -->
  <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#AD2E01" stroke-width="4" />
  <!-- Silueta de Grano de Café -->
  <path d="M50 18 C30 18 20 32 20 50 C20 68 30 82 50 82 C70 82 80 68 80 50 C80 32 70 18 50 18 Z" fill="#AD2E01" />
  <!-- Hendidura curva central del grano -->
  <path d="M50 22 C42 35 58 45 50 58 C42 70 52 76 50 78" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
</g>
`.trim();

/**
 * Servicio para generar códigos QR vectoriales (SVG) de alto rendimiento.
 * Diseñado para soportar miles de códigos por empresa sin consumir memoria de mapa de bits.
 */
class QrService {
  /**
   * Genera el SVG completo de un QR con icono central incrustado.
   * @param {Object} options
   * @param {string} options.data - Texto o URL de trazabilidad
   * @param {number} [options.size=300] - Tamaño del SVG en px
   * @param {string} [options.colorDark='#1E1E1E'] - Color de los módulos QR
   * @param {string} [options.colorLight='#FFFFFF'] - Color de fondo
   * @param {string} [options.logoSvg] - SVG personalizado para el centro (opcional)
   * @param {string} [options.logoUrl] - URL o base64 de imagen PNG/SVG externa (opcional)
   * @param {number} [options.logoSizeRatio=0.22] - Proporción del centro reservada al icono (máx 0.26 para garantizar lectura)
   * @returns {Promise<{ svg: string, dataUrl: string }>}
   */
  async generateSvgWithLogo({
    data,
    size = 300,
    colorDark = '#1E1E1E',
    colorLight = '#FFFFFF',
    logoSvg = null,
    logoUrl = null,
    logoSizeRatio = 0.22,
  }) {
    if (!data || typeof data !== 'string') {
      throw new Error('El parámetro "data" es obligatorio para generar el código QR.');
    }

    // Nivel 'H' (High): tolera hasta un 30% de daño/obstrucción en el centro
    const rawSvg = await QRCode.toString(data, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });

    // Extraer viewBox o dimensiones del SVG generado
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    let vbWidth = size;
    let vbHeight = size;

    if (viewBoxMatch && viewBoxMatch[1]) {
      const parts = viewBoxMatch[1].split(/\s+/).map(Number);
      if (parts.length === 4) {
        vbWidth = parts[2];
        vbHeight = parts[3];
      }
    }

    // Calcular medidas del icono central
    const clampedRatio = Math.min(Math.max(logoSizeRatio, 0.15), 0.25);
    const centerSize = vbWidth * clampedRatio;
    const centerX = (vbWidth - centerSize) / 2;
    const centerY = (vbHeight - centerSize) / 2;

    // Placa protectora blanca detrás del icono para que no interfieran los píxeles del QR
    const shieldRadius = centerSize * 0.15;
    const badgeShield = `
  <!-- Placa central protectora -->
  <rect x="${centerX - 1}" y="${centerY - 1}" width="${centerSize + 2}" height="${centerSize + 2}" rx="${shieldRadius}" ry="${shieldRadius}" fill="${colorLight}" stroke="${colorLight}" stroke-width="2" />
    `.trim();

    let embeddedLogo = '';
    if (logoUrl) {
      // Imagen PNG o SVG enlazada o dataURI en <image>
      embeddedLogo = `
  <image href="${logoUrl}" x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" preserveAspectRatio="xMidYMid meet" />
      `.trim();
    } else if (logoSvg) {
      // SVG vectorial puro inyectado
      embeddedLogo = `
  <svg x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" viewBox="0 0 100 100">
    ${logoSvg}
  </svg>
      `.trim();
    } else {
      // Logo oficial de grano de café de ConexCoffee
      embeddedLogo = `
  <svg x="${centerX}" y="${centerY}" width="${centerSize}" height="${centerSize}" viewBox="0 0 100 100">
    ${DEFAULT_COFFEE_LOGO_SVG}
  </svg>
      `.trim();
    }

    // Inyectar el badge y el logo antes del cierre </svg>
    const injectedSvg = rawSvg.replace(
      /<\/svg>\s*$/,
      `\n${badgeShield}\n${embeddedLogo}\n</svg>`
    );

    // Generar DataURI en formato SVG Base64 (óptimo para poner directo en <img src="...">)
    const base64Svg = Buffer.from(injectedSvg).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return {
      svg: injectedSvg,
      dataUrl,
      size,
      errorCorrection: 'H',
    };
  }

  /**
   * Generación en lote para n precintos / n sacos / n lotes de una empresa
   * @param {Array<{ id: string|number, data: string, label?: string }>} items
   * @param {Object} commonOptions
   */
  async generateBatch(items, commonOptions = {}) {
    if (!Array.isArray(items)) {
      throw new Error('Items debe ser un arreglo.');
    }

    return await Promise.all(
      items.map(async (item) => {
        const qrResult = await this.generateSvgWithLogo({
          data: item.data,
          ...commonOptions,
        });

        return {
          id: item.id,
          label: item.label || null,
          data: item.data,
          ...qrResult,
        };
      })
    );
  }
}

export default new QrService();
