import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);

// Servicios para Proveedores
export const proveedoresService = {
  getAll: () => apiClient.get('/proveedores'),
  getById: (id) => apiClient.get(`/proveedores/${id}`),
  create: (data) => apiClient.post('/proveedores', data),
  update: (id, data) => apiClient.put(`/proveedores/${id}`, data),
  delete: (id) => apiClient.delete(`/proveedores/${id}`),
};

// Servicios para Categorías
export const categoriasService = {
  getAll: () => apiClient.get('/categorias'),
  getById: (id) => apiClient.get(`/categorias/${id}`),
  create: (data) => apiClient.post('/categorias', data),
  update: (id, data) => apiClient.put(`/categorias/${id}`, data),
  delete: (id) => apiClient.delete(`/categorias/${id}`),
};

// Servicios para Ubicaciones
export const ubicacionesService = {
  getAll: () => apiClient.get('/ubicaciones'),
  getById: (id) => apiClient.get(`/ubicaciones/${id}`),
  create: (data) => apiClient.post('/ubicaciones', data),
  update: (id, data) => apiClient.put(`/ubicaciones/${id}`, data),
  delete: (id) => apiClient.delete(`/ubicaciones/${id}`),
};

// Servicios para Productos
export const productosService = {
  getAll: () => apiClient.get('/productos'),
  getById: (id) => apiClient.get(`/productos/${id}`),
  getWithVariants: (id) => apiClient.get(`/productos/${id}/variantes`),
  create: (data) => apiClient.post('/productos', data),
  update: (id, data) => apiClient.put(`/productos/${id}`, data),
  delete: (id) => apiClient.delete(`/productos/${id}`),
};

// Servicios para Variantes
export const variantesService = {
  getAll: () => apiClient.get('/variantes'),
  getById: (id) => apiClient.get(`/variantes/${id}`),
  getByProducto: (productoId) => apiClient.get(`/productos/${productoId}/variantes`),
  create: (data) => apiClient.post('/variantes', data),
  update: (id, data) => apiClient.put(`/variantes/${id}`, data),
  delete: (id) => apiClient.delete(`/variantes/${id}`),
};

// Servicios para Inventario
export const inventarioService = {
  getStock: () => apiClient.get('/inventario'),
  getStockByUbicacion: (ubicacionId) => apiClient.get(`/inventario/ubicacion/${ubicacionId}`),
  getStockByProducto: (productoId) => apiClient.get(`/inventario/producto/${productoId}`),
  getStockEspecifico: (varianteId, ubicacionId) => apiClient.get(`/inventario/stock-ubicacion/${varianteId}/${ubicacionId}`),
  getBajoStock: (limite = 5) => apiClient.get(`/inventario/bajo-stock?limite=${limite}`),
  getResumenUbicacion: () => apiClient.get('/inventario/resumen-ubicacion'),
  updateStock: (varianteId, ubicacionId, cantidad) => 
    apiClient.put('/inventario/stock', { variante_id: varianteId, ubicacion_id: ubicacionId, cantidad }),
};

// Servicios para Movimientos
export const movimientosService = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/movimientos${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiClient.get(`/movimientos/${id}`),
  create: (data) => apiClient.post('/movimientos', data),
  getByVariante: (varianteId) => apiClient.get(`/movimientos/variante/${varianteId}`),
  getByTipo: (tipo) => apiClient.get(`/movimientos/tipo/${tipo}`),
  getMotivos: (tipo) => apiClient.get(`/movimientos/motivos/${tipo}`),
};

// Servicios para Transferencias
export const transferenciasService = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/transferencias${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => apiClient.get(`/transferencias/${id}`),
  create: (data) => apiClient.post('/transferencias', data),
  update: (id, data) => apiClient.put(`/transferencias/${id}`, data),
  confirmar: (id) => apiClient.patch(`/transferencias/${id}/confirmar`),
  cancelar: (id, motivo = null) => apiClient.patch(`/transferencias/${id}/cancelar`, { motivo }),
};

// Servicios para Reportes
export const reportesService = {
  resumen: () => apiClient.get('/reportes/resumen'),
  stockBajo: (limite = 5) => apiClient.get(`/reportes/stock-bajo?limite=${limite}`),
  movimientosPorPeriodo: (fechaInicio, fechaFin, tipo = null) => {
    const params = new URLSearchParams({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    if (tipo) params.append('tipo', tipo);
    return apiClient.get(`/reportes/movimientos-periodo?${params}`);
  },
  productosPopulares: (limite = 10, dias = 30) => 
    apiClient.get(`/reportes/productos-populares?limite=${limite}&dias=${dias}`),
  inventarioPorUbicacion: () => apiClient.get('/reportes/inventario-ubicacion'),
  getEndpoints: () => apiClient.get('/reportes'),
};

// Utilidades
export const apiUtils = {
  handleError: (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.message || 'Error en el servidor';
      console.error('Error API:', message);
      return message;
    } else if (error.request) {
      // Error de red
      console.error('Error de conexión');
      return 'Error de conexión con el servidor';
    } else {
      // Error desconocido
      console.error('Error:', error.message);
      return 'Error desconocido';
    }
  },
  
  formatResponse: (response) => {
    return response.data;
  }
};

export default apiClient;