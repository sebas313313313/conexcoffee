import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/features/auth';

// ============================================
// AppProviders — Wrapper Central de Todos los Providers
// ============================================
// Centraliza la inicialización de la app:
// - Verifica la sesión del usuario al cargar (via getMe)
// - Monta el sistema de toasts (react-hot-toast)
// - Aquí se añaden futuros providers (ThemeProvider, etc.)
// ============================================

function AuthSessionInitializer({ children }) {
  const { checkSession } = useAuth();

  // Verificar sesión al montar la app
  useEffect(() => {
    checkSession();
  }, []);

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
