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
        const { username, password, nombre_completo, rol } = req.body;

        // Verificamos si ya existe
        const existe = await Usuario.findOne({ username });
        if(existe) return res.status(400).json({message: "El usuario ya existe"});

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Aseguramos estado: ACTIVO
        await Usuario.create({ 
            username, 
            password: hash, 
            nombre_completo, 
            rol, 
            accesos: accesos || [], // Guardamos los permisos
            estado: 'ACTIVO' 
        });
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// EDITAR (Lógica Enterprise)
const editar = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, ...resto } = req.body;

        // Si el usuario escribió algo en password, lo encriptamos. Si no, lo ignoramos.
        if (password && password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            resto.password = await bcrypt.hash(password, salt);
        } else {
            delete resto.password; // No tocar la contraseña actual
        }

        await Usuario.findByIdAndUpdate(id, resto);
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const eliminar = async (req, res) => {
    try {
        // SOFT DELETE
        await Usuario.findByIdAndUpdate(req.params.id, { estado: 'INACTIVO' });
        res.json({ message: 'Usuario inactivado correctamente' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const reactivar = async (req, res) => {
    try {
        await Usuario.findByIdAndUpdate(req.params.id, { estado: 'ACTIVO' });
        res.json({ message: 'Usuario reactivado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listar, crear, editar, eliminar, reactivar };