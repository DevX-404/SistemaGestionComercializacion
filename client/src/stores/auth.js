import { defineStore } from 'pinia';
import api from '../api/axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async login(username, password) {
            try {
                const { data } = await api.post('/auth/login', { username, password });
                
                this.token = data.token;
                this.user = data.usuario;

                // Guardar en navegador para no perder sesión al recargar
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.usuario));

                // Configurar axios para usar el token en futuras peticiones
                // (Esto requiere un pequeño ajuste en axios.js, luego lo hacemos)
                
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
    }
});