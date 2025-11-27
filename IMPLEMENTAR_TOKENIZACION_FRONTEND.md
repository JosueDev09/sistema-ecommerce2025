# 🔐 Implementar Tokenización de Tarjetas en el Frontend

## ⚠️ PROBLEMA ACTUAL

Estás guardando el **número completo de la tarjeta** en la base de datos, pero eso **NO es el token** que necesita MercadoPago.

### ❌ Lo que estás haciendo ahora:
```typescript
// Usuario ingresa: 4509 9535 6623 3704
// Se guarda en BD: "4509953566233704"
// Se envía al backend: "4509953566233704" ← ¡Esto NO es un token!
// Backend lo rechaza porque no es un token válido
```

### ✅ Lo que debes hacer:
```typescript
// Usuario ingresa: 4509 9535 6623 3704
// Se tokeniza con MercadoPago SDK: "abc123xyz456" ← Este es el token
// Se guarda en BD: "3704" ← Solo últimos 4 dígitos
// Se envía al backend: "abc123xyz456" ← El token
// Backend procesa el pago directamente
```

---

## 📚 Conceptos Importantes

### 1. ¿Qué es un Token?
Un **token** es un identificador único y temporal que MercadoPago genera para representar una tarjeta de crédito de forma segura, sin exponer los datos sensibles.

**Ejemplo de token**: `"7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d"`

### 2. ¿Por qué NO puedes enviar el número de tarjeta directo?
- **Seguridad PCI-DSS**: Es ilegal y peligroso transmitir/almacenar números de tarjeta completos
- **MercadoPago lo rechaza**: La API de pagos solo acepta tokens, no números de tarjeta
- **Multas**: Puedes recibir multas de hasta $500,000 USD por violaciones PCI-DSS

### 3. ¿Cómo funciona la tokenización?
```
Frontend                         MercadoPago              Tu Backend
   |                                  |                        |
   |-- Número de tarjeta ----------->|                        |
   |   CVV, fecha, etc.               |                        |
   |                                  |                        |
   |<-- Token temporal ---------------|                        |
   |   "abc123xyz456"                 |                        |
   |                                                           |
   |-- Token ------------------------>|----------------------->|
   |                                  |   Procesar pago        |
   |                                  |<-----------------------|
```

---

## 🚀 Implementación Paso a Paso

### Paso 1: Instalar SDK de MercadoPago

```bash
pnpm add @mercadopago/sdk-react
```

### Paso 2: Agregar Script de MercadoPago en tu Layout

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* SDK de MercadoPago */}
        <script src="https://sdk.mercadopago.com/js/v2"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Paso 3: Crear Componente de Tarjeta con Tokenización

```tsx
// components/TarjetaCheckout.tsx
'use client';

import { useState, useEffect } from 'react';

interface TarjetaCheckoutProps {
  onTokenGenerated: (token: string, cardData: {
    lastFourDigits: string;
    cardholderName: string;
    cardType: string;
  }) => void;
}

export function TarjetaCheckout({ onTokenGenerated }: TarjetaCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mp, setMp] = useState<any>(null);

  // Inicializar MercadoPago
  useEffect(() => {
    const initMercadoPago = async () => {
      if (typeof window !== 'undefined' && (window as any).MercadoPago) {
        const mercadopago = new (window as any).MercadoPago(
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
          { locale: 'es-MX' }
        );
        setMp(mercadopago);
        console.log('✅ MercadoPago SDK inicializado');
      }
    };

    initMercadoPago();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const cardNumber = formData.get('cardNumber') as string;
      const cardholderName = formData.get('cardholderName') as string;
      const expirationMonth = formData.get('expirationMonth') as string;
      const expirationYear = formData.get('expirationYear') as string;
      const securityCode = formData.get('securityCode') as string;

      console.log('🔐 Tokenizando tarjeta...');

      // ✨ AQUÍ ES DONDE SE GENERA EL TOKEN
      const token = await mp.fields.createCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''), // Quitar espacios
        cardholderName: cardholderName,
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode: securityCode,
        identificationType: 'RFC',
        identificationNumber: 'XAXX010101000'
      });

      console.log('✅ Token generado:', token.id);
      console.log('📊 Datos de la tarjeta:', token);

      // Detectar tipo de tarjeta
      const cardType = detectarTipoTarjeta(cardNumber);
      
      // Obtener últimos 4 dígitos
      const lastFourDigits = cardNumber.replace(/\s/g, '').slice(-4);

      // Enviar token al componente padre
      onTokenGenerated(token.id, {
        lastFourDigits,
        cardholderName,
        cardType
      });

    } catch (err: any) {
      console.error('❌ Error al tokenizar:', err);
      setError('Error al procesar la tarjeta. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  const detectarTipoTarjeta = (numero: string): string => {
    const num = numero.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    return 'credito';
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .match(/.{1,4}/g)
      ?.join(' ') || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Número de tarjeta */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium">
          Número de tarjeta
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          required
          onChange={(e) => {
            e.target.value = formatCardNumber(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      {/* Nombre en la tarjeta */}
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium">
          Nombre del titular
        </label>
        <input
          type="text"
          id="cardholderName"
          name="cardholderName"
          placeholder="Como aparece en la tarjeta"
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      {/* Fecha de expiración y CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="expirationMonth" className="block text-sm font-medium">
            Mes
          </label>
          <select
            id="expirationMonth"
            name="expirationMonth"
            required
            className="mt-1 block w-full rounded-md border p-2"
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month.toString().padStart(2, '0')}>
                {month.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expirationYear" className="block text-sm font-medium">
            Año
          </label>
          <select
            id="expirationYear"
            name="expirationYear"
            required
            className="mt-1 block w-full rounded-md border p-2"
          >
            <option value="">AA</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
              <option key={year} value={year.toString().slice(-2)}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="securityCode" className="block text-sm font-medium">
            CVV
          </label>
          <input
            type="text"
            id="securityCode"
            name="securityCode"
            placeholder="123"
            maxLength={4}
            required
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !mp}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Procesando...' : 'Continuar con el pago'}
      </button>
    </form>
  );
}
```

### Paso 4: Usar el Componente en tu Checkout

```tsx
// app/checkout/page.tsx
'use client';

import { TarjetaCheckout } from '@/components/TarjetaCheckout';
import { useMutation } from '@apollo/client';
import { CREAR_PAGO_MUTATION } from '@/graphql/mutations';

export default function CheckoutPage() {
  const [crearPago] = useMutation(CREAR_PAGO_MUTATION);
  
  const handleTokenGenerated = async (
    token: string, 
    cardData: { lastFourDigits: string; cardholderName: string; cardType: string }
  ) => {
    console.log('🎉 Token recibido:', token);
    console.log('💳 Datos de tarjeta:', cardData);

    try {
      // Enviar el TOKEN (no el número de tarjeta) al backend
      const { data } = await crearPago({
        variables: {
          data: {
            intPedido: pedido.intPedido,
            intCliente: cliente.intCliente,
            intDireccion: direccion.intDireccion,
            
            // ✨ AQUÍ ENVÍAS EL TOKEN
            strTokenTarjeta: token, // ← EL TOKEN DE MERCADOPAGO
            
            formData: {
              strNombre: 'Juan',
              strApellido: 'Pérez',
              strEmail: 'juan@email.com',
              strTelefono: '5512345678',
              strMetodoEnvio: 'Domicilio',
              strMetodoPago: 'Tarjeta de crédito',
              strTipoTarjeta: cardData.cardType,
              intMesesSinIntereses: 1,
              
              // Solo guardar últimos 4 dígitos en BD
              strNumeroTarjetaUltimos4: cardData.lastFourDigits, // ← Solo 4 dígitos
              strNombreTarjeta: cardData.cardholderName,
            },
            montos: {
              dblSubtotal: 1000,
              dblCostoEnvio: 150,
              dblTotal: 1150,
            },
            items: [
              {
                strId: '1',
                strTitulo: 'Producto',
                intCantidad: 1,
                dblPrecioUnitario: 1000,
              }
            ],
            payer: {
              strNombre: 'Juan',
              strApellido: 'Pérez',
              strEmail: 'juan@email.com',
              objTelefono: { strNumero: '5512345678' }
            }
          }
        }
      });

      const resultado = data.crearPreferenciaMercadoPago;
      
      // Verificar si NO hay redirección (pago directo exitoso)
      if (!resultado.strInitPoint || resultado.strInitPoint === '') {
        console.log('✅ Pago procesado directamente (sin redirección)');
        
        if (resultado.strEstado === 'APROBADO') {
          alert('¡Pago aprobado!');
          // Redirigir a página de éxito
        } else if (resultado.strEstado === 'RECHAZADO') {
          alert('Pago rechazado. Intenta con otra tarjeta.');
        }
      } else {
        // Si hay strInitPoint, significa que falló la tokenización
        console.error('❌ El backend creó una preferencia (no debería pasar)');
      }
      
    } catch (error) {
      console.error('Error al procesar pago:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Datos de Pago</h1>
      
      <TarjetaCheckout onTokenGenerated={handleTokenGenerated} />
    </div>
  );
}
```

---

## 🔒 Seguridad: ¿Qué Guardar en la Base de Datos?

### ❌ NUNCA Guardes:
- Número de tarjeta completo
- CVV
- Token de MercadoPago (expira rápido)

### ✅ SÍ Puedes Guardar:
- Últimos 4 dígitos de la tarjeta
- Nombre del titular
- Tipo de tarjeta (Visa, Mastercard, etc.)
- Fecha de expiración

### Ejemplo de Registro en `tbTarjetas`:

```typescript
const nuevaTarjeta = await db.tbTarjetas.create({
  data: {
    intCliente: 1,
    strNumeroTarjeta: '3704', // ← Solo últimos 4 dígitos
    strNombreTarjeta: 'Juan Pérez',
    strTipoTarjeta: 'visa',
    strFechaExpiracion: '12/25',
  }
});
```

---

## 🧪 Pruebas con Tarjetas de Prueba

### Tarjeta de Prueba Aprobada (Visa)
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/25 (cualquier fecha futura)
Nombre: APRO
```

### Flujo Esperado:
```
1. Usuario ingresa: 4509 9535 6623 3704
2. Frontend tokeniza: "7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d"
3. Se guarda en BD: "3704"
4. Se envía al backend: "7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d"
5. Backend logs:
   🔐 Token FINAL: Presente ✅
   💳 Usando Checkout API
   ✅ Pago directo procesado: 12345678
   📊 Estado: approved
6. Frontend recibe:
   {
     "strInitPoint": "",
     "strEstado": "APROBADO"
   }
```

---

## 📊 Comparación: Antes vs Después

### ❌ ANTES (Incorrecto)
```typescript
// Frontend
const numeroTarjeta = '4509953566233704';
// Se envía al backend:
strTokenTarjeta: '4509953566233704' // ← Esto NO es un token

// Backend logs:
🔐 Token FINAL: Presente ✅
💳 Usando Checkout API
❌ Error: Invalid token
```

### ✅ DESPUÉS (Correcto)
```typescript
// Frontend
const token = await mp.fields.createCardToken({ ... });
console.log(token.id); // "7a2b4c6d8e0f..."

// Se envía al backend:
strTokenTarjeta: '7a2b4c6d8e0f...' // ← Token real de MercadoPago

// Backend logs:
🔐 Token FINAL: Presente ✅
💳 Usando Checkout API
✅ Pago directo procesado: 12345678
📊 Estado: approved
```

---

## 🔍 Debugging: Verificar que Funciona

### 1. Console del Frontend:
```
✅ MercadoPago SDK inicializado
🔐 Tokenizando tarjeta...
✅ Token generado: 7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d
📊 Datos de la tarjeta: { cardNumber: "450995XXXXXX3704", ... }
🎉 Token recibido: 7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d
```

### 2. Console del Backend:
```
🔵 Procesando pago con MercadoPago...
🔍 DEBUG - Buscando token en:
  - data.strTokenTarjeta: 7a2b4c6d8e0f1a2b3c4d5e6f7a8b9c0d ✅
  - data.formData.strTokenTarjeta: ❌
  - metadata.token_tarjeta: ❌
  - metadata.strTokenTarjeta: ❌
🔐 Token FINAL: Presente ✅
💳 Usando Checkout API (pago directo con token)
✅ Pago directo procesado: 12345678
📊 Estado: approved
💰 Monto: 1150
💾 Pago guardado en BD: 1
```

### 3. Respuesta del Backend:
```json
{
  "data": {
    "crearPreferenciaMercadoPago": {
      "intPago": 1,
      "strPreferenciaId": "12345678",
      "strInitPoint": "", // ← VACÍO = Pago directo exitoso
      "strEstado": "APROBADO",
      "bolEmailEnviado": true
    }
  }
}
```

---

## 📋 Checklist de Implementación

- [ ] Instalar `@mercadopago/sdk-react`
- [ ] Agregar script de MercadoPago en layout
- [ ] Crear componente `TarjetaCheckout.tsx`
- [ ] Implementar función `handleTokenGenerated`
- [ ] Enviar **token** (no número de tarjeta) al backend
- [ ] Guardar solo **últimos 4 dígitos** en BD
- [ ] Probar con tarjeta de prueba: 4509 9535 6623 3704
- [ ] Verificar logs del frontend (token generado)
- [ ] Verificar logs del backend (token recibido)
- [ ] Confirmar respuesta: `strInitPoint: ""`
- [ ] Confirmar estado: `strEstado: "APROBADO"`

---

## 🚨 Errores Comunes

### Error 1: "Invalid token"
**Causa**: Estás enviando el número de tarjeta en lugar del token
**Solución**: Tokenizar primero con `mp.fields.createCardToken()`

### Error 2: "Token expired"
**Causa**: El token de MercadoPago tiene duración limitada (7 días)
**Solución**: Generar nuevo token cada vez que se procese un pago

### Error 3: "MercadoPago is not defined"
**Causa**: SDK no cargado o falta clave pública
**Solución**: Verificar que el script esté en el HTML y que `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` esté configurado

### Error 4: Sigue redirigiendo a MercadoPago
**Causa**: El token no está llegando al backend
**Solución**: Verificar logs de DEBUG en el backend para ver dónde busca el token

---

## 🎯 Resumen

1. **Token ≠ Número de tarjeta**
   - Token: `"7a2b4c6d8e0f..."` (generado por MercadoPago)
   - Número: `"4509953566233704"` (ingresado por el usuario)

2. **El flujo correcto es**:
   ```
   Número de tarjeta → Tokenizar → Token → Enviar al backend
   ```

3. **En la BD solo guardar**:
   - Últimos 4 dígitos
   - Nombre del titular
   - Tipo de tarjeta

4. **Nunca transmitir**:
   - Número completo de tarjeta
   - CVV
   - Datos sensibles

---

¡Con esta implementación tu checkout funcionará con Checkout API sin redirección! 🚀✨
