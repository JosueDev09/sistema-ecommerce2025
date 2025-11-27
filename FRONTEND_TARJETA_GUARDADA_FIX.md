# 🔧 Fix: Enviar ID de Tarjeta Guardada al Backend

## ✅ Backend Ya Actualizado

El backend ahora:
1. Detecta cuando se envía `strTokenTarjeta: "USAR_TOKEN_GUARDADO"`
2. Busca el campo `intTarjetaGuardada` en `formData`
3. Consulta la tarjeta en la base de datos
4. Recupera el `strTokenMercadoPago` guardado
5. Procesa el pago con ese token

## 🎯 Cambios Necesarios en el Frontend

### useCheckoutSubmit.ts

Encuentra donde se detecta el uso de tarjeta guardada y modifica así:

```typescript
// ❌ ANTES (Incorrecto)
if (formData.usandoTarjetaGuardada) {
  token = "USAR_TOKEN_GUARDADO";
}

// ✅ DESPUÉS (Correcto)
if (formData.usandoTarjetaGuardada && formData.tarjetaSeleccionada) {
  console.log('💳 Usando tarjeta guardada:', formData.tarjetaSeleccionada);
  token = "USAR_TOKEN_GUARDADO";
  
  // ✨ IMPORTANTE: Enviar el ID de la tarjeta guardada
  intTarjetaGuardada = formData.tarjetaSeleccionada.intTarjeta;
}
```

### Ejemplo Completo de Variables de Mutation:

```typescript
const { data } = await crearPago({
  variables: {
    data: {
      intPedido: pedido.intPedido,
      intCliente: cliente.intCliente,
      intDireccion: direccion.intDireccion,
      
      // ✨ Token especial para tarjetas guardadas
      strTokenTarjeta: "USAR_TOKEN_GUARDADO",
      
      formData: {
        strNombre: formData.nombre,
        strApellido: formData.apellido,
        strEmail: formData.email,
        strTelefono: formData.telefono,
        strMetodoEnvio: formData.metodoEnvio,
        strMetodoPago: 'Tarjeta de crédito',
        strTipoTarjeta: formData.tipoTarjeta,
        intMesesSinIntereses: 1,
        
        // ✨✨ IMPORTANTE: Enviar ID de tarjeta guardada
        intTarjetaGuardada: formData.tarjetaSeleccionada.intTarjeta, // ← ESTO ES LO QUE FALTA
        
        bolUsandoTarjetaGuardada: true,
        strNumeroTarjetaUltimos4: formData.tarjetaSeleccionada.strNumeroTarjeta,
        strNombreTarjeta: formData.tarjetaSeleccionada.strNombreTarjeta,
      },
      montos: {
        dblSubtotal: subtotal,
        dblCostoEnvio: costoEnvio,
        dblTotal: total,
      },
      items: items.map(item => ({
        strId: item.id.toString(),
        strTitulo: item.nombre,
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
    }
  }
});
```

## 📊 Flujo Completo:

```
Frontend                              Backend
   |                                     |
   |-- strTokenTarjeta: "USAR_TOKEN"    |
   |   intTarjetaGuardada: 1        --->|
   |                                     |
   |                                     |-- Detecta "USAR_TOKEN_GUARDADO"
   |                                     |-- Lee intTarjetaGuardada: 1
   |                                     |-- SELECT * FROM tbTarjetas WHERE intTarjeta = 1
   |                                     |-- Recupera strTokenMercadoPago: "abc123..."
   |                                     |-- Usa token para crear pago
   |                                     |-- MercadoPago aprueba/rechaza
   |                                     |
   |<-- strEstado: "APROBADO"        ---|
   |    strInitPoint: ""                 |
```

## 🧪 Testing

### Verifica estos logs en el backend:

```bash
🔵 Procesando pago con MercadoPago...
🔍 DEBUG - Buscando token en:
  - data.strTokenTarjeta: USAR_TOKEN_GUARDADO ✅
  - data.formData.strTokenTarjeta: ❌
  - metadata.token_tarjeta: ❌
  - metadata.strTokenTarjeta: ❌
💳 Detectada tarjeta guardada - Buscando token en BD...
📋 ID Tarjeta guardada: 1
✅ Token recuperado de BD: 7a2b4c6d8e0f1a2b3c4d...
🔐 Token FINAL: Presente ✅
💳 Usando Checkout API (pago directo con token)
✅ Pago directo procesado: 12345678
📊 Estado: approved
💰 Monto: 23999
💾 Pago guardado en BD: 1
```

### Si NO envías `intTarjetaGuardada`:

```bash
❌ Error al procesar el pago: Card Token not found
```

Porque el backend intentará usar "USAR_TOKEN_GUARDADO" como token real, y MercadoPago lo rechazará.

## 🔧 Código de Ejemplo Completo:

```typescript
// useCheckoutSubmit.ts

export const useCheckoutSubmit = () => {
  const handlePagar = async (formData: FormData) => {
    try {
      let token: string;
      let intTarjetaGuardada: number | undefined;

      // Determinar si usa tarjeta guardada o nueva
      if (formData.usandoTarjetaGuardada && formData.tarjetaSeleccionada) {
        // ===== TARJETA GUARDADA =====
        console.log('💳 Usando tarjeta guardada');
        console.log('📋 Tarjeta ID:', formData.tarjetaSeleccionada.intTarjeta);
        
        token = "USAR_TOKEN_GUARDADO";
        intTarjetaGuardada = formData.tarjetaSeleccionada.intTarjeta; // ✨ IMPORTANTE
        
      } else {
        // ===== TARJETA NUEVA =====
        console.log('💳 Tokenizando tarjeta nueva...');
        
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
        
        token = tokenResult.id;
        console.log('✅ Token generado:', token);
      }

      // Enviar pago al backend
      const { data } = await crearPago({
        variables: {
          data: {
            intPedido: pedido.intPedido,
            intCliente: cliente.intCliente,
            intDireccion: direccion.intDireccion,
            
            strTokenTarjeta: token, // "USAR_TOKEN_GUARDADO" o token real
            
            formData: {
              strNombre: formData.nombre,
              strApellido: formData.apellido,
              strEmail: formData.email,
              strTelefono: formData.telefono,
              strMetodoEnvio: formData.metodoEnvio,
              strMetodoPago: 'Tarjeta de crédito',
              strTipoTarjeta: formData.tipoTarjeta,
              intMesesSinIntereses: 1,
              
              // ✨ Solo enviar si es tarjeta guardada
              intTarjetaGuardada: intTarjetaGuardada,
              
              bolUsandoTarjetaGuardada: formData.usandoTarjetaGuardada || false,
              strNumeroTarjetaUltimos4: formData.usandoTarjetaGuardada 
                ? formData.tarjetaSeleccionada.strNumeroTarjeta 
                : formData.numeroTarjeta.slice(-4),
              strNombreTarjeta: formData.usandoTarjetaGuardada 
                ? formData.tarjetaSeleccionada.strNombreTarjeta 
                : formData.nombreTarjeta,
            },
            montos: { /* ... */ },
            items: [ /* ... */ ],
            payer: { /* ... */ }
          }
        }
      });

      // Verificar resultado
      const resultado = data.crearPreferenciaMercadoPago;
      
      if (!resultado.strInitPoint || resultado.strInitPoint === '') {
        console.log('✅ Pago procesado directamente');
        
        if (resultado.strEstado === 'APROBADO') {
          toast.success('¡Pago aprobado!');
          router.push('/checkout/success');
        } else if (resultado.strEstado === 'RECHAZADO') {
          toast.error('Pago rechazado. Intenta con otra tarjeta.');
        }
      } else {
        console.error('❌ Se creó preferencia (no debería pasar)');
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      toast.error(error.message);
    }
  };

  return { handlePagar };
};
```

## 📋 Checklist:

- [x] Backend actualizado para detectar tarjetas guardadas
- [x] Campo `intTarjetaGuardada` agregado al schema GraphQL
- [ ] Frontend: Detectar cuando se usa tarjeta guardada
- [ ] Frontend: Asignar `intTarjetaGuardada = tarjetaSeleccionada.intTarjeta`
- [ ] Frontend: Enviar `intTarjetaGuardada` en `formData`
- [ ] Frontend: Enviar `strTokenTarjeta: "USAR_TOKEN_GUARDADO"`
- [ ] Testing: Verificar logs del backend
- [ ] Testing: Confirmar pago aprobado sin redirección

## 🚨 Errores Comunes:

### Error: "Card Token not found"
**Causa**: No se envió `intTarjetaGuardada` o es `undefined`
**Solución**: Asegurar que `formData.intTarjetaGuardada` tenga el ID de la tarjeta

### Error: "Tarjeta guardada no encontrada"
**Causa**: El ID de tarjeta no existe en la base de datos
**Solución**: Verificar que la tarjeta existe con `SELECT * FROM "tbTarjetas" WHERE "intTarjeta" = X`

### Error: "Esta tarjeta no tiene un token válido guardado"
**Causa**: La tarjeta se guardó antes de implementar el campo `strTokenMercadoPago`
**Solución**: Eliminar tarjeta y agregarla de nuevo (tokenizando primero)

---

¡Con esto tu checkout con tarjetas guardadas funcionará correctamente! 🚀✨
