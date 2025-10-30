import { useState } from 'react';
import { useLocations } from '../hooks/useInventory';

const Locations = ({ onBack }) => {
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : 0
    };
    if (editingLocation) {
      updateLocation(editingLocation.id, data);
    } else {
      addLocation(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', capacity: '', notes: '' });
    setIsFormOpen(false);
    setEditingLocation(null);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      capacity: location.capacity || '',
      notes: location.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta ubicación?')) {
      deleteLocation(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Volver
          </button>
          <h2 className="text-3xl font-bold text-gray-800">Ubicaciones</h2>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Ubicación
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingLocation ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-800">{location.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
            {location.address && (
              <p className="text-sm text-gray-600">📍 {location.address}</p>
            )}
            {location.capacity && (
              <p className="text-sm text-gray-600">📦 Capacidad: {location.capacity}</p>
            )}
            {location.notes && (
              <p className="text-sm text-gray-500 mt-2 italic">{location.notes}</p>
            )}
          </div>
        ))}
        {locations.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay ubicaciones registradas. Crea una nueva para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;
