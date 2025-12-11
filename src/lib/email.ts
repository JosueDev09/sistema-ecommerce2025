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
// TEMPLATE CLIENTE - DISEÑO LUXURY (Inspirado en Prada, LV, Gucci)
// ═══════════════════════════════════════════════════════════════════════════════
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
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - ESYMBEL</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FFFFFF;
          padding: 0;
          line-height: 1.8;
          color: #666666;
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          background-color: #FFFFFF;
        }
        
        /* Header Minimalista Estilo LV/Prada */
        .header {
          background-color: #FFFFFF;
          padding: 60px 40px 40px;
          text-align: center;
          border-bottom: 1px solid #E5E5E5;
        }
        
        .logo {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
          letter-spacing: 0.35em;
          color: #000000;
          font-weight: 300;
          margin-bottom: 12px;
          text-transform: uppercase;
        }
        
        .header-subtitle {
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #999999;
          text-transform: uppercase;
          font-weight: 300;
        }
        
        /* Badge Estado Minimalista */
        .status-section {
          text-align: center;
          padding: 50px 40px 30px;
        }
        
        .status-badge {
          display: inline-block;
          border: 1px solid #000000;
          padding: 10px 30px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #000000;
          background: #FFFFFF;
          font-weight: 400;
        }
        
        .status-message {
          margin-top: 25px;
          font-size: 13px;
          color: #999999;
          letter-spacing: 0.05em;
        }
        
        /* Content con espaciado generoso estilo Gucci */
        .content {
          padding: 40px 60px;
        }
        
        .order-info {
          padding: 30px 0;
          border-top: 1px solid #E5E5E5;
          border-bottom: 1px solid #E5E5E5;
          margin-bottom: 50px;
        }
        
        .order-info h2 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 14px;
          margin-bottom: 25px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px 40px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          color: #999999;
          font-size: 10px;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-weight: 400;
          letter-spacing: 0.15em;
        }
        
        .info-value {
          color: #000000;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.02em;
        }
        
        /* Section Title Elegante */
        .section-title {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 14px;
          margin-bottom: 30px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding-bottom: 15px;
          border-bottom: 1px solid #E5E5E5;
        }
        
        /* Productos Minimalista */
        .products-list {
          margin-bottom: 50px;
        }
        
        .product-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 20px;
          padding: 25px 0;
          border-bottom: 1px solid #F5F5F5;
          align-items: center;
        }
        
        .product-item:first-child {
          border-top: 1px solid #F5F5F5;
        }
        
        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          background: #F5F5F5;
        }
        
        .product-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .product-name {
          color: #000000;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.03em;
        }
        
        .product-quantity {
          color: #999999;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        
        .product-price {
          color: #000000;
          font-size: 13px;
          font-weight: 400;
          text-align: right;
          letter-spacing: 0.05em;
        }
        
        /* Totales Elegantes */
        .totals {
          padding: 30px 0;
          border-top: 1px solid #E5E5E5;
          border-bottom: 1px solid #E5E5E5;
          margin-bottom: 50px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
        }
        
        .total-row.grand-total {
          margin-top: 15px;
          padding-top: 25px;
          border-top: 1px solid #000000;
        }
        
        .total-label {
          color: #999999;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        
        .total-value {
          color: #000000;
          font-weight: 400;
          font-size: 13px;
          letter-spacing: 0.05em;
        }
        
        .grand-total .total-label {
          color: #000000;
          font-size: 12px;
          font-weight: 400;
        }
        
        .grand-total .total-value {
          font-size: 16px;
          font-weight: 400;
        }
        
        /* Dirección Estilo Prada */
        .address-section {
          background-color: #FAFAFA;
          padding: 30px;
          margin-bottom: 50px;
        }
        
        .address-section h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 12px;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .address-content {
          color: #666666;
          font-size: 12px;
          line-height: 1.9;
          letter-spacing: 0.02em;
        }
        
        /* Botón Flat Luxury */
        .button-container {
          text-align: center;
          padding: 40px 0;
        }
        
        .button {
          display: inline-block;
          border: 1px solid #000000;
          padding: 16px 50px;
          color: #000000;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          background: #FFFFFF;
          transition: all 0.3s ease;
          font-weight: 400;
        }
        
        .button:hover {
          background: #000000;
          color: #FFFFFF;
        }
        
        /* Footer Discreto */
        .footer {
          background-color: #FAFAFA;
          padding: 50px 40px;
          text-align: center;
          border-top: 1px solid #E5E5E5;
        }
        
        .footer p {
          margin-bottom: 12px;
          color: #999999;
          font-size: 11px;
          letter-spacing: 0.05em;
          line-height: 1.8;
        }
        
        .footer-links {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #E5E5E5;
        }
        
        .footer-links a {
          color: #666666;
          text-decoration: none;
          margin: 0 20px;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
          color: #000000;
        }
        
        .footer-copyright {
          margin-top: 35px;
          color: #CCCCCC;
          font-size: 9px;
          letter-spacing: 0.1em;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 25px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .product-item {
            grid-template-columns: 60px 1fr;
            gap: 15px;
          }
          
          .product-image {
            width: 60px;
            height: 60px;
          }
          
          .product-price {
            grid-column: 2;
            text-align: left;
            margin-top: 8px;
          }
          
          .footer-links a {
            display: block;
            margin: 12px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Estilo LV -->
        <div class="header">
          <div class="logo">ESYMBEL</div>
          <div class="header-subtitle">Exclusive Fashion</div>
        </div>
        
        <!-- Status Badge Minimalista -->
        <div class="status-section">
          <div class="status-badge">Pedido Confirmado</div>
          <p class="status-message">Gracias por tu compra. Tu pedido ha sido recibido correctamente.</p>
        </div>
        
        <div class="content">
          <!-- Información del Pedido -->
          <div class="order-info">
            <h2>Detalles del Pedido</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Número de Orden</span>
                <span class="info-value">#${String(pedido.intPedido).padStart(6, '0')}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha</span>
                <span class="info-value">${fechaPedido}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cliente</span>
                <span class="info-value">${pedido.tbClientes?.strNombre || 'Cliente'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Correo Electrónico</span>
                <span class="info-value">${pedido.tbClientes?.strEmail || ''}</span>
              </div>
            </div>
          </div>
          
          <!-- Lista de Productos -->
          <h3 class="section-title">Artículos</h3>
          <div class="products-list">
            ${pedido.tbItems?.map((item: any) => `
              <div class="product-item">
                ${item.tbProducto?.strImagen ? 
                  `<img src="${item.tbProducto.strImagen}" alt="${item.tbProducto.strNombre}" class="product-image">` : 
                  '<div class="product-image"></div>'
                }
                <div class="product-details">
                  <div class="product-name">${item.tbProducto?.strNombre || 'Producto'}</div>
                  <div class="product-quantity">Cantidad: ${item.intCantidad}</div>
                </div>
                <div class="product-price">$${(item.dblSubtotal || 0).toFixed(2)}</div>
              </div>
            `).join('') || ''}
          </div>
          
          <!-- Totales -->
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">$${(pedido.dblSubtotal || 0).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Envío</span>
              <span class="total-value">$${(pedido.dblCostoEnvio || 0).toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total</span>
              <span class="total-value">$${(pedido.dblTotal || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <!-- Dirección de Envío -->
          <div class="address-section">
            <h3>Dirección de Envío</h3>
            <div class="address-content">
              ${pedido.tbDirecciones ? `
                <strong>${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}</strong><br>
                ${pedido.tbDirecciones.strColonia}<br>
                ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado}<br>
                C.P. ${pedido.tbDirecciones.strCP}
              ` : 'Dirección no disponible'}
            </div>
          </div>
          
          <!-- Botón CTA -->
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/pedidos/${pedido.intPedido}" class="button">Ver Estado del Pedido</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Recibirás una notificación cuando tu pedido sea enviado.</p>
          <p>Para cualquier consulta, nuestro equipo está a tu disposición.</p>
          
          <div class="footer-links">
            <a href="#">Envíos</a>
            <a href="#">Devoluciones</a>
            <a href="#">Contacto</a>
          </div>
          
          <p class="footer-copyright">
            © 2024 ESYMBEL. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE ADMIN - DISEÑO LUXURY PROFESIONAL
// ═══════════════════════════════════════════════════════════════════════════════
function templateEmailAdmin(pedido: any) {
  const fechaPedido = new Date(pedido.datPedido).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Orden - ESYMBEL Admin</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #F5F5F5;
          padding: 20px;
          line-height: 1.8;
          color: #666666;
        }
        
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #E5E5E5;
        }
        
        /* Header Admin con Badge Dorado */
        .header {
          background-color: #000000;
          padding: 40px;
          text-align: center;
          position: relative;
        }
        
        .logo {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          letter-spacing: 0.3em;
          color: #FFFFFF;
          font-weight: 300;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .header-subtitle {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #C9A961;
          text-transform: uppercase;
          font-weight: 300;
        }
        
        /* Badge Nueva Orden con Acento Dorado */
        .alert-badge {
          background-color: #000000;
          border: 2px solid #C9A961;
          color: #C9A961;
          padding: 12px 35px;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: inline-block;
          margin: -25px 0 0 0;
          font-weight: 500;
          position: relative;
          z-index: 10;
        }
        
        .alert-section {
          background-color: #FFFFFF;
          text-align: center;
          padding: 0 40px 40px;
        }
        
        .alert-message {
          margin-top: 20px;
          font-size: 13px;
          color: #666666;
        }
        
        .order-number-highlight {
          color: #000000;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        
        /* Content Admin */
        .content {
          padding: 40px 50px;
        }
        
        /* Info Cliente Destacada */
        .customer-section {
          background-color: #FAFAFA;
          border: 1px solid #E5E5E5;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .customer-section h2 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 13px;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .customer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .customer-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .customer-label {
          color: #999999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        
        .customer-value {
          color: #000000;
          font-size: 13px;
          font-weight: 400;
        }
        
        /* Order Details */
        .order-details {
          border-top: 1px solid #E5E5E5;
          border-bottom: 1px solid #E5E5E5;
          padding: 30px 0;
          margin-bottom: 40px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 12px;
        }
        
        .detail-label {
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 10px;
        }
        
        .detail-value {
          color: #000000;
          font-weight: 400;
        }
        
        /* Productos Admin */
        .products-section h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 13px;
          margin-bottom: 25px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .product-row {
          display: grid;
          grid-template-columns: 60px 2fr 1fr 1fr;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #F5F5F5;
          align-items: center;
        }
        
        .product-row:first-child {
          border-top: 1px solid #F5F5F5;
        }
        
        .product-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          background: #F5F5F5;
        }
        
        .product-name {
          color: #000000;
          font-size: 12px;
        }
        
        .product-qty {
          color: #666666;
          font-size: 11px;
          text-align: center;
        }
        
        .product-total {
          color: #000000;
          font-size: 12px;
          text-align: right;
          font-weight: 400;
        }
        
        /* Totales Admin */
        .admin-totals {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #E5E5E5;
        }
        
        .admin-total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
        }
        
        .admin-total-row.final {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #000000;
          font-size: 15px;
          font-weight: 500;
        }
        
        /* Botón Admin CTA */
        .admin-actions {
          text-align: center;
          padding: 50px 0 30px;
        }
        
        .admin-button {
          display: inline-block;
          background-color: #000000;
          color: #FFFFFF;
          padding: 16px 55px;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .admin-button:hover {
          background-color: #333333;
        }
        
        /* Footer Admin */
        .admin-footer {
          background-color: #FAFAFA;
          padding: 35px 40px;
          text-align: center;
          border-top: 1px solid #E5E5E5;
        }
        
        .admin-footer p {
          color: #999999;
          font-size: 10px;
          letter-spacing: 0.05em;
          line-height: 1.8;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 25px;
          }
          
          .customer-grid {
            grid-template-columns: 1fr;
          }
          
          .product-row {
            grid-template-columns: 50px 1fr;
            gap: 10px;
          }
          
          .product-qty, .product-total {
            grid-column: 2;
            text-align: left;
            margin-top: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header Admin Negro -->
        <div class="header">
          <div class="logo">ESYMBEL</div>
          <div class="header-subtitle">Administration Panel</div>
        </div>
        
        <!-- Alert Badge -->
        <div class="alert-section">
          <div class="alert-badge">Nueva Orden Recibida</div>
          <p class="alert-message">
            Se ha registrado una nueva orden 
            <span class="order-number-highlight">#${String(pedido.intPedido).padStart(6, '0')}</span>
            el ${fechaPedido}
          </p>
        </div>
        
        <div class="content">
          <!-- Información del Cliente -->
          <div class="customer-section">
            <h2>Información del Cliente</h2>
            <div class="customer-grid">
              <div class="customer-item">
                <span class="customer-label">Nombre Completo</span>
                <span class="customer-value">${pedido.tbClientes?.strNombre || 'N/A'}</span>
              </div>
              <div class="customer-item">
                <span class="customer-label">Correo Electrónico</span>
                <span class="customer-value">${pedido.tbClientes?.strEmail || 'N/A'}</span>
              </div>
              <div class="customer-item">
                <span class="customer-label">Teléfono</span>
                <span class="customer-value">${pedido.tbClientes?.strTelefono || 'N/A'}</span>
              </div>
              <div class="customer-item">
                <span class="customer-label">Método de Envío</span>
                <span class="customer-value">${pedido.strMetodoEnvio === 'express' ? 'Express' : pedido.strMetodoEnvio === 'estandar' ? 'Estándar' : 'Recoger en Tienda'}</span>
              </div>
            </div>
          </div>
          
          <!-- Detalles de la Orden -->
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Estado Actual</span>
              <span class="detail-value">${pedido.strEstado || 'PENDIENTE'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Dirección de Envío</span>
              <span class="detail-value">
                ${pedido.tbDirecciones ? 
                  `${pedido.tbDirecciones.strCalle} ${pedido.tbDirecciones.strNumeroExterior}, ${pedido.tbDirecciones.strColonia}, ${pedido.tbDirecciones.strCiudad}, ${pedido.tbDirecciones.strEstado} ${pedido.tbDirecciones.strCP}` 
                  : 'No especificada'
                }
              </span>
            </div>
          </div>
          
          <!-- Productos -->
          <div class="products-section">
            <h3>Artículos del Pedido</h3>
            ${pedido.tbItems?.map((item: any) => `
              <div class="product-row">
                ${item.tbProducto?.strImagen ? 
                  `<img src="${item.tbProducto.strImagen}" alt="${item.tbProducto.strNombre}" class="product-img">` :
                  '<div class="product-img"></div>'
                }
                <div class="product-name">${item.tbProducto?.strNombre || 'Producto'}</div>
                <div class="product-qty">Cant: ${item.intCantidad}</div>
                <div class="product-total">$${(item.dblSubtotal || 0).toFixed(2)}</div>
              </div>
            `).join('') || ''}
            
            <!-- Totales -->
            <div class="admin-totals">
              <div class="admin-total-row">
                <span>Subtotal:</span>
                <span>$${(pedido.dblSubtotal || 0).toFixed(2)}</span>
              </div>
              <div class="admin-total-row">
                <span>Envío:</span>
                <span>$${(pedido.dblCostoEnvio || 0).toFixed(2)}</span>
              </div>
              <div class="admin-total-row final">
                <span>TOTAL:</span>
                <span>$${(pedido.dblTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <!-- Botón Admin -->
          <div class="admin-actions">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/pedidos/${pedido.intPedido}" class="admin-button">
              Procesar Orden
            </a>
          </div>
        </div>
        
        <!-- Footer Admin -->
        <div class="admin-footer">
          <p>Sistema de Administración ESYMBEL</p>
          <p style="margin-top: 10px;">© 2024 ESYMBEL. Confidencial.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE ACTUALIZACIÓN ESTADO - DISEÑO LUXURY POR ESTADO
// ═══════════════════════════════════════════════════════════════════════════════
function templateActualizacionEstado(pedido: any, nuevoEstado: string) {
  const configuracionEstados: any = {
    PROCESANDO: {
      titulo: 'Estamos Preparando tu Pedido',
      icono: '◆',
      color: '#666666',
      mensaje: 'Tu pedido está siendo cuidadosamente preparado por nuestro equipo.',
      detalles: 'Verificamos cada artículo para asegurar la máxima calidad antes del envío.'
    },
    EMPAQUETANDO: {
      titulo: 'Tu Pedido Está Siendo Empaquetado',
      icono: '▪',
      color: '#333333',
      mensaje: 'Nuestro equipo está empaquetando tu pedido con el mayor cuidado.',
      detalles: 'Utilizamos materiales premium para garantizar que tu pedido llegue en perfecto estado.'
    },
    ENVIADO: {
      titulo: 'Tu Pedido Ha Sido Enviado',
      icono: '✦',
      color: '#000000',
      acento: '#C9A961',
      mensaje: 'Tu pedido está en camino. Recibirás actualizaciones de seguimiento.',
      detalles: 'Número de seguimiento: ' + (pedido.strNumeroSeguimiento || 'Se enviará próximamente')
    },
    ENTREGADO: {
      titulo: 'Tu Pedido Ha Sido Entregado',
      icono: '♦',
      color: '#2D5016',
      mensaje: 'Esperamos que disfrutes tu compra.',
      detalles: 'Gracias por confiar en ESYMBEL. Tu satisfacción es nuestra prioridad.'
    },
    CANCELADO: {
      titulo: 'Tu Pedido Ha Sido Cancelado',
      icono: '▫',
      color: '#999999',
      mensaje: 'Este pedido ha sido cancelado.',
      detalles: 'Si no solicitaste esta cancelación, por favor contáctanos de inmediato.'
    }
  };

  const config = configuracionEstados[nuevoEstado] || configuracionEstados.PROCESANDO;
  const fechaActualizacion = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de Pedido - ESYMBEL</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FFFFFF;
          padding: 0;
          line-height: 1.8;
          color: #666666;
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          background-color: #FFFFFF;
        }
        
        /* Header Simple */
        .header {
          background-color: #FFFFFF;
          padding: 50px 40px 30px;
          text-align: center;
          border-bottom: 1px solid #E5E5E5;
        }
        
        .logo {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          letter-spacing: 0.3em;
          color: #000000;
          font-weight: 300;
          text-transform: uppercase;
        }
        
        /* Icono Estado Grande y Minimalista */
        .status-hero {
          text-align: center;
          padding: 60px 40px;
          background-color: #FAFAFA;
        }
        
        .status-icon {
          font-size: 60px;
          color: ${config.color};
          margin-bottom: 30px;
          display: block;
          letter-spacing: 0;
        }
        
        .status-title {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }
        
        .status-message {
          color: #666666;
          font-size: 13px;
          letter-spacing: 0.03em;
          line-height: 1.9;
        }
        
        /* Content */
        .content {
          padding: 50px 60px;
        }
        
        /* Timeline Minimalista */
        .timeline {
          position: relative;
          padding: 40px 0;
          border-top: 1px solid #E5E5E5;
          border-bottom: 1px solid #E5E5E5;
          margin-bottom: 40px;
        }
        
        .timeline-item {
          padding: 20px 0;
          position: relative;
        }
        
        .timeline-date {
          color: #999999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 8px;
        }
        
        .timeline-text {
          color: #000000;
          font-size: 12px;
          letter-spacing: 0.02em;
        }
        
        /* Order Summary Compacto */
        .order-summary {
          background-color: #FAFAFA;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .order-summary h3 {
          font-family: Georgia, 'Times New Roman', serif;
          color: #000000;
          font-size: 12px;
          margin-bottom: 20px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 12px;
        }
        
        .summary-label {
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 10px;
        }
        
        .summary-value {
          color: #000000;
        }
        
        /* Tracking Box (solo para ENVIADO) */
        .tracking-box {
          background-color: #000000;
          color: #FFFFFF;
          padding: 30px;
          text-align: center;
          margin-bottom: 40px;
        }
        
        .tracking-label {
          color: ${config.acento || '#C9A961'};
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 15px;
        }
        
        .tracking-number {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          letter-spacing: 0.1em;
          color: #FFFFFF;
        }
        
        /* Botón */
        .button-container {
          text-align: center;
          padding: 30px 0;
        }
        
        .button {
          display: inline-block;
          border: 1px solid #000000;
          padding: 14px 45px;
          color: #000000;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          background: #FFFFFF;
          transition: all 0.3s ease;
        }
        
        .button:hover {
          background: #000000;
          color: #FFFFFF;
        }
        
        /* Footer */
        .footer {
          background-color: #FAFAFA;
          padding: 40px;
          text-align: center;
          border-top: 1px solid #E5E5E5;
        }
        
        .footer p {
          color: #999999;
          font-size: 11px;
          letter-spacing: 0.05em;
          line-height: 1.8;
          margin-bottom: 10px;
        }
        
        .footer-copyright {
          margin-top: 25px;
          color: #CCCCCC;
          font-size: 9px;
          letter-spacing: 0.1em;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 25px;
          }
          
          .status-hero {
            padding: 40px 25px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">ESYMBEL</div>
        </div>
        
        <!-- Status Hero -->
        <div class="status-hero">
          <span class="status-icon">${config.icono}</span>
          <h1 class="status-title">${config.titulo}</h1>
          <p class="status-message">${config.mensaje}</p>
        </div>
        
        <div class="content">
          <!-- Tracking Box (solo para ENVIADO) -->
          ${nuevoEstado === 'ENVIADO' && pedido.strNumeroSeguimiento ? `
            <div class="tracking-box">
              <div class="tracking-label">Número de Seguimiento</div>
              <div class="tracking-number">${pedido.strNumeroSeguimiento}</div>
            </div>
          ` : ''}
          
          <!-- Timeline -->
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-date">${fechaActualizacion}</div>
              <div class="timeline-text">${config.detalles}</div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="order-summary">
            <h3>Resumen del Pedido</h3>
            <div class="summary-row">
              <span class="summary-label">Número de Orden</span>
              <span class="summary-value">#${String(pedido.intPedido).padStart(6, '0')}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Estado</span>
              <span class="summary-value">${nuevoEstado}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total</span>
              <span class="summary-value">$${(pedido.dblTotal || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/pedidos/${pedido.intPedido}" class="button">
              Ver Detalles Completos
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Para cualquier consulta, estamos a tu disposición.</p>
          <p>Correo: soporte@esymbel.com</p>
          
          <p class="footer-copyright">
            © 2024 ESYMBEL. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE ENVÍO
// ═══════════════════════════════════════════════════════════════════════════════

export async function enviarEmailCliente(pedido: any): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"ESYMBEL Exclusive Fashion" <${process.env.SMTP_USER}>`,
      to: pedido.tbClientes?.strEmail,
      subject: `Confirmación de Pedido #${String(pedido.intPedido).padStart(6, '0')} - ESYMBEL`,
      html: templateEmailCliente(pedido),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email luxury enviado al cliente:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email luxury al cliente:', error);
    throw error;
    return false;
  }
}

export async function enviarEmailAdmin(pedido: any): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    const mailOptions = {
      from: `"ESYMBEL Admin System" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🔔 Nueva Orden #${String(pedido.intPedido).padStart(6, '0')} - ${pedido.tbClientes?.strNombre}`,
      html: templateEmailAdmin(pedido),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email luxury enviado al admin:', info.messageId);
    return true;
  } catch (error) {

    console.error('❌ Error al enviar email luxury al admin:', error);
    throw error;
    return false;
  }
}

export async function enviarEmailActualizacionEstado(pedido: any, nuevoEstado: string) {
  try {
    const mailOptions = {
      from: `"ESYMBEL" <${process.env.SMTP_USER}>`,
      to: pedido.tbClientes?.strEmail,
      subject: `Actualización de Pedido #${String(pedido.intPedido).padStart(6, '0')} - ${nuevoEstado}`,
      html: templateActualizacionEstado(pedido, nuevoEstado),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email luxury de actualización (${nuevoEstado}) enviado:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email luxury de actualización:', error);
    throw error;
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

// Exportar también los templates para uso directo
export {
  templateEmailCliente,
  templateEmailAdmin,
  templateActualizacionEstado
};
