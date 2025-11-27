# 🔧 Código para Agregar en el Resolver

## Ubicación: `src/app/api/graphql/resolvers.ts`

Reemplaza las líneas 787-799 (donde está la búsqueda del token) con este código:

```typescript
        // Buscar token en TODOS los lugares posibles
        let tokenTarjeta = 
          data.strTokenTarjeta || 
          data.formData?.strTokenTarjeta || 
          metadata.token_tarjeta || 
          metadata.strTokenTarjeta;

        console.log("🔍 DEBUG - Buscando token en:");
        console.log("  - data.strTokenTarjeta:", data.strTokenTarjeta || "❌");
        console.log("  - data.formData.strTokenTarjeta:", data.formData?.strTokenTarjeta || "❌");
        console.log("  - metadata.token_tarjeta:", metadata.token_tarjeta || "❌");
        console.log("  - metadata.strTokenTarjeta:", metadata.strTokenTarjeta || "❌");

        // 🎯 DETECTAR SI SE ESTÁ USANDO UNA TARJETA GUARDADA
        if (tokenTarjeta === "USAR_TOKEN_GUARDADO" && data.formData?.intTarjetaGuardada) {
          console.log("💳 Detectada tarjeta guardada - Buscando token en BD...");
          console.log("📋 ID Tarjeta guardada:", data.formData.intTarjetaGuardada);

          // Buscar la tarjeta en la base de datos
          const tarjetaGuardada = await db.tbTarjetas.findUnique({
            where: { intTarjeta: data.formData.intTarjetaGuardada },
          });

          if (!tarjetaGuardada) {
            throw new Error("Tarjeta guardada no encontrada");
          }

          if (!tarjetaGuardada.strTokenMercadoPago) {
            throw new Error("Esta tarjeta no tiene un token válido guardado. Por favor, elimínala y agrégala de nuevo.");
          }

          // Usar el token guardado
          tokenTarjeta = tarjetaGuardada.strTokenMercadoPago;
          console.log("✅ Token recuperado de BD:", tokenTarjeta.substring(0, 20) + "...");
        }

        console.log("🔐 Token FINAL:", tokenTarjeta ? "Presente ✅" : "No presente ❌");
```

## Cambios Importantes:

1. **Línea 787**: Cambiar `const` a `let` para poder modificar tokenTarjeta
2. **Líneas 800-822**: Agregar detección y recuperación del token desde BD

## Logs Esperados:

Cuando uses una tarjeta guardada, verás:

```
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
```
