import { useState, useEffect } from 'react';

const QUERY_DASHBOARD_STATS = `
  query ObtenerEstadisticasDashboard {
    obtenerPedidos {
      intPedido
      dblTotal
      dblSubtotal
      dblCostoEnvio
      strEstado
      strEstadoPago
      datPedido
      tbClientes {
        intCliente
        strNombre
        strEmail
      }
      tbItems {
        intCantidad
        dblSubtotal
        tbProducto {
          intProducto
          strNombre
          dblPrecio
          strImagen
        }
      }
    }
    obtenerProductos {
      intProducto
      strNombre
      dblPrecio
      intStock
      strImagen
    }
    obtenerClientes {
      intCliente
      strNombre
      strEmail
      datRegistro
    }
  }
`;

export interface DashboardStats {
  ventasTotales: number;
  totalPedidos: number;
  totalProductos: number;
  totalClientes: number;
  cambioVentas: string;
  cambioPedidos: string;
  cambioProductos: string;
  cambioClientes: string;
}

export interface PedidoReciente {
  id: string;
  cliente: string;
  producto: string;
  monto: string;
  estado: string;
  fecha: string;
}

export interface ProductoTop {
  nombre: string;
  ventas: number;
  ingresos: number;
  tendencia: string;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    ventasTotales: 0,
    totalPedidos: 0,
    totalProductos: 0,
    totalClientes: 0,
    cambioVentas: '+0%',
    cambioPedidos: '+0%',
    cambioProductos: '+0%',
    cambioClientes: '+0%',
  });

  const [pedidosRecientes, setPedidosRecientes] = useState<PedidoReciente[]>([]);
  const [productosTop, setProductosTop] = useState<ProductoTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: QUERY_DASHBOARD_STATS,
          }),
        });

        const result = await response.json();

        console.log('Dashboard data:', result);
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        const data = result.data;
        const { obtenerPedidos, obtenerProductos, obtenerClientes } = data;

      // Calcular estadísticas
      const pedidosCompletados = obtenerPedidos?.filter(
        (p: any) => p.strEstadoPago === 'PAGADO'
      ) || [];

      const ventasTotales = pedidosCompletados.reduce(
        (sum: number, p: any) => sum + (p.dblTotal || 0),
        0
      );

      // Calcular cambios (comparando con el mes anterior - simulado por ahora)
      const totalPedidos = obtenerPedidos?.length || 0;
      const totalProductos = obtenerProductos?.length || 0;
      const totalClientes = obtenerClientes?.length || 0;

      // Pedidos del mes actual
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const pedidosMesActual = obtenerPedidos?.filter((p: any) => {
        const fechaPedido = new Date(p.datPedido);
        return fechaPedido >= inicioMes;
      }) || [];

      // Calcular cambios (simplificado - comparar con total)
      const cambioVentas = totalPedidos > 0 ? '+' + ((pedidosMesActual.length / totalPedidos) * 100).toFixed(1) + '%' : '+0%';
      const cambioPedidos = pedidosMesActual.length > 0 ? '+' + ((pedidosMesActual.length / Math.max(totalPedidos, 1)) * 100).toFixed(1) + '%' : '+0%';

      setStats({
        ventasTotales,
        totalPedidos,
        totalProductos,
        totalClientes,
        cambioVentas,
        cambioPedidos,
        cambioProductos: '+0%',
        cambioClientes: totalClientes > 0 ? '+' + Math.round((totalClientes / 10) * 100) / 10 + '%' : '+0%',
      });

      // Procesar pedidos recientes (últimos 5)
      const recientes = (obtenerPedidos || [])
        .slice()
        .sort((a: any, b: any) => new Date(b.datPedido).getTime() - new Date(a.datPedido).getTime())
        .slice(0, 5)
        .map((pedido: any) => {
          const primerProducto = pedido.tbItems?.[0]?.tbProducto?.strNombre || 'Sin productos';
          const cantidadProductos = pedido.tbItems?.length || 0;
          const productoTexto = cantidadProductos > 1 
            ? `${primerProducto} +${cantidadProductos - 1} más` 
            : primerProducto;

          return {
            id: `#${pedido.intPedido}`,
            cliente: pedido.tbClientes?.strNombre || 'Cliente',
            producto: productoTexto,
            monto: `$${pedido.dblTotal.toLocaleString()}`,
            estado: mapearEstado(pedido.strEstado),
            fecha: new Date(pedido.datPedido).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
          };
        });

      setPedidosRecientes(recientes);

      // Calcular productos top
      const productosVentas = new Map<number, { nombre: string; ventas: number; ingresos: number }>();

      obtenerPedidos?.forEach((pedido: any) => {
        if (pedido.strEstadoPago === 'PAGADO') {
          pedido.tbItems?.forEach((item: any) => {
            const productoId = item.tbProducto.intProducto;
            const nombre = item.tbProducto.strNombre;
            const cantidad = item.intCantidad;
            const subtotal = item.dblSubtotal;

            if (productosVentas.has(productoId)) {
              const actual = productosVentas.get(productoId)!;
              productosVentas.set(productoId, {
                nombre,
                ventas: actual.ventas + cantidad,
                ingresos: actual.ingresos + subtotal,
              });
            } else {
              productosVentas.set(productoId, {
                nombre,
                ventas: cantidad,
                ingresos: subtotal,
              });
            }
          });
        }
      });

      // Ordenar por ventas y tomar top 5
      const topProductos = Array.from(productosVentas.values())
        .sort((a, b) => b.ingresos - a.ingresos)
        .slice(0, 5)
        .map((p) => ({
          ...p,
          tendencia: '+' + Math.round(Math.random() * 20 + 5) + '%', // Simulado por ahora
        }));

      setProductosTop(topProductos);
        setLoading(false);
      } catch (err: any) {
        console.error('Error al cargar dashboard:', err);
        setError(err.message || 'Error al cargar datos');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return {
    stats,
    pedidosRecientes,
    productosTop,
    loading,
    error,
  };
}

function mapearEstado(estado: string): string {
  const mapa: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    PROCESANDO: 'Procesando',
    EMPAQUETANDO: 'Empaquetando',
    ENVIADO: 'Enviado',
    ENTREGADO: 'Completado',
    CANCELADO: 'Cancelado',
  };
  return mapa[estado] || estado;
}
