const { poolPg } = require('../config/databases');

class ProveedorService {

    // 1. Listar todos los proveedores
    async listarTodos() {
        try {
            const query = 'SELECT * FROM proveedores ORDER BY id DESC';
            const result = await poolPg.query(query);
            return result.rows; // En Postgres la data viene en .rows
        } catch (error) {
            throw new Error('Error al obtener proveedores: ' + error.message);
        }
    }

    // 2. Registrar un nuevo proveedor
    async crear(datos) {
        const { ruc, razon_social, contacto_nombre, telefono, direccion } = datos;
        
        // Validación de negocio: ¿El RUC ya existe?
        const checkQuery = 'SELECT id FROM proveedores WHERE ruc = $1';
        const check = await poolPg.query(checkQuery, [ruc]);
        
        if (check.rows.length > 0) {
            throw new Error(`El proveedor con RUC ${ruc} ya está registrado.`);
        }

        const insertQuery = `
            INSERT INTO proveedores (ruc, razon_social, contacto_nombre, telefono, direccion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        
        try {
            const result = await poolPg.query(insertQuery, [
                ruc, razon_social, contacto_nombre, telefono, direccion
            ]);
            
            return { 
                success: true, 
                mensaje: 'Proveedor registrado correctamente en Logística.',
                datos: result.rows[0]
            };
        } catch (error) {
            throw new Error('Error al guardar en PostgreSQL: ' + error.message);
        }
    }
}

module.exports = new ProveedorService();