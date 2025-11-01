/**
 * Módulo de Ubicaciones para XentraStock v2.0
 */

// HTML template for ubicaciones section
function getUbicacionesHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Ubicaciones</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Gestiona las ubicaciones físicas donde almacenas tu inventario.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="add-ubicaciones" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Ubicación
                    </button>
                </div>
            </div>

            <!-- Search and filters -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-ubicaciones" class="sr-only">Buscar ubicaciones</label>
                        <div class="relative">
                            <input type="text" id="search-ubicaciones" placeholder="Buscar ubicaciones..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button id="refresh-ubicaciones" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Actualizar
                    </button>
                </div>
            </div>

            <!-- Cards Grid -->
            <div id="ubicaciones-grid" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Content will be loaded here -->
            </div>

            <!-- Empty state -->
            <div id="ubicaciones-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay ubicaciones</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primera ubicación.</p>
                <div class="mt-6">
                    <button type="button" onclick="openUbicacionModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Ubicación
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for adding/editing ubicacion -->
        <div id="ubicacion-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-md">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="ubicacion-modal-title" class="text-lg font-medium text-gray-900">Agregar Ubicación</h2>
                    <button type="button" onclick="closeUbicacionModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="ubicacion-form" class="space-y-4">
                    <input type="hidden" id="ubicacion-id">
                    
                    <div>
                        <label for="ubicacion-nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input type="text" id="ubicacion-nombre" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div>
                        <label for="ubicacion-descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="ubicacion-descripcion" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeUbicacionModal()" 
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

// Initialize ubicaciones section
async function initUbicaciones() {
    setupUbicacionesEventListeners();
    await loadUbicacionesData();
}

// Setup event listeners for ubicaciones
function setupUbicacionesEventListeners() {
    // Add button
    document.getElementById('add-ubicaciones').addEventListener('click', () => {
        openUbicacionModal();
    });

    // Refresh button
    document.getElementById('refresh-ubicaciones').addEventListener('click', () => {
        loadUbicacionesData();
    });

    // Search input
    const searchInput = document.getElementById('search-ubicaciones');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterUbicaciones(e.target.value);
        }, 300);
    });

    // Form submission
    document.getElementById('ubicacion-form').addEventListener('submit', handleUbicacionSubmit);
}

// Load ubicaciones data
async function loadUbicacionesData() {
    try {
        const ubicaciones = filterData(app.data, 'ubicacion');
        renderUbicacionesGrid(ubicaciones);
        
    } catch (error) {
        console.error('Error loading ubicaciones:', error);
        showToast('Error cargando ubicaciones: ' + error.message, 'error');
    }
}

// Render ubicaciones grid
function renderUbicacionesGrid(ubicaciones) {
    const grid = document.getElementById('ubicaciones-grid');
    const emptyState = document.getElementById('ubicaciones-empty');
    
    if (ubicaciones.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = ubicaciones.map(ubicacion => `
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-lg">📍</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Ubicación</dt>
                            <dd class="text-lg font-medium text-gray-900">${ubicacion.nombre}</dd>
                        </dl>
                    </div>
                </div>
                ${ubicacion.descripcion ? `
                    <div class="mt-4">
                        <p class="text-sm text-gray-600">${ubicacion.descripcion}</p>
                    </div>
                ` : ''}
                <div class="mt-4 flex justify-between">
                    <button onclick="editUbicacion('${ubicacion.id}')" 
                            class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="deleteUbicacion('${ubicacion.id}')" 
                            class="text-red-600 hover:text-red-900 text-sm font-medium">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter ubicaciones
function filterUbicaciones(searchTerm) {
    const ubicaciones = filterData(app.data, 'ubicacion', searchTerm);
    renderUbicacionesGrid(ubicaciones);
}

// Open ubicacion modal
function openUbicacionModal(ubicacion = null) {
    const modal = document.getElementById('ubicacion-modal');
    const title = document.getElementById('ubicacion-modal-title');
    const form = document.getElementById('ubicacion-form');
    
    // Reset form
    form.reset();
    
    if (ubicacion) {
        title.textContent = 'Editar Ubicación';
        document.getElementById('ubicacion-id').value = ubicacion.id;
        document.getElementById('ubicacion-nombre').value = ubicacion.nombre;
        document.getElementById('ubicacion-descripcion').value = ubicacion.descripcion || '';
    } else {
        title.textContent = 'Agregar Ubicación';
        document.getElementById('ubicacion-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Close ubicacion modal
function closeUbicacionModal() {
    document.getElementById('ubicacion-modal').style.display = 'none';
}

// Handle ubicacion form submission
async function handleUbicacionSubmit(e) {
    e.preventDefault();
    
    try {
        const ubicacionData = {
            nombre: document.getElementById('ubicacion-nombre').value,
            descripcion: document.getElementById('ubicacion-descripcion').value
        };
        
        const ubicacionId = document.getElementById('ubicacion-id').value;
        
        let result;
        if (ubicacionId) {
            // Update existing ubicacion
            ubicacionData.id = ubicacionId;
            ubicacionData.tipo = 'ubicacion';
            result = await app.sdk.update(ubicacionData);
        } else {
            // Create new ubicacion
            ubicacionData.tipo = 'ubicacion';
            result = await app.sdk.create(ubicacionData);
        }
        
        if (result.isOk) {
            closeUbicacionModal();
            showToast(
                ubicacionId ? 'Ubicación actualizada correctamente' : 'Ubicación creada correctamente',
                'success'
            );
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving ubicacion:', error);
        showToast('Error guardando ubicación: ' + error.message, 'error');
    }
}

// Edit ubicacion
function editUbicacion(ubicacionId) {
    const ubicacion = app.data.find(item => item.id === ubicacionId && item.tipo === 'ubicacion');
    if (ubicacion) {
        openUbicacionModal(ubicacion);
    }
}

// Delete ubicacion
async function deleteUbicacion(ubicacionId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
        return;
    }
    
    try {
        const result = await app.sdk.delete({
            id: ubicacionId,
            tipo: 'ubicacion'
        });
        
        if (result.isOk) {
            showToast('Ubicación eliminada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting ubicacion:', error);
        showToast('Error eliminando ubicación: ' + error.message, 'error');
    }
}