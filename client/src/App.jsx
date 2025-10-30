import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ModuleCard from './components/ModuleCard';
import Suppliers from './components/Suppliers';
import Categories from './components/Categories';
import Locations from './components/Locations';
import Products from './components/Products';
import ProductVariants from './components/ProductVariants';
import storageService from './services/storageService';
import {
  useSuppliers,
  useCategories,
  useLocations,
  useProducts,
  useVariants
} from './hooks/useInventory';

function App() {
  const [activeModule, setActiveModule] = useState(null);
  const { suppliers } = useSuppliers();
  const { categories } = useCategories();
  const { locations } = useLocations();
  const { products } = useProducts();
  const { variants } = useVariants();

  useEffect(() => {
    // Initialize sample data on first load
    storageService.initializeSampleData();
  }, []);

  const modules = [
    {
      id: 'suppliers',
      title: 'Proveedores',
      description: 'Gestiona tus proveedores y sus datos de contacto',
      icon: '🏢',
      count: suppliers.length
    },
    {
      id: 'categories',
      title: 'Categorías',
      description: 'Organiza tus productos en categorías',
      icon: '🏷️',
      count: categories.length
    },
    {
      id: 'locations',
      title: 'Ubicaciones',
      description: 'Administra almacenes y ubicaciones de inventario',
      icon: '📍',
      count: locations.length
    },
    {
      id: 'products',
      title: 'Productos',
      description: 'Gestiona tu catálogo de productos',
      icon: '📦',
      count: products.length
    },
    {
      id: 'variants',
      title: 'Variantes',
      description: 'Administra variantes de productos (tallas, colores, etc.)',
      icon: '🔄',
      count: variants.length
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'suppliers':
        return <Suppliers onBack={() => setActiveModule(null)} />;
      case 'categories':
        return <Categories onBack={() => setActiveModule(null)} />;
      case 'locations':
        return <Locations onBack={() => setActiveModule(null)} />;
      case 'products':
        return <Products onBack={() => setActiveModule(null)} />;
      case 'variants':
        return <ProductVariants onBack={() => setActiveModule(null)} />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Sistema de Gestión de Inventarios
              </h2>
              <p className="text-gray-600">
                Selecciona un módulo para comenzar a gestionar tu inventario
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  count={module.count}
                  onClick={() => setActiveModule(module.id)}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      {renderModule()}
    </Layout>
  );
}

export default App;
