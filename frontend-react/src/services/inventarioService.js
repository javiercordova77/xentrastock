import { apiClient } from './apiClient';

const ENDPOINTS = {
  INVENTARIO_COLCHONESW: '/api/inventario-colchonesw'
};

export const inventarioService = {
  // Obtener todo el inventario
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.INVENTARIO_COLCHONESW);
      
      // Transformar la respuesta de la API al formato que espera el componente
      const inventario = response.data.map(item => ({
        id: `${item.variante_id}-${item.ubicacion_id}`, // ID único combinado
        variante_id: item.variante_id,
        ubicacion_id: item.ubicacion_id,
        codigo_variante: item.codigo_variante,
        medida: item.medida,
        color: item.color,
        ubicacion: item.ubicacion,
        cantidad: item.cantidad || 0,
        precio_unitario: parseFloat(item.precio_venta) || 0,
        valor_total: (item.cantidad || 0) * (parseFloat(item.precio_venta) || 0),
        categoria_nombre: item.categoria_nombre,
        proveedor_nombre: item.proveedor_nombre,
        ultimo_movimiento: item.ultimo_movimiento || new Date().toISOString().split('T')[0]
      }));
      
      return inventario;
    } catch (error) {
      console.error('Error obteniendo inventario:', error);
      throw error;
    }
  },

  // Ajustar stock de una variante en una ubicación específica
  ajustarStock: async (varianteId, ubicacionId, cantidad, tipo, motivo) => {
    try {
      // TODO: Implementar endpoint para ajuste de stock
      // Por ahora retornamos success simulado
      console.log('Ajustando stock via API:', {
        varianteId,
        ubicacionId,
        cantidad,
        tipo,
        motivo
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error ajustando stock:', error);
      throw error;
    }
  },

  // Obtener historial de movimientos de inventario
  getMovimientos: async (filtros = {}) => {
    try {
      // TODO: Implementar endpoint para movimientos
      console.log('Obteniendo movimientos:', filtros);
      return [];
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      throw error;
    }
  }
};

export default inventarioService;