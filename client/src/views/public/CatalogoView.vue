<template>
  <div class="catalog-page fade-in">
    <div class="container">
      
      <div class="mini-hero">
        <h1>Tecnología <span class="highlight">Store</span></h1>
        <p>Encuentra lo último en hardware y accesorios.</p>
      </div>

      <div class="catalog-toolbar">
        <div class="search-box">
           <span class="icon">🔍</span>
           <input v-model="busqueda" placeholder="¿Qué estás buscando hoy?" />
        </div>

        <div class="filter-scroll">
           <button 
             class="filter-pill" 
             :class="{ active: filtroCat === 'Todas' }"
             @click="filtroCat = 'Todas'"
           >
             Todas
           </button>
           <button 
             v-for="cat in categorias" 
             :key="cat._id" 
             class="filter-pill"
             :class="{ active: filtroCat === cat.nombre }"
             @click="filtroCat = cat.nombre"
           >
             {{ cat.nombre }}
           </button>
        </div>
      </div>

      <div class="products-grid">
        <div v-for="prod in productosFiltrados" :key="prod.sku" class="product-card">
          <div class="card-img">
             <img :src="prod.imagenes?.[0] ? `http://localhost:3000${prod.imagenes[0]}` : '/placeholder.png'">
             <span class="stock-badge" v-if="prod.stock < 5 && prod.stock > 0">¡Quedan {{ prod.stock }}!</span>
             <span class="stock-badge out" v-if="prod.stock <= 0">Agotado</span>
          </div>
          <div class="card-body">
             <small>{{ prod.categoria }}</small>
             <h3>{{ prod.nombre }}</h3>
             <div class="price-action">
                <span class="price">S/ {{ prod.precio_base.toFixed(2) }}</span>
                <button class="btn-add" @click="agregar(prod)" :disabled="prod.stock <= 0">
                   {{ prod.stock > 0 ? '+' : '🚫' }}
                </button>
             </div>
          </div>
        </div>
        
        <div v-if="productosFiltrados.length === 0" class="no-results">
           <p>No encontramos productos con esos filtros 😢</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios';
import { useCartStore } from '../../stores/cart';
import { useInventarioStore } from '../../stores/inventario';

const inventario = useInventarioStore();
const cart = useCartStore();
const categorias = ref([]); // Aquí guardaremos las categorías de la BD
const busqueda = ref('');
const filtroCat = ref('Todas');

const cargar = async () => {
  await inventario.fetchProductos();
  try { 
    // Llamamos al backend para traer categorías reales
    const { data } = await api.get('/categorias'); 
    // Filtramos solo las activas si tu backend devuelve todas
    categorias.value = data.filter(c => c.estado === true); 
  } catch(e){ console.error(e); }
};

const productosFiltrados = computed(() => 
  inventario.productos.filter(p => {
    const matchText = p.nombre.toLowerCase().includes(busqueda.value.toLowerCase());
    // Comparamos con la categoría guardada en el producto
    const matchCat = filtroCat.value === 'Todas' || p.categoria === filtroCat.value;
    // Solo mostrar activos
    const matchEstado = p.estado === 'ACTIVO';
    return matchText && matchCat && matchEstado;
  })
);

const agregar = (p) => {
  cart.agregarProducto(p);
  // Feedback visual simple
  const btn = document.activeElement;
  if(btn) {
      btn.classList.add('clicked');
      setTimeout(() => btn.classList.remove('clicked'), 200);
  }
};

onMounted(() => cargar());
</script>

<style scoped>
.catalog-page { padding-bottom: 60px; background: #f8f9fe; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 20px; }

.mini-hero { text-align: center; padding: 40px 0; color: #32325d; }
.mini-hero h1 { font-size: 2.5rem; font-weight: 800; margin: 0; }
.highlight { color: #5e72e4; }

.catalog-toolbar { background: white; padding: 15px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 30px; display: flex; flex-direction: column; gap: 15px; }

.search-box { display: flex; align-items: center; background: #f6f9fc; padding: 10px 20px; border-radius: 30px; }
.search-box input { border: none; background: transparent; width: 100%; outline: none; font-size: 1rem; color: #32325d; margin-left: 10px; }

.filter-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
.filter-pill { white-space: nowrap; border: 1px solid #e9ecef; background: white; padding: 8px 20px; border-radius: 20px; cursor: pointer; color: #525f7f; font-weight: 600; transition: 0.2s; }
.filter-pill:hover { background: #f6f9fc; }
.filter-pill.active { background: #5e72e4; color: white; border-color: #5e72e4; box-shadow: 0 4px 6px rgba(94, 114, 228, 0.2); }

.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 25px; }

.product-card { background: white; border-radius: 15px; overflow: hidden; transition: 0.3s; border: 1px solid rgba(0,0,0,0.03); }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }

.card-img { height: 180px; background: #fff; display: flex; align-items: center; justify-content: center; position: relative; padding: 20px; }
.card-img img { max-height: 100%; max-width: 100%; object-fit: contain; }
.stock-badge { position: absolute; top: 10px; left: 10px; background: #fb6340; color: white; font-size: 0.7rem; padding: 3px 8px; border-radius: 10px; font-weight: bold; }
.stock-badge.out { background: #8898aa; }

.card-body { padding: 20px; border-top: 1px solid #f6f9fc; }
.card-body small { color: #8898aa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
.card-body h3 { margin: 5px 0 15px; font-size: 1rem; color: #32325d; line-height: 1.4; height: 42px; overflow: hidden; }

.price-action { display: flex; justify-content: space-between; align-items: center; }
.price { font-size: 1.3rem; font-weight: 800; color: #5e72e4; }
.btn-add { width: 40px; height: 40px; border-radius: 50%; border: none; background: #11cdef; color: white; font-size: 1.2rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-add:hover { background: #0da5c0; transform: scale(1.1); }
.btn-add.clicked { transform: scale(0.9); background: #2dce89; }
.btn-add:disabled { background: #e9ecef; cursor: not-allowed; transform: none; color: #889; }

.no-results { grid-column: 1 / -1; text-align: center; padding: 50px; color: #889; font-size: 1.2rem; }
</style>