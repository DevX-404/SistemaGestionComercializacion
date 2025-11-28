// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '../components/layout/AdminLayout.vue';
import ClientLayout from '../components/layout/ClientLayout.vue';

// Vistas Admin
import VentasPosView from '../views/ventas/VentasPosView.vue';
import InventarioView from '../views/InventarioView.vue';
import ClientesView from '../views/admin/ClientesView.vue';

// Vistas Cliente
import HomeView from '../views/public/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- RUTAS PÚBLICAS (CLIENTE) ---
    {
      path: '/',
      component: ClientLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        // { path: 'catalogo', name: 'catalogo', component: CatalogoView }, // Pendiente
      ]
    },

    // --- RUTAS PRIVADAS (ADMIN) ---
    {
      path: '/admin',
      component: AdminLayout,
      // Por ahora redirigimos /admin directamente al POS
      redirect: '/admin/ventas', 
      children: [
        { path: 'ventas', name: 'orders', component: VentasPosView }, // Le puse 'orders' para que coincida con la imagen
        { path: 'inventario', name: 'products', component: InventarioView },
        { path: 'clientes', name: 'customers', component: ClientesView },
        // Aquí irían dashboard, clientes, reportes...
      ]
    }
  ]
});

export default router;