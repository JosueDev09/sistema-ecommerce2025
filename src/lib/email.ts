import nodemailer from 'nodemailer';

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar configuración
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo');
  }
});

// Template de email para el cliente
function templateEmailCliente(pedido: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #3A6EA5; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .order-info { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-info h2 { margin-top: 0; color: #3A6EA5; }
        .items { margin: 20px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .item:last-child { border-bottom: none; }
        .total { font-size: 24px; font-weight: bold; color: #3A6EA5; text-align: right; margin-top: 20px; }
        .button { 
          display: inline-block; 
          padding: 15px 30px; 
          background: #3A6EA5; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Gracias por tu compra!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Tu pedido ha sido confirmado</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <h2>Pedido #${pedido.intPedido}</h2>
            <p><strong>Cliente:</strong> ${pedido.tbClientes.strNombre}</p>
            <p><strong>Email:</strong> ${pedido.tbClientes.strEmail}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.datPedido).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            ${pedido.strMetodoEnvio ? `<p><strong>Método de Envío:</strong> ${pedido.strMetodoEnvio}</p>` : ''}
          </div>

          <h3>Resumen del Pedido:</h3>
          <div class="items">
            ${pedido.tbItems.map((item: any) => `
              <div class="item">
                <strong>${item.tbProducto.strNombre}</strong><br>
                Cantidad: ${item.intCantidad} x $${item.dblPrecioUnitario.toFixed(2)} = $${item.dblSubtotal.toFixed(2)} MXN
              </div>
            `).join('')}
          </div>

          <div style="border-top: 2px solid #3A6EA5; padding-top: 20px; margin-top: 20px;">
            ${pedido.dblSubtotal ? `<p style="text-align: right;"><strong>Subtotal:</strong> $${pedido.dblSubtotal.toFixed(2)} MXN</p>` : ''}
            ${pedido.dblCostoEnvio ? `<p style="text-align: right;"><strong>Envío:</strong> $${pedido.dblCostoEnvio.toFixed(2)} MXN</p>` : ''}
            <p class="total">Total: $${pedido.dblTotal.toFixed(2)} MXN</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/pedidos/${pedido.intPedido}" class="button">
              Ver Detalles del Pedido
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Recibirás otra notificación cuando tu pedido sea enviado. 
            Puedes seguir el estado de tu pedido en cualquier momento desde tu cuenta.
          </p>
        </div>

        <div class="footer">
          <p><strong>ESYMBEL STORE</strong></p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
          <p>Si tienes dudas, contáctanos a soporte@esymbelstore.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template de email para el administrador
function templateEmailAdmin(pedido: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #dc2626; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { 
          display: inline-block; 
          padding: 15px 30px; 
          background: #dc2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nuevo Pedido Recibido</h1>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>⚠️ Acción Requerida:</strong> Un nuevo pedido necesita ser procesado.
          </div>

          <h2>Pedido #${pedido.intPedido}</h2>
          
          <div class="info-row">
            <strong>Cliente:</strong> ${pedido.tbClientes.strNombre}
          </div>
          <div class="info-row">
            <strong>Email:</strong> ${pedido.tbClientes.strEmail}
          </div>
          <div class="info-row">
            <strong>Teléfono:</strong> ${pedido.tbClientes.strTelefono || 'No proporcionado'}
          </div>
          <div class="info-row">
            <strong>Total:</strong> $${pedido.dblTotal.toFixed(2)} MXN
          </div>
          <div class="info-row">
            <strong>Estado:</strong> ${pedido.strEstado}
          </div>
          <div class="info-row">
            <strong>Método de Envío:</strong> ${pedido.strMetodoEnvio || 'Recoger en tienda'}
          </div>

          ${pedido.tbDirecciones ? `
            <h3>Dirección de Envío:</h3>
            <p>
              ${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}<br>
              ${pedido.tbDirecciones.strColonia}<br>
              ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado}<br>
              CP: ${pedido.tbDirecciones.strCP}
            </p>
          ` : ''}

          <h3>Productos:</h3>
          ${pedido.tbItems.map((item: any) => `
            <div style="padding: 10px; background: #f9f9f9; margin: 5px 0; border-radius: 5px;">
              <strong>${item.tbProducto.strNombre}</strong><br>
              Cantidad: ${item.intCantidad} | Precio: $${item.dblPrecioUnitario.toFixed(2)} | Subtotal: $${item.dblSubtotal.toFixed(2)}
            </div>
          `).join('')}

          <div style="text-align: center;">
            <a href="${process.env.BACKEND_URL}/admin/pedidos/${pedido.intPedido}" class="button">
              Ver en Panel de Administración
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enviar email al cliente
export async function enviarEmailCliente(pedido: any): Promise<boolean> {
  try {
    console.log('📧 Enviando email al cliente:', pedido.tbClientes.strEmail);

    const info = await transporter.sendMail({
      from: `"ESYMBEL STORE" <${process.env.SMTP_USER}>`,
      to: pedido.tbClientes.strEmail,
      subject: `Confirmación de Pedido #${pedido.intPedido} - ESYMBEL STORE`,
      html: templateEmailCliente(pedido),
    });

    console.log('✅ Email enviado al cliente:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Error al enviar email al cliente:', error);
    return false;
  }
}

// Enviar email al administrador
export async function enviarEmailAdmin(pedido: any): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!adminEmail) {
      console.warn('⚠️ No se configuró email de administrador');
      return false;
    }

    console.log('📧 Enviando email al administrador:', adminEmail);

    const info = await transporter.sendMail({
      from: `"ESYMBEL STORE - Sistema" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🔔 Nuevo Pedido #${pedido.intPedido} - Acción Requerida`,
      html: templateEmailAdmin(pedido),
    });

    console.log('✅ Email enviado al administrador:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ Error al enviar email al administrador:', error);
    return false;
  }
}

// Enviar ambos emails
export async function enviarEmailsConfirmacion(pedido: any): Promise<{
  emailCliente: boolean;
  emailAdmin: boolean;
}> {
  console.log('📬 Iniciando envío de emails de confirmación...');
  
  const [emailCliente, emailAdmin] = await Promise.all([
    enviarEmailCliente(pedido),
    enviarEmailAdmin(pedido),
  ]);

  console.log('📊 Resultado de envío de emails:');
  console.log('  - Cliente:', emailCliente ? '✅' : '❌');
  console.log('  - Admin:', emailAdmin ? '✅' : '❌');

  return {
    emailCliente,
    emailAdmin,
  };
}
