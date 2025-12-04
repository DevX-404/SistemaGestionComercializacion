<template>
  <div class="login-layout">
    
    <div class="brand-section">
      <div class="brand-overlay"></div>
      <div class="brand-content">
        <div class="logo-circle">👾</div>
        <h1>Tech<span class="light">Sys</span></h1>
        <p class="slogan">Gestión empresarial inteligente para negocios que crecen sin límites.</p>
      </div>
      <div class="circle c1"></div>
      <div class="circle c2"></div>
    </div>

    <div class="form-section">
      <div class="login-box fade-in-up">
        <div class="header-box">
          <h2>Bienvenido de nuevo</h2>
          <p class="text-muted">Ingresa tus credenciales para acceder</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Usuario / Correo</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                v-model="username" 
                placeholder="username" 
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                v-model="password" 
                placeholder="••••••" 
                class="form-control"
                required
              >
            </div>
          </div>

          <div class="actions-row">
            <label class="remember-me">
              <input type="checkbox"> Recordarme
            </label>
            <a href="#" class="forgot-link">¿Olvidaste tu clave?</a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">INICIAR SESIÓN ➔</span>
            <div v-else class="spinner"></div>
          </button>

          <div v-if="errorMsg" class="alert-error">
            ⚠️ {{ errorMsg }}
          </div>
        </form>

        <div class="footer-box">
          <p>© 2025 TechSys Inc. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
// import { useRouter } from 'vue-router'; // Ya lo maneja el store, pero por si acaso

const auth = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
    loading.value = true;
    errorMsg.value = '';
    
    try {
        // Llamamos a la acción corregida del store (que recibe objeto)
        await auth.login({ 
            username: username.value, 
            password: password.value 
        });
        // El store redirige a /admin/dashboard automáticamente
    } catch (error) {
        console.error(error);
        if (error.response?.data?.message) {
            errorMsg.value = error.response.data.message;
        } else {
            errorMsg.value = 'Error de conexión. Intente más tarde.';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* LAYOUT SPLIT */
.login-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: 'Segoe UI', sans-serif;
  background: white;
}

/* --- SECCIÓN IZQUIERDA (BRAND) --- */
.brand-section {
  flex: 1.2; /* Ocupa un poco más de la mitad */
  background: linear-gradient(135deg, #1a174d 0%, #281483 100%); /* Deep Purple */
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 40px;
}

.brand-content { z-index: 2; position: relative; }
.logo-circle { 
  font-size: 4rem; margin-bottom: 20px; 
  background: rgba(255,255,255,0.1); width: 100px; height: 100px; 
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px; backdrop-filter: blur(10px);
}
.brand-section h1 { font-size: 3rem; font-weight: 800; margin: 0; letter-spacing: -1px; }
.light { color: #11cdef; }
.slogan { margin-top: 15px; font-size: 1.1rem; opacity: 0.8; max-width: 400px; line-height: 1.5; }

/* Círculos Decorativos Animados */
.circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
.c1 { width: 300px; height: 300px; top: -50px; left: -50px; animation: float 10s infinite ease-in-out; }
.c2 { width: 500px; height: 500px; bottom: -100px; right: -100px; animation: float 15s infinite ease-in-out reverse; }

@keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(20px); } 100% { transform: translateY(0); } }

/* --- SECCIÓN DERECHA (FORM) --- */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.login-box { width: 100%; max-width: 400px; padding: 40px; }

.header-box { margin-bottom: 40px; text-align: left; }
.header-box h2 { font-size: 2rem; font-weight: 800; color: #32325d; margin: 0 0 10px 0; }
.text-muted { color: #8898aa; font-size: 0.95rem; }

.form-group { margin-bottom: 25px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #525f7f; font-size: 0.9rem; }

.input-wrapper { position: relative; }
.input-icon { position: absolute; left: 15px; top: 12px; color: #adb5bd; font-size: 1.1rem; }
.form-control {
  width: 100%; padding: 12px 12px 12px 45px;
  border: 1px solid #e9ecef; border-radius: 8px;
  background-color: #fcfcfc; color: #32325d; font-size: 1rem;
  transition: all 0.2s; box-sizing: border-box;
}
.form-control:focus { border-color: #5e72e4; background: white; box-shadow: 0 4px 6px rgba(50,50,93,.11); outline: none; }

.actions-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; font-size: 0.9rem; }
.remember-me { color: #525f7f; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.forgot-link { color: #5e72e4; text-decoration: none; font-weight: 600; }

.btn-login {
  width: 100%; padding: 14px;
  background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%);
  color: white; border: none; border-radius: 8px;
  font-weight: 800; font-size: 1rem; letter-spacing: 1px;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
}
.btn-login:hover { transform: translateY(-1px); box-shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08); }
.btn-login:active { transform: translateY(1px); }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.alert-error {
  margin-top: 20px; padding: 12px; border-radius: 8px;
  background: #fdedec; color: #f5365c; font-size: 0.9rem; text-align: center; border: 1px solid #f5365c;
  animation: shake 0.3s;
}

.footer-box { margin-top: 50px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
.footer-box p { color: #adb5bd; font-size: 0.8rem; }

/* Animaciones */
.fade-in-up { animation: fadeInUp 0.6s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive para celulares */
@media (max-width: 900px) {
  .login-layout { flex-direction: column; }
  .brand-section { display: none; } /* Opcional: Ocultar imagen en móvil para ahorrar espacio */
  .form-section { flex: 1; padding: 20px; }
}
</style>