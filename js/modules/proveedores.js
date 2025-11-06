// Módulo Proveedores
window.proveedoresModule = {
    data: {
        providers: [],
        filteredProviders: [],
        searchTerm: '',
        selectedProvider: null,
        isModalOpen: false,
        editingProvider: null
    },

    async load() {
        const container = document.getElementById('proveedores-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadProviders();
        this.setupEventListeners();
        this.renderTable();
    },

    async loadProviders() {
        try {
            const response = await window.app.apiRequest('/api/proveedores');
            if (response.success) {
                this.data.providers = response.data || [];
                this.data.filteredProviders = [...this.data.providers];
            } else {
                this.data.providers = [];
                this.data.filteredProviders = [];
            }
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            window.app.showToast('error', 'Error', 'No se pudieron cargar los proveedores');
        }
    },

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('provider-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.searchTerm = e.target.value;
                this.filterProviders();
            });
        }

        // New provider button
        const newProviderBtn = document.getElementById('new-provider-btn');
        if (newProviderBtn) {
            newProviderBtn.addEventListener('click', () => this.openModal());
        }
    },

    filterProviders() {
        if (!this.data.searchTerm) {
            this.data.filteredProviders = [...this.data.providers];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredProviders = this.data.providers.filter(provider => 
                provider.nombre?.toLowerCase().includes(term) ||
                provider.actividad?.toLowerCase().includes(term) ||
                provider.email?.toLowerCase().includes(term) ||
                provider.telefono?.includes(term)
            );
        }
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('providers-tbody');
        if (!tbody) return;

        if (this.data.filteredProviders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                        <i class="fas fa-truck text-4xl mb-4 text-gray-300"></i>
                        <p class="text-lg font-medium">No hay proveedores</p>
                        <p class="text-sm">Agrega tu primer proveedor para comenzar</p>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = this.data.filteredProviders.map(provider => `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-truck text-blue-600"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">${provider.nombre || 'Sin nombre'}</p>
                                <p class="text-sm text-gray-500">${provider.actividad || 'Sin actividad'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">${provider.contacto || 'Sin contacto'}</td>
                    <td class="px-6 py-4 text-sm text-blue-600">${provider.email || 'Sin email'}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">${provider.telefono || 'Sin teléfono'}</td>
                    <td class="px-6 py-4">
                        <span class="${provider.activo !== 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                            ${provider.activo !== 0 ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center space-x-2">
                            <button onclick="proveedoresModule.editProvider(${provider.id})" 
                                    class="text-blue-600 hover:text-blue-700 p-1 rounded">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="proveedoresModule.viewProvider(${provider.id})" 
                                    class="text-green-600 hover:text-green-700 p-1 rounded">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="proveedoresModule.deleteProvider(${provider.id})" 
                                    class="text-red-600 hover:text-red-700 p-1 rounded">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Update stats
        document.getElementById('total-providers').textContent = this.data.providers.length;
        document.getElementById('active-providers').textContent = this.data.providers.filter(p => p.activo !== false).length;
    },

    openModal(provider = null) {
        this.data.editingProvider = provider;
        this.data.isModalOpen = true;
        
        // Show modal
        const modal = document.getElementById('provider-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Fill form if editing
            if (provider) {
                document.getElementById('provider-nombre').value = provider.nombre || '';
                document.getElementById('provider-actividad').value = provider.actividad || '';
                document.getElementById('provider-contacto').value = provider.contacto || '';
                document.getElementById('provider-email').value = provider.email || '';
                document.getElementById('provider-telefono').value = provider.telefono || '';
                document.getElementById('provider-direccion').value = provider.direccion || '';
                document.getElementById('provider-activo').checked = provider.activo !== 0;
                document.getElementById('modal-title').textContent = 'Editar Proveedor';
            } else {
                document.getElementById('provider-form').reset();
                document.getElementById('provider-activo').checked = true; // Activo por defecto
                document.getElementById('modal-title').textContent = 'Nuevo Proveedor';
            }
        }
    },

    closeModal() {
        this.data.isModalOpen = false;
        this.data.editingProvider = null;
        
        const modal = document.getElementById('provider-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    async saveProvider() {
        const form = document.getElementById('provider-form');
        const formData = new FormData(form);
        
        const providerData = {
            nombre: formData.get('nombre'),
            actividad: formData.get('actividad'),
            contacto: formData.get('contacto'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
            activo: formData.get('activo') === 'on' ? 1 : 0
        };

        try {
            if (this.data.editingProvider) {
                // Update existing provider
                await window.app.apiRequest(`/api/proveedores/${this.data.editingProvider.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(providerData)
                });
                window.app.showToast('success', 'Éxito', 'Proveedor actualizado correctamente');
            } else {
                // Create new provider
                await window.app.apiRequest('/api/proveedores', {
                    method: 'POST',
                    body: JSON.stringify(providerData)
                });
                window.app.showToast('success', 'Éxito', 'Proveedor creado correctamente');
            }
            
            this.closeModal();
            await this.loadProviders();
            this.renderTable();
            
        } catch (error) {
            console.error('Error guardando proveedor:', error);
            window.app.showToast('error', 'Error', 'No se pudo guardar el proveedor');
        }
    },

    editProvider(id) {
        const provider = this.data.providers.find(p => p.id === id);
        if (provider) {
            this.openModal(provider);
        }
    },

    viewProvider(id) {
        window.app.showToast('info', 'Función en desarrollo', 'Vista detallada próximamente disponible');
    },

    async deleteProvider(id) {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar este proveedor?');
        if (!confirmed) return;

        try {
            await window.app.apiRequest(`/api/proveedores/${id}`, {
                method: 'DELETE'
            });
            
            window.app.showToast('success', 'Éxito', 'Proveedor eliminado correctamente');
            await this.loadProviders();
            this.renderTable();
            
        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            window.app.showToast('error', 'Error', 'No se pudo eliminar el proveedor');
        }
    },

    getTemplate() {
        return `
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-900">Gestión de Proveedores</h2>
                        <p class="text-sm text-gray-600 mt-1">Administra la información de tus proveedores</p>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <!-- Search -->
                        <div class="relative">
                            <input type="text" 
                                   id="provider-search"
                                   placeholder="Buscar proveedores..."
                                   class="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                        
                        <!-- New Provider Button -->
                        <button id="new-provider-btn" 
                                class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-plus mr-2"></i>
                            Nuevo Proveedor
                        </button>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-gray-900" id="total-providers">0</p>
                        <p class="text-sm text-gray-600">Total Proveedores</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600" id="active-providers">0</p>
                        <p class="text-sm text-gray-600">Activos</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600">12</p>
                        <p class="text-sm text-gray-600">Con Productos</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-yellow-600">3</p>
                        <p class="text-sm text-gray-600">Nuevos (30d)</p>
                    </div>
                </div>
            </div>

            <!-- Providers Table -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Proveedor
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Teléfono
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="providers-tbody" class="bg-white divide-y divide-gray-200">
                            <!-- Content will be populated here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Provider Modal -->
            <div id="provider-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
                    <div class="mt-3">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-medium text-gray-900" id="modal-title">Nuevo Proveedor</h3>
                            <button onclick="proveedoresModule.closeModal()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="provider-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input type="text" name="nombre" id="provider-nombre" required
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Actividad</label>
                                <textarea name="actividad" id="provider-actividad" rows="2"
                                          placeholder="Ej: Venta de insumos para el descanso"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Contacto</label>
                                <input type="text" name="contacto" id="provider-contacto"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" name="email" id="provider-email"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                <input type="tel" name="telefono" id="provider-telefono"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                <textarea name="direccion" id="provider-direccion" rows="2"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" name="activo" id="provider-activo" checked
                                           class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                                    <span class="ml-2 text-sm font-medium text-gray-700">Proveedor activo</span>
                                </label>
                                <p class="text-xs text-gray-500 mt-1">Los proveedores inactivos no aparecerán en los listados de selección</p>
                            </div>
                        </form>
                        
                        <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button onclick="proveedoresModule.closeModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                                Cancelar
                            </button>
                            <button onclick="proveedoresModule.saveProvider()" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};