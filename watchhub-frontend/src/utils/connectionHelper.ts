// utils/connectionHelper.ts
import { supabase } from '@/lib/supabase';

export interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
}

export class ConnectionHelper {
  private static instance: ConnectionHelper;
  private status: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  };

  static getInstance(): ConnectionHelper {
    if (!ConnectionHelper.instance) {
      ConnectionHelper.instance = new ConnectionHelper();
    }
    return ConnectionHelper.instance;
  }

  async testConnection(): Promise<ConnectionStatus> {
    try {
      // Intentar una consulta simple para verificar conectividad
      const { error } = await supabase
        .from('titulos')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      this.status = {
        isConnected: true,
        lastChecked: new Date()
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      
      let errorMessage = 'Error de conexión desconocido';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorMessage = 'Sin conexión a internet o problemas con el servidor';
        } else if (error.message.includes('row-level security')) {
          errorMessage = 'Error de permisos en la base de datos';
        } else {
          errorMessage = error.message;
        }
      }

      this.status = {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      };
    }

    return this.status;
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Método para reintentar conexión con backoff exponencial
  async retryConnection(maxRetries: number = 3): Promise<ConnectionStatus> {
    let retries = 0;
    
    while (retries < maxRetries) {
      const status = await this.testConnection();
      
      if (status.isConnected) {
        return status;
      }
      
      retries++;
      
      if (retries < maxRetries) {
        // Esperar tiempo exponencial antes del siguiente intento
        const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return this.status;
  }
}

// Hook personalizado para manejar la conectividad
export function useConnection() {
  const connectionHelper = ConnectionHelper.getInstance();
  
  return {
    testConnection: () => connectionHelper.testConnection(),
    retryConnection: (maxRetries?: number) => connectionHelper.retryConnection(maxRetries),
    getStatus: () => connectionHelper.getStatus()
  };
}
