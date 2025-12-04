<template>
  <aside class="sidebar-argon">
    <div class="logo-area">
      <div class="icon-logo">👾</div>
      <div class="brand-text"><h2>Monster<span class="light">Sys</span></h2></div>
      <button class="close-mobile" @click="$emit('close')">×</button>
    </div>

    <nav class="menu-scroll no-scroll-bar">
      
      <p class="menu-header">PRINCIPAL</p>
      <router-link v-if="can('dashboard')" :to="{ name: 'dashboard' }" class="nav-link">
        <div class="icon-shape icon-blue">📊</div> <span class="link-text">Dashboard</span>
      </router-link>

      <p class="menu-header">COMERCIAL</p>
      <router-link v-if="can('ventas')" :to="{ name: 'ventas-pos' }" class="nav-link">
        <div class="icon-shape icon-green">🛒</div> <span class="link-text">Punto de Venta</span>
      </router-link>
      <router-link v-if="can('ventas')" :to="{ name: 'reportes' }" class="nav-link"> <div class="icon-shape icon-teal">🧾</div> <span class="link-text">Historial Ventas</span>
      </router-link>
      <router-link v-if="can('creditos')" :to="{ name: 'cuentas-cobrar' }" class="nav-link">
        <div class="icon-shape icon-orange">💳</div> <span class="link-text">Créditos</span>
      </router-link>
      <router-link v-if="can('clientes')" :to="{ name: 'clientes' }" class="nav-link">
        <div class="icon-shape icon-info">👥</div> <span class="link-text">Clientes</span>
      </router-link>

      <p class="menu-header">LOGÍSTICA</p>
      <router-link v-if="can('productos')" :to="{ name: 'admin-productos' }" class="nav-link">
        <div class="icon-shape icon-red">📦</div> <span class="link-text">Productos</span>
      </router-link>
      <router-link v-if="can('productos')" :to="{ name: 'categorias' }" class="nav-link">
        <div class="icon-shape icon-pink">🏷️</div> <span class="link-text">Categorías</span>
      </router-link>
      <router-link v-if="can('proveedores')" :to="{ name: 'proveedores' }" class="nav-link">
        <div class="icon-shape icon-yellow">🚚</div> <span class="link-text">Proveedores</span>
      </router-link>
      <router-link v-if="can('kardex')" :to="{ name: 'kardex' }" class="nav-link">
        <div class="icon-shape icon-purple">📋</div> <span class="link-text">Kardex</span>
      </router-link>

      <template v-if="can('usuarios')">
        <p class="menu-header">ADMINISTRACIÓN</p>
        <router-link :to="{ name: 'usuarios' }" class="nav-link">
          <div class="icon-shape icon-gray">🛡️</div> <span class="link-text">Usuarios</span>
        </router-link>
      </template>

    </nav>

    <div class="logout-wrapper">
        <button @click="logout" class="btn-logout"><span>🚪</span> Salir</button>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
const auth = useAuthStore();

// Función Helper para verificar permisos
const can = (modulo) => {
  // Si es ADMIN, tiene acceso total (comodín)
  if (auth.user?.rol === 'ADMIN') return true;
  // Si no, buscamos en su array de accesos
  return auth.user?.accesos?.includes(modulo);
};

const logout = () => { if(confirm('¿Cerrar sesión?')) auth.logout(); };
defineEmits(['close']);
</script>

<style scoped>
/* TRUCO MAESTRO PARA OCULTAR SCROLLBAR PERO MANTENER SCROLL */
.no-scroll-bar {
  overflow-y: auto; /* Permite scroll */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}
.no-scroll-bar::-webkit-scrollbar { 
  display: none; /* Chrome, Safari, Opera */
}

.sidebar-argon {
  background: linear-gradient(180deg, #1a174d 0%, #172b4d 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ocupa el 100% del contenedor padre (que es fixed) */
}

.logo-area {
  padding: 20px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  min-height: 70px;
}
.icon-logo { font-size: 1.8rem; }
.brand-text h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: white; }
.light { color: #11cdef; }

.close-mobile {
  margin-left: auto; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; display: none;
}
@media(max-width: 992px) { .close-mobile { display: block; } }

.menu-scroll { flex: 1; padding: 10px 15px; }

/* Compactamos un poco para que quepan más */
.menu-header { 
  color: #6a7896; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; 
  margin: 15px 0 5px 10px; 
}

.nav-link {
  display: flex; align-items: center; padding: 10px 12px; /* Menos padding vertical */
  color: rgba(255,255,255,0.7); text-decoration: none; border-radius: 8px;
  font-size: 0.85rem; transition: 0.2s;
}
.nav-link:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-link.router-link-active { background: white; color: #172b4d; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

.icon-shape {
  width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin-right: 10px; background: rgba(255,255,255,0.1); font-size: 0.8rem;
}
.router-link-active .icon-shape { background: #5e72e4; color: white; }

/* Colores iconos */
.icon-blue { color: #5e72e4; } .icon-green { color: #2dce89; } .icon-orange { color: #fb6340; }
.icon-red { color: #f5365c; } .icon-purple { color: #8965e0; } .icon-info { color: #11cdef; } .icon-pink { color: #e83e8c; } .icon-yellow { color: #ffd600; } .icon-teal { color: #11cdef; } .icon-gray { color: #adb5bd; }

.logout-wrapper { padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
.btn-logout { width: 100%; padding: 10px; background: rgba(245, 54, 92, 0.1); color: #f5365c; border: 1px solid rgba(245, 54, 92, 0.3); border-radius: 6px; font-weight: bold; font-size: 0.85rem; transition: 0.2s; cursor: pointer;}
.btn-logout:hover { background: #f5365c; color: white; }
.sidebar-argon { background: linear-gradient(180deg, #1a174d 0%, #172b4d 100%); color: white; display: flex; flex-direction: column; height: 100%; }
.logo-area { padding: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); min-height: 70px; }
.icon-logo { font-size: 1.8rem; }
.brand-text h2 { margin: 0; font-size: 1.2rem; font-weight: 800; color: white; }
.light { color: #11cdef; }
.close-mobile { margin-left: auto; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; display: none; }
@media(max-width: 992px) { .close-mobile { display: block; } }
.menu-scroll { flex: 1; padding: 10px 15px; overflow-y: auto; }
.no-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scroll-bar::-webkit-scrollbar { display: none; }
.menu-header { color: #6a7896; font-size: 0.65rem; font-weight: 700; letter-spacing: 1px; margin: 15px 0 5px 10px; }
.nav-link { display: flex; align-items: center; padding: 10px 12px; color: rgba(255,255,255,0.7); text-decoration: none; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; }
.nav-link:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-link.router-link-active { background: white; color: #172b4d; font-weight: 600; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.icon-shape { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; background: rgba(255,255,255,0.1); font-size: 0.8rem; }
.router-link-active .icon-shape { background: #5e72e4; color: white; }
.icon-blue { color: #5e72e4; } .icon-green { color: #2dce89; } .icon-orange { color: #fb6340; } .icon-red { color: #f5365c; } .icon-purple { color: #8965e0; } .icon-info { color: #11cdef; } .icon-pink { color: #e83e8c; } .icon-yellow { color: #ffd600; } .icon-teal { color: #11cdef; } .icon-gray { color: #adb5bd; }
.logout-wrapper { padding: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
.btn-logout { width: 100%; padding: 10px; background: rgba(245, 54, 92, 0.1); color: #f5365c; border: 1px solid rgba(245, 54, 92, 0.3); border-radius: 6px; font-weight: bold; font-size: 0.85rem; transition: 0.2s; cursor: pointer; }
.btn-logout:hover { background: #f5365c; color: white; }
</style>