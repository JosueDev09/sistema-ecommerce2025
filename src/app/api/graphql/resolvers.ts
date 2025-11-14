import { db } from "../../../lib/db"; // tu PrismaClient global
import { verifyPassword, generateToken } from "./auth/utils";

export const resolvers = {

  
  Query: {
    obtenerProductos: async () => {
      return await db.tbProductos.findMany({
        include: { 
          tbCategoria: true,
          tbCreadoPor: true
        },
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
    obtenerProducto: async (_: any, { strNombre }: any) => {
         // console.log("🔍 Buscando producto con slug:", strNombre);

          const nombreNormalizado = strNombre
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase());

          return await db.tbProductos.findFirst({
            where: {
              strNombre: {
                equals: nombreNormalizado,
                mode: "insensitive",
              },
            },
            include: {
              tbCategoria: true,
              tbCreadoPor: true,
            },
          });
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
      console.log('Datos recibidos para crear producto:', data);
      
      // Preparar los datos para la creación
      const productData: any = {
        strNombre: data.strNombre,
        strSKU: data.strSKU || null,
        strMarca: data.strMarca || null,
        strDescripcion: data.strDescripcion || null,
        strDescripcionLarga: data.strDescripcionLarga || null,
        dblPrecio: parseFloat(data.dblPrecio),
        intStock: parseInt(data.intStock),
        intStockMinimo: data.intStockMinimo ? parseInt(data.intStockMinimo) : null,
        strImagen: data.strImagen || null,
        bolActivo: data.bolActivo !== undefined ? data.bolActivo : true,
        bolDestacado: data.bolDestacado || false,
        strEstado: data.strEstado || 'activo',
        
        // Campos de descuento
        bolTieneDescuento: data.bolTieneDescuento || false,
        dblPrecioDescuento: data.dblPrecioDescuento ? parseFloat(data.dblPrecioDescuento) : null,
        intPorcentajeDescuento: data.intPorcentajeDescuento ? parseInt(data.intPorcentajeDescuento) : null,
        datInicioDescuento: data.datInicioDescuento ? new Date(data.datInicioDescuento) : null,
        datFinDescuento: data.datFinDescuento ? new Date(data.datFinDescuento) : null,
        
        // Campos adicionales
        strPeso: data.strPeso || null,
        strDimensiones: data.strDimensiones || null,
        strEtiquetas: data.strEtiquetas || null,
        jsonVariantes: data.jsonVariantes || null,
        jsonImagenes: data.jsonImagenes || null,
        
        // Relaciones
        intCategoria: parseInt(data.intCategoria),
      };
      
      // Agregar empleado creador si existe
      // if (data.intCreadoPorId) {
      //   productData.intCreadoPorId = parseInt(data.intCreadoPorId);
      // }
      
      const nuevoProducto = await db.tbProductos.create({
        data: productData,
        include: { 
          tbCategoria: true,
          tbCreadoPor: true
        },
      });
      
      console.log('Producto creado exitosamente:', nuevoProducto);
      return nuevoProducto;
    },

    eliminarProducto: async (_: any, { intProducto }: any) => {
      await db.tbProductos.delete({ where: { intProducto } });
      return true;
    },
    crearEmpleado: async (_: any, { data }: any) => {
      console.log('Datos recibidos para crear empleado:', data);
      
      const empleadoData: any = {
        strNombre: data.strNombre,
        datFechaNacimiento: data.datFechaNacimiento ? new Date(data.datFechaNacimiento) : null,
        strEmail: data.strEmail,
        strTelefono: data.strTelefono || null,
        strDireccion: data.strDireccion || null,
        strCiudad: data.strCiudad || null,
        strEstado: data.strEstado || null,
        intCP: data.intCP ? parseInt(data.intCP) : null,
        strPuesto: data.strPuesto,
        strDepartamento: data.strDepartamento,
        dblSalario: parseFloat(data.dblSalario),
        datFechaIngreso: new Date(data.datFechaIngreso),
        strTipoContrato: data.strTipoContrato,
        strHorario: data.strHorario,
        strUsuario: data.strUsuario,
        strContra: data.strContra, // TODO: Hashear la contraseña
        strRol: data.strRol,
      };
      
      const nuevoEmpleado = await db.tbEmpleados.create({
        data: empleadoData,
      });
      
      console.log('Empleado creado exitosamente:', nuevoEmpleado);
      return nuevoEmpleado;
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
