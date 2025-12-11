import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

export type EstadoPedido = 
  | 'PENDIENTE' 
  | 'PROCESANDO'
  | 'EMPAQUETANDO'
  | 'ENVIADO' 
  | 'ENTREGADO' 
  | 'CANCELADO';

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: any;
}

export interface StatusConfigPago {
  label: string;
  color: string;
  bg: string;
  icon: any;
}

export const getStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    PENDIENTE: { 
      label: 'Pendiente', 
      color: 'text-orange-700', 
      bg: 'bg-orange-100', 
      icon: Package 
    },
    PROCESANDO: { 
      label: 'Procesando', 
      color: 'text-blue-700', 
      bg: 'bg-blue-100', 
      icon: Clock 
    },
    EMPAQUETANDO: { 
      label: 'Empaquetando', 
      color: 'text-indigo-700', 
      bg: 'bg-indigo-100', 
      icon: Package 
    },
    ENVIADO: { 
      label: 'Enviado', 
      color: 'text-purple-700', 
      bg: 'bg-purple-100', 
      icon: Truck 
    },
    ENTREGADO: { 
      label: 'Entregado', 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-100', 
      icon: CheckCircle 
    },
    CANCELADO: { 
      label: 'Cancelado', 
      color: 'text-red-700', 
      bg: 'bg-red-100', 
      icon: XCircle 
    }
  };
  return configs[status] || configs.PENDIENTE;
};

export const getStatusConfigPago = (status: string): StatusConfigPago => {
  const configs: Record<string, StatusConfigPago> = {
    PENDIENTE: { 
      label: 'Pendiente', 
      color: 'text-orange-700', 
      bg: 'bg-orange-100', 
      icon: Package 
    },
    PAGADO: { 
      label: 'Pagado', 
      color: 'text-green-700', 
      bg: 'bg-green-100', 
      icon: CheckCircle 
    },
    RECHAZADO: { 
      label: 'Rechazado', 
      color: 'text-red-700',
      bg: 'bg-red-100', 
      icon: XCircle 
    },
    CANCELADO: { 
      label: 'Cancelado', 
      color: 'text-red-700', 
      bg: 'bg-red-100', 
      icon: XCircle 
    },
    REMBOLSADO: {
      label: 'Reembolsado',
      color: 'text-purple-700',
      bg: 'bg-purple-100',
      icon: XCircle
    }
  };
  return configs[status] || configs.PENDIENTE;
};

// Mapeo de estados para filtros
export const STATUS_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PROCESANDO', label: 'Procesando' },
  { value: 'EMPAQUETANDO', label: 'Empaquetando' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'CANCELADO', label: 'Cancelado' }
];

