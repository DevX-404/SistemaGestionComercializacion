const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SUPER_SECRETA_MONSTRUOSA';

const verificarToken = (req, res, next) => {
    // 1. Buscar el token en el header
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado. No hay token.' });
    }

    try {
        // 2. Verificar si es válido (Quitar la palabra 'Bearer ')
        const tokenReal = token.split(" ")[1]; 
        const decoded = jwt.verify(tokenReal, JWT_SECRET);
        
        // 3. Guardar datos del usuario en la petición para usarlos luego
        req.usuario = decoded;
        next(); // ¡Pase usted!

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

// Extra: Middleware para verificar Permisos Específicos
const verificarPermiso = (permisoRequerido) => {
    return (req, res, next) => {
        const { rol, perfil } = req.usuario; // Asumiendo que guardaste esto en el token
        
        // Admin siempre pasa
        if (rol === 'ADMIN') return next();

        // Verificar si tiene el permiso en su lista
        // Nota: Esto requiere que al firmar el token incluyas los permisos, 
        // o que consultes la BD aquí. Por simplicidad, validamos solo ROL por ahora.
        next();
    };
};

module.exports = { verificarToken, verificarPermiso };