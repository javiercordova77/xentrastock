import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Download, Filter, Package, RefreshCw, ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react';
import { movimientosService, productosService, variantesService, ubicacionesService, apiUtils } from '../services/api';
import ProductSearchSelect from '../components/UI/ProductSearchSelect';

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedFecha, setSelectedFecha] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVariantes, setFilteredVariantes] = useState([]);
  const [filters, setFilters] = useState({
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: ''
  });
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    id_producto: '',
    id_variante: '',
    id_ubicacion: '',
    cantidad: '',
    precio_unitario: '',
    motivo: '',
    observaciones: ''
  });

  const tiposMovimiento = [
    { 
      value: 'entrada', 
      label: 'Entrada', 
      icon: ArrowUpCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-100',
      description: 'Ingreso de mercancía al inventario'
    },
    { 
      value: 'salida', 
      label: 'Salida', 
      icon: ArrowDownCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-100',
      description: 'Salida de mercancía del inventario'
    },
    { 
      value: 'ajuste', 
      label: 'Ajuste', 
      icon: RotateCcw, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100',
      description: 'Corrección de cantidades en inventario'
    }
  ];

  const motivosComunes = {
    entrada: [
      'Compra a proveedor',
      'Devolución de cliente',
      'Producción interna',
      'Transferencia desde otra ubicación',
      'Ajuste por inventario'
    ],
    salida: [
      'Venta a cliente',
      'Devolución a proveedor',
      'Transferencia a otra ubicación',
      'Producto dañado/vencido',
      'Muestra gratuita',
      'Uso interno'
    ],
    ajuste: [
      'Corrección por inventario físico',
      'Error en registro anterior',
      'Merma por manipulación',
      'Producto vencido',
      'Daño en almacén'
    ]
  };

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

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [movimientosRes, productosRes, variantesRes, ubicacionesRes] = await Promise.all([
        movimientosService.getAll(),
        productosService.getAll(),
        variantesService.getAll(),
        ubicacionesService.getAll()
      ]);
      
      setMovimientos(apiUtils.formatResponse(movimientosRes).data || []);
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

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch = 
      (movimiento.producto_descripcion && movimiento.producto_descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movimiento.codigo_variante && movimiento.codigo_variante.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movimiento.motivo && movimiento.motivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movimiento.usuario_nombre && movimiento.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTipo = !selectedTipo || movimiento.tipo === selectedTipo;
    const matchesFecha = !selectedFecha || movimiento.fecha.split(' ')[0] === selectedFecha;
    const matchesEstado = !filters.estado || movimiento.estado === filters.estado;
    const matchesMotivo = !filters.motivo || (movimiento.motivo && movimiento.motivo.toLowerCase().includes(filters.motivo.toLowerCase()));
    
    // Filtros de rango de fechas
    let matchesFechaRango = true;
    if (filters.fecha_inicio || filters.fecha_fin) {
      const fechaMovimiento = new Date(movimiento.fecha);
      if (filters.fecha_inicio) {
        matchesFechaRango = matchesFechaRango && fechaMovimiento >= new Date(filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        matchesFechaRango = matchesFechaRango && fechaMovimiento <= new Date(filters.fecha_fin + ' 23:59:59');
      }
    }
    
    return matchesSearch && matchesTipo && matchesFecha && matchesEstado && matchesMotivo && matchesFechaRango;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      console.log('Enviando datos del movimiento:', formData);
      
      // Crear nuevo movimiento
      const response = await movimientosService.create(formData);
      const newMovimiento = apiUtils.formatResponse(response).data;
      
      setMovimientos(prev => [newMovimiento, ...prev]);
      resetForm();
      alert('Movimiento registrado exitosamente');
      
    } catch (error) {
      console.error('Error registrando movimiento:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error al registrar el movimiento';
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
      tipo: 'entrada',
      id_producto: '',
      id_variante: '',
      id_ubicacion: '',
      cantidad: '',
      precio_unitario: '',
      motivo: '',
      observaciones: ''
    });
    setFilteredVariantes([]);
    setShowModal(false);
  };

  const getMovimientoIcon = (tipo) => {
    const tipoInfo = tiposMovimiento.find(t => t.value === tipo);
    return tipoInfo ? tipoInfo.icon : Package;
  };

  const getMovimientoColor = (tipo) => {
    const tipoInfo = tiposMovimiento.find(t => t.value === tipo);
    return tipoInfo ? tipoInfo.color : 'text-gray-600';
  };

  const getMovimientoBg = (tipo) => {
    const tipoInfo = tiposMovimiento.find(t => t.value === tipo);
    return tipoInfo ? tipoInfo.bg : 'bg-gray-100';
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalValor = () => {
    return filteredMovimientos.reduce((total, mov) => {
      if (mov.tipo === 'entrada') {
        return total + (mov.valor_total || 0);
      } else {
        return total - (mov.valor_total || 0);
      }
    }, 0);
  };

  const getResumenMovimientos = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const movimientosHoy = filteredMovimientos.filter(m => m.fecha.split(' ')[0] === hoy);
    
    return {
      total: filteredMovimientos.length,
      hoy: movimientosHoy.length,
      entradas: filteredMovimientos.filter(m => m.tipo === 'entrada').length,
      salidas: filteredMovimientos.filter(m => m.tipo === 'salida').length,
      ajustes: filteredMovimientos.filter(m => m.tipo === 'ajuste').length,
      pendientes: filteredMovimientos.filter(m => m.estado === 'pendiente').length
    };
  };

  const resumen = getResumenMovimientos();

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
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Inventario</h1>
          <p className="text-gray-600">Registra y gestiona entradas, salidas y ajustes de stock</p>
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
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{resumen.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{resumen.hoy}</div>
          <div className="text-sm text-gray-600">Hoy</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{resumen.entradas}</div>
          <div className="text-sm text-gray-600">Entradas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{resumen.salidas}</div>
          <div className="text-sm text-gray-600">Salidas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{resumen.ajustes}</div>
          <div className="text-sm text-gray-600">Ajustes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{resumen.pendientes}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
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
              placeholder="Buscar por producto, código, motivo o usuario..."
              className="form-input pl-10 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            {tiposMovimiento.map(tipo => (
              <button
                key={tipo.value}
                onClick={() => setSelectedTipo(selectedTipo === tipo.value ? '' : tipo.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTipo === tipo.value 
                    ? `${tipo.color} ${tipo.bg} border-2 border-current` 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <tipo.icon className="w-4 h-4" />
                {tipo.label}
              </button>
            ))}
          </div>

          {/* Filtros adicionales */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  className="form-input"
                  value={filters.estado}
                  onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelado">Cancelado</option>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  placeholder="Buscar motivo..."
                  className="form-input"
                  value={filters.motivo}
                  onChange={(e) => setFilters(prev => ({ ...prev, motivo: e.target.value }))}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ estado: '', fecha_inicio: '', fecha_fin: '', motivo: '' });
                    setSelectedTipo('');
                    setSelectedFecha('');
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
            <span>Mostrando {filteredMovimientos.length} de {movimientos.length} movimientos</span>
            <span className="font-medium">
              Valor total: ${getTotalValor().toFixed(2)}
            </span>
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
                  Tipo & Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto & Variante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad & Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario & Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovimientos.map((movimiento) => {
                const Icon = getMovimientoIcon(movimiento.tipo);
                return (
                  <tr key={movimiento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getMovimientoBg(movimiento.tipo)} mr-3`}>
                          <Icon className={`w-5 h-5 ${getMovimientoColor(movimiento.tipo)}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {movimiento.tipo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(movimiento.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{movimiento.producto_descripcion}</div>
                      <div className="text-sm text-gray-500 font-mono">{movimiento.codigo_variante}</div>
                      <div className="text-xs text-gray-400">{movimiento.variante_medida}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-bold ${movimiento.tipo === 'salida' ? 'text-red-600' : 'text-green-600'}`}>
                          {movimiento.tipo === 'salida' ? '-' : '+'}{movimiento.cantidad}
                        </div>
                        <div className="text-gray-500">
                          ${movimiento.precio_unitario}/u
                        </div>
                        <div className="font-medium text-gray-900">
                          ${movimiento.valor_total}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{movimiento.motivo}</div>
                      {movimiento.observaciones && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={movimiento.observaciones}>
                          {movimiento.observaciones}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movimiento.usuario_nombre}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(movimiento.estado)}`}>
                        {movimiento.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Descargar comprobante"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredMovimientos.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay movimientos</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedTipo || filters.estado
                ? 'No se encontraron movimientos con los filtros aplicados.'
                : 'Comienza registrando tu primer movimiento de inventario.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Registrar Movimiento
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
                    <h3 className="text-xl font-semibold text-gray-900">Registrar Movimiento de Inventario</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Registra entradas, salidas o ajustes de stock para mantener el inventario actualizado
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Tipo y producto */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Movimiento</h4>
                      
                      {/* Selector de tipo mejorado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Movimiento *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {tiposMovimiento.map(tipo => (
                            <label key={tipo.value} className="cursor-pointer">
                              <input
                                type="radio"
                                name="tipo"
                                value={tipo.value}
                                checked={formData.tipo === tipo.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value, motivo: '' }))}
                                className="sr-only"
                              />
                              <div className={`p-3 rounded-lg border-2 transition-all ${
                                formData.tipo === tipo.value 
                                  ? `${tipo.bg} border-current ${tipo.color}` 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}>
                                <div className="flex items-center space-x-3">
                                  <tipo.icon className={`w-5 h-5 ${
                                    formData.tipo === tipo.value ? tipo.color : 'text-gray-500'
                                  }`} />
                                  <div>
                                    <div className="font-medium">{tipo.label}</div>
                                    <div className="text-sm text-gray-500">{tipo.description}</div>
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      
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
                          onChange={(e) => {
                            const varianteId = e.target.value;
                            const variante = filteredVariantes.find(v => v.id.toString() === varianteId);
                            setFormData(prev => ({ 
                              ...prev, 
                              id_variante: varianteId,
                              precio_unitario: variante ? variante.precio_venta.toString() : ''
                            }));
                          }}
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
                      
                      {/* Selector de ubicación */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ubicación *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.id_ubicacion}
                          onChange={(e) => setFormData(prev => ({ ...prev, id_ubicacion: e.target.value }))}
                        >
                          <option value="">Seleccionar ubicación...</option>
                          {ubicaciones.map(ubicacion => (
                            <option key={ubicacion.id} value={ubicacion.id}>
                              {ubicacion.nombre} - {ubicacion.descripcion}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Columna derecha - Cantidades y motivo */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Detalles del Movimiento</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            className="form-input text-lg font-bold"
                            value={formData.cantidad}
                            onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Unitario *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              className="form-input pl-8"
                              value={formData.precio_unitario}
                              onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: e.target.value }))}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Valor total calculado */}
                      {formData.cantidad && formData.precio_unitario && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-blue-900">Valor Total</div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${(parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario)).toFixed(2)}
                          </div>
                        </div>
                      )}
                      
                      {/* Motivo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo *
                        </label>
                        <select
                          required
                          className="form-input"
                          value={formData.motivo}
                          onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                        >
                          <option value="">Seleccionar motivo...</option>
                          {(motivosComunes[formData.tipo] || []).map(motivo => (
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
                          rows="3"
                          className="form-input"
                          value={formData.observaciones}
                          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                          placeholder="Información adicional sobre el movimiento..."
                        />
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
                    disabled={submitting || !formData.id_producto || !formData.id_variante || !formData.cantidad || !formData.precio_unitario || !formData.motivo}
                  >
                    {submitting ? 'Registrando...' : 'Registrar Movimiento'}
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