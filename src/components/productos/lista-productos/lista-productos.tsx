"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Plus, Package, CheckCircle, XCircle, Eye, Edit, Trash2, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatFecha } from "@/src/lib/formatFecha";

interface Producto {
  intProducto: number;
  strNombre: string;
  strDescripcion: string;
  dblPrecio: number;
  intStock: number;
  strImagen: string;
  bolActivo: boolean;
  datCreacion: string;
  dblPrecioDescuento?: number;
  intPorcentajeDescuento?: number;
  datInicioDescuento?: string;
  datFinDescuento?: string;
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
                  strDescripcion
                  dblPrecio
                  intStock
                  strImagen
                  bolActivo
                  datCreacion
                  dblPrecioDescuento
                  intPorcentajeDescuento
                  datInicioDescuento
                  datFinDescuento
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
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
      </div>
    </div>
  );
}
