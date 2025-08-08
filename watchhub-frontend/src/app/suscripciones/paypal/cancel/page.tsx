'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import Link from 'next/link'

export default function PayPalCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-red-600">
              WatchHub
            </Link>
            <Link href="/suscripciones">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a planes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">
                Pago Cancelado
              </h1>
              <p className="text-gray-400 mb-6">
                Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
              </p>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-300 text-sm">
                  Tu suscripción no se ha activado. Puedes intentar de nuevo cuando estés listo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push('/suscripciones')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Elegir otro plan
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Volver al inicio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de ayuda */}
          <div className="mt-8 text-center">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                ¿Tuviste algún problema?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Si experimentaste dificultades durante el proceso de pago, nuestro equipo está aquí para ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="mailto:soporte@watchhub.com"
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Contactar Soporte
                </a>
                <a 
                  href="/ayuda/pagos"
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Preguntas Frecuentes
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
