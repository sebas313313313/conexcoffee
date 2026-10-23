import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/features/auth';
import { CvaProvider } from '@/features/catador';
import { CaficulturaProvider } from '@/features/caficultor';
import { InspeccionesProvider } from '@/features/tecnico';
import { LaboratorioProvider } from '@/features/laboratorio';
import { ComercialProvider, TrazabilidadLogisticaProvider } from '@/features/empresa';
import { SeguridadAdminProvider } from '@/features/superadmin';

// ============================================
// AppProviders — Wrapper Central de Todos los Providers
// ============================================
// Conecta el 100% de los endpoints del backend ConexCoffee:
// - AuthProvider: /api/usuarios-sistema/login, /perfil
// - CvaProvider: /api/sesiones-catacion, /api/hojas-catacion-cva, /api/evaluaciones-sensoriales-cva
// - CaficulturaProvider: /api/fincas, /api/lotes-cultivo, /api/caficultores, /api/variedades-cafe
// - InspeccionesProvider: /api/inspecciones-finca
// - LaboratorioProvider: /api/evaluaciones-fisicas, /api/catadores
// - ComercialProvider: /api/preofertas, /api/pedidos-internacionales
// - TrazabilidadLogisticaProvider: /api/sacos-cafe, /api/inventario-precintos-qr, /api/trazabilidad-escaneos, /api/contenedores-virtuales
// - SeguridadAdminProvider: /api/alertas-seguridad, /api/catalogo-errores, /api/usuarios-sistema
// ============================================

function AuthSessionInitializer({ children }) {
  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return children;
}

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <SeguridadAdminProvider>
        <CaficulturaProvider>
          <InspeccionesProvider>
            <LaboratorioProvider>
              <CvaProvider>
                <ComercialProvider>
                  <TrazabilidadLogisticaProvider>
                    <AuthSessionInitializer>
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 4000,
                          style: {
                            background: '#1c1917',
                            color: '#fafaf9',
                            borderRadius: '13px',
                            fontSize: '14px',
                          },
                          success: {
                            iconTheme: {
                              primary: '#F25433',
                              secondary: '#fff',
                            },
                          },
                          error: {
                            iconTheme: {
                              primary: '#ef4444',
                              secondary: '#fff',
                            },
                          },
                        }}
                      />
                      {children}
                    </AuthSessionInitializer>
                  </TrazabilidadLogisticaProvider>
                </ComercialProvider>
              </CvaProvider>
            </LaboratorioProvider>
          </InspeccionesProvider>
        </CaficulturaProvider>
      </SeguridadAdminProvider>
    </AuthProvider>
  );
}
