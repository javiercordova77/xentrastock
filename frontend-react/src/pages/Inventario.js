import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search, MapPin, Edit2 } from 'lucide-react';
import ubicacionesService from '../services/ubicacionesService';
import inventarioService from '../services/inventarioService';

function Inventario() {
  const [stock, setStock] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [filterBajoStock, setFilterBajoStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [ajusteData, setAjusteData] = useState({
    cantidad: '',
    tipo: 'entrada', // entrada, salida, ajuste
    motivo: ''
  });

  // Cargar datos reales desde la API
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar ubicaciones y stock en paralelo usando los servicios
        const [ubicacionesData, stockData] = await Promise.all([
          ubicacionesService.getAll(),
          inventarioService.getAll()
        ]);
        
        if (!mounted) return;
        
        setUbicaciones(ubicacionesData);
        setStock(stockData);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (mounted) {
          // En caso de error, mantener arrays vacíos
          setUbicaciones([]);
          setStock([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const filteredStock = stock.filter(item => {
    const matchesSearch = 
      item.codigo_variante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.medida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categoria_nombre && item.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.proveedor_nombre && item.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUbicacion = !selectedUbicacion || item.ubicacion_id.toString() === selectedUbicacion;
    
    const matchesBajoStock = !filterBajoStock || item.cantidad <= 5; // Stock mínimo por defecto
    
    return matchesSearch && matchesUbicacion && matchesBajoStock;
  });

  const handleAjusteStock = (stockItem) => {
    setSelectedStock(stockItem);
    setAjusteData({
      cantidad: '',
      tipo: 'entrada',
      motivo: ''
    });
    setShowModal(true);
  };

  const handleSubmitAjuste = async (e) => {
    e.preventDefault();
    
    if (!selectedStock || !ajusteData.cantidad) return;
    
    try {
      const cantidad = parseInt(ajusteData.cantidad);
      let nuevaCantidad = selectedStock.cantidad;
      
      switch (ajusteData.tipo) {
        case 'entrada':
          nuevaCantidad += cantidad;
          break;
        case 'salida':
          nuevaCantidad = Math.max(0, nuevaCantidad - cantidad);
          break;
        case 'ajuste':
          nuevaCantidad = cantidad;
          break;
        default:
          break;
      }
      
      // Usar el servicio para hacer el ajuste
      await inventarioService.ajustarStock(
        selectedStock.variante_id,
        selectedStock.ubicacion_id,
        cantidad,
        ajusteData.tipo,
        ajusteData.motivo
      );
      
      // Actualizar el stock local
      setStock(prev => prev.map(item => 
        item.id === selectedStock.id 
          ? { 
              ...item, 
              cantidad: nuevaCantidad,
              valor_total: nuevaCantidad * item.precio_unitario,
              ultimo_movimiento: new Date().toISOString().split('T')[0]
            }
          : item
      ));
      
      setShowModal(false);
      setSelectedStock(null);
      setAjusteData({ cantidad: '', tipo: 'entrada', motivo: '' });
      
      alert('Stock ajustado exitosamente');
      
    } catch (error) {
      console.error('Error ajustando stock:', error);
      alert('Error al ajustar el stock');
    }
  };

  const getStockStatus = (item) => {
    const stockMinimo = 5; // Stock mínimo por defecto
    const stockMaximo = 20; // Stock máximo por defecto
    
    if (item.cantidad === 0) return { color: 'bg-red-100 text-red-800', text: 'Sin Stock' };
    if (item.cantidad <= stockMinimo) return { color: 'bg-orange-100 text-orange-800', text: 'Bajo Stock' };
    if (item.cantidad >= stockMaximo * 0.8) return { color: 'bg-yellow-100 text-yellow-800', text: 'Alto Stock' };
    return { color: 'bg-green-100 text-green-800', text: 'Normal' };
  };

  const getTotalValues = () => {
    const filtered = filteredStock;
    return {
      totalItems: filtered.length,
      totalCantidad: filtered.reduce((sum, item) => sum + item.cantidad, 0),
      totalValor: filtered.reduce((sum, item) => sum + item.valor_total, 0),
      bajoStock: filtered.filter(item => item.cantidad <= 5).length // Stock mínimo por defecto
    };
  };

  const totals = getTotalValues();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600">Control de stock y ubicaciones</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-green-600 font-bold">∑</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cantidad Total</p>
              <p className="text-2xl font-bold text-gray-900">{totals.totalCantidad.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">${totals.totalValor.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Bajo Stock</p>
              <p className="text-2xl font-bold text-red-600">{totals.bajoStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar en inventario..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="form-input"
            value={selectedUbicacion}
            onChange={(e) => setSelectedUbicacion(e.target.value)}
          >
            <option value="">Todas las ubicaciones</option>
            {ubicaciones.map(ubicacion => (
              <option key={ubicacion.id} value={ubicacion.id}>
                {ubicacion.nombre} ({ubicacion.codigo})
              </option>
            ))}
          </select>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="bajoStock"
              checked={filterBajoStock}
              onChange={(e) => setFilterBajoStock(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="bajoStock" className="ml-2 block text-sm text-gray-900">
              Solo bajo stock
            </label>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            Mostrando: {filteredStock.length} registros
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto / Variante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStock.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.codigo_variante}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.medida} - {item.color}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.categoria_nombre} | {item.proveedor_nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{item.ubicacion}</div>
                          <div className="text-sm text-gray-500">{item.ubicacion_codigo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-lg font-semibold ${
                          item.cantidad <= item.stock_minimo ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {item.cantidad}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.stock_minimo} | Max: {item.stock_maximo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ${item.valor_total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          @ ${item.precio_unitario.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Último: {item.ultimo_movimiento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAjusteStock(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Ajustar stock"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuste de Stock */}
      {showModal && selectedStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmitAjuste}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ajustar Stock
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedStock.codigo_variante} - {selectedStock.medida} ({selectedStock.color})
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock actual: <span className="font-semibold">{selectedStock.cantidad}</span>
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Movimiento *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={ajusteData.tipo}
                        onChange={(e) => setAjusteData(prev => ({ ...prev, tipo: e.target.value }))}
                      >
                        <option value="entrada">Entrada (+)</option>
                        <option value="salida">Salida (-)</option>
                        <option value="ajuste">Ajuste (=)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-input"
                        value={ajusteData.cantidad}
                        onChange={(e) => setAjusteData(prev => ({ ...prev, cantidad: e.target.value }))}
                        placeholder={ajusteData.tipo === 'ajuste' ? 'Cantidad final' : 'Cantidad a mover'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo *
                      </label>
                      <textarea
                        rows={3}
                        required
                        className="form-input"
                        value={ajusteData.motivo}
                        onChange={(e) => setAjusteData(prev => ({ ...prev, motivo: e.target.value }))}
                        placeholder="Describe el motivo del ajuste..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    Confirmar Ajuste
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

export default Inventario;