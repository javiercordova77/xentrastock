import { apiClient } from './apiClient';

const ENDPOINTS = {
  UBICACIONES: '/ubicaciones'
};

export const ubicacionesService = {
  // Obtener todas las ubicaciones
  getAll: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.UBICACIONES);
      
      // Extraer los datos del wrapper de respuesta
      const ubicaciones = response.data?.data || response.data || response || [];
      
      // Asegurar que siempre devolvemos un array
      return Array.isArray(ubicaciones) ? ubicaciones : [];
    } catch (error) {
      console.error('Error obteniendo ubicaciones:', error);
      throw error;
    }
  },

  // Obtener ubicación por ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.UBICACIONES}/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      throw error;
    }
  },

  // Crear nueva ubicación
  create: async (ubicacionData) => {
    try {
      const response = await apiClient.post(ENDPOINTS.UBICACIONES, ubicacionData);
      return response.data || response;
    } catch (error) {
      console.error('Error creando ubicación:', error);
      throw error;
    }
  },

  // Actualizar ubicación
  update: async (id, ubicacionData) => {
    try {
      const response = await apiClient.put(`${ENDPOINTS.UBICACIONES}/${id}`, ubicacionData);
      return response.data || response;
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      throw error;
    }
  },

  // Eliminar ubicación
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.UBICACIONES}/${id}`);
      return response.data || response;
    } catch (error) {
      console.error('Error eliminando ubicación:', error);
      throw error;
    }
  }
};

export default ubicacionesService;