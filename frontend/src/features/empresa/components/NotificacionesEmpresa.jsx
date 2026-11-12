import { useEffect, useState } from 'react';
import { ListaNotificaciones } from '@/components/data-display/PanelNotificaciones';
import { cargarNotificacionesEmpresa } from '@/context/empresa/notificaciones';

const categorias = [
  { id: 'preofertas', nombre: 'Preofertas' },
  { id: 'muestras', nombre: 'Muestras' },
  { id: 'hojas', nombre: 'Hojas de catación' },
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
    cargarNotificacionesEmpresa(empresaId, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResultado({ items });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResultado({ error: true });
      });
    return () => controller.abort();
  }, [empresaId]);

  const estado = !empresaId ? 'No se encontró la empresa vinculada a tu cuenta.'
    : resultado?.error ? 'No se pudo cargar la actividad. Cierra y vuelve a abrir el panel para reintentar.'
    : !resultado ? 'Cargando notificaciones…' : null;

  const mostrarEjemplos = Boolean(empresaId && resultado && !resultado.items?.length);
  return (
    <>
      {mostrarEjemplos && <p className="bg-brand-tint px-4 py-2 text-xs text-brand-terracota">Datos de prueba · Registros y nombres ficticios</p>}
      <ListaNotificaciones categorias={categorias} items={mostrarEjemplos ? ejemplos : resultado?.items ?? []}
        estado={mostrarEjemplos ? null : estado} />
      {mostrarEjemplos && resultado.error && <p role="status" className="px-4 py-2 text-xs text-surface-600">{estado}</p>}
    </>
  );
}
