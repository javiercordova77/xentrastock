/**
 * Módulo de Productos para XentraStock v2.0
 */

// HTML template for productos section
function getProductosHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Productos</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Gestiona el catálogo de productos de tu inventario.
                    </p>
                </div>
                <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button id="add-productos" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto mobile-button">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Producto
                    </button>
                </div>
            </div>

            <!-- Filters and search -->
            <div class="mt-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex-1">
                        <label for="search-productos" class="sr-only">Buscar productos</label>
                        <div class="relative">
                            <input type="text" id="search-productos" placeholder="Buscar productos por nombre, código o descripción..." 
                                   class="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 mobile-input">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <select id="filter-categoria" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todas las categorías</option>
                        </select>
                        <select id="filter-proveedor" class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todos los proveedores</option>
                        </select>
                        <button id="refresh-productos" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mobile-button">
                            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">📦</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Total Productos</dt>
                                    <dd id="stat-total-productos" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">✅</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Activos</dt>
                                    <dd id="stat-productos-activos" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">🏷️</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Categorías</dt>
                                    <dd id="stat-categorias-usadas" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <span class="text-white">🏢</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">Proveedores</dt>
                                    <dd id="stat-proveedores-usados" class="text-lg font-medium text-gray-900">-</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products table -->
            <div class="mt-8 flex flex-col">
                <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" class="relative px-6 py-3">
                                            <span class="sr-only">Acciones</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="productos-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div id="productos-empty" class="text-center py-12" style="display: none;">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                <p class="mt-1 text-sm text-gray-500">Comienza agregando tu primer producto.</p>
                <div class="mt-6">
                    <button type="button" onclick="openProductoModal()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Agregar Producto
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal for adding/editing producto -->
        <div id="producto-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-2xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="producto-modal-title" class="text-lg font-medium text-gray-900">Agregar Producto</h2>
                    <button type="button" onclick="closeProductoModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="producto-form" class="space-y-6">
                    <input type="hidden" id="producto-id">
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="producto-nombre" class="block text-sm font-medium text-gray-700">Nombre del Producto *</label>
                            <input type="text" id="producto-nombre" required 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="producto-codigo" class="block text-sm font-medium text-gray-700">Código/SKU</label>
                            <input type="text" id="producto-codigo" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div>
                        <label for="producto-descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea id="producto-descripcion" rows="3" 
                                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="producto-categoria" class="block text-sm font-medium text-gray-700">Categoría *</label>
                            <select id="producto-categoria" required 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar categoría</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="producto-proveedor" class="block text-sm font-medium text-gray-700">Proveedor</label>
                            <select id="producto-proveedor" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="">Seleccionar proveedor</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <label for="producto-precio-costo" class="block text-sm font-medium text-gray-700">Precio de Costo</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" id="producto-precio-costo" step="0.01" min="0" 
                                       class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="producto-precio-venta" class="block text-sm font-medium text-gray-700">Precio de Venta</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" id="producto-precio-venta" step="0.01" min="0" 
                                       class="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            </div>
                        </div>
                        
                        <div>
                            <label for="producto-unidad-medida" class="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                            <select id="producto-unidad-medida" 
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                                <option value="unidad">Unidad</option>
                                <option value="kg">Kilogramo</option>
                                <option value="g">Gramo</option>
                                <option value="lb">Libra</option>
                                <option value="lt">Litro</option>
                                <option value="ml">Mililitro</option>
                                <option value="mt">Metro</option>
                                <option value="cm">Centímetro</option>
                                <option value="pz">Pieza</option>
                                <option value="caja">Caja</option>
                                <option value="paquete">Paquete</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label for="producto-stock-minimo" class="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                            <input type="number" id="producto-stock-minimo" min="0" value="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="producto-stock-maximo" class="block text-sm font-medium text-gray-700">Stock Máximo</label>
                            <input type="number" id="producto-stock-maximo" min="0" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div class="flex items-center">
                        <input id="producto-activo" type="checkbox" checked 
                               class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                        <label for="producto-activo" class="ml-2 block text-sm text-gray-900">
                            Producto activo
                        </label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeProductoModal()" 
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

// Global variables for filtering
let filteredProductos = [];

// Initialize productos section
async function initProductos() {
    setupProductosEventListeners();
    await loadProductosData();
    await loadSelectOptions();
}

// Setup event listeners for productos
function setupProductosEventListeners() {
    // Add button
    document.getElementById('add-productos').addEventListener('click', () => {
        openProductoModal();
    });

    // Refresh button
    document.getElementById('refresh-productos').addEventListener('click', () => {
        loadProductosData();
    });

    // Search input
    const searchInput = document.getElementById('search-productos');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterProductos();
        }, 300);
    });

    // Filter selects
    document.getElementById('filter-categoria').addEventListener('change', filterProductos);
    document.getElementById('filter-proveedor').addEventListener('change', filterProductos);

    // Form submission
    document.getElementById('producto-form').addEventListener('submit', handleProductoSubmit);
}

// Load productos data
async function loadProductosData() {
    try {
        const productos = filterData(app.data, 'producto');
        filteredProductos = productos;
        renderProductosTable(productos);
        updateProductosStats(productos);
        
    } catch (error) {
        console.error('Error loading productos:', error);
        showToast('Error cargando productos: ' + error.message, 'error');
    }
}

// Load select options for categories and suppliers
async function loadSelectOptions() {
    try {
        // Load categories
        const categorias = filterData(app.data, 'categoria');
        const categoriaSelects = ['producto-categoria', 'filter-categoria'];
        
        categoriaSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (selectId === 'filter-categoria') {
                select.innerHTML = '<option value="">Todas las categorías</option>';
            } else {
                select.innerHTML = '<option value="">Seleccionar categoría</option>';
            }
            
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                select.appendChild(option);
            });
        });

        // Load suppliers
        const proveedores = filterData(app.data, 'proveedor');
        const proveedorSelects = ['producto-proveedor', 'filter-proveedor'];
        
        proveedorSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (selectId === 'filter-proveedor') {
                select.innerHTML = '<option value="">Todos los proveedores</option>';
            } else {
                select.innerHTML = '<option value="">Seleccionar proveedor</option>';
            }
            
            proveedores.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id;
                option.textContent = proveedor.nombre;
                select.appendChild(option);
            });
        });
        
    } catch (error) {
        console.error('Error loading select options:', error);
    }
}

// Update productos statistics
function updateProductosStats(productos) {
    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.activo !== false).length;
    
    const categoriasUsadas = new Set();
    const proveedoresUsados = new Set();
    
    productos.forEach(producto => {
        if (producto.categoriaId) categoriasUsadas.add(producto.categoriaId);
        if (producto.proveedorId) proveedoresUsados.add(producto.proveedorId);
    });

    document.getElementById('stat-total-productos').textContent = totalProductos;
    document.getElementById('stat-productos-activos').textContent = productosActivos;
    document.getElementById('stat-categorias-usadas').textContent = categoriasUsadas.size;
    document.getElementById('stat-proveedores-usados').textContent = proveedoresUsados.size;
}

// Render productos table
function renderProductosTable(productos) {
    const tableBody = document.getElementById('productos-table-body');
    const emptyState = document.getElementById('productos-empty');
    
    if (productos.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    const categorias = filterData(app.data, 'categoria');
    const proveedores = filterData(app.data, 'proveedor');
    
    tableBody.innerHTML = productos.map(producto => {
        const categoria = categorias.find(c => c.id === producto.categoriaId);
        const proveedor = proveedores.find(p => p.id === producto.proveedorId);
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${producto.nombre}</div>
                    ${producto.descripcion ? `<div class="text-sm text-gray-500">${producto.descripcion}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.codigo || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${categoria ? categoria.nombre : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${proveedor ? proveedor.nombre : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.activo !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${producto.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="editProducto('${producto.id}')" 
                            class="text-indigo-600 hover:text-indigo-900 mr-4">
                        Editar
                    </button>
                    <button onclick="deleteProducto('${producto.id}')" 
                            class="text-red-600 hover:text-red-900">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter productos
function filterProductos() {
    const searchTerm = document.getElementById('search-productos').value.toLowerCase();
    const categoriaFilter = document.getElementById('filter-categoria').value;
    const proveedorFilter = document.getElementById('filter-proveedor').value;
    
    const productos = filterData(app.data, 'producto');
    
    const filtered = productos.filter(producto => {
        const matchesSearch = !searchTerm || 
            producto.nombre.toLowerCase().includes(searchTerm) ||
            (producto.codigo && producto.codigo.toLowerCase().includes(searchTerm)) ||
            (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm));
            
        const matchesCategoria = !categoriaFilter || producto.categoriaId === categoriaFilter;
        const matchesProveedor = !proveedorFilter || producto.proveedorId === proveedorFilter;
        
        return matchesSearch && matchesCategoria && matchesProveedor;
    });
    
    filteredProductos = filtered;
    renderProductosTable(filtered);
    updateProductosStats(filtered);
}

// Open producto modal
function openProductoModal(producto = null) {
    const modal = document.getElementById('producto-modal');
    const title = document.getElementById('producto-modal-title');
    const form = document.getElementById('producto-form');
    
    // Reset form
    form.reset();
    
    if (producto) {
        title.textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('producto-nombre').value = producto.nombre;
        document.getElementById('producto-codigo').value = producto.codigo || '';
        document.getElementById('producto-descripcion').value = producto.descripcion || '';
        document.getElementById('producto-categoria').value = producto.categoriaId || '';
        document.getElementById('producto-proveedor').value = producto.proveedorId || '';
        document.getElementById('producto-precio-costo').value = producto.precioCosto || '';
        document.getElementById('producto-precio-venta').value = producto.precioVenta || '';
        document.getElementById('producto-unidad-medida').value = producto.unidadMedida || 'unidad';
        document.getElementById('producto-stock-minimo').value = producto.stockMinimo || 0;
        document.getElementById('producto-stock-maximo').value = producto.stockMaximo || '';
        document.getElementById('producto-activo').checked = producto.activo !== false;
    } else {
        title.textContent = 'Agregar Producto';
        document.getElementById('producto-id').value = '';
        document.getElementById('producto-unidad-medida').value = 'unidad';
        document.getElementById('producto-stock-minimo').value = 0;
        document.getElementById('producto-activo').checked = true;
    }
    
    modal.style.display = 'flex';
}

// Close producto modal
function closeProductoModal() {
    document.getElementById('producto-modal').style.display = 'none';
}

// Handle producto form submission
async function handleProductoSubmit(e) {
    e.preventDefault();
    
    try {
        const productoData = {
            nombre: document.getElementById('producto-nombre').value,
            codigo: document.getElementById('producto-codigo').value || null,
            descripcion: document.getElementById('producto-descripcion').value || null,
            categoriaId: document.getElementById('producto-categoria').value || null,
            proveedorId: document.getElementById('producto-proveedor').value || null,
            precioCosto: parseFloat(document.getElementById('producto-precio-costo').value) || null,
            precioVenta: parseFloat(document.getElementById('producto-precio-venta').value) || null,
            unidadMedida: document.getElementById('producto-unidad-medida').value,
            stockMinimo: parseInt(document.getElementById('producto-stock-minimo').value) || 0,
            stockMaximo: parseInt(document.getElementById('producto-stock-maximo').value) || null,
            activo: document.getElementById('producto-activo').checked
        };
        
        const productoId = document.getElementById('producto-id').value;
        
        let result;
        if (productoId) {
            // Update existing producto
            productoData.id = productoId;
            productoData.tipo = 'producto';
            result = await app.sdk.update(productoData);
        } else {
            // Create new producto
            productoData.tipo = 'producto';
            result = await app.sdk.create(productoData);
        }
        
        if (result.isOk) {
            closeProductoModal();
            showToast(
                productoId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                'success'
            );
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error saving producto:', error);
        showToast('Error guardando producto: ' + error.message, 'error');
    }
}

// Edit producto
function editProducto(productoId) {
    const producto = app.data.find(item => item.id === productoId && item.tipo === 'producto');
    if (producto) {
        openProductoModal(producto);
    }
}

// Delete producto
async function deleteProducto(productoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }
    
    try {
        const result = await app.sdk.delete({
            id: productoId,
            tipo: 'producto'
        });
        
        if (result.isOk) {
            showToast('Producto eliminado correctamente', 'success');
        } else {
            showToast('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error deleting producto:', error);
        showToast('Error eliminando producto: ' + error.message, 'error');
    }
}