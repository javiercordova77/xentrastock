import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

const ProductSearchSelect = ({ 
  products = [], 
  value, 
  onChange, 
  placeholder = "Buscar producto...",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && products.length) {
      const product = products.find(p => p.id.toString() === value.toString());
      setSelectedProduct(product);
      setSearchTerm(product?.descripcion || '');
    } else {
      setSelectedProduct(null);
      setSearchTerm('');
    }
  }, [value, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!selectedProduct && searchTerm) {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedProduct, searchTerm]);

  const filteredProducts = products.filter(product =>
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.descripcion);
    setIsOpen(false);
    onChange(product.id);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen && newValue) {
      setIsOpen(true);
    }
    if (!newValue) {
      setSelectedProduct(null);
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className={`
            form-input pl-10 pr-16
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-text'}
            ${selectedProduct ? 'text-gray-900' : 'text-gray-500'}
          `}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedProduct && !disabled && (
            <button
              type="button"
              className="p-1 mr-1 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="p-1 mr-2">
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`
                  px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                  ${selectedProduct?.id === product.id ? 'bg-primary-50 border-primary-200' : ''}
                `}
                onClick={() => handleSelect(product)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.descripcion}
                      </p>
                      {selectedProduct?.id === product.id && (
                        <Check className="ml-2 h-4 w-4 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {product.categoria_nombre}
                      </span>
                      <span>{product.proveedor_nombre}</span>
                      {product.material && (
                        <span className="text-gray-400">• {product.material}</span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {product.total_variantes} variantes • Stock: {product.stock_total}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchTerm ? 'No se encontraron productos' : 'Escribe para buscar productos'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelect;