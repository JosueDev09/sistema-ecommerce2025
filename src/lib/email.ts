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
  const fechaPedido = new Date(pedido.datPedido).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Confirmación de Pedido</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f6f6f8; }
        .container { max-width: 960px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 40px; margin: 20px 0; }
        .header { text-align: center; padding: 24px 16px; }
        .logo { display: inline-flex; align-items: center; gap: 12px; }
        .logo-icon { width: 36px; height: 36px; background: #10b981; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
        .logo-text { font-size: 20px; font-weight: bold; color: #111318; }
        h1 { font-size: 32px; font-weight: bold; color: #111318; margin: 24px 16px 12px; }
        .subtitle { color: #636f88; font-size: 16px; line-height: 1.5; padding: 4px 16px 12px; }
        .success-badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 16px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 16px 32px; }
        .button:hover { background: #059669; }
        .section-title { font-size: 18px; font-weight: bold; color: #111318; padding: 16px 16px 8px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); padding: 16px; }
        .info-item { padding: 16px 8px; border-top: 1px solid #dcdfe5; }
        .info-label { color: #636f88; font-size: 14px; margin-bottom: 4px; }
        .info-value { color: #111318; font-size: 14px; font-weight: bold; }
        .info-value-normal { color: #111318; font-size: 14px; }
        .items-container { padding: 12px 16px; }
        .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
        .item-row:last-child { border-bottom: none; }
        .item-info { display: flex; gap: 16px; align-items: center; }
        .item-image { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; background: #f3f4f6; }
        .item-name { font-weight: 600; color: #111318; font-size: 14px; }
        .item-sku { color: #636f88; font-size: 12px; margin-top: 4px; }
        .item-quantity { text-align: center; color: #111318; font-size: 14px; }
        .item-price { text-align: right; color: #111318; font-size: 14px; font-weight: 500; }
        .totals { margin: 32px 16px 0; max-width: 400px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 12px 0; }
        .total-label { color: #636f88; font-size: 14px; }
        .total-value { color: #111318; font-size: 14px; }
        .total-final { border-top: 1px solid #dcdfe5; margin-top: 8px; padding-top: 12px; }
        .total-final .total-label { color: #111318; font-size: 16px; font-weight: bold; }
        .total-final .total-value { color: #111318; font-size: 18px; font-weight: bold; }
        .info-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 24px 16px; }
        .footer { text-align: center; padding: 16px; color: #636f88; font-size: 12px; }
        .footer a { color: #10b981; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .card { padding: 24px; }
          .info-grid { grid-template-columns: 1fr; }
          .item-row { grid-template-columns: 1fr; gap: 8px; }
          .item-quantity, .item-price { text-align: left; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">✓</div>
            <span class="logo-text">ESYMBEL STORE</span>
          </div>
        </div>

        <div class="card">
          <div style="text-align: center;">
            <span class="success-badge">✓ Pedido Confirmado</span>
          </div>
          
          <h1>¡Gracias por tu compra, ${pedido.tbClientes?.strNombre?.split(' ')[0] || 'Cliente'}!</h1>
          <p class="subtitle">
            Tu pedido ha sido confirmado y está siendo procesado. Te enviaremos una notificación cuando esté en camino.
          </p>

          <div style="padding: 12px 16px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/pedidos/${pedido.intPedido}" class="button">
              Ver Detalles del Pedido
            </a>
          </div>

          <h3 class="section-title">Información del Pedido</h3>
          
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">Número de Pedido</p>
              <p class="info-value">#${pedido.intPedido}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Fecha</p>
              <p class="info-value-normal">${fechaPedido}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Estado</p>
              <p class="info-value">${pedido.strEstado}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Método de Envío</p>
              <p class="info-value-normal">${pedido.strMetodoEnvio === 'express' ? 'Envío Express' : pedido.strMetodoEnvio === 'estandar' ? 'Envío Estándar' : 'Recoger en Tienda'}</p>
            </div>
            ${pedido.tbDirecciones ? `
              <div class="info-item" style="grid-column: 1 / -1;">
                <p class="info-label">Dirección de Envío</p>
                <p class="info-value-normal">
                  ${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}${pedido.tbDirecciones.strNumeroInterior ? ` Int. ${pedido.tbDirecciones.strNumeroInterior}` : ''}, 
                  ${pedido.tbDirecciones.strColonia}, 
                  ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado} ${pedido.tbDirecciones.strCP}
                </p>
              </div>
            ` : ''}
          </div>

          <h3 class="section-title" style="margin-top: 32px;">Artículos Comprados</h3>

          <div class="items-container">
            ${pedido.tbItems.map((item: any) => `
              <div class="item-row">
                <div class="item-info">
                  <img 
                    class="item-image" 
                    src="${item.tbProducto.strImagen || 'https://via.placeholder.com/64'}" 
                    alt="${item.tbProducto.strNombre}"
                    onerror="this.src='https://via.placeholder.com/64?text=Imagen'"
                  />
                  <div>
                    <p class="item-name">${item.tbProducto.strNombre}</p>
                    <p class="item-sku">SKU: ${item.tbProducto.strSKU || 'N/A'}</p>
                  </div>
                </div>
                <div class="item-quantity">${item.intCantidad}</div>
                <div class="item-price">$${item.dblSubtotal.toFixed(2)} MXN</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">$${(pedido.dblSubtotal || 0).toFixed(2)} MXN</span>
            </div>
            <div class="total-row">
              <span class="total-label">Envío</span>
              <span class="total-value">$${(pedido.dblCostoEnvio || 0).toFixed(2)} MXN</span>
            </div>
            <div class="total-row total-final">
              <span class="total-label">Total Pagado</span>
              <span class="total-value">$${pedido.dblTotal.toFixed(2)} MXN</span>
            </div>
          </div>

          <div class="info-box">
            <p style="color: #166534; font-weight: 600; margin-bottom: 8px;">📦 ¿Qué sigue?</p>
            <p style="color: #166534; font-size: 14px; line-height: 1.6;">
              Estamos preparando tu pedido. Recibirás un correo de confirmación cuando sea enviado con el número de rastreo. 
              Puedes seguir el estado de tu pedido en cualquier momento desde tu cuenta.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/cuenta">Accede a tu cuenta</a> para ver todos tus pedidos.
          </p>
          <p style="margin-top: 8px;">
            ¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@esymbelstore.com">soporte@esymbelstore.com</a>
          </p>
          <p style="margin-top: 12px;">© ${new Date().getFullYear()} ESYMBEL STORE. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template de email para el administrador
function templateEmailAdmin(pedido: any) {
  const fechaPedido = new Date(pedido.datPedido).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Nueva Orden Recibida</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f6f6f8; }
        .container { max-width: 960px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 40px; margin: 20px 0; }
        .header { text-align: center; padding: 24px 16px; }
        .logo { display: inline-flex; align-items: center; gap: 12px; }
        .logo-icon { width: 36px; height: 36px; background: #306ee8; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
        .logo-text { font-size: 20px; font-weight: bold; color: #111318; }
        h1 { font-size: 32px; font-weight: bold; color: #111318; margin: 24px 16px 12px; }
        .subtitle { color: #636f88; font-size: 16px; line-height: 1.5; padding: 4px 16px 12px; }
        .button { display: inline-block; background: #306ee8; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 16px 32px; }
        .button:hover { background: #2557c7; }
        .section-title { font-size: 18px; font-weight: bold; color: #111318; padding: 16px 16px 8px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); padding: 16px; }
        .info-item { padding: 16px 8px; border-top: 1px solid #dcdfe5; }
        .info-label { color: #636f88; font-size: 14px; margin-bottom: 4px; }
        .info-value { color: #111318; font-size: 14px; font-weight: bold; }
        .info-value-normal { color: #111318; font-size: 14px; }
        .items-container { padding: 12px 16px; }
        .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6; }
        .item-row:last-child { border-bottom: none; }
        .item-info { display: flex; gap: 16px; align-items: center; }
        .item-image { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; background: #f3f4f6; }
        .item-name { font-weight: 600; color: #111318; font-size: 14px; }
        .item-sku { color: #636f88; font-size: 12px; margin-top: 4px; }
        .item-quantity { text-align: center; color: #111318; font-size: 14px; }
        .item-price { text-align: right; color: #111318; font-size: 14px; font-weight: 500; }
        .totals { margin: 32px 16px 0; max-width: 400px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 12px 0; }
        .total-label { color: #636f88; font-size: 14px; }
        .total-value { color: #111318; font-size: 14px; }
        .total-final { border-top: 1px solid #dcdfe5; margin-top: 8px; padding-top: 12px; }
        .total-final .total-label { color: #111318; font-size: 16px; font-weight: bold; }
        .total-final .total-value { color: #111318; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; padding: 16px; color: #636f88; font-size: 12px; }
        .footer a { color: #306ee8; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .card { padding: 24px; }
          .info-grid { grid-template-columns: 1fr; }
          .item-row { grid-template-columns: 1fr; gap: 8px; }
          .item-quantity, .item-price { text-align: left; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">🛍️</div>
            <span class="logo-text">ESYMBEL STORE</span>
          </div>
        </div>

        <div class="card">
          <h1>¡Has recibido una nueva orden!</h1>
          <p class="subtitle">
            Se ha realizado un nuevo pedido en tu tienda. Revisa los detalles a continuación y prepárate para el procesamiento.
          </p>

          <div style="padding: 12px 16px;">
            <a href="${process.env.BACKEND_URL || 'http://localhost:3000'}/admin/pedidos/${pedido.intPedido}" class="button">
              Ver Orden Completa
            </a>
          </div>

          <h3 class="section-title">Información de Orden y Cliente</h3>
          
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">Número de Orden</p>
              <p class="info-value">#${pedido.intPedido}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Fecha de Orden</p>
              <p class="info-value-normal">${fechaPedido}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Nombre del Cliente</p>
              <p class="info-value">${pedido.tbClientes?.strNombre || 'Cliente'}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Email de Contacto</p>
              <p class="info-value-normal">${pedido.tbClientes?.strEmail || 'No proporcionado'}</p>
            </div>
            ${pedido.tbDirecciones ? `
              <div class="info-item" style="grid-column: 1 / -1;">
                <p class="info-label">Dirección de Envío</p>
                <p class="info-value-normal">
                  ${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}${pedido.tbDirecciones.strNumeroInterior ? ` Int. ${pedido.tbDirecciones.strNumeroInterior}` : ''}, 
                  ${pedido.tbDirecciones.strColonia}, 
                  ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado} ${pedido.tbDirecciones.strCP}
                </p>
              </div>
            ` : ''}
          </div>

          <h3 class="section-title" style="margin-top: 32px;">Artículos Comprados</h3>

          <div class="items-container">
            ${pedido.tbItems.map((item: any) => `
              <div class="item-row">
                <div class="item-info">
                  <img 
                    class="item-image" 
                    src="${item.tbProducto.jsonImagenes || 'https://via.placeholder.com/64'}" 
                    alt="${item.tbProducto.strNombre}"
                    onerror="this.src='https://via.placeholder.com/64?text=Imagen'"
                  />
                  <div>
                    <p class="item-name">${item.tbProducto.strNombre}</p>
                    <p class="item-sku">SKU: ${item.tbProducto.strSKU || 'N/A'}</p>
                  </div>
                </div>
                <div class="item-quantity">${item.intCantidad}</div>
                <div class="item-price">$${item.dblSubtotal.toFixed(2)} MXN</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">$${(pedido.dblSubtotal || 0).toFixed(2)} MXN</span>
            </div>
            <div class="total-row">
              <span class="total-label">Envío</span>
              <span class="total-value">$${(pedido.dblCostoEnvio || 0).toFixed(2)} MXN</span>
            </div>
            <div class="total-row total-final">
              <span class="total-label">Total</span>
              <span class="total-value">$${pedido.dblTotal.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>
            <a href="${process.env.BACKEND_URL || 'http://localhost:3000'}/admin">Inicia sesión en tu panel</a> para gestionar tu tienda.
          </p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} ESYMBEL STORE. Todos los derechos reservados.</p>
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
 // console.log('📬 Iniciando envío de emails de confirmación...');
  
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

// ===================================================================
// EMAILS DE ACTUALIZACIÓN DE ESTADO DEL PEDIDO
// ===================================================================

// Template para actualización de estado
function templateActualizacionEstado(pedido: any, estado: string) {
  const fechaActualizacion = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Configuración por estado
  const estadosConfig: Record<string, {
    color: string;
    icon: string;
    titulo: string;
    mensaje: string;
    accion?: string;
  }> = {
    PROCESANDO: {
      color: '#3b82f6',
      icon: '⚙️',
      titulo: 'Tu pedido está siendo procesado',
      mensaje: 'Hemos recibido tu pago y estamos preparando tu pedido. Pronto comenzaremos a empaquetarlo.',
      accion: 'Estamos verificando tu pago y preparando los productos.'
    },
    EMPAQUETANDO: {
      color: '#8b5cf6',
      icon: '📦',
      titulo: 'Tu pedido está siendo empaquetado',
      mensaje: 'Nuestro equipo está empaquetando cuidadosamente tus productos. ¡Pronto estará listo para envío!',
      accion: 'Empaquetando tus productos con cuidado.'
    },
    ENVIADO: {
      color: '#10b981',
      icon: '🚚',
      titulo: '¡Tu pedido ha sido enviado!',
      mensaje: 'Tu pedido está en camino. Recibirás tu paquete en los próximos días.',
      accion: 'Tu pedido está en tránsito hacia tu dirección.'
    },
    ENTREGADO: {
      color: '#059669',
      icon: '✅',
      titulo: '¡Tu pedido ha sido entregado!',
      mensaje: 'Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!',
      accion: 'Tu pedido ha sido entregado exitosamente.'
    },
    CANCELADO: {
      color: '#ef4444',
      icon: '❌',
      titulo: 'Tu pedido ha sido cancelado',
      mensaje: 'Lamentamos informarte que tu pedido ha sido cancelado. Si tienes dudas, contáctanos.',
      accion: 'El pedido fue cancelado.'
    }
  };

  const config = estadosConfig[estado] || estadosConfig.PROCESANDO;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Actualización de Pedido</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f6f6f8; }
        .container { max-width: 960px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 40px; margin: 20px 0; }
        .header { text-align: center; padding: 24px 16px; }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { font-size: 28px; font-weight: bold; color: #111318; margin: 16px 0; }
        .subtitle { color: #636f88; font-size: 16px; line-height: 1.5; margin: 8px 0 24px; }
        .status-badge { display: inline-block; background: ${config.color}20; color: ${config.color}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 16px 0; }
        .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { color: #636f88; font-size: 14px; }
        .info-value { color: #111318; font-weight: 600; font-size: 14px; }
        .button { display: inline-block; background: ${config.color}; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
        .footer { text-align: center; color: #636f88; font-size: 14px; padding: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="icon">${config.icon}</div>
            <h1>${config.titulo}</h1>
            <p class="subtitle">${config.mensaje}</p>
            <span class="status-badge">${estado}</span>
          </div>

          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Número de Pedido</span>
              <span class="info-value">#${pedido.intPedido}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha de Actualización</span>
              <span class="info-value">${fechaActualizacion}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estado Actual</span>
              <span class="info-value">${estado}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cliente</span>
              <span class="info-value">${pedido.tbClientes?.strNombre || 'Cliente'}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/pedidos" class="button">
              Ver Mi Pedido
            </a>
          </div>

          <div class="footer">
            <p>Este es un correo automático, por favor no respondas.</p>
            <p style="margin-top: 8px;">© 2025 ESYMBEL STORE. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enviar email de actualización de estado
export async function enviarEmailActualizacionEstado(pedido: any, nuevoEstado: string): Promise<boolean> {
  try {
    const clienteEmail = pedido.tbClientes?.strEmail;
    
    if (!clienteEmail) {
      console.warn('⚠️ No se encontró email del cliente para pedido #' + pedido.intPedido);
      return false;
    }

    // No enviar email para estado PENDIENTE (ya se envió al crear el pedido)
    if (nuevoEstado === 'PENDIENTE') {
      console.log('ℹ️ No se envía email para estado PENDIENTE');
      return true;
    }

    console.log(`📧 Enviando email de actualización de estado: ${nuevoEstado} a ${clienteEmail}`);

    const info = await transporter.sendMail({
      from: `"ESYMBEL STORE" <${process.env.SMTP_USER}>`,
      to: clienteEmail,
      subject: `Actualización de tu Pedido #${pedido.intPedido} - ${nuevoEstado}`,
      html: templateActualizacionEstado(pedido, nuevoEstado),
    });

    console.log(`✅ Email de actualización enviado: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error al enviar email de actualización:', error);
    return false;
  }
}
