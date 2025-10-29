
'use client';
import { use, useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, User, Mail, Phone, Briefcase, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ListaEmpleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  
  type Empleado = {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    puesto: string;
    departamento: string;
    salario: number;
    fechaIngreso: string;
    estado: string;
    usuario: string;
    rol: string;
    direccion: string;
    tipoContrato: string;
    horario: string;
    permisos: string[];
  };

  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  const empleados: Empleado[] = [
    {
      id: 'EMP-001',
      nombre: 'Juan Pérez García',
      email: 'juan.perez@empresa.com',
      telefono: '461-123-4567',
      puesto: 'Gerente de Ventas',
      departamento: 'ventas',
      salario: 25000,
      fechaIngreso: '2023-01-15',
      estado: 'activo',
      usuario: 'juan.perez',
      rol: 'gerente',
      direccion: 'Av. Principal 123, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['productos', 'pedidos', 'clientes', 'reportes']
    },
    {
      id: 'EMP-002',
      nombre: 'Ana García López',
      email: 'ana.garcia@empresa.com',
      telefono: '461-234-5678',
      puesto: 'Vendedora',
      departamento: 'ventas',
      salario: 15000,
      fechaIngreso: '2023-03-20',
      estado: 'activo',
      usuario: 'ana.garcia',
      rol: 'vendedor',
      direccion: 'Calle Juárez 456, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['productos', 'pedidos', 'clientes']
    },
    {
      id: 'EMP-003',
      nombre: 'Carlos López Martínez',
      email: 'carlos.lopez@empresa.com',
      telefono: '461-345-6789',
      puesto: 'Almacenista',
      departamento: 'operaciones',
      salario: 12000,
      fechaIngreso: '2023-05-10',
      estado: 'activo',
      usuario: 'carlos.lopez',
      rol: 'almacenista',
      direccion: 'Col. Centro 789, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['inventario', 'productos']
    },
    {
      id: 'EMP-004',
      nombre: 'María Rodríguez Sánchez',
      email: 'maria.rodriguez@empresa.com',
      telefono: '461-456-7890',
      puesto: 'Contadora',
      departamento: 'finanzas',
      salario: 22000,
      fechaIngreso: '2023-02-01',
      estado: 'activo',
      usuario: 'maria.rodriguez',
      rol: 'contador',
      direccion: 'Fracc. Las Américas 321, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['reportes', 'pedidos']
    },
    {
      id: 'EMP-005',
      nombre: 'Laura Sánchez Pérez',
      email: 'laura.sanchez@empresa.com',
      telefono: '461-567-8901',
      puesto: 'Gerente de Marketing',
      departamento: 'marketing',
      salario: 28000,
      fechaIngreso: '2022-11-15',
      estado: 'activo',
      usuario: 'laura.sanchez',
      rol: 'gerente',
      direccion: 'Col. Jardines 654, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['productos', 'clientes', 'reportes']
    },
    {
      id: 'EMP-006',
      nombre: 'Pedro Hernández Torres',
      email: 'pedro.hernandez@empresa.com',
      telefono: '461-678-9012',
      puesto: 'Desarrollador',
      departamento: 'desarrollo',
      salario: 20000,
      fechaIngreso: '2024-01-08',
      estado: 'activo',
      usuario: 'pedro.hernandez',
      rol: 'empleado',
      direccion: 'Zona Industrial 987, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['productos']
    },
    {
      id: 'EMP-007',
      nombre: 'Sofia Ramírez Cruz',
      email: 'sofia.ramirez@empresa.com',
      telefono: '461-789-0123',
      puesto: 'Recepcionista',
      departamento: 'recursos-humanos',
      salario: 10000,
      fechaIngreso: '2024-06-01',
      estado: 'inactivo',
      usuario: 'sofia.ramirez',
      rol: 'empleado',
      direccion: 'Col. San Juan 147, Celaya, GTO',
      tipoContrato: 'medio-tiempo',
      horario: 'diurno',
      permisos: ['clientes']
    },
    {
      id: 'EMP-008',
      nombre: 'Roberto Díaz Morales',
      email: 'roberto.diaz@empresa.com',
      telefono: '461-890-1234',
      puesto: 'Administrador de Sistemas',
      departamento: 'desarrollo',
      salario: 30000,
      fechaIngreso: '2022-08-20',
      estado: 'activo',
      usuario: 'roberto.diaz',
      rol: 'administrador',
      direccion: 'Av. Tecnológico 258, Celaya, GTO',
      tipoContrato: 'tiempo-completo',
      horario: 'diurno',
      permisos: ['productos', 'pedidos', 'clientes', 'reportes', 'inventario', 'proveedores']
    }
  ];

  const getDepartamentoLabel = (dept: string) => {
    const labels: { [key: string]: string } = {
      'ventas': 'Ventas',
      'marketing': 'Marketing',
      'desarrollo': 'Desarrollo',
      'recursos-humanos': 'Recursos Humanos',
      'finanzas': 'Finanzas',
      'operaciones': 'Operaciones'
    };
    return labels[dept] || dept;
  };

  const getRolBadge = (rol: string) => {
    const configs: { [key: string]: { color: string; bg: string } } = {
      'administrador': { color: 'text-purple-700', bg: 'bg-purple-100' },
      'gerente': { color: 'text-blue-700', bg: 'bg-blue-100' },
      'vendedor': { color: 'text-emerald-700', bg: 'bg-emerald-100' },
      'almacenista': { color: 'text-orange-700', bg: 'bg-orange-100' },
      'contador': { color: 'text-pink-700', bg: 'bg-pink-100' },
      'empleado': { color: 'text-gray-700', bg: 'bg-gray-100' }
    };
    return configs[rol] || configs.empleado;
  };

  const filteredEmpleados = empleados.filter(emp => {
    const matchesSearch = emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartamento = filterDepartamento === 'todos' || emp.departamento === filterDepartamento;
    const matchesEstado = filterEstado === 'todos' || emp.estado === filterEstado;
        
    return matchesSearch && matchesDepartamento && matchesEstado;
  });

  const stats = {
    total: empleados.length,
    activos: empleados.filter(e => e.estado === 'activo').length,
    inactivos: empleados.filter(e => e.estado === 'inactivo').length,
    nuevos: empleados.filter(e => {
      const ingreso = new Date(e.fechaIngreso);
      const hoy = new Date();
      const diffMeses = (hoy.getFullYear() - ingreso.getFullYear()) * 12 + (hoy.getMonth() - ingreso.getMonth());
      return diffMeses <= 3;
    }).length
  };

  const openDetail = (emp:any) => {
    setSelectedEmpleado(emp);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-500 mt-1">Gestiona el personal de tu empresa</p>
          </div>
                    
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              Nuevo Empleado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.activos}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactivos}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos (3 meses)</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.nuevos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email, puesto o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterDepartamento}
                onChange={(e) => setFilterDepartamento(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="todos">Todos los departamentos</option>
                <option value="ventas">Ventas</option>
                <option value="marketing">Marketing</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="recursos-humanos">Recursos Humanos</option>
                <option value="finanzas">Finanzas</option>
                <option value="operaciones">Operaciones</option>
              </select>
            </div>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Puesto / Departamento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha Ingreso
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
                {filteredEmpleados.map((emp) => {
                  const rolBadge = getRolBadge(emp.rol);
                                    
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {emp.nombre.split(' ')[0][0]}{emp.nombre.split(' ')[1] ? emp.nombre.split(' ')[1][0] : ''}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{emp.nombre}</p>
                            <p className="text-xs text-gray-500">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {emp.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {emp.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.puesto}</p>
                          <p className="text-xs text-gray-500">{getDepartamentoLabel(emp.departamento)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${rolBadge.bg} ${rolBadge.color}`}>
                          <Shield className="w-3.5 h-3.5" />
                          {emp.rol.charAt(0).toUpperCase() + emp.rol.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{emp.fechaIngreso}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          emp.estado === 'activo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {emp.estado === 'activo' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {emp.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(emp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEmpleados.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron empleados</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}

        {showModal && selectedEmpleado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {selectedEmpleado.nombre.split(' ')[0][0]}{selectedEmpleado.nombre.split(' ')[1] ? selectedEmpleado.nombre.split(' ')[1][0] : ''}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEmpleado.nombre}</h2>
                      <p className="text-gray-500 mt-1">{selectedEmpleado.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl text-gray-400">×</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                    selectedEmpleado.estado === 'activo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedEmpleado.estado === 'activo' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {selectedEmpleado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                                    
                  {(() => {
                    const badge = getRolBadge(selectedEmpleado.rol);
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${badge.bg} ${badge.color}`}>
                        <Shield className="w-5 h-5" />
                        {selectedEmpleado.rol.charAt(0).toUpperCase() + selectedEmpleado.rol.slice(1)}
                      </span>
                    );
                  })()}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.telefono}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Dirección</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.direccion}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    Información Laboral
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Puesto</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.puesto}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Departamento</p>
                      <p className="font-semibold text-gray-900">{getDepartamentoLabel(selectedEmpleado.departamento)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Salario Mensual</p>
                      <p className="font-semibold text-gray-900">${selectedEmpleado.salario.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha de Ingreso</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.fechaIngreso}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo de Contrato</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.tipoContrato.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Horario</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.horario}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    Acceso al Sistema
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-500">Usuario</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.usuario}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-2">Permisos</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmpleado.permisos.map((permiso) => (
                          <span key={permiso} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {permiso.charAt(0).toUpperCase() + permiso.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Edit className="w-5 h-5" />
                    Editar
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
      </div>
    </div>
  );
}