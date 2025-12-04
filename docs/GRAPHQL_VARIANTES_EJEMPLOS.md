# 📚 Ejemplos de Queries GraphQL - Sistema de Variantes

## 📖 Índice
- [Consultar Producto con Variantes](#consultar-producto-con-variantes)
- [Obtener Todas las Variantes](#obtener-todas-las-variantes)
- [Buscar Variante Específica](#buscar-variante-específica)
- [Filtrar por Talla](#filtrar-por-talla)
- [Filtrar por Color](#filtrar-por-color)
- [Ejemplos de Uso en Frontend](#ejemplos-de-uso-en-frontend)

---

## 🎯 Consultar Producto con Variantes

### Query Completa
Obtiene un producto con todas sus variantes activas, ordenadas por talla y color.

```graphql
query ObtenerProductoConVariantes($intProducto: Int!) {
  obtenerProductoConVariantes(intProducto: $intProducto) {
    intProducto
    strNombre
    strSKU
    strMarca
    strDescripcion
    strDescripcionLarga
    dblPrecio
    intStock
    bolActivo
    bolDestacado
    strEstado
    strImagen
    jsonImagenes
    
    # Categoría
    tbCategoria {
      intCategoria
      strNombre
      strImagen
    }
    
    # Variantes
    tbProductoVariantes {
      intVariante
      strTalla
      strColor
      intStock
      strSKU
      dblPrecioAdicional
      strImagen
      bolActivo
      datCreacion
    }
  }
}
```

### Variables
```json
{
  "intProducto": 1
}
```

### Respuesta Ejemplo
```json
{
  "data": {
    "obtenerProductoConVariantes": {
      "intProducto": 1,
      "strNombre": "Playera Deportiva",
      "strSKU": "PLAY-001",
      "strMarca": "Nike",
      "strDescripcion": "Playera deportiva de alta calidad",
      "dblPrecio": 299.00,
      "intStock": 146,
      "strImagen": "/uploads/productos/1733352400-abc123.jpg",
      "tbCategoria": {
        "intCategoria": 5,
        "strNombre": "Ropa Deportiva",
        "strImagen": "/uploads/categorias/cat-deportiva.jpg"
      },
      "tbProductoVariantes": [
        {
          "intVariante": 1,
          "strTalla": "S",
          "strColor": "Azul",
          "intStock": 15,
          "strSKU": "PLAY-001-AZU-S",
          "dblPrecioAdicional": 0,
          "bolActivo": true
        },
        {
          "intVariante": 2,
          "strTalla": "S",
          "strColor": "Rojo",
          "intStock": 10,
          "strSKU": "PLAY-001-ROJ-S",
          "dblPrecioAdicional": 0,
          "bolActivo": true
        },
        {
          "intVariante": 3,
          "strTalla": "M",
          "strColor": "Azul",
          "intStock": 25,
          "strSKU": "PLAY-001-AZU-M",
          "dblPrecioAdicional": 0,
          "bolActivo": true
        },
        {
          "intVariante": 4,
          "strTalla": "XL",
          "strColor": "Negro",
          "intStock": 5,
          "strSKU": "PLAY-001-NEG-XL",
          "dblPrecioAdicional": 50,
          "bolActivo": true
        }
      ]
    }
  }
}
```

---

## 🎨 Obtener Todas las Variantes

### Query
Obtiene solo las variantes de un producto sin los datos del producto.

```graphql
query ObtenerVariantes($intProducto: Int!) {
  obtenerVariantesPorProducto(intProducto: $intProducto) {
    intVariante
    strTalla
    strColor
    intStock
    strSKU
    dblPrecioAdicional
    strImagen
    bolActivo
  }
}
```

### Variables
```json
{
  "intProducto": 1
}
```

### Respuesta
```json
{
  "data": {
    "obtenerVariantesPorProducto": [
      {
        "intVariante": 1,
        "strTalla": "S",
        "strColor": "Azul",
        "intStock": 15,
        "strSKU": "PLAY-001-AZU-S",
        "dblPrecioAdicional": 0,
        "bolActivo": true
      },
      {
        "intVariante": 2,
        "strTalla": "M",
        "strColor": "Rojo",
        "intStock": 20,
        "strSKU": "PLAY-001-ROJ-M",
        "dblPrecioAdicional": 0,
        "bolActivo": true
      }
    ]
  }
}
```

---

## 🔍 Buscar Variante Específica

### Query
Busca una variante específica por combinación de producto, talla y color.

```graphql
query ObtenerVarianteEspecifica($intProducto: Int!, $strTalla: String!, $strColor: String!) {
  obtenerVariante(
    intProducto: $intProducto
    strTalla: $strTalla
    strColor: $strColor
  ) {
    intVariante
    strTalla
    strColor
    intStock
    strSKU
    dblPrecioAdicional
    bolActivo
  }
}
```

### Variables
```json
{
  "intProducto": 1,
  "strTalla": "XL",
  "strColor": "Azul"
}
```

### Respuesta
```json
{
  "data": {
    "obtenerVariante": {
      "intVariante": 5,
      "strTalla": "XL",
      "strColor": "Azul",
      "intStock": 10,
      "strSKU": "PLAY-001-AZU-XL",
      "dblPrecioAdicional": 50,
      "bolActivo": true
    }
  }
}
```

### Caso: Variante No Encontrada
```json
{
  "data": {
    "obtenerVariante": null
  }
}
```

---

## 👕 Filtrar por Talla

### Query
Obtiene todas las variantes de una talla específica en todos los colores disponibles.

```graphql
query ObtenerVariantesPorTalla($intProducto: Int!, $strTalla: String!) {
  obtenerVariantesPorTalla(intProducto: $intProducto, strTalla: $strTalla) {
    intVariante
    strTalla
    strColor
    intStock
    strSKU
    dblPrecioAdicional
  }
}
```

### Variables
```json
{
  "intProducto": 1,
  "strTalla": "M"
}
```

### Respuesta
```json
{
  "data": {
    "obtenerVariantesPorTalla": [
      {
        "intVariante": 6,
        "strTalla": "M",
        "strColor": "Azul",
        "intStock": 25,
        "strSKU": "PLAY-001-AZU-M",
        "dblPrecioAdicional": 0
      },
      {
        "intVariante": 7,
        "strTalla": "M",
        "strColor": "Negro",
        "intStock": 18,
        "strSKU": "PLAY-001-NEG-M",
        "dblPrecioAdicional": 0
      },
      {
        "intVariante": 8,
        "strTalla": "M",
        "strColor": "Rojo",
        "intStock": 20,
        "strSKU": "PLAY-001-ROJ-M",
        "dblPrecioAdicional": 0
      }
    ]
  }
}
```

**Uso**: Ideal para mostrar "¿En qué colores está disponible la talla M?"

---

## 🎨 Filtrar por Color

### Query
Obtiene todas las variantes de un color específico en todas las tallas disponibles.

```graphql
query ObtenerVariantesPorColor($intProducto: Int!, $strColor: String!) {
  obtenerVariantesPorColor(intProducto: $intProducto, strColor: $strColor) {
    intVariante
    strTalla
    strColor
    intStock
    strSKU
    dblPrecioAdicional
  }
}
```

### Variables
```json
{
  "intProducto": 1,
  "strColor": "Azul"
}
```

### Respuesta
```json
{
  "data": {
    "obtenerVariantesPorColor": [
      {
        "intVariante": 9,
        "strTalla": "S",
        "strColor": "Azul",
        "intStock": 15,
        "strSKU": "PLAY-001-AZU-S",
        "dblPrecioAdicional": 0
      },
      {
        "intVariante": 10,
        "strTalla": "M",
        "strColor": "Azul",
        "intStock": 25,
        "strSKU": "PLAY-001-AZU-M",
        "dblPrecioAdicional": 0
      },
      {
        "intVariante": 11,
        "strTalla": "L",
        "strColor": "Azul",
        "intStock": 20,
        "strSKU": "PLAY-001-AZU-L",
        "dblPrecioAdicional": 0
      },
      {
        "intVariante": 12,
        "strTalla": "XL",
        "strColor": "Azul",
        "intStock": 10,
        "strSKU": "PLAY-001-AZU-XL",
        "dblPrecioAdicional": 50
      }
    ]
  }
}
```

**Uso**: Ideal para mostrar "¿En qué tallas está disponible el color Azul?"

---

## 💻 Ejemplos de Uso en Frontend

### 1. Hook para Obtener Producto con Variantes

```typescript
// hooks/useProductoVariantes.ts
import { useState, useEffect } from 'react';

interface Variante {
  intVariante: number;
  strTalla: string;
  strColor: string;
  intStock: number;
  strSKU: string;
  dblPrecioAdicional: number;
}

interface Producto {
  intProducto: number;
  strNombre: string;
  dblPrecio: number;
  tbProductoVariantes: Variante[];
}

export const useProductoVariantes = (intProducto: number) => {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query ObtenerProductoConVariantes($intProducto: Int!) {
                obtenerProductoConVariantes(intProducto: $intProducto) {
                  intProducto
                  strNombre
                  dblPrecio
                  strImagen
                  tbProductoVariantes {
                    intVariante
                    strTalla
                    strColor
                    intStock
                    strSKU
                    dblPrecioAdicional
                  }
                }
              }
            `,
            variables: { intProducto }
          })
        });

        const result = await response.json();
        setProducto(result.data.obtenerProductoConVariantes);
      } catch (err) {
        setError('Error al cargar producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [intProducto]);

  return { producto, loading, error };
};
```

### 2. Componente Selector de Variantes

```tsx
// components/VarianteSelector.tsx
import React, { useState } from 'react';

interface Props {
  variantes: Variante[];
  precioBase: number;
  onSeleccionar: (variante: Variante) => void;
}

export const VarianteSelector: React.FC<Props> = ({ 
  variantes, 
  precioBase,
  onSeleccionar 
}) => {
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>('');
  const [colorSeleccionado, setColorSeleccionado] = useState<string>('');

  // Obtener tallas únicas
  const tallas = [...new Set(variantes.map(v => v.strTalla))];
  
  // Obtener colores disponibles para la talla seleccionada
  const coloresDisponibles = tallaSeleccionada 
    ? variantes
        .filter(v => v.strTalla === tallaSeleccionada)
        .map(v => v.strColor)
    : [];

  // Obtener variante seleccionada
  const varianteSeleccionada = variantes.find(
    v => v.strTalla === tallaSeleccionada && v.strColor === colorSeleccionado
  );

  const precioFinal = varianteSeleccionada 
    ? precioBase + varianteSeleccionada.dblPrecioAdicional 
    : precioBase;

  return (
    <div className="space-y-4">
      {/* Selector de Talla */}
      <div>
        <label className="block text-sm font-medium mb-2">Talla</label>
        <div className="flex gap-2">
          {tallas.map(talla => (
            <button
              key={talla}
              onClick={() => {
                setTallaSeleccionada(talla);
                setColorSeleccionado(''); // Reset color
              }}
              className={`px-4 py-2 border rounded ${
                tallaSeleccionada === talla 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white'
              }`}
            >
              {talla}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Color */}
      {tallaSeleccionada && (
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex gap-2">
            {coloresDisponibles.map(color => {
              const variante = variantes.find(
                v => v.strTalla === tallaSeleccionada && v.strColor === color
              );
              const disponible = variante && variante.intStock > 0;

              return (
                <button
                  key={color}
                  onClick={() => {
                    if (disponible) {
                      setColorSeleccionado(color);
                      onSeleccionar(variante!);
                    }
                  }}
                  disabled={!disponible}
                  className={`px-4 py-2 border rounded ${
                    colorSeleccionado === color 
                      ? 'bg-blue-600 text-white' 
                      : disponible 
                        ? 'bg-white hover:bg-gray-100' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {color}
                  {!disponible && ' (Agotado)'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Precio */}
      <div className="text-2xl font-bold">
        ${precioFinal.toFixed(2)}
        {varianteSeleccionada?.dblPrecioAdicional > 0 && (
          <span className="text-sm text-gray-600 ml-2">
            (+${varianteSeleccionada.dblPrecioAdicional} por talla XL)
          </span>
        )}
      </div>

      {/* Stock disponible */}
      {varianteSeleccionada && (
        <p className="text-sm text-gray-600">
          {varianteSeleccionada.intStock} disponibles
        </p>
      )}
    </div>
  );
};
```

### 3. Verificar Stock antes de Agregar al Carrito

```typescript
// utils/verificarStock.ts
export const verificarStockVariante = async (
  intProducto: number,
  strTalla: string,
  strColor: string,
  cantidad: number
): Promise<{ disponible: boolean; stockActual: number }> => {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query VerificarStock($intProducto: Int!, $strTalla: String!, $strColor: String!) {
          obtenerVariante(
            intProducto: $intProducto
            strTalla: $strTalla
            strColor: $strColor
          ) {
            intStock
          }
        }
      `,
      variables: { intProducto, strTalla, strColor }
    })
  });

  const result = await response.json();
  const variante = result.data.obtenerVariante;

  if (!variante) {
    return { disponible: false, stockActual: 0 };
  }

  return {
    disponible: variante.intStock >= cantidad,
    stockActual: variante.intStock
  };
};

// Uso en carrito
const agregarAlCarrito = async () => {
  const { disponible, stockActual } = await verificarStockVariante(
    1, // intProducto
    'XL', // talla
    'Azul', // color
    2 // cantidad deseada
  );

  if (!disponible) {
    alert(`Solo hay ${stockActual} unidades disponibles`);
    return;
  }

  // Agregar al carrito...
};
```

---

## 📊 Casos de Uso Comunes

### 1. Mostrar Matriz de Disponibilidad
```typescript
// Crear matriz de stock: tallas × colores
const crearMatrizStock = (variantes: Variante[]) => {
  const tallas = [...new Set(variantes.map(v => v.strTalla))];
  const colores = [...new Set(variantes.map(v => v.strColor))];
  
  return tallas.map(talla => ({
    talla,
    colores: colores.map(color => {
      const variante = variantes.find(
        v => v.strTalla === talla && v.strColor === color
      );
      return {
        color,
        stock: variante?.intStock || 0,
        disponible: (variante?.intStock || 0) > 0
      };
    })
  }));
};
```

### 2. Calcular Precio Total
```typescript
const calcularPrecioConVariante = (
  precioBase: number,
  variante: Variante
): number => {
  return precioBase + (variante.dblPrecioAdicional || 0);
};
```

### 3. Filtrar Variantes Disponibles
```typescript
const variantesDisponibles = variantes.filter(v => v.intStock > 0);
```

---

## 🎯 Tips de Rendimiento

1. **Cachear las queries** de variantes si no cambian frecuentemente
2. **Usar pagination** si un producto tiene muchas variantes (>50)
3. **Cargar variantes bajo demanda** solo cuando el usuario interactúa
4. **Implementar optimistic updates** al agregar al carrito

---

## 🔗 Recursos Adicionales

- [Prisma Unique Constraints](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#unique)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
