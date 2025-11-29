const Usuario = require('../models/nosql/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar tokens (Idealmente iría en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SUPER_SECRETA_MONSTRUOSA';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscar usuario en Mongo
        const user = await Usuario.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        // 3. Generar Token
        const token = jwt.sign(
            { id: user._id, rol: user.rol, nombre: user.nombre_completo },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                _id: user._id,
                username: user.username,
                nombre: user.nombre_completo,
                rol: user.rol,
                perfil: user.perfil // <--- ¡ESTO ES LO QUE FALTABA! Aquí viajan los permisos
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función auxiliar para crear el primer admin (ejecútala una vez o crea ruta)
const registrarAdminInicial = async (req, res) => {
    try {
        const existe = await Usuario.findOne({ username: 'admin' });
        if (existe) return res.json({ message: 'Admin ya existe' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt); // Contraseña inicial

        const nuevo = new Usuario({
            username: 'admin',
            password: hash,
            nombre_completo: 'Administrador Supremo',
            email: 'admin@monster.com',
            rol: 'ADMIN',
            perfil: { avatar: 'https://i.pravatar.cc/150?img=12', permisos: ['all'] }
        });

        await nuevo.save();
        res.json({ message: 'Usuario Admin creado: admin / admin123' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login, registrarAdminInicial };