<template>
  <div class="catalogo-container">
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
                    <button class="btn-quick" @click="agregarAlCarrito(prod)">Agregar +</button>
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
  cartStore.agregarProducto(prod);
  // Pequeña vibración o feedback podría ir aquí
};
</script>

<style scoped>
.catalogo-container { background-color: #f4f7f6; min-height: 100vh; font-family: 'Poppins', sans-serif; }

.promo-banner { 
    background: linear-gradient(120deg, #2b32b2 0%, #1488cc 100%); 
    color: white; padding: 60px 20px; text-align: center; margin-bottom: 40px; 
    border-radius: 0 0 50% 50% / 20px; box-shadow: 0 10px 30px rgba(20, 136, 204, 0.3);
}
.promo-banner h1 { font-size: 3rem; margin: 0; letter-spacing: -1px; }

.content-wrapper { max-width: 1200px; margin: 0 auto; display: flex; gap: 40px; padding: 0 20px; }

/* Filtros Estilizados */
.filters { width: 220px; flex-shrink: 0; }
.filters h3 { margin-bottom: 15px; color: #333; font-size: 1.2rem; }
.filters ul { list-style: none; padding: 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
.filters li { padding: 12px 20px; cursor: pointer; transition: 0.3s; border-bottom: 1px solid #eee; color: #555; font-weight: 500; }
.filters li:hover { background-color: #f8f9fa; padding-left: 25px; color: #007bff; }
.filters li.active { background-color: #007bff; color: white; }

/* Grid */
.grid-container { flex: 1; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; }

.product-card { 
    background: white; border-radius: 15px; overflow: hidden; 
    box-shadow: 0 5px 20px rgba(0,0,0,0.05); transition: all 0.3s ease; 
    position: relative; top: 0;
}
.product-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }

.img-wrapper { position: relative; height: 220px; display: flex; align-items: center; justify-content: center; padding: 20px; overflow: hidden; }
.img-wrapper img { max-height: 100%; max-width: 100%; transition: 0.5s; }
.product-card:hover .img-wrapper img { transform: scale(1.1); }

/* Efecto Hover Botón */
.overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); opacity: 0; transition: 0.3s; display: flex; justify-content: center; align-items: center; }
.product-card:hover .overlay { opacity: 1; }
.btn-quick { background: white; color: #333; padding: 10px 20px; border-radius: 25px; border: none; font-weight: bold; cursor: pointer; transform: translateY(20px); transition: 0.3s; }
.product-card:hover .btn-quick { transform: translateY(0); }

.info { padding: 20px; }
.category { font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: 700; }
.info h4 { margin: 5px 0 10px; font-size: 1.1rem; color: #222; }
.price { font-size: 1.4rem; font-weight: 800; color: #2b32b2; }
.stock-badge { font-size: 0.7rem; background: #ffe2e5; color: #f64e60; padding: 3px 8px; border-radius: 10px; font-weight: bold; float: right; margin-top: 5px; }

.no-results { text-align: center; padding: 50px; color: #888; font-size: 1.2rem; grid-column: 1 / -1; }

@media (max-width: 768px) { .content-wrapper { flex-direction: column; } .filters { width: 100%; } }
</style>