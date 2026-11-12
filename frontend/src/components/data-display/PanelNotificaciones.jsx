import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

export function ListaNotificaciones({ categorias, items, estado }) {
  const [filtro, setFiltro] = useState('todas');
  const visibles = items.filter((item) => filtro === 'todas' || item.categoria === filtro);
  return (
    <>
      <div className="flex flex-wrap gap-1.5 border-b border-surface-200 px-4 py-3" aria-label="Filtrar notificaciones">
        {[{ id: 'todas', nombre: 'Todas' }, ...categorias].map(({ id, nombre }) => (
          <button key={id} type="button" aria-pressed={filtro === id} onClick={() => setFiltro(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filtro === id ? 'bg-brand-tint text-brand-terracota' : 'text-surface-600 hover:bg-surface-100'}`}>
            {nombre}
          </button>
        ))}
      </div>
      {estado ? <p role="status" className="p-4 text-sm text-surface-600">{estado}</p>
        : visibles.length ? (
          <ul className="max-h-[50dvh] divide-y divide-surface-100 overflow-y-auto">
            {visibles.map((item) => {
              const contenido = <>
                <p className="text-xs font-semibold text-brand-terracota">{categorias.find(({ id }) => id === item.categoria)?.nombre}</p>
                <p className="mt-1 break-words font-semibold text-surface-900">
                  {item.codigo && <><span className="font-mono">{item.codigo}</span>{' · '}</>}
                  {item.titulo}
                </p>
                {item.autor && <p className="mt-0.5 text-xs text-surface-600">Por {item.autor}</p>}
                {item.detalle && <p className="mt-0.5 text-xs text-surface-600">{item.detalle}</p>}
                {Number.isFinite(Date.parse(item.fecha)) && <time className="mt-1 block text-xs text-surface-500" dateTime={item.fecha}>{new Date(item.fecha).toLocaleDateString('es-CO')}</time>}
              </>;
              return (
                <li key={item.id} className="text-sm">
                  {item.ruta ? <Link to={item.ruta} className="block px-4 py-3 hover:bg-surface-50">{contenido}</Link>
                    : <div className="px-4 py-3">{contenido}</div>}
                </li>
              );
            })}
          </ul>
        ) : <p className="p-4 text-sm text-surface-600">No hay notificaciones en esta vista.</p>}
    </>
  );
}

export default function PanelNotificaciones({ children, footer }) {
  return (
    <Popover>
      <PopoverButton aria-label="Notificaciones" title="Notificaciones"
        className="cursor-pointer rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700">
        <Bell className="h-5 w-5" />
      </PopoverButton>
      <PopoverPanel anchor="bottom end" className="z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl [--anchor-gap:12px] [--anchor-padding:16px]">
        {({ close }) => (
          <>
            <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
              <h2 className="font-bold text-surface-900">Notificaciones</h2>
              <button type="button" onClick={() => close()} aria-label="Cerrar notificaciones" className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100"><X className="h-4 w-4" /></button>
            </div>
            {children}
            {footer && <div className="border-t border-surface-200 px-4 py-3">{footer}</div>}
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
