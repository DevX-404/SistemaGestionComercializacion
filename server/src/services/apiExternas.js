const axios = require('axios');

const BASE_URL = 'https://api.decolecta.com';
const TOKEN = process.env.DECOLECTA_TOKEN || 'sk_11976.whBb9qRvjhUkkBFTIMuuDP92qiaIOCr2';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${TOKEN}`, 
        'Content-Type': 'application/json'
    }
});

const consultarDNI = async (numero) => {
    try {
        console.log(`🔎 Buscando DNI ${numero} en DECOLECTA (${BASE_URL})...`);
        
        // Endpoint exacto de la documentación
        const response = await apiClient.get(`/v1/reniec/dni?numero=${numero}`);
        const data = response.data;

        // Validación: A veces la API devuelve éxito pero sin datos (data es null)
        if (!data) return null;

        const nombreCompleto = data.full_name || `${data.first_name} ${data.first_last_name} ${data.second_last_name}`;

        return {
            nombre: nombreCompleto,
            direccion: '' 
        };

    } catch (error) {
        // Imprimimos el error completo para verlo en consola
        console.error('❌ Error API DNI Detalle:', error.code || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return null;
    }
};

const consultarRUC = async (numero) => {
    try {
        console.log(`🔎 Buscando RUC ${numero} en DECOLECTA (${BASE_URL})...`);

        const response = await apiClient.get(`/v1/sunat/ruc?numero=${numero}`);
        const data = response.data;

        if (!data) return null;

        return {
            razon_social: data.razon_social,
            direccion: data.direccion || 'Sin dirección registrada',
            estado: data.estado,
            condicion: data.condicion
        };

    } catch (error) {
        console.error('❌ Error API RUC Detalle:', error.message);
        return null;
    }
};

module.exports = { consultarDNI, consultarRUC };