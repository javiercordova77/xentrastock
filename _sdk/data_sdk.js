/**
 * Data SDK para XentraStock v2.0
 * Compatible con el frontend existente pero conectado a SQLite
 * Mantiene la misma API pero con persistencia real
 */

(function(window) {
    'use strict';

    // Configuración
    const API_BASE_URL = 'http://localhost:3001/api';
    const LEGACY_ENDPOINT = `${API_BASE_URL}/legacy/data`;
    
    // Cache local para mejorar performance
    let dataCache = [];
    let lastCacheUpdate = 0;
    const CACHE_DURATION = 5000; // 5 segundos

    /**
     * Clase principal del Data SDK v2.0
     */
    class DataSDK {
        constructor() {
            this.isInitialized = false;
            this.dataHandler = null;
            this.debug = true;
        }

        /**
         * Inicializar el SDK con el handler de datos
         * @param {Object} handler - Objeto con método onDataChanged
         * @returns {Promise<{isOk: boolean, error?: string}>}
         */
        async init(handler) {
            try {
                if (!handler || typeof handler.onDataChanged !== 'function') {
                    throw new Error('Handler debe tener método onDataChanged');
                }

                this.dataHandler = handler;
                
                // Cargar datos iniciales
                await this.refreshData();
                
                this.isInitialized = true;
                this.log('✅ Data SDK v2.0 inicializado correctamente con SQLite');
                
                return { isOk: true };
            } catch (error) {
                this.log('❌ Error inicializando Data SDK:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Crear un nuevo registro
         * @param {Object} data - Datos del registro a crear
         * @returns {Promise<{isOk: boolean, data?: Object, error?: string}>}
         */
        async create(data) {
            try {
                this.validateInitialized();
                
                const endpoint = this.getEndpointForType(data.tipo);
                const payload = this.transformToAPIFormat(data);
                
                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error creando registro');
                }

                // Refrescar datos y notificar cambios
                await this.refreshData();
                
                this.log('✅ Registro creado:', data.tipo, result.data?.id);
                return { isOk: true, data: result.data };
                
            } catch (error) {
                this.log('❌ Error creando registro:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Actualizar un registro existente
         * @param {Object} data - Datos del registro a actualizar (debe incluir id)
         * @returns {Promise<{isOk: boolean, data?: Object, error?: string}>}
         */
        async update(data) {
            try {
                this.validateInitialized();
                
                if (!data.id) {
                    throw new Error('ID es requerido para actualización');
                }

                const endpoint = this.getEndpointForType(data.tipo);
                const payload = this.transformToAPIFormat(data);
                
                const response = await fetch(`${API_BASE_URL}${endpoint}/${data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error actualizando registro');
                }

                // Refrescar datos y notificar cambios
                await this.refreshData();
                
                this.log('✅ Registro actualizado:', data.tipo, data.id);
                return { isOk: true, data: result.data };
                
            } catch (error) {
                this.log('❌ Error actualizando registro:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Eliminar un registro
         * @param {Object} data - Objeto con id y tipo del registro a eliminar
         * @returns {Promise<{isOk: boolean, error?: string}>}
         */
        async delete(data) {
            try {
                this.validateInitialized();
                
                if (!data.id) {
                    throw new Error('ID es requerido para eliminación');
                }

                const endpoint = this.getEndpointForType(data.tipo);
                
                const response = await fetch(`${API_BASE_URL}${endpoint}/${data.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error eliminando registro');
                }

                // Refrescar datos y notificar cambios
                await this.refreshData();
                
                this.log('✅ Registro eliminado:', data.tipo, data.id);
                return { isOk: true };
                
            } catch (error) {
                this.log('❌ Error eliminando registro:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Procesar ingreso de inventario
         * @param {Object} data - {varianteId, ubicacionId, cantidad, motivo, usuario}
         * @returns {Promise<{isOk: boolean, data?: Object, error?: string}>}
         */
        async procesarIngreso(data) {
            try {
                this.validateInitialized();
                
                const response = await fetch(`${API_BASE_URL}/inventario/ingreso`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error procesando ingreso');
                }

                // Refrescar datos
                await this.refreshData();
                
                this.log('✅ Ingreso procesado:', result.data);
                return { isOk: true, data: result.data };
                
            } catch (error) {
                this.log('❌ Error procesando ingreso:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Procesar salida de inventario
         * @param {Object} data - {varianteId, ubicacionId, cantidad, motivo, usuario}
         * @returns {Promise<{isOk: boolean, data?: Object, error?: string}>}
         */
        async procesarSalida(data) {
            try {
                this.validateInitialized();
                
                const response = await fetch(`${API_BASE_URL}/inventario/salida`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error procesando salida');
                }

                // Refrescar datos
                await this.refreshData();
                
                this.log('✅ Salida procesada:', result.data);
                return { isOk: true, data: result.data };
                
            } catch (error) {
                this.log('❌ Error procesando salida:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Procesar transferencia
         * @param {Object} data - {codigo, responsable, origenId, destinoId, productos, usuario}
         * @returns {Promise<{isOk: boolean, data?: Object, error?: string}>}
         */
        async procesarTransferencia(data) {
            try {
                this.validateInitialized();
                
                const response = await fetch(`${API_BASE_URL}/inventario/transferencias`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (!response.ok || !result.isOk) {
                    throw new Error(result.error || 'Error procesando transferencia');
                }

                // Refrescar datos
                await this.refreshData();
                
                this.log('✅ Transferencia procesada:', result.data);
                return { isOk: true, data: result.data };
                
            } catch (error) {
                this.log('❌ Error procesando transferencia:', error);
                return { isOk: false, error: error.message };
            }
        }

        /**
         * Refrescar datos desde el servidor
         */
        async refreshData() {
            try {
                const now = Date.now();
                
                // Usar cache si es reciente
                if (dataCache.length > 0 && (now - lastCacheUpdate) < CACHE_DURATION) {
                    this.notifyDataChanged(dataCache);
                    return;
                }

                const response = await fetch(LEGACY_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                
                if (!result.isOk || !result.data) {
                    throw new Error(result.error || 'Datos inválidos del servidor');
                }

                // Actualizar cache
                dataCache = result.data;
                lastCacheUpdate = now;
                
                // Notificar cambios
                this.notifyDataChanged(result.data);
                
                this.log(`📊 Datos refrescados: ${result.data.length} registros`);
                
            } catch (error) {
                this.log('❌ Error refrescando datos:', error);
                // En caso de error, mantener datos en cache si existen
                if (dataCache.length > 0) {
                    this.notifyDataChanged(dataCache);
                }
                throw error;
            }
        }

        /**
         * Obtener datos del cache
         */
        getCachedData() {
            return [...dataCache];
        }

        /**
         * Limpiar cache
         */
        clearCache() {
            dataCache = [];
            lastCacheUpdate = 0;
            this.log('🗑️ Cache limpiado');
        }

        // ============================================================
        // MÉTODOS PRIVADOS
        // ============================================================

        validateInitialized() {
            if (!this.isInitialized) {
                throw new Error('SDK no inicializado. Llama a init() primero.');
            }
        }

        notifyDataChanged(data) {
            if (this.dataHandler && typeof this.dataHandler.onDataChanged === 'function') {
                try {
                    this.dataHandler.onDataChanged(data);
                } catch (error) {
                    this.log('❌ Error en handler onDataChanged:', error);
                }
            }
        }

        getEndpointForType(tipo) {
            const endpoints = {
                'proveedor': '/data/proveedores',
                'categoria': '/data/categorias',
                'ubicacion': '/data/ubicaciones',
                'producto': '/data/productos',
                'variante': '/data/variantes'
            };

            const endpoint = endpoints[tipo];
            if (!endpoint) {
                throw new Error(`Tipo de dato no soportado: ${tipo}`);
            }

            return endpoint;
        }

        transformToAPIFormat(data) {
            const transformers = {
                'proveedor': (d) => ({
                    nombre: d.nombre,
                    contacto: d.contacto || '',
                    telefono: d.telefono || '',
                    email: d.email || '',
                    direccion: d.direccion || ''
                }),
                'categoria': (d) => ({
                    nombre: d.nombre
                }),
                'ubicacion': (d) => ({
                    nombre: d.nombre,
                    descripcion: d.descripcion || ''
                }),
                'producto': (d) => ({
                    nombre: d.nombre,
                    categoriaId: parseInt(d.categoriaId),
                    proveedorId: parseInt(d.proveedorId),
                    descripcion: d.descripcion || '',
                    material: d.material || '',
                    imagen: d.imagen || '',
                    colores: d.colores || ''
                }),
                'variante': (d) => ({
                    productoId: parseInt(d.productoId),
                    medida: d.medida,
                    codigoVariante: d.codigoVariante,
                    precioVenta: parseFloat(d.precioVenta),
                    precioCompra: parseFloat(d.precioCompra),
                    stockMinimo: parseInt(d.stockMinimo),
                    coloresDisponibles: d.coloresDisponibles || '',
                    activo: d.activo !== false
                })
            };

            const transformer = transformers[data.tipo];
            if (!transformer) {
                throw new Error(`No hay transformador para tipo: ${data.tipo}`);
            }

            return transformer(data);
        }

        log(...args) {
            if (this.debug) {
                console.log('[DataSDK v2.0]', ...args);
            }
        }
    }

    // ============================================================
    // UTILIDADES ADICIONALES
    // ============================================================

    /**
     * Función para verificar conectividad con el servidor
     */
    async function checkServerHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const result = await response.json();
            return result.isOk;
        } catch (error) {
            console.warn('[DataSDK] Servidor no disponible:', error.message);
            return false;
        }
    }

    /**
     * Función para obtener estadísticas del sistema
     */
    async function getSystemStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/inventario/estadisticas`);
            const result = await response.json();
            return result.isOk ? result.data : null;
        } catch (error) {
            console.warn('[DataSDK] Error obteniendo estadísticas:', error.message);
            return null;
        }
    }

    // ============================================================
    // EXPORTAR AL WINDOW GLOBAL
    // ============================================================

    // Crear instancia global
    const dataSdk = new DataSDK();

    // Exponer en window
    window.dataSdk = dataSdk;
    window.DataSDK = DataSDK;

    // Funciones utilitarias
    window.dataSdk.checkServerHealth = checkServerHealth;
    window.dataSdk.getSystemStats = getSystemStats;

    // Información de versión
    window.dataSdk.version = '2.0.0';
    window.dataSdk.features = [
        'SQLite Backend',
        'Persistent Data',
        'RESTful API',
        'Transaction Support',
        'Data Validation',
        'Error Handling',
        'Performance Cache'
    ];

    console.log('🚀 Data SDK v2.0 cargado - Ahora con SQLite!');
    console.log('📋 Funcionalidades:', window.dataSdk.features);

})(window);