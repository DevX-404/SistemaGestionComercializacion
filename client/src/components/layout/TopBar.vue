<template>
  <header class="topbar-argon">
    <div class="left-section">
      <button class="burger-btn" @click="$emit('toggle-sidebar')">
        ☰
      </button>
      
      <div class="breadcrumb">
        <small>Admin /</small>
        <h4 class="current-route">{{ route.name?.toUpperCase() || 'DASHBOARD' }}</h4>
      </div>
    </div>
    
    <div class="user-profile">
      <div class="user-text">
        <span class="name">{{ auth.user?.nombre || 'Admin' }}</span>
        <span class="role">{{ auth.user?.rol || 'Gerente' }}</span>
      </div>
      <img :src="auth.user?.perfil?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'" class="avatar-img">
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
import { useRoute } from 'vue-router';
const auth = useAuthStore();
const route = useRoute();
defineEmits(['toggle-sidebar']);
</script>

<style scoped>
.topbar-argon {
  height: 70px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 30px;
  background: transparent; /* Se fusiona con el fondo */
}

.left-section { display: flex; align-items: center; gap: 15px; }

.burger-btn {
  display: none; /* Oculto en PC */
  background: white; border: none; font-size: 1.5rem;
  padding: 5px 10px; border-radius: 5px; color: #5e72e4;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer;
}

/* Mostrar hamburguesa solo en pantallas chicas */
@media (max-width: 992px) {
  .burger-btn { display: block; }
  .topbar-argon { padding: 0 15px; }
}

.breadcrumb small { color: #8898aa; font-weight: 600; }
.current-route { margin: 0; color: #172b4d; font-weight: 800; letter-spacing: 1px; }

.user-profile { display: flex; align-items: center; gap: 15px; background: white; padding: 5px 15px; border-radius: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.user-text { display: flex; flex-direction: column; text-align: right; line-height: 1.2; }
.name { font-size: 0.85rem; font-weight: 700; color: #32325d; }
.role { font-size: 0.65rem; color: #2dce89; font-weight: 600; text-transform: uppercase; }
.avatar-img { width: 35px; height: 35px; border-radius: 50%; border: 2px solid #f6f9fc; }
</style>