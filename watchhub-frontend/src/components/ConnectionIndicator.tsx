import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface ConnectionIndicatorProps {
  status: 'connected' | 'disconnected' | 'checking';
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  error?: string;
  className?: string;
}

export default function ConnectionIndicator({
  status,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  error,
  className = ''
}: ConnectionIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          text: 'Conectado',
          textColor: 'text-green-400'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          text: 'Desconectado',
          textColor: 'text-red-400'
        };
      case 'checking':
        return {
          icon: RefreshCw,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          text: 'Verificando...',
          textColor: 'text-yellow-400'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <IconComponent 
            className={`w-4 h-4 ${config.color} ${status === 'checking' ? 'animate-spin' : ''}`} 
          />
          <span className={`text-sm font-medium ${config.textColor}`}>
            {config.text}
          </span>
          {error && status === 'disconnected' && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-300 truncate max-w-xs" title={error}>
                {error}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              title="Actualizar estado de conexión"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
