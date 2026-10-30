import { createContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../lib/axios';

const LandingContext = createContext();

const COUNTRY_ISO_MAP = {
  México: 'MX',
  Mexico: 'MX',
  Chile: 'CL',
  Brasil: 'BR',
  Canadá: 'CA',
  Canada: 'CA',
  'Estados Unidos': 'US',
  USA: 'US',
  Japón: 'JP',
  Alemania: 'DE',
  España: 'ES',
};

const PUERTO_MAP = {
  MX: 'Puerto de Veracruz, México',
  CL: 'Puerto de Valparaíso, Chile',
  BR: 'Puerto de Santos, Brasil',
  CA: 'Puerto de Vancouver, Canadá',
  US: 'Puerto de Houston, EE.UU.',
  JP: 'Puerto de Yokohama, Japón',
  DE: 'Puerto de Hamburgo, Alemania',
  ES: 'Puerto de Barcelona, España',
};

function mapContenedorPublico(raw, variedadesList = []) {
  const pais = raw.pais_destino || raw.pais || 'México';
  const codigoIso = raw.codigoIso || COUNTRY_ISO_MAP[pais] || 'US';
  const estadoRaw = raw.estado_contenedor || raw.estado || 'ABIERTO';
  const estado =
    estadoRaw === 'ABIERTO'
      ? 'Carga Abierta'
      : estadoRaw === 'EN_TRANSITO'
      ? 'En Tránsito'
      : estadoRaw === 'LLENO'
      ? 'Carga Completa'
      : estadoRaw;

  const badge =
    estadoRaw === 'ABIERTO'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-amber-50 text-amber-700 border border-amber-200';

  const variedades =
    Array.isArray(raw.variedades) && raw.variedades.length > 0
      ? raw.variedades
      : variedadesList.slice(0, 3).map((v) => ({
          nombre: v.nombre_variedad || v.nombre || 'Castillo / Geisha',
          score: '86.5 SCA',
          origen: 'Huila & Cauca, Colombia',
          proceso: 'Lavado con fermentación controlada',
          notas: v.descripcion_botanica || 'Notas dulces a panela, cacao fino y acidez cítrica brillante.',
          disponible: estadoRaw === 'ABIERTO',
        }));

  const fechaZarpe = raw.fecha_estimada_zarpe
    ? String(raw.fecha_estimada_zarpe).slice(0, 10)
    : '2026-06-30';
  const fechaCreacion = raw.fecha_creacion
    ? String(raw.fecha_creacion).slice(0, 10)
    : '2026-05-01';

  const diffMs = new Date(fechaZarpe).getTime() - Date.now();
  const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    id: String(raw.id || pais.toLowerCase()),
    pais,
    codigoIso,
    contenedorId: raw.codigo_contenedor || `CNX-${raw.id || '001'}`,
    empresa: raw.empresa || 'ConexCoffee Export S.A.S.',
    puertoDestino: raw.puerto_destino || PUERTO_MAP[codigoIso] || `Puerto Internacional (${pais})`,
    fechaApertura: fechaCreacion,
    fechaCierre: fechaZarpe,
    estado,
    colorTema: { badge },
    tipoContenedor: 'Dry Van 20ft • GrainPro®',
    temperaturaBodega: '18°C - 20°C',
    humedadControlada: '10.8% - 11.5%',
    diasRestantes,
    variedades:
      variedades.length > 0
        ? variedades
        : [
            {
              nombre: 'Geisha & Bourbon Rosado',
              score: '87.5 SCA',
              origen: 'Pitalito, Huila (1.820 m.s.n.m.)',
              proceso: 'Lavado con fermentación anaeróbica',
              notas: 'Fragancia floral a jazmín, melocotón dulce, acidez málica vibrante y residual prolongado.',
              disponible: true,
            },
          ],
  };
}

export const LandingProvider = ({ children }) => {
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarContenedoresPublicos = useCallback(async () => {
    setLoading(true);
    try {
      const [contRes, varRes] = await Promise.allSettled([
        axiosClient.get('/contenedores', { skipAuthRedirect: true }),
        axiosClient.get('/variedades-cafe', { skipAuthRedirect: true }),
      ]);

      const rawConts =
        contRes.status === 'fulfilled' && Array.isArray(contRes.value.data)
          ? contRes.value.data
          : [];
      const rawVars =
        varRes.status === 'fulfilled' && Array.isArray(varRes.value.data)
          ? varRes.value.data
          : [];

      setContenedores(rawConts.map((c) => mapContenedorPublico(c, rawVars)));
    } catch {
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarContenedoresPublicos();
  }, [cargarContenedoresPublicos]);

  return (
    <LandingContext.Provider
      value={{
        contenedores,
        loading,
        recargar: cargarContenedoresPublicos,
      }}
    >
      {children}
    </LandingContext.Provider>
  );
};

export default LandingContext;
