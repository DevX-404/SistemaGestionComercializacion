const Usuario = require('../models/nosql/Usuario');
const bcrypt = require('bcryptjs');

// Listar todos (Solo mostramos lo necesario)
const listar = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, '-password'); // El guion quita el password
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear Usuario Nuevo
const crear = async (req, res) => {
    try {
        const { username, password, nombre_completo, rol, permisos } = req.body;

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            username,
            password: hash,
            nombre_completo,
            rol,
            perfil: { permisos: permisos || [] }
        });

        await nuevoUsuario.save();
        res.json({ message: 'Usuario creado correctamente' });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Editar Usuario
const editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...datos } = req.body; // Separamos password

        // Si mandan contraseña nueva, la encriptamos
        if (password && password.length > 0) {
            const salt = await bcrypt.genSalt(10);
            datos.password = await bcrypt.hash(password, salt);
        }

        // Actualizamos perfil.permisos manualmente si viene
        if (req.body.permisos) {
            datos['perfil.permisos'] = req.body.permisos;
        }

        await Usuario.findByIdAndUpdate(id, datos);
        res.json({ message: 'Usuario actualizado' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar
const eliminar = async (req, res) => {
    try {
        await Usuario.findByIdAndUpdate(req.params.id, { estado: 'INACTIVO' });
        res.json({ message: 'Usuario inactivado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listar, crear, editar, eliminar };