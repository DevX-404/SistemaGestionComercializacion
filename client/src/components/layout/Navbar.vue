<template>
  <nav class="navbar-pro" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <router-link to="/" class="logo">
        <div class="icon">👾</div>
        <span>Tech<span class="highlight">Store</span></span>
      </router-link>

      <div class="menu-items">
        <router-link to="/catalogo" class="nav-item">Explorar Productos</router-link>
      </div>

      <div class="actions">
        <router-link to="/pagos" class="nav-icon-btn" title="Realizar Pagos">
          💳
        </router-link>

        <router-link to="/carrito" class="cart-btn">
          🛒 <span class="badge" v-if="cart.items.length > 0">{{ cart.items.length }}</span>
        </router-link>

        <router-link to="/login" class="btn-login-nav">Ingresar</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '../../stores/cart';

const cart = useCartStore();
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<style scoped>
.navbar-pro {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: transparent;
  transition: all 0.3s ease;
  padding: 15px 0;
  color: white;
}

/* Estado cuando bajas el scroll (se pone blanco y sólido) */
.navbar-pro.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  color: #172b4d;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 800;
  color: inherit;
}

.logo .icon {
  font-size: 1.8rem;
}

.highlight {
  color: #11cdef;
}

.menu-items {
  display: flex;
  gap: 30px;
}

.nav-item {
  text-decoration: none;
  color: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  transition: 0.2s;
  opacity: 0.9;
  position: relative;
}

.nav-item:hover {
  opacity: 1;
  color: #5e72e4;
}

.nav-item.router-link-active {
  color: #5e72e4;
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #5e72e4;
  border-radius: 2px;
}

/* Estilo especial si el navbar es transparente (texto blanco) */
.navbar-pro:not(.scrolled) .nav-item {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.navbar-pro:not(.scrolled) .logo {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-btn {
  position: relative;
  font-size: 1.4rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.cart-btn:hover {
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: #f5365c;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.btn-login-nav {
  background: white;
  color: #5e72e4;
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(50, 50, 93, .11);
  transition: 0.2s;
}

.navbar-pro.scrolled .btn-login-nav {
  background: #5e72e4;
  color: white;
}

.btn-login-nav:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, .2);
}

.nav-icon-btn { font-size: 1.4rem; text-decoration: none; margin-right: 15px; transition: 0.2s; }
.nav-icon-btn:hover { transform: scale(1.1); filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
.navbar-pro.scrolled .nav-icon-btn { filter: none; } /* Ajuste para fondo blanco */
</style>