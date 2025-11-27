# 🔍 DEBUG: Token no llega al Backend

## Problema Identificado

El error `diff_param_bins` ocurre porque **el token NO está llegando al backend desde el frontend**.

## ✅ Solución: Corregir Frontend

### 📝 Archivo a modificar: `useCheckoutSubmit.ts`

---

## 🔧 CAMBIO 1: Descomentar strTokenTarjeta

**Ubicación:** Línea ~336 (dentro de `iniciarPagoMercadoPago`)

**BUSCAR:**
```typescript
const payloadParaBackend = {
  intPedido,
  intCliente,
  intDireccion,
  // strTokenTarjeta, // 🔐 Token generado por MercadoPago SDK - Comentado hasta que el backend lo soporte
  formData: {
```

**REEMPLAZAR POR:**
```typescript
const payloadParaBackend = {
  intPedido,
  intCliente,
  intDireccion,
  strTokenTarjeta, // 🔐 Token generado por MercadoPago SDK
  formData: {
```

---

## 🔧 CAMBIO 2: Agregar intTarjetaGuardada

**Ubicación:** Línea ~353 (dentro de `formData`)

**BUSCAR:**
```typescript
          bolUsandoTarjetaGuardada: formData.usandoTarjetaGuardada || false,
          intMesesSinIntereses: parseInt(formData.mesesSinIntereses || "1", 10),
        },
```

**REEMPLAZAR POR:**
```typescript
          bolUsandoTarjetaGuardada: formData.usandoTarjetaGuardada || false,
          intTarjetaGuardada: formData.idTarjetaGuardada || null,
          intMesesSinIntereses: parseInt(formData.mesesSinIntereses || "1", 10),
        },
```

---

## 🔧 CAMBIO 3: NO tokenizar tarjetas guardadas

**Ubicación:** Línea ~272 (inicio del bloque de tokenización)

**BUSCAR:**
```typescript
      if (formData.metodoPago === "tarjeta") {
        console.log("💳 Iniciando proceso de tokenización...");
```

**REEMPLAZAR POR:**
```typescript
      if (formData.metodoPago === "tarjeta" && !formData.usandoTarjetaGuardada) {
        console.log("💳 Iniciando proceso de tokenización (NUEVA tarjeta)...");
```

**Y DESPUÉS del cierre del bloque de tokenización, AGREGAR:**
```typescript
      } else if (formData.usandoTarjetaGuardada) {
        console.log("💳 Usando tarjeta guardada - ID:", formData.idTarjetaGuardada);
        strTokenTarjeta = "USAR_TOKEN_GUARDADO";
        
        if (!formData.idTarjetaGuardada) {
          throw new Error("No se proporcionó el ID de la tarjeta guardada");
        }
      }
```

---

## 🎯 Verificación

Después de hacer los cambios:

1. **Verifica en la consola del frontend** que se imprima:
   ```
   ✅ Token generado exitosamente: [token_largo_de_mercadopago]
   ```

2. **Verifica en logs del backend** (terminal del backend) que se imprima:
   ```
   📋 DEBUG - Buscando token en:
     - data.strTokenTarjeta: [token_aquí] ✅
   ```

3. **Si el token NO aparece en el backend:**
   - El frontend sigue teniendo `strTokenTarjeta` comentado
   - Revisa que hayas guardado el archivo
   - Reinicia el servidor frontend (`npm run dev`)

---

## 🧹 Después de que funcione

1. Elimina la tarjeta con token inválido:
   ```sql
   DELETE FROM "tbTarjetas" WHERE "intTarjeta" = 1;
   ```

2. Agrega una nueva tarjeta y verifica que el token guardado tenga 40-50 caracteres (no 32)

---

## ❓ ¿Por qué este error?

- El frontend tiene `strTokenTarjeta` **comentado** en la línea 336
- Por eso el backend recibe `undefined` como token
- MercadoPago rechaza con `diff_param_bins` porque no hay token válido
- El mensaje de error menciona "issuer_id" pero el problema real es la falta del token

---

**⚠️ IMPORTANTE:** Estos cambios son en el FRONTEND, no en el backend.
