# 💳 Implementar Tarjetas Guardadas con Token

## 🎯 Problema Actual

Tu frontend está detectando tarjetas guardadas pero **no puede generar un token** porque solo tiene los últimos 4 dígitos:

```typescript
🔍 ¿Tarjeta guardada?: true
🔍 ¿Tiene número de tarjeta?: false  // ❌ Solo tiene "**** 376"
⚠️ No se generó token - Tarjeta guardada: true - Número presente: false
```

## ✅ Solución Implementada en el Backend

### 1. Se agregó campo `strTokenMercadoPago` en la base de datos:

```prisma
model tbTarjetas {
  intTarjeta         Int      @id @default(autoincrement())
  intCliente         Int
  strNumeroTarjeta   String   // Solo últimos 4 dígitos
  strNombreTarjeta   String
  strTipoTarjeta     String   // visa, mastercard, amex
  strFechaExpiracion String   // MM/YY
  strTokenMercadoPago String? // ✨ NUEVO: Token reutilizable de MercadoPago
  datCreacion        DateTime @default(now())
  datActualizacion   DateTime @updatedAt
}
```

### 2. Se actualizó el Schema GraphQL:

```graphql
type Tarjeta {
  intTarjeta: Int!
  strNumeroTarjeta: String!   # Solo últimos 4 dígitos
  strNombreTarjeta: String!
  strTipoTarjeta: String!
  strFechaExpiracion: String!
  strTokenMercadoPago: String # ✨ NUEVO: Token de MercadoPago
  datCreacion: String!
}

input TarjetaInput {
  intCliente: Int!
  strNumeroTarjeta: String!
  strNombreTarjeta: String!
  strTipoTarjeta: String!
  strFechaExpiracion: String!
  strTokenMercadoPago: String # ✨ NUEVO: Token a guardar
}
```

### 3. Se actualizó el resolver `crearTarjeta`:

```typescript
crearTarjeta: async (_: any, { data }: any) => {
  // Verificar cliente...
  
  console.log('💳 Guardando tarjeta con token:', 
    data.strTokenMercadoPago ? 'Presente ✅' : 'No presente ❌');

  const nuevaTarjeta = await db.tbTarjetas.create({
    data: {
      intCliente: data.intCliente,
      strNumeroTarjeta: data.strNumeroTarjeta,       // Solo últimos 4 dígitos
      strNombreTarjeta: data.strNombreTarjeta,
      strTipoTarjeta: data.strTipoTarjeta,
      strFechaExpiracion: data.strFechaExpiracion,
      strTokenMercadoPago: data.strTokenMercadoPago, // ✨ Guardar token
    },
  });
  
  console.log('✅ Tarjeta guardada con token');
  return nuevaTarjeta;
}
```

---

## 🔧 Implementación en el Frontend

### Paso 1: Actualizar Mutation de Crear Tarjeta

```typescript
// graphql/mutations.ts
export const CREAR_TARJETA = gql`
  mutation CrearTarjeta($data: TarjetaInput!) {
    crearTarjeta(data: $data) {
      intTarjeta
      strNumeroTarjeta
      strNombreTarjeta
      strTipoTarjeta
      strFechaExpiracion
      strTokenMercadoPago  # ✨ Incluir en respuesta
      datCreacion
    }
  }
`;
```

### Paso 2: Modificar Lógica de Guardar Tarjeta

Cuando el usuario guarda una tarjeta por primera vez:

```typescript
// Ejemplo: components/TarjetaCheckout.tsx o useCheckoutSubmit.ts

const guardarTarjeta = async (cardData: {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
}) => {
  try {
    // 1️⃣ PRIMERO: Tokenizar la tarjeta con MercadoPago
    console.log('🔐 Generando token de MercadoPago...');
    const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
    
    const token = await mp.fields.createCardToken({
      cardNumber: cardData.cardNumber.replace(/\s/g, ''),
      cardholderName: cardData.cardholderName,
      cardExpirationMonth: cardData.expirationMonth,
      cardExpirationYear: cardData.expirationYear,
      securityCode: cardData.securityCode,
      identificationType: 'RFC',
      identificationNumber: 'XAXX010101000'
    });

    console.log('✅ Token generado:', token.id);

    // 2️⃣ SEGUNDO: Guardar tarjeta con el token
    const { data } = await crearTarjeta({
      variables: {
        data: {
          intCliente: clienteId,
          strNumeroTarjeta: cardData.cardNumber.slice(-4), // Solo últimos 4 dígitos
          strNombreTarjeta: cardData.cardholderName,
          strTipoTarjeta: detectarTipoTarjeta(cardData.cardNumber),
          strFechaExpiracion: `${cardData.expirationMonth}/${cardData.expirationYear}`,
          strTokenMercadoPago: token.id, // ✨ GUARDAR TOKEN
        }
      }
    });

    console.log('💾 Tarjeta guardada con token:', data.crearTarjeta.intTarjeta);
    
    return data.crearTarjeta;
  } catch (error) {
    console.error('❌ Error al guardar tarjeta:', error);
    throw error;
  }
};
```

### Paso 3: Modificar Query de Obtener Tarjetas

```typescript
// graphql/queries.ts
export const OBTENER_TARJETAS_CLIENTE = gql`
  query ObtenerTarjetasCliente($intCliente: Int!) {
    obtenerTarjetasCliente(intCliente: $intCliente) {
      intTarjeta
      strNumeroTarjeta      # "**** 1234"
      strNombreTarjeta
      strTipoTarjeta
      strFechaExpiracion
      strTokenMercadoPago   # ✨ IMPORTANTE: Incluir token
      datCreacion
    }
  }
`;
```

### Paso 4: Actualizar Lógica de Checkout con Tarjeta Guardada

```typescript
// useCheckoutSubmit.ts

const procesarPagoConTarjetaGuardada = async (tarjetaGuardada: any) => {
  console.log('💳 Usando tarjeta guardada:', tarjetaGuardada.intTarjeta);
  console.log('🔑 Token guardado:', tarjetaGuardada.strTokenMercadoPago ? 'Presente ✅' : 'No presente ❌');

  // Verificar si la tarjeta tiene token guardado
  if (!tarjetaGuardada.strTokenMercadoPago) {
    throw new Error('La tarjeta no tiene un token válido. Por favor, ingresa los datos nuevamente.');
  }

  // ✅ Usar el token guardado directamente
  const token = tarjetaGuardada.strTokenMercadoPago;
  
  console.log('🎫 Token recuperado de BD:', token);

  // Enviar pago con el token guardado
  const { data } = await crearPago({
    variables: {
      data: {
        intPedido: pedido.intPedido,
        intCliente: cliente.intCliente,
        intDireccion: direccion.intDireccion,
        
        // ✨ Usar token guardado
        strTokenTarjeta: token,
        
        formData: {
          strNombre: formData.nombre,
          strApellido: formData.apellido,
          strEmail: formData.email,
          strTelefono: formData.telefono,
          strMetodoEnvio: formData.metodoEnvio,
          strMetodoPago: 'Tarjeta de crédito',
          strTipoTarjeta: tarjetaGuardada.strTipoTarjeta,
          intMesesSinIntereses: 1,
          strNumeroTarjetaUltimos4: tarjetaGuardada.strNumeroTarjeta,
          strNombreTarjeta: tarjetaGuardada.strNombreTarjeta,
        },
        montos: { /* ... */ },
        items: [ /* ... */ ],
        payer: { /* ... */ }
      }
    }
  });

  console.log('✅ Pago procesado con tarjeta guardada');
  return data;
};
```

### Paso 5: Flujo Completo en useCheckoutSubmit.ts

```typescript
// useCheckoutSubmit.ts

export const useCheckoutSubmit = () => {
  const handleSubmit = async (formData: FormData) => {
    try {
      // 1. Crear pedido, cliente, dirección...
      
      // 2. Determinar si usa tarjeta guardada o nueva
      if (formData.usandoTarjetaGuardada && formData.tarjetaSeleccionada) {
        
        // ===== FLUJO A: TARJETA GUARDADA =====
        console.log('💳 Usando tarjeta guardada:', formData.tarjetaSeleccionada.intTarjeta);
        
        // Obtener tarjeta completa (con token)
        const { data: tarjetasData } = await obtenerTarjetasCliente({
          variables: { intCliente: cliente.intCliente }
        });
        
        const tarjetaCompleta = tarjetasData.obtenerTarjetasCliente.find(
          (t: any) => t.intTarjeta === formData.tarjetaSeleccionada.intTarjeta
        );
        
        if (!tarjetaCompleta?.strTokenMercadoPago) {
          throw new Error('Esta tarjeta no tiene un token válido. Por favor, elimínala y agrégala de nuevo.');
        }
        
        // Usar token guardado
        const token = tarjetaCompleta.strTokenMercadoPago;
        console.log('🎫 Usando token guardado:', token.substring(0, 20) + '...');
        
        // Procesar pago con token
        const resultado = await crearPago({
          variables: {
            data: {
              // ... otros datos
              strTokenTarjeta: token, // ✨ Token de la BD
            }
          }
        });
        
      } else {
        
        // ===== FLUJO B: TARJETA NUEVA =====
        console.log('💳 Procesando tarjeta nueva...');
        
        // Tokenizar tarjeta nueva
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
        const tokenResult = await mp.fields.createCardToken({
          cardNumber: formData.numeroTarjeta.replace(/\s/g, ''),
          cardholderName: formData.nombreTarjeta,
          cardExpirationMonth: formData.mesExpiracion,
          cardExpirationYear: formData.anioExpiracion,
          securityCode: formData.cvv,
          identificationType: 'RFC',
          identificationNumber: 'XAXX010101000'
        });
        
        const token = tokenResult.id;
        console.log('✅ Token generado:', token);
        
        // Si usuario quiere guardar la tarjeta
        if (formData.guardarTarjeta) {
          console.log('💾 Guardando tarjeta para uso futuro...');
          await crearTarjeta({
            variables: {
              data: {
                intCliente: cliente.intCliente,
                strNumeroTarjeta: formData.numeroTarjeta.slice(-4),
                strNombreTarjeta: formData.nombreTarjeta,
                strTipoTarjeta: detectarTipoTarjeta(formData.numeroTarjeta),
                strFechaExpiracion: `${formData.mesExpiracion}/${formData.anioExpiracion}`,
                strTokenMercadoPago: token, // ✨ Guardar token para reutilizar
              }
            }
          });
        }
        
        // Procesar pago con token nuevo
        const resultado = await crearPago({
          variables: {
            data: {
              // ... otros datos
              strTokenTarjeta: token, // ✨ Token recién generado
            }
          }
        });
      }
      
      // 3. Verificar resultado...
      
    } catch (error) {
      console.error('Error en checkout:', error);
    }
  };
  
  return { handleSubmit };
};
```

---

## 🔐 Seguridad: Tokens de MercadoPago

### ¿Es seguro guardar el token?

✅ **SÍ**, es seguro guardar el token de MercadoPago porque:

1. **No contiene datos sensibles**: El token no guarda el número completo, CVV ni datos de la tarjeta
2. **Es un identificador**: Solo sirve para que MercadoPago identifique la tarjeta tokenizada
3. **MercadoPago lo permite**: Su documentación oficial permite guardar tokens para pagos recurrentes
4. **Expira eventualmente**: Los tokens tienen fecha de expiración (aprox. 7 años)

### ¿Qué NO debes guardar?

❌ **NUNCA guardes**:
- Número completo de tarjeta
- CVV / Código de seguridad
- Contraseñas o PINs

### Comparación:

| Campo | ¿Guardar? | Razón |
|-------|-----------|-------|
| Número completo | ❌ | Violación PCI-DSS |
| CVV | ❌ | Prohibido por PCI-DSS |
| Token de MP | ✅ | Diseñado para esto |
| Últimos 4 dígitos | ✅ | Solo para mostrar |
| Nombre titular | ✅ | No es sensible |
| Fecha expiración | ✅ | No es sensible |

---

## 🧪 Testing

### Tarjeta de Prueba de MercadoPago:

```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/30
Nombre: APRO
```

### Flujo de Prueba:

1. **Guardar Tarjeta Nueva**:
   ```
   Usuario ingresa: 4509 9535 6623 3704
   Frontend tokeniza: "abc123xyz..."
   Se guarda en BD:
     - strNumeroTarjeta: "3704"
     - strTokenMercadoPago: "abc123xyz..."
   ```

2. **Usar Tarjeta Guardada**:
   ```
   Usuario selecciona tarjeta: "**** 3704"
   Frontend consulta BD: strTokenMercadoPago = "abc123xyz..."
   Se envía al backend: strTokenTarjeta: "abc123xyz..."
   Backend procesa pago con Checkout API ✅
   ```

3. **Verificar Logs**:
   ```
   // Frontend
   💳 Usando tarjeta guardada: 1
   🎫 Usando token guardado: abc123xyz...
   
   // Backend
   🔍 DEBUG - Buscando token en:
     - data.strTokenTarjeta: abc123xyz... ✅
   🔐 Token FINAL: Presente ✅
   💳 Usando Checkout API (pago directo con token)
   ✅ Pago directo procesado: 12345678
   📊 Estado: approved
   ```

---

## 📋 Checklist de Implementación

### Backend (✅ Ya implementado):
- [x] Agregar campo `strTokenMercadoPago` en Prisma schema
- [x] Crear migración de base de datos
- [x] Actualizar type `Tarjeta` en GraphQL
- [x] Actualizar input `TarjetaInput` en GraphQL
- [x] Modificar resolver `crearTarjeta` para guardar token
- [ ] Reiniciar servidor para aplicar cambios (debes hacerlo manualmente)

### Frontend (⚙️ Por implementar):
- [ ] Actualizar mutation `CREAR_TARJETA` para incluir token
- [ ] Actualizar query `OBTENER_TARJETAS_CLIENTE` para incluir token
- [ ] Modificar lógica de guardar tarjeta (tokenizar primero)
- [ ] Modificar lógica de checkout con tarjeta guardada (usar token de BD)
- [ ] Agregar validación: si tarjeta no tiene token, pedir datos nuevamente
- [ ] Probar flujo completo: guardar → usar → verificar pago directo
- [ ] Verificar logs del backend: debe mostrar "Usando Checkout API"
- [ ] Confirmar respuesta: `strInitPoint: ""` (sin redirección)

---

## 🚨 Problemas Comunes

### Problema 1: "La tarjeta no tiene token"
**Causa**: Tarjeta guardada antes de esta actualización
**Solución**: Eliminar tarjeta y agregarla de nuevo

### Problema 2: "Token expirado"
**Causa**: Token de MercadoPago caducó (muy raro, ~7 años)
**Solución**: Eliminar tarjeta y agregarla de nuevo

### Problema 3: Sigue redirigiendo a MercadoPago
**Causa**: Token no llegó al backend
**Solución**: Verificar logs DEBUG del backend para ver dónde busca el token

---

## 📚 Documentación Oficial

- **Tokenización**: https://www.mercadopago.com.mx/developers/es/docs/checkout-api/integration-configuration/card/integrate-via-cardform
- **Pagos recurrentes**: https://www.mercadopago.com.mx/developers/es/docs/subscriptions/integration-configuration/create-subscription
- **PCI-DSS Compliance**: https://www.mercadopago.com.mx/developers/es/docs/security/pci

---

## ✅ Resultado Final

Después de implementar esto:

1. ✅ Usuario guarda tarjeta → se genera token → se guarda token en BD
2. ✅ Usuario usa tarjeta guardada → se recupera token de BD → se envía al backend
3. ✅ Backend recibe token → procesa pago con Checkout API → **sin redirección**
4. ✅ Pago aprobado/rechazado instantáneamente → usuario ve resultado en tu sitio

¡Tu checkout será 100% en tu sitio sin salir a MercadoPago! 🚀✨
