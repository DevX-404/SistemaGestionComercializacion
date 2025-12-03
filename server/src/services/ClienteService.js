const { connectMySQL } = require('../config/databases');
const { consultarDNI, consultarRUC } = require('./apiExternas'); // Tu archivo de API

class ClienteService {

    // --- 1. Consultar (Lógica Inteligente) ---
    // Esta función es la que usa el botón "Consultar API"
    async buscarOCrear({ tipo, numero }) {
        const connection = await connectMySQL();

        try {
            // A. Primero buscamos en NUESTRA base de datos (Más rápido y gratis)
            const [rows] = await connection.execute(
                'SELECT * FROM clientes WHERE tipo_documento = ? AND numero_documento = ?',
                [tipo, numero]
            );

            if (rows.length > 0) {
                return { 
                    encontrado_en: 'BASE_DATOS',
                    ...rows[0] 
                };
            }

            // B. Si no existe, consultamos a la API EXTERNA (RENIEC/SUNAT)
            let datosExternos = null;
            
            if (tipo === 'DNI') {
                datosExternos = await consultarDNI(numero);
            } else if (tipo === 'RUC') {
                datosExternos = await consultarRUC(numero);
            }

            if (!datosExternos) {
                throw new Error('No se encontraron datos en el padrón oficial.');
            }

            return {
                encontrado_en: 'API_EXTERNA',
                tipo_documento: tipo,
                numero_documento: numero,
                ...datosExternos
            };

        } finally {
            connection.end();
        }
    }

    // --- 2. Guardar Cliente Nuevo ---
    async crearCliente(datos) {
        const connection = await connectMySQL();
        try {
            // Verificamos duplicados antes de insertar
            const [existe] = await connection.execute(
                'SELECT id FROM clientes WHERE numero_documento = ?', 
                [datos.numero_documento]
            );
            
            if (existe.length > 0) {
                throw new Error('El cliente ya está registrado.');
            }

            await connection.execute(
                `INSERT INTO clientes (tipo_documento, numero_documento, razon_social, direccion, email, telefono) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [datos.tipo_documento, datos.numero_documento, datos.razon_social, datos.direccion, datos.email, datos.telefono]
            );

            return { message: 'Cliente registrado correctamente' };
        } finally {
            connection.end();
        }
    }

    // --- 3. Listar Todos ---
    async listarTodos() {
        const connection = await connectMySQL();
        const [rows] = await connection.execute('SELECT * FROM clientes ORDER BY id DESC');
        connection.end();
        return rows;
    }
}

module.exports = new ClienteService();