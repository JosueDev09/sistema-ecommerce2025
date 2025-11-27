/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../../../lib/db"; // tu PrismaClient global
import { verifyPassword, generateToken } from "./auth/utils";
import bcrypt from "bcryptjs";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { enviarEmailsConfirmacion } from "../../../lib/email";

// Configurar MercadoPago con la nueva API
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "" 
});
const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);

// ============================================================
// FUNCIONES AUXILIARES PARA MERCADOPAGO
// ============================================================

// Detectar método de pago según tipo de tarjeta
function detectarMetodoPago(tipoTarjeta: string): string {
  const mapa: Record<string, string> = {
    'visa': 'visa',
    'mastercard': 'master',
    'amex': 'amex',
    'american express': 'amex',
    'credito': 'visa',
    'debito': 'debito'
  };
  return mapa[tipoTarjeta?.toLowerCase()] || 'visa';
}

// Mapear estados de MercadoPago a estados de tu sistema
function mapearEstadoPago(status: string): string {
  const mapa: Record<string, string> = {
    'approved': 'APROBADO',
    'rejected': 'RECHAZADO',
    'pending': 'PENDIENTE',
    'in_process': 'PENDIENTE',
    'cancelled': 'CANCELADO',
    'refunded': 'REEMBOLSADO'
  };
  return mapa[status] || 'PENDIENTE';
}

// Obtener mensaje legible para rechazo de pago
function obtenerMensajeRechazo(statusDetail: string): string {
  const mensajes: Record<string, string> = {
    'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta',
    'cc_rejected_bad_filled_card_number': 'Número de tarjeta inválido',
    'cc_rejected_bad_filled_date': 'Fecha de expiración inválida',
    'cc_rejected_bad_filled_security_code': 'Código de seguridad (CVV) inválido',
    'cc_rejected_call_for_authorize': 'Debes autorizar el pago con tu banco',
    'cc_rejected_high_risk': 'Pago rechazado por alto riesgo',
    'cc_rejected_blacklist': 'Tarjeta bloqueada',
    'cc_rejected_duplicated_payment': 'Pago duplicado detectado',
    'cc_rejected_max_attempts': 'Superaste el número máximo de intentos',
    'cc_amount_rate_limit_exceeded': 'Límite de monto excedido'
  };
  return mensajes[statusDetail] || 'Pago rechazado. Intenta con otra tarjeta.';
}

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
    obtenerDescuentoCodigo: async (_: any, {strCodigo}: any) => {
     // console.log("🔍 Buscando código de descuento:", strCodigo);
      
      const descuento = await db.tbDescuentosCodigos.findFirst({
        where: {
          strCodigo: {
            equals: strCodigo,
            mode: "insensitive",
          },
        }
      });
      
      if (!descuento) {
       // console.log("❌ Código de descuento no encontrado:", strCodigo);
        throw new Error("Código de descuento no válido o no existe");
      }
      
      // console.log("✅ Código encontrado:", descuento);
      return descuento;
    },

     obtenerDireccionesCliente: async (_: any,{ intCliente }: { intCliente: number }) => {
      try {
       
        const direcciones =await db.tbDirecciones.findMany({
          where: { intCliente },
          orderBy: { intDireccion: 'desc' } // La más reciente
        });

        return direcciones || [];
      } catch (error) {
        console.error("Error al obtener dirección:", error);
        throw new Error("Error al cargar la dirección del cliente");
      }
  },

   

  // ======================================================
  //  PAGOS
  // ======================================================
    obtenerPago: async (_: any, { intPago }: any) => {
      const pago = await db.tbPagos.findUnique({
        where: { intPago },
        include: {
          tbPedido: {
            include: {
              tbClientes: true,
              tbItems: {
                include: {
                  tbProducto: true
                }
              }
            }
          }
        }
      });
      
      if (!pago) {
        throw new Error("Pago no encontrado");
      }
      
      return pago;
    },

    obtenerPagosPorPedido: async (_: any, { intPedido }: any) => {
      return await db.tbPagos.findMany({
        where: { intPedido },
        include: {
          tbPedido: {
            include: {
              tbClientes: true
            }
          }
        }
      });
    },

    obtenerTarjetasCliente: async (_: any,{ intCliente }: { intCliente: number }) => {
        try {
          const tarjetas = await db.tbTarjetas.findMany({
            where: { intCliente },
            orderBy: { datCreacion: 'desc' } // Las más recientes primero
          });

          return tarjetas;
        } catch (error) {
          console.error("Error al obtener tarjetas:", error);
          throw new Error("Error al cargar las tarjetas del cliente");
        }
},

  },
  Mutation: {
    crearCategoria: async (_: any, { data }: any) => {
     // console.log('Datos recibidos para crear categoría:', data);
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
     // console.log('Datos recibidos para crear producto:', data);
      
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
      
      // console.log('Producto creado exitosamente:', nuevoProducto);
      return nuevoProducto;
    },

    actualizarProducto: async (_: any, { intProducto,data }: any) => {
     // console.log('Datos recibidos para crear producto:', data);
      
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
      
      const actualizarProducto = await db.tbProductos.update({
        where: {
          intProducto: intProducto, // tu PK exacta
        },
        data: productData, // tus campos a actualizar
        include: { 
          tbCategoria: true,
          tbCreadoPor: true
        },
      });
      
      //console.log('Producto actualizado exitosamente:', actualizarProducto);
      return actualizarProducto;
    },

    eliminarProducto: async (_: any, { intProducto }: any) => {
      await db.tbProductos.delete({ where: { intProducto } });
      return true;
    },
    crearEmpleado: async (_: any, { data }: any) => {
      // console.log('Datos recibidos para crear empleado:', data);
      
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
      
     // console.log('Empleado creado exitosamente:', nuevoEmpleado);
      return nuevoEmpleado;
    },

    crearCliente: async (_: any, { data }: any) => {
      // console.log('Datos recibidos para crear cliente:', data);
      try {
        const nuevoCliente = await db.tbClientes.create({
          data: {
            strNombre: data.strNombre,
            strEmail: data.strEmail,
            strTelefono: data.strTelefono || null,
            strUsuario: data.strUsuario || null,
            strContra: data.strContra || null, // TODO: Hashear la contraseña
          }
        });
        return nuevoCliente;
      } catch (error) {
        console.error('Error al crear cliente:', error);
      }
    },

    // Crear cliente invitado (para checkout)
    crearClienteInvitado: async (_: any, { data }: any) => {
      try {
        // Verificar si el email ya existe
        const clienteExistente = await db.tbClientes.findUnique({
          where: { strEmail: data.strEmail },
        });

        if (clienteExistente) {
          throw new Error("El email ya está registrado");
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(data.strContra, 10);

        // Crear el cliente invitado
        const nuevoCliente = await db.tbClientes.create({
          data: {
            strNombre: data.strNombre,
            strEmail: data.strEmail,
            strTelefono: data.strTelefono || null,
            strUsuario: data.strUsuario,
            strContra: hashedPassword,
            bolActivo: true,
          },
        });

        // console.log('✅ Cliente invitado creado:', nuevoCliente.intCliente);
        return nuevoCliente;
      } catch (error: any) {
        console.error('❌ Error al crear cliente invitado:', error);
        throw new Error(error.message || "No se pudo crear el cliente");
      }
    },

    crearDireccion: async (_: any, { data }: any) => {
      try {
        // Verificar que el cliente existe
        const cliente = await db.tbClientes.findUnique({
          where: { intCliente: data.intCliente },
        });

        if (!cliente) {
          throw new Error("Cliente no encontrado");
        }
        
        // Buscar si ya existe una dirección idéntica para este cliente
        const direccionExistente = await db.tbDirecciones.findFirst({
          where: {
            intCliente: data.intCliente,
            strCalle: data.strCalle,
            strNumeroExterior: data.strNumeroExterior || "",
            strNumeroInterior: data.strNumeroInterior || null,
            strColonia: data.strColonia || "",
            strCiudad: data.strCiudad,
            strEstado: data.strEstado,
            strCP: data.strCP,
            strPais: data.strPais || "México",
          },
        });

        // Si ya existe, retornar la dirección existente
        if (direccionExistente) {
      //    console.log('✅ Dirección ya existe, reutilizando:', direccionExistente.intDireccion);
          return direccionExistente;
        }

        // Si no existe, crear la nueva dirección
        const nuevaDireccion = await db.tbDirecciones.create({
          data: {
            intCliente: data.intCliente,
            strCalle: data.strCalle,
            strCiudad: data.strCiudad,
            strEstado: data.strEstado,
            strCP: data.strCP,
            strPais: data.strPais || "México",
            strNumeroExterior: data.strNumeroExterior || "",
            strNumeroInterior: data.strNumeroInterior || null,
            strColonia: data.strColonia || "",
            strReferencias: data.strReferencias || null,
          },
        });

        // console.log('✅ Dirección creada:', nuevaDireccion.intDireccion);
        return nuevaDireccion;
      } catch (error: any) {
        console.error('❌ Error al crear dirección:', error);
        throw new Error(error.message || "No se pudo guardar la dirección");
      }
    },

     crearPedido: async(  _: any,  { data }: any) => {
      try {
        // Validar cliente
        const cliente = await db.tbClientes.findUnique({
          where: { intCliente: data.intCliente },
        });

        if (!cliente) {
          throw new Error("Cliente no encontrado");
        }

        // Validar dirección si el método requiere envío
        if (data.strMetodoEnvio !== "recoger" && !data.intDireccion) {
          throw new Error("Se requiere una dirección de envío");
        }

        // Iniciar transacción
        const pedido = await db.$transaction(async (prisma: any) => {
          // 1. Validar stock de productos
          for (const item of data.items) {
            const producto = await prisma.tbProductos.findUnique({
              where: { intProducto: item.intProducto },
            });

            if (!producto) {
              throw new Error(`Producto ${item.intProducto} no encontrado`);
            }

            if (producto.intStock < item.intCantidad) {
              throw new Error(`Stock insuficiente para ${producto.strNombre}`);
            }
          }

          // 2. Crear el pedido con información de envío
          const nuevoPedido = await prisma.tbPedidos.create({
            data: {
              intCliente: data.intCliente,
              intDireccion: data.intDireccion,        // ✨ NUEVO
              dblSubtotal: data.dblSubtotal,          // ✨ NUEVO
              dblCostoEnvio: data.dblCostoEnvio,      // ✨ NUEVO
              dblTotal: data.dblTotal,
              strMetodoEnvio: data.strMetodoEnvio,    // ✨ NUEVO
              strNotasEnvio: data.strNotasEnvio,      // ✨ NUEVO
              strEstado: "PENDIENTE",
            },
          });

          // 3. Crear items del pedido
          for (const item of data.items) {
            await prisma.tbPedidosItems.create({
              data: {
                intPedido: nuevoPedido.intPedido,
                intProducto: item.intProducto,
                intCantidad: item.intCantidad,
                dblPrecioUnitario: item.dblSubtotal / item.intCantidad,
                dblSubtotal: item.dblSubtotal,
              },
            });

            // 4. Actualizar stock
            await prisma.tbProductos.update({
              where: { intProducto: item.intProducto },
              data: {
                intStock: {
                  decrement: item.intCantidad,
                },
              },
            });
          }

          return nuevoPedido;
        });

        // 5. Retornar pedido con relaciones
        return await db.tbPedidos.findUnique({
          where: { intPedido: pedido.intPedido },
          include: {
            tbClientes: true,
            tbDirecciones: true,  // ✨ NUEVO
            tbItems: {
              include: {
                tbProducto: true,
              },
            },
          },
        });
      } catch (error) {
        console.error("Error al crear pedido:", error);
        throw error;
      }
    },

    crearPago: async (_: any, { data }: any) => {
      try {
        // Verificar que el pedido existe
        const pedido = await db.tbPedidos.findUnique({
          where: { intPedido: data.intPedido },
        });

        if (!pedido) {
          throw new Error("Pedido no encontrado");
        }

        // Verificar que no exista ya un pago para este pedido
        const pagoExistente = await db.tbPagos.findUnique({
          where: { intPedido: data.intPedido },
        });

        if (pagoExistente) {
          throw new Error("Ya existe un pago registrado para este pedido");
        }

        // Generar un ID temporal de MercadoPago (se actualizará después con el real)
        const mercadoPagoIdTemporal = `MP-TEMP-${Date.now()}-${data.intPedido}`;

        // Crear el registro de pago
        const nuevoPago = await db.tbPagos.create({
          data: {
            intPedido: data.intPedido,
            strMercadoPagoId: mercadoPagoIdTemporal,
            strMetodoPago: data.strMetodoPago,
            strEstado: "PENDIENTE",
            dblMonto: data.dblMonto,
            intCuotas: data.intCuotas || null,
            jsonDetallesPago: data.jsonDetallesPago || null,
          },
        });

        // Actualizar el estado del pedido a EN_PROCESO
        await db.tbPedidos.update({
          where: { intPedido: data.intPedido },
          data: { strEstado: "EN_PROCESO" },
        });

        console.log('✅ Pago creado:', nuevoPago.intPago);
        return nuevoPago;
      } catch (error: any) {
        console.error('❌ Error al crear pago:', error);
        throw new Error(error.message || "No se pudo registrar el pago");
      }
    },

    // Actualizar pago después de respuesta de MercadoPago
    actualizarPago: async (_: any, { intPago, strMercadoPagoId, strEstado }: any) => {
      try {
        // Actualizar el pago con el ID real de MercadoPago y el nuevo estado
        const pagoActualizado = await db.tbPagos.update({
          where: { intPago },
          data: {
            strMercadoPagoId,
            strEstado,
          },
        });

        // Si el pago fue aprobado, actualizar el estado del pedido
        if (strEstado === "APROBADO") {
          await db.tbPedidos.update({
            where: { intPedido: pagoActualizado.intPedido },
            data: { strEstado: "PAGADO" },
          });

          console.log('✅ Pedido actualizado a PAGADO');
        }

        // Si el pago fue rechazado o cancelado, cancelar el pedido y devolver el stock
        if (strEstado === "RECHAZADO" || strEstado === "CANCELADO") {
          const pedido = await db.tbPedidos.findUnique({
            where: { intPedido: pagoActualizado.intPedido },
            include: { tbItems: true },
          });

          if (pedido) {
            // Devolver el stock de los productos
            await Promise.all(
              pedido.tbItems.map((item: any) =>
                db.tbProductos.update({
                  where: { intProducto: item.intProducto },
                  data: {
                    intStock: {
                      increment: item.intCantidad,
                    },
                  },
                })
              )
            );

            // Cancelar el pedido
            await db.tbPedidos.update({
              where: { intPedido: pagoActualizado.intPedido },
              data: { strEstado: "CANCELADO" },
            });

            console.log('⚠️ Pedido cancelado y stock devuelto');
          }
        }

        console.log('✅ Pago actualizado:', pagoActualizado.intPago);
        return pagoActualizado;
      } catch (error: any) {
        console.error('❌ Error al actualizar pago:', error);
        throw new Error(error.message || "No se pudo actualizar el pago");
      }
    },


    // MUTATION: Crear tarjeta
    crearTarjeta:async(_: any, { data }: any) => {
          try {
            // Verificar que el cliente existe
            const cliente = await db.tbClientes.findUnique({
              where: { intCliente: data.intCliente },
            });

            if (!cliente) {
              throw new Error("Cliente no encontrado");
            }

            // console.log('💳 Guardando tarjeta con datos completos:');
            // console.log('  - intCliente:', data.intCliente);
            // console.log('  - strNumeroTarjeta (últimos 4):', data.strNumeroTarjeta);
            // console.log('  - strNombreTarjeta:', data.strNombreTarjeta);
            // console.log('  - strTipoTarjeta:', data.strTipoTarjeta);
            // console.log('  - strFechaExpiracion:', data.strFechaExpiracion);
            // console.log('  - strTokenMercadoPago recibido:', data.strTokenMercadoPago ? 'SÍ ✅' : 'NO ❌');
            // console.log('  - Token length:', data.strTokenMercadoPago?.length || 0);
            // console.log('  - Token completo:', data.strTokenMercadoPago);

            // Validar que el token sea válido
            if (!data.strTokenMercadoPago || data.strTokenMercadoPago.length < 20) {
              throw new Error("Token de MercadoPago inválido o no proporcionado");
            }

            // Crear la tarjeta (solo guardar últimos 4 dígitos por seguridad)
            const nuevaTarjeta = await db.tbTarjetas.create({
              data: {
                intCliente: data.intCliente,
                strNumeroTarjeta: data.strNumeroTarjeta,
                strNombreTarjeta: data.strNombreTarjeta,
                strTipoTarjeta: data.strTipoTarjeta,
                strFechaExpiracion: data.strFechaExpiracion,
                strTokenMercadoPago: data.strTokenMercadoPago, // ✨ Guardar token
              },
            });

            // console.log('✅ Tarjeta guardada con ID:', nuevaTarjeta.intTarjeta);
            // console.log('✅ Token guardado en BD:', nuevaTarjeta.strTokenMercadoPago?.substring(0, 20) + '...');
            return nuevaTarjeta;
          } catch (error) {
            console.error("❌ Error al crear tarjeta:", error);
            throw error;
          }
        },

        // MUTATION: Eliminar tarjeta
    eliminarTarjeta:async(_: any,{ intTarjeta }: { intTarjeta: number }) => {
          try {
            await db.tbTarjetas.delete({
              where: { intTarjeta },
            });

            return true;
          } catch (error) {
            console.error("Error al eliminar tarjeta:", error);
            throw new Error("Error al eliminar la tarjeta");
          }
        },

      


   login: async (_: any, { data }: any) => {
  const { strUsuario, strContra } = data;

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

  //console.log("Usuario que se ha logueado:", usuario);

  // ✅ Retornar el objeto completo de la BD para que GraphQL pueda resolver el tipo
  return {
    token,
    usuario: usuario, // Retornar el objeto original completo
  };
    },

    // ======================================================
    //  MERCADO PAGO - CREAR PREFERENCIA O PAGO DIRECTO
    // ======================================================
    crearPreferenciaMercadoPago: async (_: any, { data }: any) => {
      try {
        console.log("🔵 Procesando pago con MercadoPago...");

        // Validar que el pedido existe
        const pedido = await db.tbPedidos.findUnique({
          where: { intPedido: data.intPedido },
          include: {
            tbClientes: true,
            tbDirecciones: true,
            tbItems: {
              include: {
                tbProducto: true
              }
            }
          },
        });

        if (!pedido) {
          throw new Error("Pedido no encontrado");
        }

        // Parsear metadata para obtener el token (si viene por ahí)
        const metadata = data.metadata ? JSON.parse(data.metadata) : {};
        
        // Buscar token en TODOS los lugares posibles
        let tokenTarjeta = 
          data.strTokenTarjeta || 
          data.formData?.strTokenTarjeta || 
          metadata.token_tarjeta || 
          metadata.strTokenTarjeta;

        // console.log("� DEBUG - Buscando token en:");
        // console.log("  - data.strTokenTarjeta:", data.strTokenTarjeta || "❌");
        // console.log("  - data.formData.strTokenTarjeta:", data.formData?.strTokenTarjeta || "❌");
        // console.log("  - metadata.token_tarjeta:", metadata.token_tarjeta || "❌");
        // console.log("  - metadata.strTokenTarjeta:", metadata.strTokenTarjeta || "❌");

        // 🎯 DETECTAR SI SE ESTÁ USANDO UNA TARJETA GUARDADA
        // console.log("🔍 Verificando tarjeta guardada:");
        // console.log("  - tokenTarjeta value:", tokenTarjeta);
        // console.log("  - tokenTarjeta === 'USAR_TOKEN_GUARDADO':", tokenTarjeta === "USAR_TOKEN_GUARDADO");
        // console.log("  - data.formData?.intTarjetaGuardada:", data.formData?.intTarjetaGuardada);
        // console.log("  - data.formData?.bolUsandoTarjetaGuardada:", data.formData?.bolUsandoTarjetaGuardada);

        // Si es tarjeta guardada pero no viene el ID, buscar en las tarjetas del cliente
        if (tokenTarjeta === "USAR_TOKEN_GUARDADO" && data.formData?.bolUsandoTarjetaGuardada) {
          console.log("💳 Detectada tarjeta guardada - Buscando tarjeta del cliente...");
          
          let idTarjeta = data.formData?.intTarjetaGuardada;
          
          // Si no viene el ID directamente, buscar por últimos 4 dígitos y nombre
          if (!idTarjeta && data.formData?.strNumeroTarjetaUltimos4) {
            console.log("� Buscando tarjeta por últimos 4 dígitos:", data.formData.strNumeroTarjetaUltimos4);
            
            const tarjetasCliente = await db.tbTarjetas.findMany({
              where: {
                intCliente: data.intCliente,
                strNumeroTarjeta: data.formData.strNumeroTarjetaUltimos4,
              },
            });

            if (tarjetasCliente.length > 0) {
              // Si hay varias, tomar la más reciente
              const tarjetaMasReciente = tarjetasCliente.sort((a, b) => 
                b.intTarjeta - a.intTarjeta
              )[0];
              idTarjeta = tarjetaMasReciente.intTarjeta;
              console.log("✅ Tarjeta encontrada por últimos 4 dígitos - ID:", idTarjeta);
            } else {
              throw new Error("No se encontró una tarjeta guardada con esos últimos 4 dígitos. Por favor, selecciona la tarjeta nuevamente.");
            }
          }

          if (!idTarjeta) {
            throw new Error("No se pudo identificar la tarjeta guardada. Por favor, intenta nuevamente.");
          }

          // Buscar la tarjeta en la base de datos
          const tarjetaGuardada = await db.tbTarjetas.findUnique({
            where: { intTarjeta: idTarjeta },
          });

          if (!tarjetaGuardada) {
            throw new Error("Tarjeta guardada no encontrada en la base de datos");
          }

          if (!tarjetaGuardada.strTokenMercadoPago) {
            throw new Error("Esta tarjeta no tiene un token válido guardado. Por favor, elimínala y agrégala de nuevo.");
          }

          // Usar el token guardado
          tokenTarjeta = tarjetaGuardada.strTokenMercadoPago;
        
        }      

        // ==========================================
        // FLUJO A: PAGO DIRECTO CON TOKEN (Checkout API)
        // ==========================================
        if (tokenTarjeta && tokenTarjeta !== "") {
         // console.log("� Usando Checkout API (pago directo con token)");

          // Función auxiliar para detectar método de pago
          const detectarMetodoPago = (tipoTarjeta: string) => {
            const mapa: Record<string, string> = {
              'visa': 'visa',
              'mastercard': 'master',
              'amex': 'amex',
              'credito': 'visa',
              'debito': 'debito'
            };
            return mapa[tipoTarjeta?.toLowerCase()] || 'visa';
          };

          // Crear pago directo con el token
          const paymentData: any = {
            token: tokenTarjeta,
            transaction_amount: parseFloat(data.montos.dblTotal.toString()),
            installments: parseInt(data.formData.intMesesSinIntereses || "1"),
            //payment_method_id: detectarMetodoPago(data.formData.strTipoTarjeta),
            description: `Pedido #${data.intPedido} - ESYMBEL STORE`,
            
            payer: {
              email: data.payer.strEmail,
              first_name: data.payer.strNombre,
              last_name: data.payer.strApellido || "",
              
            },

            external_reference: data.intPedido.toString(),
            
            metadata: {
              pedido_id: data.intPedido,
              cliente_id: data.intCliente,
            },
          };

          // Procesar el pago
          console.log("💳 Procesando pago directo con datos:", paymentData);
          const pagoResponse = await paymentClient.create({ body: paymentData });

           console.log("✅ Pago directo procesado:", pagoResponse.id);
           console.log("📊 Estado:", pagoResponse.status);
           console.log("💰 Monto:", pagoResponse);
          // Mapear estados de MercadoPago a tu sistema
          const mapearEstado = (status: string) => {
            const mapa: Record<string, string> = {
              'approved': 'APROBADO',
              'rejected': 'RECHAZADO',
              'pending': 'PENDIENTE',
              'in_process': 'PENDIENTE',
              'cancelled': 'CANCELADO',
              'refunded': 'REEMBOLSADO'
            };
            return mapa[status] || 'PENDIENTE';
          };

          // Guardar el pago en la base de datos
          const nuevoPago = await db.tbPagos.create({
            data: {
              intPedido: data.intPedido,
              strMercadoPagoId: pagoResponse.id?.toString() || "",
              strMetodoPago: data.formData.strMetodoPago,
              dblMonto: data.montos.dblTotal,
              strEstado: mapearEstado(pagoResponse.status || ""),
              strPreferenciaId: null,
              intCuotas: parseInt(data.formData.intMesesSinIntereses || "1"),
              jsonDetallesPago: JSON.stringify({
                subtotal: data.montos.dblSubtotal,
                costoEnvio: data.montos.dblCostoEnvio,
                metodoEnvio: data.formData.strMetodoEnvio,
                numeroTarjetaUltimos4: data.formData.strNumeroTarjetaUltimos4,
                nombreTarjeta: data.formData.strNombreTarjeta,
                tipoTarjeta: data.formData.strTipoTarjeta,
                payment_method_id: pagoResponse.payment_method_id,
              }),
              jsonRespuestaMercadoPago: JSON.stringify(pagoResponse),
            },
          });

          // Actualizar estado del pedido según el resultado
          let estadoPedido = "EN_PROCESO";
          if (pagoResponse.status === "approved") {
            estadoPedido = "PAGADO";
          } else if (pagoResponse.status === "rejected") {
            estadoPedido = "CANCELADO";
            
            // Devolver stock si el pago fue rechazado
            await Promise.all(
              pedido.tbItems.map((item: any) =>
                db.tbProductos.update({
                  where: { intProducto: item.intProducto },
                  data: {
                    intStock: {
                      increment: item.intCantidad,
                    },
                  },
                })
              )
            );
          }

          await db.tbPedidos.update({
            where: { intPedido: data.intPedido },
            data: { strEstado: estadoPedido as any },
          });

          console.log("💾 Pago guardado en BD:", nuevoPago.intPago);

          // 📧 ENVIAR EMAILS DE CONFIRMACIÓN
          let emailEnviado = false;
          if (pagoResponse.status === "approved") {
            console.log("📬 Enviando emails de confirmación...");
            try {
              const pedidoCompleto = await db.tbPedidos.findUnique({
                where: { intPedido: data.intPedido },
                include: {
                  tbClientes: true,
                  tbDirecciones: true,
                  tbItems: {
                    include: {
                      tbProducto: true
                    }
                  }
                }
              });

              if (pedidoCompleto) {
                const resultadoEmails = await enviarEmailsConfirmacion(pedidoCompleto);
                emailEnviado = resultadoEmails.emailCliente && resultadoEmails.emailAdmin;
              }
            } catch (emailError: any) {
              console.error("❌ Error al enviar emails:", emailError);
              // No fallar el pago si falla el email
            }
          }

          return {
            intPago: nuevoPago.intPago,
            strPreferenciaId: pagoResponse.id?.toString() || "",
            strInitPoint: "", // No hay redirect en pago directo
            strEstado: nuevoPago.strEstado,
            bolEmailEnviado: emailEnviado,
          };
        }

        // ==========================================
        // FLUJO B: CHECKOUT PRO CON PREFERENCIAS (sin token)
        // ==========================================
       // console.log("🌐 Usando Checkout Pro (con redirección)");

        // Construir la preferencia de MercadoPago
        const preferenceData: any = {
          items: data.items.map((item: any) => ({
            id: item.strId,
            title: item.strTitulo,
            description: item.strDescripcion || item.strTitulo,
            picture_url: item.strImagenURL,
            category_id: item.strCategoriaId || "others",
            quantity: item.intCantidad,
            currency_id: "MXN",
            unit_price: parseFloat(item.dblPrecioUnitario),
          })),

          payer: {
            name: data.payer.strNombre,
            surname: data.payer.strApellido || "",
            email: data.payer.strEmail,
            phone: {
              area_code: "52",
              number: data.payer.objTelefono.strNumero,
            },
            address: data.payer.objDireccion
              ? {
                  zip_code: data.payer.objDireccion.strCodigoPostal,
                  street_name: data.payer.objDireccion.strCalle,
                  street_number: parseInt(data.payer.objDireccion.strNumero || data.payer.objDireccion.strNumeroExterior),
                }
              : undefined,
          },

          // URLs de retorno
          back_urls: {
            success: `${process.env.FRONTEND_URL}/checkout/success`,
            failure: `${process.env.FRONTEND_URL}/checkout/failure`,
            pending: `${process.env.FRONTEND_URL}/checkout/pending`,
          },

          // URL de notificación (webhook) - comentar en desarrollo local
          // notification_url: `${process.env.BACKEND_URL}/api/webhook/mercadopago`,

          // Configuración adicional
          // auto_return: "approved", // Comentar en desarrollo local
          binary_mode: false,
          statement_descriptor: "ESYMBEL STORE",

          // Referencia externa
          external_reference: data.intPedido.toString(),

          // Metadata
          metadata: {
            pedido_id: data.intPedido,
            cliente_id: data.intCliente,
            ...data.metadata,
          },

          // Configuración de cuotas (MSI)
          payment_methods: {
            installments: data.metadata?.meses_sin_intereses || 12,
            default_installments: parseInt(data.formData.intMesesSinIntereses || "1"),
          },
        };

        // Agregar envío si existe
        if (data.shipments) {
          preferenceData.shipments = {
            cost: parseFloat(data.shipments.cost),
            mode: data.shipments.mode,
            receiver_address: {
              zip_code: data.shipments.receiver_address.zip_code,
              street_name: data.shipments.receiver_address.street_name,
              street_number: parseInt(data.shipments.receiver_address.street_number),
              floor: data.shipments.receiver_address.floor || "",
              apartment: data.shipments.receiver_address.apartment || "",
              city_name: data.shipments.receiver_address.city_name,
              state_name: data.shipments.receiver_address.state_name,
              country_name: data.shipments.receiver_address.country_name || "México",
            },
          };
        }

        // Crear la preferencia en MercadoPago
        const mpResponse = await preferenceClient.create({ body: preferenceData });

        console.log("✅ Preferencia creada:", mpResponse.id);

        // Guardar el pago en la base de datos
        const nuevoPago = await db.tbPagos.create({
          data: {
            intPedido: data.intPedido,
            strMetodoPago: data.formData.strMetodoPago,
            dblMonto: data.montos.dblTotal,
            strEstado: "PENDIENTE",
            strPreferenciaId: mpResponse.id,
            intCuotas: parseInt(data.formData.intMesesSinIntereses || "1"),
            jsonDetallesPago: JSON.stringify({
              subtotal: data.montos.dblSubtotal,
              costoEnvio: data.montos.dblCostoEnvio,
              metodoEnvio: data.formData.strMetodoEnvio,
              numeroTarjetaUltimos4: data.formData.strNumeroTarjetaUltimos4,
              nombreTarjeta: data.formData.strNombreTarjeta,
              tipoTarjeta: data.formData.strTipoTarjeta,
            }),
            jsonRespuestaMercadoPago: JSON.stringify(mpResponse),
          },
        });

        // Actualizar estado del pedido
        await db.tbPedidos.update({
          where: { intPedido: data.intPedido },
          data: {
            strEstado: "EN_PROCESO",
          },
        });

        console.log("💾 Pago guardado en BD:", nuevoPago.intPago);

        // 📧 ENVIAR EMAILS DE CONFIRMACIÓN (solo para preferencias, no se puede saber si se pagará)
        // Los emails se envían mejor cuando el pago se apruebe via webhook o al retornar del checkout
        // Por ahora, retornamos sin enviar email
        
        return {
          intPago: nuevoPago.intPago,
          strPreferenciaId: mpResponse.id || "",
          strInitPoint: mpResponse.init_point || "",
          strEstado: nuevoPago.strEstado,
          bolEmailEnviado: false, // Se enviará cuando se confirme el pago
        };
      } catch (error: any) {
        console.error("❌ Error al crear preferencia:", error);
        throw new Error(`Error al procesar el pago: ${error.message}`);
      }
    },

    // ======================================================
    //  MERCADO PAGO - ACTUALIZAR ESTADO DE PAGO
    // ======================================================
    actualizarEstadoPago: async (_: any, { strMercadoPagoId, strEstado, jsonRespuesta }: any) => {
      try {
        console.log("🔔 Actualizando estado de pago:", strMercadoPagoId);

        const pago = await db.tbPagos.findFirst({
          where: { strMercadoPagoId },
          include: { tbPedido: true },
        });

        if (!pago) {
          throw new Error("Pago no encontrado");
        }

        // Actualizar pago
        const pagoActualizado = await db.tbPagos.update({
          where: { intPago: pago.intPago },
          data: {
            strEstado,
            jsonRespuestaMercadoPago: jsonRespuesta,
          },
        });

        // Actualizar estado del pedido según el estado del pago
        let estadoPedido: any = "EN_PROCESO";
        if (strEstado === "APROBADO" || strEstado === "approved") {
          estadoPedido = "PAGADO";
        } else if (strEstado === "RECHAZADO" || strEstado === "rejected") {
          estadoPedido = "CANCELADO";
        }

        await db.tbPedidos.update({
          where: { intPedido: pago.intPedido },
          data: { strEstado: estadoPedido as any },
        });

        console.log("✅ Estado actualizado:", strEstado);

        return pagoActualizado;
      } catch (error: any) {
        console.error("❌ Error al actualizar estado:", error);
        throw error;
      }
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
