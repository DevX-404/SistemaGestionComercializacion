const { connectMySQL } = require('../config/databases');
const { consultarDNI, consultarRUC } = require('../services/apiExternas');

// 1. Listar Clientes (Para la tabla)
const getClientes = async (req, res) => {
    try {
        const conn = await connectMySQL();
        const [rows] = await conn.execute('SELECT * FROM clientes ORDER BY id DESC');
        conn.end();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Buscar datos en API Externa (RENIEC/SUNAT)
const consultarExterno = async (req, res) => {
    const { tipo, numero } = req.body; // { tipo: 'DNI', numero: '...' }
    
    let datos = null;
    if (tipo === 'DNI') datos = await consultarDNI(numero);
    if (tipo === 'RUC') datos = await consultarRUC(numero);

    if (datos) res.json(datos);
    else res.status(404).json({ message: 'No encontrado en padrón oficial' });
};

// 3. Crear Cliente Nuevo
const crearCliente = async (req, res) => {
    const { tipo_documento, numero_documento, razon_social, direccion, email, telefono } = req.body;
    try {
        const conn = await connectMySQL();
        
        // Verificar si ya existe
        const [exists] = await conn.execute('SELECT id FROM clientes WHERE numero_documento = ?', [numero_documento]);
        if (exists.length > 0) return res.status(400).json({ message: 'El cliente ya existe' });

        await conn.execute(
            `INSERT INTO clientes (tipo_documento, numero_documento, razon_social, direccion, email, telefono) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tipo_documento, numero_documento, razon_social, direccion, email, telefono]
        );
        
        conn.end();
        res.status(201).json({ message: 'Cliente registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getClientes, consultarExterno, crearCliente };