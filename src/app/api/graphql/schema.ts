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
    strUsuario: String! 
    strEmail: String!
    strRol: RolEmpleado!
    bolActivo: Boolean!
    datCreacion: String!
    datActualizacion: String!
    tbProductos: [Producto!]
  }

  type Categoria {
    intCategoria: Int!
    strNombre: String!
    strDescripcion: String
    datCreacion: String!
    datActualizacion: String!
    tbProductos: [Producto!]
  }

  type Producto {
    intProducto: Int!
    strNombre: String!
    strDescripcion: String
    dblPrecio: Float!
    intStock: Int!
    strImagen: String
    bolActivo: Boolean!
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
    dblTotal: Float!
    strEstado: EstadoPedido!
    datPedido: String!
    datActualizacion: String!
    tbCliente: Cliente!
    tbItems: [PedidoItem!]
  }

  type Direccion {
    intDireccion: Int!
    strCalle: String!
    strCiudad: String!
    strEstado: String!
    strCP: String!
    strPais: String!
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

  input EmpleadoInput {
    strNombre: String!
    strEmail: String!
    strPassword: String!
    strRol: RolEmpleado!
  }

  input CategoriaInput {
    strNombre: String!
    strDescripcion: String
  }

  input ProductoInput {
    strNombre: String!
    strDescripcion: String
    dblPrecio: Float!
    intStock: Int!
    strImagen: String
    intCategoria: Int!
    intCreadoPorId: Int
  }

  input PedidoInput {
    intCliente: Int!
    tbItems: [PedidoItemInput!]!
  }

  input PedidoItemInput {
    intProducto: Int!
    intCantidad: Int!
  }

  input DireccionInput {
    intCliente: Int!
    strCalle: String!
    strCiudad: String!
    strEstado: String!
    strCP: String!
    strPais: String
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
    obtenerProducto(intProducto: Int!): Producto

    # Pedidos
    obtenerPedidos: [Pedido!]!
    obtenerPedido(intPedido: Int!): Pedido
  }

  # ======================================================
  #  MUTATIONS
  # ======================================================

  type Mutation {

    # Autenticación
    login(data: LoginInput!): AuthPayload!

    # Clientes
    crearCliente(data: ClienteInput!): Cliente!
    eliminarCliente(intCliente: Int!): Boolean!

    # Empleados
    crearEmpleado(data: EmpleadoInput!): Empleado!
    eliminarEmpleado(intEmpleado: Int!): Boolean!

    # Categorías
    crearCategoria(data: CategoriaInput!): Categoria!
    eliminarCategoria(intCategoria: Int!): Boolean!

    # Productos
    crearProducto(data: ProductoInput!): Producto!
    eliminarProducto(intProducto: Int!): Boolean!

    # Pedidos
    crearPedido(data: PedidoInput!): Pedido!
    eliminarPedido(intPedido: Int!): Boolean!

    # Direcciones
    crearDireccion(data: DireccionInput!): Direccion!
    eliminarDireccion(intDireccion: Int!): Boolean!
  }
`;
