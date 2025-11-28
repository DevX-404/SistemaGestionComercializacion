const { poolPg } = require('../config/databases');

// 1. Listar Proveedores
const getProveedores = async (req, res) => {
    try {
        const query = 'SELECT * FROM proveedores ORDER BY id DESC';
        const { rows } = await poolPg.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear Proveedor
const crearProveedor = async (req, res) => {
    const { ruc, razon_social, contacto_nombre, telefono, direccion } = req.body;
    
    try {
        // Validación básica
        if (!ruc || !razon_social) {
            return res.status(400).json({ message: 'RUC y Razón Social son obligatorios' });
        }

        const query = `
            INSERT INTO proveedores (ruc, razon_social, contacto_nombre, telefono, direccion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [ruc, razon_social, contacto_nombre, telefono, direccion];
        const { rows } = await poolPg.query(query, values);
        
        res.status(201).json({ message: 'Proveedor creado', proveedor: rows[0] });

    } catch (error) {
        // Error común: RUC duplicado (violación de unique constraint)
        if (error.code === '23505') {
            return res.status(400).json({ message: 'El RUC ya está registrado' });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getProveedores, crearProveedor };