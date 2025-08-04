'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';

function AccessAlertContent() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'access_denied') {
      setMessage('No tienes permisos para acceder al panel de administrador.');
      setShow(true);
    } else if (error === 'auth_error') {
      setMessage('Error de autenticación. Por favor, inicia sesión nuevamente.');
      setShow(true);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShow(false)}
              className="inline-flex text-yellow-400 hover:text-yellow-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccessAlert() {
  return (
    <Suspense fallback={null}>
      <AccessAlertContent />
    </Suspense>
  );
}
