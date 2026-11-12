import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate } from 'animejs';
import useAuth from '@/hooks/useAuth';
import useUIStore from '@/store/useUIStore';
import { ROLES } from '@/lib/constants';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/axios';
import PanelNotificaciones from '@/components/data-display/PanelNotificaciones';
import NotificacionesEmpresa from '@/features/empresa/components/NotificacionesEmpresa';

// ============================================
// Header — Barra superior del dashboard
// ============================================
// Muestra: botón de menú (mobile), buscador, notificaciones, perfil.
// ============================================

export default function Header() {
  const { user, role, logout, getPushSubscription, enablePush, disablePush } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const pushSupported = typeof window !== 'undefined' && window.isSecureContext &&
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  useEffect(() => {
    if (!pushSupported) return;
    let active = true;
    getPushSubscription().then((subscription) => {
      if (active) setPushEnabled(Boolean(subscription));
    }).catch(() => {});
    return () => { active = false; };
  }, [getPushSubscription, pushSupported]);

  const togglePush = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (pushEnabled) {
        await disablePush();
        setPushEnabled(false);
        toast.success('Notificaciones desactivadas');
      } else {
        await enablePush();
        setPushEnabled(true);
        toast.success('Notificaciones activadas');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPushBusy(false);
    }
  };
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const navigate = useNavigate();
  const menuBtnRef = useRef(null);

  const handleToggleMenu = () => {
    if (menuBtnRef.current) {
      animate(menuBtnRef.current, {
        rotate: [0, 90, 0],
        scale: [1, 0.85, 1.08, 1],
        duration: 380,
        ease: 'outBack',
      });
    }
    toggleSidebar();
  };

  const handleMenuHover = () => {
    if (menuBtnRef.current) {
      animate(menuBtnRef.current, {
        scale: 1.12,
        duration: 200,
        ease: 'outCubic',
      });
    }
  };

  const handleMenuLeave = () => {
    if (menuBtnRef.current) {
      animate(menuBtnRef.current, {
        scale: 1,
        duration: 200,
        ease: 'outCubic',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };


  const rolMostrar =
    role === ROLES.CAFICULTOR || user?.role === ROLES.CAFICULTOR
      ? 'Caficultor'
      : role
      ? role.charAt(0).toUpperCase() + role.slice(1)
      : 'Caficultor';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-surface-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Hamburger menu button — Animado y heredado para todos los roles */}
        <button
          ref={menuBtnRef}
          type="button"
          onClick={handleToggleMenu}
          onMouseEnter={handleMenuHover}
          onMouseLeave={handleMenuLeave}
          className="p-2 rounded-xl text-surface-600 hover:text-stone-900 hover:bg-surface-100 transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-terracota/30"
          title={sidebarOpen ? 'Colapsar menú lateral' : 'Expandir menú lateral'}
          aria-label="Menú principal"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          {role === ROLES.EMPRESA ? (
            <PanelNotificaciones footer={
              <button type="button" onClick={togglePush} disabled={!pushSupported || pushBusy}
                className="text-xs font-semibold text-brand-terracota disabled:text-surface-500">
                {!pushSupported ? 'Notificaciones del navegador no disponibles'
                  : pushBusy ? 'Actualizando…'
                  : pushEnabled ? 'Desactivar avisos del navegador' : 'Activar avisos del navegador'}
              </button>
            }>
              <NotificacionesEmpresa key={user?.empresa_id} empresaId={user?.empresa_id} />
            </PanelNotificaciones>
          ) : <button type="button" onClick={togglePush} disabled={!pushSupported || pushBusy}
            title={pushSupported ? (pushEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones') : 'Notificaciones no disponibles en este navegador'}
            aria-label={pushEnabled ? 'Desactivar notificaciones' : 'Activar notificaciones'}
            aria-pressed={pushEnabled}
            className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <Bell className="h-5 w-5" />
            {pushEnabled && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-terracota rounded-full" />}
          </button>}

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-amber-100 text-brand-terracota flex items-center justify-center font-bold text-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-tight">
                {user?.name || 'Finca La Esperanza'}
              </span>
              <span className="text-[11px] font-semibold text-brand-terracota leading-tight">
                {rolMostrar}
              </span>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-surface-500 hover:bg-danger-50 hover:text-danger-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
