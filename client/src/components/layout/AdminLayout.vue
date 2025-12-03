<template>
  <div class="admin-layout" :class="{ 'mobile-open': showSidebar }">
    
    <Sidebar class="sidebar-area" :class="{ 'open': showSidebar }" @close="showSidebar = false" />

    <div class="main-content">
      <TopBar @toggle-sidebar="showSidebar = !showSidebar" />
      
      <div class="view-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <div v-if="showSidebar" class="mobile-overlay" @click="showSidebar = false"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';
import TopBar from './TopBar.vue';

const showSidebar = ref(false);
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fe;
  position: relative;
}

/* --- SIDEBAR --- */
.sidebar-area {
  width: 260px;
  flex-shrink: 0; /* No encogerse */
  height: 100vh;
  position: fixed; /* Fijo para que no scrollee con la página */
  top: 0;
  left: 0;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* --- CONTENIDO PRINCIPAL --- */
.main-content {
  flex: 1;
  margin-left: 260px; /* Empujamos el contenido para respetar el sidebar */
  width: calc(100% - 260px); /* Ancho restante exacto */
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.view-wrapper {
  padding: 20px 30px;
  flex: 1;
}

/* --- RESPONSIVE (Móvil y Tablets) --- */
@media (max-width: 992px) {
  .sidebar-area {
    transform: translateX(-100%); /* Ocultar sidebar por defecto */
    box-shadow: none;
  }
  
  .sidebar-area.open {
    transform: translateX(0); /* Mostrar al activar */
    box-shadow: 0 0 50px rgba(0,0,0,0.2); /* Sombra fuerte al abrir */
  }

  .main-content {
    margin-left: 0 !important; /* Contenido ocupa todo */
    width: 100% !important;
  }

  .mobile-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 99;
    backdrop-filter: blur(2px);
  }
}
</style>