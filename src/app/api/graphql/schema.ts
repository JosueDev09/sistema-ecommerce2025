import { gql } from "graphql-tag";

export const typeDefs = gql`
  # ======================================================
  #  ENUMS
  # ======================================================

  enum RolEmpleado {
    SUPERADMIN
    ADMIN
    VENDEDOR
  }

  enum EstadoPedido {
    PENDIENTE
    PROCESANDO
    EMPAQUETANDO
    ENVIADO
    ENTREGADO
    CANCELADO
  }

  enum EstadoPago {
    PENDIENTE
    PAGADO
    RECHAZADO
    CANCELADO
    REEMBOLSADO
  }

    # ======================================================
  #  INICIO DE SESIÓN Y AUTENTICACIÓN
  # ======================================================

    type AuthPayload {
    token: String!
    usuario: UsuarioAuth!
  }

  union UsuarioAuth = Cliente | Empleado

  input LoginInput {
    strUsuario: String!
    strContra: String!
  }



  # ======================================================
  #  TIPOS PRINCIPALES
  # ======================================================

  type Cliente {
    intCliente: Int!
    strNombre: String!
    strUsuario: String! 
    strEmail: String!
    strTelefono: String
    bolActivo: Boolean!
    datRegistro: String!
    tbDirecciones: [Direccion!]
    tbPedidos: [Pedido!]
  }

  type Empleado {
    intEmpleado: Int!
    strNombre: String!
    datFechaNacimiento: String
    strEmail: String!
    strTelefono: String
    strDireccion: String
    strCiudad: String
    strEstado: String
    intCP: Int
    strPuesto: String!
    strDepartamento: String!
    dblSalario: Float!
    datFechaIngreso: String!
    strTipoContrato: String!
    strHorario: String!
    strUsuario: String! 
    strRol: RolEmpleado!
    bolActivo: Boolean!
    datCreacion: String!
    datActualizacion: String!
    tbProductos: [Producto!]
  }

  type Categoria {
    intCategoria: Int!
    strNombre: String!
    strDescripcion: String!
    strImagen: String!
    strEstatus: String!
    boolDestacado: Boolean!
    datCreacion: String!
    datActualizacion: String!
    tbProductos: [Producto!]
  }

  type Producto {
    intProducto: Int!
    strNombre: String!
    strSKU: String
    strMarca: String
    strDescripcion: String
    strDescripcionLarga: String
    dblPrecio: Float!
    intStock: Int!
    intStockMinimo: Int
    strImagen: String
    bolActivo: Boolean!
    bolDestacado: Boolean!
    strEstado: String!
    
    # Campos de descuento
    bolTieneDescuento: Boolean!
    dblPrecioDescuento: Float
    intPorcentajeDescuento: Int
    datInicioDescuento: String
    datFinDescuento: String
    
    # Campos adicionales
    strPeso: String
    strDimensiones: String
    strEtiquetas: String
    jsonVariantes: String
    jsonImagenes: String
    
    datCreacion: String!
    datActualizacion: String!
    tbCategoria: Categoria!
    tbCreadoPor: Empleado
    tbProductoVariantes: [ProductoVariante!]
    tbProducto_Reviews: [ProductoReview!]
  }

  type ProductoVariante {
    intVariante: Int!
    intProducto: Int!
    strTalla: String!
    strColor: String!
    intStock: Int!
    strSKU: String
    dblPrecioAdicional: Float
    strImagen: String
    bolActivo: Boolean!
    datCreacion: String!
    datActualizacion: String!
  }

  type ProductoReview {
    intReview: Int!
    intProducto: Int!
    intCliente: Int!
    intCalificacion: Int!
    strComentario: String
    datCreacion: String!
  }

  type PedidoItem {
    intPedidoItem: Int!
    intCantidad: Int!
    dblSubtotal: Float!
    tbProducto: Producto!
    jsonImagenes: String
    strTalla: String
    strColor: String
  }

  type Pedido {
    intPedido: Int!
    intCliente: Int!
    intDireccion: Int
    dblSubtotal: Float!
    dblCostoEnvio: Float!
    datActualizacion: String!
    dblTotal: Float!
    strEstado: String!          # 🚚 Estado de envío
    strEstadoPago: String!      # 💰 Estado de pago (NUEVO)
    strMetodoEnvio: String
    strNotasEnvio: String
    datPedido: String!
    tbClientes: Cliente      # ✨ Permitir null temporalmente
    tbDirecciones: Direccion
    tbItems: [PedidoItem!]  # ✨ Permitir array null (sin el !)
    tbPagos: Pago
    strNumeroSeguimiento: String
}

  type Direccion {
    intDireccion: Int!
    intCliente: Int!
    strCalle: String!
    strNumeroExterior: String!
    strNumeroInterior: String
    strColonia: String!
    strCiudad: String!
    strEstado: String!
    strCP: String!
    strPais: String!
    strReferencias: String
}

  type DescuentoCodigo {
    intDescuentoCodigo: Int!
    strCodigo: String!
    intPorcentajeDescuento: Int!
    datFechaInicio: String!
    datFechaFin: String!
    bolActivo: Boolean!
  }

  type Pago {
    intPago: Int!
    intPedido: Int!
    strMercadoPagoId: String!
    strMetodoPago: String!
    strEstado: EstadoPago!
    dblMonto: Float!
    intCuotas: Int
    jsonDetallesPago: String
    datCreacion: String!
    datActualizacion: String!
    tbPedido: Pedido!
  }

  type Tarjeta {
    intTarjeta: Int!
    intCliente: Int!
    strNumeroTarjeta: String!   # Solo últimos 4 dígitos
    strNombreTarjeta: String!
    strTipoTarjeta: String!
    strFechaExpiracion: String!
    strTokenMercadoPago: String  # ✨ Token reutilizable
    datCreacion: String!
  }

  type PagoMercadoPago {
    intPago: Int!
    strPreferenciaId: String!
    strInitPoint: String!
    strEstado: String!
    bolEmailEnviado: Boolean
  }

  type PagoEstado {
    intPago: Int!
    intPedido: Int!
    dblMonto: Float!
    strEstado: String!
    strMercadoPagoId: String
    datCreacion: String!
    tbPedido: Pedido!
  }

  type SugerenciasMarca {
    intSugerenciaMarca: Int!
    strMarca: String!
    intVotos: Int!
    datCreacion: String!
  }

  type ProductoReview {
    intReview: Int!
    intProducto: Int!
    intCliente: Int!
    intCalificacion: Int!
    strComentario: String
    datCreacion: String!
  }

  type MotivoMovimiento {
    intMotivoMovimiento: Int!
    strTipoMovimiento: String!
    strDescripcion: String!
  }

  # ======================================================
  #  INPUTS (para Mutations)
  # ======================================================

  input ClienteInput {
    strNombre: String!
    strEmail: String!
    strPassword: String!
    strTelefono: String
  }

  input ClienteInvitadoInput {
    strNombre: String!
    strEmail: String!
    strTelefono: String
    strUsuario: String!
    strContra: String!
  }

  input EmpleadoInput {
    strNombre: String!
    datFechaNacimiento: String
    strEmail: String!
    strTelefono: String
    strDireccion: String
    strCiudad: String
    strEstado: String
    intCP: Int
    strPuesto: String!
    strDepartamento: String!
    dblSalario: Float!
    datFechaIngreso: String!
    strTipoContrato: String!
    strHorario: String!
    strUsuario: String!
    strContra: String!
    strRol: RolEmpleado!
  }

  input CategoriaInput {
    strNombre: String!
    strDescripcion: String
    strImagen: String!
    strEstatus: String!
    boolDestacado: Boolean!
    
  }

  input ProductoInput {
    strNombre: String!
    strSKU: String
    strMarca: String
    strDescripcion: String
    strDescripcionLarga: String
    dblPrecio: Float!
    intStock: Int!
    intStockMinimo: Int
    strImagen: String
    bolActivo: Boolean
    bolDestacado: Boolean
    strEstado: String
    
    # Campos de descuento
    bolTieneDescuento: Boolean
    dblPrecioDescuento: Float
    intPorcentajeDescuento: Int
    datInicioDescuento: String
    datFinDescuento: String
    
    # Campos adicionales
    strPeso: String
    strDimensiones: String
    strEtiquetas: String
    jsonVariantes: String
    jsonImagenes: String
    
    intCategoria: Int!
    intCreadoPorId: Int
    variantes: [ProductoVarianteInput!]
  }

  input ProductoVarianteInput {
    strTalla: String!
    strColor: String!
    intStock: Int!
    strSKU: String
    dblPrecioAdicional: Float
    strImagen: String
  }
 input ProductoUpdateInput {
    strNombre: String!
    strSKU: String
    strMarca: String
    strDescripcion: String
    dblPrecio: Float!
    intStock: Int!
    intStockMinimo: Int
    strImagen: String
    bolActivo: Boolean
    bolDestacado: Boolean
    strEstado: String
    
    # Campos de descuento
    bolTieneDescuento: Boolean
    dblPrecioDescuento: Float
    intPorcentajeDescuento: Int
    datInicioDescuento: String
    datFinDescuento: String
    
    # Campos adicionales
    strPeso: String
    strDimensiones: String
    strEtiquetas: String
    jsonVariantes: String
    jsonImagenes: String
    
    intCategoria: Int!
    intCreadoPorId: Int
  }


  input PedidoInput {
    intCliente: Int!
    intDireccion: Int              # ✨ NUEVO
    dblSubtotal: Float!            # ✨ NUEVO
    dblCostoEnvio: Float!          # ✨ NUEVO
    dblTotal: Float!
    strMetodoEnvio: String!        # ✨ NUEVO: "express" | "estandar" | "recoger"
    strNotasEnvio: String          # ✨ NUEVO
    strNumeroSeguimiento: String  # ✨ NUEVO
    items: [PedidoItemInput!]!

}

  input PedidoItemInput {
    intProducto: Int!
    intCantidad: Int!
    dblSubtotal: Float!
    strTalla: String
    strColor: String
  }

  input TarjetaInput {
    intCliente: Int!
    strNumeroTarjeta: String!   # Solo últimos 4 dígitos
    strNombreTarjeta: String!
    strTipoTarjeta: String!     # visa, mastercard, amex
    strFechaExpiracion: String! # MM/YY
    strTokenMercadoPago: String # ✨ Token generado por MercadoPago
  }

  input DireccionInput {
    intCliente: Int!
    strCalle: String!
    strNumeroExterior: String
    strNumeroInterior: String
    strColonia: String
    strCiudad: String!
    strEstado: String!
    strCP: String!
    strPais: String
    strReferencias: String
  }

  input PagoInput {
    intPedido: Int!
    strMetodoPago: String!
    dblMonto: Float!
    intCuotas: Int
    jsonDetallesPago: String
  }

  input PreferenciaMercadoPagoInput {
    intPedido: Int!
    intCliente: Int!
    intDireccion: Int
    strTokenTarjeta: String
    formData: FormDataInput!
    montos: MontosInput!
    items: [ItemMercadoPagoInput!]!
    payer: PayerInput!
    shipments: ShipmentsInput
    metadata: String
  }
  input FormDataInput {
    strNombre: String!
    strApellido: String
    strEmail: String!
    strTelefono: String!

    strCalle: String
    strNumeroExterior: String
    strNumeroInterior: String
    strColonia: String
    strCiudad: String
    strEstado: String
    strCodigoPostal: String
    strReferencias: String

    strMetodoEnvio: String!
    strMetodoPago: String!

    strNumeroTarjeta: String
    strNombreTarjeta: String
    strTipoTarjeta: String
    strFechaExpiracion: String
    intMesesSinIntereses: Int
    
    # Campos adicionales para CVV y tarjetas guardadas
    strCVV: String
    bolUsandoTarjetaGuardada: Boolean
    intTarjetaGuardada: Int              # ✨ ID de la tarjeta guardada a usar
    strNumeroTarjetaUltimos4: String
    strTokenTarjeta: String  # Token generado por MercadoPago.js en el frontend
  }


  input MontosInput {
    dblSubtotal: Float!
    dblCostoEnvio: Float!
    dblTotal: Float!
  }


  input ItemMercadoPagoInput {
    strId: String!
    strTitulo: String!
    strDescripcion: String
    strImagenURL: String
    strCategoriaId: String
    intCantidad: Int!
    dblPrecioUnitario: Float!
  }


  input PayerInput {
    strNombre: String!
    strApellido: String
    strEmail: String!
    objTelefono: PhoneInput!
    objDireccion: DireccionInput
  }

  input PhoneInput {
    strNumero: String!
  }

 input EnvioInput {
    dblCosto: Float!
    strModo: String!
    objDireccionReceptor: DireccionReceptorInput!
  }

  input ShipmentsInput {
    cost: Float
    mode: String
    receiver_address: DireccionReceptorInput
  }


  input DireccionReceptorInput {
    strCodigoPostal: String!
    strCalle: String!
    strNumero: String!
    strPiso: String
    strDepartamento: String
    strCiudad: String
    strEstado: String
    strPais: String
  }

  input SugerenciaMarcaInput {
    strMarca: String!
  }

  input ProductoReviewInput {
    intProducto: Int!
    strComentario: String!
    intCalificacion: Int!
    intCliente: Int!
  }


  # ======================================================
  #  QUERIES
  # ======================================================

  type Query {
    # Clientes
    obtenerClientes: [Cliente!]!
    obtenerCliente(intCliente: Int!): Cliente

    # Empleados
    obtenerEmpleados: [Empleado!]!
    obtenerEmpleado(intEmpleado: Int!): Empleado

    # Categorías
    obtenerCategorias: [Categoria!]!
    obtenerCategoria(intCategoria: Int!): Categoria

    # Productos
    obtenerProductos: [Producto!]!
    obtenerProducto(strNombre: String!): Producto
    obtenerProductoPorId(intProducto: Int!): Producto
    obtenerProductoConVariantes(intProducto: Int!): Producto

    # Variantes
    obtenerVariantesPorProducto(intProducto: Int!): [ProductoVariante!]!
    obtenerVariante(intProducto: Int!, strTalla: String!, strColor: String!): ProductoVariante
    obtenerVariantesPorTalla(intProducto: Int!, strTalla: String!): [ProductoVariante!]!
    obtenerVariantesPorColor(intProducto: Int!, strColor: String!): [ProductoVariante!]!

    # Pedidos
    obtenerPedidos: [Pedido!]!
    obtenerPedido(intPedido: Int!): Pedido


    # CodigosDescuento
    obtenerDescuentoCodigo(strCodigo: String!): DescuentoCodigo

    # Pagos
    obtenerPago(intPago: Int!): Pago
    obtenerPagosPorPedido(intPedido: Int!): [Pago!]

    # Direcciones
    obtenerDireccionesCliente(intCliente: Int!): [Direccion!]!

    # Tarjetas
    obtenerTarjetasCliente(intCliente: Int!): [Tarjeta!]!

    # Mercado Pago
    obtenerEstadoPago(strPreferenciaId: String!): PagoEstado!

    # Sugerencias de Marcas
    obtenerSugerenciasMarcas: [SugerenciasMarca!]!

    # Reviews de Productos
    obtenerReviewsProducto(intProducto: Int!): [ProductoReview!]!

    # Motivos de Movimiento
    obtenerMotivosMovimiento(strTipoMovimiento: String!): [MotivoMovimiento!]!

  }

  # ======================================================
  #  MUTATIONS
  # ======================================================

  type Mutation {

    # Autenticación
    login(data: LoginInput!): AuthPayload!

    # Clientes
    crearCliente(data: ClienteInput!): Cliente!
    crearClienteInvitado(data: ClienteInvitadoInput!): Cliente!
    eliminarCliente(intCliente: Int!): Boolean!

    # Empleados
    crearEmpleado(data: EmpleadoInput!): Empleado!
    eliminarEmpleado(intEmpleado: Int!): Boolean!

    # Categorías
    crearCategoria(data: CategoriaInput!): Categoria!
    eliminarCategoria(intCategoria: Int!): Boolean!

    # Productos
    crearProducto(data: ProductoInput!): Producto!
    actualizarProducto(intProducto: Int!, data: ProductoUpdateInput!): Producto!
    eliminarProducto(intProducto: Int!): Boolean!

    # Pedidos
    crearPedido(data: PedidoInput!): Pedido!
    actualizarEstadoPedido(intPedido: Int!, strEstado: EstadoPedido!, strNumeroSeguimiento: String): Pedido!
    eliminarPedido(intPedido: Int!): Boolean!

    # Direcciones
    crearDireccion(data: DireccionInput!): Direccion!
    eliminarDireccion(intDireccion: Int!): Boolean!

    # Pagos
    crearPago(data: PagoInput!): Pago!
    actualizarPago(intPago: Int!, strMercadoPagoId: String!, strEstado: EstadoPago!): Pago!

    # Tarjetas
    crearTarjeta(data: TarjetaInput!): Tarjeta!
    eliminarTarjeta(intTarjeta: Int!): Boolean!

    # Mercado Pago
    crearPreferenciaMercadoPago(data: PreferenciaMercadoPagoInput!): PagoMercadoPago!
    actualizarEstadoPago(strMercadoPagoId: String! strEstado: String! jsonRespuesta: String!): Pago!

    # Sugerencias de Marcas
    crearSugerenciaMarca(data: SugerenciaMarcaInput!): SugerenciasMarca!

    # Reviews de Productos
    crearReviewProducto(data: ProductoReviewInput!): ProductoReview!
  }
`;
