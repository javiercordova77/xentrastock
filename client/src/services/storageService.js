// Service for managing data in local storage
const STORAGE_KEYS = {
  SUPPLIERS: 'xentrastock_suppliers',
  CATEGORIES: 'xentrastock_categories',
  LOCATIONS: 'xentrastock_locations',
  PRODUCTS: 'xentrastock_products',
  VARIANTS: 'xentrastock_variants'
};

class StorageService {
  // Generic methods for CRUD operations
  getAll(key) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  }

  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === id);
  }

  create(key, item) {
    const items = this.getAll(key);
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.saveAll(key, items);
    return newItem;
  }

  update(key, id, updates) {
    const items = this.getAll(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      id, // Preserve ID
      updatedAt: new Date().toISOString()
    };
    this.saveAll(key, items);
    return items[index];
  }

  delete(key, id) {
    const items = this.getAll(key);
    const filtered = items.filter(item => item.id !== id);
    this.saveAll(key, filtered);
    return true;
  }

  saveAll(key, items) {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize with sample data if empty
  initializeSampleData() {
    if (this.getAll('SUPPLIERS').length === 0) {
      this.create('SUPPLIERS', { name: 'Proveedor Ejemplo', email: 'ejemplo@proveedor.com', phone: '555-0100' });
    }
    if (this.getAll('CATEGORIES').length === 0) {
      this.create('CATEGORIES', { name: 'Electrónica', description: 'Productos electrónicos' });
      this.create('CATEGORIES', { name: 'Ropa', description: 'Ropa y accesorios' });
    }
    if (this.getAll('LOCATIONS').length === 0) {
      this.create('LOCATIONS', { name: 'Almacén Principal', address: 'Calle Principal 123', capacity: 1000 });
    }
  }
}

export const storageService = new StorageService();
export default storageService;
