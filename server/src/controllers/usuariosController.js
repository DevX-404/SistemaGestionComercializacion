const Usuario = require('../models/nosql/Usuario');
const bcrypt = require('bcryptjs');

// 1. Listar Usuarios (Sin devolver la contraseña)
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, '-password').sort({ createdAt: -1 });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear Usuario (Hash de password)
const crearUsuario = async (req, res) => {
    try {
        const { username, password, nombre_completo, email, rol, avatar } = req.body;

        // Validar duplicados
        const existe = await Usuario.findOne({ username });
        if (existe) return res.status(400).json({ message: 'El usuario ya existe' });

        // Encriptar password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Crear en Mongo
        const nuevoUsuario = new Usuario({
            username,
            password: hash,
            nombre_completo,
            email,
            rol,
            perfil: {
                avatar: avatar || 'https://i.pravatar.cc/150?img=1', // Avatar por defecto
                tema: 'light',
                permisos: rol === 'ADMIN' ? ['all'] : ['ventas'] // Permisos básicos según rol
            }
        });

        await nuevoUsuario.save();
        res.status(201).json({ message: 'Usuario creado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Eliminar Usuario
const eliminarUsuario = async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Editar Usuario (Roles y Permisos)
const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, email, rol, permisos, password } = req.body;

        // Preparamos el objeto a actualizar
        const updateData = {
            nombre_completo,
            email,
            rol,
            "perfil.permisos": permisos // Actualizamos los permisos específicos
        };

        // Si mandaron contraseña nueva, la encriptamos. Si no, la dejamos igual.
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        
        if (!usuarioActualizado) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Usuario actualizado', usuario: usuarioActualizado });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NO OLVIDES AGREGARLO AL EXPORT AL FINAL DEL ARCHIVO:
module.exports = { getUsuarios, crearUsuario, eliminarUsuario, editarUsuario };