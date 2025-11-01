import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    variante_id: '',
    ubicacion_id: '',
    tipo: 'entrada',
    cantidad: '',
    motivo: '',
    precio_unitario: ''
  });

  const tiposMovimiento = [
    { value: 'entrada', label: 'Entrada', icon: ArrowUp, color: 'text-green-600 bg-green-100' },
    { value: 'salida', label: 'Salida', icon: ArrowDown, color: 'text-red-600 bg-red-100' },
    { value: 'ajuste', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600 bg-blue-100' }
  ];

  // Simular datos iniciales
  useEffect(() => {
    setTimeout(() => {
      setVariantes([
        { id: 1, sku: 'GAL-128-BLK', nombre: 'Smartphone Galaxy - 128GB Negro', precio: 299.99 },
        { id: 2, sku: 'GAL-256-WHT', nombre: 'Smartphone Galaxy - 256GB Blanco', precio: 399.99 },
        { id: 3, sku: 'CAM-S-BLU', nombre: 'Camiseta Casual - Talla S Azul', precio: 19.99 },
        { id: 4, sku: 'LED-WHT-12W', nombre: 'Lámpara LED - Blanca 12W', precio: 45.50 }
      ]);

      setUbicaciones([
        { id: 1, nombre: 'Almacén Principal', codigo: 'ALM-01' },
        { id: 2, nombre: 'Tienda Centro', codigo: 'TDA-01' },
        { id: 3, nombre: 'Depósito Norte', codigo: 'DEP-01' }
      ]);

      setMovimientos([
        {
          id: 1,
          variante_id: 1,
          variante_sku: 'GAL-128-BLK',
          variante_nombre: 'Smartphone Galaxy - 128GB Negro',
          ubicacion_id: 1,
          ubicacion_nombre: 'Almacén Principal',
          ubicacion_codigo: 'ALM-01',
          tipo: 'entrada',
          cantidad: 50,
          precio_unitario: 299.99,
          valor_total: 14999.50,
          motivo: 'Compra inicial de inventario',
          fecha: '2025-01-15',
          hora: '10:30',
          usuario: 'Admin'
        },
        {
          id: 2,
          variante_id: 1,
          variante_sku: 'GAL-128-BLK',
          variante_nombre: 'Smartphone Galaxy - 128GB Negro',
          ubicacion_id: 2,
          ubicacion_nombre: 'Tienda Centro',
          ubicacion_codigo: 'TDA-01',
          tipo: 'salida',
          cantidad: 15,
          precio_unitario: 299.99,
          valor_total: 4499.85,
          motivo: 'Transferencia a tienda para venta',
          fecha: '2025-01-15',
          hora: '14:45',
          usuario: 'Admin'
        },
        {
          id: 3,
          variante_id: 2,
          variante_sku: 'GAL-256-WHT',
          variante_nombre: 'Smartphone Galaxy - 256GB Blanco',
          ubicacion_id: 1,
          ubicacion_nombre: 'Almacén Principal',
          ubicacion_codigo: 'ALM-01',
          tipo: 'entrada',
          cantidad: 30,
          precio_unitario: 399.99,
          valor_total: 11999.70,
          motivo: 'Restock de producto popular',
          fecha: '2025-01-14',
          hora: '09:15',
          usuario: 'Admin'
        },
        {
          id: 4,
          variante_id: 3,
          variante_sku: 'CAM-S-BLU',
          variante_nombre: 'Camiseta Casual - Talla S Azul',
          ubicacion_id: 2,
          ubicacion_nombre: 'Tienda Centro',
          ubicacion_codigo: 'TDA-01',
          tipo: 'ajuste',
          cantidad: -5,
          precio_unitario: 19.99,
          valor_total: -99.95,
          motivo: 'Ajuste por inventario físico - productos dañados',
          fecha: '2025-01-13',
          hora: '16:20',
          usuario: 'Manager'
        },
        {
          id: 5,
          variante_id: 4,
          variante_sku: 'LED-WHT-12W',
          variante_nombre: 'Lámpara LED - Blanca 12W',
          ubicacion_id: 3,
          ubicacion_nombre: 'Depósito Norte',
          ubicacion_codigo: 'DEP-01',
          tipo: 'entrada',
          cantidad: 25,
          precio_unitario: 45.50,
          valor_total: 1137.50,
          motivo: 'Llegada de nueva mercancía',
          fecha: '2025-01-12',
          hora: '11:00',
          usuario: 'Admin'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch = 
      movimiento.variante_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.variante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.ubicacion_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = !selectedTipo || movimiento.tipo === selectedTipo;
    const matchesFecha = !selectedFecha || movimiento.fecha === selectedFecha;
    
    return matchesSearch && matchesTipo && matchesFecha;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const variante = variantes.find(v => v.id.toString() === formData.variante_id);
    const ubicacion = ubicaciones.find(u => u.id.toString() === formData.ubicacion_id);
    
    if (!variante || !ubicacion) return;
    
    const cantidad = parseInt(formData.cantidad);
    const precioUnitario = parseFloat(formData.precio_unitario) || variante.precio;
    const valorTotal = cantidad * precioUnitario;
    
    const newMovimiento = {
      id: Date.now(),
      variante_id: variante.id,
      variante_sku: variante.sku,
      variante_nombre: variante.nombre,
      ubicacion_id: ubicacion.id,
      ubicacion_nombre: ubicacion.nombre,
      ubicacion_codigo: ubicacion.codigo,
      tipo: formData.tipo,
      cantidad: formData.tipo === 'salida' ? -cantidad : cantidad,
      precio_unitario: precioUnitario,
      valor_total: formData.tipo === 'salida' ? -valorTotal : valorTotal,
      motivo: formData.motivo,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      usuario: 'Usuario Actual'
    };
    
    setMovimientos(prev => [newMovimiento, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      variante_id: '',
      ubicacion_id: '',
      tipo: 'entrada',
      cantidad: '',
      motivo: '',
      precio_unitario: ''
    });
    setShowModal(false);
  };

  const getTipoInfo = (tipo) => {
    return tiposMovimiento.find(t => t.value === tipo) || tiposMovimiento[0];
  };

  const getResumen = () => {
    const filtered = filteredMovimientos;
    return {
      totalMovimientos: filtered.length,
      entradas: filtered.filter(m => m.tipo === 'entrada').length,
      salidas: filtered.filter(m => m.tipo === 'salida').length,
      ajustes: filtered.filter(m => m.tipo === 'ajuste').length,
      valorTotal: filtered.reduce((sum, m) => sum + m.valor_total, 0)
    };
  };

  const resumen = getResumen();

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
          <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
          <p className="text-gray-600">Registro de movimientos de inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{resumen.totalMovimientos}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <ArrowUp className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Entradas</p>
              <p className="text-lg font-bold text-green-600">{resumen.entradas}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <ArrowDown className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Salidas</p>
              <p className="text-lg font-bold text-red-600">{resumen.salidas}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <RotateCcw className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Ajustes</p>
              <p className="text-lg font-bold text-blue-600">{resumen.ajustes}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold text-xs">$</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Valor Total</p>
              <p className={`text-lg font-bold ${resumen.valorTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${resumen.valorTotal.toFixed(2)}
              </p>
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
              placeholder="Buscar movimientos..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="form-input"
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposMovimiento.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          
          <input
            type="date"
            className="form-input"
            value={selectedFecha}
            onChange={(e) => setSelectedFecha(e.target.value)}
          />
          
          <div className="text-sm text-gray-600 flex items-center">
            Mostrando: {filteredMovimientos.length} registros
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovimientos.map((movimiento) => {
                const tipoInfo = getTipoInfo(movimiento.tipo);
                const IconComponent = tipoInfo.icon;
                
                return (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {movimiento.fecha}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movimiento.hora}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {movimiento.variante_sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movimiento.variante_nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{movimiento.ubicacion_nombre}</div>
                        <div className="text-sm text-gray-500 font-mono">{movimiento.ubicacion_codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {tipoInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        movimiento.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}
                      </div>
                      <div className="text-xs text-gray-500">
                        @ ${movimiento.precio_unitario.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${
                        movimiento.valor_total >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${movimiento.valor_total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={movimiento.motivo}>
                        {movimiento.motivo}
                      </div>
                      <div className="text-xs text-gray-500">
                        por {movimiento.usuario}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                      Nuevo Movimiento
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Movimiento *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                      >
                        {tiposMovimiento.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variante *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={formData.variante_id}
                        onChange={(e) => {
                          const varianteId = e.target.value;
                          const variante = variantes.find(v => v.id.toString() === varianteId);
                          setFormData(prev => ({ 
                            ...prev, 
                            variante_id: varianteId,
                            precio_unitario: variante ? variante.precio.toString() : ''
                          }));
                        }}
                      >
                        <option value="">Seleccionar variante...</option>
                        {variantes.map(variante => (
                          <option key={variante.id} value={variante.id}>
                            {variante.sku} - {variante.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={formData.ubicacion_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_id: e.target.value }))}
                      >
                        <option value="">Seleccionar ubicación...</option>
                        {ubicaciones.map(ubicacion => (
                          <option key={ubicacion.id} value={ubicacion.id}>
                            {ubicacion.nombre} ({ubicacion.codigo})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="form-input"
                          value={formData.cantidad}
                          onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          value={formData.precio_unitario}
                          onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: e.target.value }))}
                          placeholder="Se usará el precio de la variante"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo *
                      </label>
                      <textarea
                        rows={3}
                        required
                        className="form-input"
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        placeholder="Describe el motivo del movimiento..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    Registrar Movimiento
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

export default Movimientos;