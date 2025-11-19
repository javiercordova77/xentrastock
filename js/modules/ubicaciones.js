// Módulo Ubicaciones
window.ubicacionesModule = {
    data: {
        locations: [],
        filteredLocations: [],
        searchTerm: '',
        editingLocation: null
    },

    async load() {
        const container = document.getElementById('ubicaciones-content');
        container.innerHTML = this.getTemplate();
        
        await this.loadLocations();
        this.attachEventListeners();
    },

    async loadLocations() {
        try {
            const response = await window.app.apiRequest('/api/ubicaciones');
            if (response.success) {
                this.data.locations = response.data;
                this.data.filteredLocations = [...this.data.locations];
                this.renderTable();
            }
        } catch (error) {
            console.error('Error loading ubicaciones:', error);
            window.app.showToast('error', 'Error', 'Error al cargar las ubicaciones');
        }
    },

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('location-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.data.searchTerm = e.target.value;
                this.filterLocations();
            });
        }

        // New location button
        const newLocationBtn = document.getElementById('new-location-btn');
        if (newLocationBtn) {
            newLocationBtn.addEventListener('click', () => this.openModal());
        }
    },

    filterLocations() {
        if (!this.data.searchTerm) {
            this.data.filteredLocations = [...this.data.locations];
        } else {
            const term = this.data.searchTerm.toLowerCase();
            this.data.filteredLocations = this.data.locations.filter(location => 
                location.nombre?.toLowerCase().includes(term) ||
                location.descripcion?.toLowerCase().includes(term) ||
                location.tipo?.toLowerCase().includes(term)
            );
        }
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('locations-tbody');
        if (!tbody) return;

        if (this.data.filteredLocations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        ${this.data.searchTerm ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.data.filteredLocations.map(location => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-${this.getLocationIcon(location.tipo)} text-red-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${location.nombre || 'Sin nombre'}</p>
                            <p class="text-sm text-gray-500">${location.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getTypeColor(location.tipo)}">
                        ${this.getTypeLabel(location.tipo)}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${location.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${location.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${location.created_at ? new Date(location.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="ubicacionesModule.editLocation(${location.id})" 
                                class="text-blue-600 hover:text-blue-700 p-1 rounded">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="ubicacionesModule.viewLocation(${location.id})" 
                                class="text-green-600 hover:text-green-700 p-1 rounded">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="ubicacionesModule.deleteLocation(${location.id})" 
                                class="text-red-600 hover:text-red-700 p-1 rounded">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getLocationIcon(tipo) {
        switch (tipo) {
            case 'almacen': return 'warehouse';
            case 'tienda': return 'store';
            case 'showroom': return 'home';
            default: return 'map-marker-alt';
        }
    },

    getTypeColor(tipo) {
        switch (tipo) {
            case 'almacen': return 'bg-blue-100 text-blue-800';
            case 'tienda': return 'bg-green-100 text-green-800';
            case 'showroom': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    getTypeLabel(tipo) {
        switch (tipo) {
            case 'almacen': return 'Bodega';
            case 'tienda': return 'Almacén';
            case 'showroom': return 'Showroom';
            default: return tipo || 'N/A';
        }
    },

    openModal(location = null) {
        this.data.editingLocation = location;
        const modal = document.getElementById('location-modal');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Fill form if editing
            if (location) {
                document.getElementById('location-nombre').value = location.nombre || '';
                document.getElementById('location-descripcion').value = location.descripcion || '';
                document.getElementById('location-tipo').value = location.tipo || 'almacen';
                document.getElementById('location-activo').checked = location.activo !== 0;
                document.getElementById('modal-title').textContent = 'Editar Ubicación';
            } else {
                document.getElementById('location-form').reset();
                document.getElementById('location-tipo').value = 'almacen';
                document.getElementById('location-activo').checked = true; // Por defecto activo
                document.getElementById('modal-title').textContent = 'Nueva Ubicación';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('location-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.data.editingLocation = null;
        }
    },

    async saveLocation() {
        const form = document.getElementById('location-form');
        const formData = new FormData(form);
        
        const locationData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            tipo: formData.get('tipo'),
            activo: formData.get('activo') ? 1 : 0
        };

        try {
            if (this.data.editingLocation) {
                const response = await window.app.apiRequest(`/api/ubicaciones/${this.data.editingLocation.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(locationData)
                });
                
                if (response.success) {
                    window.app.showToast('success', 'Éxito', 'Ubicación actualizada exitosamente');
                }
            } else {
                const response = await window.app.apiRequest('/api/ubicaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(locationData)
                });
                
                if (response.success) {
                    window.app.showToast('success', 'Éxito', 'Ubicación creada exitosamente');
                }
            }

            this.closeModal();
            await this.loadLocations();
        } catch (error) {
            console.error('Error saving ubicacion:', error);
            window.app.showToast('error', 'Error', 'Error al guardar la ubicación');
        }
    },

    async editLocation(id) {
        const location = this.data.locations.find(l => l.id === id);
        if (location) {
            this.openModal(location);
        }
    },

    async viewLocation(id) {
        const location = this.data.locations.find(l => l.id === id);
        if (location) {
            alert(`Ubicación: ${location.nombre}\nDescripción: ${location.descripcion || 'N/A'}\nTipo: ${this.getTypeLabel(location.tipo)}\nEstado: ${location.activo ? 'Activo' : 'Inactivo'}`);
        }
    },

    async deleteLocation(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
            return;
        }

        try {
            const response = await window.app.apiRequest(`/api/ubicaciones/${id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                window.app.showToast('success', 'Éxito', 'Ubicación eliminada exitosamente');
                await this.loadUbicaciones();
            }
        } catch (error) {
            console.error('Error deleting ubicacion:', error);
            window.app.showToast('error', 'Error', 'Error al eliminar la ubicación');
        }
    },

    getTemplate() {
        return `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">Ubicaciones</h2>
                        <p class="text-sm text-gray-600 mt-1">Gestión de almacenes y ubicaciones de stock</p>
                    </div>
                    <button id="new-location-btn" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                        <i class="fas fa-plus mr-2"></i>Nueva Ubicación
                    </button>
                </div>
            </div>

            <!-- Search -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                    <input type="text" id="location-search" 
                           placeholder="Buscar ubicaciones..." 
                           class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ubicación
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
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
                    <tbody id="locations-tbody" class="bg-white divide-y divide-gray-200">
                        <!-- Content will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal -->
        <div id="location-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="modal-title" class="text-lg font-medium text-gray-900">Nueva Ubicación</h3>
                    <button onclick="ubicacionesModule.closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="location-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="nombre" id="location-nombre" required
                               placeholder="Ej: Bodega Central, Almacén Norte"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                        <textarea name="descripcion" id="location-descripcion" rows="3"
                                  placeholder="Descripción opcional de la ubicación"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select name="tipo" id="location-tipo" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="almacen">Bodega</option>
                            <option value="tienda">Almacén</option>
                            <option value="showroom">Showroom</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" name="activo" id="location-activo" checked
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="location-activo" class="ml-2 block text-sm text-gray-700">
                            Ubicación activa
                        </label>
                    </div>
                </form>
                
                <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <button onclick="ubicacionesModule.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500">
                        Cancelar
                    </button>
                    <button onclick="ubicacionesModule.saveLocation()" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
        `;
    }
};