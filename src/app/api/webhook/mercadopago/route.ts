import { NextRequest, NextResponse } from 'next/server';
import { Payment, MercadoPagoConfig } from 'mercadopago';
import { db } from '@/src/lib/db';

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "" 
});
const paymentClient = new Payment(client);

/**
 * Webhook para recibir notificaciones de Mercado Pago
 * Este endpoint es llamado por Mercado Pago cuando el estado de un pago cambia
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook de MercadoPago recibido");

    const body = await request.json();
    
    console.log("📦 Datos del webhook:", JSON.stringify(body, null, 2));

    // Mercado Pago envía diferentes tipos de notificaciones
    // Nos interesa solo las notificaciones de tipo "payment"
    if (body.type !== 'payment' && body.action !== 'payment.created' && body.action !== 'payment.updated') {
      console.log("⚠️ Notificación ignorada, no es de tipo payment");
      return NextResponse.json({ 
        received: true, 
        message: 'Notificación no es de tipo payment' 
      });
    }

    // Extraer el ID del pago desde el webhook
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      console.error("❌ No se encontró payment ID en la notificación");
      return NextResponse.json({ 
        error: 'Payment ID no encontrado' 
      }, { status: 400 });
    }

    console.log("💳 Payment ID:", paymentId);

    // Obtener información completa del pago desde Mercado Pago
    const payment = await paymentClient.get({ id: paymentId });
    
    console.log("📄 Detalles del pago:");
    console.log("  - ID:", payment.id);
    console.log("  - Status:", payment.status);
    console.log("  - Status Detail:", payment.status_detail);
    console.log("  - Transaction Amount:", payment.transaction_amount);
    console.log("  - External Reference:", payment.external_reference);

    // Buscar el pago en nuestra base de datos usando la preferencia o external reference
    let pago = await db.tbPagos.findFirst({
      where: {
        strMercadoPagoId: paymentId.toString()
      },
      include: { 
        tbPedido: {
          include: {
            tbItems: true
          }
        } 
      },
    });

    // Si no existe, intentar buscarlo por external_reference (ID del pedido)
    if (!pago && payment.external_reference) {
      const pedidoId = parseInt(payment.external_reference);
      
      pago = await db.tbPagos.findFirst({
        where: { intPedido: pedidoId },
        include: { 
          tbPedido: {
            include: {
              tbItems: true
            }
          } 
        },
      });
    }

    if (!pago) {
      console.error("❌ Pago no encontrado en la base de datos");
      return NextResponse.json({ 
        error: 'Pago no encontrado' 
      }, { status: 404 });
    }

    console.log("✅ Pago encontrado en BD:", pago.intPago);

    // Mapear el estado de Mercado Pago a nuestro sistema
    let estadoPago = "PENDIENTE";
    let estadoPedido: any = "PENDIENTE";
    let estadoPagoPedido: any = "PENDIENTE";

    switch (payment.status) {
      case 'approved':
        estadoPago = "APROBADO";
        estadoPedido = "PROCESANDO";  // Pedido listo para procesar
        estadoPagoPedido = "PAGADO";  // Pago confirmado
        console.log("✅ Pago aprobado");
        break;
      case 'pending':
      case 'in_process':
        estadoPago = "PENDIENTE";
        estadoPedido = "PENDIENTE";
        estadoPagoPedido = "PENDIENTE";
        console.log("⏳ Pago pendiente");
        break;
      case 'rejected':
        estadoPago = "RECHAZADO";
        estadoPedido = "CANCELADO";
        estadoPagoPedido = "RECHAZADO";
        console.log("❌ Pago rechazado");
        
        // Devolver stock si el pago fue rechazado
        if (pago.tbPedido.tbItems) {
          console.log("🔄 Devolviendo stock de productos...");
          await Promise.all(
            pago.tbPedido.tbItems.map((item: any) =>
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
          console.log("✅ Stock devuelto");
        }
        break;
      case 'cancelled':
        estadoPago = "CANCELADO";
        estadoPedido = "CANCELADO";
        estadoPagoPedido = "CANCELADO";
        console.log("🚫 Pago cancelado");
        
        // Devolver stock si el pago fue cancelado
        if (pago.tbPedido.tbItems) {
          console.log("🔄 Devolviendo stock de productos...");
          await Promise.all(
            pago.tbPedido.tbItems.map((item: any) =>
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
          console.log("✅ Stock devuelto");
        }
        break;
      case 'refunded':
        estadoPago = "REEMBOLSADO";
        estadoPedido = "CANCELADO";
        estadoPagoPedido = "REEMBOLSADO";
        console.log("💸 Pago reembolsado");
        
        // Devolver stock si el pago fue reembolsado
        if (pago.tbPedido.tbItems) {
          console.log("🔄 Devolviendo stock de productos...");
          await Promise.all(
            pago.tbPedido.tbItems.map((item: any) =>
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
          console.log("✅ Stock devuelto");
        }
        break;
      default:
        console.log("⚠️ Estado desconocido:", payment.status);
    }

    // Actualizar el pago en la base de datos
    const pagoActualizado = await db.tbPagos.update({
      where: { intPago: pago.intPago },
      data: {
        strEstado: estadoPago,
        strMercadoPagoId: paymentId.toString(),
        jsonRespuestaMercadoPago: JSON.stringify(payment),
      },
    });

    console.log("💾 Pago actualizado en BD");

    // Actualizar el estado del pedido
    await db.tbPedidos.update({
      where: { intPedido: pago.intPedido },
      data: { 
        strEstado: estadoPedido,
        strEstadoPago: estadoPagoPedido
      },
    });

    console.log("💾 Pedido actualizado en BD");
    console.log("🎉 Webhook procesado exitosamente");

    return NextResponse.json({ 
      success: true,
      message: 'Webhook procesado correctamente',
      paymentId: paymentId,
      status: payment.status,
      estadoPago: estadoPago,
      estadoPedido: estadoPedido,
      estadoPagoPedido: estadoPagoPedido
    });

  } catch (error: any) {
    console.error("❌ Error procesando webhook:", error);
    console.error("Stack trace:", error.stack);
    
    return NextResponse.json({ 
      error: 'Error procesando webhook',
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Endpoint GET para verificar que el webhook está activo
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Webhook de Mercado Pago está activo',
    timestamp: new Date().toISOString()
  });
}
