import { Search, Filter, Download, Eye, Package, Truck, CheckCircle, Clock, XCircle, User, MapPin } from 'lucide-react';
import { usePedidos, type Pedido } from '../../hooks/usePedidos';
import { getStatusConfig, STATUS_FILTERS, type EstadoPedido,getStatusConfigPago } from '../../lib/pedidosUtils';
import { formatFecha } from '../../lib/formatFecha';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function PedidosPage() {
  const {
    loading,
    error,
    updatingStatus,
    searchTerm,
    filterStatus,
    selectedOrder,
    showModal,
    filteredPedidos,
    statusCounts,
    setSearchTerm,
    setFilterStatus,
    setShowModal,
    openOrderDetail,
    actualizarEstadoPedido,
  } = usePedidos();

  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido | ''>('');
  const [activeTab, setActiveTab] = useState<'info' | 'productos'>('info');
  const [strNumeroSeguimiento, setStrNumeroSeguimiento] = useState<string>('');

  const handleActualizarEstado = async () => {
    if (!selectedOrder || !nuevoEstado) return;
    
    // 🔴 Si el estado es CANCELADO, mostrar confirmación especial
    if (nuevoEstado === 'CANCELADO') {
      const result = await Swal.fire({
        title: '⚠️ ¿Cancelar Pedido?',
        html: `
          <div class="text-left space-y-3">
            <p class="text-gray-700 font-semibold">Al cancelar este pedido se realizarán las siguientes acciones:</p>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p class="text-sm text-blue-800">📦 <strong>Devolución de Stock:</strong> Se regresarán todas las unidades al inventario</p>
            </div>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p class="text-sm text-green-800">💰 <strong>Reembolso:</strong> El pago será marcado como REEMBOLSADO</p>
            </div>
            <div class="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p class="text-sm text-red-800">🔒 <strong>Permanente:</strong> Esta acción no se puede deshacer</p>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cancelar pedido',
        cancelButtonText: 'No, volver',
        customClass: {
          htmlContainer: 'text-left'
        }
      });

      if (!result.isConfirmed) {
        return; // Usuario canceló la operación
      }
    }
    
    console.log('Seguimiento del pedido:', strNumeroSeguimiento);
    const success = await actualizarEstadoPedido(selectedOrder.intPedido, nuevoEstado as EstadoPedido, strNumeroSeguimiento);
    
    if (success) {
      setShowEstadoModal(false);
      setNuevoEstado('');
      
      // Mensaje de éxito diferente para CANCELADO
      if (nuevoEstado === 'CANCELADO') {
        Swal.fire({
          icon: 'success',
          title: '✅ Pedido Cancelado',
          html: `
            <div class="space-y-2 text-left">
              <p class="text-gray-700">El pedido ha sido cancelado exitosamente</p>
              <p class="text-sm text-green-600">✓ Stock devuelto al inventario</p>
              <p class="text-sm text-green-600">✓ Pago marcado como reembolsado</p>
            </div>
          `,
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'El estado del pedido ha sido actualizado correctamente.',
        });
      }
    } else {
      alert('Error al actualizar el estado');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
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
          {STATUS_FILTERS.map(({ value, label }) => {
            const count = statusCounts[value as keyof typeof statusCounts] || 0;
            const config = getStatusConfig(value);
            const Icon = config.icon;
            return (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  filterStatus === value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${filterStatus === value ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs font-medium text-gray-600 capitalize">
                  {label}
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
                    Estado Envío
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado Pago
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPedidos.map((pedido) => {
                  const statusConfig = getStatusConfig(pedido.strEstado);
                  const statusPagoConfig = getStatusConfigPago(pedido.strEstadoPago);
                  const StatusIcon = statusConfig.icon;
                  const StatusPagoIcon = statusPagoConfig.icon;
                  
                  return (
                    <tr key={pedido.intPedido} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{pedido.intPedido}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{pedido.tbClientes?.strNombre || 'Cliente no disponible'}</p>
                          <p className="text-xs text-gray-500">{pedido.tbClientes?.strEmail || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatFecha(pedido.datPedido)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">${pedido.dblTotal.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusPagoConfig.bg} ${statusPagoConfig.color}`}>
                          <StatusPagoIcon className="w-3.5 h-3.5" />
                          {statusPagoConfig.label}
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
           <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalle del Pedido</h2>
                  <p className="text-gray-500 mt-1">#{selectedOrder.intPedido}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Badge de Cancelación (solo visible si está cancelado) */}
                {selectedOrder.strEstado === 'CANCELADO' && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <XCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-900 mb-2">Pedido Cancelado</h4>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">
                              <strong className="text-green-700">Stock devuelto:</strong> Todas las unidades fueron regresadas al inventario
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700">
                              <strong className="text-blue-700">Pago reembolsado:</strong> El monto de ${selectedOrder.dblTotal.toLocaleString()} fue reembolsado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado */}
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getStatusConfig(selectedOrder.strEstado);
                    const Icon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${config.bg} ${config.color}`}>
                        <Icon className="w-5 h-5" />
                        {config.label}
                      </span>
                    );
                  })()}
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{formatFecha(selectedOrder.datPedido)}</span>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'info'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Información
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('productos')}
                      className={`pb-3 px-2 font-semibold text-sm transition-colors border-b-2 ${
                        activeTab === 'productos'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Productos ({selectedOrder.tbItems?.length || 0})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content: Información */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {/* Información del Cliente */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        Información del Cliente
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Nombre</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.tbClientes?.strNombre || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.tbClientes?.strEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teléfono</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.tbClientes?.strTelefono || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Método de Pago</p>
                          <p className="font-semibold text-gray-900">{selectedOrder.tbPagos?.strMetodoPago.toUpperCase() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dirección de Envío */}
                    {selectedOrder.tbDirecciones && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          Dirección de Envío
                        </h3>
                        <p className="text-sm text-gray-700">
                          {selectedOrder.tbDirecciones.strCalle} {selectedOrder.tbDirecciones.strNumeroExterior}
                          {selectedOrder.tbDirecciones.strNumeroInterior && ` Int. ${selectedOrder.tbDirecciones.strNumeroInterior}`}, {selectedOrder.tbDirecciones.strColonia}, {selectedOrder.tbDirecciones.strCiudad}, {selectedOrder.tbDirecciones.strEstado}, CP {selectedOrder.tbDirecciones.strCP}
                        </p>
                        {selectedOrder.tbDirecciones.strReferencias && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-semibold">Referencias:</span> {selectedOrder.tbDirecciones.strReferencias}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Totales */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">${selectedOrder.dblSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío</span>
                        <span className="font-semibold text-gray-900">${selectedOrder.dblCostoEnvio.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900">${selectedOrder.dblTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Productos */}
                {activeTab === 'productos' && (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    
                    {selectedOrder.tbItems && selectedOrder.tbItems.length > 0 ? (
                      selectedOrder.tbItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                            {item.tbProducto.strImagen ? (
                              
                              <img 
                                src={item.tbProducto.strImagen} 
                                alt={item.tbProducto.strNombre}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.tbProducto.strNombre}</p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {item.intCantidad} × ${item.tbProducto.dblPrecio.toLocaleString()}
                            </p>
                            {item.tbProducto.strSKU && (
                              <p className="text-xs text-gray-400">SKU: {item.tbProducto.strSKU}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${item.dblSubtotal.toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-lg text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay productos en este pedido</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-3 pt-4">
                {selectedOrder.strEstado !== 'ENTREGADO' && selectedOrder.strEstado !== 'CANCELADO' && (
                  <button 
                    onClick={() => setShowEstadoModal(true)}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Actualizando...' : 'Actualizar Estado Del Pedido'}
                  </button>
                ) }

                  <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Actualizar Estado */}
        {showEstadoModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Actualizar Estado del Pedido
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Pedido #{selectedOrder.intPedido}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Estado actual: <span className="font-semibold">{getStatusConfig(selectedOrder.strEstado).label}</span>
                </p>

                {/* Diseño especial para ENTREGADO */}
                {selectedOrder.strEstado === 'ENTREGADO' ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-900 mb-2">
                      ¡Pedido Entregado!
                    </h4>
                    <p className="text-sm text-emerald-700 mb-1">
                      Este pedido ha sido completado exitosamente
                    </p>
                    <p className="text-xs text-emerald-600">
                      El estado no puede ser modificado
                    </p>
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-800">
                        Fecha de entrega: {formatFecha(selectedOrder.datPedido)}
                      </p>
                    </div>
                  </div>
                ) : selectedOrder.strEstado === 'CANCELADO' ? (
                  /* Diseño especial para CANCELADO */
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-red-900 mb-2">
                      Pedido Cancelado
                    </h4>
                    <p className="text-sm text-red-700 mb-1">
                      Este pedido ha sido cancelado
                    </p>
                    <p className="text-xs text-red-600">
                      El estado no puede ser modificado
                    </p>
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-xs font-semibold text-red-800">
                        Fecha de cancelación: {formatFecha(selectedOrder.datPedido)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Select normal para otros estados */
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nuevo Estado
                    </label>
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value as EstadoPedido)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Seleccionar estado...</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="PROCESANDO">Procesando</option>
                      <option value="EMPAQUETANDO">Empaquetando</option>
                      <option value="ENVIADO">Enviado</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </>
                )}
              </div>

              {nuevoEstado === 'ENVIADO' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="block text-sm font-semibold text-yellow-900 mb-2">
                    Número de Seguimiento
                  </label>
                  <input
                    type="text"
                    value={strNumeroSeguimiento}
                    onChange={(e) => setStrNumeroSeguimiento(e.target.value)}
                    placeholder="Ej: FEDEX123456789"
                    className="w-full px-4 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-yellow-700 mt-2">
                    Este número se enviará al cliente para rastrear su pedido
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEstadoModal(false);
                    setNuevoEstado('');
                    setStrNumeroSeguimiento('');
                  }}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {selectedOrder.strEstado === 'ENTREGADO' || selectedOrder.strEstado === 'CANCELADO' ? 'Cerrar' : 'Cancelar'}
                </button>
                
                {/* Solo mostrar botón Confirmar si NO es ENTREGADO ni CANCELADO */}
                {selectedOrder.strEstado !== 'ENTREGADO' && selectedOrder.strEstado !== 'CANCELADO' && (
                  <button
                    onClick={handleActualizarEstado}
                    disabled={!nuevoEstado || updatingStatus}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Actualizando...' : 'Confirmar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}