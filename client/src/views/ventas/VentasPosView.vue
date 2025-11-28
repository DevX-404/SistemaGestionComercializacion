<template>
  <div class="pos-container">
    <div class="catalog-section">
      <div class="header-pos">
        <h2>🛍️ Punto de Venta</h2>
        <input
          type="text"
          placeholder="Buscar producto (SKU o Nombre)..."
          class="search-bar"
        />
      </div>

      <div class="products-grid">
        <div
          v-for="prod in inventarioStore.productos"
          :key="prod.sku"
          class="prod-card"
          @click="cartStore.agregarProducto(prod)"
        >
          <img
            :src="`http://localhost:3000${prod.imagenes[0]}`"
            class="thumb"
          />
          <div class="info">
            <h4>{{ prod.nombre }}</h4>
            <div class="price-tag">S/ {{ prod.precio_base }}</div>
            <small :class="prod.stock < 5 ? 'no-stock' : 'stock'"
              >Stock: {{ prod.stock }}</small
            >
          </div>
        </div>
      </div>
    </div>

    <div class="ticket-section">
      <div class="ticket-header">
        <h3>Ticket de Venta</h3>
        <div class="switch-type">
          <button
            :class="{ active: cartStore.tipoVenta === 'CONTADO' }"
            @click="cartStore.tipoVenta = 'CONTADO'"
          >
            💵 Contado
          </button>
          <button
            :class="{ active: cartStore.tipoVenta === 'CREDITO' }"
            @click="cartStore.tipoVenta = 'CREDITO'"
          >
            💳 Crédito
          </button>
        </div>
      </div>

      <div class="cart-items">
        <div v-if="cartStore.items.length === 0" class="empty-msg">
          Carrito vacío
        </div>
        <div v-for="item in cartStore.items" :key="item.sku" class="cart-row">
          <span>{{ item.nombre }} (x{{ item.cantidad }})</span>
          <strong
            >S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}</strong
          >
          <button
            @click="cartStore.quitarProducto(item.sku)"
            class="btn-delete"
          >
            x
          </button>
        </div>
      </div>

      <div class="ticket-footer">
        <div class="row">
          <span>Subtotal:</span>
          <span>S/ {{ cartStore.subtotal.toFixed(2) }}</span>
        </div>
        <div class="row">
          <span>IGV (18%):</span> <span>S/ {{ cartStore.igv.toFixed(2) }}</span>
        </div>
        <div class="row total">
          <span>TOTAL:</span>
          <span>S/ {{ cartStore.totalVenta.toFixed(2) }}</span>
        </div>

        <button class="btn-process" @click="cartStore.procesarVenta()">
          {{
            cartStore.tipoVenta === "CREDITO"
              ? "GENERAR CRONOGRAMA"
              : "PROCESAR VENTA"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useInventarioStore } from "../../stores/inventario";
import { useCartStore } from "../../stores/cart";

const inventarioStore = useInventarioStore();
const cartStore = useCartStore();

onMounted(() => {
  inventarioStore.fetchProductos();
});
</script>

<style scoped>
/* Estilos Rápidos tipo Dashboard */
.pos-container {
  display: flex;
  height: 85vh;
  gap: 20px;
}
.catalog-section {
  flex: 2;
  display: flex;
  flex-direction: column;
}
.ticket-section {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
}

/* Grid de Productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  overflow-y: auto;
  padding-right: 10px;
  margin-top: 15px;
}
.prod-card {
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  overflow: hidden;
  border: 1px solid #eee;
}
.prod-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}
.thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
}
.info {
  padding: 10px;
}
.info h4 {
  margin: 0 0 5px;
  font-size: 0.9rem;
}
.price-tag {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1rem;
}
.no-stock {
  color: red;
  font-size: 0.8rem;
}
.stock {
  color: green;
  font-size: 0.8rem;
}

/* Ticket */
.ticket-header {
  border-bottom: 2px solid #f4f6f9;
  padding-bottom: 15px;
  margin-bottom: 15px;
}
.switch-type {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.switch-type button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: pointer;
  border-radius: 5px;
}
.switch-type button.active {
  background: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
}
.cart-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  font-size: 0.9rem;
}
.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  line-height: 20px;
  text-align: center;
  font-size: 0.7rem;
}

.ticket-footer {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9rem;
}
.total {
  font-weight: bold;
  font-size: 1.2rem;
  color: #2c3e50;
  margin-top: 10px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}
.btn-process {
  width: 100%;
  background: #27ae60;
  color: white;
  border: none;
  padding: 15px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 5px;
  margin-top: 15px;
  cursor: pointer;
}
.btn-process:hover {
  background: #219150;
}
</style>
