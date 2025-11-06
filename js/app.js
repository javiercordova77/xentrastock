// Configuración de la aplicación principal
function appData() {
    return {
        // Estado general
        isLoading: false,
        isMobile: false,
        isSidebarCollapsed: false,
        isMobileMenuOpen: false,
        activeModule: 'dashboard',
        
        // Toast notifications
        toast: {
            show: false,
            type: 'info',
            title: '',
            message: ''
        },
        
        // Menú de navegación
        menuItems: [
            {
                id: 'dashboard',
                name: 'Dashboard',
                icon: 'fas fa-tachometer-alt',
                badge: null
            },
            {
                id: 'proveedores',
                name: 'Proveedores',
                icon: 'fas fa-truck',
                badge: null
            },
            {
                id: 'categorias',
                name: 'Categorías',
                icon: 'fas fa-tags',
                badge: null
            },
            {
                id: 'productos',
                name: 'Productos',
                icon: 'fas fa-box',
                badge: null
            },
            {
                id: 'variantes',
                name: 'Variantes',
                icon: 'fas fa-palette',
                badge: null
            },
            {
                id: 'ubicaciones',
                name: 'Ubicaciones',
                icon: 'fas fa-map-marker-alt',
                badge: null
            },
            {
                id: 'inventario',
                name: 'Inventario',
                icon: 'fas fa-warehouse',
                badge: null
            },
            {
                id: 'movimientos',
                name: 'Movimientos',
                icon: 'fas fa-exchange-alt',
                badge: null
            },
            {
                id: 'transferencias',
                name: 'Transferencias',
                icon: 'fas fa-shipping-fast',
                badge: '2'
            },
            {
                id: 'reportes',
                name: 'Reportes',
                icon: 'fas fa-chart-bar',
                badge: null
            },
            {
                id: 'configuracion',
                name: 'Configuración',
                icon: 'fas fa-cog',
                badge: null
            }
        ],

        // Inicialización
        init() {
            this.checkMobile();
            this.loadSavedState();
            this.loadModule(this.activeModule);
            
            // Event listeners
            window.addEventListener('resize', () => {
                this.checkMobile();
            });
            
            // Prevenir cierre accidental del menú móvil
            this.$watch('isMobileMenuOpen', (value) => {
                if (this.isMobile) {
                    document.body.classList.toggle('mobile-menu-open', value);
                }
            });
        },

        // Detectar dispositivo móvil
        checkMobile() {
            this.isMobile = window.innerWidth < 768;
            if (this.isMobile) {
                this.isSidebarCollapsed = false;
                this.isMobileMenuOpen = false;
            }
        },

        // Guardar y cargar estado
        loadSavedState() {
            const savedState = localStorage.getItem('xentrastock-ui-state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.isSidebarCollapsed = state.isSidebarCollapsed || false;
                this.activeModule = state.activeModule || 'dashboard';
            }
        },

        saveState() {
            const state = {
                isSidebarCollapsed: this.isSidebarCollapsed,
                activeModule: this.activeModule
            };
            localStorage.setItem('xentrastock-ui-state', JSON.stringify(state));
        },

        // Navegación
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
            this.saveState();
        },
        
        // Toggle específico para menú móvil
        toggleMobileMenu() {
            if (this.isMobile) {
                this.isMobileMenuOpen = !this.isMobileMenuOpen;
                console.log('Mobile menu toggled:', this.isMobileMenuOpen);
            }
        },

        setActiveModule(moduleId) {
            console.log('Setting active module:', moduleId, 'isMobile:', this.isMobile);
            
            if (this.activeModule !== moduleId) {
                this.activeModule = moduleId;
                this.saveState();
                this.loadModule(moduleId);
            }
            
            // Cerrar menú móvil después de seleccionar (con pequeño delay para mejor UX)
            if (this.isMobile && this.isMobileMenuOpen) {
                setTimeout(() => {
                    this.isMobileMenuOpen = false;
                }, 150);
            }
        },

        // Cargar módulo
        async loadModule(moduleId) {
            this.showLoading();
            
            try {
                // Limpiar contenido anterior
                this.clearAllModuleContent();
                
                // Cargar el módulo específico
                switch (moduleId) {
                    case 'dashboard':
                        if (window.dashboardModule && window.dashboardModule.load) {
                            await window.dashboardModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'proveedores':
                        if (window.proveedoresModule && window.proveedoresModule.load) {
                            await window.proveedoresModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'categorias':
                        if (window.categoriasModule && window.categoriasModule.load) {
                            await window.categoriasModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'productos':
                        if (window.productosModule && window.productosModule.load) {
                            await window.productosModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'variantes':
                        if (window.variantesModule && window.variantesModule.load) {
                            await window.variantesModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'ubicaciones':
                        if (window.ubicacionesModule && window.ubicacionesModule.load) {
                            await window.ubicacionesModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'inventario':
                        if (window.inventarioModule && window.inventarioModule.load) {
                            await window.inventarioModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'movimientos':
                        if (window.movimientosModule && window.movimientosModule.load) {
                            await window.movimientosModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'transferencias':
                        if (window.transferenciasModule && window.transferenciasModule.load) {
                            await window.transferenciasModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'reportes':
                        if (window.reportesModule && window.reportesModule.load) {
                            await window.reportesModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    case 'configuracion':
                        if (window.configuracionModule && window.configuracionModule.load) {
                            await window.configuracionModule.load();
                        } else {
                            this.showModuleUnavailable(moduleId);
                        }
                        break;
                    default:
                        console.error('Módulo no encontrado:', moduleId);
                        this.showModuleUnavailable(moduleId);
                }
            } catch (error) {
                console.error('Error cargando módulo:', error);
                this.showToast('error', 'Error', 'No se pudo cargar el módulo');
            } finally {
                this.hideLoading();
            }
        },

        // Mostrar mensaje de módulo no disponible
        showModuleUnavailable(moduleId) {
            const container = document.getElementById(`${moduleId}-content`);
            if (container) {
                container.innerHTML = `
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Módulo no disponible</h3>
                        <p class="text-gray-600 mb-4">El módulo "${moduleId}" no está cargado correctamente</p>
                        <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Recargar página
                        </button>
                    </div>
                `;
            }
        },

        // Limpiar contenido de todos los módulos
        clearAllModuleContent() {
            const moduleIds = [
                'dashboard', 'proveedores', 'categorias', 'productos', 
                'variantes', 'ubicaciones', 'inventario', 'movimientos', 
                'transferencias', 'reportes', 'configuracion'
            ];
            
            moduleIds.forEach(id => {
                const container = document.getElementById(`${id}-content`);
                if (container) {
                    container.innerHTML = '';
                }
            });
        },



        // Loading state
        showLoading() {
            this.isLoading = true;
        },

        hideLoading() {
            this.isLoading = false;
        },

        // Toast notifications
        showToast(type, title, message, duration = 5000) {
            this.toast = {
                show: true,
                type: type,
                title: title,
                message: message
            };
            
            setTimeout(() => {
                this.hideToast();
            }, duration);
        },

        hideToast() {
            this.toast.show = false;
        },

        // Utilidades para módulos
        async apiRequest(endpoint, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const config = { ...defaultOptions, ...options };
            
            try {
                const response = await fetch(`http://localhost:3001${endpoint}`, config);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        // Formateo de datos
        formatCurrency(amount) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(amount);
        },

        formatDate(date) {
            return new Intl.DateTimeFormat('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        },

        formatNumber(number) {
            return new Intl.NumberFormat('es-CO').format(number);
        },

        // Validaciones
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        validatePhone(phone) {
            const re = /^[\+]?[1-9][\d]{0,15}$/;
            return re.test(phone);
        },

        // Confirmaciones
        async confirm(title, message) {
            return new Promise((resolve) => {
                if (confirm(`${title}\n\n${message}`)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }
    };
}

// Funciones globales para módulos
window.app = {
    showToast: (type, title, message, duration) => {
        const appInstance = window.Alpine.store ? Alpine.store('app') : null;
        if (appInstance && appInstance.showToast) {
            appInstance.showToast(type, title, message, duration);
        }
    },
    
    showLoading: () => {
        const appInstance = window.Alpine.store ? Alpine.store('app') : null;
        if (appInstance && appInstance.showLoading) {
            appInstance.showLoading();
        }
    },
    
    hideLoading: () => {
        const appInstance = window.Alpine.store ? Alpine.store('app') : null;
        if (appInstance && appInstance.hideLoading) {
            appInstance.hideLoading();
        }
    }
};

// Utilidades globales
window.utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    },
    
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },
    
    formatNumber: (number) => {
        return new Intl.NumberFormat('es-CO').format(number);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// API helper
window.api = {
    async request(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// Asegurar que window.app tenga acceso a las funciones principales
window.app = window.app || {};
window.app.apiRequest = window.api.request;
window.app.showToast = (type, title, message, duration) => {
    const appInstance = window.Alpine ? window.Alpine.store('app') : null;
    if (appInstance && appInstance.showToast) {
        appInstance.showToast(type, title, message, duration);
    } else {
        console.log(`Toast: ${title} - ${message}`);
    }
};