import { defineStore } from 'pinia';
import api from '../api/axios';

export const useInventarioStore = defineStore('inventario', {
    state: () => ({
        productos: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchProductos() {
            this.loading = true;
            try {
                // Llama al backend monstruoso
                const { data } = await api.get('/inventario');
                this.productos = data;
            } catch (err) {
                console.error("Error cargando inventario:", err);
                this.error = "No se pudo conectar con el servidor";
            } finally {
                this.loading = false;
            }
        }
    }
});