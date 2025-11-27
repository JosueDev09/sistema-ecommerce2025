# 🔐 Tokenización de Tarjeta en Frontend

## 1️⃣ Instalar MercadoPago SDK

```bash
pnpm add @mercadopago/sdk-react
```

## 2️⃣ Crear Hook para Tokenizar Tarjeta

Crea el archivo: `src/hooks/useMercadoPago.ts`

```typescript
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const useMercadoPago = () => {
  const [mp, setMp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar script de MercadoPago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    
    script.onload = () => {
      const mercadopago = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
        { locale: 'es-MX' }
      );
      setMp(mercadopago);
      setIsLoading(false);
      console.log('✅ MercadoPago SDK cargado');
    };

    script.onerror = () => {
      console.error('❌ Error al cargar MercadoPago SDK');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createCardToken = async (cardData: {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType?: string;
    identificationNumber?: string;
  }) => {
    if (!mp) {
      throw new Error('MercadoPago SDK no está cargado');
    }

    try {
      console.log('🔐 Tokenizando tarjeta...');
      
      const token = await mp.createCardToken({
        cardNumber: cardData.cardNumber.replace(/\s/g, ''), // Eliminar espacios
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.cardExpirationMonth,
        cardExpirationYear: cardData.cardExpirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType || 'RFC',
        identificationNumber: cardData.identificationNumber || 'XAXX010101000'
      });

      console.log('✅ Token creado:', token.id);
      return token;
    } catch (error: any) {
      console.error('❌ Error al tokenizar tarjeta:', error);
      throw new Error(error.message || 'Error al procesar la tarjeta');
    }
  };

  return {
    mp,
    isLoading,
    createCardToken
  };
};
```

## 3️⃣ Usar en tu Componente de Checkout

```typescript
'use client';

import { useState } from 'react';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { useMutation } from '@apollo/client';
import { CREAR_PREFERENCIA_MERCADOPAGO } from '@/graphql/mutations';

export default function CheckoutPage() {
  const { isLoading: mpLoading, createCardToken } = useMercadoPago();
  const [crearPreferencia] = useMutation(CREAR_PREFERENCIA_MERCADOPAGO);
  
  const [formData, setFormData] = useState({
    // Datos del cliente
    strNombre: 'Carolina',
    strApellido: 'Vallejo',
    strEmail: 'carolinavrms@gmail.com',
    strTelefono: '8334749560',
    
    // Datos de la tarjeta
    strNumeroTarjeta: '4509 9535 6623 3704', // Tarjeta de prueba
    strNombreTarjeta: 'APRO',
    strFechaExpiracion: '11/25',
    strCVV: '123',
    strTipoTarjeta: 'credito',
    intMesesSinIntereses: 1,
    
    // Dirección
    strCalle: 'San Eduardo',
    strNumeroExterior: '5415',
    strColonia: 'Condocasa Linda Vista',
    strCiudad: 'Guadalupe',
    strEstado: 'Nuevo Leon',
    strCodigoPostal: '67125',
    
    // Envío
    strMetodoEnvio: 'estandar',
    strMetodoPago: 'tarjeta',
  });

  const handleFinalizarCompra = async () => {
    try {
      console.log('🚀 Iniciando proceso de pago...');

      // 1️⃣ TOKENIZAR LA TARJETA
      const [mes, anio] = formData.strFechaExpiracion.split('/');
      
      const cardToken = await createCardToken({
        cardNumber: formData.strNumeroTarjeta,
        cardholderName: formData.strNombreTarjeta,
        cardExpirationMonth: mes,
        cardExpirationYear: `20${anio}`, // 25 → 2025
        securityCode: formData.strCVV,
        identificationType: 'RFC',
        identificationNumber: 'XAXX010101000'
      });

      console.log('✅ Token obtenido:', cardToken.id);

      // 2️⃣ OBTENER ÚLTIMOS 4 DÍGITOS
      const strNumeroTarjetaUltimos4 = formData.strNumeroTarjeta
        .replace(/\s/g, '')
        .slice(-4);

      // 3️⃣ ENVIAR MUTATION CON EL TOKEN
      const resultado = await crearPreferencia({
        variables: {
          data: {
            intPedido: 1, // Tu ID de pedido
            intCliente: 1, // Tu ID de cliente
            intDireccion: 1, // Tu ID de dirección
            
            // ⭐ EL TOKEN VA AQUÍ
            strTokenTarjeta: cardToken.id,
            
            formData: {
              strNombre: formData.strNombre,
              strApellido: formData.strApellido,
              strEmail: formData.strEmail,
              strTelefono: formData.strTelefono,
              strCalle: formData.strCalle,
              strNumeroExterior: formData.strNumeroExterior,
              strColonia: formData.strColonia,
              strCiudad: formData.strCiudad,
              strEstado: formData.strEstado,
              strCodigoPostal: formData.strCodigoPostal,
              strMetodoEnvio: formData.strMetodoEnvio,
              strMetodoPago: formData.strMetodoPago,
              strNumeroTarjeta: `**** **** **** ${strNumeroTarjetaUltimos4}`,
              strNombreTarjeta: formData.strNombreTarjeta,
              strTipoTarjeta: formData.strTipoTarjeta,
              strFechaExpiracion: formData.strFechaExpiracion,
              intMesesSinIntereses: formData.intMesesSinIntereses,
              strCVV: formData.strCVV,
              strNumeroTarjetaUltimos4: strNumeroTarjetaUltimos4,
            },
            
            montos: {
              dblSubtotal: 23999,
              dblCostoEnvio: 0,
              dblTotal: 23999
            },
            
            items: [{
              strId: '1',
              strTitulo: 'iPhone 15',
              strDescripcion: 'iPhone 15',
              strImagenURL: 'https://example.com/image.jpg',
              strCategoriaId: 'electronics',
              intCantidad: 1,
              dblPrecioUnitario: 23999
            }],
            
            payer: {
              strNombre: formData.strNombre,
              strApellido: formData.strApellido,
              strEmail: formData.strEmail,
              objTelefono: {
                strNumero: formData.strTelefono
              },
              objDireccion: {
                strCodigoPostal: formData.strCodigoPostal,
                strCalle: formData.strCalle,
                strNumero: formData.strNumeroExterior
              }
            },
            
            metadata: JSON.stringify({
              pedido_id: 1,
              cliente_id: 1
            })
          }
        }
      });

      console.log('✅ Resultado:', resultado.data);

      const { intPago, strEstado, strInitPoint } = resultado.data.crearPreferenciaMercadoPago;

      // 4️⃣ VERIFICAR RESULTADO
      if (strEstado === 'APROBADO') {
        console.log('✅ ¡PAGO APROBADO!');
        // Redirigir a página de éxito
        window.location.href = '/checkout/success';
      } else if (strEstado === 'RECHAZADO') {
        console.log('❌ PAGO RECHAZADO');
        alert('Tu pago fue rechazado. Intenta con otra tarjeta.');
      } else if (strInitPoint && strInitPoint !== '') {
        console.log('🌐 Redirigiendo a Checkout Pro...');
        // Si no hay token, redirige a MercadoPago
        window.location.href = strInitPoint;
      } else {
        console.log('⏳ PAGO PENDIENTE');
        alert('Tu pago está en proceso.');
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (mpLoading) {
    return <div>Cargando MercadoPago...</div>;
  }

  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={handleFinalizarCompra}>
        Finalizar Compra
      </button>
    </div>
  );
}
```

## 4️⃣ GraphQL Mutation

```graphql
mutation CrearPreferenciaMercadoPago($data: PreferenciaMercadoPagoInput!) {
  crearPreferenciaMercadoPago(data: $data) {
    intPago
    strPreferenciaId
    strInitPoint
    strEstado
  }
}
```

## 🧪 Tarjetas de Prueba

### ✅ Aprobada
```
Número: 4509 9535 6623 3704
Nombre: APRO
CVV: 123
Fecha: 11/25
```

### ❌ Rechazada
```
Número: 4000 0000 0000 0002
Nombre: OTHE
CVV: 123
Fecha: 11/25
```

### ⏳ Pendiente
```
Número: 4009 1751 8636 6623
Nombre: CONT
CVV: 123
Fecha: 11/25
```

## 🔄 Flujo Completo

```
Usuario ingresa datos de tarjeta
          ↓
Frontend tokeniza con MercadoPago SDK
          ↓
Obtiene token (tok_xxxxxxxxxxxx)
          ↓
Envía mutation con strTokenTarjeta
          ↓
Backend detecta token
          ↓
Crea pago directo con Payment API
          ↓
Retorna resultado inmediato
          ↓
Frontend muestra resultado (SIN REDIRECCIÓN)
```

## ✅ Checklist

- [ ] Instalar `@mercadopago/sdk-react`
- [ ] Crear hook `useMercadoPago.ts`
- [ ] Agregar `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` en `.env`
- [ ] Tokenizar tarjeta antes de enviar mutation
- [ ] Enviar token en campo `strTokenTarjeta`
- [ ] Probar con tarjetas de prueba

---

¡Con esto tu checkout procesará pagos directamente sin salir de tu sitio! 🚀
