/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, use } from 'react';
import { Package, DollarSign, Tag, Image, X, Check, Upload, Plus, Trash2, Info, Percent, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
export default function AltaProductos() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variantes, setVariantes] = useState([{ nombre: '', valor: '' }]);
  const [categorias, setCategorias] = useState<any[]>([]);

  // ✨ NUEVO: Estados para variantes con stock
  const [tieneVariantes, setTieneVariantes] = useState(false);
  const [tallas, setTallas] = useState<string[]>([]);
  const [colores, setColores] = useState<string[]>([]);
  const [variantesStock, setVariantesStock] = useState<{
    [key: string]: {
      talla: string;
      color: string;
      stock: number;
      sku: string;
      precioAdicional: number;
    }
  }>({});
  
  const [nuevaTalla, setNuevaTalla] = useState('');
  const [nuevoColor, setNuevoColor] = useState('');

  
  const [formData, setFormData] = useState({
    nombre: '',
    sku: '',
    categoria: '',
    marca: '',
    descripcionCorta: '',
    descripcionLarga: '',
    precio: '00.00',
    precioDescuento: '00.00',
    stock: '0',
    stockMinimo: '0',
    peso: '0.00',
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

  // Generar SKU automáticamente
  useEffect(() => {
    const generarSKU = () => {
      if (!formData.nombre && !formData.marca) {
        return '';
      }

      // Función para limpiar y obtener iniciales
      const obtenerIniciales = (texto: string, maxLength: number = 3) => {
        if (!texto) return '';
        
        // Limpiar caracteres especiales y espacios extra
        const textoLimpio = texto
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          .toUpperCase()
          .replace(/[^A-Z0-9\s]/g, '') // Solo letras, números y espacios
          .trim();
        
        // Si tiene espacios, tomar las primeras letras de cada palabra
        const palabras = textoLimpio.split(/\s+/);
        if (palabras.length > 1) {
          return palabras
            .map(p => p.charAt(0))
            .join('')
            .substring(0, maxLength);
        }
        
        // Si es una sola palabra, tomar las primeras letras
        return textoLimpio.substring(0, maxLength);
      };

      const marcaCode = obtenerIniciales(formData.marca, 3);
      const nombreCode = obtenerIniciales(formData.nombre, 4);
      
      // Generar código aleatorio de 3 dígitos
      const randomCode = Math.floor(100 + Math.random() * 900);
      
      // Combinar: MARCA-NOMBRE-RANDOM
      const sku = [marcaCode, nombreCode, randomCode]
        .filter(Boolean) // Eliminar valores vacíos
        .join('-');
      
      return sku;
    };

    const nuevoSKU = generarSKU();
    if (nuevoSKU && nuevoSKU !== formData.sku) {
      setFormData(prev => ({
        ...prev,
        sku: nuevoSKU
      }));
    }
  }, [formData.nombre, formData.marca]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    
    // Validar cada archivo
    for (const file of fileArray) {
      // Validar tamaño (máximo 5MB por imagen)
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: `La imagen "${file.name}" supera los 5MB`,
        });
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        await Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: `"${file.name}" no es una imagen válida`,
        });
        return;
      }
    }

    // Mostrar loading
    Swal.fire({
      title: 'Subiendo imágenes...',
      text: `Subiendo ${fileArray.length} imagen(es)`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Subir todas las imágenes al servidor
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo', 'productos');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }

        const result = await response.json();
        return result.path; // Retorna la ruta: /uploads/productos/123456.jpg
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      
      // Agregar las rutas al estado
      setImages(prev => [...prev, ...uploadedPaths]);

      await Swal.fire({
        icon: 'success',
        title: '¡Imágenes subidas!',
        text: `Se subieron ${uploadedPaths.length} imagen(es) correctamente`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al subir imágenes:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al subir imágenes',
        text: 'Hubo un problema al subir las imágenes. Intenta de nuevo.',
      });
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

  // ✨ NUEVAS FUNCIONES PARA VARIANTES CON STOCK

  // Agregar talla
  const agregarTalla = () => {
    if (nuevaTalla.trim() && !tallas.includes(nuevaTalla.trim())) {
      const tallaNormalizada = nuevaTalla.trim().toUpperCase();
      setTallas(prev => [...prev, tallaNormalizada]);
      setNuevaTalla('');
      
      // Crear variantes para esta nueva talla con todos los colores existentes
      if (colores.length > 0) {
        const nuevasVariantes: any = {};
        colores.forEach(color => {
          const key = `${tallaNormalizada}-${color}`;
          nuevasVariantes[key] = {
            talla: tallaNormalizada,
            color: color,
            stock: 0,
            sku: `${formData.sku}-${tallaNormalizada}-${color.substring(0, 3).toUpperCase()}`,
            precioAdicional: 0
          };
        });
        setVariantesStock(prev => ({ ...prev, ...nuevasVariantes }));
      }
    }
  };

  // Eliminar talla
  const eliminarTalla = (talla: string) => {
    setTallas(prev => prev.filter(t => t !== talla));
    // Eliminar todas las variantes de esta talla
    setVariantesStock(prev => {
      const nuevas = { ...prev };
      Object.keys(nuevas).forEach(key => {
        if (nuevas[key].talla === talla) {
          delete nuevas[key];
        }
      });
      return nuevas;
    });
  };

  // Agregar color
  const agregarColor = () => {
    if (nuevoColor.trim() && !colores.includes(nuevoColor.trim())) {
      const colorNormalizado = nuevoColor.trim().charAt(0).toUpperCase() + nuevoColor.trim().slice(1).toLowerCase();
      setColores(prev => [...prev, colorNormalizado]);
      setNuevoColor('');
      
      // Crear variantes para este nuevo color con todas las tallas existentes
      if (tallas.length > 0) {
        const nuevasVariantes: any = {};
        tallas.forEach(talla => {
          const key = `${talla}-${colorNormalizado}`;
          nuevasVariantes[key] = {
            talla: talla,
            color: colorNormalizado,
            stock: 0,
            sku: `${formData.sku}-${talla}-${colorNormalizado.substring(0, 3).toUpperCase()}`,
            precioAdicional: 0
          };
        });
        setVariantesStock(prev => ({ ...prev, ...nuevasVariantes }));
      }
    }
  };

  // Eliminar color
  const eliminarColor = (color: string) => {
    setColores(prev => prev.filter(c => c !== color));
    // Eliminar todas las variantes de este color
    setVariantesStock(prev => {
      const nuevas = { ...prev };
      Object.keys(nuevas).forEach(key => {
        if (nuevas[key].color === color) {
          delete nuevas[key];
        }
      });
      return nuevas;
    });
  };

  // Actualizar stock de una variante específica
  const actualizarStockVariante = (talla: string, color: string, campo: 'stock' | 'precioAdicional', valor: number) => {
    const key = `${talla}-${color}`;
    setVariantesStock(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [campo]: valor
      }
    }));
  };

  // Calcular stock total de todas las variantes
  const calcularStockTotal = () => {
    return Object.values(variantesStock).reduce((total, variante) => total + variante.stock, 0);
  };

  // Generar todas las combinaciones automáticamente
  const generarTodasLasVariantes = () => {
    if (tallas.length === 0 || colores.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Debes agregar al menos una talla y un color',
      });
      return;
    }

    const nuevasVariantes: any = {};
    tallas.forEach(talla => {
      colores.forEach(color => {
        const key = `${talla}-${color}`;
        // Solo crear si no existe
        if (!variantesStock[key]) {
          nuevasVariantes[key] = {
            talla,
            color,
            stock: 0,
            sku: `${formData.sku}-${talla}-${color.substring(0, 3).toUpperCase()}`,
            precioAdicional: 0
          };
        }
      });
    });
    
    setVariantesStock(prev => ({ ...prev, ...nuevasVariantes }));
    
    Swal.fire({
      icon: 'success',
      title: 'Variantes generadas',
      text: `Se crearon ${Object.keys(nuevasVariantes).length} nuevas combinaciones`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.marca.trim()) newErrors.marca = 'La marca es obligatoria para generar el SKU';
    if (!formData.sku.trim()) newErrors.sku = 'El SKU no se ha generado. Verifica nombre y marca.';
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

    // Validaciones específicas para variantes
    if (tieneVariantes) {
      if (tallas.length === 0 || colores.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Variantes incompletas',
          text: 'Debes agregar al menos una talla y un color cuando el producto tiene variantes.',
          confirmButtonColor: '#3B82F6'
        });
        return;
      }

      const stockTotal = calcularStockTotal();
      if (stockTotal === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Sin stock',
          text: 'Debes ingresar al menos una cantidad en las variantes.',
          confirmButtonColor: '#3B82F6'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Calcular stock total (de variantes o stock simple)
      const stockTotal = tieneVariantes ? calcularStockTotal() : parseInt(formData.stock, 10);

      // Preparar array de variantes para enviar
      const variantesArray = tieneVariantes ? Object.entries(variantesStock).map(([key, variante]) => ({
        strTalla: variante.talla,
        strColor: variante.color,
        intStock: variante.stock,
        strSKU: variante.sku,
        dblPrecioAdicional: variante.precioAdicional || 0,
        strImagen: null // Podrías agregar imágenes por variante en el futuro
      })) : [];

      // Preparar los datos para GraphQL
      const productData = {
        strNombre: formData.nombre,
        strSKU: formData.sku,
        strMarca: formData.marca,
        strDescripcion: formData.descripcionCorta,
        strDescripcionLarga: formData.descripcionLarga,
        dblPrecio: parseFloat(formData.precio),
        intStock: stockTotal, // Stock total calculado
        intStockMinimo: parseInt(formData.stockMinimo, 10) || null,
        strImagen: images.length > 0 ? images[0] : null,
        bolActivo: formData.estado === 'activo',
        bolDestacado: formData.destacado,
        strEstado: formData.estado,
        
        // Campos de descuento
        bolTieneDescuento: formData.tieneDescuento,
        dblPrecioDescuento: parseFloat(formData.precioDescuento) || null,
        intPorcentajeDescuento: parseInt(formData.porcentajeDescuento, 10) || null,
        datInicioDescuento: formData.fechaInicioDescuento || null,
        datFinDescuento: formData.fechaFinDescuento || null,
        
        // Campos adicionales
        strPeso: formData.peso || null,
        strDimensiones: formData.dimensiones || null,
        strEtiquetas: formData.etiquetas || null,
        jsonVariantes: variantes.length > 0 && variantes[0].nombre ? JSON.stringify(variantes) : null,
        jsonImagenes: images.length > 0 ? JSON.stringify(images) : null,
        
        // Categoría
        intCategoria: parseInt(formData.categoria, 10),
        
        // Variantes (nuevo campo)
        variantes: variantesArray.length > 0 ? variantesArray : null
      };

      console.log('Datos a enviar:', productData);

      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CrearProducto($data: ProductoInput!) {
              crearProducto(data: $data) {
                intProducto
                strNombre
                strSKU
                dblPrecio
                intStock
                tbCategoria {
                  strNombre
                }
                tbProductoVariantes {
                  intVariante
                  strTalla
                  strColor
                  intStock
                  strSKU
                  dblPrecioAdicional
                }
              }
            }
          `,
          variables: {
            data: productData
          }
        }),
      });

      const result = await res.json();
      console.log('Respuesta del servidor:', result);
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error al crear el producto');
      }

      if (!res.ok) {
        throw new Error('Error al crear el producto');
      }

      // Mostrar mensaje de éxito con Sweet Alert
      await Swal.fire({
        icon: 'success',
        title: '¡Producto creado!',
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Producto:</strong> ${formData.nombre}</p>
            <p class="mb-2"><strong>SKU:</strong> ${formData.sku || 'N/A'}</p>
            <p class="mb-2"><strong>Stock Total:</strong> ${stockTotal} unidades</p>
            ${tieneVariantes ? `<p class="mb-2"><strong>Variantes:</strong> ${variantesArray.length} combinaciones</p>` : ''}
          </div>
        `,
        confirmButtonColor: '#3B82F6'
      });

      // Limpiar formulario
      setFormData({
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
      setImages([]);
      setVariantes([{ nombre: '', valor: '' }]);
      
      // Limpiar estados de variantes
      setTieneVariantes(false);
      setTallas([]);
      setColores([]);
      setVariantesStock({});
      setNuevaTalla('');
      setNuevoColor('');

    } catch(error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear el producto: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
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
                      Marca *
                    </label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                        errors.marca ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Apple"
                    />
                    {errors.marca && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.marca}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                      <span>SKU (Código Único) *</span>
                      <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Auto-generado
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku || 'Esperando datos...'}
                        disabled
                        className={`w-full px-4 py-3 border rounded-lg font-mono font-semibold cursor-not-allowed transition ${
                          formData.sku 
                            ? 'bg-blue-50 border-blue-200 text-blue-900' 
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                        placeholder="Ingresa nombre y marca"
                      />
                      {formData.sku && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                    {formData.sku ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" />
                        SKU generado exitosamente
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Completa el nombre y marca para generar el SKU
                      </p>
                    )}
                    {errors.sku && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {errors.sku}
                      </p>
                    )}
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
                      type="text"
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

            {/* Variantes con Stock */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Variantes y Stock</h2>
                    <p className="text-sm text-gray-600">Gestiona tallas, colores y stock por cada combinación</p>
                  </div>
                </div>
                
                {/* Toggle para activar/desactivar variantes */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">
                    {tieneVariantes ? 'Con variantes' : 'Sin variantes'}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={tieneVariantes}
                      onChange={(e) => setTieneVariantes(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                  </div>
                </label>
              </div>

              {tieneVariantes ? (
                <div className="space-y-6">
                  {/* Agregar Tallas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tallas Disponibles
                    </label>
                    
                    {/* Input para agregar talla */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={nuevaTalla}
                        onChange={(e) => setNuevaTalla(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregarTalla()}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                        placeholder="Ej: S, M, L, XL, 28, 30, 32..."
                      />
                      <button
                        type="button"
                        onClick={agregarTalla}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>

                    {/* Tallas agregadas */}
                    <div className="flex flex-wrap gap-2">
                      {tallas.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No hay tallas agregadas</p>
                      ) : (
                        tallas.map(talla => (
                          <span
                            key={talla}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium"
                          >
                            {talla}
                            <button
                              type="button"
                              onClick={() => eliminarTalla(talla)}
                              className="hover:text-blue-900 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Agregar Colores */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Colores Disponibles
                    </label>
                    
                    {/* Input para agregar color */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={nuevoColor}
                        onChange={(e) => setNuevoColor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && agregarColor()}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Ej: Rojo, Azul, Negro, Blanco..."
                      />
                      <button
                        type="button"
                        onClick={agregarColor}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>

                    {/* Colores agregados */}
                    <div className="flex flex-wrap gap-2">
                      {colores.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No hay colores agregados</p>
                      ) : (
                        colores.map(color => (
                          <span
                            key={color}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg font-medium"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => eliminarColor(color)}
                              className="hover:text-cyan-900 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Matriz de Stock (Grid de Tallas × Colores) */}
                  {tallas.length > 0 && colores.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Stock por Variante
                          </h3>
                          <p className="text-sm text-gray-600">
                            Ingresa las cantidades disponibles para cada combinación
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Stock Total</p>
                          <p className="text-2xl font-bold text-blue-600">{calcularStockTotal()}</p>
                        </div>
                      </div>

                      {/* Grid de Stock */}
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold sticky left-0 bg-purple-600 z-10">
                                Talla
                              </th>
                              {colores.map(color => (
                                <th key={color} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                                  <div className="flex flex-col items-center gap-1">
                                    <span>{color}</span>
                                  </div>
                                </th>
                              ))}
                              <th className="px-4 py-3 text-center font-semibold bg-blue-700">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {tallas.map(talla => {
                              const totalTalla = colores.reduce((sum, color) => {
                                const key = `${talla}-${color}`;
                                return sum + (variantesStock[key]?.stock || 0);
                              }, 0);

                              return (
                                <tr key={talla} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                                      {talla}
                                    </span>
                                  </td>
                                  {colores.map(color => {
                                    const key = `${talla}-${color}`;
                                    const variante = variantesStock[key];

                                    return (
                                      <td key={color} className="px-4 py-3">
                                        <input
                                          type="number"
                                          min="0"
                                          value={variante?.stock || 0}
                                          onChange={(e) => {
                                            const valor = parseInt(e.target.value) || 0;
                                            actualizarStockVariante(talla, color, 'stock', valor);
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition hover:border-blue-400"
                                          placeholder="0"
                                        />
                                      </td>
                                    );
                                  })}
                                  <td className="px-4 py-3 text-center font-bold text-blue-600 bg-blue-50">
                                    {totalTalla}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Fila de totales por color */}
                            <tr className="bg-cyan-50 font-semibold">
                              <td className="px-4 py-3 text-gray-900 sticky left-0 bg-cyan-100 z-10">
                                Total
                              </td>
                              {colores.map(color => {
                                const totalColor = tallas.reduce((sum, talla) => {
                                  const key = `${talla}-${color}`;
                                  return sum + (variantesStock[key]?.stock || 0);
                                }, 0);

                                return (
                                  <td key={color} className="px-4 py-3 text-center text-cyan-700">
                                    {totalColor}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-center text-blue-700 bg-blue-100 text-lg font-bold">
                                {calcularStockTotal()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Información adicional */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Info general */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-2">Cómo usar la matriz:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Escribe las cantidades directamente en cada celda</li>
                                <li>Los totales se calculan automáticamente</li>
                                <li>Click en el input para seleccionar todo el número</li>
                                <li>Los SKUs se generan automáticamente al guardar</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-2">Resumen:</p>
                              <ul className="space-y-1">
                                <li><strong>{tallas.length}</strong> tallas disponibles</li>
                                <li><strong>{colores.length}</strong> colores disponibles</li>
                                <li><strong>{tallas.length * colores.length}</strong> combinaciones posibles</li>
                                <li><strong>{Object.keys(variantesStock).length}</strong> variantes creadas</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensaje cuando no hay tallas o colores */}
                  {(tallas.length === 0 || colores.length === 0) && (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        {tallas.length === 0 && colores.length === 0 && 'Agrega tallas y colores para comenzar'}
                        {tallas.length === 0 && colores.length > 0 && 'Agrega al menos una talla para continuar'}
                        {tallas.length > 0 && colores.length === 0 && 'Agrega al menos un color para continuar'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Modo sin variantes - Mensaje informativo */
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Producto sin variantes
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Este producto no tiene tallas ni colores. El stock se manejará de forma simple en el campo "Stock" de arriba.
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    Activa el switch de arriba si necesitas agregar variantes con stock individual.
                  </p>
                </div>
              )}
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