import toast from 'react-hot-toast';
import { setStored } from './storage.js';

export function createBrokerActions(state, setters) {
  const { eventos, muestras } = state;
  const { setEventos, setMuestras } = setters;
  // Acciones de Eventos
  const crearEvento = (nuevoEvento) => {
    const eventoCompleto = {
      ...nuevoEvento,
      id: `evt-${Date.now()}`,
      invitados: nuevoEvento.invitados || [],
    };
    const actualizados = [eventoCompleto, ...eventos];
    setEventos(actualizados);
    setStored('conexcoffee_broker_eventos', actualizados);
    toast.success('Evento de catación creado exitosamente');
    return eventoCompleto;
  };

  const invitarCompradoresAEvento = (eventoId, compradoresAInvitar) => {
    const actualizados = eventos.map((ev) => {
      if (ev.id !== eventoId) return ev;
      const existentesIds = new Set((ev.invitados || []).map((i) => i.comprador_id));
      const nuevosInvitados = [...(ev.invitados || [])];

      compradoresAInvitar.forEach((c) => {
        if (!existentesIds.has(c.id)) {
          nuevosInvitados.push({
            comprador_id: c.id,
            nombre: c.nombre,
            empresa: c.empresa,
            pais: c.pais,
            correo: c.correo,
            telefono: c.telefono,
            estado_invitacion: 'Invitación Enviada',
            fecha_envio: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          });
        }
      });
      return { ...ev, invitados: nuevosInvitados };
    });

    setEventos(actualizados);
    setStored('conexcoffee_broker_eventos', actualizados);
    toast.success(`Se enviaron ${compradoresAInvitar.length} invitaciones al evento`);
  };

  const cambiarEstadoInvitacion = (eventoId, compradorId, nuevoEstado) => {
    const actualizados = eventos.map((ev) => {
      if (ev.id !== eventoId) return ev;
      const invitados = (ev.invitados || []).map((inv) =>
        inv.comprador_id === compradorId ? { ...inv, estado_invitacion: nuevoEstado } : inv
      );
      return { ...ev, invitados };
    });
    setEventos(actualizados);
    setStored('conexcoffee_broker_eventos', actualizados);
    toast.success(`Estado de invitación actualizado a: ${nuevoEstado}`);
  };

  // Acciones de Muestras
  const actualizarEstadoMuestra = (muestraId, nuevoEstado) => {
    const actualizados = muestras.map((m) =>
      m.id === muestraId ? { ...m, estado: nuevoEstado } : m
    );
    setMuestras(actualizados);
    setStored('conexcoffee_broker_muestras', actualizados);
    toast.success('Estado de la muestra actualizado');
  };

  const crearSolicitudMuestra = (datosMuestra) => {
    const nueva = {
      ...datosMuestra,
      id: `mst-${Date.now()}`,
      codigo: `MUESTRA-${Date.now().toString().slice(-6)}`,
      fecha_solicitud: new Date().toISOString().slice(0, 10),
      estado: 'En Preparación en Laboratorio',
    };
    const actualizados = [nueva, ...muestras];
    setMuestras(actualizados);
    setStored('conexcoffee_broker_muestras', actualizados);
    toast.success('Solicitud de muestra registrada');
    return nueva;
  };

  return { crearEvento, invitarCompradoresAEvento, cambiarEstadoInvitacion, actualizarEstadoMuestra, crearSolicitudMuestra };
}
