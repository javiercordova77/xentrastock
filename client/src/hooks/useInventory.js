import { useState, useEffect } from 'react';
import storageService from '../services/storageService';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setSuppliers(storageService.getAll('SUPPLIERS'));
  };

  const addSupplier = (supplier) => {
    storageService.create('SUPPLIERS', supplier);
    loadSuppliers();
  };

  const updateSupplier = (id, updates) => {
    storageService.update('SUPPLIERS', id, updates);
    loadSuppliers();
  };

  const deleteSupplier = (id) => {
    storageService.delete('SUPPLIERS', id);
    loadSuppliers();
  };

  return { suppliers, addSupplier, updateSupplier, deleteSupplier, loadSuppliers };
};

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(storageService.getAll('CATEGORIES'));
  };

  const addCategory = (category) => {
    storageService.create('CATEGORIES', category);
    loadCategories();
  };

  const updateCategory = (id, updates) => {
    storageService.update('CATEGORIES', id, updates);
    loadCategories();
  };

  const deleteCategory = (id) => {
    storageService.delete('CATEGORIES', id);
    loadCategories();
  };

  return { categories, addCategory, updateCategory, deleteCategory, loadCategories };
};

export const useLocations = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = () => {
    setLocations(storageService.getAll('LOCATIONS'));
  };

  const addLocation = (location) => {
    storageService.create('LOCATIONS', location);
    loadLocations();
  };

  const updateLocation = (id, updates) => {
    storageService.update('LOCATIONS', id, updates);
    loadLocations();
  };

  const deleteLocation = (id) => {
    storageService.delete('LOCATIONS', id);
    loadLocations();
  };

  return { locations, addLocation, updateLocation, deleteLocation, loadLocations };
};

export const useProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(storageService.getAll('PRODUCTS'));
  };

  const addProduct = (product) => {
    storageService.create('PRODUCTS', product);
    loadProducts();
  };

  const updateProduct = (id, updates) => {
    storageService.update('PRODUCTS', id, updates);
    loadProducts();
  };

  const deleteProduct = (id) => {
    storageService.delete('PRODUCTS', id);
    loadProducts();
  };

  return { products, addProduct, updateProduct, deleteProduct, loadProducts };
};

export const useVariants = () => {
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = () => {
    setVariants(storageService.getAll('VARIANTS'));
  };

  const addVariant = (variant) => {
    storageService.create('VARIANTS', variant);
    loadVariants();
  };

  const updateVariant = (id, updates) => {
    storageService.update('VARIANTS', id, updates);
    loadVariants();
  };

  const deleteVariant = (id) => {
    storageService.delete('VARIANTS', id);
    loadVariants();
  };

  return { variants, addVariant, updateVariant, deleteVariant, loadVariants };
};
