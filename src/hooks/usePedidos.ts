'use client';

import { useState, useEffect, useMemo } from 'react';
import { EstadoPedido } from '../lib/pedidosUtils';

// Definición de tipos basados en el schema GraphQL
export interface Producto {
  intProducto: number;
  strNombre: string;
  strSKU?: string;
  strMarca?: string;
  dblPrecio: number;
  strImagen?: string;
}

export interface PedidoItem {
  intPedidoItem: number;
  intCantidad: number;
  dblSubtotal: number;
  tbProducto: Producto;
}

export interface Cliente {
  intCliente: number;
  strNombre: string;
  strEmail: string;
  strTelefono?: string;
}

export interface Direccion {
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

export interface Pago {
  intPago: number;
  strMetodoPago: string;
  strEstado: string;
  dblMonto: number;
}

export interface Pedido {
  intPedido: number;
  intCliente: number;
  dblSubtotal: number;
  dblCostoEnvio: number;
  dblTotal: number;
  strEstado: EstadoPedido;       // 🚚 Estado de envío
  strEstadoPago: string;          // 💰 Estado de pago (NUEVO)
  strMetodoEnvio?: string;
  datPedido: string;
  tbClientes?: Cliente;
  tbDirecciones?: Direccion;
  tbItems?: PedidoItem[];  // ✨ Ahora es opcional
  tbPagos?: Pago;
  strNumeroSeguimiento?: string;
}

interface UsePedidosReturn {
  pedidos: Pedido[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterStatus: string;
  selectedOrder: Pedido | null;
  showModal: boolean;
  filteredPedidos: Pedido[];
  statusCounts: Record<string, number>;
  updatingStatus: boolean;
  setSearchTerm: (term: string) => void;
  setFilterStatus: (status: string) => void;
  setSelectedOrder: (order: Pedido | null) => void;
  setShowModal: (show: boolean) => void;
  openOrderDetail: (pedido: Pedido) => void;
  actualizarEstadoPedido: (intPedido: number, nuevoEstado: EstadoPedido, strNumeroSeguimiento?: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const QUERY_OBTENER_PEDIDOS = `
  query ObtenerPedidos {
    obtenerPedidos {
      intPedido
      intCliente
      dblSubtotal
      dblCostoEnvio
      dblTotal
      strEstado
      strEstadoPago
      strMetodoEnvio
      datPedido
      tbClientes {
        intCliente
        strNombre
        strEmail
        strTelefono
      }
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
      tbItems {
        intPedidoItem
        intCantidad
        dblSubtotal
        tbProducto {
          intProducto
          strNombre
          strSKU
          strMarca
          dblPrecio
          strImagen
        }
      }
      tbPagos {
        intPago
        strMetodoPago
        strEstado
        dblMonto
      }
    }
  }
`;

export function usePedidos(): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: QUERY_OBTENER_PEDIDOS,
        }),
      });

      //console.log('Fetch response:', response);

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0]?.message || 'Error al obtener pedidos');
      }

      setPedidos(data.obtenerPedidos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const cliente = pedido.tbClientes;
      const pedidoId = `#${pedido.intPedido}`;
      
      //  console.log(pedidos);

      const matchesSearch = 
        pedidoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.strNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.strEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'todos' || pedido.strEstado === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [pedidos, searchTerm, filterStatus]);

  const statusCounts = useMemo(() => {
    return {
      todos: pedidos.length,
      PENDIENTE: pedidos.filter((p) => p.strEstado === 'PENDIENTE').length,
      PROCESANDO: pedidos.filter((p) => p.strEstado === 'PROCESANDO').length,
      EMPAQUETANDO: pedidos.filter((p) => p.strEstado === 'EMPAQUETANDO').length,
      ENVIADO: pedidos.filter((p) => p.strEstado === 'ENVIADO').length,
      ENTREGADO: pedidos.filter((p) => p.strEstado === 'ENTREGADO').length,
      CANCELADO: pedidos.filter((p) => p.strEstado === 'CANCELADO').length,
    };
  }, [pedidos]);

  const actualizarEstadoPedido = async (intPedido: number, nuevoEstado: EstadoPedido, strNumeroSeguimiento?: string): Promise<boolean> => {
    try {
      setUpdatingStatus(true);
      console.log('Actualizando estado del pedido:', intPedido, 'a', nuevoEstado, 'con seguimiento:', strNumeroSeguimiento);
      const MUTATION_ACTUALIZAR_ESTADO = `
        mutation ActualizarEstadoPedido($intPedido: Int!, $strEstado: EstadoPedido!, $strNumeroSeguimiento: String) {
          actualizarEstadoPedido(intPedido: $intPedido, strEstado: $strEstado, strNumeroSeguimiento: $strNumeroSeguimiento) {
            intPedido
            strEstado
            strNumeroSeguimiento
            datActualizacion
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: MUTATION_ACTUALIZAR_ESTADO,
          variables: {
            intPedido,
            strEstado: nuevoEstado,
            strNumeroSeguimiento: strNumeroSeguimiento || null,
          },
        }),
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0]?.message || 'Error al actualizar estado');
      }

      // Actualizar el pedido en el estado local
      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.intPedido === intPedido
            ? { ...p, strEstado: nuevoEstado }
            : p
        )
      );

      // Actualizar el pedido seleccionado si coincide
      if (selectedOrder?.intPedido === intPedido) {
        setSelectedOrder({ ...selectedOrder, strEstado: nuevoEstado });
      }

      return true;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openOrderDetail = (pedido: Pedido) => {
    setSelectedOrder(pedido);
    setShowModal(true);
  };

  return {
    pedidos,
    loading,
    error,
    updatingStatus,
    searchTerm,
    filterStatus,
    selectedOrder,
    showModal,
    filteredPedidos,
    statusCounts,
    setSearchTerm,
    setFilterStatus,
    setSelectedOrder,
    setShowModal,
    openOrderDetail,
    actualizarEstadoPedido,
    refetch: fetchPedidos,
  };
}
