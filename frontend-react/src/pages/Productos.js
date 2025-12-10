import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Eye } from 'lucide-react';
import { productosService, categoriasService, proveedoresService, apiUtils } from '../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    id_categoria: '',
    id_proveedor: '',
    imagen: '',
    material: '',
    activo: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos desde la API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll(),
        proveedoresService.getAll()
      ]);
      
      setProductos(apiUtils.formatResponse(productosRes).data || []);
      setCategorias(apiUtils.formatResponse(categoriasRes).data || []);
      setProveedores(apiUtils.formatResponse(proveedoresRes).data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (producto.material && producto.material.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (producto.categoria_nombre && producto.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (producto.proveedor_nombre && producto.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategoria = !selectedCategoria || producto.id_categoria.toString() === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      let response;
      
      if (editingProducto) {
        // Actualizar producto existente
        response = await productosService.update(editingProducto.id, formData);
        const updatedProducto = apiUtils.formatResponse(response).data;
        
        setProductos(prev => prev.map(p => 
          p.id === editingProducto.id ? updatedProducto : p
        ));
        
        console.log('Producto actualizado exitosamente');
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        response = await productosService.create(formData);
        const newProducto = apiUtils.formatResponse(response).data;
        
        setProductos(prev => [...prev, newProducto]);
        
        console.log('Producto creado exitosamente');
        alert('Producto creado exitosamente');
      }
      
      resetForm();
      
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto: ' + apiUtils.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      id_categoria: '',
      id_proveedor: '',
      imagen: '',
      material: '',
      activo: true
    });
    setEditingProducto(null);
    setShowModal(false);
  };

  const handleEdit = (producto) => {
    setFormData({
      descripcion: producto.descripcion || '',
      id_categoria: producto.id_categoria.toString(),
      id_proveedor: producto.id_proveedor.toString(),
      imagen: producto.imagen || '',
      material: producto.material || '',
      activo: producto.activo
    });
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esto también eliminará todas sus variantes.')) {
      try {
        await productosService.delete(id);
        setProductos(prev => prev.filter(p => p.id !== id));
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto: ' + apiUtils.handleError(error));
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">Gestiona el catálogo de productos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-input"
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredProductos.length} productos
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProductos.map((producto) => (
          <div key={producto.id} className="card overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-primary-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{producto.descripcion}</h3>
                    <p className="text-sm text-gray-500">{producto.categoria_nombre || 'Sin categoría'}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  producto.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Material</p>
                <p className="text-sm font-medium text-gray-700">{producto.material || 'No especificado'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Variantes</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {producto.total_variantes || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stock Total</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {producto.stock_total || 0}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Proveedor: {producto.proveedor_nombre || 'Sin proveedor'}</span>
                {producto.imagen && (
                  <span className="text-green-600">Con imagen</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Creado: {producto.created_at ? new Date(producto.created_at).toLocaleDateString() : 'No disponible'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(producto)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver variantes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProductos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategoria 
              ? 'No se encontraron productos con los filtros aplicados.'
              : 'Comienza agregando tu primer producto.'}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Agregar Producto
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción del Producto *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Ej: Colchón Imperial, Almohada Memory Foam"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.material}
                        onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                        placeholder="Ej: resortes, espuma HR, látex natural"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.id_categoria}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_categoria: e.target.value }))}
                        >
                          <option value="">Seleccionar...</option>
                          {categorias.map(categoria => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proveedor *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.id_proveedor}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_proveedor: e.target.value }))}
                        >
                          <option value="">Seleccionar...</option>
                          {proveedores.map(proveedor => (
                            <option key={proveedor.id} value={proveedor.id}>
                              {proveedor.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen del Producto
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.imagen}
                        onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
                        placeholder="Ruta de la imagen (ej: productos/colchones/imagen.jpg)"
                      />
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
                        Producto activo
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`btn-primary sm:ml-3 sm:w-auto w-full ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? 'Guardando...' : (editingProducto ? 'Actualizar' : 'Crear')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary mt-3 sm:mt-0 sm:w-auto w-full"
                  >
                    Cancelar
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

export default Productos;