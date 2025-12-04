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
        async login(credenciales) {
            try {
                const { data } = await api.post('/auth/login', credenciales);
                
                this.token = data.token;
                this.user = data.user; // Aquí se guardan los accesos
                
                // Guardar en LocalStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user)); // Persistir usuario completo
                
                router.push('/admin/dashboard');

                return true;
            } catch (error) {
                throw error;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        },
        // Agrega esto dentro de "actions" en tu auth.js
        hasPermission(permisoRequerido) {
            if (!this.user) return false;
            if (this.user.rol === 'ADMIN') return true; // Admin ve todo

            // Si el usuario tiene una lista de permisos en su perfil
            return this.user.perfil?.permisos?.includes(permisoRequerido) || false;
        }
    }
});