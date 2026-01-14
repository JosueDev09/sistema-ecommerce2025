import { useState } from 'react';
import { Search, Filter, Download, Plus, TrendingUp, TrendingDown, Package, Calendar, User, FileText, Eye, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
export default function MovimientosInventario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterFecha, setFilterFecha] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<any>(null);
  const routes = useRouter();

  const movimientos : any[] = [];

  const getTipoConfig = (tipo: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      entrada: { label: 'Entrada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: ArrowDownCircle },
      salida: { label: 'Salida', color: 'text-red-700', bg: 'bg-red-100', icon: ArrowUpCircle },
      ajuste: { label: 'Ajuste', color: 'text-blue-700', bg: 'bg-blue-100', icon: RefreshCw }
    };
    return configs[tipo] || configs.ajuste;
  };

  const filteredMovimientos = movimientos.filter(mov => {
    const matchesSearch = mov.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || mov.tipo === filterTipo;
    
    let matchesFecha = true;
    if (filterFecha === 'hoy') {
      matchesFecha = mov.fecha === '2025-10-28';
    } else if (filterFecha === 'semana') {
      matchesFecha = ['2025-10-27', '2025-10-28'].includes(mov.fecha);
    } else if (filterFecha === 'mes') {
      matchesFecha = mov.fecha.startsWith('2025-10');
    }
    
    return matchesSearch && matchesTipo && matchesFecha;
  });

  const stats = {
    totalMovimientos: movimientos.length,
    entradas: movimientos.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.cantidad, 0),
    salidas: movimientos.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + Math.abs(m.cantidad), 0),
    ajustes: movimientos.filter(m => m.tipo === 'ajuste').length
  };

  const openDetail = (mov: any) => {
    setSelectedMovimiento(mov);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Movimientos de Inventario</h1>
            <p className="text-gray-500 mt-1">Historial completo de entradas, salidas y ajustes</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button 
            onClick={() => routes.push('/inventario/movimientos/alta-movimiento')}
            className="flex items-center 
            justify-center gap-2 px-6 py-3 
            bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              Nuevo Movimiento
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMovimientos}</p>
                <p className="text-xs text-gray-500 mt-1">Este mes</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entradas</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">+{stats.entradas}</p>
                <p className="text-xs text-gray-500 mt-1">Unidades agregadas</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Salidas</p>
                <p className="text-3xl font-bold text-red-600 mt-2">-{stats.salidas}</p>
                <p className="text-xs text-gray-500 mt-1">Unidades retiradas</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ajustes</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.ajustes}</p>
                <p className="text-xs text-gray-500 mt-1">Correcciones realizadas</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
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
                placeholder="Buscar por producto, SKU o ID de movimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Tipo Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todos los tipos</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
                <option value="ajuste">Ajustes</option>
              </select>
            </div>

            {/* Fecha Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movimientos Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID / Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock Anterior
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock Actual
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha / Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovimientos.map((mov) => {
                  const tipoConfig = getTipoConfig(mov.tipo);
                  const TipoIcon = tipoConfig.icon;
                  
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{mov.id}</p>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${tipoConfig.bg} ${tipoConfig.color}`}>
                            <TipoIcon className="w-3.5 h-3.5" />
                            {tipoConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{mov.producto}</p>
                          <p className="text-xs text-gray-500">{mov.sku}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          mov.tipo === 'entrada' ? 'text-emerald-600' : 
                          mov.tipo === 'salida' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : ''}{Math.abs(mov.cantidad)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{mov.stockAnterior}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{mov.stockActual}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{mov.motivo}</p>
                        {mov.proveedor !== '-' && (
                          <p className="text-xs text-gray-500 mt-0.5">{mov.proveedor}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-gray-900">{mov.fecha}</p>
                          <p className="text-xs text-gray-500">{mov.hora} • {mov.usuario}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openDetail(mov)}
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
        {showModal && selectedMovimiento && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detalle del Movimiento</h2>
                  <p className="text-gray-500 mt-1">{selectedMovimiento.id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl text-gray-400">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Tipo */}
                <div>
                  {(() => {
                    const config = getTipoConfig(selectedMovimiento.tipo);
                    const Icon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${config.bg} ${config.color}`}>
                        <Icon className="w-5 h-5" />
                        {config.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Producto */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    Información del Producto
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Producto</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.producto}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">SKU</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.sku}</p>
                    </div>
                  </div>
                </div>

                {/* Cambio en Stock */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Cambio en Stock</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Stock Anterior</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedMovimiento.stockAnterior}</p>
                    </div>
                    <div className="flex-1 mx-4 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="h-0.5 w-12 bg-gray-300"></div>
                        <span className={`text-lg font-bold ${
                          selectedMovimiento.tipo === 'entrada' ? 'text-emerald-600' : 
                          selectedMovimiento.tipo === 'salida' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {selectedMovimiento.tipo === 'entrada' ? '+' : selectedMovimiento.tipo === 'salida' ? '-' : ''}{Math.abs(selectedMovimiento.cantidad)}
                        </span>
                        <div className="h-0.5 w-12 bg-gray-300"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Stock Actual</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedMovimiento.stockActual}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Detalles del Movimiento
                  </h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Motivo</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.motivo}</p>
                    </div>
                    {selectedMovimiento.proveedor !== '-' && (
                      <div>
                        <p className="text-gray-500">Proveedor</p>
                        <p className="font-semibold text-gray-900">{selectedMovimiento.proveedor}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Referencia</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.referencia}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha y Hora</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.fecha} a las {selectedMovimiento.hora}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Usuario</p>
                      <p className="font-semibold text-gray-900">{selectedMovimiento.usuario}</p>
                    </div>
                    {selectedMovimiento.notas && (
                      <div>
                        <p className="text-gray-500">Notas</p>
                        <p className="text-gray-700">{selectedMovimiento.notas}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón Cerrar */}
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}