// Módulo Movimientos Completo
window.movimientosModule = {
    data: {
        movimientos: [],
        filteredMovimientos: [],
        filters: {
            search: '',
            tipo: '',
            ubicacion: '',
            dateFrom: '',
            dateTo: ''
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 25,
            totalItems: 0,
            totalPages: 0
        },
        ubicaciones: [],
        sortConfig: {
            key: 'fecha',
            direction: 'desc'
        },
        stats: {
            totalMovimientos: 0,
            totalEntradas: 0,
            totalSalidas: 0,
            valorTotal: 0
        }
    },

    async load() {
        const container = document.getElementById('movimientos-content');
        container.innerHTML = this.getHTML();
        
        await this.init();
    },

    async init() {
        try {
            await this.loadUbicaciones();
            await this.loadMovimientos();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando módulo movimientos:', error);
            this.showMessage('Error al cargar los movimientos', 'error');
        }
    },

    async loadUbicaciones() {
        try {
            const response = await window.app.apiRequest('/api/ubicaciones');
            if (response.success) {
                this.data.ubicaciones = response.data;
                this.populateUbicacionesFilter();
            }
        } catch (error) {
            console.error('Error cargando ubicaciones:', error);
        }
    },

    async loadMovimientos(page = 1) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: this.data.pagination.itemsPerPage,
                ...this.data.filters
            });

            const response = await window.app.apiRequest(`/api/movimientos?${params}`);
            
            if (response.success) {
                this.data.movimientos = response.data;
                this.data.pagination.totalItems = response.count || response.data.length;
                this.data.pagination.totalPages = Math.ceil(this.data.pagination.totalItems / this.data.pagination.itemsPerPage);
                this.data.pagination.currentPage = page;
                
                this.applyFilters();
                this.renderTable();
                this.updateStats();
                this.renderPagination();
            }
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            this.showMessage('Error al cargar los movimientos', 'error');
        }
    },

    applyFilters() {
        let filtered = [...this.data.movimientos];

        // Filtro de búsqueda
        if (this.data.filters.search) {
            const search = this.data.filters.search.toLowerCase();
            filtered = filtered.filter(mov => 
                mov.producto_descripcion?.toLowerCase().includes(search) ||
                mov.codigo_variante?.toLowerCase().includes(search) ||
                mov.ubicacion_nombre?.toLowerCase().includes(search) ||
                mov.referencia?.toLowerCase().includes(search) ||
                mov.motivo?.toLowerCase().includes(search)
            );
        }

        // Filtro por tipo
        if (this.data.filters.tipo) {
            filtered = filtered.filter(mov => mov.tipo === this.data.filters.tipo);
        }

        // Filtro por ubicación
        if (this.data.filters.ubicacion) {
            filtered = filtered.filter(mov => mov.ubicacion_nombre === this.data.filters.ubicacion);
        }

        // Filtros de fecha
        if (this.data.filters.dateFrom) {
            filtered = filtered.filter(mov => mov.fecha >= this.data.filters.dateFrom);
        }

        if (this.data.filters.dateTo) {
            filtered = filtered.filter(mov => mov.fecha <= this.data.filters.dateTo);
        }

        this.data.filteredMovimientos = filtered;
    },

    renderTable() {
        const tbody = document.getElementById('movimientos-tbody');
        if (!tbody) return;

        if (this.data.filteredMovimientos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-exchange-alt text-4xl text-gray-300 mb-4"></i>
                            <p class="text-lg font-medium">No se encontraron movimientos</p>
                            <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.filteredMovimientos.map(movimiento => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                            <div class="h-8 w-8 rounded-full flex items-center justify-center ${this.getTipoColor(movimiento.tipo)}">
                                <i class="fas ${this.getTipoIcon(movimiento.tipo)} text-white text-xs"></i>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}</div>
                            <div class="text-sm text-gray-500">${movimiento.subtipo || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${movimiento.producto_descripcion}</div>
                    <div class="text-sm text-gray-500">${movimiento.codigo_variante} - ${movimiento.variante_medida}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${movimiento.ubicacion_nombre}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${movimiento.cantidad}</div>
                    <div class="text-sm text-gray-500">$${parseFloat(movimiento.precio_unitario || 0).toFixed(2)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    $${parseFloat(movimiento.valor_total || 0).toFixed(2)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatDate(movimiento.fecha)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getEstadoColor(movimiento.estado)}">
                        ${movimiento.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                        <button onclick="movimientosModule.viewDetails(${movimiento.id})" 
                                class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getTipoColor(tipo) {
        const colors = {
            'entrada': 'bg-green-500',
            'salida': 'bg-red-500',
            'transferencia': 'bg-blue-500',
            'ajuste': 'bg-yellow-500'
        };
        return colors[tipo] || 'bg-gray-500';
    },

    getTipoIcon(tipo) {
        const icons = {
            'entrada': 'fa-plus',
            'salida': 'fa-minus',
            'transferencia': 'fa-exchange-alt',
            'ajuste': 'fa-tools'
        };
        return icons[tipo] || 'fa-question';
    },

    getEstadoColor(estado) {
        const colors = {
            'completado': 'bg-green-100 text-green-800',
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'cancelado': 'bg-red-100 text-red-800'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    updateStats() {
        const movimientos = this.data.filteredMovimientos;
        
        this.data.stats = {
            totalMovimientos: movimientos.length,
            totalEntradas: movimientos.filter(m => m.tipo === 'entrada').length,
            totalSalidas: movimientos.filter(m => m.tipo === 'salida').length,
            valorTotal: movimientos.reduce((sum, m) => sum + (parseFloat(m.valor_total) || 0), 0)
        };

        // Actualizar elementos del DOM
        const statsElements = {
            'total-movimientos': this.data.stats.totalMovimientos,
            'total-entradas': this.data.stats.totalEntradas,
            'total-salidas': this.data.stats.totalSalidas,
            'valor-total': `$${this.data.stats.valorTotal.toFixed(2)}`
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },

    populateUbicacionesFilter() {
        const select = document.getElementById('filter-ubicacion');
        if (!select) return;

        select.innerHTML = '<option value="">Todas las ubicaciones</option>';
        this.data.ubicaciones.forEach(ubicacion => {
            select.innerHTML += `<option value="${ubicacion.nombre}">${ubicacion.nombre}</option>`;
        });
    },

    renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        const { currentPage, totalPages } = this.data.pagination;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div class="flex flex-1 justify-between sm:hidden">
                    <button ${currentPage === 1 ? 'disabled' : ''} 
                            onclick="movimientosModule.loadMovimientos(${currentPage - 1})"
                            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Anterior
                    </button>
                    <button ${currentPage === totalPages ? 'disabled' : ''} 
                            onclick="movimientosModule.loadMovimientos(${currentPage + 1})"
                            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Siguiente
                    </button>
                </div>
                <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Mostrando página <span class="font-medium">${currentPage}</span> de <span class="font-medium">${totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        `;

        // Botón anterior
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="movimientosModule.loadMovimientos(${currentPage - 1})"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <i class="fas fa-chevron-left text-xs"></i>
            </button>
        `;

        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button onclick="movimientosModule.loadMovimientos(${i})"
                            class="relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                i === currentPage 
                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">...</span>`;
            }
        }

        // Botón siguiente
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="movimientosModule.loadMovimientos(${currentPage + 1})"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                <i class="fas fa-chevron-right text-xs"></i>
            </button>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('search-movimientos');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.filters.search = e.target.value;
                this.applyFilters();
                this.renderTable();
                this.updateStats();
            });
        }

        // Filtros
        ['filter-tipo', 'filter-ubicacion'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.data.filters[id.replace('filter-', '')] = e.target.value;
                    this.applyFilters();
                    this.renderTable();
                    this.updateStats();
                });
            }
        });

        // Filtros de fecha
        const dateFromInput = document.getElementById('date-from');
        const dateToInput = document.getElementById('date-to');
        
        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                this.data.filters.dateFrom = e.target.value;
                this.applyFilters();
                this.renderTable();
                this.updateStats();
            });
        }

        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                this.data.filters.dateTo = e.target.value;
                this.applyFilters();
                this.renderTable();
                this.updateStats();
            });
        }

        // Botón exportar
        const exportBtn = document.getElementById('export-movimientos');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportMovimientos());
        }

        // Botón refrescar
        const refreshBtn = document.getElementById('refresh-movimientos');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadMovimientos());
        }
    },

    async viewDetails(id) {
        const movimiento = this.data.movimientos.find(m => m.id === id);
        if (!movimiento) return;

        // Mostrar modal con detalles del movimiento
        const modalHTML = `
            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${this.getTipoColor(movimiento.tipo)} sm:mx-0 sm:h-10 sm:w-10">
                                    <i class="fas ${this.getTipoIcon(movimiento.tipo)} text-white"></i>
                                </div>
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                                        Detalles del Movimiento #${movimiento.id}
                                    </h3>
                                    <div class="mt-4 space-y-3">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Tipo</label>
                                            <p class="text-sm text-gray-900">${movimiento.tipo} - ${movimiento.subtipo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Producto</label>
                                            <p class="text-sm text-gray-900">${movimiento.producto_descripcion}</p>
                                            <p class="text-xs text-gray-500">${movimiento.codigo_variante} - ${movimiento.variante_medida}</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                                            <p class="text-sm text-gray-900">${movimiento.ubicacion_nombre}</p>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Cantidad</label>
                                                <p class="text-sm text-gray-900">${movimiento.cantidad}</p>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Precio Unit.</label>
                                                <p class="text-sm text-gray-900">$${parseFloat(movimiento.precio_unitario || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Valor Total</label>
                                            <p class="text-sm font-semibold text-gray-900">$${parseFloat(movimiento.valor_total || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Motivo</label>
                                            <p class="text-sm text-gray-900">${movimiento.motivo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Referencia</label>
                                            <p class="text-sm text-gray-900">${movimiento.referencia || 'N/A'}</p>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                                <p class="text-sm text-gray-900">${this.formatDate(movimiento.fecha)}</p>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700">Estado</label>
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getEstadoColor(movimiento.estado)}">
                                                    ${movimiento.estado}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Usuario</label>
                                            <p class="text-sm text-gray-900">${movimiento.usuario_nombre || movimiento.usuario}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    exportMovimientos() {
        // Implementar exportación a CSV
        const data = this.data.filteredMovimientos;
        if (data.length === 0) {
            this.showMessage('No hay datos para exportar', 'warning');
            return;
        }

        const headers = ['ID', 'Tipo', 'Producto', 'Código', 'Ubicación', 'Cantidad', 'Precio Unit.', 'Total', 'Fecha', 'Estado', 'Usuario'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.id,
                item.tipo,
                `"${item.producto_descripcion}"`,
                item.codigo_variante,
                `"${item.ubicacion_nombre}"`,
                item.cantidad,
                item.precio_unitario || 0,
                item.valor_total || 0,
                item.fecha,
                item.estado,
                item.usuario_nombre || item.usuario
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showMessage('Movimientos exportados exitosamente', 'success');
    },

    showMessage(message, type = 'info') {
        // Simple alert for now, could be enhanced with a toast component
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else if (type === 'success') {
            alert(`Éxito: ${message}`);
        } else if (type === 'warning') {
            alert(`Advertencia: ${message}`);
        } else {
            alert(message);
        }
    },

    getHTML() {
        return `
            <div class="px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                        <h1 class="text-xl font-semibold text-gray-900">Movimientos de Inventario</h1>
                        <p class="mt-2 text-sm text-gray-700">
                            Historial completo de todos los movimientos de inventario.
                        </p>
                    </div>
                    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                        <button id="refresh-movimientos" type="button" 
                                class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <i class="fas fa-sync-alt -ml-1 mr-2 h-4 w-4"></i>
                            Actualizar
                        </button>
                        <button id="export-movimientos" type="button" 
                                class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <i class="fas fa-download -ml-1 mr-2 h-4 w-4"></i>
                            Exportar
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-exchange-alt text-gray-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Total Movimientos</dt>
                                        <dd id="total-movimientos" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-plus text-green-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Entradas</dt>
                                        <dd id="total-entradas" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-minus text-red-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Salidas</dt>
                                        <dd id="total-salidas" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-dollar-sign text-blue-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                                        <dd id="valor-total" class="text-lg font-medium text-gray-900">$0.00</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="mt-6 bg-white shadow rounded-lg p-6">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        <div class="lg:col-span-2">
                            <label for="search-movimientos" class="block text-sm font-medium text-gray-700">Buscar</label>
                            <div class="mt-1 relative">
                                <input type="text" id="search-movimientos" 
                                       placeholder="Buscar por producto, código, ubicación..." 
                                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label for="filter-tipo" class="block text-sm font-medium text-gray-700">Tipo</label>
                            <select id="filter-tipo" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <option value="">Todos los tipos</option>
                                <option value="entrada">Entradas</option>
                                <option value="salida">Salidas</option>
                                <option value="transferencia">Transferencias</option>
                                <option value="ajuste">Ajustes</option>
                            </select>
                        </div>

                        <div>
                            <label for="filter-ubicacion" class="block text-sm font-medium text-gray-700">Ubicación</label>
                            <select id="filter-ubicacion" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <option value="">Todas las ubicaciones</option>
                            </select>
                        </div>

                        <div>
                            <label for="date-from" class="block text-sm font-medium text-gray-700">Desde</label>
                            <input type="date" id="date-from" 
                                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        </div>

                        <div>
                            <label for="date-to" class="block text-sm font-medium text-gray-700">Hasta</label>
                            <input type="date" id="date-to" 
                                   class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="mt-6 bg-white shadow rounded-lg overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cantidad/Precio
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" class="relative px-6 py-3">
                                        <span class="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="movimientos-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Contenido de la tabla se carga aquí -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="pagination-container">
                        <!-- Paginación se carga aquí -->
                    </div>
                </div>
            </div>
        `;
    }
};