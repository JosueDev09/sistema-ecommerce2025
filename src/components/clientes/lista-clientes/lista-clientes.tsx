"use client";

import { useState } from "react";
import { useClientes } from "../../../hooks/useClientes";
import { formatFecha } from "../../../lib/formatFecha";
import { 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  User, 
  Calendar,
  X,
  Loader2,
  AlertCircle,
  CreditCard,
  Truck
} from "lucide-react";

interface ClienteSeleccionado {
  intCliente: number;
  strNombre: string;
  strUsuario: string;
  strEmail: string;
  strTelefono?: string;
  bolActivo: boolean;
  datRegistro: string;
  tbDirecciones?: Array<{
    intDireccion: number;
    strCalle: string;
    strNumeroExterior: string;
    strNumeroInterior?: string;
    strColonia: string;
    strCiudad: string;
    strEstado: string;
    strCP: string;
    strPais: string;
    strReferencias?: string;
  }>;
  tbPedidos?: Array<{
    intPedido: number;
    dblTotal: number;
    strEstado: string;
    strEstadoPago: string;
    datPedido: string;
    tbItems: Array<{
      intCantidad: number;
      dblSubtotal: number;
      tbProducto: {
        strNombre: string;
        strImagen?: string;
      };
    }>;
  }>;
}

export default function ListaClientes() {
  const { clientes, loading, error } = useClientes();
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteSeleccionado | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "pedidos">("info");

  const abrirModal = (cliente: ClienteSeleccionado) => {
    setClienteSeleccionado(cliente);
    setActiveTab("info");
  };

  const cerrarModal = () => {
    setClienteSeleccionado(null);
  };

  const getStatusConfig = (estado: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      PENDIENTE: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
      PROCESANDO: { color: "bg-blue-100 text-blue-800", label: "Procesando" },
      EMPAQUETANDO: { color: "bg-purple-100 text-purple-800", label: "Empaquetando" },
      ENVIADO: { color: "bg-green-100 text-green-800", label: "Enviado" },
      ENTREGADO: { color: "bg-emerald-100 text-emerald-800", label: "Entregado" },
      CANCELADO: { color: "bg-red-100 text-red-800", label: "Cancelado" },
    };
    return configs[estado] || { color: "bg-gray-100 text-gray-800", label: estado };
  };

  const getPagoStatusConfig = (estado: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      PENDIENTE: { color: "bg-yellow-100 text-yellow-800", label: "Pendiente" },
      PAGADO: { color: "bg-green-100 text-green-800", label: "Pagado" },
      RECHAZADO: { color: "bg-red-100 text-red-800", label: "Rechazado" },
      CANCELADO: { color: "bg-gray-100 text-gray-800", label: "Cancelado" },
      REEMBOLSADO: { color: "bg-orange-100 text-orange-800", label: "Reembolsado" },
    };
    return configs[estado] || { color: "bg-gray-100 text-gray-800", label: estado };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error al cargar clientes</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-[30px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
        <p className="text-gray-600">Lista completa de clientes registrados</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 ">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
            </div>
            <User className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {clientes.filter((c: { bolActivo: boolean }) => c.bolActivo).length}
              </p>
            </div>
            <User className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Con Pedidos</p>
              <p className="text-2xl font-bold text-purple-600">
                {clientes.filter((c: { tbPedidos?: unknown[] }) => c.tbPedidos && c.tbPedidos.length > 0).length}
              </p>
            </div>
            <Package className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente: ClienteSeleccionado) => (
                <tr key={cliente.intCliente} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{cliente.intCliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.strNombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{cliente.strUsuario}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {cliente.strEmail}
                      </div>
                      {cliente.strTelefono && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {cliente.strTelefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Package className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-semibold">
                        {cliente.tbPedidos?.length || 0}
                      </span>
                      <span className="ml-1 text-gray-600">pedidos</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatFecha(cliente.datRegistro)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.bolActivo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {cliente.bolActivo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => abrirModal(cliente as ClienteSeleccionado)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay clientes registrados
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Los clientes aparecerán aquí cuando se registren.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-2 border-gray-300">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-2">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {clienteSeleccionado.strNombre}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    @{clienteSeleccionado.strUsuario} • #{clienteSeleccionado.intCliente}
                  </p>
                </div>
              </div>
              <button
                onClick={cerrarModal}
                className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("info")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "info"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("pedidos")}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "pedidos"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Pedidos
                    {clienteSeleccionado.tbPedidos && clienteSeleccionado.tbPedidos.length > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {clienteSeleccionado.tbPedidos.length}
                      </span>
                    )}
                  </div>
                </button>
              </nav>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "info" && (
                <div className="space-y-6">
                  {/* Información Personal */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Nombre completo</label>
                        <p className="text-gray-900 font-medium">{clienteSeleccionado.strNombre}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Usuario</label>
                        <p className="text-gray-900 font-medium">@{clienteSeleccionado.strUsuario}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <p className="text-gray-900 font-medium">{clienteSeleccionado.strEmail}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Teléfono
                        </label>
                        <p className="text-gray-900 font-medium">
                          {clienteSeleccionado.strTelefono || "No proporcionado"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Fecha de registro
                        </label>
                        <p className="text-gray-900 font-medium">
                          {formatFecha(clienteSeleccionado.datRegistro)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Estado</label>
                        <p>
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              clienteSeleccionado.bolActivo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {clienteSeleccionado.bolActivo ? "Activo" : "Inactivo"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direcciones */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Direcciones de Envío
                    </h3>
                    {clienteSeleccionado.tbDirecciones && clienteSeleccionado.tbDirecciones.length > 0 ? (
                      <div className="space-y-3">
                        {clienteSeleccionado.tbDirecciones.map((direccion) => (
                          <div
                            key={direccion.intDireccion}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {direccion.strCalle} {direccion.strNumeroExterior}
                                  {direccion.strNumeroInterior && ` Int. ${direccion.strNumeroInterior}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {direccion.strColonia}, {direccion.strCiudad}, {direccion.strEstado}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {direccion.strPais} - CP: {direccion.strCP}
                                </p>
                                {direccion.strReferencias && (
                                  <p className="text-xs text-gray-500 mt-2 italic">
                                    {direccion.strReferencias}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          No hay direcciones registradas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "pedidos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Historial de Pedidos
                    </h3>
                    {clienteSeleccionado.tbPedidos && clienteSeleccionado.tbPedidos.length > 0 && (
                      <span className="text-sm text-gray-600">
                        Total: {clienteSeleccionado.tbPedidos.length} pedidos
                      </span>
                    )}
                  </div>

                  {clienteSeleccionado.tbPedidos && clienteSeleccionado.tbPedidos.length > 0 ? (
                    <div className="space-y-3">
                      {clienteSeleccionado.tbPedidos
                        .sort((a, b) => new Date(b.datPedido).getTime() - new Date(a.datPedido).getTime())
                        .map((pedido) => {
                          const statusConfig = getStatusConfig(pedido.strEstado);
                          const pagoConfig = getPagoStatusConfig(pedido.strEstadoPago);
                          
                          return (
                            <div
                              key={pedido.intPedido}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      Pedido #{pedido.intPedido}
                                    </h4>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                                      <Truck className="inline h-3 w-3 mr-1" />
                                      {statusConfig.label}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${pagoConfig.color}`}>
                                      <CreditCard className="inline h-3 w-3 mr-1" />
                                      {pagoConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatFecha(pedido.datPedido)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-gray-900">
                                    ${pedido.dblTotal.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Items del pedido */}
                              {pedido.tbItems && pedido.tbItems.length > 0 && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                  <p className="text-sm text-gray-600 mb-2 font-medium">
                                    Productos ({pedido.tbItems.length}):
                                  </p>
                                  <div className="space-y-2">
                                    {pedido.tbItems.slice(0, 3).map((item, index) => (
                                      <div key={index} className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                          {item.tbProducto.strImagen ? (
                                            <img
                                              src={item.tbProducto.strImagen}
                                              alt={item.tbProducto.strNombre}
                                              className="w-full h-full object-cover rounded"
                                            />
                                          ) : (
                                            <Package className="h-5 w-5 text-gray-400" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-gray-900 font-medium">
                                            {item.tbProducto.strNombre}
                                          </p>
                                          <p className="text-gray-600 text-xs">
                                            Cantidad: {item.intCantidad} • ${item.dblSubtotal.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                    {pedido.tbItems.length > 3 && (
                                      <p className="text-xs text-gray-500 italic">
                                        + {pedido.tbItems.length - 3} productos más
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Package className="mx-auto h-16 w-16 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No hay pedidos
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Este cliente aún no ha realizado ningún pedido.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={cerrarModal}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}