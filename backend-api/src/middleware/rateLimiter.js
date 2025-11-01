/**
 * Middleware de rate limiting - Configuración optimizada para producción
 */

const rateLimit = require('express-rate-limit');

// Rate limiter general - más permisivo para operaciones normales
const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minuto
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // 1000 requests por minuto
    message: {
        success: false,
        message: 'Demasiadas peticiones, intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Solo aplicar a IPs específicas si hay abuso
    skip: (req) => {
        // Permitir requests del frontend local durante desarrollo
        const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost');
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return isDevelopment && isLocalhost;
    }
});

// Rate limiter estricto para operaciones de autenticación/login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 intentos de login por IP cada 15 minutos
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter para operaciones de escritura (POST, PUT, DELETE)
const writeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 operaciones de escritura por minuto
    message: {
        success: false,
        message: 'Demasiadas operaciones de escritura, intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    rateLimiter,
    authLimiter,
    writeLimiter
};