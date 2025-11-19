/**
 * Módulo de Proveedores para XentraStock v2.0
 */

// HTML template for proveedores section
function getProveedoresHTML() {
    return `
        <div class="space-y-6">
            <!-- Header with enhanced design -->
            <div class="card p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                            <i class="fas fa-building text-blue-600 mr-3"></i>
                            Gestión de Proveedores
                        </h1>
                        <p class="mt-2 text-gray-600">
                            Administra la información de tus proveedores y contactos comerciales
                        </p>
                    </div>
                    <div class="mt-4 sm:mt-0">
                        <button id="add-proveedores" type="button" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i>
                            Nuevo Proveedor
                        </button>
                    </div>
                </div>
            </div>

            <!-- Search and filters with enhanced design -->
            <div class="card p-6">
                <div class="flex flex-col lg:flex-row gap-4">
                    <div class="flex-1">
                        <div class="search-container">
                            <input type="text" id="search-proveedores" placeholder="Buscar por nombre, contacto o email..." 
                                   class="search-input form-input">
                            <div class="search-icon">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button id="refresh-proveedores" type="button" class="btn btn-secondary">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Actualizar
                        </button>
                        <button id="export-proveedores" type="button" class="btn btn-secondary">
                            <i class="fas fa-download mr-2"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table with enhanced design -->
                        <!-- Table with enhanced design -->
            <div class="card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table-modern w-full">
                        <thead>
                            <tr>
                                <th class="px-6 py-4 text-left">
                                    <span class="flex items-center">
                                        <i class="fas fa-building text-gray-400 mr-2"></i>
                                        Proveedor
                                    </span>
                                </th>
                                <th class="px-6 py-4 text-left hidden sm:table-cell">
                                    <span class="flex items-center">
                                        <i class="fas fa-user text-gray-400 mr-2"></i>
                                        Contacto
                                    </span>
                                </th>
                                <th class="px-6 py-4 text-left hidden lg:table-cell">
                                    <span class="flex items-center">
                                        <i class="fas fa-envelope text-gray-400 mr-2"></i>
                                        Email
                                    </span>
                                </th>
                                <th class="px-6 py-4 text-left hidden lg:table-cell">
                                    <span class="flex items-center">
                                        <i class="fas fa-phone text-gray-400 mr-2"></i>
                                        Teléfono
                                    </span>
                                </th>
                                <th class="px-6 py-4 text-center">
                                    <span class="flex items-center justify-center">
                                        <i class="fas fa-cogs text-gray-400 mr-2"></i>
                                        Acciones
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="proveedores-table-body">
                            <!-- Dynamic content will be inserted here -->
                        </tbody>
                    </table>
                </div>

                <!-- Empty state -->
                <div id="proveedores-empty-state" class="hidden text-center py-12">
                    <div class="mx-auto h-24 w-24 text-gray-300 mb-4">
                        <i class="fas fa-building text-6xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No hay proveedores registrados</h3>
                    <p class="text-gray-500 mb-6">Comienza agregando tu primer proveedor</p>
                    <button onclick="document.getElementById('add-proveedores').click()" class="btn btn-primary">
                        <i class="fas fa-plus mr-2"></i>
                        Agregar Primer Proveedor
                    </button>
                </div>

                <!-- Loading state -->
                <div id="proveedores-loading" class="hidden text-center py-12">
                    <div class="loading loading-lg mx-auto mb-4"></div>
                    <p class="text-gray-500">Cargando proveedores...</p>
                </div>
            </div>
        </div>
    `;
}

            <!-- Empty state -->
            <div id="proveedores-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primer proveedor.</p>
                <div class="mt-6">
                    <button type="button" onclick="openProveedorModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Proveedor
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for adding/editing proveedor -->
        <div id="proveedor-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-md">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="proveedor-modal-title" class="text-lg font-medium text-gray-900">Agregar Proveedor</h2>
                    <button type="button" onclick="closeProveedorModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="proveedor-form" class="space-y-4">
                    <input type="hidden" id="proveedor-id">
                    
                    <div>
                        <label for="proveedor-nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input type="text" id="proveedor-nombre" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="proveedor-actividad" class="block text-sm font-medium text-gray-700">Actividad</label>
                        <input type="text" id="proveedor-actividad" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="proveedor-contacto" class="block text-sm font-medium text-gray-700">Contacto</label>
                        <input type="text" id="proveedor-contacto" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="proveedor-telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" id="proveedor-telefono" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="proveedor-email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="proveedor-email" 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="proveedor-direccion" class="block text-sm font-medium text-gray-700">Dirección</label>
                        <textarea id="proveedor-direccion" rows="2" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeProveedorModal()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mobile-button">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md mobile-button">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Initialize proveedores section
async function initProveedores() {
    setupProveedoresEventListeners();
    await loadProveedoresData();
}

// Setup event listeners for proveedores
function setupProveedoresEventListeners() {
    // Add button
    document.getElementById('add-proveedores').addEventListener('click', () => {
        openProveedorModal();
    });

    // Refresh button
    document.getElementById('refresh-proveedores').addEventListener('click', () => {
        loadProveedoresData();
    });

    // Search input
    const searchInput = document.getElementById('search-proveedores');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterProveedores(e.target.value);
        }, 300);
    });

    // Form submission
    document.getElementById('proveedor-form').addEventListener('submit', handleProveedorSubmit);
}

// Load proveedores data
async function loadProveedoresData() {
    try {
        const proveedores = filterData(app.data, 'proveedor');
        renderProveedoresTable(proveedores);
        
    } catch (error) {
        console.error('Error loading proveedores:', error);
        showToast('Error cargando proveedores: ' + error.message, 'error');
    }
}

// Render proveedores table
function renderProveedoresTable(proveedores) {
    const tbody = document.getElementById('proveedores-table-body');
    const emptyState = document.getElementById('proveedores-empty');
    
    if (proveedores.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = proveedores.map(proveedor => `
        <tr class="hover:bg-gray-50">
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                ${proveedor.nombre}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 mobile-hidden">
                ${proveedor.actividad || '-'}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                ${proveedor.contacto || '-'}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 mobile-hidden">
                ${proveedor.telefono || '-'}
            </td>
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 mobile-hidden">
                ${proveedor.email || '-'}
            </td>
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button onclick="editProveedor('${proveedor.id}')" 
                        class="text-indigo-600 hover:text-indigo-900 mr-3">
                    Editar
                </button>
                <button onclick="deleteProveedor('${proveedor.id}')" 
                        class="text-red-600 hover:text-red-900">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter proveedores
function filterProveedores(searchTerm) {
    const proveedores = filterData(app.data, 'proveedor', searchTerm);
    renderProveedoresTable(proveedores);
}

// Open proveedor modal
function openProveedorModal(proveedor = null) {
    const modal = document.getElementById('proveedor-modal');
    const title = document.getElementById('proveedor-modal-title');
    const form = document.getElementById('proveedor-form');
    
    // Reset form
    form.reset();
    
    if (proveedor) {
        title.textContent = 'Editar Proveedor';
        document.getElementById('proveedor-id').value = proveedor.id;
        document.getElementById('proveedor-nombre').value = proveedor.nombre;
        document.getElementById('proveedor-actividad').value = proveedor.actividad || '';
        document.getElementById('proveedor-contacto').value = proveedor.contacto || '';
        document.getElementById('proveedor-telefono').value = proveedor.telefono || '';
        document.getElementById('proveedor-email').value = proveedor.email || '';
        document.getElementById('proveedor-direccion').value = proveedor.direccion || '';
    } else {
        title.textContent = 'Agregar Proveedor';
        document.getElementById('proveedor-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Close proveedor modal
function closeProveedorModal() {
    document.getElementById('proveedor-modal').style.display = 'none';
}

// Handle proveedor form submission
async function handleProveedorSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const proveedorData = {
            nombre: document.getElementById('proveedor-nombre').value,
            actividad: document.getElementById('proveedor-actividad').value,
            contacto: document.getElementById('proveedor-contacto').value,
            telefono: document.getElementById('proveedor-telefono').value,
            email: document.getElementById('proveedor-email').value,
            direccion: document.getElementById('proveedor-direccion').value
        };
        
        const proveedorId = document.getElementById('proveedor-id').value;
        
        let result;
        if (proveedorId) {
            // Update existing proveedor
            proveedorData.id = proveedorId;
            proveedorData.tipo = 'proveedor';
            result = await app.sdk.update(proveedorData);
        } else {
            // Create new proveedor
            proveedorData.tipo = 'proveedor';
            result = await app.sdk.create(proveedorData);
        }
        
        if (result.isOk) {
            closeProveedorModal();
            showToast(
                proveedorId ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente',
                'success'
            );
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving proveedor:', error);
        showToast('Error guardando proveedor: ' + error.message, 'error');
    }
}

// Edit proveedor
function editProveedor(proveedorId) {
    const proveedor = app.data.find(item => item.id === proveedorId && item.tipo === 'proveedor');
    if (proveedor) {
        openProveedorModal(proveedor);
    }
}

// Delete proveedor
async function deleteProveedor(proveedorId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
        return;
    }
    
    try {
        const result = await app.sdk.delete({
            id: proveedorId,
            tipo: 'proveedor'
        });
        
        if (result.isOk) {
            showToast('Proveedor eliminado correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting proveedor:', error);
        showToast('Error eliminando proveedor: ' + error.message, 'error');
    }
}