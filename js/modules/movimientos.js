// Módulo Movimientos
window.movimientosModule = {
    movimientos: [],
    productos: [],
    variantes: [],
    ubicaciones: [],
    filteredVariantes: [],
    motivosDisponibles: [],
    loading: false,
    showModal: false,
    showFilters: false,
    formData: {
        tipo: 'entrada',
        id_producto: '',
        id_variante: '',
        id_ubicacion: '',
        cantidad: '',
        precio_unitario: '',
        motivo: '',
        referencia: '',
        usuario: 'Juan',
        observaciones: ''
    },

    async load() {
        const container = document.getElementById('movimientos-content');
        container.innerHTML = this.getMainHTML();
        await this.loadData();
        this.bindEvents();
        this.renderMovimientos();
    },

    getMainHTML() {
        return `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center">
                            <i class="fas fa-exchange-alt mr-3 text-blue-600"></i>
                            Movimientos de Inventario
                        </h1>
                        <p class="text-gray-600 mt-1">Gestión completa de entradas, salidas y ajustes de inventario</p>
                    </div>
                    <div class="flex space-x-3">
                        <button id="btn-refresh" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                            <i class="fas fa-sync-alt mr-2"></i>
                            Actualizar
                        </button>
                        <button id="btn-new-movimiento" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Nuevo Movimiento
                        </button>
                    </div>
                </div>

                <!-- Filtros y búsqueda -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                                <input type="text" id="search-input" placeholder="Buscar movimientos..." 
                                       class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64">
                            </div>
                            <button id="btn-toggle-filters" class="px-4 py-2 rounded-lg border transition-colors flex items-center bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                                <i class="fas fa-filter mr-2"></i>
                                Filtros
                            </button>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-500" id="count-movimientos">0 movimientos</span>
                            <button id="btn-refresh-small" class="p-2 text-gray-500 hover:text-gray-700">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Panel de filtros expandible -->
                    <div id="filters-panel" class="mt-4 pt-4 border-t border-gray-200 hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select id="filter-tipo" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Todos los tipos</option>
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                    <option value="ajuste">Ajuste</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                                <select id="filter-ubicacion" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Todas las ubicaciones</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                                <input type="date" id="filter-fecha-inicio" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                                <input type="date" id="filter-fecha-fin" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            </div>
                        </div>
                        <div class="mt-4 flex justify-end">
                            <button id="btn-clear-filters" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabla de movimientos -->
                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto / Variante</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="movimientos-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Movimientos se cargan aquí -->
                            </tbody>
                        </table>
                    </div>
                    <div id="empty-state" class="text-center py-12 hidden">
                        <i class="fas fa-exchange-alt mx-auto h-12 w-12 text-gray-400 text-4xl mb-4"></i>
                        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
                        <p class="mt-1 text-sm text-gray-500">No se encontraron movimientos con los filtros aplicados.</p>
                    </div>
                </div>

                <!-- Loading -->
                <div id="loading-state" class="flex justify-center items-center h-64 hidden">
                    <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mr-2"></i>
                    <span>Cargando movimientos...</span>
                </div>
            </div>

            <!-- Modal para nuevo movimiento -->
            <div id="modal-nuevo-movimiento" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden">
                <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900">Nuevo Movimiento de Inventario</h3>
                        <button id="btn-close-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <form id="form-movimiento" class="space-y-4">
                        <!-- Tipo de movimiento -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento *</label>
                            <div class="grid grid-cols-3 gap-3">
                                <label class="relative">
                                    <input type="radio" name="tipo" value="entrada" checked class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-green-200 bg-green-50">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-arrow-up text-green-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-green-700">Entrada</span>
                                            <span class="text-xs text-gray-500 mt-1">Ingreso de mercancía</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="tipo" value="salida" class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-arrow-down text-red-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-gray-700">Salida</span>
                                            <span class="text-xs text-gray-500 mt-1">Salida de mercancía</span>
                                        </div>
                                    </div>
                                </label>
                                <label class="relative">
                                    <input type="radio" name="tipo" value="ajuste" class="sr-only">
                                    <div class="tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300">
                                        <div class="flex flex-col items-center text-center">
                                            <i class="fas fa-sync-alt text-blue-600 text-2xl mb-2"></i>
                                            <span class="font-medium text-gray-700">Ajuste</span>
                                            <span class="text-xs text-gray-500 mt-1">Corrección de inventario</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Selección de producto y variante -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                                <select id="select-producto" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Seleccionar producto...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Variante *</label>
                                <select id="select-variante" class="w-full border border-gray-300 rounded-lg px-3 py-2" disabled>
                                    <option value="">Seleccionar variante...</option>
                                </select>
                            </div>
                        </div>

                        <!-- Ubicación y cantidad -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                                <select id="select-ubicacion" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Seleccionar ubicación...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                                <input type="number" id="input-cantidad" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Cantidad de unidades">
                            </div>
                        </div>

                        <!-- Motivo y responsable -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                                <select id="select-motivo" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Seleccionar motivo...</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
                                <input type="text" id="input-usuario" value="Juan" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Nombre del responsable">
                            </div>
                        </div>

                        <!-- Precio unitario y referencia -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label>
                                <input type="number" id="input-precio" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0.00">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                                <input type="text" id="input-referencia" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Número de factura, orden, etc.">
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                            <textarea id="input-observaciones" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Observaciones adicionales..."></textarea>
                        </div>

                        <!-- Botones -->
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" id="btn-cancel-modal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" id="btn-submit-modal" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                                <i class="fas fa-check mr-2"></i>
                                Registrar Movimiento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    async loadData() {
        this.showLoading(true);
        try {
            const [movimientosRes, productosRes, variantesRes, ubicacionesRes] = await Promise.all([
                fetch('http://localhost:3001/api/movimientos').then(r => r.json()),
                fetch('http://localhost:3001/api/productos').then(r => r.json()),
                fetch('http://localhost:3001/api/variantes').then(r => r.json()),
                fetch('http://localhost:3001/api/ubicaciones').then(r => r.json())
            ]);

            if (movimientosRes.success) this.movimientos = movimientosRes.data;
            if (productosRes.success) this.productos = productosRes.data;
            if (variantesRes.success) this.variantes = variantesRes.data;
            if (ubicacionesRes.success) this.ubicaciones = ubicacionesRes.data;

            this.populateSelects();
        } catch (error) {
            console.error('Error cargando datos:', error);
            window.app.showToast('error', 'Error', 'Error cargando datos');
        } finally {
            this.showLoading(false);
        }
    },

    populateSelects() {
        // Productos
        const selectProducto = document.getElementById('select-producto');
        selectProducto.innerHTML = '<option value="">Seleccionar producto...</option>';
        this.productos.forEach(producto => {
            selectProducto.innerHTML += `<option value="${producto.id}">${producto.descripcion}</option>`;
        });

        // Ubicaciones
        const selectUbicacion = document.getElementById('select-ubicacion');
        const filterUbicacion = document.getElementById('filter-ubicacion');
        
        selectUbicacion.innerHTML = '<option value="">Seleccionar ubicación...</option>';
        filterUbicacion.innerHTML = '<option value="">Todas las ubicaciones</option>';
        
        this.ubicaciones.forEach(ubicacion => {
            const option = `<option value="${ubicacion.id}">${ubicacion.nombre}</option>`;
            selectUbicacion.innerHTML += option;
            filterUbicacion.innerHTML += option;
        });
    },

    async loadMotivos(tipo) {
        try {
            const response = await fetch(`http://localhost:3001/api/movimientos/motivos/${tipo}`);
            const data = await response.json();
            
            if (data.success) {
                this.motivosDisponibles = data.data;
            } else {
                // Fallback a motivos estáticos
                const motivosEstaticos = {
                    entrada: ['Inventario Inicial', 'Compra', 'Devolución', 'Ajuste'],
                    salida: ['Venta', 'Devolución', 'Ajuste'],
                    ajuste: ['Ajuste Manual', 'Corrección Inventario', 'Merma', 'Daño']
                };
                this.motivosDisponibles = motivosEstaticos[tipo] || [];
            }

            const selectMotivo = document.getElementById('select-motivo');
            selectMotivo.innerHTML = '<option value="">Seleccionar motivo...</option>';
            this.motivosDisponibles.forEach(motivo => {
                selectMotivo.innerHTML += `<option value="${motivo}">${motivo}</option>`;
            });
        } catch (error) {
            console.error('Error cargando motivos:', error);
        }
    },

    renderMovimientos() {
        const tbody = document.getElementById('movimientos-tbody');
        const emptyState = document.getElementById('empty-state');
        const countSpan = document.getElementById('count-movimientos');

        if (this.movimientos.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            countSpan.textContent = '0 movimientos';
            return;
        }

        emptyState.classList.add('hidden');
        countSpan.textContent = `${this.movimientos.length} movimientos`;

        tbody.innerHTML = this.movimientos.map(movimiento => {
            const tipoIcon = this.getTipoIcon(movimiento.tipo);
            const tipoColor = this.getTipoColor(movimiento.tipo);
            const fecha = new Date(movimiento.fecha).toLocaleDateString('es-ES');
            const valor = movimiento.precio_unitario ? `$${movimiento.precio_unitario} c/u` : '';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="p-2 rounded-full ${this.getTipoBg(movimiento.tipo)} mr-3">
                                <i class="${tipoIcon} ${tipoColor}"></i>
                            </div>
                            <div>
                                <div class="text-sm font-medium ${tipoColor}">
                                    ${movimiento.tipo.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">${movimiento.producto_descripcion}</div>
                        <div class="text-sm text-gray-500">${movimiento.codigo_variante} - ${movimiento.variante_medida}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-bold ${tipoColor}">
                            ${movimiento.tipo === 'entrada' ? '+' : movimiento.tipo === 'salida' ? '-' : ''}${movimiento.cantidad} unidades
                        </div>
                        ${valor ? `<div class="text-xs text-gray-500">${valor}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                            ${movimiento.ubicacion_nombre}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ${movimiento.motivo}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-user text-gray-400 mr-1"></i>
                            ${movimiento.usuario}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center text-sm text-gray-900">
                            <i class="fas fa-calendar text-gray-400 mr-1"></i>
                            ${fecha}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 flex items-center" onclick="window.movimientosModule.verDetalles(${movimiento.id})">
                            <i class="fas fa-eye mr-1"></i>
                            Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    getTipoIcon(tipo) {
        const icons = {
            entrada: 'fas fa-arrow-up',
            salida: 'fas fa-arrow-down',
            ajuste: 'fas fa-sync-alt'
        };
        return icons[tipo] || 'fas fa-exchange-alt';
    },

    getTipoColor(tipo) {
        const colors = {
            entrada: 'text-green-600',
            salida: 'text-red-600',
            ajuste: 'text-blue-600'
        };
        return colors[tipo] || 'text-gray-600';
    },

    getTipoBg(tipo) {
        const backgrounds = {
            entrada: 'bg-green-100',
            salida: 'bg-red-100',
            ajuste: 'bg-blue-100'
        };
        return backgrounds[tipo] || 'bg-gray-100';
    },

    showLoading(show) {
        const loading = document.getElementById('loading-state');
        const table = document.querySelector('.bg-white.rounded-lg.shadow.overflow-hidden');
        
        if (show) {
            loading.classList.remove('hidden');
            if (table) table.style.display = 'none';
        } else {
            loading.classList.add('hidden');
            if (table) table.style.display = 'block';
        }
    },

    bindEvents() {
        // Botón nuevo movimiento
        document.getElementById('btn-new-movimiento').addEventListener('click', () => {
            this.showModal = true;
            document.getElementById('modal-nuevo-movimiento').classList.remove('hidden');
        });

        // Cerrar modal
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('btn-cancel-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Toggle filtros
        document.getElementById('btn-toggle-filters').addEventListener('click', () => {
            const panel = document.getElementById('filters-panel');
            panel.classList.toggle('hidden');
        });

        // Refrescar
        document.getElementById('btn-refresh').addEventListener('click', () => {
            this.loadData().then(() => this.renderMovimientos());
        });

        // Tipo de movimiento en modal
        document.querySelectorAll('input[name="tipo"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateTipoSelection(e.target.value);
                this.loadMotivos(e.target.value);
            });
        });

        // Producto cambia -> actualizar variantes
        document.getElementById('select-producto').addEventListener('change', (e) => {
            this.updateVariantes(e.target.value);
        });

        // Submit formulario
        document.getElementById('form-movimiento').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMovimiento();
        });

        // Búsqueda
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filtrarMovimientos();
        });

        // Filtros
        document.getElementById('filter-tipo').addEventListener('change', () => this.filtrarMovimientos());
        document.getElementById('filter-ubicacion').addEventListener('change', () => this.filtrarMovimientos());
        document.getElementById('filter-fecha-inicio').addEventListener('change', () => this.filtrarMovimientos());
        document.getElementById('filter-fecha-fin').addEventListener('change', () => this.filtrarMovimientos());

        // Limpiar filtros
        document.getElementById('btn-clear-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('filter-tipo').value = '';
            document.getElementById('filter-ubicacion').value = '';
            document.getElementById('filter-fecha-inicio').value = '';
            document.getElementById('filter-fecha-fin').value = '';
            this.filtrarMovimientos();
        });
    },

    updateTipoSelection(tipo) {
        document.querySelectorAll('.tipo-card').forEach(card => {
            card.className = 'tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all border-gray-200 bg-white hover:border-gray-300';
        });

        const selectedCard = document.querySelector(`input[value="${tipo}"]`).nextElementSibling;
        const colors = {
            entrada: 'border-green-200 bg-green-50',
            salida: 'border-red-200 bg-red-50',
            ajuste: 'border-blue-200 bg-blue-50'
        };
        
        selectedCard.className = `tipo-card border-2 rounded-lg p-4 cursor-pointer transition-all ${colors[tipo]}`;
    },

    updateVariantes(productoId) {
        const selectVariante = document.getElementById('select-variante');
        selectVariante.innerHTML = '<option value="">Seleccionar variante...</option>';
        
        if (productoId) {
            const variantesDelProducto = this.variantes.filter(v => v.id_producto == productoId);
            variantesDelProducto.forEach(variante => {
                selectVariante.innerHTML += `<option value="${variante.id}">${variante.codigo_variante} - ${variante.medida}</option>`;
            });
            selectVariante.disabled = false;
        } else {
            selectVariante.disabled = true;
        }
    },

    async submitMovimiento() {
        const submitBtn = document.getElementById('btn-submit-modal');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
            submitBtn.disabled = true;

            const formData = {
                tipo: document.querySelector('input[name="tipo"]:checked').value,
                id_variante: document.getElementById('select-variante').value,
                id_ubicacion: document.getElementById('select-ubicacion').value,
                cantidad: document.getElementById('input-cantidad').value,
                precio_unitario: document.getElementById('input-precio').value || null,
                motivo: document.getElementById('select-motivo').value,
                referencia: document.getElementById('input-referencia').value,
                usuario: document.getElementById('input-usuario').value,
                observaciones: document.getElementById('input-observaciones').value
            };

            // Validaciones básicas
            if (!formData.id_variante || !formData.id_ubicacion || !formData.cantidad || !formData.motivo || !formData.usuario) {
                window.app.showToast('error', 'Error', 'Por favor completa todos los campos requeridos');
                return;
            }

            const response = await fetch('http://localhost:3001/api/movimientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                window.app.showToast('success', 'Éxito', result.message || 'Movimiento registrado correctamente');
                this.closeModal();
                this.resetForm();
                await this.loadData();
                this.renderMovimientos();
            } else {
                window.app.showToast('error', 'Error', result.message || 'Error al registrar movimiento');
            }
        } catch (error) {
            console.error('Error:', error);
            window.app.showToast('error', 'Error', 'Error al conectar con el servidor');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    closeModal() {
        this.showModal = false;
        document.getElementById('modal-nuevo-movimiento').classList.add('hidden');
    },

    resetForm() {
        document.getElementById('form-movimiento').reset();
        document.querySelector('input[value="entrada"]').checked = true;
        this.updateTipoSelection('entrada');
        this.loadMotivos('entrada');
        document.getElementById('select-variante').disabled = true;
        document.getElementById('input-usuario').value = 'Juan';
    },

    filtrarMovimientos() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const tipoFilter = document.getElementById('filter-tipo').value;
        const ubicacionFilter = document.getElementById('filter-ubicacion').value;
        const fechaInicio = document.getElementById('filter-fecha-inicio').value;
        const fechaFin = document.getElementById('filter-fecha-fin').value;

        let movimientosFiltrados = [...this.movimientos];

        if (searchTerm) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                m.producto_descripcion.toLowerCase().includes(searchTerm) ||
                m.codigo_variante.toLowerCase().includes(searchTerm) ||
                m.ubicacion_nombre.toLowerCase().includes(searchTerm) ||
                m.motivo.toLowerCase().includes(searchTerm) ||
                m.usuario.toLowerCase().includes(searchTerm)
            );
        }

        if (tipoFilter) {
            movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === tipoFilter);
        }

        if (ubicacionFilter) {
            movimientosFiltrados = movimientosFiltrados.filter(m => m.id_ubicacion == ubicacionFilter);
        }

        if (fechaInicio) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                new Date(m.fecha) >= new Date(fechaInicio)
            );
        }

        if (fechaFin) {
            movimientosFiltrados = movimientosFiltrados.filter(m => 
                new Date(m.fecha) <= new Date(fechaFin + 'T23:59:59')
            );
        }

        // Actualizar vista con movimientos filtrados
        const movimientosOriginales = [...this.movimientos];
        this.movimientos = movimientosFiltrados;
        this.renderMovimientos();
        this.movimientos = movimientosOriginales; // Restaurar originales
    },

    verDetalles(id) {
        const movimiento = this.movimientos.find(m => m.id === id);
        if (movimiento) {
            const fecha = new Date(movimiento.fecha).toLocaleString('es-ES');
            const valor = movimiento.precio_unitario ? `$${movimiento.precio_unitario}` : 'No especificado';
            const total = movimiento.valor_total ? `$${movimiento.valor_total}` : 'No calculado';

            window.app.showModal('Detalles del Movimiento', `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>ID:</strong> ${movimiento.id}</div>
                        <div><strong>Tipo:</strong> <span class="${this.getTipoColor(movimiento.tipo)}">${movimiento.tipo.toUpperCase()}</span></div>
                        <div><strong>Producto:</strong> ${movimiento.producto_descripcion}</div>
                        <div><strong>Variante:</strong> ${movimiento.codigo_variante} - ${movimiento.variante_medida}</div>
                        <div><strong>Cantidad:</strong> ${movimiento.cantidad} unidades</div>
                        <div><strong>Ubicación:</strong> ${movimiento.ubicacion_nombre}</div>
                        <div><strong>Motivo:</strong> ${movimiento.motivo}</div>
                        <div><strong>Responsable:</strong> ${movimiento.usuario}</div>
                        <div><strong>Precio Unitario:</strong> ${valor}</div>
                        <div><strong>Valor Total:</strong> ${total}</div>
                        <div><strong>Referencia:</strong> ${movimiento.referencia || 'No especificada'}</div>
                        <div><strong>Fecha:</strong> ${fecha}</div>
                    </div>
                </div>
            `);
        }
    }
};