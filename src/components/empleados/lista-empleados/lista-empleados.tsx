"use client";
import { use, useEffect, useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, User, Mail, Phone, Briefcase, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatFecha } from "@/src/lib/formatFecha";

  interface Empleado {
    intEmpleado: number;
    strNombre: string;
    datFechaNacimiento: string;
    strEmail: string;
    strTelefono: string;
    strDireccion: string;
    strCiudad: string;
    strEstado: string;
    intCP: number;
    strPuesto: string;
    strDepartamento: string;
    dblSalario: number;
    datFechaIngreso: string;
    strTipoContrato: string;
    strHorario: string;
    strUsuario: string ;
    strRol: string;
    bolActivo: boolean;
    datCreacion: string;
    datActualizacion: string;
  };
export default function ListaEmpleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      const response = await fetch("/api/graphql", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              obtenerEmpleados {
              intEmpleado
              strNombre
              datFechaNacimiento
              strEmail
              strTelefono
              strDireccion
              strCiudad
              strEstado
              intCP
              strPuesto
              strDepartamento
              dblSalario
              datFechaIngreso
              strTipoContrato
              strHorario
              strUsuario
              strRol
              bolActivo
              datCreacion
              datActualizacion
   
              }
            }
          `
        }),
      });
         
      const {data} = await response.json();
      console.log('Datos',data.obtenerEmpleados);
      setEmpleados(data.obtenerEmpleados);
    };

    fetchEmpleados();
  }, []);

 

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
    const matchesSearch = emp.strNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.strEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.strPuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.intEmpleado.toString().includes(searchTerm.toLowerCase());
    const matchesDepartamento = filterDepartamento === 'todos' || emp.strDepartamento === filterDepartamento;
    const matchesEstado = filterEstado === 'todos' || emp.strEstado === filterEstado;
        
    return matchesSearch && matchesDepartamento && matchesEstado;
  });

  const stats = {
    total: empleados.length,
    activos: empleados.filter(e => e.bolActivo).length,
    inactivos: empleados.filter(e => !e.bolActivo).length,
    nuevos: empleados.filter(e => {
      const ingreso = new Date(Number(e.datFechaIngreso)); 
      console.log('Fecha de ingreso empleado:', ingreso);
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
                  const rolBadge = getRolBadge(emp.strRol);
                                    
                  return (
                    <tr key={emp.intEmpleado} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {emp.strNombre.split(' ')[0][0]}{emp.strNombre.split(' ')[1] ? emp.strNombre.split(' ')[1][0] : ''}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{emp.strNombre}</p>
                            {/* <p className="text-xs text-gray-500">{emp.intEmpleado}</p> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {emp.strEmail}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {emp.strTelefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.strPuesto}</p>
                          <p className="text-xs text-gray-500">{getDepartamentoLabel(emp.strDepartamento)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${rolBadge.bg} ${rolBadge.color}`}>
                          <Shield className="w-3.5 h-3.5" />
                          {emp.strRol.charAt(0).toUpperCase() + emp.strRol.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatFecha(emp.datFechaIngreso)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          emp.bolActivo
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {emp.bolActivo ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {emp.bolActivo ? 'Activo' : 'Inactivo'}
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
                      {selectedEmpleado.strNombre.split(' ')[0][0]}{selectedEmpleado.strNombre.split(' ')[1] ? selectedEmpleado.strNombre.split(' ')[1][0] : ''}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEmpleado.strNombre}</h2>
                      <p className="text-gray-500 mt-1">{selectedEmpleado.intEmpleado}</p>
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
                    selectedEmpleado.bolActivo
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedEmpleado.bolActivo ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {selectedEmpleado.bolActivo ? 'Activo' : 'Inactivo'}
                  </span>
                                    
                  {(() => {
                    const badge = getRolBadge(selectedEmpleado.strRol);
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${badge.bg} ${badge.color}`}>
                        <Shield className="w-5 h-5" />
                        {selectedEmpleado.strRol.charAt(0).toUpperCase() + selectedEmpleado.strRol.slice(1)}
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
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strTelefono}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Dirección</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strDireccion}</p>
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
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strPuesto}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Departamento</p>
                      <p className="font-semibold text-gray-900">{getDepartamentoLabel(selectedEmpleado.strDepartamento)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Salario Mensual</p>
                      <p className="font-semibold text-gray-900">${selectedEmpleado.dblSalario.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha de Ingreso</p>
                      <p className="font-semibold text-gray-900">{formatFecha(selectedEmpleado.datFechaIngreso)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo de Contrato</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strTipoContrato.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Horario</p>
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strHorario}</p>
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
                      <p className="font-semibold text-gray-900">{selectedEmpleado.strUsuario}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-2">Permisos</p>
                      <div className="flex flex-wrap gap-2">
                        {/* {selectedEmpleado.permisos.map((permiso) => (
                          <span key={permiso} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {permiso.charAt(0).toUpperCase() + permiso.slice(1)}
                          </span>
                        ))} */}
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