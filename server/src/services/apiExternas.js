const axios = require('axios');

// Si tienes un token de apis.net.pe o similar, ponlo aquí:
const API_TOKEN = 'TU_TOKEN_AQUI'; 
const BASE_URL = 'https://api.apis.net.pe/v1'; // Ejemplo de API común en Perú

const consultarDNI = async (numero) => {
    try {
        console.log(`🔎 Buscando DNI ${numero} en RENIEC...`);
        
        // --- MODO DEMO (Simulación para que siempre te funcione al presentar) ---
        // Si quieres usar API real, comenta este bloque y descomenta el de abajo
        if (numero === '12345678') return { nombre: 'JUAN PEREZ DEL BARRIO', direccion: 'Av. Siempre Viva 123' };
        if (numero.length === 8) return { nombre: 'CIUDADANO EJEMPLO RENIEC', direccion: 'Jr. La Union 555, Lima' };
        // -----------------------------------------------------------------------

        /* MODO REAL (Descomentar si compras un token)
        const response = await axios.get(`${BASE_URL}/dni?numero=${numero}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return {
            nombre: response.data.nombre,
            direccion: response.data.direccion || ''
        };
        */
       
    } catch (error) {
        console.error('Error API RENIEC:', error.message);
        return null; // Si falla, devolvemos null para que el usuario escriba manual
    }
};

const consultarRUC = async (numero) => {
    try {
        console.log(`🔎 Buscando RUC ${numero} en SUNAT...`);

        // --- MODO DEMO ---
        if (numero === '20100000001') return { razon_social: 'EMPRESA MONSTRUOSA S.A.C.', direccion: 'Av. Javier Prado 2020', estado: 'ACTIVO' };
        if (numero.length === 11) return { razon_social: 'COMERCIALIZADORA GENERICA E.I.R.L.', direccion: 'Zona Industrial Mz A', estado: 'ACTIVO' };
        // -----------------

        /* MODO REAL
        const response = await axios.get(`${BASE_URL}/ruc?numero=${numero}`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
        return {
            razon_social: response.data.nombre,
            direccion: response.data.direccion,
            estado: response.data.estado
        };
        */

    } catch (error) {
        console.error('Error API SUNAT:', error.message);
        return null;
    }
};

module.exports = { consultarDNI, consultarRUC };