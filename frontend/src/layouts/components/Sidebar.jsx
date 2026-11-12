import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import useAuthStore from '@/store/useAuthStore';
import useUIStore from '@/store/useUIStore';
import { ROLES } from '@/lib/constants';
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  Handshake,
  Leaf,
  ShoppingCart,
  ChevronLeft,
  X,
  Building2,
  FlaskConical,
  Archive,
  Gift,
  UserCheck,
  Globe,
  Coffee,
  FileText,
  Award,
  Layers,
  Tag,
  ClipboardCheck,
  Store,
  Newspaper,
  PackageCheck,
  Calendar,
} from 'lucide-react';

// ============================================
// Sidebar — Navegación lateral por rol
// ============================================
// La navegación cambia dinámicamente según el rol del usuario.
// Cada rol tiene su propio set de links basados en el sistema original.
// ============================================

/**
 * Definición de navegación por rol.
 * Para agregar un nuevo módulo a un rol, solo hay que añadir un item aquí.
 */
const NAV_BY_ROLE = {
  [ROLES.SUPERADMIN]: [
    { label: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Caficultores', path: '/superadmin/caficultores', icon: Leaf },
    { label: 'Catadores', path: '/superadmin/catadores', icon: Award },
    { label: 'Empresas', path: '/superadmin/empresas', icon: Building2 },
    { label: 'Brokers', path: '/superadmin/brokers', icon: Handshake },
    { label: 'Compras', path: '/superadmin/compras', icon: ShoppingCart },
    { label: 'Contenedores', path: '/superadmin/contenedores', icon: Package },
    { label: 'Fincas', path: '/superadmin/fincas', icon: Coffee },
    { label: 'Laboratorios', path: '/superadmin/laboratorios', icon: FlaskConical },
    { label: 'Muestras', path: '/superadmin/muestras', icon: Archive },
    { label: 'Ofertas', path: '/superadmin/ofertas', icon: Gift },
    { label: 'Técnicos', path: '/superadmin/tecnicos', icon: UserCheck },
    { label: 'Blog', path: '/superadmin/blog', icon: Newspaper },
    { label: 'Página Web', path: '/', icon: Globe },
    { label: 'Configuración', path: '/superadmin/settings', icon: Settings },
  ],
  [ROLES.EMPRESA]: [
    { label: 'Dashboard', path: '/empresa/dashboard', icon: LayoutDashboard },
    { label: 'Ofertas Libres', path: '/empresa/ofertas-libres', icon: Store },
    { label: 'Preofertas', path: '/empresa/pre-ofertas', icon: Layers },
    { label: 'Ofertas', path: '/empresa/ofertas', icon: Tag },
    { label: 'Brokers', path: '/empresa/brokers', icon: Handshake },
    { label: 'Caficultores', path: '/empresa/caficultores', icon: Leaf },
    { label: 'Contenedores', path: '/empresa/contenedores', icon: Package },
    { label: 'Ventas', path: '/empresa/ventas', icon: ShoppingCart },
    { label: 'Laboratorios', path: '/empresa/laboratorios', icon: FlaskConical },
    { label: 'Muestras', path: '/empresa/muestras', icon: Archive },
    { label: 'Técnicos', path: '/empresa/tecnicos', icon: UserCheck },
    { label: 'Precintos QR', path: '/empresa/precintos', icon: Package },
    { label: 'Página Web', path: '/', icon: Globe },
  ],
  [ROLES.BROKER]: [
    { label: 'Dashboard', path: '/broker/dashboard', icon: LayoutDashboard },
    { label: 'Contenedores & Tracker', path: '/broker/contenedores', icon: PackageCheck },
    { label: 'Ofertas Libres', path: '/broker/ofertas', icon: Tag },
    { label: 'Preofertas', path: '/broker/preofertas', icon: Layers },
    { label: 'Muestras Pre-Compra', path: '/broker/muestras', icon: FlaskConical },
    { label: 'Lotes Vendidos', path: '/broker/ventas', icon: Award },
    { label: 'Compradores', path: '/broker/compradores', icon: Users },
    { label: 'Cataciones & Eventos', path: '/broker/eventos', icon: Calendar },
    { label: 'Página Web', path: '/', icon: Globe },
  ],
  [ROLES.CAFICULTOR]: [
    { label: 'Bienvenida',  path: '/caficultor/dashboard',   icon: LayoutDashboard },
    { label: 'Mis Fincas',  path: '/caficultor/fincas',      icon: Coffee },
    { label: 'Mis Lotes',   path: '/caficultor/lotes',        icon: Leaf },
    { label: 'Pre-Ofertas', path: '/caficultor/pre-ofertas',  icon: FileText },
    { label: 'Ofertas',     path: '/caficultor/ofertas',      icon: ShoppingCart },
    { label: 'Página Web',  path: '/',                        icon: Globe },
  ],
  [ROLES.COMPRADOR]: [
    { label: 'Dashboard',     path: '/comprador/dashboard',    icon: LayoutDashboard },
    { label: 'Contenedores', path: '/comprador/contenedores', icon: Package },
    { label: 'Página Web',   path: '/',                       icon: Globe },
  ],
  [ROLES.LABORATORIO]: [
    { label: 'Dashboard',          path: '/laboratorio/dashboard',          icon: LayoutDashboard },
    { label: 'Catadores',          path: '/laboratorio/catadores',          icon: Award },
    { label: 'Análisis Físico',    path: '/laboratorio/analisis-fisico',    icon: FlaskConical },
    { label: 'Análisis Sensorial', path: '/laboratorio/analisis-sensorial', icon: Coffee },
    { label: 'Hojas de Catación',  path: '/laboratorio/hojas-catacion',     icon: FileText },
    { label: 'Muestras',           path: '/laboratorio/muestras',           icon: Archive },
    { label: 'Resultados',         path: '/laboratorio/resultados',         icon: ClipboardCheck },
    { label: 'Página Web',         path: '/',                               icon: Globe },
  ],
  [ROLES.TECNICO]: [
    { label: 'Dashboard',  path: '/tecnico/dashboard', icon: LayoutDashboard },
    { label: 'Mis precintos', path: '/tecnico/precintos', icon: Package },
    { label: 'Página Web', path: '/',                  icon: Globe },
  ],
  [ROLES.CATADOR]: [
    { label: 'Dashboard',  path: '/catador/dashboard',  icon: LayoutDashboard },
    { label: 'Evaluación', path: '/catador/evaluacion', icon: ClipboardCheck },
    { label: 'Página Web', path: '/',                   icon: Globe },
  ],
};

export default function Sidebar() {
  const role = useAuthStore((s) => s.role);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const location = useLocation();
  const navRef = useRef(null);
  const closeBtnRef = useRef(null);
  const collapseBtnRef = useRef(null);

  const navItems = NAV_BY_ROLE[role] || [];

  // Efecto Anime.js en cascada limpia al abrir el menú o cambiar de rol
  useEffect(() => {
    if (!navRef.current || !sidebarOpen) return;
    const items = navRef.current.querySelectorAll('.sidebar-nav-item');
    if (items.length === 0) return;

    const anim = animate(items, {
      opacity: [0, 1],
      translateX: [-18, 0],
      duration: 380,
      ease: 'outExpo',
      delay: stagger(28, { start: 40 }),
    });

    return () => {
      anim.pause();
    };
  }, [sidebarOpen, role]);

  const handleCloseMobile = () => {
    if (closeBtnRef.current) {
      animate(closeBtnRef.current, {
        rotate: [0, 90],
        scale: [1, 0.85],
        duration: 200,
        ease: 'outCubic',
        onComplete: () => setSidebarOpen(false),
      });
    } else {
      setSidebarOpen(false);
    }
  };

  const handleCollapseToggle = () => {
    if (collapseBtnRef.current) {
      animate(collapseBtnRef.current, {
        scale: [1, 0.85, 1],
        duration: 250,
        ease: 'outBack',
      });
    }
    toggleSidebar();
  };

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 w-full h-full cursor-default border-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full
          bg-white border-r border-surface-200
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Oficial Conexcoffee */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200">
          <div className="flex items-center gap-2 overflow-hidden">
            {sidebarOpen ? (
              <img
                src="/images/logo-dark_conex.png"
                alt="Conexcoffee"
                className="h-8 w-auto max-w-[155px] object-contain"
              />
            ) : (
              <img
                src="/images/logo-sm_conex.png"
                alt="Conexcoffee"
                className="h-8 w-8 object-contain mx-auto"
              />
            )}
          </div>

          {/* Close button (mobile) */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse button (desktop) */}
          <button
            ref={collapseBtnRef}
            type="button"
            onClick={handleCollapseToggle}
            className="hidden lg:flex p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 cursor-pointer"
            title={sidebarOpen ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav ref={navRef} className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={`
                  sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
