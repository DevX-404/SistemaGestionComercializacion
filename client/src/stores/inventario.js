import { defineStore } from 'pinia';
import api from '../api/axios';

export const useInventarioStore = defineStore('inventario', {
    state: () => ({
        productos: [],
        loading: false
    }),
    actions: {
        async fetchProductos() {
            this.loading = true;
            try {
                const { data } = await api.get('/productos'); 
                
                this.productos = data;
            } catch (error) {
                console.error('Error cargando inventario:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});