const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Importamos el modelo. Asegúrate que la ruta sea correcta según tu estructura
const Usuario = require('./src/models/nosql/Usuario'); 

const crearXimena = async () => {
    try {
        // 1. CONEXIÓN DIRECTA (Para evitar errores de .env)
        // Usamos la dirección estándar local. Si tu base se llama diferente, cámbialo al final.
        const MONGO_URI = 'mongodb://127.0.0.1:27017/db_catalogo'; 
        
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // 2. Limpiar usuario anterior si existe
        await Usuario.deleteOne({ username: 'Ximena' });

        // 3. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('1234', salt);

        // 4. Crear a Ximena (Admin Suprema)
        const adminSupremo = new Usuario({
            username: 'Ximena',
            password: hash,
            nombre_completo: 'Ximena Burga',
            rol: 'ADMIN',
            // Le damos acceso a TODO
            accesos: ['dashboard', 'ventas', 'creditos', 'clientes', 'productos', 'categorias', 'proveedores', 'kardex', 'reportes', 'usuarios', 'configuracion'],
            perfil: {
                avatar: 'https://ui-avatars.com/api/?name=Ximena+Burga&background=8e44ad&color=fff&size=150',
                tema: 'light'
            },
            estado: 'ACTIVO'
        });

        await adminSupremo.save();
        console.log('---------------------------------------------');
        console.log('👑 ¡ADMIN SUPREMO CREADO CON ÉXITO!');
        console.log('👤 Usuario: Ximena');
        console.log('🔑 Clave:   1234');
        console.log('---------------------------------------------');

    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        // 5. Cerrar conexión limpiamente
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('👋 Conexión cerrada.');
        }
    }
};

crearXimena();