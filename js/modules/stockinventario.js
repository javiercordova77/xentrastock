// Módulo Stock Inventario
window.stockInventarioModule = {
    data: {
        items: [],
        filteredItems: [],
        filters: {
            search: '',
            category: '',
            location: '',
            provider: '',
            lowStock: false
        },
        pagination: {
            currentPage: 1,
            itemsPerPage: 25,
            totalItems: 0,
            totalPages: 0
        },
        categories: [],
        locations: [],
        providers: [],
        selectedItems: [],
        bulkActions: false,
        sortConfig: {
            key: 'nombre',
            direction: 'asc'
        }
    },

    async load() {
        const container = document.getElementById('inventario-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadData();
        this.setupEventListeners();
        this.updateTable();
    },

    async loadData() {
        try {
            // Cargar datos en paralelo
            const [inventory, categories, locations, providers] = await Promise.all([
                window.app.apiRequest('/api/inventario'),
                window.app.apiRequest('/api/categorias'),
                window.app.apiRequest('/api/ubicaciones'),
                window.app.apiRequest('/api/proveedores')
            ]);

            this.data.items = inventory?.data || [];
            this.data.filteredItems = [...this.data.items];
            this.data.categories = categories?.data || [];
            this.data.locations = locations?.data || [];
            this.data.providers = providers?.data || [];
            
            this.updateFilterOptions();
            this.applyFilters();
            
        } catch (error) {
            console.error('Error cargando datos del inventario:', error);
            window.app.showToast('error', 'Error', 'No se pudieron cargar los datos del inventario');
        }
    },

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', window.utils.debounce((e) => {
                this.data.filters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Filter selects
        ['category-filter', 'location-filter', 'provider-filter'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', (e) => {
                    const filterKey = id.replace('-filter', '').replace('category', 'categoria');
                    this.data.filters[filterKey === 'categoria' ? 'category' : filterKey] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Low stock filter
        const lowStockFilter = document.getElementById('low-stock-filter');
        if (lowStockFilter) {
            lowStockFilter.addEventListener('change', (e) => {
                this.data.filters.lowStock = e.target.checked;
                this.applyFilters();
            });
        }

        // Items per page
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.data.pagination.itemsPerPage = parseInt(e.target.value);
                this.data.pagination.currentPage = 1;
                this.updateTable();
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Bulk actions
        const bulkActionsSelect = document.getElementById('bulk-actions');
        if (bulkActionsSelect) {
            bulkActionsSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.executeBulkAction(e.target.value);
                    e.target.value = '';
                }
            });
        }
    },

    updateFilterOptions() {
        // Update category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="">Todas las categorías</option>
                ${this.data.categories.map(cat => 
                    `<option value="${cat.id}">${cat.nombre}</option>`
                ).join('')}
            `;
        }

        // Update location filter
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.innerHTML = `
                <option value="">Todas las ubicaciones</option>
                ${this.data.locations.map(loc => 
                    `<option value="${loc.id}">${loc.nombre}</option>`
                ).join('')}
            `;
        }

        // Update provider filter
        const providerFilter = document.getElementById('provider-filter');
        if (providerFilter) {
            providerFilter.innerHTML = `
                <option value="">Todos los proveedores</option>
                ${this.data.providers.map(prov => 
                    `<option value="${prov.id}">${prov.nombre}</option>`
                ).join('')}
            `;
        }
    },

    applyFilters() {
        let filtered = [...this.data.items];

        // Text search
        if (this.data.filters.search) {
            const search = this.data.filters.search.toLowerCase();
            filtered = filtered.filter(item => 
                (item.nombre || '').toLowerCase().includes(search) ||
                (item.codigo || '').toLowerCase().includes(search) ||
                (item.variante || '').toLowerCase().includes(search) ||
                (item.categoria || '').toLowerCase().includes(search) ||
                (item.proveedor || '').toLowerCase().includes(search)
            );
        }

        // Category filter
        if (this.data.filters.category) {
            filtered = filtered.filter(item => item.categoria_id == this.data.filters.category);
        }

        // Location filter
        if (this.data.filters.location) {
            filtered = filtered.filter(item => item.ubicacion_id == this.data.filters.location);
        }

        // Provider filter
        if (this.data.filters.provider) {
            filtered = filtered.filter(item => item.proveedor_id == this.data.filters.provider);
        }

        // Low stock filter
        if (this.data.filters.lowStock) {
            filtered = filtered.filter(item => (item.cantidad || 0) < 10);
        }

        this.data.filteredItems = filtered;
        this.data.pagination.totalItems = filtered.length;
        this.data.pagination.totalPages = Math.ceil(filtered.length / this.data.pagination.itemsPerPage);
        this.data.pagination.currentPage = 1;
        
        this.updateTable();
        this.updateSummary();
    },

    sortBy(key) {
        if (this.data.sortConfig.key === key) {
            this.data.sortConfig.direction = this.data.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.data.sortConfig.key = key;
            this.data.sortConfig.direction = 'asc';
        }

        this.data.filteredItems.sort((a, b) => {
            let aVal = a[key] || '';
            let bVal = b[key] || '';

            // Handle numbers
            if (!isNaN(aVal) && !isNaN(bVal)) {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }

            if (aVal < bVal) return this.data.sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.data.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateTable();
    },

    updateTable() {
        const startIndex = (this.data.pagination.currentPage - 1) * this.data.pagination.itemsPerPage;
        const endIndex = startIndex + this.data.pagination.itemsPerPage;
        const pageItems = this.data.filteredItems.slice(startIndex, endIndex);

        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        if (pageItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
                        <p class="text-lg font-medium">No se encontraron resultados</p>
                        <p class="text-sm">Intenta modificar los filtros de búsqueda</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pageItems.map(item => `
                <tr class="hover:bg-gray-50 border-b border-gray-100">
                    <td class="px-6 py-4">
                        <input type="checkbox" 
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               value="${item.id}"
                               onchange="stockInventarioModule.toggleItemSelection('${item.id}', this.checked)">
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <i class="fas fa-box text-gray-400"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">${item.nombre || 'Sin nombre'}</p>
                                <p class="text-sm text-gray-500">${item.codigo || 'Sin código'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            ${item.variante || 'Sin variante'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${item.categoria || 'Sin categoría'}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${item.ubicacion || 'Sin ubicación'}</td>
                    <td class="px-6 py-4">
                        <span class="text-lg font-semibold ${(item.cantidad || 0) < 10 ? 'text-red-600' : 'text-gray-900'}">
                            ${window.utils.formatNumber(item.cantidad || 0)}
                        </span>
                        ${(item.cantidad || 0) < 10 ? '<i class="fas fa-exclamation-triangle text-red-500 ml-1 text-xs"></i>' : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${window.utils.formatCurrency(item.precio || 0)}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        ${window.utils.formatCurrency((item.cantidad || 0) * (item.precio || 0))}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="stockInventarioModule.editItem('${item.id}')" 
                                    class="text-blue-600 hover:text-blue-700 p-1 rounded">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="stockInventarioModule.viewMovements('${item.id}')" 
                                    class="text-green-600 hover:text-green-700 p-1 rounded">
                                <i class="fas fa-history"></i>
                            </button>
                            <button onclick="stockInventarioModule.adjustStock('${item.id}')" 
                                    class="text-yellow-600 hover:text-yellow-700 p-1 rounded">
                                <i class="fas fa-adjust"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        this.updatePagination();
        this.updateBulkActions();
    },

    updatePagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        const { currentPage, totalPages } = this.data.pagination;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        const pages = [];

        // Previous button
        pages.push(`
            <button onclick="stockInventarioModule.goToPage(${currentPage - 1})"
                    class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}"
                    ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `);

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button onclick="stockInventarioModule.goToPage(${i})"
                        class="relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                            i === currentPage 
                                ? 'bg-blue-50 border-blue-500 text-blue-600 z-10' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }">
                    ${i}
                </button>
            `);
        }

        // Next button
        pages.push(`
            <button onclick="stockInventarioModule.goToPage(${currentPage + 1})"
                    class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `);

        paginationContainer.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700">
                        Mostrando ${(currentPage - 1) * this.data.pagination.itemsPerPage + 1} a 
                        ${Math.min(currentPage * this.data.pagination.itemsPerPage, this.data.pagination.totalItems)} de 
                        ${this.data.pagination.totalItems} resultados
                    </span>
                </div>
                <div class="flex">${pages.join('')}</div>
            </div>
        `;
    },

    updateSummary() {
        const totalItems = document.getElementById('total-items');
        const totalValue = document.getElementById('total-value');
        const lowStockCount = document.getElementById('low-stock-summary');

        if (totalItems) {
            totalItems.textContent = window.utils.formatNumber(this.data.filteredItems.length);
        }

        if (totalValue) {
            const value = this.data.filteredItems.reduce((sum, item) => 
                sum + ((item.cantidad || 0) * (item.precio || 0)), 0
            );
            totalValue.textContent = window.utils.formatCurrency(value);
        }

        if (lowStockCount) {
            const lowStock = this.data.filteredItems.filter(item => (item.cantidad || 0) < 10).length;
            lowStockCount.textContent = window.utils.formatNumber(lowStock);
        }
    },

    updateBulkActions() {
        const selectedCount = this.data.selectedItems.length;
        const bulkActionsContainer = document.getElementById('bulk-actions-container');
        
        if (bulkActionsContainer) {
            if (selectedCount > 0) {
                bulkActionsContainer.classList.remove('hidden');
                document.getElementById('selected-count').textContent = selectedCount;
            } else {
                bulkActionsContainer.classList.add('hidden');
            }
        }
    },

    goToPage(page) {
        if (page >= 1 && page <= this.data.pagination.totalPages) {
            this.data.pagination.currentPage = page;
            this.updateTable();
        }
    },

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('#inventory-tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.toggleItemSelection(checkbox.value, checked);
        });
    },

    toggleItemSelection(itemId, checked) {
        if (checked) {
            if (!this.data.selectedItems.includes(itemId)) {
                this.data.selectedItems.push(itemId);
            }
        } else {
            this.data.selectedItems = this.data.selectedItems.filter(id => id !== itemId);
        }
        this.updateBulkActions();
    },

    async executeBulkAction(action) {
        if (this.data.selectedItems.length === 0) {
            window.app.showToast('warning', 'Advertencia', 'Selecciona al menos un elemento');
            return;
        }

        const confirmed = await this.confirmBulkAction(action);
        if (!confirmed) return;

        try {
            switch (action) {
                case 'export':
                    this.exportSelected();
                    break;
                case 'adjust-stock':
                    this.bulkAdjustStock();
                    break;
                case 'transfer':
                    this.bulkTransfer();
                    break;
                default:
                    console.warn('Acción no reconocida:', action);
            }
        } catch (error) {
            console.error('Error ejecutando acción masiva:', error);
            window.app.showToast('error', 'Error', 'No se pudo ejecutar la acción');
        }
    },

    async confirmBulkAction(action) {
        const actions = {
            'export': 'exportar los elementos seleccionados',
            'adjust-stock': 'ajustar el stock de los elementos seleccionados',
            'transfer': 'transferir los elementos seleccionados'
        };

        const message = actions[action] || 'ejecutar esta acción';
        return confirm(`¿Estás seguro de que quieres ${message}?`);
    },

    exportSelected() {
        const selectedItems = this.data.filteredItems.filter(item => 
            this.data.selectedItems.includes(item.id.toString())
        );

        // Create CSV content
        const headers = ['Código', 'Nombre', 'Variante', 'Categoría', 'Ubicación', 'Cantidad', 'Precio', 'Total'];
        const csvContent = [
            headers.join(','),
            ...selectedItems.map(item => [
                item.codigo || '',
                item.nombre || '',
                item.variante || '',
                item.categoria || '',
                item.ubicacion || '',
                item.cantidad || 0,
                item.precio || 0,
                (item.cantidad || 0) * (item.precio || 0)
            ].join(','))
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        window.app.showToast('success', 'Éxito', 'Inventario exportado correctamente');
        this.clearSelection();
    },

    clearSelection() {
        this.data.selectedItems = [];
        const selectAll = document.getElementById('select-all');
        if (selectAll) selectAll.checked = false;
        
        const checkboxes = document.querySelectorAll('#inventory-tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        
        this.updateBulkActions();
    },

    // Placeholder methods for actions
    editItem(itemId) {
        window.app.showToast('info', 'Función en desarrollo', 'Próximamente disponible');
    },

    viewMovements(itemId) {
        window.app.showToast('info', 'Función en desarrollo', 'Próximamente disponible');
    },

    adjustStock(itemId) {
        window.app.showToast('info', 'Función en desarrollo', 'Próximamente disponible');
    },

    bulkAdjustStock() {
        window.app.showToast('info', 'Función en desarrollo', 'Próximamente disponible');
    },

    bulkTransfer() {
        window.app.showToast('info', 'Función en desarrollo', 'Próximamente disponible');
    },

    getTemplate() {
        return `
            <!-- Header Actions -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <!-- Search and Filters -->
                    <div class="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                        <!-- Search -->
                        <div class="relative">
                            <input type="text" 
                                   id="inventory-search"
                                   placeholder="Buscar productos..."
                                   class="w-full lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>

                        <!-- Filters -->
                        <div class="flex flex-wrap gap-2">
                            <select id="category-filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las categorías</option>
                            </select>
                            <select id="location-filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las ubicaciones</option>
                            </select>
                            <select id="provider-filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los proveedores</option>
                            </select>
                        </div>

                        <!-- Low Stock Filter -->
                        <label class="flex items-center space-x-2 text-sm">
                            <input type="checkbox" id="low-stock-filter" class="rounded border-gray-300 text-red-600 focus:ring-red-500">
                            <span class="text-gray-700">Solo stock bajo</span>
                        </label>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-3">
                        <button class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-download mr-2"></i>
                            Exportar
                        </button>
                        <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-plus mr-2"></i>
                            Ajustar Stock
                        </button>
                    </div>
                </div>

                <!-- Summary Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-gray-900" id="total-items">0</p>
                        <p class="text-sm text-gray-600">Total Productos</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600" id="total-value">$0</p>
                        <p class="text-sm text-gray-600">Valor Total</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-red-600" id="low-stock-summary">0</p>
                        <p class="text-sm text-gray-600">Stock Bajo</p>
                    </div>
                </div>
            </div>

            <!-- Bulk Actions Bar -->
            <div id="bulk-actions-container" class="hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <span class="text-sm font-medium text-blue-900">
                            <span id="selected-count">0</span> elementos seleccionados
                        </span>
                        <button onclick="stockInventarioModule.clearSelection()" 
                                class="text-sm text-blue-600 hover:text-blue-700">
                            Deseleccionar todo
                        </button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <select id="bulk-actions" class="border border-blue-300 rounded px-3 py-1 text-sm bg-white">
                            <option value="">Acciones masivas</option>
                            <option value="export">Exportar seleccionados</option>
                            <option value="adjust-stock">Ajustar stock</option>
                            <option value="transfer">Transferir</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Inventory Table -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <!-- Table Controls -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center space-x-2 text-sm">
                            <span class="text-gray-700">Mostrar:</span>
                            <select id="items-per-page" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span class="text-gray-700">por página</span>
                        </label>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left">
                                    <input type="checkbox" id="select-all" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onclick="stockInventarioModule.sortBy('nombre')">
                                    <div class="flex items-center space-x-1">
                                        <span>Producto</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variante
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onclick="stockInventarioModule.sortBy('categoria')">
                                    <div class="flex items-center space-x-1">
                                        <span>Categoría</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onclick="stockInventarioModule.sortBy('ubicacion')">
                                    <div class="flex items-center space-x-1">
                                        <span>Ubicación</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onclick="stockInventarioModule.sortBy('cantidad')">
                                    <div class="flex items-center space-x-1">
                                        <span>Stock</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onclick="stockInventarioModule.sortBy('precio')">
                                    <div class="flex items-center space-x-1">
                                        <span>Precio</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="inventory-tbody" class="bg-white divide-y divide-gray-200">
                            <!-- Table content will be populated here -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="bg-white px-4 py-3 border-t border-gray-200" id="pagination-container">
                    <!-- Pagination will be populated here -->
                </div>
            </div>
        `;
    }
};