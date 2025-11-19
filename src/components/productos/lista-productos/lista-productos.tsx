"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Plus, Package, CheckCircle, XCircle, Eye, Edit, Trash2, TrendingUp, AlertCircle, DollarSign, X, Tag, Percent, Calendar, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatFecha } from "@/src/lib/formatFecha";
import SweetAlert from "sweetalert2";
import { formatFechas } from "@/src/utils/formatearFechas";

interface Producto {
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  strMarca?: string;
  strDescripcion: string;
  strDescripcionLarga?: string;
  dblPrecio: number;
  intStock: number;
  intStockMinimo?: number;
  strImagen: string;
  bolActivo: boolean;
  bolDestacado?: boolean;
  strEstado?: string;
  bolTieneDescuento?: boolean;
  dblPrecioDescuento?: number;
  intPorcentajeDescuento?: number;
  datInicioDescuento?: string;
  datFinDescuento?: string;
  strPeso?: string;
  strDimensiones?: string;
  strEtiquetas?: string;
  jsonVariantes?: string;
  jsonImagenes?: string;
  datCreacion: string;
  datActualizacion?: string;
  tbCategoria: {
    intCategoria: number;
    strNombre: string;
  };
  tbCreadoPor?: {
    intEmpleado: number;
    strNombre: string;
  };
}

export default function ListaProductos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterStock, setFilterStock] = useState("todos");
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ intCategoria: number; strNombre: string }[]>([]);
  
  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // 🔹 Obtener productos desde GraphQL
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                obtenerProductos {
                  intProducto
                  strNombre
                  strSKU
                  strMarca
                  strDescripcion
                  strDescripcionLarga
                  dblPrecio
                  intStock
                  intStockMinimo
                  strImagen
                  bolActivo
                  bolDestacado
                  strEstado
                  bolTieneDescuento
                  dblPrecioDescuento
                  intPorcentajeDescuento
                  datInicioDescuento
                  datFinDescuento
                  strPeso
                  strDimensiones
                  strEtiquetas
                  jsonVariantes
                  jsonImagenes
                  datCreacion
                  datActualizacion
                  tbCategoria {
                    intCategoria
                    strNombre
                  }
                  tbCreadoPor {
                    intEmpleado
                    strNombre
                  }
                }
              }
            `,
          }),
        });

        const { data } = await res.json();
        setProductos(data.obtenerProductos);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                obtenerCategorias {
                  intCategoria
                  strNombre
                }
              }
            `,
          }),
        });

        const { data } = await res.json();
        setCategorias(data.obtenerCategorias);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    fetchProductos();
    fetchCategorias();
  }, []);

  const filteredProductos = productos.filter((prod) => {
    const matchesSearch =
      prod.strNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.strDescripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.tbCategoria.strNombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "todos" || 
      (filterStatus === "activo" && prod.bolActivo) ||
      (filterStatus === "inactivo" && !prod.bolActivo);
    
    const matchesCategoria = 
      filterCategoria === "todas" || 
      prod.tbCategoria.intCategoria === parseInt(filterCategoria);
    
    const matchesStock = 
      filterStock === "todos" ||
      (filterStock === "disponible" && prod.intStock > 10) ||
      (filterStock === "bajo" && prod.intStock > 0 && prod.intStock <= 10) ||
      (filterStock === "agotado" && prod.intStock === 0);

    return matchesSearch && matchesStatus && matchesCategoria && matchesStock;
  });

  const statusCounts = {
    todos: productos.length,
    activo: productos.filter((p) => p.bolActivo).length,
    inactivo: productos.filter((p) => !p.bolActivo).length,
  };

  const stockCounts = {
    todos: productos.length,
    disponible: productos.filter((p) => p.intStock > 10).length,
    bajo: productos.filter((p) => p.intStock > 0 && p.intStock <= 10).length,
    agotado: productos.filter((p) => p.intStock === 0).length,
  };

  const getStatusConfig = (activo: boolean) => {
    if (activo)
      return { label: "Activo", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle };
    return { label: "Inactivo", color: "text-red-700", bg: "bg-red-100", icon: XCircle };
  };

  const getStockConfig = (stock: number) => {
    if (stock > 10)
      return { label: "Disponible", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle };
    if (stock > 0)
      return { label: "Stock Bajo", color: "text-orange-700", bg: "bg-orange-100", icon: AlertCircle };
    return { label: "Agotado", color: "text-red-700", bg: "bg-red-100", icon: XCircle };
  };

  // Función para ver detalles
  const handleVerDetalles = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  // Función para editar
  const handleEditar = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowEditModal(true);
  };

  // Función para eliminar
  const handleEliminar = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const confirmarEliminar = async () => {
    if (!selectedProducto) return;

    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation EliminarProducto($intProducto: Int!) {
              eliminarProducto(intProducto: $intProducto)
            }
          `,
          variables: {
            intProducto: selectedProducto.intProducto
          }
        }),
      });

      const result = await res.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error al eliminar el producto');
      }

      // Actualizar la lista de productos
      setProductos(productos.filter(p => p.intProducto !== selectedProducto.intProducto));
      setShowDeleteModal(false);
      setSelectedProducto(null);
      
     SweetAlert.fire({
        icon: 'success',
        title: 'Producto eliminado exitosamente',
        });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      SweetAlert.fire({
        icon: 'error',
        title: 'Error al eliminar el producto',
        text: (error as Error).message,
      });
    }
  };

  // Función para guardar edición
  const handleGuardarEdicion = async (productoEditado: Producto) => {
    try {
      // Aquí implementarás la mutación de actualización cuando esté lista
      console.log('Producto editado:', productoEditado);
      
      // Actualizar en el estado local
      setProductos(productos.map(p => 
        p.intProducto === productoEditado.intProducto ? productoEditado : p
      ));
      
      setShowEditModal(false);
      setSelectedProducto(null);
      SweetAlert.fire({
        icon: 'success',
        title: 'Producto actualizado exitosamente',
        });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert('Error al actualizar el producto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-500 mt-1">
              Gestiona el inventario y catálogo de productos
            </p>
          </div>

          <button
            onClick={() => router.push("/productos/alta-productos")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{productos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stockCounts.bajo}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agotados</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stockCounts.agotado}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Inventario</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${productos.reduce((acc, p) => acc + (p.dblPrecio * p.intStock), 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todos ({statusCounts.todos})</option>
                <option value="activo">Activos ({statusCounts.activo})</option>
                <option value="inactivo">Inactivos ({statusCounts.inactivo})</option>
              </select>

              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.intCategoria} value={cat.intCategoria.toString()}>
                    {cat.strNombre}
                  </option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todo el stock</option>
                <option value="disponible">Disponible ({stockCounts.disponible})</option>
                <option value="bajo">Stock Bajo ({stockCounts.bajo})</option>
                <option value="agotado">Agotado ({stockCounts.agotado})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Creación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Cargando productos...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProductos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                      <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                    </td>
                  </tr>
                ) : (
                  filteredProductos.map((prod) => {
                    const statusConfig = getStatusConfig(prod.bolActivo);
                    const stockConfig = getStockConfig(prod.intStock);
                    const StatusIcon = statusConfig.icon;
                    const StockIcon = stockConfig.icon;
                    
                    return (
                      <tr key={prod.intProducto} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.strImagen || "/placeholder-product.png"}
                              alt={prod.strNombre}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {prod.strNombre}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {prod.strDescripcion}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {prod.tbCategoria.strNombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {prod.dblPrecioDescuento && prod.dblPrecioDescuento > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">${prod.dblPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                  {prod.intPorcentajeDescuento && (
                                    <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full">
                                      -{prod.intPorcentajeDescuento}%
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-rose-600">
                                  ${prod.dblPrecioDescuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">
                                ${prod.dblPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {prod.intStock} unidades
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${stockConfig.bg} ${stockConfig.color} w-fit`}
                            >
                              <StockIcon className="w-3 h-3" />
                              {stockConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatFecha(prod.datCreacion)}
                          </div>
                          {prod.tbCreadoPor && (
                            <div className="text-xs text-gray-500">
                              Por: {prod.tbCreadoPor.strNombre}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button 
                            onClick={() => handleVerDetalles(prod)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditar(prod)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEliminar(prod)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalles */}
        {showModal && selectedProducto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProducto.strNombre}</h2>
                    <p className="text-gray-500 mt-1">SKU: {selectedProducto.strSKU || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-6">
                {/* Badges de Estado */}
                <div className="flex flex-wrap gap-3">
                  {selectedProducto.bolActivo ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle className="w-5 h-5" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700">
                      <XCircle className="w-5 h-5" />
                      Inactivo
                    </span>
                  )}
                  {selectedProducto.bolDestacado && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-100 text-yellow-700">
                      <TrendingUp className="w-5 h-5" />
                      Destacado
                    </span>
                  )}
                  {selectedProducto.bolTieneDescuento && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-rose-100 text-rose-700">
                      <Percent className="w-5 h-5" />
                      Con Descuento
                    </span>
                  )}
                </div>

                {/* Imagen Principal */}
                {selectedProducto.strImagen && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <img
                      src={selectedProducto.strImagen}
                      alt={selectedProducto.strNombre}
                      className="w-full h-64 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Información Básica */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    Información del Producto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Marca</p>
                      <p className="font-semibold text-gray-900">{selectedProducto.strMarca || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Categoría</p>
                      <p className="font-semibold text-gray-900">{selectedProducto.tbCategoria.strNombre}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Descripción</p>
                      <p className="font-semibold text-gray-900">{selectedProducto.strDescripcion}</p>
                    </div>
                    {selectedProducto.strDescripcionLarga && (
                      <div className="md:col-span-2">
                        <p className="text-gray-500">Descripción Detallada</p>
                        <p className="font-semibold text-gray-900">{selectedProducto.strDescripcionLarga}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Precio e Inventario */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    Precio e Inventario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Precio Regular</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        ${selectedProducto.dblPrecio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {selectedProducto.dblPrecioDescuento && selectedProducto.dblPrecioDescuento > 0 && (
                      <div>
                        <p className="text-gray-500">Precio con Descuento</p>
                        <p className="font-semibold text-rose-600 text-lg">
                          ${selectedProducto.dblPrecioDescuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Stock Disponible</p>
                      <p className="font-semibold text-gray-900">{selectedProducto.intStock} unidades</p>
                    </div>
                    {selectedProducto.intStockMinimo && (
                      <div>
                        <p className="text-gray-500">Stock Mínimo</p>
                        <p className="font-semibold text-gray-900">{selectedProducto.intStockMinimo} unidades</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descuento (si existe) */}
                {selectedProducto.bolTieneDescuento && (
                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-rose-600" />
                      Información de Descuento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedProducto.intPorcentajeDescuento && (
                        <div>
                          <p className="text-gray-500">Porcentaje</p>
                          <p className="font-semibold text-rose-700">{selectedProducto.intPorcentajeDescuento}% OFF</p>
                        </div>
                      )}
                      {selectedProducto.datInicioDescuento && (
                        <div>
                          <p className="text-gray-500">Inicio</p>
                          <p className="font-semibold text-gray-900">{formatFecha(selectedProducto.datInicioDescuento)}</p>
                        </div>
                      )}
                      {selectedProducto.datFinDescuento && (
                        <div>
                          <p className="text-gray-500">Fin</p>
                          <p className="font-semibold text-gray-900">{formatFecha(selectedProducto.datFinDescuento)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información Adicional */}
                {(selectedProducto.strPeso || selectedProducto.strDimensiones || selectedProducto.strEtiquetas) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-gray-600" />
                      Información Adicional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedProducto.strPeso && (
                        <div>
                          <p className="text-gray-500">Peso</p>
                          <p className="font-semibold text-gray-900">{selectedProducto.strPeso} kg</p>
                        </div>
                      )}
                      {selectedProducto.strDimensiones && (
                        <div>
                          <p className="text-gray-500">Dimensiones</p>
                          <p className="font-semibold text-gray-900">{selectedProducto.strDimensiones} cm</p>
                        </div>
                      )}
                      {selectedProducto.strEtiquetas && (
                        <div className="md:col-span-2">
                          <p className="text-gray-500 mb-2">Etiquetas</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedProducto.strEtiquetas.split(',').map((etiqueta, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {etiqueta.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Variantes (si existen) */}
                {selectedProducto.jsonVariantes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-gray-600" />
                      Variantes
                    </h3>
                    <div className="space-y-2 text-sm">
                      {JSON.parse(selectedProducto.jsonVariantes).map((variante: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{variante.nombre}:</span>
                          <span className="text-gray-600">{variante.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información de Registro */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Información de Registro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha de Creación</p>
                      <p className="font-semibold text-gray-900">{formatFecha(selectedProducto.datCreacion)}</p>
                    </div>
                    {selectedProducto.datActualizacion && (
                      <div>
                        <p className="text-gray-500">Última Actualización</p>
                        <p className="font-semibold text-gray-900">{formatFecha(selectedProducto.datActualizacion)}</p>
                      </div>
                    )}
                    {selectedProducto.tbCreadoPor && (
                      <div className="md:col-span-2">
                        <p className="text-gray-500">Creado por</p>
                        <p className="font-semibold text-gray-900">{selectedProducto.tbCreadoPor.strNombre}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      handleEditar(selectedProducto);
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Editar Producto
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición */}
        {showEditModal && selectedProducto && (
          <ModalEdicion
            producto={selectedProducto}
            categorias={categorias}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProducto(null);
            }}
            onSave={handleGuardarEdicion}
          />
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && selectedProducto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Eliminar Producto</h3>
                  <p className="text-gray-500 text-sm mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  ¿Estás seguro de que deseas eliminar el producto{' '}
                  <span className="font-bold text-gray-900">{selectedProducto.strNombre}</span>?
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  SKU: {selectedProducto.strSKU || 'N/A'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmarEliminar}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Sí, Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProducto(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Modal de Edición
function ModalEdicion({ 
  producto, 
  categorias, 
  onClose, 
  onSave 
}: { 
  producto: Producto; 
  categorias: { intCategoria: number; strNombre: string }[];
  onClose: () => void;
  onSave: (producto: Producto) => void;
}) {
  const [formData, setFormData] = useState<Producto>(producto);
  const [variantes, setVariantes] = useState<{nombre: string; valor: string}[]>(
    producto.jsonVariantes ? JSON.parse(producto.jsonVariantes) : [{nombre: '', valor: ''}]
  );
  const [images, setImages] = useState<string[]>(
    producto.jsonImagenes ? JSON.parse(producto.jsonImagenes) : producto.strImagen ? [producto.strImagen] : []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Agregar variante
  const addVariante = () => {
    setVariantes([...variantes, { nombre: '', valor: '' }]);
  };

  // Eliminar variante
  const removeVariante = (index: number) => {
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  // Actualizar variante
  const updateVariante = (index: number, field: string, value: string) => {
    setVariantes(variantes.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  // Agregar imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  // Eliminar imagen
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Calcular precio con descuento automáticamente
  const calcularPrecioDescuento = () => {
    if (formData.bolTieneDescuento && formData.dblPrecio && formData.intPorcentajeDescuento) {
      const precioOriginal = parseFloat(formData.dblPrecio.toString());
      const porcentaje = parseInt(formData.intPorcentajeDescuento.toString());
      
      if (!isNaN(precioOriginal) && !isNaN(porcentaje) && porcentaje > 0 && porcentaje <= 100) {
        const descuento = precioOriginal * (porcentaje / 100);
        const precioConDescuento = precioOriginal - descuento;
        
        setFormData(prev => ({
          ...prev,
          dblPrecioDescuento: parseFloat(precioConDescuento.toFixed(2))
        }));
      }
    }
  };

  // Efecto para calcular precio con descuento
  useState(() => {
    calcularPrecioDescuento();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos con variantes e imágenes
    const productoActualizado = {
      ...formData,
      jsonVariantes: variantes.length > 0 && variantes[0].nombre ? JSON.stringify(variantes) : undefined,
      jsonImagenes: images.length > 0 ? JSON.stringify(images) : undefined,
      strImagen: images.length > 0 ? images[0] : formData.strImagen,
    };
    
    onSave(productoActualizado);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
                <p className="text-gray-500 mt-1">Modifica la información del producto</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="strNombre"
                    value={formData.strNombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="strMarca"
                    value={formData.strMarca || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="intCategoria"
                    value={formData.tbCategoria.intCategoria}
                    onChange={(e) => {
                      const cat = categorias.find(c => c.intCategoria === parseInt(e.target.value));
                      if (cat) {
                        setFormData(prev => ({
                          ...prev,
                          tbCategoria: cat
                        }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  >
                    {categorias.map((cat) => (
                      <option key={cat.intCategoria} value={cat.intCategoria}>
                        {cat.strNombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="strSKU"
                    value={formData.strSKU || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="strDescripcion"
                    value={formData.strDescripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Precio e Inventario */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Precio e Inventario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio Regular *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="dblPrecio"
                      value={formData.dblPrecio}
                      onChange={(e) => {
                        handleChange(e);
                        setTimeout(calcularPrecioDescuento, 0);
                      }}
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    name="intStock"
                    value={formData.intStock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    name="intStockMinimo"
                    value={formData.intStockMinimo || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alerta cuando el stock sea menor a este valor</p>
                </div>
              </div>
            </div>

            {/* Descuentos y Promociones */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-600" />
                Descuentos y Promociones
              </h3>
              
              {/* Toggle de Descuento */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Percent className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Producto con descuento</p>
                    <p className="text-sm text-gray-500">Aplica un precio promocional</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  
                  <input
                    type="checkbox"
                    name="bolTieneDescuento"
                    checked={formData.bolTieneDescuento || false}
                    onChange={(e) => {
                      handleChange(e);
                      if (!e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          dblPrecioDescuento: undefined,
                          intPorcentajeDescuento: undefined,
                          datInicioDescuento: undefined,
                          datFinDescuento: undefined
                        }));
                        
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Campos de Descuento */}
              {formData.bolTieneDescuento && (
                <div className="space-y-4 p-4 border-2 border-rose-200 rounded-lg bg-rose-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Porcentaje de Descuento *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="intPorcentajeDescuento"
                          value={formData.intPorcentajeDescuento || ''}
                          onChange={(e) => {
                            handleChange(e);
                            setTimeout(calcularPrecioDescuento, 0);
                          }}
                          min="1"
                          max="100"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                          placeholder="10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Precio con Descuento
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.dblPrecioDescuento || ''}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Calculado automáticamente</p>
                    </div>
                  </div>

                  {/* Vista Previa del Ahorro */}
                  {formData.dblPrecio && formData.intPorcentajeDescuento && formData.dblPrecioDescuento && (
                    <div className="p-4 bg-rose-100 rounded-lg border border-rose-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-rose-700 font-medium">Vista previa del precio</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-lg text-gray-500 line-through">${formData.dblPrecio.toFixed(2)}</span>
                            <span className="text-2xl font-bold text-rose-700">${formData.dblPrecioDescuento.toFixed(2)}</span>
                            <span className="px-3 py-1 bg-rose-600 text-white text-sm font-bold rounded-full">
                              -{formData.intPorcentajeDescuento}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-rose-700 font-medium">Ahorro</p>
                          <p className="text-xl font-bold text-rose-700 mt-1">
                            ${(formData.dblPrecio - formData.dblPrecioDescuento).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fechas de Vigencia */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Período de Vigencia (Opcional)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Inicio
                        </label>
                        <input
                          type="datetime-local"
                          name="datInicioDescuento"
                          value={(() => {
                            if (!formData.datInicioDescuento) return '';
                            try {
                              // Si ya está en formato datetime-local (YYYY-MM-DDTHH:mm), retornarlo directamente
                              if (typeof formData.datInicioDescuento === 'string' && formData.datInicioDescuento.includes('T') && formData.datInicioDescuento.length === 16) {
                                return formData.datInicioDescuento;
                              }
                              
                              // Convertir string timestamp a número
                              const timestamp = typeof formData.datInicioDescuento === 'string' 
                                ? parseInt(formData.datInicioDescuento, 10) 
                                : formData.datInicioDescuento;
                              
                              const date = new Date(timestamp);
                              if (isNaN(date.getTime())) {
                                return '';
                              }
                              return date.toISOString().slice(0, 16);
                            } catch {
                              return '';
                            }
                          })()}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Fin
                        </label>
                        <input
                          type="datetime-local"
                          name="datFinDescuento"
                          value={(() => {
                            if (!formData.datFinDescuento) return '';
                            try {
                              // Si ya está en formato datetime-local (YYYY-MM-DDTHH:mm), retornarlo directamente
                              if (typeof formData.datFinDescuento === 'string' && formData.datFinDescuento.includes('T') && formData.datFinDescuento.length === 16) {
                                return formData.datFinDescuento;
                              }
                              
                              // Convertir string timestamp a número
                              const timestamp = typeof formData.datFinDescuento === 'string' 
                                ? parseInt(formData.datFinDescuento, 10) 
                                : formData.datFinDescuento;
                              
                              const date = new Date(timestamp);
                              if (isNaN(date.getTime())) {
                                return '';
                              }
                              console.log(date);
                              return date.toISOString().slice(0, 16);
                            } catch {
                              return '';
                            }
                          })()}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Imágenes */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                Imágenes del Producto
              </h3>
              
              {/* Preview de Imágenes */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Producto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Tag className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Subir imágenes</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Variantes */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  Variantes del Producto
                </h3>
                <button
                  type="button"
                  onClick={addVariante}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {variantes.map((variante, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={variante.nombre}
                      onChange={(e) => updateVariante(index, 'nombre', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Ej: Color"
                    />
                    <input
                      type="text"
                      value={variante.valor}
                      onChange={(e) => updateVariante(index, 'valor', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Ej: Negro, Blanco, Azul"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariante(index)}
                      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Estados */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Estado del Producto
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name="bolActivo"
                    checked={formData.bolActivo}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Producto Activo</span>
                    <p className="text-xs text-gray-500">El producto estará visible en la tienda</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name="bolDestacado"
                    checked={formData.bolDestacado || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Producto Destacado</span>
                    <p className="text-xs text-gray-500">Se mostrará en la sección destacados</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 p-6 flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
