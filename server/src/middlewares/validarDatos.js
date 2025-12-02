const validar = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            // Si hay error, devolvemos una lista limpia de qué falló
            const mensajes = error.details.map(err => err.message.replace(/"/g, ''));
            return res.status(400).json({ 
                success: false, 
                titulo: 'Datos incorrectos',
                errores: mensajes 
            });
        }
        
        next(); // Si todo está bien, pasa al controlador
    };
};

module.exports = validar;