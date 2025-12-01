'use client';
import { useState } from 'react';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '@/src/hooks/useDashboard';

export default function Dashboard() {
  const [period, setPeriod] = useState('mes');
  const { stats, pedidosRecientes, productosTop, loading, error } = useDashboard();

  // Configuración de cards de estadísticas
  const statsCards = [
    {
      title: 'Ventas Totales',
      value: `$${stats.ventasTotales.toLocaleString()}`,
      change: stats.cambioVentas,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pedidos',
      value: stats.totalPedidos.toString(),
      change: stats.cambioPedidos,
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Productos',
      value: stats.totalProductos.toString(),
      change: stats.cambioProductos,
      trend: stats.cambioProductos.includes('-') ? 'down' : 'up',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Clientes',
      value: stats.totalClientes.toString(),
      change: stats.cambioClientes,
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': 
      case 'Entregado': 
        return 'bg-emerald-100 text-emerald-700';
      case 'Procesando': 
        return 'bg-blue-100 text-blue-700';
      case 'Enviado': 
        return 'bg-purple-100 text-purple-700';
      case 'Empaquetando': 
        return 'bg-indigo-100 text-indigo-700';
      case 'Pendiente': 
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelado': 
        return 'bg-red-100 text-red-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Resumen de tu tienda</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="año">Este año</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs mes anterior</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Pedidos Recientes</h2>
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Ver todos
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pedidosRecientes.length > 0 ? (
                    pedidosRecientes.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{order.id}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.cliente}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{order.producto}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{order.monto}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                            {order.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay pedidos recientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Productos Top</h2>
            </div>
            <div className="p-6 space-y-4">
              {productosTop.length > 0 ? (
                productosTop.map((product, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.nombre}</p>
                          <p className="text-xs text-gray-500">{product.ventas} ventas</p>
                        </div>
                      </div>
                      <div className="mt-2 ml-10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">${product.ingresos.toLocaleString()}</span>
                          <span className="text-xs font-medium text-emerald-600">{product.tendencia}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (product.ventas / Math.max(...productosTop.map(p => p.ventas), 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de productos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agregar Producto</p>
                <p className="text-xs text-gray-500 mt-1">Nuevo producto</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
          
          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ver Inventario</p>
                <p className="text-xs text-gray-500 mt-1">Gestionar stock</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
          
          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gestionar Pedidos</p>
                <p className="text-xs text-gray-500 mt-1">Ver todos</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
          
          <button className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes</p>
                <p className="text-xs text-gray-500 mt-1">Ver análisis</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}