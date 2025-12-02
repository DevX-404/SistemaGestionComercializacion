const { connectMySQL } = require('../config/databases');
// const axios = require('axios'); // Descomenta esto cuando tengas tu API Key real

class ClienteService {

    // 1. Buscar o Crear (Lógica de Negocio Profesional)
    // Esta función es la que llamará el "Punto de Venta" cuando escribas un DNI
    async buscarOCrear(documento) {
        const { tipo, numero } = documento;
        const connection = await connectMySQL();

        try {
            // A. Primero buscamos en NUESTRA base de datos local (MySQL)
            const [rows] = await connection.execute(
                'SELECT * FROM clientes WHERE numero_documento = ? AND tipo_documento = ?',
                [numero, tipo]
            );

            if (rows.length > 0) {
                // ¡El cliente ya existe! No gastamos saldo de API externa.
                return { encontrado: true, fuente: 'LOCAL', datos: rows[0] };
            }

            // B. Si no existe, consultamos API EXTERNA (Simulación Profesional)
            // Aquí iría tu llamada real a apisperu.com o similar.
            console.log(`📡 Consultando API externa para ${tipo}: ${numero}...`);
            
            let datosExternos = {};
            
            if (tipo === 'DNI') {
                // Simulación de respuesta RENIEC
                datosExternos = {
                    razon_social: 'JUAN PEREZ (DESDE RENIEC)',
                    direccion: 'AV. SIMULADA 123, LIMA',
                    telefono: '',
                    email: ''
                };
            } else {
                // Simulación de respuesta SUNAT
                datosExternos = {
                    razon_social: 'EMPRESA IMPORTADORA S.A.C.',
                    direccion: 'CALLE INDUSTRIAL 500, CALLAO',
                    telefono: '01-555-9999',
                    email: 'contacto@empresa.pe'
                };
            }

            // C. Guardamos el nuevo cliente automáticamente en MySQL
            // Así la próxima vez ya estará "cacheado" en tu sistema.
            const [insert] = await connection.execute(
                `INSERT INTO clientes (tipo_documento, numero_documento, razon_social, direccion, telefono, email) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [tipo, numero, datosExternos.razon_social, datosExternos.direccion, datosExternos.telefono, datosExternos.email]
            );

            // Devolvemos los datos listos al Frontend
            return {
                encontrado: true,
                fuente: 'API_EXTERNA',
                datos: {
                    id: insert.insertId,
                    tipo_documento: tipo,
                    numero_documento: numero,
                    ...datosExternos
                }
            };

        } catch (error) {
            throw new Error('Error al gestionar cliente: ' + error.message);
        } finally {
            connection.end();
        }
    }

    // 2. Listado General (Para el panel de administración)
    async listarTodos() {
        const connection = await connectMySQL();
        try {
            const [rows] = await connection.execute('SELECT * FROM clientes ORDER BY id DESC');
            return rows;
        } finally {
            connection.end();
        }
    }
}

module.exports = new ClienteService();