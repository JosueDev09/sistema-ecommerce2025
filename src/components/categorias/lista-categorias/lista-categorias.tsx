"use client";
import { useState,useEffect } from "react";
import { Search, Filter, Plus, Tag, Image, CheckCircle, XCircle, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Categoria {
  intCategoria: number;
  strNombre: string;
  strDescripcion: string;
  strImagen: string;
  strEstatus: string;
  boolDestacado: boolean;
  datCreacion: string;
}

export default function ListaCategorias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todas");
  const router = useRouter();
 const [categorias, setCategorias] = useState<Categoria[]>([]);

 // 🔹 Obtener categorías desde GraphQL
  useEffect(() => {
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
                  strDescripcion
                  strImagen
                  strEstatus
                  boolDestacado
                  datCreacion
                }
              }
            `,
          }),
        });

        const { data } = await res.json();
        setCategorias(data.obtenerCategorias);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const filteredCategorias = categorias.filter((cat) => {
    const matchesSearch =
      cat.strNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.strDescripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "todas" || cat.strEstatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    todas: categorias.length,
    activa: categorias.filter((c) => c.strEstatus === "activa").length,
    inactiva: categorias.filter((c) => c.strEstatus === "inactiva").length,
  };

  const getStatusConfig = (estado: string) => {
    if (estado === "activa")
      return { label: "Activa", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle };
    return { label: "Inactiva", color: "text-red-700", bg: "bg-red-100", icon: XCircle };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
            <p className="text-gray-500 mt-1">
              Gestiona las categorías de productos en tu catálogo
            </p>
          </div>

          <button  
           onClick={() => router.push("/categorias/alta-categorias")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
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
                placeholder="Buscar por nombre o descripción..."
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
                <option value="todas">Todas ({statusCounts.todas})</option>
                <option value="activa">Activas ({statusCounts.activa})</option>
                <option value="inactiva">Inactivas ({statusCounts.inactiva})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(statusCounts).map(([key, count]) => {
            const config =
              key === "activa"
                ? getStatusConfig("activa")
                : key === "inactiva"
                ? getStatusConfig("inactiva")
                : { label: "Todas", color: "text-blue-700", bg: "bg-blue-100", icon: Tag };

            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  filterStatus === key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`w-5 h-5 ${
                      filterStatus === key ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs font-medium text-gray-600 capitalize">
                  {config.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Imagen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Productos
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
                {filteredCategorias.map((cat) => {
                  const config = getStatusConfig(cat.strEstatus);
                  const StatusIcon = config.icon;
                  return (
                    <tr key={cat.intCategoria} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={cat.strImagen}
                          alt={cat.strNombre}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {cat.strNombre}
                            {cat.boolDestacado && (
                              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                                Destacada
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {cat.strDescripcion}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {/* {cat.strProductos} */}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {cat.datCreacion}
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
