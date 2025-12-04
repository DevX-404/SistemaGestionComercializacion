const Categoria = require('../models/nosql/Categoria');
const Producto = require('../models/nosql/Producto'); 

const listar = async (req, res) => {
    try {
        const docs = await Categoria.find().sort({ createdAt: -1 });
        res.json(docs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

const crear = async (req, res) => {
    try {
        const existe = await Categoria.findOne({ nombre: req.body.nombre });
        if (existe) return res.status(400).json({ message: 'La categoría ya existe' });

        const nueva = await Categoria.create(req.body);
        res.json(nueva);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const cat = await Categoria.findById(id);
        if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });

        // Validación de Integridad
        const productosVinculados = await Producto.countDocuments({ categoria: cat.nombre, estado: 'ACTIVO' });
        if (productosVinculados > 0) {
            return res.status(409).json({ message: `⛔ DENEGADO: Hay ${productosVinculados} productos en esta categoría.` });
        }

        // SOFT DELETE (Solo cambiamos estado a false)
        await Categoria.findByIdAndUpdate(id, { estado: false });
        res.json({ success: true, message: 'Categoría inactivada' });

    } catch (e) { res.status(500).json({ error: e.message }); }
};

const reactivar = async (req, res) => {
    try {
        await Categoria.findByIdAndUpdate(req.params.id, { estado: true });
        res.json({ success: true, message: 'Categoría reactivada' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { listar, crear, eliminar, reactivar };