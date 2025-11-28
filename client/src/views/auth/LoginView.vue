<template>
  <div class="login-container">
    <div class="login-card">
        <div class="brand">
            <h1>👺 MONSTER<span class="lite">SYS</span></h1>
            <p>Acceso al Sistema de Gestión</p>
        </div>
        
        <form @submit.prevent="handleLogin">
            <div class="input-group">
                <label>Usuario</label>
                <input type="text" v-model="username" placeholder="admin" required>
            </div>
            
            <div class="input-group">
                <label>Contraseña</label>
                <input type="password" v-model="password" placeholder="admin123" required>
            </div>
            
            <button type="submit" :disabled="loading" class="btn-login">
                {{ loading ? 'Ingresando...' : 'INICIAR SESIÓN' }}
            </button>
            
            <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';
    
    const success = await auth.login(username.value, password.value);
    
    if (success) {
        router.push('/admin/dashboard'); // Redirigir al dashboard
    } else {
        errorMsg.value = 'Credenciales incorrectas';
    }
    loading.value = false;
};
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1a1a27 0%, #2c3e50 100%);
}
.login-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    width: 350px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    text-align: center;
}
.brand h1 { margin: 0; color: #2c3e50; }
.lite { color: #3498db; }
.brand p { color: #7f8c8d; margin-bottom: 30px; }

.input-group { margin-bottom: 20px; text-align: left; }
.input-group label { display: block; font-size: 0.9rem; margin-bottom: 5px; color: #333; font-weight: bold; }
.input-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }

.btn-login { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-login:hover { background: #2980b9; }

.error { color: #e74c3c; margin-top: 15px; font-size: 0.9rem; }
</style>