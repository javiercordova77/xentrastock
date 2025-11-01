import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, RefreshCw } from 'lucide-react';

function Reportes() {
  const [reportes, setReportes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState('ultimos_30_dias');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const periodos = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'ultimos_7_dias', label: 'Últimos 7 días' },
    { value: 'ultimos_30_dias', label: 'Últimos 30 días' },
    { value: 'este_mes', label: 'Este mes' },
    { value: 'personalizado', label: 'Período personalizado' }
  ];

  // Simular datos de reportes
  useEffect(() => {
    setTimeout(() => {
      setReportes({
        resumen: {
          totalProductos: 156,
          totalVariantes: 324,
          totalProveedores: 12,
          totalCategorias: 8,
          valorInventario: 245680.50,
          movimientosDelPeriodo: 89
        },
        stockBajo: [
          { id: 1, sku: 'CAM-M-BLU', nombre: 'Camiseta Casual - Talla M Azul', stock: 5, minimo: 15, ubicacion: 'Tienda Centro' },
          { id: 2, sku: 'LED-WHT-12W', nombre: 'Lámpara LED - Blanca 12W', stock: 8, minimo: 10, ubicacion: 'Depósito Norte' },
          { id: 3, sku: 'GAL-256-WHT', nombre: 'Smartphone Galaxy - 256GB Blanco', stock: 12, minimo: 15, ubicacion: 'Almacén Principal' }
        ],
        movimientosPorTipo: [
          { tipo: 'Entradas', cantidad: 45, valor: 125430.00 },
          { tipo: 'Salidas', cantidad: 32, valor: -87650.50 },
          { tipo: 'Ajustes', cantidad: 12, valor: -2100.00 }
        ],
        inventarioPorUbicacion: [
          { ubicacion: 'Almacén Principal', productos: 89, valor: 145230.75 },
          { ubicacion: 'Tienda Centro', productos: 45, valor: 67890.25 },
          { ubicacion: 'Depósito Norte', productos: 22, valor: 32559.50 }
        ],
        productosPopulares: [
          { id: 1, nombre: 'Smartphone Galaxy', variantes: 3, movimientos: 28, valor: 45600.00 },
          { id: 2, nombre: 'Camiseta Casual', variantes: 6, movimientos: 24, valor: 12450.00 },
          { id: 3, nombre: 'Lámpara LED', variantes: 2, movimientos: 15, valor: 8920.00 },
          { id: 4, nombre: 'Auriculares Bluetooth', variantes: 4, movimientos: 12, valor: 7890.00 }
        ],
        tendenciaInventario: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          entradas: [1200, 1900, 3000, 2500, 2200, 2800],
          salidas: [800, 1400, 2200, 1800, 1600, 2100]
        }
      });
      
      // Establecer fechas por defecto
      const hoy = new Date();
      const hace30Dias = new Date();
      hace30Dias.setDate(hoy.getDate() - 30);
      
      setFechaFin(hoy.toISOString().split('T')[0]);
      setFechaInicio(hace30Dias.toISOString().split('T')[0]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleActualizarReportes = () => {
    setLoading(true);
    // Simular recarga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExportarReporte = (tipo) => {
    // Simular exportación
    alert(`Exportando reporte de ${tipo}...`);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
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
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del inventario</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleActualizarReportes}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={() => handleExportarReporte('completo')}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              className="form-input"
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(e.target.value)}
            >
              {periodos.map(periodo => (
                <option key={periodo.value} value={periodo.value}>
                  {periodo.label}
                </option>
              ))}
            </select>
          </div>
          
          {selectedPeriodo === 'personalizado' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Productos</p>
            <p className="text-2xl font-bold text-gray-900">{reportes.resumen?.totalProductos}</p>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Variantes</p>
            <p className="text-2xl font-bold text-gray-900">{reportes.resumen?.totalVariantes}</p>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Proveedores</p>
            <p className="text-2xl font-bold text-gray-900">{reportes.resumen?.totalProveedores}</p>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Categorías</p>
            <p className="text-2xl font-bold text-gray-900">{reportes.resumen?.totalCategorias}</p>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Valor Inventario</p>
            <p className="text-2xl font-bold text-green-600">
              ${reportes.resumen?.valorInventario?.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Movimientos</p>
            <p className="text-2xl font-bold text-blue-600">{reportes.resumen?.movimientosDelPeriodo}</p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stock Bajo */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                Stock Bajo
              </h3>
              <button
                onClick={() => handleExportarReporte('stock_bajo')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportes.stockBajo?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 font-mono">{item.sku}</p>
                    <p className="text-sm text-gray-600">{item.nombre}</p>
                    <p className="text-xs text-gray-500">{item.ubicacion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.stock}</p>
                    <p className="text-xs text-gray-500">Min: {item.minimo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Movimientos por Tipo */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Movimientos por Tipo
              </h3>
              <button
                onClick={() => handleExportarReporte('movimientos')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportes.movimientosPorTipo?.map((movimiento, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{movimiento.tipo}</p>
                    <p className="text-sm text-gray-600">{movimiento.cantidad} movimientos</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      movimiento.valor >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${movimiento.valor.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventario por Ubicación */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                Inventario por Ubicación
              </h3>
              <button
                onClick={() => handleExportarReporte('inventario_ubicacion')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportes.inventarioPorUbicacion?.map((ubicacion, index) => {
                const porcentaje = (ubicacion.valor / reportes.resumen.valorInventario * 100).toFixed(1);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{ubicacion.ubicacion}</span>
                      <span className="text-sm text-gray-600">{porcentaje}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{ubicacion.productos} productos</span>
                      <span>${ubicacion.valor.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Productos Populares */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Productos Populares
              </h3>
              <button
                onClick={() => handleExportarReporte('productos_populares')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reportes.productosPopulares?.map((producto, index) => (
                <div key={producto.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">{producto.variantes} variantes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{producto.movimientos} mov.</p>
                    <p className="text-xs text-gray-500">${producto.valor.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencias - Placeholder */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              Tendencia de Movimientos
            </h3>
            <button
              onClick={() => handleExportarReporte('tendencias')}
              className="text-blue-600 hover:text-blue-800"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Gráfico de tendencias de entradas y salidas
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Aquí se mostraría un gráfico interactivo con Chart.js o similar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reportes;