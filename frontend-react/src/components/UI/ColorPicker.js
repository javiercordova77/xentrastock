import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Palette, Edit2 } from 'lucide-react';

const ColorPicker = ({ 
  colors = [], 
  onChange, 
  className = "",
  disabled = false,
  maxColors = 10 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newColor, setNewColor] = useState({ color: '#FF0000', nombre: '', codigo_color: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const dropdownRef = useRef(null);

  // Colores predefinidos populares para colchones/almohadas
  const predefinedColors = [
    { color: '#FFFFFF', name: 'Blanco' },
    { color: '#F5F5DC', name: 'Beige' },
    { color: '#D2B48C', name: 'Café Claro' },
    { color: '#8B4513', name: 'Café' },
    { color: '#000000', name: 'Negro' },
    { color: '#808080', name: 'Gris' },
    { color: '#C0C0C0', name: 'Gris Claro' },
    { color: '#FF69B4', name: 'Rosa' },
    { color: '#0000FF', name: 'Azul' },
    { color: '#87CEEB', name: 'Azul Claro' },
    { color: '#008000', name: 'Verde' },
    { color: '#90EE90', name: 'Verde Claro' },
    { color: '#FFD700', name: 'Dorado' },
    { color: '#C0C0C0', name: 'Plateado' },
    { color: '#800080', name: 'Púrpura' },
    { color: '#FFA500', name: 'Naranja' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setEditingIndex(null);
        resetNewColor();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetNewColor = () => {
    setNewColor({ color: '#FF0000', nombre: '', codigo_color: '' });
  };

  const handleAddColor = () => {
    if (!newColor.nombre.trim()) {
      alert('El nombre del color es requerido');
      return;
    }

    if (colors.length >= maxColors) {
      alert(`Máximo ${maxColors} colores permitidos`);
      return;
    }

    const colorExists = colors.some(c => 
      c.color.toLowerCase() === newColor.color.toLowerCase() ||
      c.nombre.toLowerCase() === newColor.nombre.toLowerCase()
    );

    if (colorExists) {
      alert('Ya existe un color con ese nombre o código');
      return;
    }

    const newColorData = {
      id: Date.now(),
      ...newColor,
      codigo_color: newColor.codigo_color || newColor.color.toUpperCase(),
      activo: true
    };

    onChange([...colors, newColorData]);
    resetNewColor();
  };

  const handleEditColor = (index) => {
    setEditingIndex(index);
    setNewColor({ ...colors[index] });
  };

  const handleUpdateColor = () => {
    if (!newColor.nombre.trim()) {
      alert('El nombre del color es requerido');
      return;
    }

    const colorExists = colors.some((c, i) => 
      i !== editingIndex && (
        c.color.toLowerCase() === newColor.color.toLowerCase() ||
        c.nombre.toLowerCase() === newColor.nombre.toLowerCase()
      )
    );

    if (colorExists) {
      alert('Ya existe un color con ese nombre o código');
      return;
    }

    const updatedColors = [...colors];
    updatedColors[editingIndex] = { ...newColor };
    onChange(updatedColors);
    setEditingIndex(null);
    resetNewColor();
  };

  const handleRemoveColor = (index) => {
    if (window.confirm('¿Estás seguro de eliminar este color?')) {
      const updatedColors = colors.filter((_, i) => i !== index);
      onChange(updatedColors);
    }
  };

  const handlePredefinedColorSelect = (predefined) => {
    setNewColor(prev => ({
      ...prev,
      color: predefined.color,
      nombre: prev.nombre || predefined.name,
      codigo_color: prev.codigo_color || predefined.color.toUpperCase()
    }));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Colores de la Variante ({colors.length}/{maxColors})
      </label>
      
      {/* Colores seleccionados */}
      <div className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3">
        {colors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {colors.map((color, index) => (
              <div
                key={color.id || index}
                className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: color.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {color.nombre}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {color.codigo_color || color.color}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => handleEditColor(index)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    disabled={disabled}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={disabled}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Palette className="w-8 h-8 mb-2" />
            <p className="text-sm">No hay colores seleccionados</p>
            <p className="text-xs">Haz clic en "Agregar Color" para comenzar</p>
          </div>
        )}
      </div>

      {/* Botón para agregar/editar */}
      {!disabled && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="w-4 h-4" />
          <span>{editingIndex !== null ? 'Editando Color' : 'Agregar Color'}</span>
        </button>
      )}

      {/* Panel de agregar/editar color */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingIndex !== null ? 'Editar Color' : 'Nuevo Color'}
              </label>
            </div>

            {/* Selector de color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newColor.color}
                    onChange={(e) => setNewColor(prev => ({ 
                      ...prev, 
                      color: e.target.value,
                      codigo_color: prev.codigo_color || e.target.value.toUpperCase()
                    }))}
                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColor.color}
                    onChange={(e) => setNewColor(prev => ({ 
                      ...prev, 
                      color: e.target.value,
                      codigo_color: prev.codigo_color || e.target.value.toUpperCase()
                    }))}
                    placeholder="#FF0000"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={newColor.codigo_color}
                  onChange={(e) => setNewColor(prev => ({ ...prev, codigo_color: e.target.value }))}
                  placeholder="Ej: BLK, WHT, RD"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Nombre del color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre del Color *
              </label>
              <input
                type="text"
                value={newColor.nombre}
                onChange={(e) => setNewColor(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Blanco Perla, Azul Marino"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Colores predefinidos */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Colores Populares
              </label>
              <div className="grid grid-cols-8 gap-1">
                {predefinedColors.map((predefined, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePredefinedColorSelect(predefined)}
                    className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: predefined.color }}
                    title={predefined.name}
                  />
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setEditingIndex(null);
                  resetNewColor();
                }}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={editingIndex !== null ? handleUpdateColor : handleAddColor}
                className="px-3 py-1 text-sm text-white bg-primary-600 rounded hover:bg-primary-700"
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;