# 📋 Ejemplos de Mutaciones para Checkout

Este archivo contiene ejemplos de cómo usar las mutaciones GraphQL para el proceso de checkout con Mercado Pago.

---

## 1️⃣ Crear Cliente Invitado

Esta mutación se usa cuando un cliente realiza una compra sin tener cuenta previa.

```graphql
mutation CrearClienteInvitado {
  crearClienteInvitado(
    data: {
      strNombre: "Juan Pérez"
      strEmail: "juan.perez@email.com"
      strTelefono: "4421234567"
      strUsuario: "juan_perez_123"
      strContra: "password123"
    }
  ) {
    intCliente
    strNombre
    strEmail
    strTelefono
    bolActivo
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "crearClienteInvitado": {
      "intCliente": 1,
      "strNombre": "Juan Pérez",
      "strEmail": "juan.perez@email.com",
      "strTelefono": "4421234567",
      "bolActivo": true
    }
  }
}
```

---

## 2️⃣ Crear Dirección de Envío

Después de crear el cliente, se debe crear la dirección de envío.

```graphql
mutation CrearDireccion {
  crearDireccion(
    data: {
      intCliente: 1
      strCalle: "Av. Juárez #456, Col. Centro"
      strCiudad: "Celaya"
      strEstado: "Guanajuato"
      strCP: "38000"
      strPais: "México"
    }
  ) {
    intDireccion
    strCalle
    strCiudad
    strEstado
    strCP
    strPais
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "crearDireccion": {
      "intDireccion": 1,
      "strCalle": "Av. Juárez #456, Col. Centro",
      "strCiudad": "Celaya",
      "strEstado": "Guanajuato",
      "strCP": "38000",
      "strPais": "México"
    }
  }
}
```

---

## 3️⃣ Crear Pedido con Items

Crear el pedido con los productos del carrito.

```graphql
mutation CrearPedido {
  crearPedido(
    data: {
      intCliente: 1
      dblTotal: 1299.00
      items: [
        {
          intProducto: 1
          intCantidad: 1
          dblSubtotal: 1299.00
        },
        {
          intProducto: 2
          intCantidad: 2
          dblSubtotal: 58.00
        }
      ]
    }
  ) {
    intPedido
    intCliente
    dblTotal
    strEstado
    datPedido
    tbItems {
      intPedidoItem
      intCantidad
      dblSubtotal
      tbProducto {
        intProducto
        strNombre
        dblPrecio
      }
    }
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "crearPedido": {
      "intPedido": 1,
      "intCliente": 1,
      "dblTotal": 1357.00,
      "strEstado": "PENDIENTE",
      "datPedido": "2025-11-26T14:30:00Z",
      "tbItems": [
        {
          "intPedidoItem": 1,
          "intCantidad": 1,
          "dblSubtotal": 1299.00,
          "tbProducto": {
            "intProducto": 1,
            "strNombre": "MacBook Air M2",
            "dblPrecio": 1299.00
          }
        },
        {
          "intPedidoItem": 2,
          "intCantidad": 2,
          "dblSubtotal": 58.00,
          "tbProducto": {
            "intProducto": 2,
            "strNombre": "Funda iPhone",
            "dblPrecio": 29.00
          }
        }
      ]
    }
  }
}
```

---

## 4️⃣ Crear Pago

Registrar el pago antes de procesar con Mercado Pago.

```graphql
mutation CrearPago {
  crearPago(
    data: {
      intPedido: 1
      strMetodoPago: "tarjeta_credito"
      dblMonto: 1357.00
      intCuotas: 6
      jsonDetallesPago: "{\"banco\":\"BBVA\",\"tipo\":\"visa\"}"
    }
  ) {
    intPago
    intPedido
    strMercadoPagoId
    strMetodoPago
    strEstado
    dblMonto
    intCuotas
    datCreacion
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "crearPago": {
      "intPago": 1,
      "intPedido": 1,
      "strMercadoPagoId": "MP-TEMP-1732634400000-1",
      "strMetodoPago": "tarjeta_credito",
      "strEstado": "PENDIENTE",
      "dblMonto": 1357.00,
      "intCuotas": 6,
      "datCreacion": "2025-11-26T14:30:00Z"
    }
  }
}
```

---

## 5️⃣ Actualizar Pago (después de respuesta de Mercado Pago)

Esta mutación se llama después de recibir la respuesta de Mercado Pago.

### Caso: Pago Aprobado

```graphql
mutation ActualizarPagoAprobado {
  actualizarPago(
    intPago: 1
    strMercadoPagoId: "12345678901"
    strEstado: APROBADO
  ) {
    intPago
    strMercadoPagoId
    strEstado
    tbPedido {
      intPedido
      strEstado
    }
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "actualizarPago": {
      "intPago": 1,
      "strMercadoPagoId": "12345678901",
      "strEstado": "APROBADO",
      "tbPedido": {
        "intPedido": 1,
        "strEstado": "PAGADO"
      }
    }
  }
}
```

### Caso: Pago Rechazado

```graphql
mutation ActualizarPagoRechazado {
  actualizarPago(
    intPago: 1
    strMercadoPagoId: "12345678902"
    strEstado: RECHAZADO
  ) {
    intPago
    strMercadoPagoId
    strEstado
    tbPedido {
      intPedido
      strEstado
    }
  }
}
```

**Respuesta esperada:**
```json
{
  "data": {
    "actualizarPago": {
      "intPago": 1,
      "strMercadoPagoId": "12345678902",
      "strEstado": "RECHAZADO",
      "tbPedido": {
        "intPedido": 1,
        "strEstado": "CANCELADO"
      }
    }
  }
}
```

**Nota:** Cuando el pago es rechazado, automáticamente se:
- Cancela el pedido
- Devuelve el stock de los productos al inventario

---

## 6️⃣ Consultar Pago

Obtener información de un pago específico.

```graphql
query ObtenerPago {
  obtenerPago(intPago: 1) {
    intPago
    strMercadoPagoId
    strMetodoPago
    strEstado
    dblMonto
    intCuotas
    jsonDetallesPago
    datCreacion
    tbPedido {
      intPedido
      dblTotal
      strEstado
      tbCliente {
        intCliente
        strNombre
        strEmail
      }
      tbItems {
        intPedidoItem
        intCantidad
        dblSubtotal
        tbProducto {
          strNombre
          dblPrecio
        }
      }
    }
  }
}
```

---

## 7️⃣ Consultar Pagos por Pedido

Obtener todos los pagos de un pedido específico.

```graphql
query ObtenerPagosPorPedido {
  obtenerPagosPorPedido(intPedido: 1) {
    intPago
    strMercadoPagoId
    strMetodoPago
    strEstado
    dblMonto
    intCuotas
    datCreacion
    datActualizacion
  }
}
```

---

## 🔄 Flujo Completo del Checkout

### Paso 1: Cliente y Dirección
```graphql
# 1. Crear cliente invitado
mutation {
  crearClienteInvitado(data: {...}) { intCliente }
}

# 2. Crear dirección
mutation {
  crearDireccion(data: {...}) { intDireccion }
}
```

### Paso 2: Pedido
```graphql
# 3. Crear pedido con items
mutation {
  crearPedido(data: {...}) { 
    intPedido
    dblTotal
  }
}
```

### Paso 3: Pago
```graphql
# 4. Crear registro de pago
mutation {
  crearPago(data: {...}) { 
    intPago
    strMercadoPagoId
  }
}

# 5. Procesar pago con Mercado Pago (desde el frontend)
# ... llamar a la API de Mercado Pago ...

# 6. Actualizar pago con resultado
mutation {
  actualizarPago(
    intPago: 1
    strMercadoPagoId: "ID_REAL_DE_MP"
    strEstado: APROBADO
  ) {
    intPago
    strEstado
  }
}
```

---

## ⚠️ Notas Importantes

1. **Validaciones Automáticas:**
   - Se verifica que el email no esté duplicado al crear cliente
   - Se valida stock disponible antes de crear pedido
   - Se verifica que no exista pago duplicado para un pedido
   - El stock se descuenta automáticamente al crear el pedido
   - El stock se devuelve si el pago es rechazado/cancelado

2. **Estados de Pedido:**
   - `PENDIENTE`: Pedido creado, esperando pago
   - `EN_PROCESO`: Pago iniciado
   - `PAGADO`: Pago aprobado
   - `CANCELADO`: Pago rechazado o pedido cancelado

3. **Estados de Pago:**
   - `PENDIENTE`: Pago iniciado, esperando respuesta de MP
   - `APROBADO`: Pago exitoso
   - `RECHAZADO`: Pago rechazado por MP
   - `CANCELADO`: Pago cancelado por el usuario
   - `REEMBOLSADO`: Pago devuelto

4. **Seguridad:**
   - Las contraseñas se hashean automáticamente con bcrypt
   - Se usan transacciones de BD para operaciones críticas
   - Los pagos usan ID temporal hasta confirmar con MP

---

## 🧪 Testing en GraphQL Playground

Puedes probar estas mutaciones en:
```
http://localhost:3000/api/graphql
```

O usar herramientas como:
- Apollo Studio
- Postman
- Insomnia
- GraphQL Playground

---

## 📝 Variables para Testing

```json
{
  "clienteData": {
    "strNombre": "Juan Pérez",
    "strEmail": "juan.perez@test.com",
    "strTelefono": "4421234567",
    "strUsuario": "juan_test",
    "strContra": "test123"
  },
  "direccionData": {
    "intCliente": 1,
    "strCalle": "Av. Test 123",
    "strCiudad": "Celaya",
    "strEstado": "Guanajuato",
    "strCP": "38000",
    "strPais": "México"
  },
  "pedidoData": {
    "intCliente": 1,
    "dblTotal": 1299.00,
    "items": [
      {
        "intProducto": 1,
        "intCantidad": 1,
        "dblSubtotal": 1299.00
      }
    ]
  }
}
```

Uso en mutation:
```graphql
mutation CrearCliente($clienteData: ClienteInvitadoInput!) {
  crearClienteInvitado(data: $clienteData) {
    intCliente
    strNombre
  }
}
```
