import { useState } from 'react';
import { useVariants, useProducts } from '../hooks/useInventory';

const ProductVariants = ({ onBack }) => {
  const { variants, addVariant, updateVariant, deleteVariant } = useVariants();
  const { products } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    sku: '',
    price: '',
    stock: '',
    attributes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : 0,
      stock: formData.stock ? parseInt(formData.stock) : 0
    };
    if (editingVariant) {
      updateVariant(editingVariant.id, data);
    } else {
      addVariant(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      sku: '',
      price: '',
      stock: '',
      attributes: ''
    });
    setIsFormOpen(false);
    setEditingVariant(null);
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId || '',
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price || '',
      stock: variant.stock || '',
      attributes: variant.attributes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta variante?')) {
      deleteVariant(id);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Sin producto';
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
          <h2 className="text-3xl font-bold text-gray-800">Variantes de Productos</h2>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Variante
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingVariant ? 'Editar Variante' : 'Nueva Variante'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Producto *
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Variante *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Talla M, Color Rojo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atributos
                </label>
                <textarea
                  value={formData.attributes}
                  onChange={(e) => setFormData({ ...formData, attributes: e.target.value })}
                  rows="2"
                  placeholder="ej: Color: Rojo, Talla: M"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingVariant ? 'Actualizar' : 'Crear'}
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

      {/* Variants List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => (
          <div key={variant.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{variant.name}</h3>
                <p className="text-sm text-blue-600">{getProductName(variant.productId)}</p>
                {variant.sku && (
                  <p className="text-xs text-gray-500">SKU: {variant.sku}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(variant)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              {variant.price > 0 && (
                <p className="text-gray-700">💰 Precio: ${variant.price.toFixed(2)}</p>
              )}
              {variant.stock !== undefined && (
                <p className="text-gray-700">📦 Stock: {variant.stock}</p>
              )}
              {variant.attributes && (
                <p className="text-gray-600 mt-2 italic">{variant.attributes}</p>
              )}
            </div>
          </div>
        ))}
        {variants.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hay variantes registradas. Crea una nueva para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariants;
