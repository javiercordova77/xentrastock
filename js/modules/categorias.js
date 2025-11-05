// Módulo Categorías
window.categoriasModule = {
    data: {
        categories: [],
        filteredCategories: [],
        searchTerm: '',
        editingCategory: null
    },

    async load() {
        const container = document.getElementById('categorias-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadCategories();
        this.attachEventListeners();
    },

    async loadCategories() {
        try {
            const response = await window.app.apiRequest('/api/categorias');
            if (response.success) {
                this.data.categories = response.data;
                this.data.filteredCategories = [...this.data.categories];
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showMessage('Error al cargar las categorías', 'error');
        }
    },

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('category-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.searchTerm = e.target.value;
                this.filterCategories();
            });
        }

        // New category button
        const newCategoryBtn = document.getElementById('new-category-btn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => this.openModal());
        }
    },

    filterCategories() {
        if (!this.data.searchTerm) {
            this.data.filteredCategories = [...this.data.categories];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredCategories = this.data.categories.filter(category => 
                category.nombre?.toLowerCase().includes(term) ||
                category.descripcion?.toLowerCase().includes(term)
            );
        }
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('categories-tbody');
        if (!tbody) return;

        if (this.data.filteredCategories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                        ${this.data.searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.filteredCategories.map(category => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-tags text-yellow-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${category.nombre || 'Sin nombre'}</p>
                            <p class="text-sm text-gray-500">${category.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${category.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="categoriasModule.editCategory(${category.id})" 
                                class="text-blue-600 hover:text-blue-700 p-1 rounded">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="categoriasModule.viewCategory(${category.id})" 
                                class="text-green-600 hover:text-green-700 p-1 rounded">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="categoriasModule.deleteCategory(${category.id})" 
                                class="text-red-600 hover:text-red-700 p-1 rounded">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    openModal(category = null) {
        this.data.editingCategory = category;
        const modal = document.getElementById('category-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Fill form if editing
            if (category) {
                document.getElementById('category-nombre').value = category.nombre || '';
                document.getElementById('category-descripcion').value = category.descripcion || '';
                document.getElementById('category-activo').checked = category.activo !== 0;
                document.getElementById('modal-title').textContent = 'Editar Categoría';
            } else {
                document.getElementById('category-form').reset();
                document.getElementById('category-activo').checked = true; // Por defecto activo
                document.getElementById('modal-title').textContent = 'Nueva Categoría';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.data.editingCategory = null;
        }
    },

    async saveCategory() {
        const form = document.getElementById('category-form');
        const formData = new FormData(form);
        
        const categoryData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            activo: formData.get('activo') ? 1 : 0
        };

        try {
            if (this.data.editingCategory) {
                const response = await window.app.apiRequest(`/api/categorias/${this.data.editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData)
                });
                
                if (response.success) {
                    this.showMessage('Categoría actualizada exitosamente', 'success');
                }
            } else {
                const response = await window.app.apiRequest('/api/categorias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData)
                });
                
                if (response.success) {
                    this.showMessage('Categoría creada exitosamente', 'success');
                }
            }

            this.closeModal();
            await this.loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            this.showMessage('Error al guardar la categoría', 'error');
        }
    },

    async editCategory(id) {
        const category = this.data.categories.find(c => c.id === id);
        if (category) {
            this.openModal(category);
        }
    },

    async viewCategory(id) {
        const category = this.data.categories.find(c => c.id === id);
        if (category) {
            alert(`Categoría: ${category.nombre}\nDescripción: ${category.descripcion || 'N/A'}\nEstado: ${category.activo ? 'Activo' : 'Inactivo'}`);
        }
    },

    async deleteCategory(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            return;
        }

        try {
            const response = await window.app.apiRequest(`/api/categorias/${id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                this.showMessage('Categoría eliminada exitosamente', 'success');
                await this.loadCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showMessage('Error al eliminar la categoría', 'error');
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
                        <h2 class="text-lg font-semibold text-gray-900">Categorías</h2>
                        <p class="text-sm text-gray-600 mt-1">Administra las categorías de productos</p>
                    </div>
                    <button id="new-category-btn" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                        <i class="fas fa-plus mr-2"></i>Nueva Categoría
                    </button>
                </div>
            </div>

            <!-- Search -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                    <input type="text" id="category-search" 
                           placeholder="Buscar categorías..." 
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Creación
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody id="categories-tbody" class="bg-white divide-y divide-gray-200">
                        <!-- Content will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="category-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="modal-title" class="text-lg font-medium text-gray-900">Nueva Categoría</h3>
                    <button onclick="categoriasModule.closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="category-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="nombre" id="category-nombre" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                        <textarea name="descripcion" id="category-descripcion" rows="3"
                                  placeholder="Descripción opcional de la categoría"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" name="activo" id="category-activo" checked
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="category-activo" class="ml-2 block text-sm text-gray-700">
                            Categoría activa
                        </label>
                    </div>
                </form>
                
                <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button onclick="categoriasModule.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                        Cancelar
                    </button>
                    <button onclick="categoriasModule.saveCategory()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
        `;
    }
};