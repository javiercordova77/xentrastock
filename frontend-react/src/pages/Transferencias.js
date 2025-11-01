import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Send, CheckCircle, XCircle, Clock, Package, ArrowRight, RefreshCw, Filter, Truck, MapPin, User } from 'lucide-react';
import { transferenciasService, productosService, variantesService, ubicacionesService, inventarioService, apiUtils } from '../services/api';
import ProductSearchSelect from '../components/UI/ProductSearchSelect';

function Transferencias() {
  const [transferencias, setTransferencias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVariantes, setFilteredVariantes] = useState([]);
  const [stockOrigen, setStockOrigen] = useState(null);
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    urgencia: ''
  });
  const [formData, setFormData] = useState({
    id_producto: '',
    id_variante: '',
    id_ubicacion_origen: '',
    id_ubicacion_destino: '',
    cantidad: '',
    motivo: '',
    urgencia: 'normal',
    observaciones: ''
  });

  const estadosTransferencia = [
    { 
      value: 'pendiente', 
      label: 'Pendiente', 
      icon: Clock, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100',
      description: 'En espera de procesamiento'
    },
    { 
      value: 'en_transito', 
      label: 'En Tránsito', 
      icon: Truck, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      description: 'Mercancía en movimiento'
    },
    { 
      value: 'completada', 
      label: 'Completada', 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      description: 'Transferencia exitosa'
    },
    { 
      value: 'cancelada', 
      label: 'Cancelada', 
      icon: XCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-100',
      description: 'Transferencia cancelada'
    }
  ];

  const nivelesUrgencia = {
    baja: { label: 'Baja', color: 'text-gray-600', bg: 'bg-gray-100' },
    normal: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-100' },
    alta: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-100' },
    urgente: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-100' }
  };

  const motivosComunes = [
    'Reposición de stock',
    'Redistribución de inventario',
    'Solicitud de sucursal',
    'Balanceo de stock',
    'Promoción especial',
    'Stock excedente',
    'Producto en descontinuación',
    'Mantenimiento de ubicación',
    'Optimización de espacio'
  ];

  // Cargar datos desde la API
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar variantes cuando cambia el producto seleccionado
  useEffect(() => {
    if (formData.id_producto) {
      const variantesDelProducto = variantes.filter(v => 
        v.id_producto.toString() === formData.id_producto.toString()
      );
      setFilteredVariantes(variantesDelProducto);
      
      // Limpiar variante seleccionada si no pertenece al producto
      if (formData.id_variante && !variantesDelProducto.find(v => v.id.toString() === formData.id_variante)) {
        setFormData(prev => ({ ...prev, id_variante: '' }));
      }
    } else {
      setFilteredVariantes([]);
      setFormData(prev => ({ ...prev, id_variante: '' }));
    }
  }, [formData.id_producto, formData.id_variante, variantes]);

  // Obtener stock específico cuando cambian variante y ubicación origen
  useEffect(() => {
    const obtenerStockOrigen = async () => {
      if (formData.id_variante && formData.id_ubicacion_origen) {
        try {
          const response = await inventarioService.getStockEspecifico(formData.id_variante, formData.id_ubicacion_origen);
          const stockData = apiUtils.formatResponse(response).data;
          setStockOrigen(stockData);
        } catch (error) {
          console.error('Error obteniendo stock origen:', error);
          setStockOrigen({ cantidad_disponible: 0, mensaje: 'Error al obtener stock' });
        }
      } else {
        setStockOrigen(null);
      }
    };

    obtenerStockOrigen();
  }, [formData.id_variante, formData.id_ubicacion_origen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [transferenciasRes, productosRes, variantesRes, ubicacionesRes] = await Promise.all([
        transferenciasService.getAll(),
        productosService.getAll(),
        variantesService.getAll(),
        ubicacionesService.getAll()
      ]);
      
      setTransferencias(apiUtils.formatResponse(transferenciasRes).data || []);
      setProductos(apiUtils.formatResponse(productosRes).data || []);
      setVariantes(apiUtils.formatResponse(variantesRes).data || []);
      setUbicaciones(apiUtils.formatResponse(ubicacionesRes).data || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const filteredTransferencias = transferencias.filter(transferencia => {
    const matchesSearch = 
      (transferencia.producto_descripcion && transferencia.producto_descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transferencia.codigo_variante && transferencia.codigo_variante.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transferencia.ubicacion_origen && transferencia.ubicacion_origen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transferencia.ubicacion_destino && transferencia.ubicacion_destino.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transferencia.motivo && transferencia.motivo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEstado = !selectedEstado || transferencia.estado === selectedEstado;
    const matchesUbicacion = !selectedUbicacion || 
      transferencia.id_ubicacion_origen.toString() === selectedUbicacion ||
      transferencia.id_ubicacion_destino.toString() === selectedUbicacion;
    const matchesUrgencia = !filters.urgencia || transferencia.urgencia === filters.urgencia;
    
    // Filtros de rango de fechas
    let matchesFechaRango = true;
    if (filters.fecha_inicio || filters.fecha_fin) {
      const fechaTransferencia = new Date(transferencia.fecha_creacion);
      if (filters.fecha_inicio) {
        matchesFechaRango = matchesFechaRango && fechaTransferencia >= new Date(filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        matchesFechaRango = matchesFechaRango && fechaTransferencia <= new Date(filters.fecha_fin + ' 23:59:59');
      }
    }
    
    return matchesSearch && matchesEstado && matchesUbicacion && matchesUrgencia && matchesFechaRango;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las ubicaciones sean diferentes
    if (formData.id_ubicacion_origen === formData.id_ubicacion_destino) {
      alert('La ubicación de origen debe ser diferente a la de destino');
      return;
    }
    
    // Validar stock disponible en origen
    if (stockOrigen && parseInt(formData.cantidad) > stockOrigen.cantidad_disponible) {
      alert(`Stock insuficiente en ubicación origen. Disponible: ${stockOrigen.cantidad_disponible}, Solicitado: ${formData.cantidad}`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log('Enviando datos de transferencia:', formData);
      
      // Crear nueva transferencia
      const response = await transferenciasService.create(formData);
      const newTransferencia = apiUtils.formatResponse(response).data;
      
      setTransferencias(prev => [newTransferencia, ...prev]);
      resetForm();
      alert('Transferencia creada exitosamente');
      
    } catch (error) {
      console.error('Error creando transferencia:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error al crear la transferencia';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Errores de validación: ${errors}`;
      } else {
        errorMessage = apiUtils.handleError(error);
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_producto: '',
      id_variante: '',
      id_ubicacion_origen: '',
      id_ubicacion_destino: '',
      cantidad: '',
      motivo: '',
      urgencia: 'normal',
      observaciones: ''
    });
    setFilteredVariantes([]);
    setStockOrigen(null);
    setShowModal(false);
  };

  const handleUpdateEstado = async (transferencia, nuevoEstado) => {
    if (window.confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      try {
        await transferenciasService.updateEstado(transferencia.id, nuevoEstado);
        setTransferencias(prev => prev.map(t => 
          t.id === transferencia.id 
            ? { ...t, estado: nuevoEstado, fecha_actualizacion: new Date().toISOString() }
            : t
        ));
        alert('Estado actualizado exitosamente');
      } catch (error) {
        console.error('Error actualizando estado:', error);
        alert('Error al actualizar el estado: ' + apiUtils.handleError(error));
      }
    }
  };

  const getEstadoInfo = (estado) => {
    return estadosTransferencia.find(e => e.value === estado) || estadosTransferencia[0];
  };

  const getUrgenciaInfo = (urgencia) => {
    return nivelesUrgencia[urgencia] || nivelesUrgencia.normal;
  };

  const getResumenTransferencias = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const transferenciasHoy = filteredTransferencias.filter(t => t.fecha_creacion.split(' ')[0] === hoy);
    
    return {
      total: filteredTransferencias.length,
      hoy: transferenciasHoy.length,
      pendientes: filteredTransferencias.filter(t => t.estado === 'pendiente').length,
      en_transito: filteredTransferencias.filter(t => t.estado === 'en_transito').length,
      completadas: filteredTransferencias.filter(t => t.estado === 'completada').length,
      urgentes: filteredTransferencias.filter(t => t.urgencia === 'urgente').length
    };
  };

  const resumen = getResumenTransferencias();

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
          <h1 className="text-2xl font-bold text-gray-900">Transferencias entre Ubicaciones</h1>
          <p className="text-gray-600">Gestiona el movimiento de inventario entre diferentes ubicaciones</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadData}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Transferencia
          </button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{resumen.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{resumen.hoy}</div>
          <div className="text-sm text-gray-600">Hoy</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{resumen.pendientes}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{resumen.en_transito}</div>
          <div className="text-sm text-gray-600">En Tránsito</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{resumen.completadas}</div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{resumen.urgentes}</div>
          <div className="text-sm text-gray-600">Urgentes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filtros de Búsqueda</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Búsqueda principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por producto, código, ubicación o motivo..."
              className="form-input pl-10 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros rápidos por estado */}
          <div className="flex flex-wrap gap-2">
            {estadosTransferencia.map(estado => (
              <button
                key={estado.value}
                onClick={() => setSelectedEstado(selectedEstado === estado.value ? '' : estado.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEstado === estado.value 
                    ? `${estado.color} ${estado.bg} border-2 border-current` 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <estado.icon className="w-4 h-4" />
                {estado.label}
              </button>
            ))}
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <select
                  className="form-input"
                  value={selectedUbicacion}
                  onChange={(e) => setSelectedUbicacion(e.target.value)}
                >
                  <option value="">Todas las ubicaciones</option>
                  {ubicaciones.map(ubicacion => (
                    <option key={ubicacion.id} value={ubicacion.id}>
                      {ubicacion.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
                <select
                  className="form-input"
                  value={filters.urgencia}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgencia: e.target.value }))}
                >
                  <option value="">Todas</option>
                  {Object.entries(nivelesUrgencia).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.fecha_inicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.fecha_fin}
                  onChange={(e) => setFilters(prev => ({ ...prev, fecha_fin: e.target.value }))}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ fecha_inicio: '', fecha_fin: '', urgencia: '' });
                    setSelectedEstado('');
                    setSelectedUbicacion('');
                    setSearchTerm('');
                  }}
                  className="btn-secondary w-full"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>Mostrando {filteredTransferencias.length} de {transferencias.length} transferencias</span>
            {(searchTerm || selectedEstado || selectedUbicacion || filters.urgencia) && (
              <span className="text-primary-600">Filtros aplicados</span>
            )}
          </div>
        </div>
      </div>

      {/* Table - Responsive */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto & Cantidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta de Transferencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado & Urgencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransferencias.map((transferencia) => {
                const estadoInfo = getEstadoInfo(transferencia.estado);
                const urgenciaInfo = getUrgenciaInfo(transferencia.urgencia);
                const Icon = estadoInfo.icon;
                
                return (
                  <tr key={transferencia.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transferencia.producto_descripcion}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {transferencia.codigo_variante}
                          </div>
                          <div className="text-sm font-bold text-blue-600">
                            {transferencia.cantidad} unidades
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                            {transferencia.ubicacion_origen}
                          </div>
                          <div className="text-xs text-gray-500">Origen</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="w-4 h-4 text-green-500 mr-1" />
                            {transferencia.ubicacion_destino}
                          </div>
                          <div className="text-xs text-gray-500">Destino</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Icon className={`w-4 h-4 mr-2 ${estadoInfo.color}`} />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoInfo.bg} ${estadoInfo.color}`}>
                            {estadoInfo.label}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${urgenciaInfo.bg} ${urgenciaInfo.color}`}>
                          {urgenciaInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Creada: {new Date(transferencia.fecha_creacion).toLocaleDateString('es-ES')}
                        </div>
                        {transferencia.fecha_completada && (
                          <div className="text-green-600">
                            Completada: {new Date(transferencia.fecha_completada).toLocaleDateString('es-ES')}
                          </div>
                        )}
                        {transferencia.fecha_actualizacion && (
                          <div className="text-xs text-gray-500">
                            Actualizada: {new Date(transferencia.fecha_actualizacion).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{transferencia.motivo}</div>
                      {transferencia.observaciones && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={transferencia.observaciones}>
                          {transferencia.observaciones}
                        </div>
                      )}
                      {transferencia.usuario_nombre && (
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <User className="w-3 h-3 mr-1" />
                          {transferencia.usuario_nombre}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Botones de cambio de estado */}
                        {transferencia.estado === 'pendiente' && (
                          <button
                            onClick={() => handleUpdateEstado(transferencia, 'en_transito')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Marcar en tránsito"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        
                        {transferencia.estado === 'en_transito' && (
                          <button
                            onClick={() => handleUpdateEstado(transferencia, 'completada')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Marcar completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(transferencia.estado === 'pendiente' || transferencia.estado === 'en_transito') && (
                          <button
                            onClick={() => handleUpdateEstado(transferencia, 'cancelada')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Cancelar transferencia"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredTransferencias.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transferencias</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedEstado || selectedUbicacion || filters.urgencia
                ? 'No se encontraron transferencias con los filtros aplicados.'
                : 'Comienza creando tu primera transferencia entre ubicaciones.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Crear Transferencia
            </button>
          </div>
        )}
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={resetForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Nueva Transferencia entre Ubicaciones</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Crea una solicitud para mover inventario de una ubicación a otra
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Producto y ubicaciones */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Producto a Transferir</h4>
                      
                      {/* Selector de producto mejorado */}
                      <ProductSearchSelect
                        products={productos}
                        value={formData.id_producto}
                        onChange={(value) => setFormData(prev => ({ ...prev, id_producto: value }))}
                        placeholder="Buscar y seleccionar producto..."
                        className="w-full"
                      />
                      
                      {/* Selector de variante */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variante *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.id_variante}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_variante: e.target.value }))}
                          disabled={!formData.id_producto}
                        >
                          <option value="">
                            {formData.id_producto ? 'Seleccionar variante...' : 'Primero selecciona un producto'}
                          </option>
                          {filteredVariantes.map(variante => (
                            <option key={variante.id} value={variante.id}>
                              {variante.codigo_variante} - {variante.medida} (Stock: {variante.stock_total || 0})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Cantidad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad a Transferir *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={stockOrigen ? stockOrigen.cantidad_disponible : undefined}
                          required
                          className="form-input text-lg font-bold"
                          value={formData.cantidad}
                          onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                          placeholder="0"
                        />
                        
                        {/* Mostrar stock disponible en origen */}
                        {stockOrigen && (
                          <div className="mt-2">
                            {stockOrigen.cantidad_disponible > 0 ? (
                              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                                <Package className="inline w-4 h-4 mr-1" />
                                Stock disponible en origen: <span className="font-bold">{stockOrigen.cantidad_disponible}</span> unidades
                              </p>
                            ) : (
                              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                                <XCircle className="inline w-4 h-4 mr-1" />
                                Sin stock disponible en la ubicación origen
                              </p>
                            )}
                          </div>
                        )}
                        
                        {formData.id_variante && formData.id_ubicacion_origen && !stockOrigen && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                              <RefreshCw className="inline w-4 h-4 mr-1 animate-spin" />
                              Verificando stock disponible...
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Ubicaciones */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ubicación Origen *
                          </label>
                          <select
                            required
                            className="form-input"
                          value={formData.id_ubicacion_origen}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_ubicacion_origen: e.target.value }))}
                          >
                            <option value="">Seleccionar origen...</option>
                            {ubicaciones.map(ubicacion => (
                              <option 
                                key={ubicacion.id} 
                                value={ubicacion.id}
                                disabled={ubicacion.id.toString() === formData.id_ubicacion_destino}
                              >
                                {ubicacion.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ubicación Destino *
                          </label>
                          <select
                            required
                            className="form-input"
                          value={formData.id_ubicacion_destino}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_ubicacion_destino: e.target.value }))}
                          >
                            <option value="">Seleccionar destino...</option>
                            {ubicaciones.map(ubicacion => (
                              <option 
                                key={ubicacion.id} 
                                value={ubicacion.id}
                                disabled={ubicacion.id.toString() === formData.id_ubicacion_origen}
                              >
                                {ubicacion.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Columna derecha - Detalles de transferencia */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Detalles de la Transferencia</h4>
                      
                      {/* Nivel de urgencia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nivel de Urgencia *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(nivelesUrgencia).map(([key, info]) => (
                            <label key={key} className="cursor-pointer">
                              <input
                                type="radio"
                                name="urgencia"
                                value={key}
                                checked={formData.urgencia === key}
                                onChange={(e) => setFormData(prev => ({ ...prev, urgencia: e.target.value }))}
                                className="sr-only"
                              />
                              <div className={`p-2 rounded-lg border-2 text-center transition-all ${
                                formData.urgencia === key 
                                  ? `${info.bg} border-current ${info.color}` 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
                              }`}>
                                <div className="font-medium text-sm">{info.label}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Motivo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo de la Transferencia *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.motivo}
                          onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        >
                          <option value="">Seleccionar motivo...</option>
                          {motivosComunes.map(motivo => (
                            <option key={motivo} value={motivo}>{motivo}</option>
                          ))}
                          <option value="otro">Otro motivo...</option>
                        </select>
                        
                        {formData.motivo === 'otro' && (
                          <input
                            type="text"
                            required
                            className="form-input mt-2"
                            placeholder="Especificar motivo..."
                            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                          />
                        )}
                      </div>
                      
                      {/* Observaciones */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          rows="4"
                          className="form-input"
                          value={formData.observaciones}
                          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                          placeholder="Información adicional, instrucciones especiales, etc..."
                        />
                      </div>
                      
                      {/* Información de ayuda */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Información Importante</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• La transferencia debe ser autorizada por el responsable</li>
                          <li>• Verifica que la ubicación origen tenga stock suficiente</li>
                          <li>• Las transferencias urgentes tienen prioridad de procesamiento</li>
                          <li>• Incluye observaciones para facilitar el proceso</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || !formData.id_producto || !formData.id_variante || !formData.cantidad || !formData.id_ubicacion_origen || !formData.id_ubicacion_destino || !formData.motivo}
                  >
                    {submitting ? 'Creando...' : 'Crear Transferencia'}
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