const ventasService = require('../services/VentasService');
const { connectMySQL } = require('../config/databases');

const procesarVenta = async (req, res) => {
    try {
        // 1. Recibir datos
        const datosVenta = req.body;

        // 2. Llamar al servicio (El experto)
        const resultado = await ventasService.crearNuevaVenta(datosVenta);

        // 3. Responder al cliente
        res.status(200).json(resultado);

    } catch (error) {
        // 4. Manejo de errores centralizado
        res.status(400).json({
            success: false,
            mensaje: error.message
        });
    }
};

// NUEVO: Obtener detalle completo de una venta (CORREGIDO)
const obtenerDetalleVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await connectMySQL();
        
        // 1. Cabecera (SIN JOIN CON USUARIOS)
        // MySQL no conoce a Mongo, así que solo pedimos el usuario_id string
        const [cabecera] = await connection.execute(`
            SELECT 
                v.id, v.fecha_emision, v.tipo_pago, v.total, v.usuario_id,
                c.razon_social, c.numero_documento, c.direccion, c.email
            FROM ventas_cabecera v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = ?
        `, [id]);

        if (cabecera.length === 0) {
            await connection.end();
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        // 2. Items
        const [detalles] = await connection.execute(`
            SELECT producto_sku as sku, cantidad, precio_unitario, subtotal 
            FROM ventas_detalle WHERE venta_id = ?
        `, [id]);

        await connection.end();
        
        // Opcional: Aquí podríamos buscar el nombre del usuario en Mongo si quisieras,
        // pero para que funcione YA, mandamos el usuario_id tal cual.
        
        res.json({ ...cabecera[0], items: detalles });

    } catch (error) {
        console.error("Error en Detalle Venta:", error); // Para ver en consola
        res.status(500).json({ error: 'Error al obtener detalle de venta en BD' });
    }
};

module.exports = { procesarVenta, obtenerDetalleVenta };