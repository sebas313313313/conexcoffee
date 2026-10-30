import useAuth from '@/hooks/useAuth';
import { Card, Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { User, Mail, Shield } from 'lucide-react';

// ============================================
// ProfilePage — Página de perfil del usuario
// ============================================
// Compartida por todos los roles.
// ============================================
export default function ProfilePage() {
  const { user, role } = useAuth();

  return (

    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Mi Perfil</h1>
        <p className="text-surface-500 mt-1">Gestiona tu información personal</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-surface-900">
              {user?.name || 'Usuario'}
            </h2>
            <Badge variant="primary" size="sm">
              {role || 'Sin rol'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Mail className="h-5 w-5 text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Email</p>
              <p className="text-sm font-medium text-surface-700">
                {user?.email || 'email@ejemplo.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Shield className="h-5 w-5 text-surface-400" />
            <div>
              <p className="text-xs text-surface-400">Rol</p>
              <p className="text-sm font-medium text-surface-700 capitalize">
                {role || 'Sin definir'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-200">
          <Button variant="outline">Editar Perfil</Button>
        </div>
      </Card>
    </div>
  );
}
