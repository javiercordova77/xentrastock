// Módulo Variantes
window.variantesModule = {
    data: {
        variants: [],
        filteredVariants: [],
        products: [],
        searchTerm: '',
        editingVariant: null
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
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading variants:', error);
            this.showMessage('Error al cargar las variantes', 'error');
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
        const select = document.getElementById('variant-producto');
        if (select) {
            select.innerHTML = '<option value="">Selecciona un producto</option>' +
                this.data.products
                    .filter(prod => prod.activo)
                    .map(prod => `<option value="${prod.id}">${prod.descripcion}</option>`)
                    .join('');
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
    },

    filterVariants() {
        if (!this.data.searchTerm) {
            this.data.filteredVariants = [...this.data.variants];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredVariants = this.data.variants.filter(variant => 
                variant.codigo_variante?.toLowerCase().includes(term) ||
                variant.medida?.toLowerCase().includes(term) ||
                variant.producto_descripcion?.toLowerCase().includes(term)
            );
        }
        this.renderTable();
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

        tbody.innerHTML = this.data.filteredVariants.map(variant => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-palette text-purple-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${variant.codigo_variante || 'Sin código'}</p>
                            <p class="text-sm text-gray-500">${variant.medida || 'Sin medida'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${variant.producto_descripcion || 'Sin producto'}</td>
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
            
            // Update product select
            this.updateProductSelect();
            
            // Fill form if editing
            if (variant) {
                document.getElementById('variant-codigo').value = variant.codigo_variante || '';
                document.getElementById('variant-producto').value = variant.id_producto || '';
                document.getElementById('variant-medida').value = variant.medida || '';
                document.getElementById('variant-precio-venta').value = variant.precio_venta || '';
                document.getElementById('variant-precio-compra').value = variant.precio_compra || '';
                document.getElementById('variant-activo').checked = variant.activo !== 0;
                document.getElementById('modal-title').textContent = 'Editar Variante';
            } else {
                document.getElementById('variant-form').reset();
                document.getElementById('variant-activo').checked = true; // Por defecto activo
                document.getElementById('modal-title').textContent = 'Nueva Variante';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('variant-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.data.editingVariant = null;
        }
    },

    async saveVariant() {
        const form = document.getElementById('variant-form');
        const formData = new FormData(form);
        
        const variantData = {
            codigo_variante: formData.get('codigo_variante'),
            id_producto: parseInt(formData.get('id_producto')),
            medida: formData.get('medida'),
            precio_venta: parseFloat(formData.get('precio_venta')) || 0,
            precio_compra: parseFloat(formData.get('precio_compra')) || 0,
            activo: formData.get('activo') ? 1 : 0
        };

        // Validaciones
        if (!variantData.codigo_variante || !variantData.id_producto) {
            this.showMessage('Por favor completa todos los campos obligatorios', 'error');
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
                    this.showMessage('Variante actualizada exitosamente', 'success');
                }
            } else {
                const response = await window.app.apiRequest('/api/variantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(variantData)
                });
                
                if (response.success) {
                    this.showMessage('Variante creada exitosamente', 'success');
                }
            }

            this.closeModal();
            await this.loadVariants();
        } catch (error) {
            console.error('Error saving variant:', error);
            this.showMessage('Error al guardar la variante', 'error');
        }
    },

    async editVariant(id) {
        const variant = this.data.variants.find(v => v.id === id);
        if (variant) {
            this.openModal(variant);
        }
    },

    async viewVariant(id) {
        const variant = this.data.variants.find(v => v.id === id);
        if (variant) {
            alert(`Variante: ${variant.codigo_variante}\nProducto: ${variant.producto_descripcion || 'N/A'}\nMedida: ${variant.medida || 'N/A'}\nPrecio Venta: $${variant.precio_venta || '0.00'}\nPrecio Compra: $${variant.precio_compra || '0.00'}\nEstado: ${variant.activo ? 'Activo' : 'Inactivo'}`);
        }
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
                this.showMessage('Variante eliminada exitosamente', 'success');
                await this.loadVariants();
            }
        } catch (error) {
            console.error('Error deleting variant:', error);
            this.showMessage('Error al eliminar la variante', 'error');
        }
    },

    showMessage(message, type = 'info') {
        // Simple alert for now, could be enhanced with a toast component
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else {
            alert(message);
        }
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
                        <select name="id_producto" id="variant-producto" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Selecciona un producto</option>
                        </select>
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
        `;
    }
};