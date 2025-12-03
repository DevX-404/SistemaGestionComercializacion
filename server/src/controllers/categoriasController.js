const Categoria = require('../models/nosql/Categoria');

const listar = async (req, res) => {
    try {
        const docs = await Categoria.find({ estado: true });
        res.json(docs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const crear = async (req, res) => {
    try {
        const nueva = await Categoria.create(req.body);
        res.json(nueva);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

const eliminar = async (req, res) => {
    try {
        // Eliminado lógico (solo cambiamos estado)
        await Categoria.findByIdAndUpdate(req.params.id, { estado: false });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listar, crear, eliminar };