import { NavLink, useLocation } from 'react-router-dom';
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
  MapPin,
  ClipboardCheck,
  Store,
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
    { label: 'Usuarios', path: '/superadmin/users', icon: Users },
    { label: 'Página Web', path: '/', icon: Globe },
    { label: 'Configuración', path: '/superadmin/settings', icon: Settings },
  ],
  [ROLES.EMPRESA]: [
    { label: 'Dashboard', path: '/empresa/dashboard', icon: LayoutDashboard },
    { label: 'Ofertas Libres', path: '/empresa/ofertas-libres', icon: Store },
    { label: 'Pre-Ofertas', path: '/empresa/pre-ofertas', icon: Layers },
    { label: 'Ofertas', path: '/empresa/ofertas', icon: Tag },
    { label: 'Brokers', path: '/empresa/brokers', icon: Handshake },
    { label: 'Caficultores', path: '/empresa/caficultores', icon: Leaf },
    { label: 'Contenedores', path: '/empresa/contenedores', icon: Package },
    { label: 'Laboratorios', path: '/empresa/laboratorios', icon: FlaskConical },
    { label: 'Muestras', path: '/empresa/muestras', icon: Archive },
    { label: 'Técnicos', path: '/empresa/tecnicos', icon: UserCheck },
    { label: 'Página Web', path: '/', icon: Globe },
  ],
  [ROLES.BROKER]: [
    { label: 'Dashboard', path: '/broker/dashboard', icon: LayoutDashboard },
    { label: 'Negociaciones', path: '/broker/negotiations', icon: Handshake },
    { label: 'Contratos', path: '/broker/contratos', icon: FileText },
    { label: 'Página Web', path: '/', icon: Globe },
  ],
  [ROLES.CAFICULTOR]: [
    { label: 'Bienvenida',  path: '/caficultor/dashboard',   icon: LayoutDashboard },
    { label: 'Mis Fincas',  path: '/caficultor/fincas',      icon: Coffee },
    { label: 'Mis Lotes',   path: '/caficultor/lots',         icon: Leaf },
    { label: 'Pre-Ofertas', path: '/caficultor/pre-ofertas',  icon: FileText },
    { label: 'Ofertas',     path: '/caficultor/ofertas',      icon: ShoppingCart },
    { label: 'Página Web',  path: '/',                        icon: Globe },
  ],
  [ROLES.COMPRADOR]: [
    { label: 'Dashboard',     path: '/comprador/dashboard',    icon: LayoutDashboard },
    { label: 'Contenedores', path: '/comprador/contenedores', icon: Package },
    { label: 'Mis pedidos',  path: '/comprador/orders',       icon: ShoppingCart },
    { label: 'Página Web',   path: '/',                       icon: Globe },
  ],
  [ROLES.LABORATORIO]: [
    { label: 'Dashboard',          path: '/laboratorio/dashboard',          icon: LayoutDashboard },
    { label: 'Catadores',          path: '/laboratorio/catadores',          icon: Award },
    { label: 'Análisis Físico',    path: '/laboratorio/analisis-fisico',    icon: FlaskConical },
    { label: 'Análisis Sensorial', path: '/laboratorio/analisis-sensorial', icon: Coffee },
    { label: 'Muestras',           path: '/laboratorio/muestras',           icon: Archive },
    { label: 'Resultados',         path: '/laboratorio/resultados',         icon: ClipboardCheck },
    { label: 'Página Web',         path: '/',                               icon: Globe },
  ],
  [ROLES.TECNICO]: [
    { label: 'Dashboard',        path: '/tecnico/dashboard',     icon: LayoutDashboard },
    { label: 'Visitas a Fincas', path: '/tecnico/dashboard',     icon: MapPin },
    { label: 'Auditorías BPA',   path: '/tecnico/dashboard',     icon: UserCheck },
    { label: 'Página Web',       path: '/',                      icon: Globe },
  ],
  [ROLES.CATADOR]: [
    { label: 'Dashboard',         path: '/catador/dashboard',    icon: LayoutDashboard },
    { label: 'Evaluación',        path: '/catador/evaluacion',   icon: ClipboardCheck },
    { label: 'Sesiones Catación', path: '/catador/evaluacion',   icon: Coffee },
    { label: 'Puntuaciones SCA',  path: '/catador/evaluacion',   icon: Award },
    { label: 'Página Web',        path: '/',                     icon: Globe },
  ],
};

export default function Sidebar() {
  const { role } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const location = useLocation();

  const navItems = NAV_BY_ROLE[role] || [];

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
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
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse button (desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 cursor-pointer"
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
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
