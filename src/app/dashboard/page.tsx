'use client';
import { useState } from 'react';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';

export default function Dashboard() {
  const [period, setPeriod] = useState('mes');

  // Datos de ejemplo
  const stats = [
    {
      title: 'Ventas Totales',
      value: '$45,231',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'Pedidos',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Productos',
      value: '567',
      change: '-2.3%',
      trend: 'down',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Clientes',
      value: '8,542',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = [
    { id: '#3210', customer: 'Ana García', product: 'iPhone 14 Pro', amount: '$999', status: 'Completado', date: '28 Oct 2025' },
    { id: '#3209', customer: 'Carlos López', product: 'MacBook Air M2', amount: '$1,299', status: 'Procesando', date: '28 Oct 2025' },
    { id: '#3208', customer: 'María Rodríguez', product: 'AirPods Pro', amount: '$249', status: 'Completado', date: '27 Oct 2025' },
    { id: '#3207', customer: 'Juan Martínez', product: 'iPad Air', amount: '$599', status: 'Enviado', date: '27 Oct 2025' },
    { id: '#3206', customer: 'Laura Sánchez', product: 'Apple Watch', amount: '$399', status: 'Completado', date: '26 Oct 2025' }
  ];

  const topProducts = [
    { name: 'iPhone 14 Pro', sales: 234, revenue: '$233,766', trend: '+12%' },
    { name: 'MacBook Air M2', sales: 145, revenue: '$188,355', trend: '+8%' },
    { name: 'AirPods Pro', sales: 567, revenue: '$141,183', trend: '+15%' },
    { name: 'iPad Air', sales: 189, revenue: '$113,211', trend: '+5%' },
    { name: 'Apple Watch', sales: 267, revenue: '$106,533', trend: '+10%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-emerald-100 text-emerald-700';
      case 'Procesando': return 'bg-blue-100 text-blue-700';
      case 'Enviado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
          {stats.map((stat, index) => (
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
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.customer}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{order.product}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales} ventas</p>
                      </div>
                    </div>
                    <div className="mt-2 ml-10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{product.revenue}</span>
                        <span className="text-xs font-medium text-emerald-600">{product.trend}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (product.sales / 6) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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