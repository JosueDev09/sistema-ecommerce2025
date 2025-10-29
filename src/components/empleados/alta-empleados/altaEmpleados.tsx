import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign, Upload, X, Check } from 'lucide-react';
import { verifyTokenEdge } from "../../../lib/verifyTokenEdge"; // 👈 usa esta versión
import { RolEmpleado } from '@prisma/client';

const rolLabels: Record<RolEmpleado, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  VENDEDOR: "Vendedor",
};

export default function AltaEmpleados() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    puesto: '',
    departamento: '',
    salario: '',
    fechaIngreso: '',
    tipoContrato: 'tiempo-completo',
    horario: 'diurno',
    usuario: '',
    contra: '',
    confirmarContra: '',
    rol: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
   useEffect(() => {
      const getUserRole = async () => {
        try {
          // 1️⃣ Obtener el token de cookie o localStorage
          const token =
            document.cookie.match(/(^| )token=([^;]+)/)?.[2] ||
            localStorage.getItem("token");
  
          if (!token) {
            console.warn("⚠️ No se encontró token");
            return;
          }
  
          // 2️⃣ Decodificarlo con jose
          const decoded = await verifyTokenEdge(token);
  
          if (decoded?.rol) {
             console.log("Rol decodificado alta:", decoded.rol);
            setUserRole(decoded.rol.toLowerCase());
          } else {
            console.warn("⚠️ Token inválido o sin rol");
          }
        } catch (error) {
          console.error("❌ Error obteniendo rol:", error);
        }
      };
  
      getUserRole();
    }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El apellido paterno es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.puesto.trim()) newErrors.puesto = 'El puesto es obligatorio';
    if (!formData.departamento.trim()) newErrors.departamento = 'El departamento es obligatorio';
    if (!formData.salario.trim()) newErrors.salario = 'El salario es obligatorio';
    if (!formData.fechaIngreso) newErrors.fechaIngreso = 'La fecha de ingreso es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulación de envío
    setTimeout(() => {
      console.log('Datos del empleado:', formData);
      setIsLoading(false);
      setShowSuccess(true);
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          nombre: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          email: '',
          telefono: '',
          fechaNacimiento: '',
          direccion: '',
          ciudad: '',
          estado: '',
          codigoPostal: '',
          puesto: '',
          departamento: '',
          salario: '',
          fechaIngreso: '',
          tipoContrato: 'tiempo-completo',
          horario: 'diurno',
          usuario: '',
          contra: '',
          confirmarContra: '',
          rol: ''
        });
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Empleado</h1>
          <p className="text-gray-500 mt-2">Completa la información del empleado</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">¡Empleado registrado exitosamente!</p>
              <p className="text-sm text-emerald-700">Los datos han sido guardados correctamente</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.apellidoPaterno ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Pérez"
                />
                {errors.apellidoPaterno && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.apellidoPaterno}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="García"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.telefono ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="123-456-7890"
                  />
                </div>
                {errors.telefono && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.telefono}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dirección</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Celaya"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Guanajuato"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="38000"
                />
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Información Laboral</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Puesto *
                </label>
                <input
                  type="text"
                  name="puesto"
                  value={formData.puesto}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.puesto ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Desarrollador Web"
                />
                {errors.puesto && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.puesto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departamento *
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.departamento ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccionar departamento</option>
                  <option value="ventas">Ventas</option>
                  <option value="marketing">Marketing</option>
                  <option value="desarrollo">Desarrollo</option>
                  <option value="recursos-humanos">Recursos Humanos</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="operaciones">Operaciones</option>
                  <option value="atencion-cliente">Atención al Cliente</option>
                </select>
                {errors.departamento && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.departamento}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salario Mensual *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.salario ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="15000"
                  />
                </div>
                {errors.salario && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.salario}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Ingreso *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.fechaIngreso ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.fechaIngreso && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.fechaIngreso}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Contrato
                </label>
                <select
                  name="tipoContrato"
                  value={formData.tipoContrato}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="tiempo-completo">Tiempo Completo</option>
                  <option value="medio-tiempo">Medio Tiempo</option>
                  <option value="temporal">Temporal</option>
                  <option value="practicas">Prácticas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horario
                </label>
                <select
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="diurno">Diurno (8:00 - 17:00)</option>
                  <option value="vespertino">Vespertino (14:00 - 22:00)</option>
                  <option value="nocturno">Nocturno (22:00 - 6:00)</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acceso Sistema */}
        
          {userRole === "superadmin" &&  (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Acceso al Sistema</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.usuario ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Juan"
                />
                {errors.usuario && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.usuario}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="contra"
                  value={formData.contra}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.contra ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="********"
                />
                {errors.contra && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.contra}
                  </p>
                )}
              </div>

               {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    name="confirmarContra"
                    value={formData.confirmarContra}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      formData.confirmarContra && formData.confirmarContra !== formData.contra
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                    placeholder="********"
                  />
                  {formData.confirmarContra &&
                    formData.confirmarContra !== formData.contra && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Las contraseñas no coinciden
                      </p>
                    )}
                </div>


              {/* Rol */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rol en el Sistema *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.rol ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Seleccionar rol</option>
                      {Object.values(RolEmpleado).map((rol) => (
                        <option key={rol} value={rol}>
                           {rolLabels[rol]}
                        </option>
                      ))}
                  </select>
                  {errors.rol && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.rol}
                    </p>
                  )}
                </div>            
              
            </div>
          </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Registrar Empleado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}