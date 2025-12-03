<template>
  <div class="pos-layout fade-in">
    
    <div class="catalog-panel card-box">
      <div class="panel-header">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="busqueda" placeholder="Buscar productos..." class="search-input">
        </div>
        <div class="category-filters">
          <button 
            v-for="cat in ['Todas', 'Tecnología', 'Gamer', 'Oficina']" 
            :key="cat"
            class="cat-pill"
            :class="{ active: categoriaActiva === cat }"
            @click="categoriaActiva = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="products-grid-scroll">
        <transition-group name="list" tag="div" class="products-grid">
          <div 
            v-for="prod in productosFiltrados" 
            :key="prod.sku" 
            class="product-card-pos"
            @click="cartStore.agregarProducto(prod)"
          >
            <div class="img-frame">
              <img :src="prod.imagenes?.[0] ? `http://localhost:3000${prod.imagenes[0]}` : '/placeholder.png'">
              <div class="add-overlay">+</div>
            </div>
            <div class="p-info">
              <h6>{{ prod.nombre }}</h6>
              <div class="p-meta">
                <span class="p-price">S/ {{ prod.precio_base }}</span>
                <span class="p-stock" :class="{'low': prod.stock < 5}">Stock: {{ prod.stock }}</span>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <div class="ticket-panel card-box">
      <div class="ticket-header">
        <h3>Orden de Venta</h3>
        <div class="client-row">
          <select v-model="cartStore.cliente_id" class="client-select">
            <option :value="1">Cliente Público</option>
            <option :value="2">Empresa VIP</option>
          </select>
          <button class="btn-icon-small">👤</button>
        </div>
      </div>

      <div class="ticket-items">
        <div v-if="cartStore.items.length === 0" class="empty-ticket">
          <div class="icon">🛒</div>
          <p>Carrito Vacío</p>
        </div>
        
        <div v-for="item in cartStore.items" :key="item.sku" class="ticket-item">
          <div class="ti-info">
            <strong>{{ item.nombre }}</strong>
            <small>S/ {{ item.precio_base }} x {{ item.cantidad }}</small>
          </div>
          <div class="ti-total">
            S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}
          </div>
          <button @click="cartStore.quitarProducto(item.sku)" class="btn-remove">×</button>
        </div>
      </div>

      <div class="ticket-footer">
        <div class="totals-row">
          <span>Subtotal</span> <span>S/ {{ cartStore.subtotal.toFixed(2) }}</span>
        </div>
        <div class="totals-row">
          <span>IGV (18%)</span> <span>S/ {{ cartStore.igv.toFixed(2) }}</span>
        </div>
        <div class="totals-row main-total">
          <span>TOTAL</span> <span>S/ {{ cartStore.totalVenta.toFixed(2) }}</span>
        </div>

        <div class="payment-options">
          <div class="radio-group">
            <label :class="{checked: cartStore.tipoVenta === 'CONTADO'}">
              <input type="radio" value="CONTADO" v-model="cartStore.tipoVenta"> Contado
            </label>
            <label :class="{checked: cartStore.tipoVenta === 'CREDITO'}">
              <input type="radio" value="CREDITO" v-model="cartStore.tipoVenta"> Crédito
            </label>
          </div>
          
          <transition name="slide-fade">
            <select v-if="cartStore.tipoVenta === 'CREDITO'" v-model="cartStore.cuotas" class="cuotas-select">
              <option :value="1">1 Cuota (30 días)</option>
              <option :value="3">3 Cuotas</option>
              <option :value="6">6 Cuotas</option>
            </select>
          </transition>
        </div>

        <button class="btn-checkout" @click="cartStore.procesarVenta()">
          CONFIRMAR PAGO ➔
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useInventarioStore } from "../../stores/inventario";
import { useCartStore } from "../../stores/cart";

const inventarioStore = useInventarioStore();
const cartStore = useCartStore();
const busqueda = ref('');
const categoriaActiva = ref('Todas');

onMounted(() => inventarioStore.fetchProductos());

const productosFiltrados = computed(() => {
  let lista = inventarioStore.productos;
  if(categoriaActiva.value !== 'Todas') {
    lista = lista.filter(p => p.categoria === categoriaActiva.value || p.specs?.categoria === categoriaActiva.value);
  }
  if(busqueda.value) {
    lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()));
  }
  return lista;
});
</script>

<style scoped>
.pos-layout { display: flex; height: calc(100vh - 110px); gap: 20px; overflow: hidden; }

/* PANEL IZQUIERDO */
.catalog-panel { flex: 1; display: flex; flex-direction: column; padding: 0; background: #f8f9fe; box-shadow: none; }
.panel-header { padding: 0 0 20px 0; }

.search-wrapper { position: relative; margin-bottom: 15px; }
.search-icon { position: absolute; left: 15px; top: 12px; color: #8898aa; }
.search-input { width: 100%; padding: 12px 12px 12px 40px; border-radius: 30px; border: 0; box-shadow: 0 4px 6px rgba(50,50,93,.11); outline: none; transition: all 0.2s; }
.search-input:focus { box-shadow: 0 7px 14px rgba(50,50,93,.1); transform: translateY(-1px); }

.category-filters { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
.cat-pill { padding: 6px 15px; border-radius: 20px; border: 1px solid #e9ecef; background: white; color: #525f7f; font-size: 0.85rem; font-weight: 600; transition: 0.2s; }
.cat-pill.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 6px rgba(94,114,228,.3); }

.products-grid-scroll { flex: 1; overflow-y: auto; padding-right: 5px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }

.product-card-pos { 
  background: white; border-radius: 12px; overflow: hidden; cursor: pointer; 
  transition: all 0.2s; border: 1px solid transparent; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.product-card-pos:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); border-color: var(--primary); }

.img-frame { height: 100px; position: relative; display: flex; align-items: center; justify-content: center; background: #f6f9fc; }
.img-frame img { max-height: 80%; max-width: 80%; }
.add-overlay { 
  position: absolute; bottom: 5px; right: 5px; width: 25px; height: 25px; background: var(--primary); 
  color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
  font-weight: bold; opacity: 0; transition: 0.2s; 
}
.product-card-pos:hover .add-overlay { opacity: 1; transform: scale(1.1); }

.p-info { padding: 10px; }
.p-info h6 { margin: 0 0 5px; font-size: 0.85rem; color: #32325d; line-height: 1.3; height: 35px; overflow: hidden; }
.p-meta { display: flex; justify-content: space-between; align-items: center; }
.p-price { font-weight: 800; color: var(--primary); font-size: 0.9rem; }
.p-stock { font-size: 0.7rem; color: #2dce89; }
.p-stock.low { color: #f5365c; }

/* PANEL DERECHO (TICKET) */
.ticket-panel { width: 320px; display: flex; flex-direction: column; border-radius: 15px; border-top: 5px solid var(--primary); }
.ticket-header { padding: 20px; border-bottom: 1px dashed #e9ecef; background: #fcfcfc; }
.ticket-header h3 { margin: 0 0 10px; font-size: 1.1rem; color: #32325d; }
.client-row { display: flex; gap: 5px; }
.client-select { flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #dee2e6; font-size: 0.9rem; color: #525f7f; }

.ticket-items { flex: 1; overflow-y: auto; padding: 10px; background: white; }
.empty-ticket { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #adb5bd; }
.empty-ticket .icon { font-size: 3rem; margin-bottom: 10px; opacity: 0.5; }

.ticket-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f6f9fc; animation: slideInRight 0.3s; }
.ti-info { flex: 1; display: flex; flex-direction: column; }
.ti-info strong { font-size: 0.85rem; color: #32325d; }
.ti-info small { font-size: 0.75rem; color: #8898aa; }
.ti-total { font-weight: 700; font-size: 0.9rem; color: #32325d; margin: 0 10px; }
.btn-remove { color: #f5365c; background: none; border: none; font-size: 1.2rem; cursor: pointer; }

.ticket-footer { padding: 20px; background: #f8f9fe; border-top: 1px solid #e9ecef; }
.totals-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem; color: #525f7f; }
.main-total { font-size: 1.2rem; font-weight: 800; color: var(--primary); border-top: 1px dashed #dee2e6; padding-top: 10px; margin-top: 10px; }

.payment-options { margin: 15px 0; }
.radio-group { display: flex; gap: 10px; margin-bottom: 10px; }
.radio-group label { 
  flex: 1; text-align: center; padding: 8px; border: 1px solid #e9ecef; border-radius: 6px; 
  cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #8898aa; transition: 0.2s; 
}
.radio-group label.checked { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 6px rgba(94,114,228,.2); }
.radio-group input { display: none; }

.cuotas-select { width: 100%; padding: 8px; border: 1px solid #fb6340; color: #fb6340; border-radius: 6px; font-weight: bold; }

.btn-checkout { 
  width: 100%; padding: 12px; background: #2dce89; color: white; border: none; border-radius: 8px; 
  font-weight: 800; letter-spacing: 1px; font-size: 0.9rem; transition: 0.2s; box-shadow: 0 4px 6px rgba(45,206,137,.3); 
}
.btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 7px 14px rgba(45,206,137,.3); background: #26af74; }

@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
</style>