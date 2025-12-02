<template>
  <div class="catalogo-container">
    
    <Transition name="slide-down">
      <div v-if="notification.show" class="argon-alert" :class="notification.type">
        <div class="alert-icon">
          <span v-if="notification.type === 'success'">🛒</span>
          <span v-if="notification.type === 'warning'">⚠️</span>
        </div>
        <div class="alert-content">
            <h4 class="alert-heading">{{ getTitle(notification.type) }}</h4>
            <p>{{ notification.message }}</p>
        </div>
        <div class="alert-actions" v-if="notification.type === 'success'">
             <router-link to="/carrito" class="btn-alert-link">Ver Carrito →</router-link>
        </div>
      </div>
    </Transition>

    <transition name="fade" appear>
        <div class="promo-banner">
        <div class="banner-content">
            <h1>🔥 Monster Tech</h1>
            <p>Tecnología que asusta de lo buena que es.</p>
        </div>
        </div>
    </transition>

    <div class="content-wrapper">
      <aside class="filters">
        <h3>Categorías</h3>
        <ul>
          <li v-for="cat in ['Todas', 'Tecnología', 'Gamer', 'Oficina', 'Hogar']" 
              :key="cat"
              :class="{ active: categoriaActiva === cat }" 
              @click="categoriaActiva = cat">
              {{ cat }}
          </li>
        </ul>
      </aside>

      <div class="grid-container">
        <TransitionGroup name="list" tag="div" class="products-grid">
            <div v-for="prod in productosFiltrados" :key="prod.sku" class="product-card">
                <div class="img-wrapper">
                    <img :src="`http://localhost:3000${prod.imagenes[0]}`" :alt="prod.nombre">
                    
                    <div class="overlay">
                        <button class="btn-quick" @click="agregarAlCarrito(prod)">
                           Añadir al Carrito +
                        </button>
                    </div>
                </div>
                <div class="info">
                    <span class="category">{{ prod.specs?.categoria || 'General' }}</span>
                    <h4>{{ prod.nombre }}</h4>
                    <div class="price-row">
                        <span class="price">S/ {{ prod.precio_base.toFixed(2) }}</span>
                        <span v-if="prod.stock < 5" class="stock-badge">¡Quedan {{ prod.stock }}!</span>
                    </div>
                </div>
            </div>
        </TransitionGroup>
        
        <div v-if="productosFiltrados.length === 0" class="no-results">
            No hay productos en esta categoría 🕸️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios';
import { useCartStore } from '../../stores/cart';

const cartStore = useCartStore();
const productos = ref([]);
const categoriaActiva = ref('Todas');
const notification = ref({ show: false, message: '', type: 'success' });

// --- NOTIFICACIONES ---
const showToast = (msg, type = 'success') => {
    notification.value = { show: true, message: msg, type };
    setTimeout(() => { notification.value.show = false; }, 3000); // 3 seg
};
const getTitle = (type) => type === 'success' ? '¡Agregado!' : 'Atención';

// --- LÓGICA ---
onMounted(async () => {
  try {
    const { data } = await api.get('/productos');
    productos.value = data;
  } catch (error) { console.error(error); }
});

const productosFiltrados = computed(() => {
  if (categoriaActiva.value === 'Todas') return productos.value;
  return productos.value.filter(p => p.specs?.categoria === categoriaActiva.value);
});

const agregarAlCarrito = (prod) => {
  // Llamamos al store y recibimos la respuesta (objeto)
  const result = cartStore.agregarProducto(prod);
  
  if (result.success) {
      showToast(result.message, 'success');
  } else {
      showToast(result.message, 'warning');
  }
};
</script>

<style scoped>
/* --- ESTILOS DE NOTIFICACIÓN (Toasts) --- */
.argon-alert {
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    min-width: 300px; padding: 1rem; border-radius: 0.375rem;
    color: #fff; display: flex; align-items: center; gap: 15px;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    animation: bounceIn 0.4s;
}
.argon-alert.success { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); }
.argon-alert.warning { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); }

.alert-icon { font-size: 1.5rem; }
.alert-content h4 { margin: 0; font-size: 0.9rem; text-transform: uppercase; font-weight: 800; }
.alert-content p { margin: 0; font-size: 0.9rem; opacity: 0.9; }
.btn-alert-link { background: rgba(255,255,255,0.2); color: white; text-decoration: none; padding: 5px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; transition: 0.2s; margin-left: auto; }
.btn-alert-link:hover { background: rgba(255,255,255,0.4); }

/* Animación Slide */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-20px); opacity: 0; }
@keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }

/* --- RESTO DEL DISEÑO DEL CATÁLOGO --- */
.catalogo-container { background-color: #f4f7f6; min-height: 100vh; font-family: 'Open Sans', sans-serif; }

.promo-banner { 
    background: linear-gradient(150deg, #281483 15%, #8f6ed5 70%, #d782d9 94%);
    color: white; padding: 80px 20px; text-align: center; margin-bottom: 40px; 
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}
.promo-banner h1 { font-size: 3rem; margin: 0; font-weight: 800; letter-spacing: -1px; }
.promo-banner p { font-size: 1.2rem; opacity: 0.9; }

.content-wrapper { max-width: 1200px; margin: 0 auto; display: flex; gap: 40px; padding: 0 20px; }

.filters { width: 220px; flex-shrink: 0; }
.filters h3 { margin-bottom: 15px; color: #32325d; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; }
.filters ul { list-style: none; padding: 0; background: white; border-radius: 0.375rem; overflow: hidden; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); }
.filters li { padding: 12px 20px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f6f9fc; color: #525f7f; font-weight: 600; font-size: 0.9rem; }
.filters li:hover { background-color: #f6f9fc; color: #5e72e4; padding-left: 25px; }
.filters li.active { background-color: #5e72e4; color: white; }

.grid-container { flex: 1; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; }

.product-card { 
    background: white; border-radius: 0.375rem; overflow: hidden; 
    box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); transition: all 0.3s ease; border: 0;
}
.product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(50,50,93,.1), 0 5px 15px rgba(0,0,0,.07); }

.img-wrapper { position: relative; height: 220px; display: flex; align-items: center; justify-content: center; padding: 20px; background: #fff; }
.img-wrapper img { max-height: 100%; max-width: 100%; transition: 0.5s; }
.product-card:hover .img-wrapper img { transform: scale(1.05); }

.overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); opacity: 0; transition: 0.3s; display: flex; justify-content: center; align-items: center; }
.product-card:hover .overlay { opacity: 1; }
.btn-quick { background: #5e72e4; color: white; padding: 10px 20px; border-radius: 20px; border: none; font-weight: bold; cursor: pointer; transform: translateY(20px); transition: 0.3s; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.product-card:hover .btn-quick { transform: translateY(0); }

.info { padding: 20px; }
.category { font-size: 0.7rem; color: #8898aa; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
.info h4 { margin: 5px 0 10px; font-size: 1.1rem; color: #32325d; font-weight: 600; }
.price { font-size: 1.3rem; font-weight: 800; color: #2dce89; }
.stock-badge { font-size: 0.7rem; background: #f5365c; color: white; padding: 2px 8px; border-radius: 10px; font-weight: bold; float: right; margin-top: 5px; text-transform: uppercase; }

.no-results { text-align: center; padding: 50px; color: #8898aa; font-size: 1.2rem; grid-column: 1 / -1; }

@media (max-width: 768px) { .content-wrapper { flex-direction: column; } .filters { width: 100%; } }
</style>