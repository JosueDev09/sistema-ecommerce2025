import { db } from "../../../lib/db"; // tu PrismaClient global
import { verifyPassword, generateToken } from "./auth/utils";

export const resolvers = {

  
  Query: {
    obtenerProductos: async () => {
      return await db.tbProductos.findMany({
        include: { tbCategoria: true },
      });
    },
    obtenerCategorias: async () => {
      return await db.tbCategorias.findMany();
    },
    obtenerEmpleados: async () => {
      return await db.tbEmpleados.findMany();
    },
    obtenerPedidos: async () => {
      return await db.tbPedidos.findMany();
    },
  },

  Mutation: {
    crearCategoria: async (_: any, { data }: any) => {
      console.log('Datos recibidos para crear categoría:', data);
      const crearCategoria = await db.tbCategorias.create({
        data: {
          strNombre: data.strNombre,
          strDescripcion: data.strDescripcion,
          strImagen: data.strImagen,
          strEstatus: data.strEstatus,
          boolDestacado: data.boolDestacado, 
        },
      });
      return crearCategoria;
    },
    crearProducto: async (_: any, { data }: any) => {
      const nuevoProducto = await db.tbProductos.create({
        data: {
          strNombre: data.strNombre,
          strDescripcion: data.strDescripcion,
          dblPrecio: data.dblPrecio,
          intStock: data.intStock,
          strImagen: data.strImagen,
          intCategoria: data.intCategoria,
        },
        include: { tbCategoria: true },
      });
      return nuevoProducto;
    },

    eliminarProducto: async (_: any, { intProducto }: any) => {
      await db.tbProductos.delete({ where: { intProducto } });
      return true;
    },

   login: async (_: any, { data }: any) => {
  const { strUsuario, strContra } = data; // ✅ corregido (antes era strPassword)

  //console.log('Credenciales recibidas:', data);

  // Buscar primero en empleados
  const empleado = await db.tbEmpleados.findUnique({ where: { strUsuario } });
  let tipo = "Empleado";
  let rol = empleado?.strRol || "";
  let usuario: any = empleado;

  // Si no existe en empleados, buscar en clientes
  if (!usuario) {
    const cliente = await db.tbClientes.findUnique({ where: { strUsuario } });
    usuario = cliente;
    tipo = "Cliente";
    rol = "CLIENTE";
  }

  if (!usuario) throw new Error("Usuario no encontrado");

  // Verificar contraseña
  const esValida = await verifyPassword(strContra, usuario.strContra);
  if (!esValida) throw new Error("Contraseña incorrecta");

  // Generar token
  const token = generateToken({
    id: usuario.intEmpleado ?? usuario.intCliente,
    usuario: usuario.strUsuario,
    tipo,
    rol,
  });

  return {
    token,
    usuario,
  };
    },
 
  },
  UsuarioAuth: {
    __resolveType(obj: any) {
      if (obj.intEmpleado) return "Empleado";
      if (obj.intCliente) return "Cliente";
      return null;
    },
  },
};
