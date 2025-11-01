import React, { useState, useEffect } from 'react';
import { Package, Users, MapPin, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalVariantes: 0,
    totalProveedores: 0,
    totalUbicaciones: 0,
    stockBajo: 0,
    movimientosHoy: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStats({
        totalProductos: 45,
        totalVariantes: 128,
        totalProveedores: 8,
        totalUbicaciones: 3,
        stockBajo: 12,
        movimientosHoy: 24
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statsCards = [
    {
      name: 'Total Productos',
      value: stats.totalProductos,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Variantes Activas',
      value: stats.totalVariantes,
      icon: Package,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      name: 'Proveedores',
      value: stats.totalProveedores,
      icon: Users,
      color: 'bg-purple-500',
      change: '+2'
    },
    {
      name: 'Ubicaciones',
      value: stats.totalUbicaciones,
      icon: MapPin,
      color: 'bg-yellow-500',
      change: '0'
    },
    {
      name: 'Stock Bajo',
      value: stats.stockBajo,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-3'
    },
    {
      name: 'Movimientos Hoy',
      value: stats.movimientosHoy,
      icon: Activity,
      color: 'bg-indigo-500',
      change: '+8'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema de inventario</p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del sistema de inventario</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <div key={stat.name} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.change !== '0' && (
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4 mr-1" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos con Stock Bajo */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Bajo</h3>
          <div className="space-y-3">
            {[
              { name: 'Producto A - Variante Roja', stock: 5, minimo: 10 },
              { name: 'Producto B - Variante Azul', stock: 2, minimo: 15 },
              { name: 'Producto C - Variante Verde', stock: 8, minimo: 20 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Mínimo: {item.minimo}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-red-600">{item.stock}</span>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Movimientos Recientes</h3>
          <div className="space-y-3">
            {[
              { tipo: 'Entrada', producto: 'Producto A', cantidad: 50, hora: '10:30' },
              { tipo: 'Salida', producto: 'Producto B', cantidad: -15, hora: '11:45' },
              { tipo: 'Transferencia', producto: 'Producto C', cantidad: 10, hora: '14:20' },
            ].map((mov, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{mov.producto}</p>
                  <p className="text-xs text-gray-500">{mov.tipo} - {mov.hora}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-semibold ${
                    mov.cantidad > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                  </span>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-primary flex flex-col items-center p-4 text-center">
            <Package className="w-6 h-6 mb-2" />
            <span className="text-sm">Nuevo Producto</span>
          </button>
          <button className="btn-secondary flex flex-col items-center p-4 text-center">
            <Activity className="w-6 h-6 mb-2" />
            <span className="text-sm">Registrar Movimiento</span>
          </button>
          <button className="btn-secondary flex flex-col items-center p-4 text-center">
            <Users className="w-6 h-6 mb-2" />
            <span className="text-sm">Nuevo Proveedor</span>
          </button>
          <button className="btn-secondary flex flex-col items-center p-4 text-center">
            <TrendingUp className="w-6 h-6 mb-2" />
            <span className="text-sm">Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;