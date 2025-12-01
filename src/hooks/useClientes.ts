import { useState, useEffect } from "react";

interface Direccion {
  intDireccion: number;
  strCalle: string;
  strNumeroExterior: string;
  strNumeroInterior?: string;
  strColonia: string;
  strCiudad: string;
  strEstado: string;
  strCP: string;
  strPais: string;
  strReferencias?: string;
}

interface PedidoCliente {
  intPedido: number;
  dblTotal: number;
  strEstado: string;
  strEstadoPago: string;
  datPedido: string;
  tbItems: {
    intCantidad: number;
    dblSubtotal: number;
    tbProducto: {
      strNombre: string;
      strImagen?: string;
    };
  }[];
}

interface Cliente {
  intCliente: number;
  strNombre: string;
  strUsuario: string;
  strEmail: string;
  strTelefono?: string;
  bolActivo: boolean;
  datRegistro: string;
  tbDirecciones?: Direccion[];
  tbPedidos?: PedidoCliente[];
}

interface UseClientesReturn {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClientes(): UseClientesReturn {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query {
          obtenerClientes {
            intCliente
            strNombre
            strUsuario
            strEmail
            strTelefono
            bolActivo
            datRegistro
            tbDirecciones {
              intDireccion
              strCalle
              strNumeroExterior
              strNumeroInterior
              strColonia
              strCiudad
              strEstado
              strCP
              strPais
              strReferencias
            }
            tbPedidos {
              intPedido
              dblTotal
              strEstado
              strEstadoPago
              datPedido
              tbItems {
                intCantidad
                dblSubtotal
                tbProducto {
                  strNombre
                  strImagen
                }
              }
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

      const { data, errors } = await response.json();

      if (errors) {
        console.error("GraphQL Errors:", errors);
        throw new Error(errors[0]?.message || "Error al cargar clientes");
      }

      setClientes(data.obtenerClientes || []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
  };
}
