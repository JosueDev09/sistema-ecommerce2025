# 📧 Configuración de Emails para Confirmación de Pedidos

## Resumen

El sistema ahora envía emails de confirmación automáticamente cuando un pago es **aprobado**:
- ✅ Email al **cliente** con detalles del pedido, productos comprados y totales
- ✅ Email al **administrador** con notificación del nuevo pedido y datos del cliente

## Flujo de Envío de Emails

### Checkout API (Pago Directo con Token)
Cuando el pago se procesa directamente:
1. Se tokeniza la tarjeta en el frontend
2. Se envía el token al backend
3. MercadoPago procesa el pago inmediatamente
4. **Si el pago es aprobado**, se envían los emails de confirmación
5. El resolver retorna `bolEmailEnviado: true/false`

### Checkout Pro (Redirección a MercadoPago)
Cuando se redirige al checkout de MercadoPago:
1. Se crea una preferencia de pago
2. El usuario es redirigido a MercadoPago
3. El usuario paga en la página de MercadoPago
4. MercadoPago envía notificación al webhook
5. El webhook actualiza el estado del pago
6. **Si el pago es aprobado**, el webhook envía los emails

## Configuración Requerida

### 1. Variables de Entorno (.env)

Agrega estas variables a tu archivo `.env`:

```env
# ==================================================
# CONFIGURACIÓN DE EMAILS
# ==================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
ADMIN_EMAIL=admin@esymbel-store.com
```

### 2. Opciones de Servicio SMTP

#### Opción A: Gmail (Recomendado para Testing)

1. **Habilitar autenticación de 2 factores** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Windows Computer" (o cualquier opción)
   - Copia la contraseña de 16 caracteres generada
3. **Configurar .env**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # Contraseña de aplicación (quitar espacios)
ADMIN_EMAIL=admin@esymbel-store.com
```

**Ventajas**: Gratis, fácil de configurar, perfecto para desarrollo
**Limitaciones**: 
- Límite de 500 emails/día
- 100 destinatarios/mensaje
- No recomendado para producción de alto volumen

#### Opción B: SendGrid (Recomendado para Producción)

1. Crear cuenta en: https://sendgrid.com/
2. Verificar tu dominio (importante para evitar spam)
3. Generar API Key en Settings > API Keys
4. Configurar .env:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Tu API Key
ADMIN_EMAIL=admin@tu-dominio.com
```

**Ventajas**: 
- 100 emails gratis/día
- Excelente deliverability
- Dashboard con estadísticas
- Ideal para producción

#### Opción C: Resend (Alternativa Moderna)

1. Crear cuenta en: https://resend.com/
2. Generar API Key
3. Configurar .env:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Tu API Key
ADMIN_EMAIL=admin@tu-dominio.com
```

**Ventajas**: 
- 100 emails gratis/día
- Excelente DX (Developer Experience)
- Moderna y fácil de usar

#### Opción D: Servicio SMTP Propio

Si tienes tu propio servidor de email:
```env
SMTP_HOST=mail.tu-dominio.com
SMTP_PORT=587  # o 465 para SSL
SMTP_SECURE=false  # true si usas puerto 465
SMTP_USER=noreply@tu-dominio.com
SMTP_PASS=tu-contraseña-smtp
ADMIN_EMAIL=admin@tu-dominio.com
```

## Campos Devueltos en GraphQL

### Mutation: `crearPreferenciaMercadoPago`

```graphql
type PagoMercadoPago {
  intPago: Int!
  strPreferenciaId: String!
  strInitPoint: String!
  strEstado: EstadoPago!
  bolEmailEnviado: Boolean  # ✨ NUEVO: indica si se enviaron los emails
}
```

### Ejemplo de Respuesta

#### Checkout API (Pago Directo Aprobado)
```json
{
  "data": {
    "crearPreferenciaMercadoPago": {
      "intPago": 123,
      "strPreferenciaId": "1234567890",
      "strInitPoint": "",
      "strEstado": "APROBADO",
      "bolEmailEnviado": true  // ✅ Emails enviados exitosamente
    }
  }
}
```

#### Checkout Pro (Preferencia Creada)
```json
{
  "data": {
    "crearPreferenciaMercadoPago": {
      "intPago": 124,
      "strPreferenciaId": "0987654321",
      "strInitPoint": "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=...",
      "strEstado": "PENDIENTE",
      "bolEmailEnviado": false  // ⏳ Se enviará cuando se confirme el pago
    }
  }
}
```

## Contenido de los Emails

### Email al Cliente

**Asunto**: "Confirmación de tu pedido #123 - Esymbel Store"

**Contenido**:
- Saludo personalizado con nombre del cliente
- Número de pedido
- Fecha y hora del pedido
- Lista de productos con cantidades y precios
- Subtotal
- Costo de envío
- Total pagado
- Dirección de envío
- Método de pago
- Link para ver el pedido (redirige a frontend)

**Diseño**: HTML responsivo con colores de la marca

### Email al Administrador

**Asunto**: "Nuevo pedido #123 recibido - Esymbel Store"

**Contenido**:
- Alerta de nuevo pedido
- Número de pedido
- Datos del cliente (nombre, email, teléfono)
- Dirección de envío completa
- Lista de productos comprados
- Total del pedido
- Link al panel de administración

## Integración en el Frontend

### Multistep Loading (3 Pasos)

Tu componente frontend muestra 3 pasos durante el checkout:

```tsx
const pasos = [
  { label: "Procesando Pago", tiempo: 2000 },      // MercadoPago
  { label: "Guardando Pedido", tiempo: 1500 },     // Base de datos
  { label: "Enviando Confirmación", tiempo: 1500 } // Emails
];
```

**Integración con `bolEmailEnviado`**:

```tsx
const [pasoActual, setPasoActual] = useState(0);

// Ejecutar mutation
const { data } = await crearPreferenciaMercadoPago({ ... });

// Paso 1: Procesando Pago
setPasoActual(1);
await esperarRespuestaMercadoPago();

// Paso 2: Guardando Pedido
setPasoActual(2);
// El pedido ya está guardado si llegaste aquí

// Paso 3: Enviando Confirmación
setPasoActual(3);
if (data.crearPreferenciaMercadoPago.bolEmailEnviado) {
  console.log("✅ Emails enviados exitosamente");
} else {
  console.log("⚠️ No se pudieron enviar emails (pero el pago está aprobado)");
}

// Redirigir a página de éxito
router.push('/checkout/success');
```

### Manejo de Errores de Email

**Importante**: Si el envío de emails falla, el pago **NO se cancela**. Los emails son un extra, pero el pago ya está procesado.

```tsx
if (!data.crearPreferenciaMercadoPago.bolEmailEnviado) {
  // El pago fue exitoso pero los emails fallaron
  // Puedes mostrar un mensaje como:
  toast.warning("Tu pedido fue procesado correctamente. Te enviaremos un email de confirmación pronto.");
} else {
  toast.success("¡Pedido confirmado! Revisa tu email.");
}
```

## Testing

### 1. Verificar Configuración SMTP

Agrega este endpoint temporal para probar emails:

```ts
// src/app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { enviarEmailCliente } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Pedido de prueba
    const pedidoTest = {
      intPedido: 999,
      dtCreacion: new Date(),
      dblSubtotal: 1000,
      dblCostoEnvio: 150,
      dblTotal: 1150,
      strMetodoPago: "Tarjeta de crédito",
      tbClientes: {
        strNombre: "Juan",
        strApellidos: "Pérez",
        strEmail: "tu-email@gmail.com", // Cambia esto
      },
      tbDirecciones: {
        strCalle: "Av. Juárez",
        strNumeroExterior: "123",
        strColonia: "Centro",
        strCiudad: "Ciudad de México",
        strEstado: "CDMX",
        strCP: "06000",
      },
      tbItems: [
        {
          intCantidad: 2,
          dblPrecioUnitario: 500,
          tbProducto: {
            strNombre: "Producto de Prueba",
          },
        },
      ],
    };

    await enviarEmailCliente(pedidoTest);

    return NextResponse.json({ 
      success: true, 
      message: "Email de prueba enviado" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

**Probar**: Visita `http://localhost:3000/api/test-email`

### 2. Revisar Logs

Busca en la consola del servidor:

```bash
✅ Servidor de email listo         # Configuración correcta
❌ Error en configuración de email # Revisar credenciales
📬 Enviando emails de confirmación...
✅ Email enviado al cliente: juan@email.com
✅ Email enviado al administrador
```

### 3. Verificar Carpeta de Spam

Si los emails no llegan:
1. Revisa la carpeta de spam/correo no deseado
2. Para Gmail: marca los emails como "No es spam"
3. Para producción: verifica tu dominio en SendGrid/Resend

## Troubleshooting

### Error: "Invalid login"
**Causa**: Contraseña incorrecta o autenticación de 2 factores no habilitada
**Solución**: 
- Gmail: Genera una contraseña de aplicación
- Otros: Verifica usuario y contraseña SMTP

### Error: "Connection timeout"
**Causa**: Puerto bloqueado o host incorrecto
**Solución**: 
- Verifica `SMTP_HOST` y `SMTP_PORT`
- Prueba con puerto 465 (SSL) o 587 (TLS)

### Emails llegan a spam
**Causa**: Falta de autenticación SPF/DKIM
**Solución**: 
- Usa un servicio como SendGrid/Resend
- Configura SPF/DKIM en tu dominio
- Verifica tu dominio en el servicio SMTP

### Emails no se envían pero no hay error
**Causa**: Variables de entorno no cargadas
**Solución**: 
- Reinicia el servidor de desarrollo
- Verifica que `.env` esté en la raíz del proyecto
- Revisa que las variables no tengan espacios extra

## Checklist de Implementación

- [x] ✅ Instalar nodemailer: `pnpm add nodemailer @types/nodemailer`
- [ ] ⚙️ Configurar variables SMTP en `.env`
- [ ] ⚙️ Elegir servicio SMTP (Gmail/SendGrid/Resend)
- [ ] ⚙️ Generar credenciales (API Key o contraseña de app)
- [ ] ⚙️ Actualizar `SMTP_USER` y `SMTP_PASS` en `.env`
- [ ] ⚙️ Configurar `ADMIN_EMAIL` en `.env`
- [ ] ⚙️ Reiniciar servidor de desarrollo
- [ ] ⚙️ Probar con endpoint de prueba
- [ ] ⚙️ Verificar logs del servidor
- [ ] ⚙️ Revisar carpeta de spam
- [ ] ⚙️ Integrar `bolEmailEnviado` en frontend
- [ ] ⚙️ Probar flujo completo de checkout

## Producción

Antes de desplegar:

1. **Cambiar a servicio profesional**: SendGrid o Resend
2. **Verificar dominio**: Para evitar spam
3. **Configurar SPF/DKIM**: En tu DNS
4. **Usar email corporativo**: `noreply@tu-dominio.com`
5. **Monitorear deliverability**: Usar dashboard del servicio
6. **Habilitar webhook**: Para pagos con Checkout Pro

## Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica las variables de entorno
3. Prueba con el endpoint de testing
4. Consulta la documentación de tu servicio SMTP
