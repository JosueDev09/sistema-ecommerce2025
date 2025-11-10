import { useState, useEffect, use } from 'react';
import { Package, DollarSign, Tag, Image, X, Check, Upload, Plus, Trash2, Info, Percent, Calendar } from 'lucide-react';

export default function AltaProductos() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variantes, setVariantes] = useState([{ nombre: '', valor: '' }]);
  const [categorias, setCategorias] = useState<any[]>([]);

  
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    categoria: '',
    marca: '',
    descripcionCorta: '',
    descripcionLarga: '',
    precio: '',
    precioDescuento: '',
    stock: '',
    stockMinimo: '',
    peso: '',
    dimensiones: '',
    estado: 'activo',
    destacado: false,
    etiquetas: '',
    tieneDescuento: false,
    porcentajeDescuento: '',
    fechaInicioDescuento: '',
    fechaFinDescuento: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular precio con descuento automáticamente
  useEffect(() => {
    
    if (formData.tieneDescuento && formData.precio && formData.porcentajeDescuento) {
      const precioOriginal = parseFloat(formData.precio);
      const porcentaje = parseFloat(formData.porcentajeDescuento);
      
      if (!isNaN(precioOriginal) && !isNaN(porcentaje) && porcentaje > 0 && porcentaje <= 100) {
        const descuento = precioOriginal * (porcentaje / 100);
        const precioConDescuento = precioOriginal - descuento;
        
        setFormData(prev => ({
          ...prev,
          precioDescuento: precioConDescuento.toFixed(2)
        }));
      }
    } else if (!formData.tieneDescuento) {
      setFormData(prev => ({
        ...prev,
        precioDescuento: '',
        porcentajeDescuento: '',
        fechaInicioDescuento: '',
        fechaFinDescuento: ''
      }));
    }
  }, [formData.tieneDescuento, formData.precio, formData.porcentajeDescuento]);

  useEffect(() => {
    const fetchCategorias = async () => {
        try {
          const res = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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
          const data = await res.json();

         // console.log('Categorías obtenidas:',data);
          setCategorias(data.data.obtenerCategorias);
        } catch (error) {
          console.error('Error al obtener categorías:', error);
        }
      };
    fetchCategorias();
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addVariante = () => {
    setVariantes(prev => [...prev, { nombre: '', valor: '' }]);
  };

  const removeVariante = (index: number) => {
    setVariantes(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariante = (index: number, field: string, value: string) => {
    setVariantes(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.sku.trim()) newErrors.sku = 'El SKU es obligatorio';
    if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria';
    if (!formData.precio.trim()) newErrors.precio = 'El precio es obligatorio';
    if (!formData.stock.trim()) newErrors.stock = 'El stock es obligatorio';
    if (!formData.descripcionCorta.trim()) newErrors.descripcionCorta = 'La descripción corta es obligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch('/api/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...formData, variantes, images }),
    });

      if (!res.ok) {
        throw new Error('Error al crear el producto');
      }

    } catch(error){

    }

    setIsLoading(true);

    
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
          <p className="text-gray-500 mt-2">Completa la información del producto</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900">¡Producto creado exitosamente!</p>
              <p className="text-sm text-emerald-700">El producto ha sido agregado al inventario</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información Básica</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="iPhone 14 Pro Max"
                  />
                  {errors.nombre && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="IPH-14PM-128"
                    />
                    {errors.sku && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.sku}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marca
                    </label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Apple"
                    />
                  </div>
                </div>

               <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría *
                    </label>

                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Seleccionar categoría</option>

                      {/* Aquí haces el map */}
                      {categorias.map((cat: any) => (
                        <option key={cat.intCategoria} value={cat.intCategoria}>
                          {cat.strNombre}
                        </option>
                      ))}
                    </select>

                    {errors.categoria && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.categoria}
                      </p>
                    )}
                  </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción Corta *
                  </label>
                  <textarea
                    name="descripcionCorta"
                    value={formData.descripcionCorta}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                      errors.descripcionCorta ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Descripción breve del producto (1-2 líneas)"
                  />
                  {errors.descripcionCorta && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.descripcionCorta}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción Detallada
                  </label>
                  <textarea
                    name="descripcionLarga"
                    value={formData.descripcionLarga}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Descripción completa con características, especificaciones y beneficios"
                  />
                </div>
              </div>
            </div>

            {/* Precio e Inventario */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Precio e Inventario</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio Regular *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.precio ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="999.00"
                      step="0.01"
                    />
                  </div>
                  {errors.precio && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.precio}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                      errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="100"
                  />
                  {errors.stock && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errors.stock}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alerta cuando el stock sea menor a este valor</p>
                </div>
              </div>
            </div>

            {/* Descuentos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Percent className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Descuentos y Promociones</h2>
              </div>

              <div className="space-y-5">
                {/* Toggle de Descuento */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                      <Percent className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Producto con descuento</p>
                      <p className="text-sm text-gray-500">Aplica un precio promocional a este producto</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="tieneDescuento"
                      checked={formData.tieneDescuento}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* Campos de Descuento */}
                {formData.tieneDescuento && (
                  <div className="space-y-5 p-4 border-2 border-rose-200 rounded-lg bg-rose-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Porcentaje de Descuento *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="porcentajeDescuento"
                            value={formData.porcentajeDescuento}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                            placeholder="10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">%</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Entre 1% y 100%</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Precio con Descuento
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            name="precioDescuento"
                            value={formData.precioDescuento}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition bg-gray-100"
                            placeholder="0.00"
                            step="0.01"
                            readOnly
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Calculado automáticamente</p>
                      </div>
                    </div>

                    {/* Vista Previa del Ahorro */}
                    {formData.precio && formData.porcentajeDescuento && (
                      <div className="p-4 bg-rose-100 rounded-lg border border-rose-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-rose-700 font-medium">Vista previa del precio</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-lg text-gray-500 line-through">${parseFloat(formData.precio).toFixed(2)}</span>
                              <span className="text-2xl font-bold text-rose-700">${formData.precioDescuento || '0.00'}</span>
                              <span className="px-3 py-1 bg-rose-600 text-white text-sm font-bold rounded-full">
                                -{formData.porcentajeDescuento}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-rose-700 font-medium">Ahorro</p>
                            <p className="text-xl font-bold text-rose-700 mt-1">
                              ${(parseFloat(formData.precio) - parseFloat(formData.precioDescuento || '0')).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fechas de Vigencia */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Período de Vigencia</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fecha de Inicio
                          </label>
                          <input
                            type="datetime-local"
                            name="fechaInicioDescuento"
                            value={formData.fechaInicioDescuento}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                          />
                          <p className="text-xs text-gray-600 mt-1">Opcional - Deja vacío para iniciar ahora</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Fecha de Fin
                          </label>
                          <input
                            type="datetime-local"
                            name="fechaFinDescuento"
                            value={formData.fechaFinDescuento}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                          />
                          <p className="text-xs text-gray-600 mt-1">Opcional - Deja vacío para sin límite</p>
                        </div>
                      </div>
                    </div>

                    {/* Alertas */}
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Importante:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>El precio con descuento se calcula automáticamente</li>
                          <li>Si defines fechas, el descuento solo será visible en ese período</li>
                          <li>El descuento se mostrará en la tienda y en los reportes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variantes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Variantes</h2>
                </div>
                <button
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
                      onClick={() => removeVariante(index)}
                      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Información Adicional</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dimensiones (cm)
                  </label>
                  <input
                    type="text"
                    name="dimensiones"
                    value={formData.dimensiones}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="15 x 7 x 1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    name="etiquetas"
                    value={formData.etiquetas}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="nuevo, oferta, destacado (separadas por coma)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Estado del Producto</h3>
              
              <div className="space-y-4">
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
                    <option value="activo">Activo</option>
                    <option value="borrador">Borrador</option>
                    <option value="agotado">Agotado</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="destacado"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="destacado" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Producto destacado
                  </label>
                </div>
              </div>
            </div>

            {/* Imágenes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Imágenes del Producto</h3>
              </div>

              <div className="space-y-4">
                {/* Preview de Imágenes */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Producto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
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
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
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
            </div>

            {/* Botones de Acción */}
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
                    Crear Producto
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Guardar como Borrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}