import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate } from 'animejs';
import useAuth from '@/hooks/useAuth';
import useUIStore from '@/store/useUIStore';
import { ROLES } from '@/lib/constants';
import { Menu, LogOut, User, Bell } from 'lucide-react';

// ============================================
// Header — Barra superior del dashboard
// ============================================
// Muestra: botón de menú (mobile), buscador, notificaciones, perfil.
// ============================================

export default function Header() {
  const { user, role, logout } = useAuth();
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
          <button className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors relative cursor-pointer">
            <Bell className="h-5 w-5" />
            {/* Badge de notificación */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

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
