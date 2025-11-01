import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Proveedores from './pages/Proveedores';
import Categorias from './pages/Categorias';
import Ubicaciones from './pages/Ubicaciones';
import Productos from './pages/Productos';
import Variantes from './pages/Variantes';
import Inventario from './pages/Inventario';
import Movimientos from './pages/Movimientos';
import Transferencias from './pages/Transferencias';
import Reportes from './pages/Reportes';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/ubicaciones" element={<Ubicaciones />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/variantes" element={<Variantes />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/transferencias" element={<Transferencias />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
