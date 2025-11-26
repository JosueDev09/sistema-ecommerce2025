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
    PAGADO
    EN_PROCESO
    ENVIADO
    ENTREGADO
    CANCELADO
  }

  enum EstadoPago {
    PENDIENTE
    APROBADO
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
  }

  type PedidoItem {
    intPedidoItem: Int!
    intCantidad: Int!
    dblSubtotal: Float!
    tbProducto: Producto!
  }

  type Pedido {
    intPedido: Int!
    intCliente: Int!
    intDireccion: Int
    dblSubtotal: Float!      # ✨ NUEVO
    dblCostoEnvio: Float!    # ✨ NUEVO
    dblTotal: Float!
    strEstado: String!
    strMetodoEnvio: String   # ✨ NUEVO
    strNotasEnvio: String    # ✨ NUEVO
    datPedido: String!
    tbCliente: Cliente!
    tbDireccion: Direccion   # ✨ NUEVO
    tbItems: [PedidoItem!]!
    tbPago: Pago
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
    datCreacion: String!
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
    items: [PedidoItemInput!]!
}

  input PedidoItemInput {
    intProducto: Int!
    intCantidad: Int!
    dblSubtotal: Float!
  }

  input TarjetaInput {
    intCliente: Int!
    strNumeroTarjeta: String!   # Solo últimos 4 dígitos
    strNombreTarjeta: String!
    strTipoTarjeta: String!     # visa, mastercard, amex
    strFechaExpiracion: String! # MM/YY
  }

  input DireccionInput {
    intCliente: Int!
    strCalle: String!
    strNumeroExterior: String!
    strNumeroInterior: String
    strColonia: String!
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
  }
`;
