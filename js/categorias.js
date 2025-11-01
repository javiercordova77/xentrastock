/**
 * Módulo de Categorías para XentraStock v2.0
 */

// HTML template for categorias section
function getCategoriasHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Categorías</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Organiza tus productos en categorías para una mejor gestión.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="add-categorias" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Categoría
                    </button>
                </div>
            </div>

            <!-- Search and filters -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-categorias" class="sr-only">Buscar categorías</label>
                        <div class="relative">
                            <input type="text" id="search-categorias" placeholder="Buscar categorías..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button id="refresh-categorias" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Actualizar
                    </button>
                </div>
            </div>

            <!-- Cards Grid -->
            <div id="categorias-grid" class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <!-- Content will be loaded here -->
            </div>

            <!-- Empty state -->
            <div id="categorias-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primera categoría.</p>
                <div class="mt-6">
                    <button type="button" onclick="openCategoriaModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Categoría
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for adding/editing categoria -->
        <div id="categoria-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-md">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="categoria-modal-title" class="text-lg font-medium text-gray-900">Agregar Categoría</h2>
                    <button type="button" onclick="closeCategoriaModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="categoria-form" class="space-y-4">
                    <input type="hidden" id="categoria-id">
                    
                    <div>
                        <label for="categoria-nombre" class="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input type="text" id="categoria-nombre" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeCategoriaModal()" 
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

// Initialize categorias section
async function initCategorias() {
    setupCategoriasEventListeners();
    await loadCategoriasData();
}

// Setup event listeners for categorias
function setupCategoriasEventListeners() {
    // Add button
    document.getElementById('add-categorias').addEventListener('click', () => {
        openCategoriaModal();
    });

    // Refresh button
    document.getElementById('refresh-categorias').addEventListener('click', () => {
        loadCategoriasData();
    });

    // Search input
    const searchInput = document.getElementById('search-categorias');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterCategorias(e.target.value);
        }, 300);
    });

    // Form submission
    document.getElementById('categoria-form').addEventListener('submit', handleCategoriaSubmit);
}

// Load categorias data
async function loadCategoriasData() {
    try {
        const categorias = filterData(app.data, 'categoria');
        renderCategoriasGrid(categorias);
        
    } catch (error) {
        console.error('Error loading categorias:', error);
        showToast('Error cargando categorías: ' + error.message, 'error');
    }
}

// Render categorias grid
function renderCategoriasGrid(categorias) {
    const grid = document.getElementById('categorias-grid');
    const emptyState = document.getElementById('categorias-empty');
    
    if (categorias.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = categorias.map(categoria => `
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-medium">📂</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Categoría</dt>
                            <dd class="text-lg font-medium text-gray-900">${categoria.nombre}</dd>
                        </dl>
                    </div>
                </div>
                <div class="mt-4 flex justify-between">
                    <button onclick="editCategoria('${categoria.id}')" 
                            class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="deleteCategoria('${categoria.id}')" 
                            class="text-red-600 hover:text-red-900 text-sm font-medium">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter categorias
function filterCategorias(searchTerm) {
    const categorias = filterData(app.data, 'categoria', searchTerm);
    renderCategoriasGrid(categorias);
}

// Open categoria modal
function openCategoriaModal(categoria = null) {
    const modal = document.getElementById('categoria-modal');
    const title = document.getElementById('categoria-modal-title');
    const form = document.getElementById('categoria-form');
    
    // Reset form
    form.reset();
    
    if (categoria) {
        title.textContent = 'Editar Categoría';
        document.getElementById('categoria-id').value = categoria.id;
        document.getElementById('categoria-nombre').value = categoria.nombre;
    } else {
        title.textContent = 'Agregar Categoría';
        document.getElementById('categoria-id').value = '';
    }
    
    modal.style.display = 'flex';
}

// Close categoria modal
function closeCategoriaModal() {
    document.getElementById('categoria-modal').style.display = 'none';
}

// Handle categoria form submission
async function handleCategoriaSubmit(e) {
    e.preventDefault();
    
    try {
        const categoriaData = {
            nombre: document.getElementById('categoria-nombre').value
        };
        
        const categoriaId = document.getElementById('categoria-id').value;
        
        let result;
        if (categoriaId) {
            // Update existing categoria
            categoriaData.id = categoriaId;
            categoriaData.tipo = 'categoria';
            result = await app.sdk.update(categoriaData);
        } else {
            // Create new categoria
            categoriaData.tipo = 'categoria';
            result = await app.sdk.create(categoriaData);
        }
        
        if (result.isOk) {
            closeCategoriaModal();
            showToast(
                categoriaId ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
                'success'
            );
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving categoria:', error);
        showToast('Error guardando categoría: ' + error.message, 'error');
    }
}

// Edit categoria
function editCategoria(categoriaId) {
    const categoria = app.data.find(item => item.id === categoriaId && item.tipo === 'categoria');
    if (categoria) {
        openCategoriaModal(categoria);
    }
}

// Delete categoria
async function deleteCategoria(categoriaId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
        return;
    }
    
    try {
        const result = await app.sdk.delete({
            id: categoriaId,
            tipo: 'categoria'
        });
        
        if (result.isOk) {
            showToast('Categoría eliminada correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting categoria:', error);
        showToast('Error eliminando categoría: ' + error.message, 'error');
    }
}