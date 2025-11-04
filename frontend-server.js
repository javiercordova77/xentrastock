const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_modern.html'));
});

// Ruta para la interfaz moderna
app.get('/modern', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_modern.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor frontend corriendo en: http://localhost:${PORT}`);
    console.log(`🚀 Interfaz moderna: http://localhost:${PORT}/modern`);
    console.log(`📊 Backend API: http://localhost:3001`);
});