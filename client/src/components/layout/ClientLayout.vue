<template>
  <div class="public-layout">
    <Navbar />
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer-pro">
      <div class="footer-content">
        <div class="brand">
          <h3>Tech<span class="light">Store</span></h3>
          <p>Tecnología que potencia tu mundo.</p>
        </div>
        <div class="links">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Soporte</a>
        </div>
        <div class="copy">© 2025 TechSys Inc.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
</script>

<style scoped>
.public-layout { min-height: 100vh; display: flex; flex-direction: column; background-color: #f8f9fe; }
.main-content { flex: 1; padding-top: 70px; /* Espacio para el navbar fijo */ }

.footer-pro { background: #172b4d; color: white; padding: 40px 20px; margin-top: auto; }
.footer-content { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; }
.brand h3 { margin: 0; font-size: 1.5rem; font-weight: 800; }
.light { color: #11cdef; }
.brand p { color: #8898aa; font-size: 0.9rem; margin-top: 5px; }
.links a { color: white; margin-left: 20px; text-decoration: none; font-size: 0.9rem; opacity: 0.8; transition: 0.2s; }
.links a:hover { opacity: 1; color: #11cdef; }
.copy { width: 100%; text-align: center; margin-top: 30px; color: #525f7f; font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }

/* Animación de vistas */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>