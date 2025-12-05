// Módulo Productos
window.productosModule = {
    data: {
        productos: [],
        filteredProductos: [],
        categorias: [],
        proveedores: [],
        searchTerm: '',
        editingProduct: null,
        currentPage: 1,
        itemsPerPage: 10,
        sortBy: 'nombre',
        sortDirection: 'asc'
    },

    async load() {
        const container = document.getElementById('productos-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadData();
        this.attachEventListeners();
        this.renderTable();
    },

    async loadData() {
        try {
            // Cargar datos en paralelo
            const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
                window.app.apiRequest('/api/productos'),
                window.app.apiRequest('/api/categorias'),
                window.app.apiRequest('/api/proveedores')
            ]);

            if (productosRes.success) this.data.productos = productosRes.data;
            if (categoriasRes.success) this.data.categorias = categoriasRes.data;
            if (proveedoresRes.success) this.data.proveedores = proveedoresRes.data;

            this.data.filteredProductos = [...this.data.productos];
        } catch (error) {
            console.error('Error loading data:', error);
            window.app.showToast('error', 'Error', 'Error al cargar los datos');
        }
    },

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.searchTerm = e.target.value;
                this.filterProducts();
            });
        }

        // New product button
        const newProductBtn = document.getElementById('new-product-btn');
        if (newProductBtn) {
            newProductBtn.addEventListener('click', () => this.openModal());
        }

        // Modal events se asignan cuando se abre el modal
    },

    attachModalEvents() {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-btn');

        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal();
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeModal();
        }

        if (form) {
            form.onsubmit = (e) => this.handleSubmit(e);
        }

        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) this.closeModal();
            };
        }
    },

    filterProducts() {
        if (!this.data.searchTerm) {
            this.data.filteredProductos = [...this.data.productos];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredProductos = this.data.productos.filter(producto =>
                producto.descripcion?.toLowerCase().includes(term) ||
                producto.material?.toLowerCase().includes(term) ||
                producto.categoria_nombre?.toLowerCase().includes(term) ||
                producto.proveedor_nombre?.toLowerCase().includes(term)
            );
        }
        this.data.currentPage = 1;
        this.renderTable();
    },

    sortProducts(field) {
        if (this.data.sortBy === field) {
            this.data.sortDirection = this.data.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.data.sortBy = field;
            this.data.sortDirection = 'asc';
        }

        this.data.filteredProductos.sort((a, b) => {
            let aVal = a[field] || '';
            let bVal = b[field] || '';
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.data.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;

        // Pagination
        const startIndex = (this.data.currentPage - 1) * this.data.itemsPerPage;
        const endIndex = startIndex + this.data.itemsPerPage;
        const paginatedProducts = this.data.filteredProductos.slice(startIndex, endIndex);

        if (paginatedProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-box text-4xl mb-2"></i>
                        <p>No se encontraron productos</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paginatedProducts.map(producto => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        ${producto.imagen ? `
                            <img class="h-12 w-12 rounded-lg object-cover mr-3 border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer" 
                                 src="assets/images/products/${producto.imagen}" 
                                 alt="${producto.descripcion}"
                                 title="Click para ver imagen completa"
                                 onclick="productosModule.showImageModal('assets/images/products/${producto.imagen}', '${producto.descripcion}')"
                                 onerror="this.src='assets/images/products/placeholder.svg'; this.title='Imagen no encontrada';">
                        ` : `
                            <img class="h-12 w-12 rounded-lg object-cover mr-3 border border-gray-200 opacity-60" 
                                 src="assets/images/products/placeholder.svg" 
                                 alt="Sin imagen"
                                 title="Sin imagen disponible">
                        `}
                        <div>
                            <div class="text-sm font-medium text-gray-900">${producto.descripcion || 'Sin descripción'}</div>
                            <div class="text-sm text-gray-500">${producto.material || 'Sin material'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        ${producto.categoria_nombre || 'Sin categoría'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.proveedor_nombre || 'Sin proveedor'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="productosModule.editProduct(${producto.id})" 
                            class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="productosModule.deleteProduct(${producto.id})" 
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
        this.updateCounter();
    },

    renderPagination() {
        const totalPages = Math.ceil(this.data.filteredProductos.length / this.data.itemsPerPage);
        const paginationContainer = document.getElementById('pagination-container');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
        `;

        // Previous button
        if (this.data.currentPage > 1) {
            paginationHTML += `
                <button onclick="productosModule.goToPage(${this.data.currentPage - 1})" 
                        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                    Anterior
                </button>
            `;
        }

        // Page numbers
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const pageNum = i;
            paginationHTML += `
                <button onclick="productosModule.goToPage(${pageNum})" 
                        class="px-3 py-1 border ${this.data.currentPage === pageNum ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'} rounded-md">
                    ${pageNum}
                </button>
            `;
        }

        // Next button
        if (this.data.currentPage < totalPages) {
            paginationHTML += `
                <button onclick="productosModule.goToPage(${this.data.currentPage + 1})" 
                        class="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                    Siguiente
                </button>
            `;
        }

        paginationHTML += `
                </div>
                <span class="text-sm text-gray-700">
                    Página ${this.data.currentPage} de ${totalPages}
                </span>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    },

    goToPage(page) {
        this.data.currentPage = page;
        this.renderTable();
    },

    updateCounter() {
        const counter = document.getElementById('products-counter');
        if (counter) {
            const total = this.data.filteredProductos.length;
            const start = (this.data.currentPage - 1) * this.data.itemsPerPage + 1;
            const end = Math.min(start + this.data.itemsPerPage - 1, total);
            
            if (total > 0) {
                counter.textContent = `Mostrando ${start}-${end} de ${total} productos`;
            } else {
                counter.textContent = 'No hay productos para mostrar';
            }
        }
    },

    openModal(product = null) {
        this.data.editingProduct = product;
        const modal = document.getElementById('product-modal');
        
        if (modal) {
            // Reset form
            const form = document.getElementById('product-form');
            if (form) form.reset();

            // Populate categorias select
            this.populateCategorias();
            this.populateProveedores();

            // Fill form if editing
            if (product) {
                document.getElementById('product-descripcion').value = product.descripcion || '';
                document.getElementById('product-material').value = product.material || '';
                document.getElementById('product-imagen').value = product.imagen || '';
                document.getElementById('product-categoria').value = product.id_categoria || '';
                document.getElementById('product-proveedor').value = product.id_proveedor || '';
                document.getElementById('product-activo').checked = product.activo === 1;
                
                document.getElementById('modal-title').textContent = 'Editar Producto';
            } else {
                document.getElementById('modal-title').textContent = 'Nuevo Producto';
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
            
            // Asignar event listeners después de mostrar el modal
            this.attachModalEvents();
        }
    },

    populateCategorias() {
        const select = document.getElementById('product-categoria');
        if (select) {
            select.innerHTML = '<option value="">Seleccionar categoría...</option>' +
                this.data.categorias.map(cat => 
                    `<option value="${cat.id}">${cat.nombre}</option>`
                ).join('');
        }
    },

    populateProveedores() {
        const select = document.getElementById('product-proveedor');
        if (select) {
            select.innerHTML = '<option value="">Seleccionar proveedor...</option>' +
                this.data.proveedores.map(prov => 
                    `<option value="${prov.id}">${prov.nombre}</option>`
                ).join('');
        }
    },

    closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
        }
        this.data.editingProduct = null;
    },

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            descripcion: document.getElementById('product-descripcion').value,
            material: document.getElementById('product-material').value,
            imagen: document.getElementById('product-imagen').value,
            id_categoria: document.getElementById('product-categoria').value,
            id_proveedor: document.getElementById('product-proveedor').value,
            activo: document.getElementById('product-activo').checked ? 1 : 0
        };

        try {
            if (this.data.editingProduct) {
                await window.app.apiRequest(`/api/productos/${this.data.editingProduct.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                window.app.showToast('success', 'Éxito', 'Producto actualizado exitosamente');
            } else {
                await window.app.apiRequest('/api/productos', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                window.app.showToast('success', 'Éxito', 'Producto creado exitosamente');
            }
            
            this.closeModal();
            await this.loadData();
            this.renderTable();
            
        } catch (error) {
            console.error('Error guardando producto:', error);
            window.app.showToast('error', 'Error', 'No se pudo guardar el producto');
        }
    },

    editProduct(id) {
        const product = this.data.productos.find(p => p.id === id);
        if (product) {
            this.openModal(product);
        }
    },

    async deleteProduct(id) {
        const product = this.data.productos.find(p => p.id === id);
        if (!product) return;

        if (!confirm(`¿Estás seguro de eliminar el producto "${product.descripcion}"?`)) {
            return;
        }

        try {
            await window.app.apiRequest(`/api/productos/${id}`, {
                method: 'DELETE'
            });
            
            window.app.showToast('success', 'Éxito', 'Producto eliminado exitosamente');
            await this.loadData();
            this.renderTable();
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            window.app.showToast('error', 'Error', 'No se pudo eliminar el producto');
        }
    },

    showImageModal(imageSrc, productName) {
        // Crear modal dinámicamente
        const modalHTML = `
            <div id="image-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div class="relative max-w-4xl max-h-full p-4">
                    <button onclick="productosModule.closeImageModal()" 
                            class="absolute top-2 right-2 z-10 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75">
                        <i class="fas fa-times"></i>
                    </button>
                    <img src="${imageSrc}" 
                         alt="${productName}"
                         class="max-w-full max-h-full rounded-lg shadow-2xl"
                         onerror="this.src='assets/images/products/placeholder.svg'">
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 rounded-b-lg">
                        <h3 class="text-lg font-semibold">${productName}</h3>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al body
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        document.body.appendChild(modalElement.firstElementChild);
        
        // Bloquear scroll del body
        document.body.classList.add('overflow-hidden');
        
        // Cerrar modal al hacer clic en el fondo
        document.getElementById('image-modal').addEventListener('click', (e) => {
            if (e.target.id === 'image-modal') {
                this.closeImageModal();
            }
        });
    },

    closeImageModal() {
        const modal = document.getElementById('image-modal');
        if (modal) {
            modal.remove();
            document.body.classList.remove('overflow-hidden');
        }
    },

    getTemplate() {
        return `
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">Gestión de Productos</h2>
                        <p class="text-sm text-gray-600 mt-1">Administra el catálogo completo de productos</p>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Search -->
                        <div class="relative">
                            <input type="text" 
                                   id="product-search"
                                   placeholder="Buscar productos..."
                                   class="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                        
                        <!-- New Product Button -->
                        <button id="new-product-btn" 
                                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-plus mr-2"></i>
                            Nuevo Producto
                        </button>
                    </div>
                </div>
            </div>

            <!-- Products Counter -->
            <div class="mb-4">
                <p id="products-counter" class="text-sm text-gray-600"></p>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th onclick="productosModule.sortProducts('descripcion')" 
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                Producto
                                <i class="fas fa-sort ml-1"></i>
                            </th>
                            <th onclick="productosModule.sortProducts('categoria_nombre')" 
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                Categoría
                                <i class="fas fa-sort ml-1"></i>
                            </th>
                            <th onclick="productosModule.sortProducts('proveedor_nombre')" 
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                Proveedor
                                <i class="fas fa-sort ml-1"></i>
                            </th>
                            <th onclick="productosModule.sortProducts('activo')" 
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                Estado
                                <i class="fas fa-sort ml-1"></i>
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody id="products-tbody" class="bg-white divide-y divide-gray-200">
                        <!-- Products will be loaded here -->
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div id="pagination-container" class="mt-6"></div>

            <!-- Modal -->
            <div id="product-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div class="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 id="modal-title" class="text-lg font-semibold text-gray-900">Nuevo Producto</h3>
                        <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="product-form" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                            <input type="text" id="product-descripcion" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="Ej: Colchón Imperial">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                            <select id="product-categoria" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Seleccionar categoría...</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
                            <select id="product-proveedor" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Seleccionar proveedor...</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Material</label>
                            <input type="text" id="product-material"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="Ej: Memory Foam, Resortes, etc.">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                            <input type="text" id="product-imagen"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                   placeholder="Ej: products/colchones/imperial.jpg">
                            <p class="text-xs text-gray-500 mt-1">Ruta relativa desde assets/images/</p>
                        </div>

                        <div class="flex items-center">
                            <input type="checkbox" id="product-activo" checked
                                   class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                            <label for="product-activo" class="ml-2 text-sm font-medium text-gray-700">
                                Producto activo
                            </label>
                        </div>

                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" id="cancel-btn" 
                                    class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};