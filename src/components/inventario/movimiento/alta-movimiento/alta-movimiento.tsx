"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Minus,
  Save,
  AlertCircle,
  FileText,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  X,
  Upload,
  File,
  Download,
  CheckCircle,
  Edit3
} from "lucide-react";

interface Producto {
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  intStock: number;
  dblPrecio: number;
  strImagen?: string;
}

interface FormData {
  tipoMovimiento: "ENTRADA" | "SALIDA" | "";
  intProducto: number;
  strProductoNombre: string;
  intCantidad: number;
  intMotivoMovimiento: number;
  strReferencia: string;
  strObservaciones: string;
  dblCostoUnitario: number;
  dblCostoTotal: number;
  datFecha: string;
}

export default function AltaMovimiento() {
  const [activeTab, setActiveTab] = useState<"manual" | "archivo">("manual");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarListaProductos, setMostrarListaProductos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [motivos, setMotivos] = useState<{ intMotivoMovimiento: number; strDescripcion: string }[]>([]);

  // Estados para carga de archivos
  const [archivos, setArchivos] = useState<File[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [resultadoCarga, setResultadoCarga] = useState<{
    exitosos: number;
    fallidos: number;
    detalles: string[];
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    tipoMovimiento: "",
    intProducto: 0,
    strProductoNombre: "",
    intCantidad: 0,
    dblCostoUnitario: 0,
    dblCostoTotal: 0,
    intMotivoMovimiento: 0,
    strReferencia: "",
    strObservaciones: "",
    datFecha: new Date().toISOString().split('T')[0],
  });

  const [stockActual, setStockActual] = useState<number>(0);
  const [stockNuevo, setStockNuevo] = useState<number>(0);

  // Cargar productos
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const query = `
        query {
          obtenerProductos {
            intProducto
            strNombre
            strSKU
            intStock
            dblPrecio
            strImagen
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        console.error("Error al cargar productos:", errors);
        return;
      }

      setProductos(data.obtenerProductos || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Filtrar productos según búsqueda
  useEffect(() => {
    if (busqueda.length >= 2) {
      const filtrados = productos.filter(
        (p) =>
          p.strNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.strSKU?.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
      setMostrarListaProductos(true);
    } else {
      setProductosFiltrados([]);
      setMostrarListaProductos(false);
    }
  }, [busqueda, productos]);

  // Calcular stock nuevo cuando cambia cantidad o tipo
  useEffect(() => {
    if (formData.intProducto > 0 && formData.intCantidad > 0) {
      if (formData.tipoMovimiento === "ENTRADA") {
        setStockNuevo(stockActual + formData.intCantidad);
      } else if (formData.tipoMovimiento === "SALIDA") {
        setStockNuevo(stockActual - formData.intCantidad);
      }
    } else {
      setStockNuevo(stockActual);
    }
  }, [formData.intCantidad, formData.tipoMovimiento, stockActual]);

  const seleccionarProducto = (producto: Producto) => {
    setFormData({
      ...formData,
      intProducto: producto.intProducto,
      strProductoNombre: producto.strNombre,
    });
    setBusqueda(producto.strNombre);
    setStockActual(producto.intStock);
    setStockNuevo(producto.intStock);
    setMostrarListaProductos(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!formData.tipoMovimiento) {
      setError("Debes seleccionar el tipo de movimiento");
      return;
    }

    if (!formData.intProducto) {
      setError("Debes seleccionar un producto");
      return;
    }

    if (formData.intCantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (!formData.intMotivoMovimiento) {
      setError("Debes especificar el motivo del movimiento");
      return;
    }

    // Validar que no quede stock negativo en salidas
    if (formData.tipoMovimiento === "SALIDA" && stockNuevo < 0) {
      setError("No hay suficiente stock para realizar esta salida");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar mutation GraphQL para guardar movimiento
      // Por ahora solo simularemos el guardado
      console.log("Datos del movimiento:", formData);
      console.log("Stock actual:", stockActual);
      console.log("Stock nuevo:", stockNuevo);

      // Simulación de guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(
        `Movimiento de ${formData.tipoMovimiento.toLowerCase()} registrado exitosamente. Stock actualizado: ${stockNuevo}`
      );

      // Limpiar formulario
      setFormData({
        tipoMovimiento: "",
        intProducto: 0,
        strProductoNombre: "",
        intCantidad: 0,
        intMotivoMovimiento: 0,
        strReferencia: "",
        strObservaciones: "",
        dblCostoUnitario: 0,
        dblCostoTotal: 0,
        datFecha: new Date().toISOString().split('T')[0],
      });
      setBusqueda("");
      setStockActual(0);
      setStockNuevo(0);

      // Recargar productos para actualizar stock
      fetchProductos();
    } catch (err) {
      setError("Error al registrar el movimiento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivos((prev) => [...prev, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const procesarArchivos = async () => {
    if (archivos.length === 0) {
      setError("Debes seleccionar al menos un archivo");
      return;
    }

    setProcesando(true);
    setError("");
    setSuccess("");
    setResultadoCarga(null);

    try {
      // TODO: Implementar lógica de procesamiento de archivos
      // Por ahora simularemos el proceso
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular resultados
      const exitosos = Math.floor(Math.random() * 50) + 20;
      const fallidos = Math.floor(Math.random() * 5);

      setResultadoCarga({
        exitosos,
        fallidos,
        detalles: [
          `Se procesaron ${exitosos} movimientos exitosamente`,
          fallidos > 0 ? `${fallidos} movimientos fallaron (SKU no encontrado o datos inválidos)` : "Todos los movimientos fueron procesados correctamente",
        ],
      });

      setSuccess(`Archivos procesados: ${exitosos} exitosos, ${fallidos} fallidos`);
      setArchivos([]);
    } catch (err) {
      setError("Error al procesar los archivos");
      console.error(err);
    } finally {
      setProcesando(false);
    }
  };

  const descargarPlantilla = () => {
    // Crear CSV con plantilla de ejemplo
    const headers = "Tipo,SKU,Cantidad,Motivo,Referencia,Observaciones,Fecha";
    const ejemplo1 = "ENTRADA,IPH-14-128,50,Compra a proveedor,FAC-12345,Pedido urgente,2025-12-01";
    const ejemplo2 = "SALIDA,MBA-M2-256,15,Venta,VENTA-3210,Venta corporativa,2025-12-01";
    const csv = `${headers}\n${ejemplo1}\n${ejemplo2}`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plantilla_movimientos.csv";
    link.click();
  };

  // const motivos = {
  //   ENTRADA: [
  //     "Compra a proveedor",
  //     "Devolución de cliente",
  //     "Ajuste de inventario",
  //     "Producción interna",
  //     "Transferencia entre almacenes",
  //     "Otro",
  //   ],
  //   SALIDA: [
  //     "Venta",
  //     "Devolución a proveedor",
  //     "Producto dañado",
  //     "Producto vencido",
  //     "Merma",
  //     "Transferencia entre almacenes",
  //     "Muestra o regalo",
  //     "Otro",
  //   ],
  // };
  const fetchMotivosMovimiento = async (tipoMovimiento: any) => {
    
    try {
      const query = ` 
        query obtenerMotivosMovimiento($strTipoMovimiento: String!) {
          obtenerMotivosMovimiento(strTipoMovimiento: $strTipoMovimiento) {
            intMotivoMovimiento
            strDescripcion
          }
        }
      `;

      const variables = { strTipoMovimiento: tipoMovimiento };
      console.log("Fetching motivos for tipoMovimiento:", variables);
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();
      if (result.data && result.data.obtenerMotivosMovimiento) {
        setMotivos(result.data.obtenerMotivosMovimiento);
      } else {
        setError("No se pudieron obtener los motivos de movimiento");
      }
    } catch (error) {
      setError("Error al obtener motivos de movimiento");
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch motivos de movimiento based on tipoMovimiento
    console.log("Tipo de movimiento cambiado:", formData.tipoMovimiento);
    if (formData.tipoMovimiento) {
      fetchMotivosMovimiento(formData.tipoMovimiento);
    }
  }, [formData.tipoMovimiento]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registrar Movimiento de Inventario
        </h1>
        <p className="text-gray-600">
          Registra entradas y salidas de productos en el inventario
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("manual")}
            className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "manual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Registro Manual
            </div>
          </button>
          <button
            onClick={() => setActiveTab("archivo")}
            className={`pb-4 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "archivo"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Carga Masiva
            </div>
          </button>
        </nav>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Save className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">Éxito</p>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Contenido según tab activo */}
      {activeTab === "manual" ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, tipoMovimiento: "ENTRADA", intMotivoMovimiento: 0 })
                }
                className={`p-4 border-2 rounded-lg transition-all ${formData.tipoMovimiento === "ENTRADA"
                    ? "border-green-500 bg-green-50 shadow-md"
                    : "border-gray-200 hover:border-green-300"
                  }`}
              >
                <ArrowDownCircle
                  className={`h-8 w-8 mx-auto mb-2 ${formData.tipoMovimiento === "ENTRADA"
                      ? "text-green-600"
                      : "text-gray-400"
                    }`}
                />
                <p
                  className={`font-semibold ${formData.tipoMovimiento === "ENTRADA"
                      ? "text-green-700"
                      : "text-gray-700"
                    }`}
                >
                  ENTRADA
                </p>
                <p className="text-xs text-gray-600 mt-1">Agregar productos al inventario</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, tipoMovimiento: "SALIDA", intMotivoMovimiento: 0 })
                }
                className={`p-4 border-2 rounded-lg transition-all ${formData.tipoMovimiento === "SALIDA"
                    ? "border-red-500 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-300"
                  }`}
              >
                <ArrowUpCircle
                  className={`h-8 w-8 mx-auto mb-2 ${formData.tipoMovimiento === "SALIDA" ? "text-red-600" : "text-gray-400"
                    }`}
                />
                <p
                  className={`font-semibold ${formData.tipoMovimiento === "SALIDA" ? "text-red-700" : "text-gray-700"
                    }`}
                >
                  SALIDA
                </p>
                <p className="text-xs text-gray-600 mt-1">Quitar productos del inventario</p>
              </button>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha del Movimiento *
            </label>
            <input
              type="date"
              value={formData.datFecha}
              onChange={(e) => setFormData({ ...formData, datFecha: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Búsqueda de Producto */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Producto *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o SKU..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Lista de productos filtrados */}
            {mostrarListaProductos && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.intProducto}
                    type="button"
                    onClick={() => seleccionarProducto(producto)}
                    className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b border-gray-100 last:border-0"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {producto.strImagen ? (
                        <img
                          src={producto.strImagen}
                          alt={producto.strNombre}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{producto.strNombre}</p>
                      <p className="text-sm text-gray-600">
                        SKU: {producto.strSKU || "N/A"} • Stock: {producto.intStock}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">
                      ${producto.dblPrecio.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Producto seleccionado */}
            {formData.intProducto > 0 && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  Producto seleccionado: {formData.strProductoNombre}
                </p>
                <p className="text-sm text-blue-700 mt-1">Stock actual: {stockActual} unidades</p>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    intCantidad: Math.max(0, formData.intCantidad - 1),
                  })
                }
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>
              <input
                type="number"
                value={formData.intCantidad}
                onChange={(e) =>
                  setFormData({ ...formData, intCantidad: parseInt(e.target.value) || 0 })
                }
                min="0"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, intCantidad: formData.intCantidad + 1 })
                }
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Preview de stock nuevo */}
            {formData.intProducto > 0 && formData.intCantidad > 0 && (
              <div className="mt-3 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="text-sm text-gray-600">Stock actual</p>
                  <p className="text-lg font-bold text-gray-900">{stockActual}</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div>
                  <p className="text-sm text-gray-600">Stock nuevo</p>
                  <p
                    className={`text-lg font-bold ${stockNuevo < 0
                        ? "text-red-600"
                        : formData.tipoMovimiento === "ENTRADA"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                  >
                    {stockNuevo}
                  </p>
                </div>
              </div>
            )}
          </div>

            {/* Precio Unitario */}

         <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Costo Unitario del Producto
              <span className="text-gray-500 text-xs ml-2">(MXN)</span>
            </label>
            
            <input
              type="text"
              value={formData.dblCostoUnitario}
              onChange={(e) => setFormData({ ...formData, dblCostoUnitario: parseFloat(e.target.value) })}
              placeholder="Ej: 1500.00"
              className="w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
           
          </div>

            {/* Precio Precio Total */}

             <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
             Costo Total de la Operación
              <span className="text-gray-500 text-xs ml-2">(MXN)</span>
            </label>
            <input
              type="text"
              value={formData.dblCostoTotal}
              onChange={(e) => setFormData({ ...formData, dblCostoTotal: parseFloat(e.target.value) })}
              placeholder="Ej: 1500.00"
              className="w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Motivo del Movimiento *
            </label>
            <select
              value={formData.intMotivoMovimiento}
              onChange={(e) => setFormData({ ...formData, intMotivoMovimiento: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un motivo...</option>
              {formData.tipoMovimiento &&
                motivos.map((motivo) => (
                  <option key={motivo.intMotivoMovimiento} value={motivo.intMotivoMovimiento}>
                    {motivo.strDescripcion}
                  </option>
                ))}
            </select>
          </div>

          {/* Proveedor */}
          <div>
            {formData.intMotivoMovimiento === 1 && (
              <>              
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Proveedor *
                </label>
                <select
                  // value={formData.strProveedor || ""}
                  // onChange={(e) => setFormData({ ...formData, strProveedor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona el proveedor...</option>
                  {formData.tipoMovimiento &&
                    motivos.map((motivo) => (
                      <option key={motivo.intMotivoMovimiento} value={motivo.intMotivoMovimiento}>
                        {motivo.strDescripcion}
                      </option>
                    ))}
                </select>
              </>
            )}

          </div>

          {/* Referencia */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Número de Referencia
              <span className="text-gray-500 text-xs ml-2">(Opcional)</span>
            </label>
            <input
              type="text"
              value={formData.strReferencia}
              onChange={(e) => setFormData({ ...formData, strReferencia: e.target.value })}
              placeholder="Ej: Factura #12345, Pedido #6789, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Número de factura, pedido, o cualquier referencia relacionada
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observaciones
              <span className="text-gray-500 text-xs ml-2">(Opcional)</span>
            </label>
            <textarea
              value={formData.strObservaciones}
              onChange={(e) => setFormData({ ...formData, strObservaciones: e.target.value })}
              rows={4}
              placeholder="Agrega cualquier información adicional relevante..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : formData.tipoMovimiento === "ENTRADA"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Registrar Movimiento
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  tipoMovimiento: "",
                  intProducto: 0,
                  strProductoNombre: "",
                  intCantidad: 0,
                  intMotivoMovimiento: 0,
                  strReferencia: "",
                  strObservaciones: "",
                  dblCostoUnitario: 0,
                  dblCostoTotal: 0,
                  datFecha: new Date().toISOString().split('T')[0],
                });
                setBusqueda("");
                setStockActual(0);
                setStockNuevo(0);
                setError("");
                setSuccess("");
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      ) : (
        /* Tab de Carga Masiva */
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Instrucciones y Plantilla */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Carga Masiva de Movimientos
            </h3>
            <ul className="text-sm text-blue-800 space-y-2 ml-7 mb-4">
              <li>• Descarga la plantilla CSV para ver el formato correcto</li>
              <li>• Puedes cargar múltiples archivos a la vez (CSV, Excel)</li>
              <li>• Los archivos deben contener: Tipo, SKU, Cantidad, Motivo, Referencia, Observaciones, Fecha</li>
              <li>• El sistema validará cada movimiento antes de procesarlo</li>
              <li>• Los movimientos con errores serán reportados al final</li>
            </ul>
            <button
              type="button"
              onClick={descargarPlantilla}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla CSV
            </button>
          </div>

          {/* Zona de Carga de Archivos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Upload className="inline h-4 w-4 mr-1" />
              Seleccionar Archivos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Formatos soportados: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Lista de Archivos Seleccionados */}
          {archivos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Archivos Seleccionados ({archivos.length})
              </h4>
              <div className="space-y-2">
                {archivos.map((archivo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{archivo.name}</p>
                        <p className="text-xs text-gray-600">
                          {(archivo.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarArchivo(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados de la Carga */}
          {resultadoCarga && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Resultados del Procesamiento
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {resultadoCarga.exitosos}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {resultadoCarga.fallidos}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {resultadoCarga.detalles.map((detalle, index) => (
                  <p key={index} className="text-sm text-gray-700">
                    • {detalle}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={procesarArchivos}
              disabled={procesando || archivos.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${procesando || archivos.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {procesando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando Archivos...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Procesar Archivos
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setArchivos([]);
                setResultadoCarga(null);
                setError("");
                setSuccess("");
              }}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Información importante
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          {activeTab === "manual" ? (
            <>
              <li>• Los campos marcados con * son obligatorios</li>
              <li>• Las ENTRADAS incrementan el stock del producto</li>
              <li>• Las SALIDAS disminuyen el stock del producto</li>
              <li>• No se permiten salidas que dejen el stock en negativo</li>
              <li>• Verifica bien la cantidad antes de guardar</li>
            </>
          ) : (
            <>
              <li>• Descarga la plantilla CSV para ver el formato correcto</li>
              <li>• Puedes cargar varios archivos simultáneamente</li>
              <li>• El sistema validará automáticamente cada movimiento</li>
              <li>• Los movimientos inválidos serán reportados sin procesarse</li>
              <li>• Asegúrate de que los SKUs existan en tu catálogo</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
