const express = require('express');
const cors = require('cors');
const { connectMySQL, connectPostgres, connectMongo } = require('./src/config/databases');
const inventarioRoutes = require('./src/routes/inventario.routes');
const ventasRoutes = require('./src/routes/ventas.routes');
const clientesRoutes = require('./src/routes/clientes.routes');
const authRoutes = require('./src/routes/auth.routes');
const proveedoresRoutes = require('./src/routes/proveedores.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const reportesRoutes = require('./src/routes/reportes.routes');
const productosRoutes = require('./src/routes/productos.routes');
const kardexRoutes = require('./src/routes/kardex.routes');
const cuentasRoutes = require('./src/routes/cuentas.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const categoriaRoutes = require('./src/routes/categorias.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares (Para que el servidor entienda JSON)
app.use(cors());
app.use(express.json());
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/kardex', kardexRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use(express.static('public'));

// Función para iniciar el sistema monstruoso
const startServer = async () => {
    console.log('--- INICIANDO SISTEMA DE COMERCIALIZACIÓN ---');
    
    // 1. Conectar a las 3 Bases de Datos
    await connectMySQL();
    await connectPostgres();
    await connectMongo();

    console.log('--- TODAS LAS BASES DE DATOS CONECTADAS ---');

    // 2. Ruta de prueba (Ping)
    app.get('/', (req, res) => {
        res.json({ 
            mensaje: 'Bienvenido al API del Sistema Monstruoso',
            estado: 'En línea',
            bases_datos: 'MySQL, PostgreSQL, MongoDB: OK'
        });
    });

    // 3. Arrancar servidor
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();