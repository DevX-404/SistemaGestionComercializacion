const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SUPER_SECRETA_MONSTRUOSA';

const verificarToken = (req, res, next) => {
    // 1. Buscar el token en el header
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No hay token.' });
    }

    try {
        // 2. Verificar si es válido 
        const tokenReal = token.split(" ")[1];
        const decoded = jwt.verify(tokenReal, JWT_SECRET);

        // 3. Guardar datos del usuario en la petición para usarlos luego
        req.usuario = decoded;
        next(); 

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar Permisos Específicos
const verificarPermiso = (permisoRequerido) => {
    return (req, res, next) => {
        const { rol, perfil } = req.usuario; 

        if (rol === 'ADMIN') return next();

        if (req.usuario.perfil && req.usuario.perfil.permisos && req.usuario.perfil.permisos.includes(permisoRequerido)) {
            return next();
        }
        return res.status(403).json({ message: 'No tienes permisos suficientes' });
    };
};

module.exports = { verificarToken, verificarPermiso };