'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AdminProtectedContent({ 
  children, 
  fallback 
}: AdminProtectedRouteProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userAccount, loading, isAdmin, isAuthenticated, authError } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (loading) return;

    setHasCheckedAuth(true);

    // Si hay error de autenticación, redirigir al login
    if (authError) {
      router.push('/auth/login?error=auth_error');
      return;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname;
      router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Si está autenticado pero no es admin, mostrar error
    if (isAuthenticated() && !isAdmin()) {
      // No redirigir automáticamente, mostrar mensaje de error
      return;
    }
  }, [user, userAccount, loading, router, isAdmin, isAuthenticated, authError]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading || !hasCheckedAuth) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si hay error de autenticación
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-6">
            Ocurrió un error al verificar tu autenticación. Por favor, intenta iniciar sesión nuevamente.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Ir al Inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Autenticación Requerida</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder al panel de administración.
          </p>
          <Button 
            onClick={() => {
              const currentPath = window.location.pathname;
              router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
            }}
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  // Si está autenticado pero no es admin
  if (isAuthenticated() && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-2">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Usuario actual: <span className="font-medium">{userAccount?.nombre || user?.email}</span>
            <br />
            Rol: <span className="font-medium">{userAccount?.rol || 'No definido'}</span>
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/pages/dashboard-user')}
              className="w-full"
            >
              Ir a Mi Dashboard
            </Button>
          </div>
          
          {/* Información de contacto para solicitar permisos */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              Si necesitas acceso de administrador, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
}

export default function AdminProtectedRoute({ 
  children, 
  fallback 
}: AdminProtectedRouteProps) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AdminProtectedContent fallback={fallback}>
        {children}
      </AdminProtectedContent>
    </Suspense>
  );
}
