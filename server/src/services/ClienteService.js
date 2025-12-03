const { connectMySQL } = require('../config/databases');
const { consultarDNI, consultarRUC } = require('./apiExternas');

class ClienteService {

    async buscarOCrear({ tipo, numero }) {
        const connection = await connectMySQL();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM clientes WHERE tipo_documento = ? AND numero_documento = ?',
                [tipo, numero]
            );
            if (rows.length > 0) return { encontrado_en: 'BASE_DATOS', ...rows[0] };

            let datosExternos = null;
            if (tipo === 'DNI') datosExternos = await consultarDNI(numero);
            else if (tipo === 'RUC') datosExternos = await consultarRUC(numero);

            if (!datosExternos) throw new Error('No encontrado en padrón oficial.');
            
            return { 
                encontrado_en: 'API_EXTERNA', 
                tipo_documento: tipo, 
                numero_documento: numero, 
                ...datosExternos 
            };
        } finally { connection.end(); }
    }

    async crearCliente(datos) {
        const connection = await connectMySQL();
        try {
            const [existe] = await connection.execute('SELECT id FROM clientes WHERE numero_documento = ?', [datos.numero_documento]);
            if (existe.length > 0) throw new Error('El cliente ya existe.');

            const [res] = await connection.execute(
                `INSERT INTO clientes (tipo_documento, numero_documento, razon_social, direccion, email, telefono) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [datos.tipo_documento, datos.numero_documento, datos.razon_social, datos.direccion, datos.email, datos.telefono]
            );
            return { id: res.insertId, message: 'Cliente registrado' };
        } finally { connection.end(); }
    }

    async listarTodos() {
        const connection = await connectMySQL();
        const [rows] = await connection.execute('SELECT * FROM clientes ORDER BY id DESC');
        connection.end();
        return rows;
    }


    async actualizarCliente(id, datos) {
        const connection = await connectMySQL();
        try {
            await connection.execute(
                `UPDATE clientes SET razon_social=?, direccion=?, email=?, telefono=? WHERE id=?`,
                [datos.razon_social, datos.direccion, datos.email, datos.telefono, id]
            );
            return { message: 'Datos actualizados correctamente' };
        } finally { connection.end(); }
    }

    async eliminarCliente(id) {
        const connection = await connectMySQL();
        try {
            // 1. Verificar si tiene historial de ventas
            const [ventas] = await connection.execute(
                'SELECT id FROM ventas_cabecera WHERE cliente_id = ? LIMIT 1', 
                [id]
            );
            
            if (ventas.length > 0) {
                // LÓGICA EMPRESARIAL: Tiene historial, NO BORRAR, solo INACTIVAR
                await connection.execute(
                    "UPDATE clientes SET estado = 'INACTIVO' WHERE id = ?", 
                    [id]
                );
                return { 
                    action: 'INACTIVADO', 
                    message: 'Cliente pasado a INACTIVO (Tiene historial de ventas)' 
                };
            }

            // 2. Si está limpio (sin ventas), procedemos al borrado físico
            await connection.execute('DELETE FROM clientes WHERE id = ?', [id]);
            return { 
                action: 'ELIMINADO', 
                message: 'Cliente eliminado permanentemente' 
            };
            
        } finally { connection.end(); }
    }
}

module.exports = new ClienteService();