import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    variante_id: '',
    ubicacion_origen_id: '',
    ubicacion_destino_id: '',
    cantidad: '',
    motivo: ''
  });

  const estadosTransferencia = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle }
  ];

  // Simular datos iniciales
  useEffect(() => {
    setTimeout(() => {
      setUbicaciones([
        { id: 1, nombre: 'Almacén Principal', codigo: 'ALM-01' },
        { id: 2, nombre: 'Tienda Centro', codigo: 'TDA-01' },
        { id: 3, nombre: 'Depósito Norte', codigo: 'DEP-01' }
      ]);

      setVariantes([
        { id: 1, sku: 'GAL-128-BLK', nombre: 'Smartphone Galaxy - 128GB Negro' },
        { id: 2, sku: 'GAL-256-WHT', nombre: 'Smartphone Galaxy - 256GB Blanco' },
        { id: 3, sku: 'CAM-S-BLU', nombre: 'Camiseta Casual - Talla S Azul' },
        { id: 4, sku: 'LED-WHT-12W', nombre: 'Lámpara LED - Blanca 12W' }
      ]);

      setTransferencias([
        {
          id: 1,
          variante_id: 1,
          variante_sku: 'GAL-128-BLK',
          variante_nombre: 'Smartphone Galaxy - 128GB Negro',
          ubicacion_origen_id: 1,
          ubicacion_origen: 'Almacén Principal',
          ubicacion_origen_codigo: 'ALM-01',
          ubicacion_destino_id: 2,
          ubicacion_destino: 'Tienda Centro',
          ubicacion_destino_codigo: 'TDA-01',
          cantidad: 10,
          motivo: 'Restock de tienda para ventas',
          estado: 'confirmada',
          fecha_creacion: '2025-01-15',
          fecha_confirmacion: '2025-01-15',
          usuario_creacion: 'Admin',
          usuario_confirmacion: 'Manager'
        },
        {
          id: 2,
          variante_id: 2,
          variante_sku: 'GAL-256-WHT',
          variante_nombre: 'Smartphone Galaxy - 256GB Blanco',
          ubicacion_origen_id: 1,
          ubicacion_origen: 'Almacén Principal',
          ubicacion_origen_codigo: 'ALM-01',
          ubicacion_destino_id: 3,
          ubicacion_destino: 'Depósito Norte',
          ubicacion_destino_codigo: 'DEP-01',
          cantidad: 5,
          motivo: 'Redistribución de inventario',
          estado: 'pendiente',
          fecha_creacion: '2025-01-14',
          fecha_confirmacion: null,
          usuario_creacion: 'Admin',
          usuario_confirmacion: null
        },
        {
          id: 3,
          variante_id: 3,
          variante_sku: 'CAM-S-BLU',
          variante_nombre: 'Camiseta Casual - Talla S Azul',
          ubicacion_origen_id: 2,
          ubicacion_origen: 'Tienda Centro',
          ubicacion_origen_codigo: 'TDA-01',
          ubicacion_destino_id: 1,
          ubicacion_destino: 'Almacén Principal',
          ubicacion_destino_codigo: 'ALM-01',
          cantidad: 3,
          motivo: 'Devolución por exceso de stock',
          estado: 'cancelada',
          fecha_creacion: '2025-01-13',
          fecha_confirmacion: null,
          usuario_creacion: 'Manager',
          usuario_confirmacion: null
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTransferencias = transferencias.filter(transferencia => {
    const matchesSearch = 
      transferencia.variante_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.variante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.ubicacion_origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.ubicacion_destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !selectedEstado || transferencia.estado === selectedEstado;
    
    return matchesSearch && matchesEstado;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const variante = variantes.find(v => v.id.toString() === formData.variante_id);
    const origen = ubicaciones.find(u => u.id.toString() === formData.ubicacion_origen_id);
    const destino = ubicaciones.find(u => u.id.toString() === formData.ubicacion_destino_id);
    
    if (!variante || !origen || !destino) return;
    
    if (formData.ubicacion_origen_id === formData.ubicacion_destino_id) {
      alert('La ubicación de origen y destino no pueden ser iguales');
      return;
    }
    
    const newTransferencia = {
      id: Date.now(),
      variante_id: variante.id,
      variante_sku: variante.sku,
      variante_nombre: variante.nombre,
      ubicacion_origen_id: origen.id,
      ubicacion_origen: origen.nombre,
      ubicacion_origen_codigo: origen.codigo,
      ubicacion_destino_id: destino.id,
      ubicacion_destino: destino.nombre,
      ubicacion_destino_codigo: destino.codigo,
      cantidad: parseInt(formData.cantidad),
      motivo: formData.motivo,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_confirmacion: null,
      usuario_creacion: 'Usuario Actual',
      usuario_confirmacion: null
    };
    
    setTransferencias(prev => [newTransferencia, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      variante_id: '',
      ubicacion_origen_id: '',
      ubicacion_destino_id: '',
      cantidad: '',
      motivo: ''
    });
    setShowModal(false);
  };

  const handleConfirmar = (id) => {
    if (window.confirm('¿Confirmar esta transferencia? Esta acción actualizará el stock en ambas ubicaciones.')) {
      setTransferencias(prev => prev.map(t => 
        t.id === id 
          ? { 
              ...t, 
              estado: 'confirmada',
              fecha_confirmacion: new Date().toISOString().split('T')[0],
              usuario_confirmacion: 'Usuario Actual'
            }
          : t
      ));
    }
  };

  const handleCancelar = (id) => {
    if (window.confirm('¿Cancelar esta transferencia?')) {
      setTransferencias(prev => prev.map(t => 
        t.id === id ? { ...t, estado: 'cancelada' } : t
      ));
    }
  };

  const getEstadoInfo = (estado) => {
    return estadosTransferencia.find(e => e.value === estado) || estadosTransferencia[0];
  };

  const getResumen = () => {
    const filtered = filteredTransferencias;
    return {
      total: filtered.length,
      pendientes: filtered.filter(t => t.estado === 'pendiente').length,
      confirmadas: filtered.filter(t => t.estado === 'confirmada').length,
      canceladas: filtered.filter(t => t.estado === 'cancelada').length
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
          <h1 className="text-2xl font-bold text-gray-900">Transferencias</h1>
          <p className="text-gray-600">Movimientos de stock entre ubicaciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Transferencia
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <ArrowRightLeft className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{resumen.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{resumen.pendientes}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmadas</p>
              <p className="text-2xl font-bold text-green-600">{resumen.confirmadas}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">{resumen.canceladas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar transferencias..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="form-input"
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosTransferencia.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Mostrando: {filteredTransferencias.length} registros
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transferencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
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
              {filteredTransferencias.map((transferencia) => {
                const estadoInfo = getEstadoInfo(transferencia.estado);
                const IconComponent = estadoInfo.icon;
                
                return (
                  <tr key={transferencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transferencia.fecha_creacion}
                        </div>
                        <div className="text-sm text-gray-500">
                          por {transferencia.usuario_creacion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {transferencia.variante_sku}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transferencia.variante_nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <div className="text-gray-900">
                          <div>{transferencia.ubicacion_origen} ({transferencia.ubicacion_origen_codigo})</div>
                          <div className="flex items-center justify-center my-1">
                            <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>{transferencia.ubicacion_destino} ({transferencia.ubicacion_destino_codigo})</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {transferencia.cantidad}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {estadoInfo.label}
                      </span>
                      {transferencia.fecha_confirmacion && (
                        <div className="text-xs text-gray-500 mt-1">
                          Confirmada: {transferencia.fecha_confirmacion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {transferencia.estado === 'pendiente' && (
                          <>
                            <button
                              onClick={() => handleConfirmar(transferencia.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Confirmar transferencia"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelar(transferencia.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Cancelar transferencia"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
                      Nueva Transferencia
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variante *
                      </label>
                      <select
                        required
                        className="form-input"
                        value={formData.variante_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, variante_id: e.target.value }))}
                      >
                        <option value="">Seleccionar variante...</option>
                        {variantes.map(variante => (
                          <option key={variante.id} value={variante.id}>
                            {variante.sku} - {variante.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Origen *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.ubicacion_origen_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_origen_id: e.target.value }))}
                        >
                          <option value="">Seleccionar origen...</option>
                          {ubicaciones.map(ubicacion => (
                            <option key={ubicacion.id} value={ubicacion.id}>
                              {ubicacion.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destino *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.ubicacion_destino_id}
                          onChange={(e) => setFormData(prev => ({ ...prev, ubicacion_destino_id: e.target.value }))}
                        >
                          <option value="">Seleccionar destino...</option>
                          {ubicaciones.filter(u => u.id.toString() !== formData.ubicacion_origen_id).map(ubicacion => (
                            <option key={ubicacion.id} value={ubicacion.id}>
                              {ubicacion.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
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
                        value={formData.cantidad}
                        onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
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
                        value={formData.motivo}
                        onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        placeholder="Describe el motivo de la transferencia..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn-primary sm:ml-3 sm:w-auto w-full"
                  >
                    Crear Transferencia
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

export default Transferencias;