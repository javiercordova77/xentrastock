// Módulo Transferencias Completo
window.transferenciasModule = {
    data: {
        transferencias: [],
        filteredTransferencias: [],
        filters: {
            search: '',
            estado: '',
            ubicacionOrigen: '',
            ubicacionDestino: ''
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 25,
            totalItems: 0,
            totalPages: 0
        },
        ubicaciones: [],
        productos: [],
        variantes: [],
        editingTransferencia: null,
        isModalOpen: false,
        stats: {
            totalTransferencias: 0,
            pendientes: 0,
            completadas: 0,
            valorTotal: 0
        }
    },

    async load() {
        const container = document.getElementById('transferencias-content');
        container.innerHTML = this.getHTML();
        
        await this.init();
    },

    async init() {
        try {
            await this.loadUbicaciones();
            await this.loadProductos();
            await this.loadTransferencias();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error inicializando módulo transferencias:', error);
            this.showMessage('Error al cargar las transferencias', 'error');
        }
    },

    async loadUbicaciones() {
        try {
            const response = await window.app.apiRequest('/api/ubicaciones');
            if (response.success) {
                this.data.ubicaciones = response.data;
                this.populateUbicacionesFilters();
            }
        } catch (error) {
            console.error('Error cargando ubicaciones:', error);
        }
    },

    async loadProductos() {
        try {
            const response = await window.app.apiRequest('/api/productos');
            if (response.success) {
                this.data.productos = response.data;
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    },

    async loadTransferencias(page = 1) {
        try {
            const params = new URLSearchParams({
                page: page,
                limit: this.data.pagination.itemsPerPage
            });

            const response = await window.app.apiRequest(`/api/transferencias?${params}`);
            
            if (response.success) {
                this.data.transferencias = response.data;
                this.data.pagination.totalItems = response.count || response.data.length;
                this.data.pagination.totalPages = Math.ceil(this.data.pagination.totalItems / this.data.pagination.itemsPerPage);
                this.data.pagination.currentPage = page;
                
                this.applyFilters();
                this.renderTable();
                this.updateStats();
                this.renderPagination();
            }
        } catch (error) {
            console.error('Error cargando transferencias:', error);
            this.showMessage('Error al cargar las transferencias', 'error');
        }
    },

    applyFilters() {
        let filtered = [...this.data.transferencias];

        if (this.data.filters.search) {
            const search = this.data.filters.search.toLowerCase();
            filtered = filtered.filter(trans => 
                trans.producto_descripcion?.toLowerCase().includes(search) ||
                trans.codigo_variante?.toLowerCase().includes(search) ||
                trans.ubicacion_origen?.toLowerCase().includes(search) ||
                trans.ubicacion_destino?.toLowerCase().includes(search) ||
                trans.motivo?.toLowerCase().includes(search)
            );
        }

        if (this.data.filters.estado) {
            filtered = filtered.filter(trans => trans.estado === this.data.filters.estado);
        }

        if (this.data.filters.ubicacionOrigen) {
            filtered = filtered.filter(trans => trans.ubicacion_origen === this.data.filters.ubicacionOrigen);
        }

        if (this.data.filters.ubicacionDestino) {
            filtered = filtered.filter(trans => trans.ubicacion_destino === this.data.filters.ubicacionDestino);
        }

        this.data.filteredTransferencias = filtered;
    },

    renderTable() {
        const tbody = document.getElementById('transferencias-tbody');
        if (!tbody) return;

        if (this.data.filteredTransferencias.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-shipping-fast text-4xl text-gray-300 mb-4"></i>
                            <p class="text-lg font-medium">No se encontraron transferencias</p>
                            <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.filteredTransferencias.map(transferencia => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">#${transferencia.id}</div>
                    <div class="text-sm text-gray-500">${this.formatDate(transferencia.fecha_creacion)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${transferencia.producto_descripcion}</div>
                    <div class="text-sm text-gray-500">${transferencia.codigo_variante} - ${transferencia.variante_medida}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transferencia.cantidad}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${transferencia.ubicacion_origen}</div>
                    <div class="text-xs text-gray-500">Origen</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${transferencia.ubicacion_destino}</div>
                    <div class="text-xs text-gray-500">Destino</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getEstadoColor(transferencia.estado)}">
                        ${transferencia.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                        <button onclick="transferenciasModule.viewDetails(${transferencia.id})" 
                                class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${transferencia.estado === 'pendiente' ? `
                            <button onclick="transferenciasModule.editTransferencia(${transferencia.id})" 
                                    class="text-indigo-600 hover:text-indigo-900">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="transferenciasModule.completeTransferencia(${transferencia.id})" 
                                    class="text-green-600 hover:text-green-900">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getEstadoColor(estado) {
        const colors = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'en_transito': 'bg-blue-100 text-blue-800',
            'completada': 'bg-green-100 text-green-800',
            'cancelada': 'bg-red-100 text-red-800'
        };
        return colors[estado] || 'bg-gray-100 text-gray-800';
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    updateStats() {
        const transferencias = this.data.filteredTransferencias;
        
        this.data.stats = {
            totalTransferencias: transferencias.length,
            pendientes: transferencias.filter(t => t.estado === 'pendiente').length,
            completadas: transferencias.filter(t => t.estado === 'completada').length,
            valorTotal: transferencias.reduce((sum, t) => sum + (t.cantidad * (t.precio_venta || 0)), 0)
        };

        const statsElements = {
            'total-transferencias': this.data.stats.totalTransferencias,
            'transferencias-pendientes': this.data.stats.pendientes,
            'transferencias-completadas': this.data.stats.completadas
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },

    populateUbicacionesFilters() {
        const origenSelect = document.getElementById('filter-ubicacion-origen');
        const destinoSelect = document.getElementById('filter-ubicacion-destino');

        if (origenSelect) {
            origenSelect.innerHTML = '<option value="">Todas las ubicaciones</option>';
            this.data.ubicaciones.forEach(ubicacion => {
                origenSelect.innerHTML += `<option value="${ubicacion.nombre}">${ubicacion.nombre}</option>`;
            });
        }

        if (destinoSelect) {
            destinoSelect.innerHTML = '<option value="">Todas las ubicaciones</option>';
            this.data.ubicaciones.forEach(ubicacion => {
                destinoSelect.innerHTML += `<option value="${ubicacion.nombre}">${ubicacion.nombre}</option>`;
            });
        }
    },

    renderPagination() {
        const container = document.getElementById('transferencias-pagination');
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
                            onclick="transferenciasModule.loadTransferencias(${currentPage - 1})"
                            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        Anterior
                    </button>
                    <button ${currentPage === totalPages ? 'disabled' : ''} 
                            onclick="transferenciasModule.loadTransferencias(${currentPage + 1})"
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
                </div>
            </div>
        `;

        container.innerHTML = paginationHTML;
    },

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('search-transferencias');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.filters.search = e.target.value;
                this.applyFilters();
                this.renderTable();
                this.updateStats();
            });
        }

        // Filtros
        ['filter-estado', 'filter-ubicacion-origen', 'filter-ubicacion-destino'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    const filterKey = id.replace('filter-', '').replace('-', '');
                    this.data.filters[filterKey] = e.target.value;
                    this.applyFilters();
                    this.renderTable();
                    this.updateStats();
                });
            }
        });

        // Botón nueva transferencia
        const addBtn = document.getElementById('add-transferencia');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Botón refrescar
        const refreshBtn = document.getElementById('refresh-transferencias');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTransferencias());
        }
    },

    openModal(transferencia = null) {
        this.data.editingTransferencia = transferencia;
        this.data.isModalOpen = true;
        
        const modalHTML = `
            <div id="transferencia-modal" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <form id="transferencia-form">
                            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    ${transferencia ? 'Editar Transferencia' : 'Nueva Transferencia'}
                                </h3>
                                <div class="grid grid-cols-1 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Producto/Variante</label>
                                        <select id="variante-select" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">Selecciona un producto...</option>
                                        </select>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Ubicación Origen</label>
                                            <select id="ubicacion-origen" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Selecciona origen...</option>
                                                ${this.data.ubicaciones.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700">Ubicación Destino</label>
                                            <select id="ubicacion-destino" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Selecciona destino...</option>
                                                ${this.data.ubicaciones.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Cantidad</label>
                                        <input type="number" id="cantidad" min="1" required 
                                               class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Motivo</label>
                                        <textarea id="motivo" rows="3" 
                                                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    ${transferencia ? 'Actualizar' : 'Crear'} Transferencia
                                </button>
                                <button type="button" onclick="transferenciasModule.closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.loadVariantesForSelect();
        this.setupModalEventListeners();
    },

    async loadVariantesForSelect() {
        try {
            const response = await window.app.apiRequest('/api/variantes');
            if (response.success) {
                const select = document.getElementById('variante-select');
                if (select) {
                    select.innerHTML = '<option value="">Selecciona un producto...</option>';
                    response.data.forEach(variante => {
                        select.innerHTML += `<option value="${variante.id}">${variante.producto_descripcion} - ${variante.codigo_variante} (${variante.medida})</option>`;
                    });
                }
            }
        } catch (error) {
            console.error('Error cargando variantes:', error);
        }
    },

    setupModalEventListeners() {
        const form = document.getElementById('transferencia-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTransferencia();
            });
        }
    },

    async saveTransferencia() {
        const formData = {
            variante_id: document.getElementById('variante-select').value,
            ubicacion_origen_id: document.getElementById('ubicacion-origen').value,
            ubicacion_destino_id: document.getElementById('ubicacion-destino').value,
            cantidad: parseInt(document.getElementById('cantidad').value),
            motivo: document.getElementById('motivo').value,
            estado: 'pendiente',
            usuario: 'admin'
        };

        try {
            let response;
            if (this.data.editingTransferencia) {
                response = await window.app.apiRequest(`/api/transferencias/${this.data.editingTransferencia.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await window.app.apiRequest('/api/transferencias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (response.success) {
                this.showMessage(
                    this.data.editingTransferencia ? 'Transferencia actualizada exitosamente' : 'Transferencia creada exitosamente', 
                    'success'
                );
                this.closeModal();
                this.loadTransferencias();
            } else {
                this.showMessage(response.message || 'Error al guardar la transferencia', 'error');
            }
        } catch (error) {
            console.error('Error guardando transferencia:', error);
            this.showMessage('Error al guardar la transferencia', 'error');
        }
    },

    closeModal() {
        const modal = document.getElementById('transferencia-modal');
        if (modal) {
            modal.remove();
        }
        this.data.isModalOpen = false;
        this.data.editingTransferencia = null;
    },

    async editTransferencia(id) {
        const transferencia = this.data.transferencias.find(t => t.id === id);
        if (transferencia) {
            this.openModal(transferencia);
        }
    },

    async completeTransferencia(id) {
        if (!confirm('¿Estás seguro de que deseas completar esta transferencia?')) {
            return;
        }

        try {
            const response = await window.app.apiRequest(`/api/transferencias/${id}/complete`, {
                method: 'PUT'
            });

            if (response.success) {
                this.showMessage('Transferencia completada exitosamente', 'success');
                this.loadTransferencias();
            } else {
                this.showMessage(response.message || 'Error al completar la transferencia', 'error');
            }
        } catch (error) {
            console.error('Error completando transferencia:', error);
            this.showMessage('Error al completar la transferencia', 'error');
        }
    },

    async viewDetails(id) {
        const transferencia = this.data.transferencias.find(t => t.id === id);
        if (!transferencia) return;

        const modalHTML = `
            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                                Detalles de Transferencia #${transferencia.id}
                            </h3>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Producto</label>
                                    <p class="text-sm text-gray-900">${transferencia.producto_descripcion}</p>
                                    <p class="text-xs text-gray-500">${transferencia.codigo_variante} - ${transferencia.variante_medida}</p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Origen</label>
                                        <p class="text-sm text-gray-900">${transferencia.ubicacion_origen}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Destino</label>
                                        <p class="text-sm text-gray-900">${transferencia.ubicacion_destino}</p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Cantidad</label>
                                    <p class="text-sm text-gray-900">${transferencia.cantidad}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Estado</label>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getEstadoColor(transferencia.estado)}">
                                        ${transferencia.estado}
                                    </span>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Motivo</label>
                                    <p class="text-sm text-gray-900">${transferencia.motivo || 'N/A'}</p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Creada</label>
                                        <p class="text-sm text-gray-900">${this.formatDate(transferencia.fecha_creacion)}</p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Usuario</label>
                                        <p class="text-sm text-gray-900">${transferencia.usuario_nombre || transferencia.usuario}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button onclick="this.closest('.fixed').remove()" 
                                    class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showMessage(message, type = 'info') {
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else if (type === 'success') {
            alert(`Éxito: ${message}`);
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
                        <h1 class="text-xl font-semibold text-gray-900">Transferencias</h1>
                        <p class="mt-2 text-sm text-gray-700">
                            Gestiona las transferencias de productos entre ubicaciones.
                        </p>
                    </div>
                    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
                        <button id="refresh-transferencias" type="button" 
                                class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <i class="fas fa-sync-alt -ml-1 mr-2 h-4 w-4"></i>
                            Actualizar
                        </button>
                        <button id="add-transferencia" type="button" 
                                class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <i class="fas fa-plus -ml-1 mr-2 h-4 w-4"></i>
                            Nueva Transferencia
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-shipping-fast text-blue-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Total Transferencias</dt>
                                        <dd id="total-transferencias" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-clock text-yellow-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Pendientes</dt>
                                        <dd id="transferencias-pendientes" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="p-5">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-check text-green-400 text-xl"></i>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Completadas</dt>
                                        <dd id="transferencias-completadas" class="text-lg font-medium text-gray-900">0</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="mt-6 bg-white shadow rounded-lg p-6">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label for="search-transferencias" class="block text-sm font-medium text-gray-700">Buscar</label>
                            <div class="mt-1 relative">
                                <input type="text" id="search-transferencias" 
                                       placeholder="Buscar transferencias..." 
                                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-search text-gray-400"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label for="filter-estado" class="block text-sm font-medium text-gray-700">Estado</label>
                            <select id="filter-estado" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="en_transito">En Tránsito</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>

                        <div>
                            <label for="filter-ubicacion-origen" class="block text-sm font-medium text-gray-700">Ubicación Origen</label>
                            <select id="filter-ubicacion-origen" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <option value="">Todas las ubicaciones</option>
                            </select>
                        </div>

                        <div>
                            <label for="filter-ubicacion-destino" class="block text-sm font-medium text-gray-700">Ubicación Destino</label>
                            <select id="filter-ubicacion-destino" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                                <option value="">Todas las ubicaciones</option>
                            </select>
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
                                        ID / Fecha
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cantidad
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Origen
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destino
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" class="relative px-6 py-3">
                                        <span class="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="transferencias-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Contenido de la tabla se carga aquí -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div id="transferencias-pagination">
                        <!-- Paginación se carga aquí -->
                    </div>
                </div>
            </div>
        `;
    }
};