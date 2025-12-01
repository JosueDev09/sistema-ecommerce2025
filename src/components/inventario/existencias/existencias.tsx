"use client";

import { useState, useMemo } from "react";
import { useExistencias, type Producto } from "@/hooks/useExistencias";
import {
  Package,
  Search,
  Filter,
  Download,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  BarChart3,
  RefreshCw,
  Eye,
  X,
  PackageX,
  PackageCheck,
} from "lucide-react";
import Image from "next/image";

export default function Existencias() {
  const { productos, estadisticas, loading, error, refetch } = useExistencias();
  
  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroStock, setFiltroStock] = useState<string>("todos");
  const [ordenamiento, setOrdenamiento] = useState<string>("nombre-asc");
  
  // Modal de detalles
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = productos.map((p: Producto) => p.tbCategoria.strNombre);
    return Array.from(new Set(cats)).sort();
  }, [productos]);

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];

    // Búsqueda por nombre, SKU o marca
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.strNombre.toLowerCase().includes(busquedaLower) ||
          p.strSKU?.toLowerCase().includes(busquedaLower) ||
          p.strMarca?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== "todas") {
      resultado = resultado.filter((p) => p.tbCategoria.strNombre === filtroCategoria);
    }

    // Filtro por estado
    if (filtroEstado !== "todos") {
      const activo = filtroEstado === "activo";
      resultado = resultado.filter((p) => p.bolActivo === activo);
    }

    // Filtro por stock
    if (filtroStock === "sin-stock") {
      resultado = resultado.filter((p) => p.intStock === 0);
    } else if (filtroStock === "bajo-stock") {
      resultado = resultado.filter(
        (p) => p.intStock > 0 && p.intStockMinimo && p.intStock <= p.intStockMinimo
      );
    } else if (filtroStock === "stock-ok") {
      resultado = resultado.filter(
        (p) =>
          p.intStock > 0 &&
          (!p.intStockMinimo || p.intStock > p.intStockMinimo)
      );
    }

    // Ordenamiento
    const [campo, direccion] = ordenamiento.split("-");
    resultado.sort((a, b) => {
      let valorA: any, valorB: any;

      switch (campo) {
        case "nombre":
          valorA = a.strNombre.toLowerCase();
          valorB = b.strNombre.toLowerCase();
          break;
        case "sku":
          valorA = a.strSKU?.toLowerCase() || "";
          valorB = b.strSKU?.toLowerCase() || "";
          break;
        case "stock":
          valorA = a.intStock;
          valorB = b.intStock;
          break;
        case "precio":
          valorA = a.dblPrecio;
          valorB = b.dblPrecio;
          break;
        case "valor":
          valorA = a.dblPrecio * a.intStock;
          valorB = b.dblPrecio * b.intStock;
          break;
        default:
          return 0;
      }

      if (direccion === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    return resultado;
  }, [productos, busqueda, filtroCategoria, filtroEstado, filtroStock, ordenamiento]);

  // Función para exportar a CSV
  const exportarCSV = () => {
    const headers = [
      "SKU",
      "Producto",
      "Marca",
      "Categoría",
      "Stock Actual",
      "Stock Mínimo",
      "Precio Unitario",
      "Valor Total",
      "Estado",
    ];

    const rows = productosFiltrados.map((p) => [
      p.strSKU || "",
      p.strNombre,
      p.strMarca || "",
      p.tbCategoria.strNombre,
      p.intStock,
      p.intStockMinimo || 0,
      `$${p.dblPrecio.toFixed(2)}`,
      `$${(p.dblPrecio * p.intStock).toFixed(2)}`,
      p.bolActivo ? "Activo" : "Inactivo",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `existencias_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Función para abrir modal de detalles
  const verDetalles = (producto: any) => {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  // Determinar estado del stock
  const getEstadoStock = (producto: any) => {
    if (producto.intStock === 0) {
      return { texto: "Sin Stock", color: "text-red-600", bg: "bg-red-100" };
    }
    if (producto.intStockMinimo && producto.intStock <= producto.intStockMinimo) {
      return { texto: "Bajo Stock", color: "text-yellow-600", bg: "bg-yellow-100" };
    }
    return { texto: "Stock OK", color: "text-green-600", bg: "bg-green-100" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando existencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Error al cargar existencias</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 ml-[30px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Control de Existencias
            </h1>
            <p className="text-gray-600 mt-1">
              Monitoreo y gestión del inventario en tiempo real
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Total Productos */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{estadisticas.totalProductos}</p>
            <p className="text-blue-100 text-sm">Total Productos</p>
          </div>

          {/* Productos Activos */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <PackageCheck className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{estadisticas.productosActivos}</p>
            <p className="text-green-100 text-sm">Productos Activos</p>
          </div>

          {/* Sin Stock */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <PackageX className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{estadisticas.productosSinStock}</p>
            <p className="text-red-100 text-sm">Sin Stock</p>
          </div>

          {/* Bajo Stock */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{estadisticas.productosBajoStock}</p>
            <p className="text-yellow-100 text-sm">Bajo Stock</p>
          </div>

          {/* Valor Inventario */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 opacity-80" />
              <BarChart3 className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-3xl font-bold">
              ${estadisticas.totalValorInventario.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-purple-100 text-sm">Valor Total del Inventario</p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="inline h-4 w-4 mr-1" />
              Buscar producto
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, SKU o marca..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              {categorias.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          {/* Filtro Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <select
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="sin-stock">Sin Stock</option>
              <option value="bajo-stock">Bajo Stock</option>
              <option value="stock-ok">Stock OK</option>
            </select>
          </div>
        </div>

        {/* Ordenamiento */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="sku-asc">SKU (A-Z)</option>
            <option value="sku-desc">SKU (Z-A)</option>
            <option value="stock-asc">Stock (Menor a Mayor)</option>
            <option value="stock-desc">Stock (Mayor a Menor)</option>
            <option value="precio-asc">Precio (Menor a Mayor)</option>
            <option value="precio-desc">Precio (Mayor a Menor)</option>
            <option value="valor-desc">Valor Total (Mayor a Menor)</option>
          </select>
          <span className="text-sm text-gray-600">
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </span>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Imagen</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Marca</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Categoría</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Stock Actual
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Stock Mínimo
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Precio Unit.
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold">
                  Valor Total
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">
                      No se encontraron productos
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => {
                  const estadoStock = getEstadoStock(producto);
                  const valorTotal = producto.dblPrecio * producto.intStock;

                  return (
                    <tr
                      key={producto.intProducto}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Imagen */}
                      <td className="px-6 py-4">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {producto.strImagen ? (
                            <img
                              src={producto.strImagen}
                              alt={producto.strNombre}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {producto.strSKU || "N/A"}
                        </span>
                      </td>

                      {/* Producto */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">
                            {producto.strNombre}
                          </p>
                        </div>
                      </td>

                      {/* Marca */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {producto.strMarca || "N/A"}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {producto.tbCategoria.strNombre}
                        </span>
                      </td>

                      {/* Stock Actual */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-lg font-bold ${
                            producto.intStock === 0
                              ? "text-red-600"
                              : producto.intStockMinimo &&
                                producto.intStock <= producto.intStockMinimo
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {producto.intStock}
                        </span>
                      </td>

                      {/* Stock Mínimo */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {producto.intStockMinimo || "N/A"}
                        </span>
                      </td>

                      {/* Precio Unitario */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          ${producto.dblPrecio.toFixed(2)}
                        </span>
                      </td>

                      {/* Valor Total */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-purple-600">
                          ${valorTotal.toFixed(2)}
                        </span>
                      </td>

                      {/* Estado Stock */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${estadoStock.bg} ${estadoStock.color}`}
                        >
                          {estadoStock.texto}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => verDetalles(producto)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
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
      {modalAbierto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6" />
                Detalles del Producto
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Imagen y Info Principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Imagen */}
                <div className="md:col-span-1">
                  <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    {productoSeleccionado.strImagen ? (
                      <img
                        src={productoSeleccionado.strImagen}
                        alt={productoSeleccionado.strNombre}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-24 w-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Información Principal */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {productoSeleccionado.strNombre}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {productoSeleccionado.tbCategoria.strNombre}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">SKU</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {productoSeleccionado.strSKU || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marca</p>
                      <p className="font-semibold text-gray-900">
                        {productoSeleccionado.strMarca || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          productoSeleccionado.bolActivo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {productoSeleccionado.bolActivo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado Stock</p>
                      {(() => {
                        const estado = getEstadoStock(productoSeleccionado);
                        return (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${estado.bg} ${estado.color}`}
                          >
                            {estado.texto}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Stock y Precios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock Actual */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">Stock Actual</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {productoSeleccionado.intStock}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">unidades disponibles</p>
                </div>

                {/* Stock Mínimo */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-900">
                      Stock Mínimo
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {productoSeleccionado.intStockMinimo || "N/A"}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">alerta de reorden</p>
                </div>

                {/* Precio */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">
                      Precio Unitario
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${productoSeleccionado.dblPrecio.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">MXN por unidad</p>
                </div>
              </div>

              {/* Valor Total en Inventario */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">
                      Valor Total en Inventario
                    </p>
                    <p className="text-4xl font-bold text-purple-600">
                      $
                      {(
                        productoSeleccionado.dblPrecio * productoSeleccionado.intStock
                      ).toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="h-12 w-12 text-purple-400" />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
