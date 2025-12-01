"use client";

import { useState, useEffect } from "react";

export interface Producto {
  intProducto: number;
  strNombre: string;
  strSKU: string | null;
  strMarca: string | null;
  dblPrecio: number;
  intStock: number;
  intStockMinimo: number | null;
  bolActivo: boolean;
  strEstado: string;
  strImagen: string | null;
  tbCategoria: {
    intCategoria: number;
    strNombre: string;
  };
}

export interface EstadisticasInventario {
  totalProductos: number;
  productosActivos: number;
  productosInactivos: number;
  totalValorInventario: number;
  productosBajoStock: number;
  productosSinStock: number;
}

export function useExistencias() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasInventario>({
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
    totalValorInventario: 0,
    productosBajoStock: 0,
    productosSinStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExistencias = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query {
          obtenerProductos {
            intProducto
            strNombre
            strSKU
            strMarca
            dblPrecio
            intStock
            intStockMinimo
            bolActivo
            strEstado
            strImagen
            tbCategoria {
              intCategoria
              strNombre
            }
          }
        }
      `;

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      const productosData = data.data.obtenerProductos;
      setProductos(productosData);

      // Calcular estadísticas
      const stats: EstadisticasInventario = {
        totalProductos: productosData.length,
        productosActivos: productosData.filter((p: Producto) => p.bolActivo).length,
        productosInactivos: productosData.filter((p: Producto) => !p.bolActivo).length,
        totalValorInventario: productosData.reduce(
          (acc: number, p: Producto) => acc + p.dblPrecio * p.intStock,
          0
        ),
        productosBajoStock: productosData.filter(
          (p: Producto) =>
            p.intStock > 0 &&
            p.intStockMinimo &&
            p.intStock <= p.intStockMinimo
        ).length,
        productosSinStock: productosData.filter((p: Producto) => p.intStock === 0)
          .length,
      };

      setEstadisticas(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error al cargar existencias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistencias();
  }, []);

  return {
    productos,
    estadisticas,
    loading,
    error,
    refetch: fetchExistencias,
  };
}
