require('dotenv').config(); 

// 1. Configuración de MySQL (Ventas)
const mysql = require('mysql2/promise');

const connectMySQL = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_MYSQL_HOST,
            user: process.env.DB_MYSQL_USER,
            password: process.env.DB_MYSQL_PASS,
            database: process.env.DB_MYSQL_NAME
        });
        console.log('✅ MySQL Conectado (Ventas)');
        return connection;
    } catch (error) {
        console.error('❌ Error conectando MySQL:', error.message);
        process.exit(1);
    }
};

// 2. Configuración de PostgreSQL (Logística)
const { Pool } = require('pg');

const poolPg = new Pool({
    host: process.env.DB_PG_HOST,
    user: process.env.DB_PG_USER,
    password: process.env.DB_PG_PASS,
    database: process.env.DB_PG_NAME,
    port: process.env.DB_PG_PORT
});

const connectPostgres = async () => {
    try {
        await poolPg.query('SELECT NOW()'); 
        console.log('✅ PostgreSQL Conectado (Logística)');
        return poolPg;
    } catch (error) {
        console.error('❌ Error conectando PostgreSQL:', error.message);
        process.exit(1);
    }
};

// 3. Configuración de MongoDB (Catálogo)
const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO_URI);
        console.log('✅ MongoDB Conectado (Catálogo)');
    } catch (error) {
        console.error('❌ Error conectando MongoDB:', error.message);
        process.exit(1);
    }
};

// Exportamos las funciones para usarlas en el servidor
module.exports = { connectMySQL, connectPostgres, connectMongo, poolPg };