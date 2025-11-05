// Módulo Dashboard
window.dashboardModule = {
    data: {
        stats: {
            totalProducts: 0,
            totalVariants: 0,
            totalStock: 0,
            lowStockItems: 0,
            totalLocations: 0,
            totalProviders: 0,
            pendingTransfers: 0,
            totalValue: 0
        },
        charts: {
            stockByLocation: null,
            movementsChart: null,
            categoryChart: null
        },
        recentMovements: [],
        lowStockAlerts: [],
        pendingTransfers: []
    },

    async load() {
        const container = document.getElementById('dashboard-content');
        container.innerHTML = this.getTemplate();
        
        // Cargar datos
        await this.loadData();
        
        // Inicializar gráficos
        this.initCharts();
        
        // Actualizar cada 30 segundos
        this.startAutoRefresh();
    },

    async loadData() {
        try {
            // Cargar estadísticas generales
            await Promise.all([
                this.loadStats(),
                this.loadRecentMovements(),
                this.loadLowStockAlerts(),
                this.loadPendingTransfers()
            ]);
            
            this.updateUI();
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            window.app.showToast('error', 'Error', 'No se pudieron cargar los datos del dashboard');
        }
    },

    async loadStats() {
        try {
            // Productos totales
            const products = await window.app.apiRequest('/api/productos');
            this.data.stats.totalProducts = products?.data?.length || 0;

            // Variantes totales
            const variants = await window.app.apiRequest('/api/variantes');
            this.data.stats.totalVariants = variants?.data?.length || 0;

            // Stock total y valor
            const inventory = await window.app.apiRequest('/api/inventario');
            if (inventory.success && inventory.data) {
                this.data.stats.totalStock = inventory.data.reduce((sum, item) => sum + (item.stock_total || 0), 0);
                this.data.stats.totalValue = inventory.data.reduce((sum, item) => sum + ((item.stock_total || 0) * (item.precio_venta || 0)), 0);
                this.data.stats.lowStockItems = inventory.data.filter(item => 
                    item.ubicaciones && item.ubicaciones.some(ub => ub.stock_disponible <= ub.stock_minimo)
                ).length;
            }

            // Ubicaciones
            const locations = await window.app.apiRequest('/api/ubicaciones');
            this.data.stats.totalLocations = locations?.data?.length || 0;

            // Proveedores
            const providers = await window.app.apiRequest('/api/proveedores');
            this.data.stats.totalProviders = providers?.data?.length || 0;

            // Transferencias pendientes (simulated for now)
            this.data.stats.pendingTransfers = 2;

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    },

    async loadRecentMovements() {
        try {
            const movements = await window.app.apiRequest('/api/movimientos?limit=10');
            this.data.recentMovements = movements?.data || [];
        } catch (error) {
            console.error('Error cargando movimientos recientes:', error);
            this.data.recentMovements = [];
        }
    },

    async loadLowStockAlerts() {
        try {
            const inventory = await window.app.apiRequest('/api/inventario');
            if (inventory.success && inventory.data) {
                this.data.lowStockAlerts = inventory.data
                    .filter(item => {
                        // Filtrar items con stock bajo
                        return item.ubicaciones && item.ubicaciones.some(ub => 
                            ub.stock_disponible <= ub.stock_minimo
                        );
                    })
                    .slice(0, 5)
                    .map(item => ({
                        id: item.variante_id,
                        name: item.producto_descripcion || 'Producto sin nombre',
                        variant: item.codigo_variante || 'Sin variante',
                        stock: item.stock_total || 0,
                        location: item.ubicaciones?.map(ub => ub.ubicacion_nombre).join(', ') || 'Sin ubicación'
                    }));
            } else {
                this.data.lowStockAlerts = [];
            }
        } catch (error) {
            console.error('Error cargando alertas de stock:', error);
            this.data.lowStockAlerts = [];
        }
    },

    async loadPendingTransfers() {
        // Simulated data for now
        this.data.pendingTransfers = [
            {
                id: 1,
                code: 'TRF-001',
                from: 'Almacén Principal',
                to: 'Tienda Centro',
                items: 5,
                status: 'Pendiente'
            },
            {
                id: 2,
                code: 'TRF-002',
                from: 'Tienda Norte',
                to: 'Almacén Principal',
                items: 3,
                status: 'En Proceso'
            }
        ];
    },

    updateUI() {
        // Actualizar estadísticas
        document.getElementById('total-products').textContent = window.utils.formatNumber(this.data.stats.totalProducts);
        document.getElementById('total-variants').textContent = window.utils.formatNumber(this.data.stats.totalVariants);
        document.getElementById('total-stock').textContent = window.utils.formatNumber(this.data.stats.totalStock);
        document.getElementById('low-stock-count').textContent = window.utils.formatNumber(this.data.stats.lowStockItems);
        document.getElementById('total-locations').textContent = window.utils.formatNumber(this.data.stats.totalLocations);
        document.getElementById('total-providers').textContent = window.utils.formatNumber(this.data.stats.totalProviders);
        document.getElementById('pending-transfers').textContent = window.utils.formatNumber(this.data.stats.pendingTransfers);
        document.getElementById('total-value').textContent = window.utils.formatCurrency(this.data.stats.totalValue);

        // Actualizar alertas de stock bajo
        this.updateLowStockAlerts();
        
        // Actualizar transferencias pendientes
        this.updatePendingTransfers();
        
        // Actualizar movimientos recientes
        this.updateRecentMovements();
    },

    updateLowStockAlerts() {
        const container = document.getElementById('low-stock-alerts');
        if (!container) return;

        if (this.data.lowStockAlerts.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay alertas de stock bajo</p>';
            return;
        }

        container.innerHTML = this.data.lowStockAlerts.map(alert => `
            <div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${alert.name}</p>
                    <p class="text-sm text-gray-600">${alert.variant} - ${alert.location}</p>
                </div>
                <div class="text-right">
                    <span class="text-sm font-medium text-red-600">${alert.stock} unidades</span>
                </div>
            </div>
        `).join('');
    },

    updatePendingTransfers() {
        const container = document.getElementById('pending-transfers-list');
        if (!container) return;

        if (this.data.pendingTransfers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay transferencias pendientes</p>';
            return;
        }

        container.innerHTML = this.data.pendingTransfers.map(transfer => `
            <div class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${transfer.code}</p>
                    <p class="text-sm text-gray-600">${transfer.from} → ${transfer.to}</p>
                </div>
                <div class="text-right">
                    <span class="text-sm font-medium text-blue-600">${transfer.items} items</span>
                    <p class="text-xs text-gray-500">${transfer.status}</p>
                </div>
            </div>
        `).join('');
    },

    updateRecentMovements() {
        const container = document.getElementById('recent-movements');
        if (!container) return;

        if (this.data.recentMovements.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay movimientos recientes</p>';
            return;
        }

        container.innerHTML = this.data.recentMovements.slice(0, 8).map(movement => `
            <div class="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                        movement.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }">
                        <i class="fas ${movement.tipo === 'entrada' ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${movement.producto || 'Producto'}</p>
                        <p class="text-sm text-gray-600">${movement.ubicacion || 'Ubicación'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-sm font-medium ${
                        movement.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }">
                        ${movement.tipo === 'entrada' ? '+' : '-'}${movement.cantidad || 0}
                    </span>
                    <p class="text-xs text-gray-500">${window.utils.formatDate(movement.fecha)}</p>
                </div>
            </div>
        `).join('');
    },

    initCharts() {
        // Inicializar después de un pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            this.initStockByLocationChart();
            this.initMovementsChart();
            this.initCategoryChart();
        }, 100);
    },

    initStockByLocationChart() {
        const ctx = document.getElementById('stockByLocationChart');
        if (!ctx) return;

        this.data.charts.stockByLocation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Almacén Principal', 'Tienda Centro', 'Tienda Norte', 'Bodega Sur'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    },

    initMovementsChart() {
        const ctx = document.getElementById('movementsChart');
        if (!ctx) return;

        this.data.charts.movementsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Entradas',
                    data: [120, 190, 300, 500, 200, 300],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }, {
                    label: 'Salidas',
                    data: [80, 150, 200, 400, 150, 250],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        this.data.charts.categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Colchones', 'Almohadas', 'Protectores', 'Accesorios', 'Otros'],
                datasets: [{
                    label: 'Productos por Categoría',
                    data: [65, 28, 15, 12, 8],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    startAutoRefresh() {
        // Refrescar datos cada 30 segundos
        setInterval(() => {
            this.loadData();
        }, 30000);
    },

    getTemplate() {
        return `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Products -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover-lift">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Productos</p>
                            <p class="text-3xl font-bold text-gray-900" id="total-products">0</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-box text-blue-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Variants -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover-lift">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Total Variantes</p>
                            <p class="text-3xl font-bold text-gray-900" id="total-variants">0</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-palette text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Stock -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover-lift">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Stock Total</p>
                            <p class="text-3xl font-bold text-gray-900" id="total-stock">0</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-warehouse text-yellow-600 text-xl"></i>
                        </div>
                    </div>
                </div>

                <!-- Low Stock -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover-lift">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
                            <p class="text-3xl font-bold text-red-600" id="low-stock-count">0</p>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Secondary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Locations -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Ubicaciones</p>
                            <p class="text-2xl font-bold text-gray-900" id="total-locations">0</p>
                        </div>
                        <i class="fas fa-map-marker-alt text-gray-400 text-lg"></i>
                    </div>
                </div>

                <!-- Total Providers -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Proveedores</p>
                            <p class="text-2xl font-bold text-gray-900" id="total-providers">0</p>
                        </div>
                        <i class="fas fa-truck text-gray-400 text-lg"></i>
                    </div>
                </div>

                <!-- Pending Transfers -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Transferencias</p>
                            <p class="text-2xl font-bold text-blue-600" id="pending-transfers">0</p>
                        </div>
                        <i class="fas fa-shipping-fast text-gray-400 text-lg"></i>
                    </div>
                </div>

                <!-- Total Value -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Valor Total</p>
                            <p class="text-xl font-bold text-green-600" id="total-value">$0</p>
                        </div>
                        <i class="fas fa-dollar-sign text-gray-400 text-lg"></i>
                    </div>
                </div>
            </div>

            <!-- Charts and Tables Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                <!-- Stock by Location Chart -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Stock por Ubicación</h3>
                    <div class="h-64">
                        <canvas id="stockByLocationChart"></canvas>
                    </div>
                </div>

                <!-- Movements Chart -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Movimientos Mensuales</h3>
                    <div class="h-64">
                        <canvas id="movementsChart"></canvas>
                    </div>
                </div>

                <!-- Category Chart -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Productos por Categoría</h3>
                    <div class="h-64">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Quick Info Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Low Stock Alerts -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Alertas de Stock</h3>
                        <span class="text-sm text-gray-500">Últimas 5</span>
                    </div>
                    <div class="space-y-3" id="low-stock-alerts">
                        <!-- Low stock alerts will be populated here -->
                    </div>
                </div>

                <!-- Pending Transfers -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Transferencias Pendientes</h3>
                        <a href="#" class="text-sm text-blue-600 hover:text-blue-700">Ver todas</a>
                    </div>
                    <div class="space-y-3" id="pending-transfers-list">
                        <!-- Pending transfers will be populated here -->
                    </div>
                </div>

                <!-- Recent Movements -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Movimientos Recientes</h3>
                        <a href="#" class="text-sm text-blue-600 hover:text-blue-700">Ver todos</a>
                    </div>
                    <div class="space-y-1" id="recent-movements">
                        <!-- Recent movements will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }
};