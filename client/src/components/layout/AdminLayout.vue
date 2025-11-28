<template>
  <div class="admin-container">
    <Sidebar />
    <main class="main-content">
      <TopBar :title="currentRouteName" />
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import TopBar from './TopBar.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// Obtenemos el nombre de la ruta para el título (ej: "Orders", "Dashboard")
const currentRouteName = computed(() => route.name ? route.name.charAt(0).toUpperCase() + route.name.slice(1) : 'Dashboard');
</script>

<style scoped>
.admin-container { display: flex; background-color: var(--admin-bg); min-height: 100vh; }
.main-content {
    margin-left: 260px; /* Mismo ancho que el sidebar */
    flex: 1;
    padding: 30px;
    display: flex;
    flex-direction: column;
}
.content-body { flex: 1; }
</style>