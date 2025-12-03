const { poolPg } = require('../config/databases');
const { consultarRUC } = require('./apiExternas'); // <--- IMPORTANTE

class ProveedorService {

    // 1. Listar
    async listarTodos() {
        const result = await poolPg.query('SELECT * FROM proveedores ORDER BY id DESC');
        return result.rows;
    }

    // 2. Crear
    async crear(datos) {
        const { ruc, razon_social, contacto_nombre, telefono, direccion } = datos;
        
        const check = await poolPg.query('SELECT id FROM proveedores WHERE ruc = $1', [ruc]);
        if (check.rows.length > 0) throw new Error(`El RUC ${ruc} ya está registrado.`);

        const result = await poolPg.query(
            `INSERT INTO proveedores (ruc, razon_social, contacto_nombre, telefono, direccion)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [ruc, razon_social, contacto_nombre, telefono, direccion]
        );
        return { success: true, datos: result.rows[0] };
    }

    // 3. Eliminar
    async eliminar(id) {
        await poolPg.query('DELETE FROM proveedores WHERE id = $1', [id]);
        return { success: true, message: 'Proveedor eliminado' };
    }

    // --- 4. NUEVO: BUSCAR RUC (DB o API) ---
    async buscarRUC(ruc) {
        // A. Buscar en PostgreSQL
        const check = await poolPg.query('SELECT * FROM proveedores WHERE ruc = $1', [ruc]);
        if (check.rows.length > 0) {
            return { encontrado_en: 'BASE_DATOS', ...check.rows[0] };
        }

        // B. Buscar en API SUNAT
        const datosSunat = await consultarRUC(ruc);
        if (!datosSunat) throw new Error('RUC no encontrado en SUNAT');

        return {
            encontrado_en: 'API_EXTERNA',
            ruc,
            razon_social: datosSunat.razon_social,
            direccion: datosSunat.direccion,
            estado: datosSunat.estado,
            condicion: datosSunat.condicion
        };
    }
}

module.exports = new ProveedorService();