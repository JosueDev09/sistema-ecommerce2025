import { useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, FileText, CreditCard, Globe, Check, X, Upload, Plus, Trash2 } from 'lucide-react';

export default function AltaProveedores() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [contactos, setContactos] = useState([{ nombre: '', cargo: '', telefono: '', email: '' }]);
  const [documentos, setDocumentos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    razonSocial: '',
    nombreComercial: '',
    rfc: '',
    giro: '',
    sitioWeb: '',
    email: '',
    telefono: '',
    telefonoAlternativo: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México',
    banco: '',
    numeroCuenta: '',
    clabe: '',
    beneficiario: '',
    diasCredito: '',
    limiteCredito: '',
    descuentoAcordado: '',
    tipoProveedor: '',
    categoriaProductos: '',
    notas: '',
    estatus: 'activo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addContacto = () => {
    setContactos(prev => [...prev, { nombre: '', cargo: '', telefono: '', email: '' }]);
  };

  const removeContacto = (index: number) => {
    if (contactos.length > 1) {
      setContactos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateContacto = (index: number, field: string, value: string) => {
    setContactos(prev => prev.map((c, i) => 
      i === index ? { ...c, [field]: value } : c
    ));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newDocs = Array.from(files).map(file => file.name);
      setDocumentos(prev => [...prev, ...newDocs]);
    }
  };

  const removeDocumento = (index: number) => {
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.razonSocial.trim()) newErrors.razonSocial = 'La razón social es obligatoria';
    if (!formData.rfc.trim()) newErrors.rfc = 'El RFC es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es obligatoria';
    if (!formData.estado.trim()) newErrors.estado = 'El estado es obligatorio';
    if (!formData.tipoProveedor) newErrors.tipoProveedor = 'El tipo de proveedor es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log('Proveedor creado:', {
        ...formData,
        contactos: contactos.filter(c => c.nombre || c.email),
        documentos
      });
      
      setIsLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          razonSocial: '',
          nombreComercial: '',
          rfc: '',
          giro: '',
          sitioWeb: '',
          email: '',
          telefono: '',
          telefonoAlternativo: '',
          calle: '',
          numeroExterior: '',
          numeroInterior: '',
          colonia: '',
          ciudad: '',
          estado: '',
          codigoPostal: '',
          pais: 'México',
          banco: '',
          numeroCuenta: '',
          clabe: '',
          beneficiario: '',
          diasCredito: '',
          limiteCredito: '',
          descuentoAcordado: '',
          tipoProveedor: '',
          categoriaProductos: '',
          notas: '',
          estatus: 'activo'
        });
        setContactos([{ nombre: '', cargo: '', telefono: '', email: '' }]);
        setDocumentos([]);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Proveedor</h1>
          <p className="text-gray-500 mt-2">Completa la información del proveedor</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">¡Proveedor registrado exitosamente!</p>
              <p className="text-sm text-emerald-700">Los datos han sido guardados correctamente</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información de la Empresa</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.razonSocial ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Tecnología Avanzada S.A. de C.V."
                  />
                  {errors.razonSocial && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.razonSocial}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Comercial
                    </label>
                    <input
                      type="text"
                      name="nombreComercial"
                      value={formData.nombreComercial}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="TechStore"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      RFC *
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition uppercase ${
                        errors.rfc ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="ABC123456XYZ"
                      maxLength={13}
                    />
                    {errors.rfc && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.rfc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giro
                    </label>
                    <input
                      type="text"
                      name="giro"
                      value={formData.giro}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Comercio de tecnología"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sitio Web
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        name="sitioWeb"
                        value={formData.sitioWeb}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="www.empresa.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        placeholder="contacto@empresa.com"
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
                        placeholder="461-123-4567"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Proveedor *
                  </label>
                  <select
                    name="tipoProveedor"
                    value={formData.tipoProveedor}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.tipoProveedor ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="nacional">Nacional</option>
                    <option value="internacional">Internacional</option>
                    <option value="distribuidor">Distribuidor</option>
                    <option value="fabricante">Fabricante</option>
                    <option value="mayorista">Mayorista</option>
                  </select>
                  {errors.tipoProveedor && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.tipoProveedor}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Dirección</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Calle
                    </label>
                    <input
                      type="text"
                      name="calle"
                      value={formData.calle}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Av. Principal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Colonia
                    </label>
                    <input
                      type="text"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.ciudad ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Celaya"
                    />
                    {errors.ciudad && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.ciudad}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.estado ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Guanajuato"
                    />
                    {errors.estado && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.estado}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      C.P.
                    </label>
                    <input
                      type="text"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="38000"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información Bancaria</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Banco
                    </label>
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="BBVA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CLABE
                    </label>
                    <input
                      type="text"
                      name="clabe"
                      value={formData.clabe}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="012345678901234567"
                      maxLength={18}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Contactos</h2>
                </div>
                <button
                  onClick={addContacto}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-4">
                {contactos.map((contacto, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Contacto {index + 1}</span>
                      {contactos.length > 1 && (
                        <button
                          onClick={() => removeContacto(index)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={contacto.nombre}
                        onChange={(e) => updateContacto(index, 'nombre', e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Nombre completo"
                      />
                      <input
                        type="text"
                        value={contacto.cargo}
                        onChange={(e) => updateContacto(index, 'cargo', e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Cargo"
                      />
                      <input
                        type="tel"
                        value={contacto.telefono}
                        onChange={(e) => updateContacto(index, 'telefono', e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Teléfono"
                      />
                      <input
                        type="email"
                        value={contacto.email}
                        onChange={(e) => updateContacto(index, 'email', e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Estado</h3>
              <select
                name="estatus"
                value={formData.estatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Documentos</h3>
              </div>

              <div className="space-y-3">
                {documentos.length > 0 && (
                  <div className="space-y-2">
                    {documentos.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{doc}</span>
                        </div>
                        <button
                          onClick={() => removeDocumento(index)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Subir documentos</span>
                  <span className="text-xs text-gray-500 mt-1">PDF, DOCX hasta 10MB</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Notas</h3>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Información adicional..."
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Registrar
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}