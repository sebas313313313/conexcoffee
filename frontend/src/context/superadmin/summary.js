import { Users, Sprout, PackageCheck, TrendingUp, Building2, FlaskConical, Briefcase, Newspaper } from 'lucide-react';

export function selectSuperAdminSummary(state) {
  const { usuarios, caficultores, catadores, empresas, laboratorios, brokers, compradores, fincas, lotes, preofertas, ofertas, muestras, contenedores, compras, alertas } = state;
  const stats = [
    {
      id: 'stat-usuarios',
      label: 'Usuarios del Sistema',
      value: String(usuarios.length),
      change: `${usuarios.filter((u) => u.estado === 'Activo').length} activos`,
      up: true,
      icon: Users,
      iconName: 'Users',
      bg: '#FFF5F2',
      color: '#AD2E01',
    },
    {
      id: 'stat-fincas',
      label: 'Fincas y Lotes',
      value: `${fincas.length} / ${lotes.length}`,
      change: `${caficultores.length} caficultores`,
      up: true,
      icon: Sprout,
      iconName: 'Sprout',
      bg: '#ECFDF5',
      color: '#059669',
    },
    {
      id: 'stat-contenedores',
      label: 'Contenedores Virtuales',
      value: String(contenedores.length),
      change: `${ofertas.length} ofertas`,
      up: true,
      icon: PackageCheck,
      iconName: 'PackageCheck',
      bg: '#FEF3C7',
      color: '#D97706',
    },
    {
      id: 'stat-pedidos',
      label: 'Pedidos Internacionales',
      value: String(compras.length),
      change: `${compradores.length} compradores`,
      up: true,
      icon: TrendingUp,
      iconName: 'TrendingUp',
      bg: '#EFF6FF',
      color: '#2563EB',
    },
  ];

  const metrics = [
    {
      label: 'Disponibilidad API REST',
      value: Math.max(usuarios.filter((u) => u.estado === 'Activo').length, 1),
      total: Math.max(usuarios.length, 1),
      val: '99.98%',
      pct: '99%',
      color: '#10B981',
    },
    {
      label: 'Cobertura de Trazabilidad FNC / SCA',
      value: Math.max(fincas.length, 1),
      total: Math.max(fincas.length, 1),
      val: '100%',
      pct: '100%',
      color: '#AD2E01',
    },
    {
      label: 'Capacidad Consolidada en Contenedores',
      value: Math.max(contenedores.length, 1),
      total: Math.max(contenedores.length + 2, 3),
      val: `${contenedores.length} activos`,
      pct: '82%',
      color: '#F59E0B',
    },
  ];

  const activity = [
    ...alertas.slice(0, 3).map((a, idx) => ({
      id: a.id || `alerta-${idx}`,
      status: a.severidad === 'ALTA' ? 'warning' : 'info',
      message: `${a.tipo_evento || 'Seguridad'}: ${a.descripcion || 'Evento auditado'}`,
      action: `${a.tipo_evento || 'Seguridad'}: ${a.descripcion || 'Evento auditado'}`,
      user: a.severidad || 'SISTEMA',
      time: a.fecha_evento ? String(a.fecha_evento).slice(0, 10) : 'Reciente',
    })),
    ...preofertas.slice(0, 3).map((p, idx) => ({
      id: p.id || `pre-${idx}`,
      status: 'success',
      message: `Preoferta ${p.codigo} (${p.variedad} - ${p.cantidad} Kg) — ${typeof p.caficultor === 'string' ? p.caficultor : p.caficultor_nombre || 'Caficultor'}`,
      action: `Preoferta ${p.codigo} (${p.variedad} - ${p.cantidad} Kg)`,
      user: typeof p.caficultor === 'string' ? p.caficultor : p.caficultor_nombre || 'Caficultor',
      time: p.fechaRegistro || p.fecha_creacion || 'Reciente',
    })),
  ];

  const modules = [
    {
      id: 'mod-empresas',
      title: 'Empresas Exportadoras',
      name: 'Empresas Exportadoras',
      description: `${empresas.length} exportadoras registradas ante DIAN/FNC`,
      desc: `${empresas.length} exportadoras registradas ante DIAN/FNC`,
      path: '/superadmin/empresas',
      icon: Building2,
      iconName: 'Building2',
      stats: [
        { label: 'Empresas', value: empresas.length },
        { label: 'Activas', value: empresas.filter((e) => e.estado === 'Activo').length },
      ],
    },
    {
      id: 'mod-fincas',
      title: 'Fincas y Lotes de Cultivo',
      name: 'Fincas y Lotes de Cultivo',
      description: `${fincas.length} unidades productivas georreferenciadas`,
      desc: `${fincas.length} unidades productivas georreferenciadas`,
      path: '/superadmin/fincas',
      icon: Sprout,
      iconName: 'Sprout',
      stats: [
        { label: 'Fincas', value: fincas.length },
        { label: 'Lotes', value: lotes.length },
      ],
    },
    {
      id: 'mod-contenedores',
      title: 'Contenedores y Exportación',
      name: 'Contenedores y Exportación',
      description: `${contenedores.length} contenedores virtuales consolidados`,
      desc: `${contenedores.length} contenedores virtuales consolidados`,
      path: '/superadmin/contenedores',
      icon: PackageCheck,
      iconName: 'PackageCheck',
      stats: [
        { label: 'Contenedores', value: contenedores.length },
        { label: 'Ofertas', value: ofertas.length },
      ],
    },
    {
      id: 'mod-laboratorios',
      title: 'Laboratorios y Catación',
      name: 'Laboratorios y Catación',
      description: `${laboratorios.length} laboratorios y ${catadores.length} catadores Q-Grader`,
      desc: `${laboratorios.length} laboratorios y ${catadores.length} catadores Q-Grader`,
      path: '/superadmin/laboratorios',
      icon: FlaskConical,
      iconName: 'FlaskConical',
      stats: [
        { label: 'Labs', value: laboratorios.length },
        { label: 'Muestras', value: muestras.length },
      ],
    },
    {
      id: 'mod-brokers',
      title: 'Brokers y Compradores',
      name: 'Brokers y Compradores',
      description: `${brokers.length} brokers y ${compradores.length} compradores globales`,
      desc: `${brokers.length} brokers y ${compradores.length} compradores globales`,
      path: '/superadmin/brokers',
      icon: Briefcase,
      iconName: 'Briefcase',
      stats: [
        { label: 'Brokers', value: brokers.length },
        { label: 'Pedidos', value: compras.length },
      ],
    },
    {
      id: 'mod-blog',
      title: 'Gestión del Blog',
      name: 'Gestión del Blog',
      description: 'Publicaciones, actualidad cafetera y artículos de la landing page',
      desc: 'Publicaciones, actualidad cafetera y artículos de la landing page',
      path: '/superadmin/blog',
      icon: Newspaper,
      iconName: 'Newspaper',
      stats: [
        { label: 'Destino', value: 'Landing Page' },
        { label: 'Ruta', value: '/blog' },
      ],
    },
  ];
  return { stats, metrics, activity, modules };
}
