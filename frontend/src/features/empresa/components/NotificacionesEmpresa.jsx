import { useEffect, useState } from 'react';
import { ListaNotificaciones } from '@/components/data-display/PanelNotificaciones';
import { cargarNotificacionesEmpresa, cargarNotificacionesVentas } from '@/context/empresa/notificaciones';

const categorias = [
  { id: 'preofertas', nombre: 'Preofertas' },
  { id: 'muestras', nombre: 'Muestras' },
  { id: 'hojas', nombre: 'Hojas de catación' },
  { id: 'ventas', nombre: 'Ventas' },
];

const ejemplos = [
  { id: 'demo-muestra', categoria: 'muestras', codigo: 'IMP-002', titulo: 'Se registró una muestra', autor: 'Laura Gómez' },
  { id: 'demo-preoferta', categoria: 'preofertas', codigo: 'PRE-003', titulo: 'Se registró una preoferta', autor: 'Carlos Rivera' },
  { id: 'demo-hoja', categoria: 'hojas', codigo: 'CAT-004', titulo: 'Se registró una hoja de catación', autor: 'Ana Martínez' },
];

export default function NotificacionesEmpresa({ empresaId }) {
  const [resultado, setResultado] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      cargarNotificacionesEmpresa(empresaId, controller.signal),
      cargarNotificacionesVentas(empresaId, controller.signal),
    ]).then((resultados) => {
      if (controller.signal.aborted) return;
      const items = resultados.flatMap((item) => item.status === 'fulfilled' ? item.value : []);
      items.sort((a, b) => (Date.parse(b.fecha) || 0) - (Date.parse(a.fecha) || 0));
      setResultado({ items, error: resultados.some((item) => item.status === 'rejected') });
    });
    return () => controller.abort();
  }, [empresaId]);

  const estado = !empresaId ? 'No se encontró la empresa vinculada a tu cuenta.'
    : resultado?.error ? 'Parte de la actividad no está disponible. Vuelve a abrir el panel para reintentar.'
    : !resultado ? 'Cargando notificaciones…' : null;

  const mostrarEjemplos = Boolean(empresaId && resultado && !resultado.items?.length);
  return (
    <>
      {mostrarEjemplos && <p className="bg-brand-tint px-4 py-2 text-xs text-brand-terracota">Datos de prueba · Registros y nombres ficticios</p>}
      <ListaNotificaciones categorias={categorias} items={mostrarEjemplos ? ejemplos : resultado?.items ?? []}
        estado={resultado?.error || mostrarEjemplos ? null : estado} />
      {resultado?.error && <p role="status" className="px-4 py-2 text-xs text-surface-600">{estado}</p>}
    </>
  );
}
