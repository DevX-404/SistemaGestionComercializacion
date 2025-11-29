import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '../components/layout/AdminLayout.vue';
import ClientLayout from '../components/layout/ClientLayout.vue';

// Vistas Admin
import VentasPosView from '../views/ventas/VentasPosView.vue';
import ProductosView from '../views/admin/ProductosView.vue';
import ClientesView from '../views/admin/ClientesView.vue';
import DashboardView from '../views/admin/DashboardView.vue';
import ProveedoresView from '../views/admin/ProveedoresView.vue';
import UsuariosView from '../views/admin/UsuariosView.vue';
import PerfilesView from '../views/admin/PerfilesView.vue';
import ReportesView from '../views/admin/ReportesView.vue';
import KardexView from '../views/admin/KardexView.vue';

// Vistas Cliente
import HomeView from '../views/public/HomeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import CatalogoView from '../views/public/CatalogoView.vue';
import CarritoView from '../views/public/CarritoView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- RUTAS PÚBLICAS (CLIENTE) ---
    {
      path: '/',
      component: ClientLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: '/login', component: LoginView },
        { path: 'catalogo', name: 'catalogo', component: CatalogoView }, // <--- NUEVA
        { path: 'carrito', name: 'carrito', component: CarritoView }
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
        { path: 'inventario', name: 'inventory', component: ProductosView },
        { path: 'clientes', name: 'customers', component: ClientesView },
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'proveedores', name: 'proveedores', component: ProveedoresView },
        { path: 'usuarios', name: 'users', component: UsuariosView },
        { path: 'perfiles', name: 'profiles', component: PerfilesView },
        { path: 'reportes', name: 'reports', component: ReportesView },
        { path: 'kardex', name: 'kardex', component: KardexView },
      ]
    }
  ]
});

export default router;