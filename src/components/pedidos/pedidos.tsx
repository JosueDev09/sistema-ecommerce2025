import { useState } from 'react';
import { Search, Filter, Download, Eye, Package, Truck, CheckCircle, Clock, XCircle, MoreVertical, Calendar, User, MapPin, DollarSign } from 'lucide-react';

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const pedidos = [
    {
      id: '#3210',
      cliente: 'Ana García',
      email: 'ana.garcia@email.com',
      telefono: '123-456-7890',
      productos: [
        { nombre: 'iPhone 14 Pro', cantidad: 1, precio: 999 },
        { nombre: 'Funda iPhone', cantidad: 2, precio: 29 }
      ],
      subtotal: 1057,
      envio: 15,
      total: 1072,
      estado: 'completado',
      fecha: '2025-10-28',
      direccion: 'Calle Principal 123, Celaya, GTO',
      metodoPago: 'Tarjeta de crédito'
    },
    {
      id: '#3209',
      cliente: 'Carlos López',
      email: 'carlos.lopez@email.com',
      telefono: '123-456-7891',
      productos: [
        { nombre: 'MacBook Air M2', cantidad: 1, precio: 1299 }
      ],
      subtotal: 1299,
      envio: 0,
      total: 1299,
      estado: 'procesando',
      fecha: '2025-10-28',
      direccion: 'Av. Juárez 456, Celaya, GTO',
      metodoPago: 'PayPal'
    },
    {
      id: '#3208',
      cliente: 'María Rodríguez',
      email: 'maria.r@email.com',
      telefono: '123-456-7892',
      productos: [
        { nombre: 'AirPods Pro', cantidad: 1, precio: 249 },
        { nombre: 'Cable USB-C', cantidad: 1, precio: 19 }
      ],
      subtotal: 268,
      envio: 10,
      total: 278,
      estado: 'completado',
      fecha: '2025-10-27',
      direccion: 'Colonia Centro 789, Celaya, GTO',
      metodoPago: 'Tarjeta de débito'
    },
    {
      id: '#3207',
      cliente: 'Juan Martínez',
      email: 'juan.m@email.com',
      telefono: '123-456-7893',
      productos: [
        { nombre: 'iPad Air', cantidad: 1, precio: 599 }
      ],
      subtotal: 599,
      envio: 15,
      total: 614,
      estado: 'enviado',
      fecha: '2025-10-27',
      direccion: 'Fracc. Las Américas 321, Celaya, GTO',
      metodoPago: 'Transferencia'
    },
    {
      id: '#3206',
      cliente: 'Laura Sánchez',
      email: 'laura.s@email.com',
      telefono: '123-456-7894',
      productos: [
        { nombre: 'Apple Watch Series 9', cantidad: 1, precio: 399 }
      ],
      subtotal: 399,
      envio: 10,
      total: 409,
      estado: 'pendiente',
      fecha: '2025-10-26',
      direccion: 'Col. Jardines 654, Celaya, GTO',
      metodoPago: 'Efectivo'
    },
    {
      id: '#3205',
      cliente: 'Pedro Hernández',
      email: 'pedro.h@email.com',
      telefono: '123-456-7895',
      productos: [
        { nombre: 'Magic Keyboard', cantidad: 1, precio: 349 }
      ],
      subtotal: 349,
      envio: 0,
      total: 349,
      estado: 'cancelado',
      fecha: '2025-10-26',
      direccion: 'Zona Industrial 987, Celaya, GTO',
      metodoPago: 'Tarjeta de crédito'
    }
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      completado: { label: 'Completado', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
      procesando: { label: 'Procesando', color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
      enviado: { label: 'Enviado', color: 'text-purple-700', bg: 'bg-purple-100', icon: Truck },
      pendiente: { label: 'Pendiente', color: 'text-orange-700', bg: 'bg-orange-100', icon: Package },
      cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle }
    };
    return configs[status] || configs.pendiente;
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || pedido.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    todos: pedidos.length,
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    procesando: pedidos.filter(p => p.estado === 'procesando').length,
    enviado: pedidos.filter(p => p.estado === 'enviado').length,
    completado: pedidos.filter(p => p.estado === 'completado').length,
    cancelado: pedidos.filter(p => p.estado === 'cancelado').length
  };

  const openOrderDetail = (pedido: any) => {
    setSelectedOrder(pedido);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-500 mt-1">Gestiona todos los pedidos de tu tienda</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por pedido, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todos ({statusCounts.todos})</option>
                <option value="pendiente">Pendiente ({statusCounts.pendiente})</option>
                <option value="procesando">Procesando ({statusCounts.procesando})</option>
                <option value="enviado">Enviado ({statusCounts.enviado})</option>
                <option value="completado">Completado ({statusCounts.completado})</option>
                <option value="cancelado">Cancelado ({statusCounts.cancelado})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Object.entries(statusCounts).map(([key, count]) => {
            const config = getStatusConfig(key);
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  filterStatus === key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${filterStatus === key ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs font-medium text-gray-600 capitalize">
                  {key === 'todos' ? 'Todos' : config.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPedidos.map((pedido) => {
                  const statusConfig = getStatusConfig(pedido.estado);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{pedido.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{pedido.cliente}</p>
                          <p className="text-xs text-gray-500">{pedido.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{pedido.fecha}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">${pedido.total.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openOrderDetail(pedido)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalle */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido</h2>
                  <p className="text-gray-500 mt-1">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Estado */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getStatusConfig(selectedOrder.estado);
                    const Icon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${config.bg} ${config.color}`}>
                        <Icon className="w-5 h-5" />
                        {config.label}
                      </span>
                    );
                  })()}
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{selectedOrder.fecha}</span>
                </div>

                {/* Información del Cliente */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Nombre</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.cliente}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.telefono}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Método de Pago</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.metodoPago}</p>
                    </div>
                  </div>
                </div>

                {/* Dirección de Envío */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    Dirección de Envío
                  </h3>
                  <p className="text-sm text-gray-700">{selectedOrder.direccion}</p>
                </div>

                {/* Productos */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    Productos
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.productos.map((producto: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{producto.nombre}</p>
                          <p className="text-sm text-gray-500">Cantidad: {producto.cantidad}</p>
                        </div>
                        <p className="font-bold text-gray-900">${(producto.precio * producto.cantidad).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">${selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-semibold text-gray-900">${selectedOrder.envio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">${selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Actualizar Estado
                  </button>
                  <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}