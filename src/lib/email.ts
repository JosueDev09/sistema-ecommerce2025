import nodemailer from 'nodemailer';

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
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

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE CLIENTE - DISEÑO LUXURY (Inspirado en Prada, LV, Gucci, Gymshark)
// ═══════════════════════════════════════════════════════════════════════════════
function templateEmailCliente(pedido: any) {
  const fechaPedido = new Date(pedido.datPedido).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const productosHTML = pedido.tbItems?.map((item: any) => `
    <tr>
      <td style="padding: 32px 0; border-bottom: 0.5px solid rgba(0, 0, 0, 0.05); vertical-align: middle;">
        <table cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="width: 80px; padding-right: 20px; vertical-align: middle;">
              ${item.tbProducto?.strImagen ? 
                `<img src="${item.tbProducto.strImagen}" alt="${item.tbProducto?.strNombre || 'Producto'}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 2px; display: block;">` : 
                `<div style="width: 80px; height: 80px; background-color: #F5F5F5; border-radius: 2px; display: flex; align-items: center; justify-content: center;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#CCCCCC" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="#999999" stroke-width="2" fill="none"/>
                    <path d="M3 13L8 8L13 13M13 13L16 10L21 15" stroke="#999999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  </svg>
                </div>`
              }
            </td>
            <td style="vertical-align: middle;">
              <div style="font-weight: 500; font-size: 16px; margin-bottom: 8px; color: #000000; line-height: 1.4;">
                ${item.tbProducto?.strNombre || 'Producto'}
              </div>
              ${item.strTalla || item.strColor ? `
                <div style="font-size: 12px; color: #6B7280; letter-spacing: 0.05em; line-height: 1.5;">
                  ${item.strTalla ? `<span>Talla: <strong style="color: #4B5563;">${item.strTalla}</strong></span>` : ''}
                  ${item.strTalla && item.strColor ? '<span style="margin: 0 8px;">•</span>' : ''}
                  ${item.strColor ? `<span>Color: <strong style="color: #4B5563;">${item.strColor}</strong></span>` : ''}
                </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
      <td style="padding: 32px 0 32px 16px; border-bottom: 0.5px solid rgba(0, 0, 0, 0.05); color: #9CA3AF; text-transform: uppercase; font-size: 14px; vertical-align: middle;">
        ${item.strTalla || 'OS'}
      </td>
      <td style="padding: 32px 0 32px 16px; border-bottom: 0.5px solid rgba(0, 0, 0, 0.05); color: #9CA3AF; text-align: center; font-size: 14px; vertical-align: middle;">
        ${String(item.intCantidad).padStart(2, '0')}
      </td>
      <td style="padding: 32px 0; border-bottom: 0.5px solid rgba(0, 0, 0, 0.05); text-align: right; font-weight: 500; color: #000000; font-size: 14px; vertical-align: middle;">
        $${(item.dblSubtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - ESYMBEL</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@300;400;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Noto Serif', Georgia, serif; background-color: #FAFAFA; color: #4B5563; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #FFFFFF;">
        
        <!-- Header -->
        <div style="background-color: #FFFFFF; padding: 48px 80px; border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="#265159" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
            </svg>
            <h2 style="font-size: 20px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #000000; margin: 0;">ESYMBEL</h2>
          </div>
        </div>
        
        <!-- Hero Section -->
        <div style="text-align: center; padding: 96px 80px;">
          <h1 style="font-size: 48px; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #000000;">
            Selección Asegurada
          </h1>
          <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #9CA3AF; margin: 0;">
            Orden No. ES-${String(pedido.intPedido).padStart(10, '0')}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 80px 64px;">
          
          <!-- Greeting -->
          <p style="font-size: 18px; line-height: 1.8; font-weight: 300; color: #1F2937; margin: 0 0 32px 0;">
            Gracias por elegir ESYMBEL. Tu pedido ha sido recibido y actualmente está siendo preparado para su envío. Te notificaremos tan pronto como tu selección esté en camino.
          </p>
          <div style="width: 96px; height: 1px; background-color: #265159; margin: 32px 0 64px 0;"></div>
          
          <!-- Order Summary -->
          <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #9CA3AF; margin: 0 0 32px 0;">
            Resumen del Pedido
          </h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 64px;">
            <thead>
              <tr style="border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);">
                <th style="text-align: left; padding: 16px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; font-weight: 500;">
                  Selección de Artículos
                </th>
                <th style="text-align: left; padding: 16px 0 16px 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; font-weight: 500;">
                  Talla
                </th>
                <th style="text-align: center; padding: 16px 0 16px 16px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; font-weight: 500;">
                  Ctd
                </th>
                <th style="text-align: right; padding: 16px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; font-weight: 500;">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 80px;">
            <div style="width: 50%; min-width: 300px;">
              <table cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; vertical-align: middle;">
                    Subtotal
                  </td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 300; color: #1F2937; vertical-align: middle;">
                    $${(pedido.dblSubtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #6B7280; vertical-align: middle;">
                    Envío
                  </td>
                  <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 300; color: #1F2937; vertical-align: middle;">
                    $${(pedido.dblCostoEnvio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 16px 0 0 0;">
                    <div style="border-top: 0.5px solid rgba(0, 0, 0, 0.1); padding-top: 16px;">
                      <table cellpadding="0" cellspacing="0" style="width: 100%;">
                        <tr>
                          <td style="font-weight: 700; font-size: 12px; color: #000000; text-transform: uppercase; letter-spacing: 0.2em; vertical-align: middle;">
                            Total
                          </td>
                          <td style="text-align: right; font-weight: 700; font-size: 18px; color: #265159; vertical-align: middle;">
                            $${(pedido.dblTotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Info Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; margin-bottom: 80px;">
            <div>
              <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #9CA3AF; margin: 0 0 16px 0;">
                Destino de Envío
              </h4>
              <address style="font-style: normal; font-size: 14px; font-weight: 300; line-height: 1.8; color: #4B5563;">
                ${pedido.tbClientes?.strNombre || 'Cliente'}<br>
                ${pedido.tbDirecciones ? `
                  ${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}<br>
                  ${pedido.tbDirecciones.strColonia}<br>
                  ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado}<br>
                  C.P. ${pedido.tbDirecciones.strCP}
                ` : 'Dirección no disponible'}
              </address>
            </div>
            <div>
              <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #9CA3AF; margin: 0 0 16px 0;">
                Próximos Pasos
              </h4>
              <p style="font-size: 14px; font-weight: 300; line-height: 1.8; color: #4B5563; margin: 0;">
                Tu selección está siendo autenticada y empacada actualmente. Recibirás un email con tu número de rastreo dentro de 24 horas.
              </p>
            </div>
          </div>
        </div>
        
        <!-- CTA Section -->
        <div style="text-align: center; padding: 0 80px 96px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/pedidos/${pedido.intPedido}" 
             style="display: inline-block; padding: 16px 48px; border: 1px solid #000000; color: #000000; text-decoration: none; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; font-weight: 700; background: #FFFFFF; margin-bottom: 32px;">
            Ver Estado del Pedido
          </a>
          <br>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" 
             style="display: inline-block; text-decoration: underline; text-underline-offset: 8px; text-decoration-color: #265159; color: #000000; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">
            Volver a la Boutique
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background-color: rgba(0, 0, 0, 0.05); padding: 64px 80px;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-bottom: 64px;">
            <div>
              <h2 style="font-size: 14px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 24px 0; color: #000000;">
                ESYMBEL
              </h2>
              <p style="font-size: 12px; line-height: 1.6; font-weight: 300; color: #6B7280; margin: 0;">
                Redefiniendo la elegancia moderna a través de precisión arquitectónica y artesanía atemporal.
              </p>
            </div>
            <div>
              <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #9CA3AF; margin: 0 0 16px 0;">
                Asistencia
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Servicio al Cliente</a>
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Envíos y Devoluciones</a>
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Cuidado del Producto</a>
              </div>
            </div>
            <div>
              <h4 style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; color: #9CA3AF; margin: 0 0 16px 0;">
                Conectar
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Instagram</a>
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Editorial</a>
                <a href="#" style="font-size: 12px; font-weight: 300; color: #6B7280; text-decoration: none;">Localizador de Tiendas</a>
              </div>
            </div>
          </div>
          
          <div style="padding-top: 32px; border-top: 0.5px solid rgba(0, 0, 0, 0.1); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #9CA3AF; margin: 0;">
              © 2024 ESYMBEL. TODOS LOS DERECHOS RESERVADOS.
            </p>
            <div style="display: flex; gap: 24px;">
              <a href="#" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #9CA3AF; text-decoration: none;">Política de Privacidad</a>
              <a href="#" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #9CA3AF; text-decoration: none;">Términos de Servicio</a>
            </div>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE ACTUALIZACIÓN DE ESTADO - DISEÑO LUXURY
// ═══════════════════════════════════════════════════════════════════════════════
function templateActualizacionEstado(pedido: any, nuevoEstado: string) {

 // console.log('Generando template de actualización de estado para pedido:', pedido, 'Nuevo estado:', nuevoEstado);
  // Configuración por estado
  const estadosConfig: { [key: string]: { 
    icon: string, 
    title: string, 
    subtitle: string,
    progressWidth: string,
    steps: { label: string, active: boolean }[]
  }} = {
    'PENDIENTE': {
      icon: 'schedule',
      title: 'Tu pedido está pendiente',
      subtitle: 'Esperando confirmación de pago',
      progressWidth: '0%',
      steps: [
        { label: 'Confirmado', active: false },
        { label: 'Procesando', active: false },
        { label: 'Enviado', active: false },
        { label: 'Entregado', active: false }
      ]
    },
    'PROCESANDO': {
      icon: 'inventory_2',
      title: 'Tu pedido está siendo preparado',
      subtitle: 'Fecha estimada de llegada: ' + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' }),
      progressWidth: '50%',
      steps: [
        { label: 'Confirmado', active: true },
        { label: 'Procesando', active: true },
        { label: 'Enviado', active: false },
        { label: 'Entregado', active: false }
      ]
    },
    'EMPAQUETANDO': {
      icon: 'package_2',
      title: 'Tu pedido está siendo empaquetado',
      subtitle: 'Pronto estará listo para envío',
      progressWidth: '60%',
      steps: [
        { label: 'Confirmado', active: true },
        { label: 'Procesando', active: true },
        { label: 'Enviado', active: false },
        { label: 'Entregado', active: false }
      ]
    },
    'ENVIADO': {
      icon: 'local_shipping',
      title: 'Tu pedido está en camino',
      subtitle: pedido.strNumeroSeguimiento ? `Número de rastreo: ${pedido.strNumeroSeguimiento}` : 'Recibirás el número de rastreo pronto',
      progressWidth: '75%',
      steps: [
        { label: 'Confirmado', active: true },
        { label: 'Procesando', active: true },
        { label: 'Enviado', active: true },
        { label: 'Entregado', active: false }
      ]
    },
    'ENTREGADO': {
      icon: 'check_circle',
      title: 'Tu pedido ha sido entregado',
      subtitle: 'Gracias por tu compra',
      progressWidth: '100%',
      steps: [
        { label: 'Confirmado', active: true },
        { label: 'Procesando', active: true },
        { label: 'Enviado', active: true },
        { label: 'Entregado', active: true }
      ]
    },
    'CANCELADO': {
      icon: 'cancel',
      title: 'Tu pedido ha sido cancelado',
      subtitle: 'El reembolso se procesará en 3-5 días hábiles',
      progressWidth: '0%',
      steps: [
        { label: 'Confirmado', active: false },
        { label: 'Procesando', active: false },
        { label: 'Enviado', active: false },
        { label: 'Entregado', active: false }
      ]
    }
  };

  const config = estadosConfig[nuevoEstado] || estadosConfig['PROCESANDO'];

  const emojiMap: { [key: string]: string } = {
    'schedule': '🕐',
    'inventory_2': '📦',
    'package_2': '📦',
    'local_shipping': '🚚',
    'check_circle': '✅',
    'cancel': '❌'
  };

  const productosHTML = pedido.tbItems?.map((item: any) => `
    <tr>
      <td style="padding: 0 0 48px 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="width: 180px; padding-right: 32px; vertical-align: top;">
              ${item.tbProducto?.strImagen ? 
                `<img src="${item.tbProducto.strImagen}" alt="${item.tbProducto?.strNombre || 'Producto'}" style="width: 180px; height: 180px; display: block; background-color: #fcfcfc;">` : 
                `<div style="width: 180px; height: 180px; background-color: #f5f5f5;"></div>`
              }
            </td>
            <td style="vertical-align: top;">
              <h4 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #131516; margin: 0 0 8px 0; line-height: 1.4; font-family: Arial, sans-serif;">
                ${item.tbProducto?.strNombre || 'Producto'}
              </h4>
              <p style="font-size: 10px; color: #8c8c8c; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px 0; line-height: 1.5; font-family: Arial, sans-serif;">
                ${item.strColor || 'Color Único'}${item.strTalla ? ` / ${item.strTalla}` : ' / Talla Única'}
              </p>
              <p style="font-size: 14px; font-weight: 300; color: #131516; margin: 0; line-height: 1.4; font-family: Arial, sans-serif;">
                $${(item.dblSubtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Pedido - ESYMBEL</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #ffffff; color: #131516;">
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px; border-bottom: 1px solid rgba(19, 21, 22, 0.1);">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-right: 16px; vertical-align: middle;">
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="#131516" xmlns="http://www.w3.org/2000/svg">
                          <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                        </svg>
                      </td>
                      <td style="vertical-align: middle;">
                        <h2 style="font-size: 20px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; margin: 0; font-family: Georgia, serif;">ESYMBEL</h2>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 64px 40px;">
                  
                  <!-- Icon -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <div style="font-size: 72px; line-height: 1;">${emojiMap[config.icon] || '📦'}</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Number -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 16px;">
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #8c8c8c; margin: 0; font-family: Arial, sans-serif;">
                          Order #ES-${String(pedido.intPedido).padStart(6, '0')}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Title -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 16px;">
                        <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 400; color: #131516; margin: 0; line-height: 1.2;">
                          ${config.title}
                        </h1>
                      </td>
                    </tr>
                  </table>

                  <!-- Subtitle -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 48px;">
                        <p style="font-size: 13px; font-weight: 400; color: #8c8c8c; margin: 0; line-height: 1.5; font-family: Arial, sans-serif;">
                          ${config.subtitle}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Progress Bar -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding: 0 0 16px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="height: 2px;">
                          <tr>
                            <td width="${config.progressWidth}" style="background-color: #131516; height: 2px;"></td>
                            <td style="background-color: rgba(19, 21, 22, 0.1); height: 2px;"></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Steps -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      ${config.steps.map(step => `
                        <td width="25%" align="center" style="padding-bottom: 64px;">
                          <p style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: ${step.active ? '#131516' : '#8c8c8c'}; margin: 0; font-family: Arial, sans-serif;">
                            ${step.label}
                          </p>
                        </td>
                      `).join('')}
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding-bottom: 64px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/pedidos/${pedido.intPedido}" 
                           style="background-color: #131516; color: #ffffff; padding: 18px 60px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; text-decoration: none; display: inline-block; font-family: Arial, sans-serif;">
                          VER DETALLES
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Products Title -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 32px 0; border-top: 1px solid rgba(19, 21, 22, 0.05);">
                        <h3 style="font-family: Georgia, serif; font-size: 18px; color: #131516; margin: 0;">
                          Tu Selección
                        </h3>
                      </td>
                    </tr>
                  </table>

                  <!-- Products -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${productosHTML}
                  </table>

                  <!-- Totals -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-top: 40px; border-top: 1px solid rgba(19, 21, 22, 0.05);">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 400px; margin: 0 auto;">
                          <tr>
                            <td style="padding: 12px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8c8c8c; font-family: Arial, sans-serif;">
                              Subtotal
                            </td>
                            <td align="right" style="padding: 12px 0; font-size: 12px; font-weight: 400; color: #131516; font-family: Arial, sans-serif;">
                              $${(pedido.dblSubtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #8c8c8c; font-family: Arial, sans-serif;">
                              Envío
                            </td>
                            <td align="right" style="padding: 12px 0; font-size: 12px; font-weight: 400; color: #131516; font-family: Arial, sans-serif;">
                              ${pedido.dblCostoEnvio === 0 ? 'Gratis' : '$' + (pedido.dblCostoEnvio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top: 24px; border-top: 1px solid rgba(19, 21, 22, 0.05);">
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td style="padding: 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; color: #131516; font-family: Arial, sans-serif;">
                                    Total
                                  </td>
                                  <td align="right" style="padding: 16px 0; font-size: 18px; font-weight: 700; color: #131516; font-family: Arial, sans-serif;">
                                    $${(pedido.dblTotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 48px 40px; border-top: 1px solid rgba(19, 21, 22, 0.05);">
                  <p style="font-family: Georgia, serif; font-style: italic; font-size: 16px; color: #131516; margin: 0 0 24px 0;">
                    Servicio al Cliente
                  </p>
                  <p style="font-size: 10px; color: #8c8c8c; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                    ${process.env.SMTP_USER || 'support@esymbel.com'}
                  </p>
                  <p style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.2em; color: #8c8c8c; margin: 0; font-family: Arial, sans-serif;">
                    © 2024 ESYMBEL INTERNATIONAL
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `;
}

// Exportar funciones (mantener las existentes por compatibilidad)
export async function enviarEmailsConfirmacion(pedido: any): Promise<{
  emailCliente: boolean;
  emailAdmin: boolean;
}> {
  try {
    const [emailCliente, emailAdmin] = await Promise.all([
      // Email al cliente
      transporter.sendMail({
        from: `"ESYMBEL" <${process.env.SMTP_USER}>`,
        to: pedido.tbClientes?.strEmail,
        subject: `✨ Tu pedido #${pedido.intPedido} ha sido confirmado - ESYMBEL`,
        html: templateEmailCliente(pedido),
      }).then(() => true).catch((error) => {
        console.error('Error enviando email al cliente:', error);
        return false;
      }),

      // Email al admin
      transporter.sendMail({
        from: `"ESYMBEL" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `🛍️ Nuevo pedido #${pedido.intPedido} - ESYMBEL`,
        html: templateEmailCliente(pedido), // Por ahora usar el mismo template
      }).then(() => true).catch((error) => {
        console.error('Error enviando email al admin:', error);
        return false;
      }),
    ]);

    console.log('📊 Resultado de envío de emails:');
    console.log('  - Cliente:', emailCliente ? '✅' : '❌');
    console.log('  - Admin:', emailAdmin ? '✅' : '❌');

    return {
      emailCliente,
      emailAdmin,
    };
  } catch (error) {
    console.error('Error en enviarEmailsConfirmacion:', error);
    return {
      emailCliente: false,
      emailAdmin: false,
    };
  }
}

export async function enviarEmailActualizacionEstado(pedido: any, nuevoEstado: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"ESYMBEL" <${process.env.SMTP_USER}>`,
      to: pedido.tbClientes?.strEmail,
      subject: `📦 Actualización de tu pedido #${pedido.intPedido} - ${nuevoEstado}`,
      html: templateActualizacionEstado(pedido, nuevoEstado),
    });

    console.log(`✅ Email de actualización enviado para pedido #${pedido.intPedido}`);
    return true;
  } catch (error) {
    console.error('Error enviando email de actualización:', error);
    return false;
  }
}

export {
  templateEmailCliente,
  templateActualizacionEstado,
};
