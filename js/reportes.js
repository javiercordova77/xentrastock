/**
 * Módulo de Reportes para XentraStock v2.0
 */

// HTML template for reportes section
function getReportesHTML() {
    return `
        <div class="px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-xl font-semibold text-gray-900">Reportes</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Genera reportes y analiza las estadísticas de tu inventario.
                    </p>
                </div>
            </div>

            <!-- Report Cards -->
            <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Inventory Summary Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">📊</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Resumen de Inventario</dt>
                                    <dd class="text-sm text-gray-500">Estado actual del stock por ubicaciones</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="generateInventarioResumen()" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Low Stock Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">⚠️</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Stock Bajo</dt>
                                    <dd class="text-sm text-gray-500">Productos con stock por debajo del mínimo</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="generateStockBajo()" 
                                    class="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Movement History Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">📈</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Historial de Movimientos</dt>
                                    <dd class="text-sm text-gray-500">Movimientos en un período específico</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="openMovimientosReportModal()" 
                                    class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Configurar Reporte
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Inventory Valuation Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">💰</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Valoración de Inventario</dt>
                                    <dd class="text-sm text-gray-500">Valor monetario del inventario actual</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="generateValoracion()" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Products by Category Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">📂</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Productos por Categoría</dt>
                                    <dd class="text-sm text-gray-500">Distribución de productos por categorías</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="generateProductosPorCategoria()" 
                                    class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Generar Reporte
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Custom Report -->
                <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">🔧</span>
                                </div>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-lg font-medium text-gray-900">Reporte Personalizado</dt>
                                    <dd class="text-sm text-gray-500">Configura tus propios parámetros</dd>
                                </dl>
                            </div>
                        </div>
                        <div class="mt-6">
                            <button onclick="openCustomReportModal()" 
                                    class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm mobile-button">
                                Configurar Reporte
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats Dashboard -->
            <div class="mt-12">
                <h2 class="text-lg font-medium text-gray-900 mb-6">Estadísticas Rápidas</h2>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                                        <dd id="quick-stat-productos" class="text-lg font-medium text-gray-900">-</dd>
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
                                        <span class="text-white">📊</span>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Items en Stock</dt>
                                        <dd id="quick-stat-stock" class="text-lg font-medium text-gray-900">-</dd>
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
                                        <span class="text-white">💰</span>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                                        <dd id="quick-stat-valor" class="text-lg font-medium text-gray-900">-</dd>
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
                                        <span class="text-white">⚠️</span>
                                    </div>
                                </div>
                                <div class="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt class="text-sm font-medium text-gray-500 truncate">Stock Bajo</dt>
                                        <dd id="quick-stat-bajo" class="text-lg font-medium text-gray-900">-</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Report Results Area -->
            <div id="report-results" class="mt-12" style="display: none;">
                <div class="bg-white shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 id="report-title" class="text-lg font-medium text-gray-900">Resultados del Reporte</h3>
                            <div class="flex space-x-2">
                                <button id="export-report" 
                                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Exportar
                                </button>
                                <button onclick="closeReportResults()" 
                                        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                        <div id="report-content" class="overflow-x-auto">
                            <!-- Report content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal for movement history report configuration -->
        <div id="movimientos-report-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-lg">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium text-gray-900">Configurar Reporte de Movimientos</h2>
                    <button type="button" onclick="closeMovimientosReportModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <form id="movimientos-report-form" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label for="report-fecha-inicio" class="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                            <input type="date" id="report-fecha-inicio" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                        
                        <div>
                            <label for="report-fecha-fin" class="block text-sm font-medium text-gray-700">Fecha Fin</label>
                            <input type="date" id="report-fecha-fin" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                        </div>
                    </div>
                    
                    <div>
                        <label for="report-tipo-movimiento" class="block text-sm font-medium text-gray-700">Tipo de Movimiento</label>
                        <select id="report-tipo-movimiento" 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mobile-input">
                            <option value="">Todos los tipos</option>
                            <option value="ingreso">Ingresos</option>
                            <option value="salida">Salidas</option>
                            <option value="transferencia">Transferencias</option>
                            <option value="ajuste">Ajustes</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" onclick="closeMovimientosReportModal()" 
                                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md mobile-button">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md mobile-button">
                            Generar Reporte
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal for custom report configuration -->
        <div id="custom-report-modal" class="modal-overlay" style="display: none;">
            <div class="modal-content w-full max-w-lg">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium text-gray-900">Reporte Personalizado</h2>
                    <button type="button" onclick="closeCustomReportModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Función en Desarrollo</h3>
                    <p class="mt-1 text-sm text-gray-500">Los reportes personalizados estarán disponibles en una próxima versión.</p>
                    <div class="mt-6">
                        <button type="button" onclick="closeCustomReportModal()" 
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global variables
let currentReportData = null;
let currentReportType = null;

// Initialize reportes section
async function initReportes() {
    setupReportesEventListeners();
    await updateQuickStats();
}

// Setup event listeners for reportes
function setupReportesEventListeners() {
    // Movement report form
    document.getElementById('movimientos-report-form').addEventListener('submit', handleMovimientosReportSubmit);
    
    // Export report button
    document.getElementById('export-report').addEventListener('click', exportCurrentReport);
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    document.getElementById('report-fecha-inicio').value = thirtyDaysAgo;
    document.getElementById('report-fecha-fin').value = today;
}

// Update quick statistics
async function updateQuickStats() {
    try {
        const productos = filterData(app.data, 'producto');
        const inventario = filterData(app.data, 'inventario');
        
        const totalProductos = productos.length;
        const itemsEnStock = inventario.filter(item => item.cantidad > 0).length;
        
        // Calculate total value
        let valorTotal = 0;
        inventario.forEach(item => {
            const producto = productos.find(p => p.id === item.productoId);
            if (producto && producto.precioCosto) {
                valorTotal += item.cantidad * producto.precioCosto;
            }
        });
        
        // Calculate low stock items
        let stockBajo = 0;
        inventario.forEach(item => {
            const producto = productos.find(p => p.id === item.productoId);
            if (producto && producto.stockMinimo && item.cantidad <= producto.stockMinimo && item.cantidad > 0) {
                stockBajo++;
            }
        });
        
        document.getElementById('quick-stat-productos').textContent = totalProductos;
        document.getElementById('quick-stat-stock').textContent = itemsEnStock;
        document.getElementById('quick-stat-valor').textContent = `$${valorTotal.toFixed(2)}`;
        document.getElementById('quick-stat-bajo').textContent = stockBajo;
        
    } catch (error) {
        console.error('Error updating quick stats:', error);
    }
}

// Generate inventory summary report
function generateInventarioResumen() {
    try {
        const inventario = filterData(app.data, 'inventario');
        const productos = filterData(app.data, 'producto');
        const ubicaciones = filterData(app.data, 'ubicacion');
        const variantes = filterData(app.data, 'variante');
        
        const reportData = inventario.map(item => {
            const producto = productos.find(p => p.id === item.productoId);
            const ubicacion = ubicaciones.find(u => u.id === item.ubicacionId);
            const variante = variantes.find(v => v.id === item.varianteId);
            
            return {
                producto: producto ? producto.nombre : 'N/A',
                variante: variante ? variante.nombre : '',
                codigo: producto ? producto.codigo : '',
                ubicacion: ubicacion ? ubicacion.nombre : 'N/A',
                cantidad: item.cantidad,
                stockMinimo: producto ? producto.stockMinimo : 0,
                precioCosto: producto ? producto.precioCosto : 0,
                valorTotal: (producto ? producto.precioCosto : 0) * item.cantidad
            };
        });
        
        const tableHtml = generateTable(reportData, [
            { key: 'producto', label: 'Producto' },
            { key: 'variante', label: 'Variante' },
            { key: 'codigo', label: 'Código' },
            { key: 'ubicacion', label: 'Ubicación' },
            { key: 'cantidad', label: 'Stock Actual' },
            { key: 'stockMinimo', label: 'Stock Mínimo' },
            { key: 'precioCosto', label: 'Precio Costo', format: 'currency' },
            { key: 'valorTotal', label: 'Valor Total', format: 'currency' }
        ]);
        
        showReportResults('Resumen de Inventario', tableHtml);
        currentReportData = reportData;
        currentReportType = 'inventario_resumen';
        
    } catch (error) {
        console.error('Error generating inventory summary:', error);
        showToast('Error generando reporte: ' + error.message, 'error');
    }
}

// Generate low stock report
function generateStockBajo() {
    try {
        const inventario = filterData(app.data, 'inventario');
        const productos = filterData(app.data, 'producto');
        const ubicaciones = filterData(app.data, 'ubicacion');
        
        const reportData = inventario
            .filter(item => {
                const producto = productos.find(p => p.id === item.productoId);
                return producto && producto.stockMinimo && item.cantidad <= producto.stockMinimo;
            })
            .map(item => {
                const producto = productos.find(p => p.id === item.productoId);
                const ubicacion = ubicaciones.find(u => u.id === item.ubicacionId);
                
                return {
                    producto: producto.nombre,
                    codigo: producto.codigo || '',
                    ubicacion: ubicacion ? ubicacion.nombre : 'N/A',
                    stockActual: item.cantidad,
                    stockMinimo: producto.stockMinimo,
                    diferencia: item.cantidad - producto.stockMinimo,
                    estado: item.cantidad === 0 ? 'Agotado' : 'Stock Bajo'
                };
            });
        
        const tableHtml = generateTable(reportData, [
            { key: 'producto', label: 'Producto' },
            { key: 'codigo', label: 'Código' },
            { key: 'ubicacion', label: 'Ubicación' },
            { key: 'stockActual', label: 'Stock Actual' },
            { key: 'stockMinimo', label: 'Stock Mínimo' },
            { key: 'diferencia', label: 'Diferencia' },
            { key: 'estado', label: 'Estado' }
        ]);
        
        showReportResults('Productos con Stock Bajo', tableHtml);
        currentReportData = reportData;
        currentReportType = 'stock_bajo';
        
    } catch (error) {
        console.error('Error generating low stock report:', error);
        showToast('Error generando reporte: ' + error.message, 'error');
    }
}

// Generate inventory valuation report
function generateValoracion() {
    try {
        const inventario = filterData(app.data, 'inventario');
        const productos = filterData(app.data, 'producto');
        const categorias = filterData(app.data, 'categoria');
        
        const reportData = inventario
            .filter(item => item.cantidad > 0)
            .map(item => {
                const producto = productos.find(p => p.id === item.productoId);
                const categoria = categorias.find(c => c.id === producto?.categoriaId);
                
                const precioCosto = producto?.precioCosto || 0;
                const precioVenta = producto?.precioVenta || 0;
                const valorCosto = precioCosto * item.cantidad;
                const valorVenta = precioVenta * item.cantidad;
                
                return {
                    producto: producto ? producto.nombre : 'N/A',
                    categoria: categoria ? categoria.nombre : 'Sin categoría',
                    cantidad: item.cantidad,
                    precioCosto,
                    precioVenta,
                    valorCosto,
                    valorVenta,
                    margen: valorVenta - valorCosto
                };
            });
        
        const tableHtml = generateTable(reportData, [
            { key: 'producto', label: 'Producto' },
            { key: 'categoria', label: 'Categoría' },
            { key: 'cantidad', label: 'Cantidad' },
            { key: 'precioCosto', label: 'Precio Costo', format: 'currency' },
            { key: 'precioVenta', label: 'Precio Venta', format: 'currency' },
            { key: 'valorCosto', label: 'Valor Costo', format: 'currency' },
            { key: 'valorVenta', label: 'Valor Venta', format: 'currency' },
            { key: 'margen', label: 'Margen', format: 'currency' }
        ]);
        
        showReportResults('Valoración de Inventario', tableHtml);
        currentReportData = reportData;
        currentReportType = 'valoracion';
        
    } catch (error) {
        console.error('Error generating valuation report:', error);
        showToast('Error generando reporte: ' + error.message, 'error');
    }
}

// Generate products by category report
function generateProductosPorCategoria() {
    try {
        const productos = filterData(app.data, 'producto');
        const categorias = filterData(app.data, 'categoria');
        const inventario = filterData(app.data, 'inventario');
        
        const categoriaStats = {};
        
        // Initialize categories
        categorias.forEach(categoria => {
            categoriaStats[categoria.id] = {
                nombre: categoria.nombre,
                totalProductos: 0,
                productosConStock: 0,
                stockTotal: 0,
                valorTotal: 0
            };
        });
        
        // Count products by category
        productos.forEach(producto => {
            const categoriaId = producto.categoriaId || 'sin_categoria';
            
            if (!categoriaStats[categoriaId]) {
                categoriaStats[categoriaId] = {
                    nombre: 'Sin categoría',
                    totalProductos: 0,
                    productosConStock: 0,
                    stockTotal: 0,
                    valorTotal: 0
                };
            }
            
            categoriaStats[categoriaId].totalProductos++;
            
            // Check inventory for this product
            const productInventory = inventario.filter(item => item.productoId === producto.id);
            const totalStock = productInventory.reduce((sum, item) => sum + item.cantidad, 0);
            
            if (totalStock > 0) {
                categoriaStats[categoriaId].productosConStock++;
                categoriaStats[categoriaId].stockTotal += totalStock;
                categoriaStats[categoriaId].valorTotal += totalStock * (producto.precioCosto || 0);
            }
        });
        
        const reportData = Object.values(categoriaStats);
        
        const tableHtml = generateTable(reportData, [
            { key: 'nombre', label: 'Categoría' },
            { key: 'totalProductos', label: 'Total Productos' },
            { key: 'productosConStock', label: 'Con Stock' },
            { key: 'stockTotal', label: 'Stock Total' },
            { key: 'valorTotal', label: 'Valor Total', format: 'currency' }
        ]);
        
        showReportResults('Productos por Categoría', tableHtml);
        currentReportData = reportData;
        currentReportType = 'productos_categoria';
        
    } catch (error) {
        console.error('Error generating products by category report:', error);
        showToast('Error generando reporte: ' + error.message, 'error');
    }
}

// Handle movement history report form submission
function handleMovimientosReportSubmit(e) {
    e.preventDefault();
    
    const fechaInicio = document.getElementById('report-fecha-inicio').value;
    const fechaFin = document.getElementById('report-fecha-fin').value;
    const tipoMovimiento = document.getElementById('report-tipo-movimiento').value;
    
    if (!fechaInicio || !fechaFin) {
        showToast('Por favor selecciona las fechas de inicio y fin', 'error');
        return;
    }
    
    generateMovimientosReport(fechaInicio, fechaFin, tipoMovimiento);
    closeMovimientosReportModal();
}

// Generate movement history report
function generateMovimientosReport(fechaInicio, fechaFin, tipoMovimiento) {
    try {
        const movimientos = filterData(app.data, 'movimiento');
        const productos = filterData(app.data, 'producto');
        const ubicaciones = filterData(app.data, 'ubicacion');
        const variantes = filterData(app.data, 'variante');
        
        const filteredMovimientos = movimientos.filter(movimiento => {
            const fecha = new Date(movimiento.fecha);
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            
            const matchesFecha = fecha >= inicio && fecha <= fin;
            const matchesTipo = !tipoMovimiento || movimiento.tipoMovimiento === tipoMovimiento;
            
            return matchesFecha && matchesTipo;
        });
        
        const reportData = filteredMovimientos.map(movimiento => {
            const producto = productos.find(p => p.id === movimiento.productoId);
            const ubicacion = ubicaciones.find(u => u.id === movimiento.ubicacionId);
            const variante = variantes.find(v => v.id === movimiento.varianteId);
            
            return {
                fecha: formatDateTime(movimiento.fecha),
                tipo: movimiento.tipoMovimiento,
                producto: producto ? producto.nombre : 'N/A',
                variante: variante ? variante.nombre : '',
                ubicacion: ubicacion ? ubicacion.nombre : 'N/A',
                cantidad: movimiento.cantidad,
                motivo: movimiento.motivo || ''
            };
        });
        
        const tableHtml = generateTable(reportData, [
            { key: 'fecha', label: 'Fecha' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'producto', label: 'Producto' },
            { key: 'variante', label: 'Variante' },
            { key: 'ubicacion', label: 'Ubicación' },
            { key: 'cantidad', label: 'Cantidad' },
            { key: 'motivo', label: 'Motivo' }
        ]);
        
        showReportResults(`Movimientos de Inventario (${fechaInicio} - ${fechaFin})`, tableHtml);
        currentReportData = reportData;
        currentReportType = 'movimientos';
        
    } catch (error) {
        console.error('Error generating movements report:', error);
        showToast('Error generando reporte: ' + error.message, 'error');
    }
}

// Generate HTML table from data
function generateTable(data, columns) {
    if (data.length === 0) {
        return '<div class="text-center py-8 text-gray-500">No hay datos para mostrar</div>';
    }
    
    const headers = columns.map(col => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${col.label}</th>`).join('');
    
    const rows = data.map(row => {
        const cells = columns.map(col => {
            let value = row[col.key];
            
            if (col.format === 'currency' && typeof value === 'number') {
                value = `$${value.toFixed(2)}`;
            }
            
            return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${value || ''}</td>`;
        }).join('');
        
        return `<tr>${cells}</tr>`;
    }).join('');
    
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                    <tr>${headers}</tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Show report results
function showReportResults(title, content) {
    document.getElementById('report-title').textContent = title;
    document.getElementById('report-content').innerHTML = content;
    document.getElementById('report-results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('report-results').scrollIntoView({ behavior: 'smooth' });
}

// Close report results
function closeReportResults() {
    document.getElementById('report-results').style.display = 'none';
    currentReportData = null;
    currentReportType = null;
}

// Export current report
function exportCurrentReport() {
    if (!currentReportData || !currentReportType) {
        showToast('No hay reporte para exportar', 'error');
        return;
    }
    
    try {
        // Prepare CSV data based on report type
        let headers = [];
        let rows = [];
        
        switch (currentReportType) {
            case 'inventario_resumen':
                headers = ['Producto', 'Variante', 'Código', 'Ubicación', 'Stock Actual', 'Stock Mínimo', 'Precio Costo', 'Valor Total'];
                rows = currentReportData.map(item => [
                    item.producto, item.variante, item.codigo, item.ubicacion,
                    item.cantidad, item.stockMinimo, item.precioCosto, item.valorTotal
                ]);
                break;
            case 'stock_bajo':
                headers = ['Producto', 'Código', 'Ubicación', 'Stock Actual', 'Stock Mínimo', 'Diferencia', 'Estado'];
                rows = currentReportData.map(item => [
                    item.producto, item.codigo, item.ubicacion, item.stockActual,
                    item.stockMinimo, item.diferencia, item.estado
                ]);
                break;
            case 'valoracion':
                headers = ['Producto', 'Categoría', 'Cantidad', 'Precio Costo', 'Precio Venta', 'Valor Costo', 'Valor Venta', 'Margen'];
                rows = currentReportData.map(item => [
                    item.producto, item.categoria, item.cantidad, item.precioCosto,
                    item.precioVenta, item.valorCosto, item.valorVenta, item.margen
                ]);
                break;
            case 'productos_categoria':
                headers = ['Categoría', 'Total Productos', 'Con Stock', 'Stock Total', 'Valor Total'];
                rows = currentReportData.map(item => [
                    item.nombre, item.totalProductos, item.productosConStock,
                    item.stockTotal, item.valorTotal
                ]);
                break;
            case 'movimientos':
                headers = ['Fecha', 'Tipo', 'Producto', 'Variante', 'Ubicación', 'Cantidad', 'Motivo'];
                rows = currentReportData.map(item => [
                    item.fecha, item.tipo, item.producto, item.variante,
                    item.ubicacion, item.cantidad, item.motivo
                ]);
                break;
        }
        
        // Create CSV content
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_${currentReportType}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Reporte exportado correctamente', 'success');
        
    } catch (error) {
        console.error('Error exporting report:', error);
        showToast('Error exportando reporte: ' + error.message, 'error');
    }
}

// Modal functions
function openMovimientosReportModal() {
    document.getElementById('movimientos-report-modal').style.display = 'flex';
}

function closeMovimientosReportModal() {
    document.getElementById('movimientos-report-modal').style.display = 'none';
}

function openCustomReportModal() {
    document.getElementById('custom-report-modal').style.display = 'flex';
}

function closeCustomReportModal() {
    document.getElementById('custom-report-modal').style.display = 'none';
}