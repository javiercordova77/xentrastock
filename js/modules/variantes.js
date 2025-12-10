// Módulo Variantes
window.variantesModule = {
    data: {
        variants: [],
        filteredVariants: [],
        products: [],
        searchTerm: '',
        editingVariant: null,
        // Propiedades de paginación
        pagination: {
            currentPage: 1,
            itemsPerPage: 20,
            totalItems: 0,
            totalPages: 0
        }
    },

    async load() {
        const container = document.getElementById('variantes-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadVariants();
        await this.loadProducts();
        this.attachEventListeners();
    },

    async loadVariants() {
        try {
            const response = await window.app.apiRequest('/api/variantes');
            if (response.success) {
                this.data.variants = response.data;
                this.data.filteredVariants = [...this.data.variants];
                
                // Actualizar información de paginación
                this.data.pagination.totalItems = this.data.filteredVariants.length;
                this.data.pagination.totalPages = Math.ceil(this.data.filteredVariants.length / this.data.pagination.itemsPerPage);
                this.data.pagination.currentPage = 1;
                
                this.renderTable();
                this.updatePaginationInfo();
            }
        } catch (error) {
            console.error('Error loading variants:', error);
            window.app.showToast('error', 'Error', 'Error al cargar las variantes');
        }
    },

    async loadProducts() {
        try {
            const response = await window.app.apiRequest('/api/productos');
            if (response.success) {
                this.data.products = response.data;
                this.updateProductSelect();
            }
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    updateProductSelect() {
        // Ya no necesitamos este método con el nuevo sistema de búsqueda
        // Pero lo mantenemos para compatibilidad
    },

    setupProductSearch() {
        const searchInput = document.getElementById('variant-producto-search');
        const dropdown = document.getElementById('variant-producto-dropdown');
        const hiddenInput = document.getElementById('variant-producto');

        if (!searchInput || !dropdown) return;

        // Mostrar todos los productos al hacer foco
        searchInput.addEventListener('focus', () => {
            this.showProductDropdown('');
        });

        // Filtrar productos mientras se escribe
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            this.showProductDropdown(searchTerm);
        });

        // Ocultar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
            
            // Cerrar modal de detalles al hacer clic fuera
            const modal = document.getElementById('modal-detalle-variante');
            if (modal && e.target === modal) {
                this.cerrarModalDetalle();
            }
        });
    },



    showProductDropdown(searchTerm = '') {
        const dropdown = document.getElementById('variant-producto-dropdown');
        if (!dropdown) return;

        const filteredProducts = this.data.products
            .filter(prod => prod.activo && 
                (searchTerm === '' || prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase())))
            .slice(0, 10); // Limitar a 10 resultados para mejor rendimiento

        if (filteredProducts.length === 0) {
            dropdown.innerHTML = `
                <div class="px-3 py-2 text-gray-500 text-sm">
                    ${searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </div>
            `;
        } else {
            dropdown.innerHTML = filteredProducts
                .map(prod => `
                    <div class="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                         onclick="variantesModule.selectProduct(${prod.id}, '${prod.descripcion.replace(/'/g, '\\\'')}')" >
                        <div class="font-medium text-gray-900">${prod.descripcion}</div>
                        <div class="text-xs text-gray-500">
                            ID: ${prod.id} • ${prod.categoria_nombre || 'Sin categoría'}
                        </div>
                    </div>
                `).join('');
        }

        dropdown.classList.remove('hidden');
    },

    selectProduct(productId, productName) {
        const searchInput = document.getElementById('variant-producto-search');
        const hiddenInput = document.getElementById('variant-producto');
        const dropdown = document.getElementById('variant-producto-dropdown');

        if (searchInput && hiddenInput && dropdown) {
            searchInput.value = productName;
            hiddenInput.value = productId;
            dropdown.classList.add('hidden');
            
            // Validar que el producto se seleccionó
            searchInput.classList.remove('border-red-300');
            searchInput.classList.add('border-green-300');
        }
    },

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('variant-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.searchTerm = e.target.value;
                this.filterVariants();
            });
        }

        // New variant button
        const newVariantBtn = document.getElementById('new-variant-btn');
        if (newVariantBtn) {
            newVariantBtn.addEventListener('click', () => this.openModal());
        }

        // Pagination event listeners
        const itemsPerPageSelect = document.getElementById('items-per-page-select');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.changeItemsPerPage(e.target.value);
            });
        }

        // Navigation buttons
        const firstBtn = document.getElementById('btn-first-page');
        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        const lastBtn = document.getElementById('btn-last-page');

        if (firstBtn) firstBtn.addEventListener('click', () => this.goToFirstPage());
        if (prevBtn) prevBtn.addEventListener('click', () => this.goToPrevPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.goToNextPage());
        if (lastBtn) lastBtn.addEventListener('click', () => this.goToLastPage());
    },

    filterVariants() {
        if (!this.data.searchTerm) {
            this.data.filteredVariants = [...this.data.variants];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredVariants = this.data.variants.filter(variant => 
                variant.codigo_variante?.toLowerCase().includes(term) ||
                variant.medida?.toLowerCase().includes(term) ||
                variant.producto_nombre?.toLowerCase().includes(term)
            );
        }
        
        // Actualizar información de paginación
        this.data.pagination.totalItems = this.data.filteredVariants.length;
        this.data.pagination.totalPages = Math.ceil(this.data.filteredVariants.length / this.data.pagination.itemsPerPage);
        this.data.pagination.currentPage = 1; // Resetear a primera página al filtrar
        
        this.renderTable();
        this.updatePaginationInfo();
    },

    renderTable() {
        const tbody = document.getElementById('variants-tbody');
        if (!tbody) return;

        if (this.data.filteredVariants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        ${this.data.searchTerm ? 'No se encontraron variantes' : 'No hay variantes registradas'}
                    </td>
                </tr>
            `;
            return;
        }

        // Calcular elementos para la página actual
        const startIndex = (this.data.pagination.currentPage - 1) * this.data.pagination.itemsPerPage;
        const endIndex = startIndex + this.data.pagination.itemsPerPage;
        const paginatedVariants = this.data.filteredVariants.slice(startIndex, endIndex);

        tbody.innerHTML = paginatedVariants.map(variant => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-palette text-purple-600"></i>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">${variant.codigo_variante || 'Sin código'}</p>
                            <p class="text-sm text-gray-500">${variant.medida || 'Sin medida'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${variant.producto_nombre || 'Sin producto'}</td>
                <td class="px-6 py-4 text-sm text-gray-900">$${variant.precio_venta || '0.00'}</td>
                <td class="px-6 py-4 text-sm text-gray-900">$${variant.precio_compra || '0.00'}</td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${variant.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${variant.fecha_ingreso ? new Date(variant.fecha_ingreso).toLocaleDateString() : 'N/A'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="variantesModule.editVariant(${variant.id})" 
                                class="text-blue-600 hover:text-blue-700 p-1 rounded">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="variantesModule.viewVariant(${variant.id})" 
                                class="text-green-600 hover:text-green-700 p-1 rounded">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="variantesModule.deleteVariant(${variant.id})" 
                                class="text-red-600 hover:text-red-700 p-1 rounded">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    openModal(variant = null) {
        this.data.editingVariant = variant;
        const modal = document.getElementById('variant-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Configurar el sistema de búsqueda de productos
            setTimeout(() => {
                this.setupProductSearch();
            }, 100);
            
            // Fill form if editing
            if (variant) {
                document.getElementById('variant-codigo').value = variant.codigo_variante || '';
                
                // Para el producto en modo edición
                const productSearchInput = document.getElementById('variant-producto-search');
                const hiddenProductInput = document.getElementById('variant-producto');
                if (productSearchInput && hiddenProductInput && variant.id_producto) {
                    hiddenProductInput.value = variant.id_producto;
                    const product = this.data.products.find(p => p.id == variant.id_producto);
                    if (product) {
                        productSearchInput.value = product.descripcion;
                        productSearchInput.classList.add('border-green-300');
                    }
                }
                
                document.getElementById('variant-medida').value = variant.medida || '';
                document.getElementById('variant-precio-venta').value = variant.precio_venta || '';
                document.getElementById('variant-precio-compra').value = variant.precio_compra || '';
                document.getElementById('variant-activo').checked = variant.activo !== 0;
                document.getElementById('modal-title').textContent = 'Editar Variante';
            } else {
                document.getElementById('variant-form').reset();
                
                // Limpiar búsqueda de producto
                const productSearchInput = document.getElementById('variant-producto-search');
                const hiddenProductInput = document.getElementById('variant-producto');
                if (productSearchInput && hiddenProductInput) {
                    productSearchInput.value = '';
                    productSearchInput.classList.remove('border-green-300', 'border-red-300');
                    hiddenProductInput.value = '';
                }
                
                document.getElementById('variant-activo').checked = true; // Por defecto activo
                document.getElementById('modal-title').textContent = 'Nueva Variante';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('variant-modal');
        const dropdown = document.getElementById('variant-producto-dropdown');
        
        if (modal) {
            modal.classList.add('hidden');
            this.data.editingVariant = null;
        }
        
        // Ocultar dropdown si está visible
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
        
        // Limpiar estilos de validación
        const productSearchInput = document.getElementById('variant-producto-search');
        if (productSearchInput) {
            productSearchInput.classList.remove('border-green-300', 'border-red-300');
        }
    },

    async saveVariant() {
        const form = document.getElementById('variant-form');
        const hiddenProductInput = document.getElementById('variant-producto');
        const productSearchInput = document.getElementById('variant-producto-search');
        
        const variantData = {
            codigo_variante: document.getElementById('variant-codigo').value,
            id_producto: parseInt(hiddenProductInput.value),
            medida: document.getElementById('variant-medida').value,
            precio_venta: parseFloat(document.getElementById('variant-precio-venta').value) || 0,
            precio_compra: parseFloat(document.getElementById('variant-precio-compra').value) || 0,
            activo: document.getElementById('variant-activo').checked ? 1 : 0
        };

        // Validaciones
        if (!variantData.codigo_variante) {
            window.app.showToast('error', 'Error', 'Por favor ingresa el código de la variante');
            document.getElementById('variant-codigo').focus();
            return;
        }

        if (!variantData.id_producto || isNaN(variantData.id_producto)) {
            window.app.showToast('error', 'Error', 'Por favor selecciona un producto válido');
            productSearchInput.classList.add('border-red-300');
            productSearchInput.focus();
            return;
        }

        try {
            if (this.data.editingVariant) {
                const response = await window.app.apiRequest(`/api/variantes/${this.data.editingVariant.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variantData)
                });
                
                if (response.success) {
                    window.app.showToast('success', 'Éxito', 'Variante actualizada exitosamente');
                }
            } else {
                const response = await window.app.apiRequest('/api/variantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variantData)
                });
                
                if (response.success) {
                    window.app.showToast('success', 'Éxito', 'Variante creada exitosamente');
                }
            }

            this.closeModal();
            await this.loadVariants();
        } catch (error) {
            console.error('Error saving variant:', error);
            window.app.showToast('error', 'Error', 'Error al guardar la variante');
        }
    },

    async editVariant(id) {
        const variant = this.data.variants.find(v => v.id === id);
        if (variant) {
            this.openModal(variant);
        }
    },

    async viewVariant(id) {
        try {
            const variant = this.data.variants.find(v => v.id === id);
            
            if (!variant) {
                alert('No se encontró la variante solicitada');
                return;
            }

            // Formatear fecha
            const fecha = variant.fecha_ingreso ? 
                new Date(variant.fecha_ingreso).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : 'No especificada';

            // Formatear precios
            const precioVenta = variant.precio_venta ? `$${Number(variant.precio_venta).toLocaleString()}` : 'No especificado';
            const precioCompra = variant.precio_compra ? `$${Number(variant.precio_compra).toLocaleString()}` : 'No especificado';

            // Generar el HTML con los detalles
            const detalleHTML = `
                <div class="space-y-3">
                    <!-- Información básica en una fila -->
                    <div class="grid grid-cols-4 gap-3 text-sm">
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">ID</span>
                            <span class="font-semibold">${variant.id}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Código</span>
                            <span class="font-semibold">${variant.codigo_variante || 'Sin código'}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Medida</span>
                            <span class="font-semibold">${variant.medida || 'Sin medida'}</span>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <span class="text-xs text-gray-500 block">Estado</span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                variant.activo 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }">
                                ${variant.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>

                    <!-- Producto Asociado -->
                    <div class="bg-blue-50 p-3 rounded">
                        <span class="text-xs text-blue-600 block">Producto Asociado</span>
                        <span class="font-semibold text-blue-900">${variant.producto_nombre || 'Sin producto asignado'}</span>
                    </div>

                    <!-- Información de precios -->
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-green-50 p-3 rounded">
                            <span class="text-xs text-green-600 block">Precio de Venta</span>
                            <span class="font-semibold text-green-800">${precioVenta}</span>
                        </div>
                        <div class="bg-green-50 p-3 rounded">
                            <span class="text-xs text-green-600 block">Precio de Compra</span>
                            <span class="font-semibold text-green-800">${precioCompra}</span>
                        </div>
                    </div>

                    ${variant.descripcion ? `
                    <!-- Descripción adicional -->
                    <div class="bg-purple-50 p-3 rounded">
                        <span class="text-xs text-purple-600 block">Descripción</span>
                        <span class="text-purple-800">${variant.descripcion}</span>
                    </div>
                    ` : ''}

                    <!-- Fecha de ingreso al final -->
                    <div class="text-center text-xs text-gray-500 border-t pt-2">
                        <i class="fas fa-calendar mr-1"></i>
                        Fecha de Ingreso: ${fecha}
                    </div>
                </div>
            `;

            // Mostrar el contenido en el modal
            document.getElementById('detalle-variante-content').innerHTML = detalleHTML;
            
            // Mostrar el modal
            document.getElementById('modal-detalle-variante').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error al mostrar detalles de la variante:', error);
            alert('Error al cargar los detalles de la variante');
        }
    },

    cerrarModalDetalle() {
        document.getElementById('modal-detalle-variante').classList.add('hidden');
    },

    async deleteVariant(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta variante?')) {
            return;
        }

        try {
            const response = await window.app.apiRequest(`/api/variantes/${id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                window.app.showToast('success', 'Éxito', 'Variante eliminada exitosamente');
                await this.loadVariants();
            }
        } catch (error) {
            console.error('Error deleting variant:', error);
            window.app.showToast('error', 'Error', 'Error al eliminar la variante');
        }
    },

    // Métodos de paginación
    updatePaginationInfo() {
        const { currentPage, itemsPerPage, totalItems, totalPages } = this.data.pagination;
        
        // Actualizar selector de items per page
        const itemsPerPageSelect = document.getElementById('items-per-page-select');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = itemsPerPage.toString();
        }
        
        // Actualizar información de registros mostrados
        const paginationInfo = document.getElementById('pagination-info');
        if (paginationInfo && totalItems > 0) {
            const startItem = (currentPage - 1) * itemsPerPage + 1;
            const endItem = Math.min(currentPage * itemsPerPage, totalItems);
            paginationInfo.textContent = `Mostrando ${startItem} a ${endItem} de ${totalItems} registros`;
        } else if (paginationInfo) {
            paginationInfo.textContent = 'Mostrando 0 de 0 registros';
        }
        
        // Actualizar información de página
        const pageInfo = document.getElementById('page-info');
        if (pageInfo) {
            pageInfo.textContent = totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : 'Página 0 de 0';
        }
        
        // Actualizar botones de navegación
        this.updateNavigationButtons();
    },

    updateNavigationButtons() {
        const { currentPage, totalPages } = this.data.pagination;
        
        const firstBtn = document.getElementById('btn-first-page');
        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        const lastBtn = document.getElementById('btn-last-page');
        
        if (firstBtn) firstBtn.disabled = currentPage === 1;
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        if (lastBtn) lastBtn.disabled = currentPage === totalPages || totalPages === 0;
    },

    changeItemsPerPage(newSize) {
        this.data.pagination.itemsPerPage = parseInt(newSize);
        this.data.pagination.currentPage = 1;
        this.data.pagination.totalPages = Math.ceil(this.data.pagination.totalItems / this.data.pagination.itemsPerPage);
        this.renderTable();
        this.updatePaginationInfo();
    },

    goToPage(page) {
        const { totalPages } = this.data.pagination;
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        
        this.data.pagination.currentPage = page;
        this.renderTable();
        this.updatePaginationInfo();
    },

    goToFirstPage() {
        this.goToPage(1);
    },

    goToPrevPage() {
        this.goToPage(this.data.pagination.currentPage - 1);
    },

    goToNextPage() {
        this.goToPage(this.data.pagination.currentPage + 1);
    },

    goToLastPage() {
        this.goToPage(this.data.pagination.totalPages);
    },

    getTemplate() {
        return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">Variantes</h2>
                        <p class="text-sm text-gray-600 mt-1">Gestión de variantes de productos (códigos únicos, precios específicos)</p>
                    </div>
                    <button id="new-variant-btn" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                        <i class="fas fa-plus mr-2"></i>Nueva Variante
                    </button>
                </div>
            </div>

            <!-- Search -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                    <input type="text" id="variant-search" 
                           placeholder="Buscar variantes..." 
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>

            <!-- Controles de paginación -->
            <div class="bg-white px-6 py-3 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">Mostrar</span>
                        <select id="items-per-page-select" class="border border-gray-300 rounded px-2 py-1 text-sm">
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span class="text-sm text-gray-700">registros</span>
                        <span class="text-sm text-gray-700 ml-4" id="pagination-info">
                            Mostrando 0 de 0 registros
                        </span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <button id="btn-first-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button id="btn-prev-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <i class="fas fa-angle-left"></i>
                        </button>
                        <span class="text-sm text-gray-700 mx-3" id="page-info">Página 1 de 1</span>
                        <button id="btn-next-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <i class="fas fa-angle-right"></i>
                        </button>
                        <button id="btn-last-page" class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código/Medida
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio Venta
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio Compra
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Ingreso
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody id="variants-tbody" class="bg-white divide-y divide-gray-200">
                        <!-- Content will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="variant-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="modal-title" class="text-lg font-medium text-gray-900">Nueva Variante</h3>
                    <button onclick="variantesModule.closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="variant-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Código de Variante *</label>
                        <input type="text" name="codigo_variante" id="variant-codigo" required
                               placeholder="Ej: CH-IMP-135x190, LTX-SUP-160x200"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Producto *</label>
                        <div class="relative">
                            <input type="text" id="variant-producto-search" 
                                   placeholder="Buscar producto por nombre..."
                                   autocomplete="off"
                                   class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <i class="fas fa-search text-gray-400"></i>
                            </div>
                            <input type="hidden" name="id_producto" id="variant-producto" required>
                            
                            <!-- Dropdown con resultados de búsqueda -->
                            <div id="variant-producto-dropdown" 
                                 class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto hidden">
                                <!-- Los productos filtrados aparecerán aquí -->
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Escribe para buscar o haz clic para ver todos los productos</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Medida</label>
                        <input type="text" name="medida" id="variant-medida"
                               placeholder="Ej: 135x190, 160x200, 50x70"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Venta</label>
                            <input type="number" name="precio_venta" id="variant-precio-venta" step="0.01" min="0"
                                   placeholder="0.00"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Compra</label>
                            <input type="number" name="precio_compra" id="variant-precio-compra" step="0.01" min="0"
                                   placeholder="0.00"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" name="activo" id="variant-activo" checked
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="variant-activo" class="ml-2 block text-sm text-gray-700">
                            Variante activa
                        </label>
                    </div>
                </form>
                
                <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button onclick="variantesModule.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                        Cancelar
                    </button>
                    <button onclick="variantesModule.saveVariant()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                        Guardar
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal para ver detalles de la variante -->
        <div id="modal-detalle-variante" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-medium text-gray-900">Detalles de la Variante</h3>
                        <button onclick="window.variantesModule.cerrarModalDetalle()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="detalle-variante-content">
                        <!-- El contenido se carga dinámicamente -->
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onclick="window.variantesModule.cerrarModalDetalle()" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
        `;
    }
};