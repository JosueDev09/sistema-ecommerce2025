"use client";
import { useState } from "react";
import { Tag, Info, Image, Upload, X, Check } from "lucide-react";
import Swal from 'sweetalert2';


export default function AltaCategorias() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagen, setImagen] = useState<string | null>(null);
  const [errorSave, setErrorSave] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "activa",
    destacada: false,
    imagen: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🧠 Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagen(url);
    }
  };

  const removeImage = () => setImagen(null);

  // ✅ Validación
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Envío
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try{
          const res = await fetch('/api/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: `
                  mutation CrearCategoria($data: CategoriaInput!) {
                    crearCategoria(data: $data) {
                      strNombre,
                      strDescripcion,
                      strImagen,
                      strEstatus,
                      boolDestacado, 
                    }
                  }
                `,  
                variables: {
                  data: {
                    strNombre: formData.nombre,
                    strDescripcion: formData.descripcion,
                    strEstatus: formData.estado,
                    boolDestacado: formData.destacada,
                    strImagen: formData.imagen,
                  },
                },
              }),
              
            });
            const data = await res.json();

           console.log('Respuesta del servidor:', data);
            if (!data) {
              throw new Error('Error en la solicitud');
            } else { 
             setIsLoading(true);
             setTimeout(() => {
              Swal.fire({
                icon: 'success',
                title: 'Categoría creada',
                text: 'La categoría ha sido creada exitosamente.',
              });
              //console.log("Categoría creada:", { ...formData });
             
              //setShowSuccess(true);

              setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                  nombre: "",
                  descripcion: "",
                  estado: "activa",
                  destacada: false,
                  imagen: "",
                });
                setImagen(null);
              }, 5000);
            }, 3500);
            }
          } catch (error) {
            console.error("Error al crear la categoría:", error);
            setErrorSave("Error al crear la categoría");
          } finally {
            setIsLoading(false);
          }         
        };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Agregar Nueva Categoría
          </h1>
          <p className="text-gray-500 mt-2">
            Crea una nueva categoría para clasificar tus productos
          </p>
        </div>

        {/* Mensaje de éxito */}
        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">
                ¡Categoría creada exitosamente!
              </p>
              <p className="text-sm text-emerald-700">
                La categoría ha sido agregada al catálogo
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Información de la Categoría
                </h2>
              </div>

              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.nombre
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Ejemplo: Electrónica, Moda, Hogar"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                      errors.descripcion
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Describe brevemente la categoría"
                  />
                  {errors.descripcion && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Opciones Adicionales
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>

                {/* Destacada */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="destacada"
                    name="destacada"
                    checked={formData.destacada}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="destacada"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Categoría destacada
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Imagen de categoría */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">
                  Imagen Representativa
                </h3>
              </div>

              {imagen ? (
                <div className="relative group">
                  <img
                    src={imagen}
                    alt="Imagen categoría"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">
                    Subir imagen
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG hasta 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full px-6 py-3.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Crear Categoría
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
