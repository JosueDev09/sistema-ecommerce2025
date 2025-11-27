# 🧪 Prueba de Checkout API - Pago Directo

## ⚠️ Problema Detectado

El backend está configurado correctamente para **Checkout API** (pago directo), pero el **token no está llegando** desde el frontend.

---

## 🔍 Logs de Depuración

El backend ahora muestra estos logs para ayudarte a encontrar el problema:

```
🔍 DEBUG - Buscando token en:
  - data.strTokenTarjeta: ❌
  - data.formData.strTokenTarjeta: ❌
  - metadata.token_tarjeta: ❌
  - metadata.strTokenTarjeta: ❌
🔐 Token FINAL: No presente ❌
```

Si ves esto, significa que el **token NO está siendo enviado** desde el frontend.

---

## ✅ Solución: Enviar el Token Correctamente

### 📤 Mutation Correcta desde el Frontend

```graphql
mutation CrearPagoDirecto($data: PreferenciaMercadoPagoInput!) {
  crearPreferenciaMercadoPago(data: $data) {
    intPago
    strPreferenciaId
    strInitPoint
    strEstado
    bolEmailEnviado
  }
}
```

### 📋 Variables de la Mutation (CON TOKEN)

```javascript
{
  "data": {
    "intPedido": 123,
    "intCliente": 456,
    "intDireccion": 789,
    
    // ✅ OPCIÓN 1: Token en el nivel superior (RECOMENDADO)
    "strTokenTarjeta": "1ab2c3d4e5f6g7h8i9j0", // ← TOKEN AQUÍ
    
    "formData": {
      "strNombre": "Juan",
      "strApellido": "Pérez",
      "strEmail": "juan@email.com",
      "strTelefono": "5512345678",
      "strMetodoEnvio": "Domicilio",
      "strMetodoPago": "Tarjeta de crédito",
      "strTipoTarjeta": "visa",
      "intMesesSinIntereses": 3,
      "strNumeroTarjetaUltimos4": "1234",
      "strNombreTarjeta": "Juan Pérez",
      
      // ✅ OPCIÓN 2: Token también puede ir aquí
      "strTokenTarjeta": "1ab2c3d4e5f6g7h8i9j0" // ← O AQUÍ
    },
    
    "montos": {
      "dblSubtotal": 1000.00,
      "dblCostoEnvio": 150.00,
      "dblTotal": 1150.00
    },
    
    "items": [
      {
        "strId": "1",
        "strTitulo": "Producto de prueba",
        "strDescripcion": "Descripción del producto",
        "intCantidad": 2,
        "dblPrecioUnitario": 500.00
      }
    ],
    
    "payer": {
      "strNombre": "Juan",
      "strApellido": "Pérez",
      "strEmail": "juan@email.com",
      "objTelefono": {
        "strNumero": "5512345678"
      }
    },
    
    // ✅ OPCIÓN 3: Token también puede ir en metadata
    "metadata": "{\"token_tarjeta\":\"1ab2c3d4e5f6g7h8i9j0\",\"pedido_id\":123}"
  }
}
```

---

## 🎯 Lugares donde el Backend Busca el Token

El backend busca el token en **4 lugares diferentes** (en este orden):

1. ✅ `data.strTokenTarjeta` (nivel superior del input)
2. ✅ `data.formData.strTokenTarjeta` (dentro de formData)
3. ✅ `metadata.token_tarjeta` (dentro del JSON de metadata)
4. ✅ `metadata.strTokenTarjeta` (dentro del JSON de metadata)

**Si encuentra el token en CUALQUIERA de estos lugares**, usará Checkout API (pago directo).

---

## 💳 Código del Frontend para Tokenizar

### Paso 1: Instalar MercadoPago SDK

```bash
npm install @mercadopago/sdk-react
# o
pnpm add @mercadopago/sdk-react
```

### Paso 2: Crear Hook para Tokenizar

```tsx
// hooks/useMercadoPago.ts
import { useState } from 'react';

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);

  const tokenizarTarjeta = async (cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }) => {
    setLoading(true);
    
    try {
      // Inicializar MercadoPago
      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
        { locale: 'es-MX' }
      );

      // Crear token de la tarjeta
      const token = await mp.fields.createCardToken({
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber,
      });

      console.log('✅ Token generado:', token.id);
      return token.id;
      
    } catch (error) {
      console.error('❌ Error al tokenizar tarjeta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { tokenizarTarjeta, loading };
}
```

### Paso 3: Usar en tu Componente de Checkout

```tsx
// components/Checkout.tsx
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useMutation } from '@apollo/client';
import { CREAR_PAGO_MUTATION } from '@/graphql/mutations';

export function CheckoutComponent() {
  const { tokenizarTarjeta, loading: tokenizando } = useMercadoPago();
  const [crearPago, { loading: procesando }] = useMutation(CREAR_PAGO_MUTATION);

  const handlePagar = async (formData) => {
    try {
      // 1️⃣ Tokenizar la tarjeta primero
      console.log('🔐 Tokenizando tarjeta...');
      const token = await tokenizarTarjeta({
        cardNumber: formData.numeroTarjeta.replace(/\s/g, ''),
        cardholderName: formData.nombreTarjeta,
        cardExpirationMonth: formData.mesExpiracion,
        cardExpirationYear: formData.anioExpiracion,
        securityCode: formData.cvv,
        identificationType: 'RFC',
        identificationNumber: 'XAXX010101000',
      });

      console.log('✅ Token obtenido:', token);

      // 2️⃣ Enviar el token al backend
      console.log('📤 Enviando pago al backend...');
      const { data } = await crearPago({
        variables: {
          data: {
            intPedido: pedido.intPedido,
            intCliente: cliente.intCliente,
            intDireccion: direccion.intDireccion,
            
            // ✨ AQUÍ ENVÍAS EL TOKEN
            strTokenTarjeta: token, // ← IMPORTANTE
            
            formData: {
              strNombre: formData.nombre,
              strApellido: formData.apellido,
              strEmail: formData.email,
              strTelefono: formData.telefono,
              strMetodoEnvio: formData.metodoEnvio,
              strMetodoPago: 'Tarjeta de crédito',
              strTipoTarjeta: detectarTipoTarjeta(formData.numeroTarjeta),
              intMesesSinIntereses: formData.mesesSinIntereses,
              strNumeroTarjetaUltimos4: formData.numeroTarjeta.slice(-4),
              strNombreTarjeta: formData.nombreTarjeta,
            },
            montos: {
              dblSubtotal: carrito.subtotal,
              dblCostoEnvio: carrito.costoEnvio,
              dblTotal: carrito.total,
            },
            items: carrito.items.map(item => ({
              strId: item.id.toString(),
              strTitulo: item.nombre,
              strDescripcion: item.descripcion,
              intCantidad: item.cantidad,
              dblPrecioUnitario: item.precio,
            })),
            payer: {
              strNombre: formData.nombre,
              strApellido: formData.apellido,
              strEmail: formData.email,
              objTelefono: {
                strNumero: formData.telefono,
              },
            },
          },
        },
      });

      // 3️⃣ Verificar respuesta
      const resultado = data.crearPreferenciaMercadoPago;
      
      console.log('📊 Respuesta del backend:', resultado);

      // ✅ Si NO hay strInitPoint, significa que usó Checkout API (pago directo)
      if (!resultado.strInitPoint || resultado.strInitPoint === '') {
        console.log('✅ Pago procesado directamente (sin redirección)');
        
        if (resultado.strEstado === 'APROBADO') {
          toast.success('¡Pago aprobado!');
          router.push('/checkout/success');
        } else if (resultado.strEstado === 'RECHAZADO') {
          toast.error('Pago rechazado. Intenta con otra tarjeta.');
        } else {
          toast.warning('Pago pendiente de confirmación');
        }
      } else {
        // ❌ Si hay strInitPoint, significa que NO encontró el token
        console.error('❌ El backend creó una preferencia en lugar de procesar el pago');
        console.error('Token enviado:', token);
        toast.error('Error: El sistema redirige a MercadoPago (no debería pasar)');
      }
      
    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      toast.error('Error al procesar el pago');
    }
  };

  return (
    <form onSubmit={handlePagar}>
      {/* Tus campos de formulario */}
      <button type="submit" disabled={tokenizando || procesando}>
        {tokenizando ? 'Tokenizando...' : procesando ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
}
```

---

## 🧪 Prueba con Apollo Client Playground

Si quieres probar directamente desde el playground de GraphQL:

### 1. Ir a: `http://localhost:3000/api/graphql`

### 2. Ejecutar esta mutation con un token de prueba:

```graphql
mutation {
  crearPreferenciaMercadoPago(data: {
    intPedido: 1
    intCliente: 1
    strTokenTarjeta: "token_de_prueba_123456"
    formData: {
      strNombre: "Juan"
      strEmail: "juan@test.com"
      strTelefono: "5512345678"
      strMetodoEnvio: "Domicilio"
      strMetodoPago: "Tarjeta"
      strTipoTarjeta: "visa"
      intMesesSinIntereses: 1
      strNumeroTarjetaUltimos4: "1234"
      strNombreTarjeta: "Juan Perez"
    }
    montos: {
      dblSubtotal: 100
      dblCostoEnvio: 50
      dblTotal: 150
    }
    items: [
      {
        strId: "1"
        strTitulo: "Producto Test"
        intCantidad: 1
        dblPrecioUnitario: 100
      }
    ]
    payer: {
      strNombre: "Juan"
      strApellido: "Perez"
      strEmail: "juan@test.com"
      objTelefono: { strNumero: "5512345678" }
    }
  }) {
    intPago
    strPreferenciaId
    strInitPoint
    strEstado
  }
}
```

### 3. Verificar la respuesta:

#### ✅ Respuesta Correcta (Checkout API):
```json
{
  "data": {
    "crearPreferenciaMercadoPago": {
      "intPago": 123456,
      "strPreferenciaId": "123456",
      "strInitPoint": "", // ← VACÍO = Pago directo
      "strEstado": "APROBADO"
    }
  }
}
```

#### ❌ Respuesta Incorrecta (Checkout Pro):
```json
{
  "data": {
    "crearPreferenciaMercadoPago": {
      "intPago": 123456,
      "strPreferenciaId": "0987654321",
      "strInitPoint": "https://www.mercadopago.com.mx/checkout/...", // ← CON URL = Redirección
      "strEstado": "PENDIENTE"
    }
  }
}
```

---

## 📊 Comparación de Respuestas

| Campo | Checkout API (✅ Correcto) | Checkout Pro (❌ Incorrecto) |
|-------|---------------------------|------------------------------|
| `strInitPoint` | `""` (vacío) o `null` | URL de MercadoPago |
| `strEstado` | `APROBADO` o `RECHAZADO` | `PENDIENTE` |
| `intPago` | ID del payment | ID de la preference |
| Redirección | ❌ No hay | ✅ Sí hay |

---

## 🔧 Función Auxiliar: Detectar Tipo de Tarjeta

```typescript
function detectarTipoTarjeta(numeroTarjeta: string): string {
  const numero = numeroTarjeta.replace(/\s/g, '');
  
  if (/^4/.test(numero)) return 'visa';
  if (/^5[1-5]/.test(numero)) return 'mastercard';
  if (/^3[47]/.test(numero)) return 'amex';
  
  return 'credito'; // default
}
```

---

## 🎯 Tarjetas de Prueba de MercadoPago

### ✅ Tarjeta Aprobada (Visa)
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/25 (cualquier fecha futura)
Nombre: APRO
```

### ❌ Tarjeta Rechazada (Visa)
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: 11/25
Nombre: OTHE
```

### ⏳ Tarjeta Pendiente (Mastercard)
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha: 11/25
Nombre: CALL
```

---

## 📋 Checklist de Depuración

- [ ] El token se está generando en el frontend (ver console.log)
- [ ] El token se está enviando en la mutation (verificar variables)
- [ ] El token se está recibiendo en el backend (ver logs de DEBUG)
- [ ] El backend muestra "💳 Usando Checkout API"
- [ ] La respuesta tiene `strInitPoint: ""` (vacío)
- [ ] La respuesta tiene `strEstado: "APROBADO"` o `"RECHAZADO"`
- [ ] NO hay redirección a MercadoPago

---

## 🚨 Si Sigue Redirigiendo

Si después de enviar el token todavía te redirige, revisa:

1. **Console del Frontend**: ¿Se generó el token?
   ```
   ✅ Token generado: abc123...
   ```

2. **Variables de la Mutation**: ¿Incluye strTokenTarjeta?
   ```json
   { "data": { "strTokenTarjeta": "abc123..." } }
   ```

3. **Logs del Backend**: ¿Detectó el token?
   ```
   🔐 Token FINAL: Presente ✅
   💳 Usando Checkout API
   ```

4. **Respuesta del Backend**: ¿strInitPoint está vacío?
   ```json
   { "strInitPoint": "" }
   ```

---

## 📞 Soporte

Si sigues teniendo problemas:

1. Copia los logs del backend (sección DEBUG)
2. Copia las variables que envías en la mutation
3. Copia la respuesta que recibes
4. Comparte toda esta información

---

¡Con esto tu checkout API debería funcionar sin redirección! 🚀✨
