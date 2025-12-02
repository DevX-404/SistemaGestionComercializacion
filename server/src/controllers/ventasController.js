const ventasService = require('../services/VentasService');

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

module.exports = { procesarVenta };