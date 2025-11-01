import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package2, Eye, Filter, RefreshCw } from 'lucide-react';
import { variantesService, productosService, apiUtils } from '../services/api';
import ProductSearchSelect from '../components/UI/ProductSearchSelect';
import ColorPicker from '../components/UI/ColorPicker';

function Variantes() {
  const [variantes, setVariantes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVariante, setEditingVariante] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    con_stock: '',
    activo: ''
  });
  const [formData, setFormData] = useState({
    id_producto: '',
    codigo_variante: '',
    medida: '',
    precio_venta: '',
    precio_compra: '',
    colores: [],
    activo: true
  });

  // Cargar datos desde la API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [variantesRes, productosRes] = await Promise.all([
        variantesService.getAll(),
        productosService.getAll()
      ]);
      
      setVariantes(apiUtils.formatResponse(variantesRes).data || []);
      setProductos(apiUtils.formatResponse(productosRes).data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredVariantes = variantes.filter(variante => {
    const matchesSearch = 
      (variante.codigo_variante && variante.codigo_variante.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variante.medida && variante.medida.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (variante.producto_descripcion && variante.producto_descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProducto = !selectedProducto || variante.id_producto.toString() === selectedProducto;
    const matchesStock = !filters.con_stock || 
      (filters.con_stock === 'true' && variante.stock_total > 0) ||
      (filters.con_stock === 'false' && variante.stock_total === 0);
    const matchesActivo = !filters.activo || variante.activo.toString() === filters.activo;
    
    return matchesSearch && matchesProducto && matchesStock && matchesActivo;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (editingVariante) {
        // Actualizar variante existente
        response = await variantesService.update(editingVariante.id, formData);
        const updatedVariante = apiUtils.formatResponse(response).data;
        
        setVariantes(prev => prev.map(v => 
          v.id === editingVariante.id ? updatedVariante : v
        ));
      } else {
        // Crear nueva variante
        response = await variantesService.create(formData);
        const newVariante = apiUtils.formatResponse(response).data;
        
        setVariantes(prev => [...prev, newVariante]);
      }
      
      resetForm();
      alert(`Variante ${editingVariante ? 'actualizada' : 'creada'} exitosamente`);
      
    } catch (error) {
      console.error('Error guardando variante:', error);
      alert('Error al guardar la variante: ' + apiUtils.handleError(error));
    }
  };

  const resetForm = () => {
    setFormData({
      id_producto: '',
      codigo_variante: '',
      medida: '',
      precio_venta: '',
      precio_compra: '',
      colores: [],
      activo: true
    });
    setEditingVariante(null);
    setShowModal(false);
  };

  const handleEdit = (variante) => {
    setFormData({
      id_producto: variante.id_producto.toString(),
      codigo_variante: variante.codigo_variante || '',
      medida: variante.medida || '',
      precio_venta: variante.precio_venta ? variante.precio_venta.toString() : '',
      precio_compra: variante.precio_compra ? variante.precio_compra.toString() : '',
      colores: variante.colores || [],
      activo: variante.activo
    });
    setEditingVariante(variante);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta variante? Esto también eliminará todo su stock y colores asociados.')) {
      try {
        await variantesService.delete(id);
        setVariantes(prev => prev.filter(v => v.id !== id));
        alert('Variante eliminada exitosamente');
      } catch (error) {
        console.error('Error eliminando variante:', error);
        alert('Error al eliminar la variante: ' + apiUtils.handleError(error));
      }
    }
  };

  const getStockStatus = (variante) => {
    if (variante.stock_total === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Sin Stock' };
    if (variante.stock_minimo && variante.stock_total <= variante.stock_minimo) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Bajo Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'Normal' };
  };

  const generateVariantCode = (productId) => {
    if (!productId) return '';
    
    const product = productos.find(p => p.id.toString() === productId.toString());
    if (!product) return '';
    
    // Generar código basado en producto y proveedor
    const proveedorCode = product.proveedor_nombre ? product.proveedor_nombre.substring(0, 3).toUpperCase() : 'PRD';
    const productCode = product.descripcion ? product.descripcion.substring(0, 3).toUpperCase() : 'VAR';
    const timestamp = Date.now().toString().slice(-4);
    
    return `${proveedorCode}-${productCode}-${timestamp}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="card p-6 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Variantes de Productos</h1>
          <p className="text-gray-600">Gestiona las variantes con medidas, precios y colores</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Variante
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Búsqueda principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por código, medida o producto..."
              className="form-input pl-10 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Selector de producto mejorado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Producto
                </label>
                <ProductSearchSelect
                  products={productos}
                  value={selectedProducto}
                  onChange={setSelectedProducto}
                  placeholder="Buscar producto..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <select
                  className="form-input"
                  value={filters.con_stock}
                  onChange={(e) => setFilters(prev => ({ ...prev, con_stock: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="true">Con Stock</option>
                  <option value="false">Sin Stock</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  className="form-input"
                  value={filters.activo}
                  onChange={(e) => setFilters(prev => ({ ...prev, activo: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="1">Activos</option>
                  <option value="0">Inactivos</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ con_stock: '', activo: '' });
                    setSelectedProducto('');
                    setSearchTerm('');
                  }}
                  className="btn-secondary w-full"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>Mostrando {filteredVariantes.length} de {variantes.length} variantes</span>
            {(searchTerm || selectedProducto || filters.con_stock || filters.activo) && (
              <span className="text-primary-600">Filtros aplicados</span>
            )}
          </div>
        </div>
      </div>

      {/* Table - Responsive */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código & Medida
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colores
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVariantes.map((variante) => {
                const stockStatus = getStockStatus(variante);
                return (
                  <tr key={variante.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package2 className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {variante.codigo_variante}
                          </div>
                          <div className="text-sm text-gray-500">
                            {variante.medida}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{variante.producto_descripcion}</div>
                      <div className="text-sm text-gray-500">{variante.categoria_nombre}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-green-600">
                          V: ${variante.precio_venta}
                        </div>
                        <div className="text-gray-500">
                          C: ${variante.precio_compra}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        {variante.total_colores > 0 ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {variante.total_colores}
                            </span>
                            <span className="text-xs text-gray-500">colores</span>
                            {variante.colores_disponibles && (
                              <div className="text-xs text-gray-400 truncate max-w-20" title={variante.colores_disponibles}>
                                {variante.colores_disponibles}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Sin colores</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-semibold ${stockStatus.color}`}>
                          {variante.stock_total || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {variante.stock_minimo || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          variante.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {variante.activo ? 'Activa' : 'Inactiva'}
                        </span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(variante)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variante.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredVariantes.length === 0 && (
          <div className="text-center py-12">
            <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay variantes</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedProducto || filters.con_stock || filters.activo
                ? 'No se encontraron variantes con los filtros aplicados.'
                : 'Comienza agregando tu primera variante.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Agregar Variante
            </button>
          </div>
        )}
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingVariante ? 'Editar Variante' : 'Nueva Variante'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure los detalles de la variante incluyendo medidas, precios y colores
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Datos básicos */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Información Básica</h4>
                      
                      {/* Selector de producto mejorado */}
                      <ProductSearchSelect
                        products={productos}
                        value={formData.id_producto}
                        onChange={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            id_producto: value,
                            codigo_variante: value ? generateVariantCode(value) : ''
                          }));
                        }}
                        placeholder="Buscar y seleccionar producto..."
                        className="w-full"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de Variante *
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input uppercase font-mono"
                            value={formData.codigo_variante}
                            onChange={(e) => setFormData(prev => ({ ...prev, codigo_variante: e.target.value.toUpperCase() }))}
                            placeholder="CH-IMP-135X190"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Código único que identifica esta variante
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medida/Característica *
                          </label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={formData.medida}
                            onChange={(e) => setFormData(prev => ({ ...prev, medida: e.target.value }))}
                            placeholder="135x190, 50x70, L, XL"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Medida o característica distintiva
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio de Venta *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              className="form-input pl-8"
                              value={formData.precio_venta}
                              onChange={(e) => setFormData(prev => ({ ...prev, precio_venta: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio de Compra *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              className="form-input pl-8"
                              value={formData.precio_compra}
                              onChange={(e) => setFormData(prev => ({ ...prev, precio_compra: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="activo"
                          checked={formData.activo}
                          onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                          Variante activa y disponible para venta
                        </label>
                      </div>
                    </div>

                    {/* Columna derecha - Colores */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Colores Disponibles</h4>
                      
                      <ColorPicker
                        colors={formData.colores}
                        onChange={(colors) => setFormData(prev => ({ ...prev, colores: colors }))}
                        maxColors={8}
                      />
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Consejos para Colores</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Los colores ayudan a los clientes a elegir</li>
                          <li>• Usa nombres descriptivos como "Azul Marino"</li>
                          <li>• Los códigos ayudan en inventario (BLU, WHT)</li>
                          <li>• Puedes agregar colores después si es necesario</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!formData.id_producto || !formData.codigo_variante || !formData.medida}
                  >
                    {editingVariante ? 'Actualizar Variante' : 'Crear Variante'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Variantes;