import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';
import { ubicacionesService } from '../services/api';

function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'almacen',
    activo: true
  });

  // Cargar datos reales desde la API
  useEffect(() => {
    let mounted = true;
    const fetchUbicaciones = async () => {
      try {
        setLoading(true);
        const res = await ubicacionesService.getAll();
        if (!mounted) return;
        const data = res.data?.data || [];
        setUbicaciones(data);
      } catch (error) {
        console.error('Error cargando ubicaciones:', error);
        if (mounted) {
          alert('Error al cargar las ubicaciones');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUbicaciones();
    
    return () => { mounted = false; };
  }, []);

  const tiposUbicacion = [
    { value: 'almacen', label: 'Almacén', color: 'bg-blue-100 text-blue-800' },
    { value: 'tienda', label: 'Tienda', color: 'bg-green-100 text-green-800' },
    { value: 'deposito', label: 'Depósito', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'showroom', label: 'Showroom', color: 'bg-purple-100 text-purple-800' }
  ];

  const filteredUbicaciones = ubicaciones.filter(ubicacion =>
    ubicacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ubicacion.descripcion && ubicacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica en el frontend
    if (!formData.nombre.trim()) {
      alert('El nombre de la ubicación es requerido');
      return;
    }
    
    const submit = async () => {
      try {
        console.log('Enviando datos:', formData);
        if (editingUbicacion) {
          console.log('Actualizando ubicación:', editingUbicacion.id);
          const res = await ubicacionesService.update(editingUbicacion.id, formData);
          console.log('Respuesta actualización:', res);
          const updated = res.data?.data;
          setUbicaciones(prev => prev.map(u => u.id === updated.id ? updated : u));
          alert('Ubicación actualizada exitosamente');
        } else {
          console.log('Creando nueva ubicación');
          const res = await ubicacionesService.create(formData);
          console.log('Respuesta creación:', res);
          const created = res.data?.data;
          setUbicaciones(prev => [...prev, created]);
          alert('Ubicación creada exitosamente');
        }
        resetForm();
      } catch (error) {
        console.error('Error completo:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Error al guardar la ubicación';
        
        if (error.response) {
          // Si hay errores de validación, mostrarlos específicamente
          if (error.response.data?.errors) {
            const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
            errorMessage = `Errores de validación: ${validationErrors}`;
          } else {
            errorMessage = error.response.data?.message || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    };

    submit();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'almacen',
      activo: true
    });
    setEditingUbicacion(null);
    setShowModal(false);
  };

  const handleEdit = (ubicacion) => {
    setFormData({
      nombre: ubicacion.nombre,
      descripcion: ubicacion.descripcion || '',
      tipo: ubicacion.tipo,
      activo: Boolean(ubicacion.activo)
    });
    setEditingUbicacion(ubicacion);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) return;
    
    const remove = async () => {
      try {
        await ubicacionesService.delete(id);
        setUbicaciones(prev => prev.filter(u => u.id !== id));
        alert('Ubicación eliminada exitosamente');
      } catch (error) {
        console.error('Error eliminando ubicación:', error);
        let errorMessage = 'No se pudo eliminar la ubicación';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        alert(errorMessage);
      }
    };
    
    remove();
  };

  const getTipoInfo = (tipo) => {
    return tiposUbicacion.find(t => t.value === tipo) || tiposUbicacion[tiposUbicacion.length - 1];
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
          <h1 className="text-2xl font-bold text-gray-900">Ubicaciones</h1>
          <p className="text-gray-600">Gestiona las ubicaciones de almacenamiento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Ubicación
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar ubicaciones..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600">
            Total: {filteredUbicaciones.length} ubicaciones
          </div>
        </div>
      </div>

      {/* Ubicaciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUbicaciones.map((ubicacion) => {
          const tipoInfo = getTipoInfo(ubicacion.tipo);
          return (
            <div key={ubicacion.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-primary-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ubicacion.nombre}</h3>
                      <p className="text-sm text-gray-500">ID: {ubicacion.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    ubicacion.activo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ubicacion.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tipoInfo.color}`}>
                    {tipoInfo.label}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 min-h-[2.5rem]">
                  {ubicacion.descripcion || 'Sin descripción'}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-400">
                    Creada: {new Date(ubicacion.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(ubicacion)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ubicacion.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUbicaciones.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ubicaciones</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No se encontraron ubicaciones con ese término' : 'Comienza creando tu primera ubicación'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Crear Ubicación
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
                      {editingUbicacion ? 'Editar Ubicación' : 'Nueva Ubicación'}
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
                        Tipo *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                      >
                        {tiposUbicacion.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
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
                        placeholder="Describe esta ubicación..."
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
                        Ubicación activa
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    {editingUbicacion ? 'Actualizar' : 'Crear'}
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

export default Ubicaciones;