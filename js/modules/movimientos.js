// Módulo Movimientos
window.movimientosModule = {
    movimientos: [],
    allMovimientos: [], // Todos los movimientos sin filtrar
    productos: [],
    variantes: [],
    ubicaciones: [],
    filteredVariantes: [],
    variantesDelProducto: [],
    varianteSearchTimeout: null,
    motivosDisponibles: [],
    loading: false,
    showModal: false,
    showFilters: false,
    eventsInitialized: false,
    isSubmitting: false,
    // Propiedades de paginación
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    // Propiedades de filtros
    filtersActive: false,
    // Propiedades de búsqueda de productos
    productSearchTimeout: null,
    selectedProductId: null,
    formData: {
        tipo: 'entrada',
        id_producto: '',
        id_variante: '',
        id_ubicacion: '',
        cantidad: '',
        precio_unitario: '',
        motivo: '',
        referencia: '',
        usuario: 'Juan',
        observaciones: ''
    },

    async load() {
        // Resetear estado del módulo
        this.eventsInitialized = false;
        this.isSubmitting = false;
        
        const container = document.getElementById('movimientos-content');
        container.innerHTML = this.getMainHTML();
        await this.loadData();
        this.bindEvents();
        this.eventsInitialized = true;
        this.renderMovimientos();
    },

    getMainHTML() {
        return `
            <div class="space-y-6">
                <!-- Filtros y búsqueda -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                                <input type="text" id="search-input" placeholder="Buscar movimientos..." 
                                       class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64">
                            </div>
                            <button id="btn-toggle-filters" class="px-4 py-2 rounded-lg border transition-colors flex items-center bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-filter mr-2"></i>
                                Filtros
                            </button>
                        </div>
                        <div class="flex space-x-3">
                            <button id="btn-refresh" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                                <i class="fas fa-sync-alt mr-2"></i>
                                Actualizar
                            </button>
                            <button id="btn-new-movimiento" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                                <i class="fas fa-plus mr-2"></i>
                                Nuevo Movimiento
                            </button>
                        </div>
                    </div>

                    <!-- Panel de filtros expandible -->
                    <div id="filters-panel" class="mt-4 pt-4 border-t border-gray-200 hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select id="filter-tipo" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Todos los tipos</option>
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                    <option value="ajuste">Ajuste</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                                <select id="filter-ubicacion" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Todas las ubicaciones</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                                <input type="date" id="filter-fecha-inicio" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                                <input type="date" id="filter-fecha-fin" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end">
                            <button id="btn-clear-filters" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>

                    <!-- Dashboard de Movimientos -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-600" id="ingresos-hoy">0</p>
                            <p class="text-sm text-gray-600">Ingresos Hoy</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-red-600" id="salidas-hoy">0</p>
                            <p class="text-sm text-gray-600">Salidas Hoy</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-gray-900" id="total-movimientos">0</p>
                            <p class="text-sm text-gray-600">Total Movimientos</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-blue-600" id="cantidad-movida">0</p>
                            <p class="text-sm text-gray-600">Cantidad Movida</p>
                        </div>
                    </div>
                </div>

                <!-- Controles de paginación y vista -->
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-700">Mostrar:</span>
                                <select id="items-per-page" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span class="text-sm text-gray-700">registros</span>
                            </div>
                            <div class="text-sm text-gray-700" id="pagination-info">
                                Mostrando 0 de 0 registros
                            </div>
                        </div>
                        <div class="flex items-center space-x-2" id="pagination-controls">
                            <button id="btn-first-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <i class="fas fa-angle-double-left"></i>
                            </button>
                            <button id="btn-prev-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <i class="fas fa-angle-left"></i>
                            </button>
                            <span class="text-sm text-gray-700" id="page-info">Página 1 de 1</span>
                            <button id="btn-next-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <i class="fas fa-angle-right"></i>
                            </button>
                            <button id="btn-last-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <i class="fas fa-angle-double-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabla de movimientos -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto / Variante</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="movimientos-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Movimientos se cargan aquí -->
                            </tbody>
                        </table>
                    </div>
                    <div id="empty-state" class="text-center py-12 hidden">
                        <i class="fas fa-exchange-alt mx-auto h-12 w-12 text-gray-400 text-4xl mb-4"></i>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
                        <p class="mt-1 text-sm text-gray-500">No se encontraron movimientos con los filtros aplicados.</p>
                    </div>
                </div>

                <!-- Loading -->
                <div id="loading-state" class="flex justify-center items-center h-64 hidden">
                    <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mr-2"></i>
                    <span>Cargando movimientos...</span>
                </div>
            </div>

            <!-- Modal para nuevo movimiento -->
            <div id="modal-nuevo-movimiento" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Nuevo Movimiento de Inventario</h3>
                        <button id="btn-close-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <form id="form-movimiento" class="space-y-4">
                        <!-- Tipo de movimiento -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento *</label>
                            <div class="grid grid-cols-3 gap-3">
                                <label class="relative">
                                    <input type="radio" name="tipo" value="entrada" checked class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-green-200 bg-green-50">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-arrow-up text-green-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-green-700">Entrada</span>
                                            <span class="text-xs text-gray-500 mt-1">Ingreso de mercancía</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="tipo" value="salida" class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-arrow-down text-red-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-gray-700">Salida</span>
                                            <span class="text-xs text-gray-500 mt-1">Salida de mercancía</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="tipo" value="ajuste" class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-sync-alt text-blue-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-gray-700">Ajuste</span>
                                            <span class="text-xs text-gray-500 mt-1">Corrección de inventario</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Selección de producto y variante -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="relative">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                                <div class="relative">
                                    <input type="text" 
                                           id="input-producto-search" 
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10" 
                                           placeholder="Buscar o seleccionar producto..."
                                           autocomplete="off">
                                    <input type="hidden" id="selected-producto-id" value="">
                                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <i class="fas fa-search text-gray-400"></i>
                                    </div>
                                    <!-- Dropdown de resultados -->
                                    <div id="producto-dropdown" class="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
                                        <!-- Resultados se llenarán dinámicamente -->
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Variante *</label>
                                <div class="relative">
                                    <input type="text" 
                                           id="input-variante-search" 
                                           class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10" 
                                           placeholder="Buscar o seleccionar variante..."
                                           autocomplete="off"
                                           disabled>
                                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <i class="fas fa-search text-gray-400 text-sm"></i>
                                    </div>
                                    <input type="hidden" id="select-variante" name="variante">
                                    <div id="variante-dropdown" class="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Ubicación y cantidad -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                                <div class="relative">
                                    <div id="ubicacion-selector" class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors min-h-[42px]">
                                        <span id="ubicacion-selected-text" class="text-gray-500 flex-1">Seleccionar ubicación...</span>
                                        <i class="fas fa-chevron-down text-gray-400 transform transition-transform" id="ubicacion-chevron"></i>
                                    </div>
                                    <div id="ubicacion-dropdown" class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto hidden">
                                        <div class="p-3 text-sm text-blue-700 border-b bg-blue-50 flex items-center">
                                            <i class="fas fa-info-circle mr-2"></i>
                                            Selecciona una variante para ver el stock disponible
                                        </div>
                                    </div>
                                    <input type="hidden" id="select-ubicacion" name="ubicacion">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                                <input type="number" id="input-cantidad" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Cantidad de unidades">
                            </div>
                        </div>

                        <!-- Motivo y responsable -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                                <select id="select-motivo" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Seleccionar motivo...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
                                <input type="text" id="input-usuario" value="Juan" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Nombre del responsable">
                            </div>
                        </div>

                        <!-- Precio unitario y referencia -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
                                <input type="number" id="input-precio" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                                <input type="text" id="input-referencia" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Número de factura, orden, etc.">
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                            <textarea id="input-observaciones" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Observaciones adicionales..."></textarea>
                        </div>

                        <!-- Botones -->
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" id="btn-cancel-modal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="button" id="btn-submit-modal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                                <i class="fas fa-check mr-2"></i>
                                Registrar Movimiento
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal para ver detalles del movimiento -->
            <div id="modal-detalle-movimiento" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium text-gray-900">Detalles del Movimiento</h3>
                            <button onclick="window.movimientosModule.cerrarModalDetalle()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <div id="detalle-movimiento-content">
                            <!-- El contenido se carga dinámicamente -->
                        </div>
                    </div>
                    <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
                        <button onclick="window.movimientosModule.cerrarModalDetalle()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async loadData() {
        this.showLoading(true);
        try {
            const [movimientosRes, productosRes, variantesRes, ubicacionesRes] = await Promise.all([
                fetch('http://localhost:3001/api/movimientos').then(r => r.json()),
                fetch('http://localhost:3001/api/productos').then(r => r.json()),
                fetch('http://localhost:3001/api/variantes').then(r => r.json()),
                fetch('http://localhost:3001/api/ubicaciones').then(r => r.json())
            ]);

            if (movimientosRes.success) {
                this.allMovimientos = movimientosRes.data;
                this.movimientos = [...this.allMovimientos];
                this.totalItems = this.movimientos.length;
            }
            if (productosRes.success) this.productos = productosRes.data;
            if (variantesRes.success) this.variantes = variantesRes.data;
            if (ubicacionesRes.success) this.ubicaciones = ubicacionesRes.data;

            this.populateSelects();
        } catch (error) {
            console.error('Error cargando datos:', error);
            window.app.showToast('error', 'Error', 'Error cargando datos');
        } finally {
            this.showLoading(false);
        }
    },

    populateSelects() {
        // Inicializar búsqueda de productos (no necesita llenar opciones inicialmente)
        this.setupProductSearch();

        // Ubicaciones para filtros (solo el select de filtro, no el del formulario)
        const filterUbicacion = document.getElementById('filter-ubicacion');
        
        if (filterUbicacion) {
            filterUbicacion.innerHTML = '<option value="">Todas las ubicaciones</option>';
            this.ubicaciones.forEach(ubicacion => {
                const option = `<option value="${ubicacion.id}">${ubicacion.nombre}</option>`;
                filterUbicacion.innerHTML += option;
            });
        }
        
        console.log('📍 Ubicaciones cargadas:', this.ubicaciones?.length || 0);
    },

    async loadMotivos(tipo) {
        try {
            const response = await fetch(`http://localhost:3001/api/movimientos/motivos/${tipo}`);
            const data = await response.json();
            
            if (data.success) {
                this.motivosDisponibles = data.data;
            } else {
                // Fallback a motivos estáticos
                const motivosEstaticos = {
                    entrada: ['Inventario Inicial', 'Compra', 'Devolución', 'Ajuste'],
                    salida: ['Venta', 'Devolución', 'Ajuste'],
                    ajuste: ['Ajuste Manual', 'Corrección Inventario', 'Merma', 'Daño']
                };
                this.motivosDisponibles = motivosEstaticos[tipo] || [];
            }

            const selectMotivo = document.getElementById('select-motivo');
            if (selectMotivo) {
                selectMotivo.innerHTML = '<option value="">Seleccionar motivo...</option>';
                this.motivosDisponibles.forEach(motivo => {
                    selectMotivo.innerHTML += `<option value="${motivo}">${motivo}</option>`;
                });
            }
        } catch (error) {
            console.error('Error cargando motivos:', error);
        }
    },



    checkIfFiltersActive() {
        const searchTerm = document.getElementById('search-input')?.value || '';
        const tipoFilter = document.getElementById('filter-tipo')?.value || '';
        const ubicacionFilter = document.getElementById('filter-ubicacion')?.value || '';
        const fechaInicio = document.getElementById('filter-fecha-inicio')?.value || '';
        const fechaFin = document.getElementById('filter-fecha-fin')?.value || '';
        
        this.filtersActive = !!(searchTerm || tipoFilter || ubicacionFilter || fechaInicio || fechaFin);
    },

    getPaginatedMovimientos() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.movimientos.slice(startIndex, endIndex);
    },

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const startItem = this.totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
        
        // Actualizar información de paginación
        const paginationInfo = document.getElementById('pagination-info');
        const pageInfo = document.getElementById('page-info');
        
        if (paginationInfo) {
            paginationInfo.textContent = `Mostrando ${startItem} a ${endItem} de ${this.totalItems} registros`;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;
        }
        
        // Actualizar estado de botones
        const btnFirst = document.getElementById('btn-first-page');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        const btnLast = document.getElementById('btn-last-page');
        
        if (btnFirst) btnFirst.disabled = this.currentPage <= 1;
        if (btnPrev) btnPrev.disabled = this.currentPage <= 1;
        if (btnNext) btnNext.disabled = this.currentPage >= totalPages;
        if (btnLast) btnLast.disabled = this.currentPage >= totalPages;
    },

    changePage(page) {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        
        this.currentPage = page;
        this.renderMovimientos();
    },

    changeItemsPerPage(newSize) {
        this.itemsPerPage = parseInt(newSize);
        this.currentPage = 1;
        this.renderMovimientos();
    },

    renderMovimientos() {
        const tbody = document.getElementById('movimientos-tbody');
        const emptyState = document.getElementById('empty-state');

        // Actualizar información de paginación
        this.updatePaginationInfo();

        if (this.movimientos.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            this.updateDashboard();
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Obtener movimientos paginados
        const paginatedMovimientos = this.getPaginatedMovimientos();

        tbody.innerHTML = paginatedMovimientos.map(movimiento => {
            const tipoIcon = this.getTipoIcon(movimiento.tipo);
            const tipoColor = this.getTipoColor(movimiento.tipo);
            const fecha = new Date(movimiento.fecha).toLocaleDateString('es-ES');
            const valor = movimiento.precio_unitario ? `$${movimiento.precio_unitario} c/u` : '';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="p-2 rounded-full ${this.getTipoBg(movimiento.tipo)} mr-3">
                                <i class="${tipoIcon} ${tipoColor}"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium ${tipoColor}">
                                    ${movimiento.tipo.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">${movimiento.producto_descripcion}</div>
                        <div class="text-sm text-gray-500">${movimiento.codigo_variante} - ${movimiento.variante_medida}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-bold ${tipoColor}">
                            ${movimiento.tipo === 'entrada' ? '+' : movimiento.tipo === 'salida' ? '-' : ''}${movimiento.cantidad} unidades
                        </div>
                        ${valor ? `<div class="text-xs text-gray-500">${valor}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                            ${movimiento.ubicacion_nombre}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ${movimiento.motivo}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-user text-gray-400 mr-1"></i>
                            ${movimiento.usuario}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-calendar text-gray-400 mr-1"></i>
                            ${fecha}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 flex items-center" onclick="window.movimientosModule.verDetalles(${movimiento.id})">
                            <i class="fas fa-eye mr-1"></i>
                            Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Actualizar dashboard después de renderizar
        this.updateDashboard();
    },

    getTipoIcon(tipo) {
        const icons = {
            entrada: 'fas fa-arrow-up',
            salida: 'fas fa-arrow-down',
            ajuste: 'fas fa-sync-alt'
        };
        return icons[tipo] || 'fas fa-exchange-alt';
    },

    getTipoColor(tipo) {
        const colors = {
            entrada: 'text-green-600',
            salida: 'text-red-600',
            ajuste: 'text-blue-600'
        };
        return colors[tipo] || 'text-gray-600';
    },

    getTipoBg(tipo) {
        const backgrounds = {
            entrada: 'bg-green-100',
            salida: 'bg-red-100',
            ajuste: 'bg-blue-100'
        };
        return backgrounds[tipo] || 'bg-gray-100';
    },

    showLoading(show) {
        const loading = document.getElementById('loading-state');
        const table = document.querySelector('.bg-white.rounded-lg.shadow.overflow-hidden');
        
        if (show) {
            loading.classList.remove('hidden');
            if (table) table.style.display = 'none';
        } else {
            loading.classList.add('hidden');
            if (table) table.style.display = 'block';
        }
    },

    bindEvents() {
        // Botón nuevo movimiento
        document.getElementById('btn-new-movimiento').onclick = () => {
            this.showModal = true;
            document.getElementById('modal-nuevo-movimiento').classList.remove('hidden');
            // Cargar motivos por defecto para "entrada" cuando se abre el modal
            this.loadMotivos('entrada');
        };

        // Cerrar modal
        document.getElementById('btn-close-modal').onclick = () => this.closeModal();
        document.getElementById('btn-cancel-modal').onclick = () => this.closeModal();

        // Toggle filtros
        document.getElementById('btn-toggle-filters').onclick = () => {
            const panel = document.getElementById('filters-panel');
            panel.classList.toggle('hidden');
        };

        // Refrescar
        document.getElementById('btn-refresh').onclick = () => {
            this.loadData().then(() => this.renderMovimientos());
        };

        // Tipo de movimiento en modal
        document.querySelectorAll('input[name="tipo"]').forEach(radio => {
            radio.onchange = (e) => {
                this.updateTipoSelection(e.target.value);
                this.loadMotivos(e.target.value);
            };
        });

        // Búsqueda de productos
        const productSearchInput = document.getElementById('input-producto-search');
        if (productSearchInput) {
            productSearchInput.oninput = (e) => {
                this.handleProductSearch(e.target.value);
            };
            
            // Al hacer backspace y quedar vacío, mostrar todos los productos
            productSearchInput.onkeydown = (e) => {
                if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.value.length === 1) {
                    setTimeout(() => {
                        if (e.target.value.length === 0) {
                            this.showAllProducts();
                        }
                    }, 10);
                }
            };
            
            productSearchInput.onfocus = () => {
                // Mostrar todos los productos si no hay búsqueda activa
                if (productSearchInput.value.length === 0) {
                    this.showAllProducts();
                } else if (productSearchInput.value.length >= 2) {
                    this.handleProductSearch(productSearchInput.value);
                }
            };
        }

        // Búsqueda de variantes
        const varianteSearchInput = document.getElementById('input-variante-search');
        if (varianteSearchInput) {
            varianteSearchInput.oninput = (e) => {
                this.handleVarianteSearch(e.target.value);
            };
            
            // Al hacer backspace y quedar vacío, mostrar todas las variantes
            varianteSearchInput.onkeydown = (e) => {
                if ((e.key === 'Backspace' || e.key === 'Delete') && e.target.value.length === 1) {
                    setTimeout(() => {
                        if (e.target.value.length === 0) {
                            this.showAllVariantes();
                        }
                    }, 10);
                }
            };
            
            varianteSearchInput.onfocus = () => {
                // Mostrar todas las variantes si no hay búsqueda activa
                if (varianteSearchInput.value.length === 0) {
                    this.showAllVariantes();
                } else if (varianteSearchInput.value.length >= 2) {
                    this.handleVarianteSearch(varianteSearchInput.value);
                }
            };
        }
            
        // Evento para el selector de ubicaciones personalizado
        const ubicacionSelector = document.getElementById('ubicacion-selector');
        if (ubicacionSelector) {
            ubicacionSelector.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('ubicacion-dropdown');
                const varianteId = document.getElementById('select-variante')?.value;
                
                if (dropdown && dropdown.classList.contains('hidden')) {
                    // Si no hay variante seleccionada, mostrar ubicaciones básicas
                    if (!varianteId) {
                        this.mostrarUbicacionesBasicas();
                    }
                    this.showUbicacionDropdown();
                } else {
                    this.hideUbicacionDropdown();
                }
            });
        }

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#input-producto-search') && !e.target.closest('#producto-dropdown')) {
                this.hideProductDropdown();
            }
            if (!e.target.closest('#input-variante-search') && !e.target.closest('#variante-dropdown')) {
                this.hideVarianteDropdown();
            }
            if (!e.target.closest('#ubicacion-selector') && !e.target.closest('#ubicacion-dropdown')) {
                this.hideUbicacionDropdown();
            }
            
            // Cerrar modal de detalles al hacer clic fuera
            const modal = document.getElementById('modal-detalle-movimiento');
            if (modal && e.target === modal) {
                this.cerrarModalDetalle();
            }
        });

        // Submit formulario - solo por botón
        document.getElementById('btn-submit-modal').onclick = () => {
            this.submitMovimiento();
        };

        // Prevenir submit del formulario con Enter
        document.getElementById('form-movimiento').onsubmit = (e) => {
            e.preventDefault();
            return false;
        };

        // Búsqueda
        document.getElementById('search-input').oninput = () => {
            this.filtrarMovimientos();
        };

        // Filtros
        document.getElementById('filter-tipo').onchange = () => this.filtrarMovimientos();
        document.getElementById('filter-ubicacion').onchange = () => this.filtrarMovimientos();
        document.getElementById('filter-fecha-inicio').onchange = () => this.filtrarMovimientos();
        document.getElementById('filter-fecha-fin').onchange = () => this.filtrarMovimientos();

        // Limpiar filtros
        document.getElementById('btn-clear-filters').onclick = () => {
            document.getElementById('search-input').value = '';
            document.getElementById('filter-tipo').value = '';
            document.getElementById('filter-ubicacion').value = '';
            document.getElementById('filter-fecha-inicio').value = '';
            document.getElementById('filter-fecha-fin').value = '';
            this.filtrarMovimientos();
        };

        // Eventos de paginación
        document.getElementById('items-per-page').onchange = (e) => {
            this.changeItemsPerPage(e.target.value);
        };

        document.getElementById('btn-first-page').onclick = () => {
            this.changePage(1);
        };

        document.getElementById('btn-prev-page').onclick = () => {
            this.changePage(this.currentPage - 1);
        };

        document.getElementById('btn-next-page').onclick = () => {
            this.changePage(this.currentPage + 1);
        };

        document.getElementById('btn-last-page').onclick = () => {
            const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.changePage(totalPages);
        };
    },

    updateTipoSelection(tipo) {
        document.querySelectorAll('.tipo-card').forEach(card => {
            card.className = 'tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300';
        });

        const selectedCard = document.querySelector(`input[value="${tipo}"]`).nextElementSibling;
        const colors = {
            entrada: 'border-green-200 bg-green-50',
            salida: 'border-red-200 bg-red-50',
            ajuste: 'border-blue-200 bg-blue-50'
        };
        
        selectedCard.className = `tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all ${colors[tipo]}`;
    },

    setupProductSearch() {
        // Función inicial para configurar la búsqueda
        this.selectedProductId = null;
    },

    handleProductSearch(query) {
        clearTimeout(this.productSearchTimeout);
        
        if (query.length === 0) {
            this.showAllProducts();
            return;
        }
        
        if (query.length < 2) {
            this.hideProductDropdown();
            return;
        }

        this.productSearchTimeout = setTimeout(() => {
            this.searchProducts(query);
        }, 300);
    },

    showAllProducts() {
        // Mostrar todos los productos disponibles
        this.showProductDropdown(this.productos, true);
    },

    searchProducts(query) {
        const filteredProducts = this.productos.filter(producto => 
            producto.descripcion.toLowerCase().includes(query.toLowerCase())
        );

        this.showProductDropdown(filteredProducts);
    },

    showProductDropdown(products, showAll = false) {
        const dropdown = document.getElementById('producto-dropdown');
        if (!dropdown) return;

        if (products.length === 0) {
            dropdown.innerHTML = `
                <div class="px-4 py-3 text-sm text-gray-500 text-center">
                    <i class="fas fa-search text-gray-300 text-lg mb-1"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
        } else {
            let headerHtml = '';
            if (showAll) {
                headerHtml = `
                    <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium sticky top-0">
                        <i class="fas fa-list mr-1"></i>
                        Todos los productos (${products.length})
                    </div>
                `;
            }
            
            dropdown.innerHTML = headerHtml + products.map(producto => `
                <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 product-option"
                     data-id="${producto.id}" 
                     data-description="${producto.descripcion}">
                    <p class="text-gray-900">${producto.descripcion}</p>
                </div>
            `).join('');

            // Agregar event listeners a las opciones
            dropdown.querySelectorAll('.product-option').forEach(option => {
                option.onclick = () => {
                    const productId = option.dataset.id;
                    const productDescription = option.dataset.description;
                    this.selectProduct(productId, productDescription);
                };
            });
        }

        dropdown.classList.remove('hidden');
    },

    hideProductDropdown() {
        const dropdown = document.getElementById('producto-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    },

    // Métodos para el control de variantes
    handleVarianteSearch(query) {
        clearTimeout(this.varianteSearchTimeout);
        
        if (query.length === 0) {
            this.showAllVariantes();
            return;
        }
        
        if (query.length < 2) {
            this.hideVarianteDropdown();
            return;
        }

        this.varianteSearchTimeout = setTimeout(() => {
            this.searchVariantes(query);
        }, 300);
    },

    showAllVariantes() {
        // Mostrar todas las variantes disponibles del producto seleccionado
        this.showVarianteDropdown(this.variantesDelProducto, true);
    },

    searchVariantes(query) {
        const filteredVariantes = this.variantesDelProducto.filter(variante => {
            const varianteText = `${variante.codigo_variante} - ${variante.medida}`;
            return varianteText.toLowerCase().includes(query.toLowerCase());
        });

        this.showVarianteDropdown(filteredVariantes);
    },

    showVarianteDropdown(variantes, showAll = false) {
        const dropdown = document.getElementById('variante-dropdown');
        if (!dropdown) return;

        if (variantes.length === 0) {
            dropdown.innerHTML = `
                <div class="px-4 py-3 text-sm text-gray-500 text-center">
                    <i class="fas fa-search text-gray-300 text-lg mb-1"></i>
                    <p>No se encontraron variantes</p>
                </div>
            `;
        } else {
            let headerHtml = '';
            if (showAll) {
                headerHtml = `
                    <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-medium sticky top-0">
                        <i class="fas fa-list mr-1"></i>
                        Todas las variantes (${variantes.length})
                    </div>
                `;
            }
            
            dropdown.innerHTML = headerHtml + variantes.map(variante => `
                <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 variante-option"
                     data-id="${variante.id}" 
                     data-description="${variante.codigo_variante} - ${variante.medida}">
                    <p class="text-gray-900">${variante.codigo_variante} - ${variante.medida}</p>
                </div>
            `).join('');

            // Agregar event listeners a las opciones
            dropdown.querySelectorAll('.variante-option').forEach(option => {
                option.onclick = () => {
                    const varianteId = option.dataset.id;
                    const varianteDescription = option.dataset.description;
                    this.selectVariante(varianteId, varianteDescription);
                };
            });
        }

        dropdown.classList.remove('hidden');
    },

    selectVariante(varianteId, varianteDescription) {
        const searchInput = document.getElementById('input-variante-search');
        const hiddenInput = document.getElementById('select-variante');
        
        if (searchInput && hiddenInput) {
            searchInput.value = varianteDescription;
            hiddenInput.value = varianteId;
            this.hideVarianteDropdown();
            
            // Actualizar selector de ubicaciones con stock disponible
            this.updateUbicacionesWithStock(varianteId);
        }
    },

    async updateUbicacionesWithStock(varianteId) {
        const dropdown = document.getElementById('ubicacion-dropdown');
        const selectedText = document.getElementById('ubicacion-selected-text');
        const hiddenInput = document.getElementById('select-ubicacion');
        
        if (!varianteId) {
            // Si no hay variante seleccionada, mostrar mensaje informativo
            if (dropdown) {
                dropdown.innerHTML = `
                    <div class="p-4 text-center bg-blue-50 border-b">
                        <i class="fas fa-info-circle text-blue-500 text-lg mb-2"></i>
                        <p class="text-sm text-blue-700 font-medium">Selecciona una variante</p>
                        <p class="text-xs text-blue-600">para ver el stock disponible por ubicación</p>
                    </div>
                `;
            }
            if (selectedText) {
                selectedText.textContent = 'Seleccionar ubicación...';
                selectedText.className = 'text-gray-500';
            }
            if (hiddenInput) hiddenInput.value = '';
            return;
        }

        try {
            // Obtener stock por ubicación para la variante seleccionada
            const response = await fetch(`http://localhost:3001/api/stockinventario?variante_id=${varianteId}`);
            const data = await response.json();

            if (!dropdown) return;

            // Crear mapa de stock por ubicación
            const stockPorUbicacion = {};
            if (data.success && data.data) {
                data.data.forEach(item => {
                    if (item.ubicaciones) {
                        item.ubicaciones.forEach(ub => {
                            stockPorUbicacion[ub.ubicacion_id] = ub.stock_disponible || 0;
                        });
                    }
                });
            }

            // Poblar dropdown con ubicaciones y stock simplificado
            let dropdownHTML = `
                <div class="p-3 bg-blue-50 border-b">
                    <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center">
                        <i class="fas fa-warehouse mr-2"></i>Stock por Ubicación
                    </p>
                </div>
            `;
            
            this.ubicaciones.forEach(ubicacion => {
                const stock = stockPorUbicacion[ubicacion.id] || 0;
                let hoverClass = stock > 0 ? 'hover:bg-blue-50' : 'hover:bg-red-50';
                
                dropdownHTML += `
                    <div class="px-4 py-3 ${hoverClass} cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200" 
                         onclick="movimientosModule.selectUbicacion(${ubicacion.id}, '${ubicacion.nombre}', ${stock})">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <i class="fas fa-map-marker-alt text-white text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium text-gray-900">${ubicacion.nombre}</div>
                                <div class="text-sm ${stock > 0 ? 'text-green-600' : 'text-red-500'} mt-1">
                                    ${stock > 0 ? `${stock} unidades disponibles` : 'Sin stock disponible'}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            dropdown.innerHTML = dropdownHTML;

        } catch (error) {
            console.error('Error al cargar stock por ubicación:', error);
            // En caso de error, mostrar ubicaciones sin información de stock
            if (dropdown) {
                dropdown.innerHTML = `
                    <div class="p-4 text-center bg-red-50 border-b">
                        <i class="fas fa-exclamation-triangle text-red-500 text-lg mb-2"></i>
                        <p class="text-sm text-red-700 font-medium">Error al cargar el stock</p>
                        <p class="text-xs text-red-600">Inténtalo de nuevo más tarde</p>
                    </div>
                `;
            }
        }
    },

    selectUbicacion(ubicacionId, ubicacionNombre, stock) {
        const selectedText = document.getElementById('ubicacion-selected-text');
        const hiddenInput = document.getElementById('select-ubicacion');
        const dropdown = document.getElementById('ubicacion-dropdown');
        
        if (selectedText && hiddenInput) {
            // Mostrar ubicación seleccionada con diseño simplificado
            selectedText.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-map-marker-alt text-white text-xs"></i>
                    </div>
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">${ubicacionNombre}</div>
                        <div class="text-sm ${stock > 0 ? 'text-green-600' : 'text-red-500'} mt-0.5">
                            ${stock > 0 ? `${stock} unidades disponibles` : 'Sin stock disponible'}
                        </div>
                    </div>
                </div>
            `;
            selectedText.className = 'text-gray-900 flex-1';
            hiddenInput.value = ubicacionId;
        }
        
        // Ocultar dropdown con animación
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        // Rotar chevron de vuelta
        const chevron = document.getElementById('ubicacion-chevron');
        if (chevron) {
            chevron.classList.remove('rotate-180');
        }
    },
    
    hideUbicacionDropdown() {
        const dropdown = document.getElementById('ubicacion-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    },
    
    showUbicacionDropdown() {
        const dropdown = document.getElementById('ubicacion-dropdown');
        if (dropdown) {
            dropdown.classList.remove('hidden');
        }
    },

    hideVarianteDropdown() {
        const dropdown = document.getElementById('variante-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    },
    
    showUbicacionDropdown() {
        const dropdown = document.getElementById('ubicacion-dropdown');
        const chevron = document.getElementById('ubicacion-chevron');
        if (dropdown) {
            dropdown.classList.remove('hidden');
        }
        if (chevron) {
            chevron.classList.add('rotate-180');
        }
    },
    
    hideUbicacionDropdown() {
        const dropdown = document.getElementById('ubicacion-dropdown');
        const chevron = document.getElementById('ubicacion-chevron');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        if (chevron) {
            chevron.classList.remove('rotate-180');
        }
    },
    
    mostrarUbicacionesBasicas() {
        const dropdown = document.getElementById('ubicacion-dropdown');
        if (!dropdown || !this.ubicaciones || this.ubicaciones.length === 0) return;
        
        let dropdownHTML = `
            <div class="p-3 bg-blue-50 border-b">
                <p class="text-xs font-semibold text-blue-700 uppercase tracking-wide flex items-center">
                    <i class="fas fa-warehouse mr-2"></i>Ubicaciones Disponibles
                </p>
            </div>
        `;
        
        this.ubicaciones.forEach(ubicacion => {
            dropdownHTML += `
                <div class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200" 
                     onclick="movimientosModule.seleccionarUbicacion(${ubicacion.id}, '${ubicacion.nombre}')">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-map-marker-alt text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">${ubicacion.nombre}</div>
                            <div class="text-sm text-gray-500 mt-1">
                                Selecciona una variante para ver el stock
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        dropdown.innerHTML = dropdownHTML;
    },
    
    seleccionarUbicacion(ubicacionId, ubicacionNombre) {
        const selectedText = document.getElementById('ubicacion-selected-text');
        const hiddenInput = document.getElementById('select-ubicacion');
        
        if (selectedText && hiddenInput) {
            selectedText.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-map-marker-alt text-white text-xs"></i>
                    </div>
                    <span class="font-medium text-gray-900">${ubicacionNombre}</span>
                </div>
            `;
            selectedText.className = 'text-gray-900 flex-1';
            hiddenInput.value = ubicacionId;
        }
        
        this.hideUbicacionDropdown();
    },
    


    selectProduct(productId, productDescription) {
        // Actualizar el input y el campo oculto
        const searchInput = document.getElementById('input-producto-search');
        const hiddenInput = document.getElementById('selected-producto-id');
        
        if (searchInput) searchInput.value = productDescription;
        if (hiddenInput) hiddenInput.value = productId;
        
        this.selectedProductId = productId;
        this.hideProductDropdown();
        
        // Actualizar variantes
        this.updateVariantes(productId);
    },

    updateVariantes(productoId) {
        const varianteSearchInput = document.getElementById('input-variante-search');
        const selectVariante = document.getElementById('select-variante');
        
        if (productoId) {
            // Filtrar variantes del producto seleccionado
            this.variantesDelProducto = this.variantes.filter(v => v.id_producto == productoId);
            
            // Habilitar el control
            if (varianteSearchInput) {
                varianteSearchInput.disabled = false;
                varianteSearchInput.placeholder = "Buscar o seleccionar variante...";
            }
        } else {
            // Deshabilitar y limpiar el control
            this.variantesDelProducto = [];
            if (varianteSearchInput) {
                varianteSearchInput.disabled = true;
                varianteSearchInput.value = '';
                varianteSearchInput.placeholder = "Selecciona primero un producto...";
            }
            if (selectVariante) {
                selectVariante.value = '';
            }
            this.hideVarianteDropdown();
        }
        
        // Resetear selector de ubicaciones al cambiar producto
        const selectedUbicacionText = document.getElementById('ubicacion-selected-text');
        const ubicacionInput = document.getElementById('select-ubicacion');
        const ubicacionDropdown = document.getElementById('ubicacion-dropdown');
        
        if (selectedUbicacionText) {
            selectedUbicacionText.textContent = 'Seleccionar ubicación...';
            selectedUbicacionText.className = 'text-gray-500 flex-1';
        }
        if (ubicacionInput) ubicacionInput.value = '';
        if (ubicacionDropdown) {
            ubicacionDropdown.innerHTML = `
                <div class="p-3 text-sm text-blue-700 border-b bg-blue-50 flex items-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    Selecciona una variante para ver el stock disponible
                </div>
            `;
        }
    },

    async verDetalles(movimientoId) {
        try {
            // Buscar el movimiento en los datos ya cargados
            const movimiento = this.allMovimientos.find(m => m.id === movimientoId);
            
            if (!movimiento) {
                alert('No se encontró el movimiento solicitado');
                return;
            }

            // Formatear la fecha
            const fecha = new Date(movimiento.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Formatear cantidad con unidades
            const cantidad = movimiento.cantidad;
            const unidad = cantidad === 1 ? 'u.' : 'uds.';

            // Formatear precio
            const precio = movimiento.precio_unitario ? `$${Number(movimiento.precio_unitario).toLocaleString()}` : 'No especificado';
            const valorTotal = movimiento.valor_total ? `$${Number(movimiento.valor_total).toLocaleString()}` : 'No calculado';

            // Generar el HTML con los detalles más compacto
            const detalleHTML = `
                <div class="space-y-3">
                    <!-- Información básica en una fila -->
                    <div class="grid grid-cols-4 gap-3 text-sm">
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">ID</span>
                            <span class="font-semibold">${movimiento.id}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Tipo</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                movimiento.tipo === 'entrada' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }">
                                ${movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}
                            </span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Cantidad</span>
                            <span class="font-semibold text-lg">${cantidad} ${unidad}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Usuario</span>
                            <span class="font-semibold">${movimiento.usuario || 'N/A'}</span>
                        </div>
                    </div>

                    <!-- Producto y Variante -->
                    <div class="bg-blue-50 p-3 rounded">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <span class="text-xs text-gray-600 block">Producto</span>
                                <span class="font-semibold text-gray-900">${movimiento.producto_descripcion}</span>
                            </div>
                            <div>
                                <span class="text-xs text-gray-600 block">Variante</span>
                                <span class="text-gray-900">${movimiento.codigo_variante} - ${movimiento.variante_medida}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles del movimiento -->
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Ubicación</span>
                            <span class="font-medium">${movimiento.ubicacion_nombre}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Motivo</span>
                            <span class="font-medium">${movimiento.motivo || 'No especificado'}</span>
                        </div>
                    </div>

                    <!-- Información financiera -->
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-green-50 p-3 rounded">
                            <span class="text-xs text-green-600 block">Precio Unitario</span>
                            <span class="font-semibold text-green-800">${precio}</span>
                        </div>
                        <div class="bg-green-50 p-3 rounded">
                            <span class="text-xs text-green-600 block">Valor Total</span>
                            <span class="font-semibold text-green-800">${valorTotal}</span>
                        </div>
                    </div>

                    <!-- Referencia y Observaciones -->
                    ${(movimiento.referencia || movimiento.observaciones) ? `
                    <div class="space-y-2">
                        ${movimiento.referencia ? `
                        <div class="bg-yellow-50 p-3 rounded">
                            <span class="text-xs text-yellow-600 block">Referencia</span>
                            <span class="text-yellow-800">${movimiento.referencia}</span>
                        </div>
                        ` : ''}
                        ${movimiento.observaciones ? `
                        <div class="bg-purple-50 p-3 rounded">
                            <span class="text-xs text-purple-600 block">Observaciones</span>
                            <span class="text-purple-800">${movimiento.observaciones}</span>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}

                    <!-- Fecha al final -->
                    <div class="text-center text-xs text-gray-500 border-t pt-2">
                        <i class="fas fa-calendar mr-1"></i>
                        ${fecha}
                    </div>
                </div>
            `;

            // Mostrar el contenido en el modal
            document.getElementById('detalle-movimiento-content').innerHTML = detalleHTML;
            
            // Mostrar el modal
            document.getElementById('modal-detalle-movimiento').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error al mostrar detalles del movimiento:', error);
            alert('Error al cargar los detalles del movimiento');
        }
    },

    cerrarModalDetalle() {
        document.getElementById('modal-detalle-movimiento').classList.add('hidden');
    },

    async submitMovimiento() {
        // Prevenir múltiples envíos simultáneos
        if (this.isSubmitting) {
            console.log('Ya se está procesando un movimiento, ignorando...');
            return;
        }
        
        this.isSubmitting = true;
        const submitBtn = document.getElementById('btn-submit-modal');
        
        if (!submitBtn) {
            this.isSubmitting = false;
            return;
        }
        
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
            submitBtn.disabled = true;

            const formData = {
                tipo: document.querySelector('input[name="tipo"]:checked').value,
                id_variante: document.getElementById('select-variante').value,
                id_ubicacion: document.getElementById('select-ubicacion').value,
                cantidad: document.getElementById('input-cantidad').value,
                precio_unitario: document.getElementById('input-precio').value || null,
                motivo: document.getElementById('select-motivo').value,
                referencia: document.getElementById('input-referencia').value,
                usuario: document.getElementById('input-usuario').value,
                observaciones: document.getElementById('input-observaciones').value
            };

            // Validaciones básicas
            const selectedProductId = document.getElementById('selected-producto-id').value;
            if (!selectedProductId || !formData.id_variante || !formData.id_ubicacion || !formData.cantidad || !formData.motivo || !formData.usuario) {
                window.app.showToast('error', 'Error', 'Por favor completa todos los campos requeridos');
                return;
            }

            const response = await fetch('http://localhost:3001/api/movimientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                window.app.showToast('success', 'Éxito', result.message || 'Movimiento registrado correctamente');
                this.closeModal();
                this.resetForm();
                // Recargar datos solo una vez
                await this.loadData();
                this.renderMovimientos();
            } else {
                window.app.showToast('error', 'Error', result.message || 'Error al registrar movimiento');
            }
        } catch (error) {
            console.error('Error:', error);
            window.app.showToast('error', 'Error', 'Error al conectar con el servidor');
        } finally {
            this.isSubmitting = false;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    closeModal() {
        this.showModal = false;
        document.getElementById('modal-nuevo-movimiento').classList.add('hidden');
        // Resetear el formulario para la próxima vez
        this.resetForm();
    },

    resetForm() {
        document.getElementById('form-movimiento').reset();
        document.querySelector('input[value="entrada"]').checked = true;
        this.updateTipoSelection('entrada');
        this.loadMotivos('entrada');
        document.getElementById('input-usuario').value = 'Juan';
        
        // Limpiar búsqueda de productos
        const searchInput = document.getElementById('input-producto-search');
        const hiddenInput = document.getElementById('selected-producto-id');
        if (searchInput) searchInput.value = '';
        if (hiddenInput) hiddenInput.value = '';
        this.selectedProductId = null;
        this.hideProductDropdown();
        
        // Limpiar búsqueda de variantes
        const varianteSearchInput = document.getElementById('input-variante-search');
        const selectVariante = document.getElementById('select-variante');
        if (varianteSearchInput) {
            varianteSearchInput.disabled = true;
            varianteSearchInput.value = '';
            varianteSearchInput.placeholder = "Selecciona primero un producto...";
        }
        if (selectVariante) {
            selectVariante.value = '';
        }
        this.hideVarianteDropdown();
        this.variantesDelProducto = [];
        
        // Resetear selector de ubicaciones al estado normal
        const selectedText = document.getElementById('ubicacion-selected-text');
        const ubicacionHiddenInput = document.getElementById('select-ubicacion');
        const dropdown = document.getElementById('ubicacion-dropdown');
        
        if (selectedText) {
            selectedText.textContent = 'Seleccionar ubicación...';
            selectedText.className = 'text-gray-500';
        }
        if (ubicacionHiddenInput) ubicacionHiddenInput.value = '';
        if (dropdown) {
            dropdown.innerHTML = '<div class="p-2 text-sm text-gray-500 border-b">Selecciona una variante para ver el stock disponible</div>';
        }
        this.hideUbicacionDropdown();
    },

    filtrarMovimientos() {
        // Verificar si hay filtros activos
        this.checkIfFiltersActive();
        
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const tipoFilter = document.getElementById('filter-tipo').value;
        const ubicacionFilter = document.getElementById('filter-ubicacion').value;
        const fechaInicio = document.getElementById('filter-fecha-inicio').value;
        const fechaFin = document.getElementById('filter-fecha-fin').value;

        // Empezar siempre con todos los movimientos
        let movimientosFiltrados = [...this.allMovimientos];

        // Aplicar filtros específicos
        if (searchTerm) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                m.producto_descripcion.toLowerCase().includes(searchTerm) ||
                m.codigo_variante.toLowerCase().includes(searchTerm) ||
                m.ubicacion_nombre.toLowerCase().includes(searchTerm) ||
                m.motivo.toLowerCase().includes(searchTerm) ||
                m.usuario.toLowerCase().includes(searchTerm)
            );
        }

        if (tipoFilter) {
            movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === tipoFilter);
        }

        if (ubicacionFilter) {
            movimientosFiltrados = movimientosFiltrados.filter(m => m.id_ubicacion == ubicacionFilter);
        }

        if (fechaInicio) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                new Date(m.fecha) >= new Date(fechaInicio)
            );
        }

        if (fechaFin) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                new Date(m.fecha) <= new Date(fechaFin + 'T23:59:59')
            );
        }

        // Actualizar movimientos filtrados y resetear paginación
        this.movimientos = movimientosFiltrados;
        this.totalItems = movimientosFiltrados.length;
        this.currentPage = 1;
        
        // Renderizar y actualizar dashboard
        this.renderMovimientos();
        this.updateDashboard();
    },



    updateDashboard() {
        // Obtener fecha de hoy en formato local
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + 
            String(today.getMonth() + 1).padStart(2, '0') + '-' + 
            String(today.getDate()).padStart(2, '0');
        
        // Usar todos los movimientos para el dashboard
        const todosLosMovimientos = this.allMovimientos;
        
        // Filtrar movimientos de hoy (comparar solo la fecha, no la hora)
        const movimientosHoy = todosLosMovimientos.filter(m => {
            let fechaMovimiento;
            if (m.fecha) {
                // Si la fecha incluye hora, extraer solo la parte de la fecha
                fechaMovimiento = m.fecha.split(' ')[0];
                // Si no tiene hora, usar tal como está
                if (!fechaMovimiento) {
                    fechaMovimiento = m.fecha.split('T')[0];
                }
            }
            return fechaMovimiento === todayStr;
        });

        // Calcular métricas
        const ingresosHoy = movimientosHoy.filter(m => m.tipo === 'entrada').length;
        const salidasHoy = movimientosHoy.filter(m => m.tipo === 'salida').length;
        const totalMovimientos = todosLosMovimientos.length;
        
        // Calcular cantidad movida (suma total de cantidades)
        const cantidadMovida = todosLosMovimientos.reduce((total, m) => {
            if (m.cantidad) {
                return total + parseInt(m.cantidad);
            }
            return total;
        }, 0);



        // Actualizar elementos del DOM
        const ingresosElement = document.getElementById('ingresos-hoy');
        const salidasElement = document.getElementById('salidas-hoy');
        const totalElement = document.getElementById('total-movimientos');
        const cantidadElement = document.getElementById('cantidad-movida');

        if (ingresosElement) ingresosElement.textContent = ingresosHoy;
        if (salidasElement) salidasElement.textContent = salidasHoy;
        if (totalElement) totalElement.textContent = totalMovimientos;
        if (cantidadElement) {
            const unidadTexto = cantidadMovida <= 1 ? 'u.' : 'uds.';
            cantidadElement.textContent = `${cantidadMovida.toLocaleString('es-ES')} ${unidadTexto}`;
        }
    }
};