import { createRouter, createWebHistory } from 'vue-router';

// --- Layouts ---
import AdminLayout from '../components/layout/AdminLayout.vue';
import ClientLayout from '../components/layout/ClientLayout.vue';

// --- Vistas Públicas ---
import HomeView from '../views/public/HomeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import CatalogoView from '../views/public/CatalogoView.vue';
import CarritoView from '../views/public/CarritoView.vue';

// --- Vistas Privadas (Admin) ---
import VentasPosView from '../views/ventas/VentasPosView.vue';
import CuentasPorCobrarView from '../views/ventas/CuentasPorCobrarView.vue'; // Vista Nueva
import ClientesView from '../views/admin/ClientesView.vue';
import CatalogoAdminView from '../views/admin/CatalogoAdminView.vue'; // Nombre nuevo
import ProveedoresView from '../views/admin/ProveedoresView.vue';
import KardexView from '../views/admin/KardexView.vue';
import DashboardView from '../views/admin/DashboardView.vue';
import ReportesView from '../views/admin/ReportesView.vue';
import UsuariosView from '../views/admin/UsuariosView.vue';
import PerfilesView from '../views/admin/PerfilesView.vue';
import CategoriasView from '../views/admin/CategoriasView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // RUTA RAÍZ (Login por defecto o Home)
    { path: '/', redirect: '/login' }, 

    // ZONA PÚBLICA
    {
      path: '/',
      component: ClientLayout,
      children: [
        { path: 'home', name: 'home', component: HomeView },
        { path: 'login', name: 'login', component: LoginView },
        { path: 'catalogo', name: 'catalogo-publico', component: CatalogoView },
        { path: 'carrito', name: 'carrito', component: CarritoView }
      ]
    },

    // ZONA PRIVADA (ADMIN PANEL)
    {
      path: '/admin',
      component: AdminLayout,
      redirect: { name: 'dashboard' },
      meta: { requiresAuth: true },
      children: [
        // Dashboard
        { path: 'dashboard', name: 'dashboard', component: DashboardView },

        // Módulo Comercial
        { path: 'ventas/pos', name: 'ventas-pos', component: VentasPosView },
        { path: 'ventas/cuentas', name: 'cuentas-cobrar', component: CuentasPorCobrarView },
        { path: 'comercial/clientes', name: 'clientes', component: ClientesView },
        { path: 'ventas/cuentas/:id', name: 'detalle-cuenta', component: () => import('../views/ventas/DetalleCreditoView.vue') },

        // Módulo Logística
        { path: 'logistica/productos', name: 'admin-productos', component: CatalogoAdminView },
        { path: 'logistica/kardex', name: 'kardex', component: KardexView },
        { path: 'logistica/proveedores', name: 'proveedores', component: ProveedoresView },
        { path: 'logistica/categorias', name: 'categorias', component: CategoriasView },

        // Módulo Administración
        { path: 'sistema/usuarios', name: 'usuarios', component: UsuariosView },
        { path: 'sistema/perfiles', name: 'perfiles', component: PerfilesView },
        { path: 'sistema/reportes', name: 'reportes', component: ReportesView },
      ]
    },

    // 404
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
});

// GUARDIA DE NAVEGACIÓN GLOBAL
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !token) {
    // Si quiere ir a admin y no tiene token -> Login
    next('/login');
  } else if (to.path === '/login' && token) {
    // Si ya tiene token y quiere ir a login -> Dashboard
    next('/admin/dashboard');
  } else {
    next(); // Todo bien, pase
  }
});

export default router;