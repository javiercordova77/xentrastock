// Módulo Ubicaciones
window.ubicacionesModule = {
    async load() {
        const container = document.getElementById('ubicaciones-content');
        container.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-map-marker-alt text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Módulo de Ubicaciones</h3>
                <p class="text-gray-600 mb-4">Gestión de almacenes y ubicaciones de stock</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-sm text-blue-800">🚀 Próximamente disponible</p>
                    <p class="text-xs text-blue-600 mt-1">CRUD completo, jerarquías, capacidades, tipos</p>
                </div>
            </div>
        `;
    }
};