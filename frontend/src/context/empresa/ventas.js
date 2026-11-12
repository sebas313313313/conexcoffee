import api from '@/lib/axios';
import { readRoleCollection } from '../shared/readRoleCollection';

import { agruparVentas } from './modeloVentas.js';
import { crearVentasDemo } from './ventasDemo.js';

async function cargarVentasRegistradas(empresaId, signal, incluirVariedades) {
  const leer = (url, params) => readRoleCollection(api, { url, params, allPages: true, strictResponse: true }, signal);
  const leerPorIds = async (url, campo, ids) => {
    const unicos = [...new Set(ids.filter(Boolean))];
    const registros = [];
    for (let inicio = 0; inicio < unicos.length; inicio += 30) {
      registros.push(...await leer(url, { [campo]: unicos.slice(inicio, inicio + 30) }));
    }
    return registros;
  };

  const contenedores = await leer('/contenedores-virtuales', { empresa_exportadora_id: empresaId });
  const propios = contenedores.filter((item) => item.empresa_exportadora_id === empresaId);
  const pedidos = await leerPorIds('/pedidos-internacionales', 'contenedor_id', propios.map((item) => item.id));
  const [compradores, pagos, preofertas, variedades] = await Promise.all([
    leerPorIds('/compradores-internacionales', 'id', pedidos.map((item) => item.comprador_id)),
    leerPorIds('/pagos', 'pedido_id', pedidos.map((item) => item.id)),
    incluirVariedades ? leerPorIds('/preofertas', 'id', pedidos.map((item) => item.preoferta_id)) : [],
    incluirVariedades && pedidos.length ? leer('/variedades-cafe') : [],
  ]);
  return agruparVentas(empresaId, propios, pedidos, compradores, pagos, preofertas, variedades);
}

export async function cargarVentasEmpresa(empresaId, signal, incluirVariedades = false) {
  if (!empresaId) return [];
  try {
    const contenedores = await cargarVentasRegistradas(empresaId, signal, incluirVariedades);
    if (import.meta.env.DEV && !contenedores.some((item) => item.ventas.length)) {
      return [...contenedores, ...crearVentasDemo(empresaId)];
    }
    return contenedores;
  } catch (error) {
    if (import.meta.env.DEV && !signal.aborted && ![401, 403].includes(error.response?.status)) {
      return crearVentasDemo(empresaId, true);
    }
    throw error;
  }
}
