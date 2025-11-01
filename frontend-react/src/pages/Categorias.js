import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import { categoriasService } from '../services/api';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });

  // Cargar categorías desde la API
  useEffect(() => {
    let mounted = true;
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const res = await categoriasService.getAll();
        if (!mounted) return;
        const data = res.data?.data || [];
        setCategorias(data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategorias();

    return () => { mounted = false; };
  }, []);

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const submit = async () => {
      try {
        if (editingCategoria) {
          const res = await categoriasService.update(editingCategoria.id, formData);
          const updated = res.data?.data;
          setCategorias(prev => prev.map(c => c.id === updated.id ? updated : c));
        } else {
          const res = await categoriasService.create(formData);
          const created = res.data?.data;
          setCategorias(prev => [...prev, created]);
        }
        resetForm();
      } catch (error) {
        console.error('Error guardando categoría:', error);
        alert('Error al guardar la categoría');
      }
    };

    submit();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true
    });
    setEditingCategoria(null);
    setShowModal(false);
  };

  const handleEdit = (categoria) => {
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activo: categoria.activo
    });
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const categoria = categorias.find(c => c.id === id);
    if (categoria.productos_count > 0) {
      alert('No se puede eliminar una categoría que tiene productos asociados.');
      return;
    }
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;
    const remove = async () => {
      try {
        await categoriasService.delete(id);
        setCategorias(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error eliminando categoría:', error);
        alert('No se pudo eliminar la categoría');
      }
    };
    remove();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600">Organiza los productos por categorías</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {filteredCategorias.length} categorías
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.map((categoria) => (
          <div key={categoria.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Tag className="w-8 h-8 text-primary-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{categoria.nombre}</h3>
                    <p className="text-sm text-gray-500">{categoria.productos_count} productos</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  categoria.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {categoria.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem]">
                {categoria.descripcion || 'Sin descripción'}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-400">
                  Creada: {categoria.created_at}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className={`${
                      categoria.productos_count > 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-900'
                    }`}
                    title={categoria.productos_count > 0 ? 'No se puede eliminar (tiene productos)' : 'Eliminar'}
                    disabled={categoria.productos_count > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategorias.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No se encontraron categorías con ese término' : 'Comienza creando tu primera categoría'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Crear Categoría
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Describe esta categoría..."
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
                        Categoría activa
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingCategoria ? 'Actualizar' : 'Crear'}
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

export default Categorias;