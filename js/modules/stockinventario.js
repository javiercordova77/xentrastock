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
            itemsPerPage: 20,
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
                fetch('http://localhost:3001/api/stockinventario').then(r => r.json()),
                fetch('http://localhost:3001/api/categorias').then(r => r.json()),
                fetch('http://localhost:3001/api/ubicaciones').then(r => r.json()),
                fetch('http://localhost:3001/api/proveedores').then(r => r.json())
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
                (item.producto_descripcion || '').toLowerCase().includes(search) ||
                (item.codigo_variante || '').toLowerCase().includes(search) ||
                (item.medida || '').toLowerCase().includes(search) ||
                (item.categoria_nombre || '').toLowerCase().includes(search) ||
                (item.proveedor_nombre || '').toLowerCase().includes(search) ||
                (item.material || '').toLowerCase().includes(search)
            );
        }

        // Category filter
        if (this.data.filters.category) {
            filtered = filtered.filter(item => item.categoria_nombre === this.data.categories.find(c => c.id == this.data.filters.category)?.nombre);
        }

        // Location filter - buscar en todas las ubicaciones del item
        if (this.data.filters.location) {
            const locationName = this.data.locations.find(l => l.id == this.data.filters.location)?.nombre;
            filtered = filtered.filter(item => 
                item.ubicaciones && item.ubicaciones.some(u => u.ubicacion_nombre === locationName)
            );
        }

        // Provider filter
        if (this.data.filters.provider) {
            filtered = filtered.filter(item => item.proveedor_nombre === this.data.providers.find(p => p.id == this.data.filters.provider)?.nombre);
        }

        // Low stock filter
        if (this.data.filters.lowStock) {
            filtered = filtered.filter(item => (item.stock_total || 0) < 10);
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
            tbody.innerHTML = pageItems.map(item => {
                const stockStatus = (item.stock_total || 0) < 10 ? 'text-red-600' : 'text-gray-900';
                const stockIcon = (item.stock_total || 0) < 10 ? '<i class="fas fa-exclamation-triangle text-red-500 ml-1 text-xs"></i>' : '';
                const totalValue = (item.stock_total || 0) * (item.precio_venta || 0);
                
                // Mostrar las ubicaciones donde tiene stock
                const ubicacionesTexto = item.ubicaciones && item.ubicaciones.length > 0 
                    ? item.ubicaciones.map(u => `${u.ubicacion_nombre} (${u.stock_disponible})`).join(', ')
                    : 'Sin ubicaciones';
                    
                return `
                <tr class="hover:bg-gray-50 border-b border-gray-100">
                    <td class="px-6 py-4">
                        <input type="checkbox" 
                               class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               value="${item.variante_id}"
                               onchange="stockInventarioModule.toggleItemSelection('${item.variante_id}', this.checked)">
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                <i class="fas fa-box text-gray-400"></i>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900">${item.producto_descripcion || 'Sin nombre'}</p>
                                <div class="text-sm text-gray-500">${item.codigo_variante || 'Sin código'} - ${item.medida || 'Sin medida'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${item.categoria_nombre || 'Sin categoría'}</td>
                    <td class="px-6 py-4 text-sm text-gray-900" title="${ubicacionesTexto}">
                        ${item.ubicaciones && item.ubicaciones.length > 0 
                            ? `${item.ubicaciones.length} ubicación${item.ubicaciones.length > 1 ? 'es' : ''}` 
                            : 'Sin stock'}
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-lg font-semibold ${stockStatus}">
                            ${item.stock_total || 0} u.
                        </span>
                        ${stockIcon}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${window.utils.formatCurrency(item.precio_venta || 0)}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">
                        ${window.utils.formatCurrency(totalValue)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-center">
                            <button onclick="stockInventarioModule.viewStockDetail('${item.variante_id}')" 
                                    class="text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50" title="Ver stock por ubicación">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
            }).join('');
        }

        this.updatePagination();
        this.updateBulkActions();
    },

    updatePagination() {
        const paginationContainer = document.getElementById('pagination-container');
        const paginationInfoTop = document.getElementById('pagination-info-top');
        const pageInfoTop = document.getElementById('page-info-top');
        const navigationControlsTop = document.getElementById('navigation-controls-top');
        
        const { currentPage, totalPages, totalItems, itemsPerPage } = this.data.pagination;
        
        // Actualizar información en la parte superior
        if (paginationInfoTop) {
            if (totalItems === 0) {
                paginationInfoTop.textContent = 'Mostrando 0 de 0 registros';
            } else {
                const startItem = (currentPage - 1) * itemsPerPage + 1;
                const endItem = Math.min(currentPage * itemsPerPage, totalItems);
                paginationInfoTop.textContent = `Mostrando ${startItem} a ${endItem} de ${totalItems} registros`;
            }
        }
        
        // Actualizar información de página en la parte superior (siempre visible)
        if (pageInfoTop) {
            pageInfoTop.textContent = totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : 'Página 0 de 0';
        }
        
        // Mostrar siempre los controles de navegación (consistente con otros módulos)
        const paginationNavigationContainer = document.getElementById('pagination-navigation-container');
        const firstBtnTop = document.getElementById('btn-first-page-top');
        const prevBtnTop = document.getElementById('btn-prev-page-top');
        const nextBtnTop = document.getElementById('btn-next-page-top');
        const lastBtnTop = document.getElementById('btn-last-page-top');
        
        if (paginationNavigationContainer) {
            paginationNavigationContainer.style.display = 'flex';
            
            // Siempre mostrar botones pero con estados apropiados
            if (firstBtnTop) {
                firstBtnTop.style.display = 'inline-block';
                firstBtnTop.disabled = currentPage === 1 || totalPages <= 1;
            }
            if (prevBtnTop) {
                prevBtnTop.style.display = 'inline-block';
                prevBtnTop.disabled = currentPage === 1 || totalPages <= 1;
            }
            if (nextBtnTop) {
                nextBtnTop.style.display = 'inline-block';
                nextBtnTop.disabled = currentPage === totalPages || totalPages <= 1;
            }
            if (lastBtnTop) {
                lastBtnTop.style.display = 'inline-block';
                lastBtnTop.disabled = currentPage === totalPages || totalPages <= 1;
            }
        }
        
        // Limpiar la paginación inferior (ya no es necesaria)
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
    },

    updateSummary() {
        const totalItems = document.getElementById('total-items');
        const totalValue = document.getElementById('total-value');
        const lowStockCount = document.getElementById('low-stock-summary');

        if (totalItems) {
            totalItems.textContent = this.data.filteredItems.length;
        }

        if (totalValue) {
            const value = this.data.filteredItems.reduce((sum, item) => 
                sum + ((item.stock_total || 0) * (item.precio_venta || 0)), 0
            );
            totalValue.textContent = window.utils.formatCurrency(value);
        }

        if (lowStockCount) {
            const lowStock = this.data.filteredItems.filter(item => (item.stock_total || 0) < 10).length;
            lowStockCount.textContent = lowStock;
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

    changeItemsPerPage(newSize) {
        this.data.pagination.itemsPerPage = parseInt(newSize);
        this.data.pagination.currentPage = 1;
        this.data.pagination.totalPages = Math.ceil(this.data.pagination.totalItems / this.data.pagination.itemsPerPage);
        this.updateTable();
    },

    goToPrevPage() {
        if (this.data.pagination.currentPage > 1) {
            this.goToPage(this.data.pagination.currentPage - 1);
        }
    },

    goToNextPage() {
        if (this.data.pagination.currentPage < this.data.pagination.totalPages) {
            this.goToPage(this.data.pagination.currentPage + 1);
        }
    },

    goToLastPage() {
        this.goToPage(this.data.pagination.totalPages);
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

    // Método para ver detalle de stock por ubicación
    viewStockDetail(varianteId) {
        // Buscar el item en los datos actuales
        const item = this.data.filteredItems.find(i => i.variante_id == varianteId) || 
                     this.data.items.find(i => i.variante_id == varianteId);
        
        if (!item) {
            window.app.showToast('error', 'Error', 'No se encontró la variante');
            return;
        }
        
        // Llenar información de la variante
        const variantInfo = document.getElementById('variant-info');
        if (variantInfo) {
            variantInfo.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold text-gray-900">${item.producto_descripcion}</h4>
                        <p class="text-sm text-gray-600">Código: ${item.codigo_variante}</p>
                        <p class="text-sm text-gray-600">Medida: ${item.medida}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-lg font-bold text-gray-900">Stock Total: ${item.stock_total || 0} u.</p>
                        <p class="text-sm text-gray-600">Precio: ${window.utils.formatCurrency(item.precio_venta || 0)}</p>
                        <p class="text-sm font-medium text-gray-900">Valor Total: ${window.utils.formatCurrency((item.stock_total || 0) * (item.precio_venta || 0))}</p>
                    </div>
                </div>
            `;
        }
        
        // Llenar tabla de ubicaciones
        const tbody = document.getElementById('stock-detail-tbody');
        if (tbody) {
            if (item.ubicaciones && item.ubicaciones.length > 0) {
                tbody.innerHTML = item.ubicaciones.map(ubicacion => {
                    const estadoClass = ubicacion.estado_stock === 'bajo' ? 'text-red-600' : 
                                       ubicacion.estado_stock === 'agotado' ? 'text-gray-400' : 'text-green-600';
                    const estadoTexto = ubicacion.estado_stock === 'bajo' ? 'Stock Bajo' : 
                                       ubicacion.estado_stock === 'agotado' ? 'Agotado' : 'Normal';
                    const estadoIcon = ubicacion.estado_stock === 'bajo' ? 'fas fa-exclamation-triangle' : 
                                      ubicacion.estado_stock === 'agotado' ? 'fas fa-times-circle' : 'fas fa-check-circle';
                    
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                                    <span class="text-sm font-medium text-gray-900">${ubicacion.ubicacion_nombre}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    ${ubicacion.ubicacion_tipo}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="text-lg font-semibold ${ubicacion.stock_disponible < ubicacion.stock_minimo ? 'text-red-600' : 'text-gray-900'}">
                                    ${ubicacion.stock_disponible} u.
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${ubicacion.stock_minimo} u.
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${estadoClass.replace('text-', 'bg-').replace('600', '100')} ${estadoClass}">
                                    <i class="${estadoIcon} mr-1"></i>
                                    ${estadoTexto}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                            <i class="fas fa-inbox text-3xl mb-2 text-gray-300"></i>
                            <p>Esta variante no tiene stock en ninguna ubicación</p>
                        </td>
                    </tr>
                `;
            }
        }
        
        // Mostrar el modal
        const modal = document.getElementById('stock-detail-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    closeStockDetailModal() {
        const modal = document.getElementById('stock-detail-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
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
                    <!-- Controles izquierdos -->
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center space-x-2 text-sm">
                            <span class="text-gray-700">Mostrar:</span>
                            <select id="items-per-page" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span class="text-gray-700">por página</span>
                        </label>
                        <span class="text-sm text-gray-700" id="pagination-info-top">
                            Mostrando 0 de 0 registros
                        </span>
                    </div>
                    
                    <!-- Controles derechos -->
                    <div class="flex items-center space-x-1" id="pagination-navigation-container">
                        <button id="btn-first-page-top" onclick="stockInventarioModule.goToPage(1)" 
                                class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button id="btn-prev-page-top" onclick="stockInventarioModule.goToPrevPage()" 
                                class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-angle-left"></i>
                        </button>
                        <span class="text-sm text-gray-700 mx-3" id="page-info-top">
                            Página 1 de 1
                        </span>
                        <button id="btn-next-page-top" onclick="stockInventarioModule.goToNextPage()" 
                                class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-angle-right"></i>
                        </button>
                        <button id="btn-last-page-top" onclick="stockInventarioModule.goToLastPage()" 
                                class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
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
                                        <span>Producto / Variante</span>
                                        <i class="fas fa-sort text-gray-400"></i>
                                    </div>
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

            <!-- Modal para ver stock por ubicación -->
            <div id="stock-detail-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900" id="modal-title">Detalle de Stock por Ubicación</h3>
                        <button onclick="stockInventarioModule.closeStockDetailModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Información de la variante -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-4" id="variant-info">
                        <!-- Se llenará dinámicamente -->
                    </div>
                    
                    <!-- Tabla de ubicaciones -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Disponible</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mínimo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="stock-detail-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Se llenará dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-6 flex justify-end">
                        <button onclick="stockInventarioModule.closeStockDetailModal()" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};