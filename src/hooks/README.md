# Custom Hooks - Sistema E-commerce

## usePedidos

Hook personalizado para gestionar la lógica de pedidos en el sistema de administración.

### Características

- ✅ Obtiene pedidos desde GraphQL API automáticamente
- ✅ Búsqueda por pedido, cliente o email
- ✅ Filtrado por estado de pedido
- ✅ Modal de detalle del pedido
- ✅ Conteo de pedidos por estado
- ✅ Estados de carga y error
- ✅ Función de refetch para actualizar datos

### Uso

```tsx
import { usePedidos } from '@/hooks/usePedidos';
import { getStatusConfig } from '@/lib/pedidosUtils';

export default function PedidosPage() {
  const {
    pedidos,              // Array de todos los pedidos
    loading,              // Estado de carga
    error,                // Mensaje de error (si existe)
    searchTerm,           // Término de búsqueda actual
    filterStatus,         // Estado del filtro actual
    selectedOrder,        // Pedido seleccionado para detalle
    showModal,            // Estado del modal
    filteredPedidos,      // Pedidos filtrados
    statusCounts,         // Conteo por estado
    setSearchTerm,        // Función para cambiar búsqueda
    setFilterStatus,      // Función para cambiar filtro
    setShowModal,         // Función para mostrar/ocultar modal
    openOrderDetail,      // Función para abrir detalle
    refetch,              // Función para recargar datos
  } = usePedidos();

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
}
```

### Tipos

```typescript
interface Pedido {
  intPedido: number;
  intCliente: number;
  dblSubtotal: number;
  dblCostoEnvio: number;
  dblTotal: number;
  strEstado: EstadoPedido;
  strMetodoEnvio?: string;
  datPedido: string;
  tbCliente?: Cliente;
  tbDireccion?: Direccion;
  tbItems: PedidoItem[];
  tbPago?: Pago;
}

type EstadoPedido = 
  | 'PENDIENTE' 
  | 'PAGADO' 
  | 'EN_PROCESO' 
  | 'ENVIADO' 
  | 'ENTREGADO' 
  | 'CANCELADO';
```

### Funciones de utilidad

#### getStatusConfig(status: string)

Retorna la configuración de UI para un estado de pedido:

```typescript
const config = getStatusConfig('PENDIENTE');
// {
//   label: 'Pendiente',
//   color: 'text-orange-700',
//   bg: 'bg-orange-100',
//   icon: Package
// }
```

#### STATUS_FILTERS

Array de opciones para filtros:

```typescript
[
  { value: 'todos', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'ENTREGADO', label: 'Completado' },
  { value: 'CANCELADO', label: 'Cancelado' }
]
```

### Ejemplo completo

Ver `src/components/pedidos/pedidos.tsx` para un ejemplo completo de implementación.
