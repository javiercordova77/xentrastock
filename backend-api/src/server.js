/**
 * Servidor principal de XentraStock v3.0 API
 * Arquitectura separada con Express puro para API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const config = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE SETUP
// ============================================================

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'XentraStock v3.0 API está funcionando',
        timestamp: new Date().toISOString(),
        version: '3.0.0'
    });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl
    });
});

// ============================================================
// SERVER STARTUP
// ============================================================

let server = null;

async function startServer() {
    try {
        // Initialize database
        await config.initializeDatabase();
        
        server = app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 XentraStock v3.0 API Server');
            console.log('📅 Iniciado:', new Date().toLocaleString());
            console.log('🌐 Puerto:', PORT);
            console.log('🔗 URL:', `http://localhost:${PORT}`);
            console.log('💻 Health Check:', `http://localhost:${PORT}/health`);
            console.log('📊 API Base:', `http://localhost:${PORT}/api`);
            console.log('🔄 Modo:', process.env.NODE_ENV || 'development');
            console.log('✅ Servidor listo para recibir peticiones');
        });

        // Configurar timeouts del servidor
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre elegante
function shutdown(signal) {
    console.log(`\n🛑 Recibido ${signal}. Cerrando servidor...`);
    
    if (server) {
        server.close((err) => {
            if (err) {
                console.error('❌ Error cerrando servidor:', err);
                process.exit(1);
            }
            console.log('✅ Servidor HTTP cerrado.');
            
            // Cerrar conexión de base de datos
            config.close().then(() => {
                console.log('✅ Base de datos cerrada.');
                process.exit(0);
            }).catch((error) => {
                console.error('❌ Error cerrando base de datos:', error);
                process.exit(1);
            });
        });
        
        // Forzar cierre si tarda más de 8 segundos
        setTimeout(() => {
            console.log('⚠️ Forzando cierre del servidor...');
            process.exit(1);
        }, 8000).unref();
    } else {
        process.exit(0);
    }
}

// Capturar señales de cierre
['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => {
    process.on(signal, () => shutdown(signal));
});

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
    shutdown('unhandledRejection');
});

startServer();