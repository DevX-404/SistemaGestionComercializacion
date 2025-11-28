<template>
  <div class="container">
    <h1>📦 Inventario Monstruoso</h1>
    <p>Datos fusionados de MongoDB (Catálogo) y PostgreSQL (Stock)</p>

    <div v-if="store.loading" class="loading">Cargando datos...</div>

    <div v-else class="grid">
      <div v-for="prod in store.productos" :key="prod.sku" class="card">
        <img
          :src="`http://localhost:3000${prod.imagenes[0]}`"
          :alt="prod.nombre"
          class="card-img"
          @error="
            $event.target.src = 'http://localhost:3000/img/placeholder.png'
          "
        />

        <div class="card-body">
          <h3>{{ prod.nombre }}</h3>
          <p class="sku">SKU: {{ prod.sku }}</p>

          <div class="stats">
            <span class="price">S/ {{ prod.precio_base }}</span>

            <span :class="['stock', prod.stock < 5 ? 'danger' : 'success']">
              Stock: {{ prod.stock }} unid.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useInventarioStore } from "../stores/inventario";

const store = useInventarioStore();

// Cuando la pantalla cargue, pedimos los datos
onMounted(() => {
  store.fetchProductos();
});
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: sans-serif;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.card-img {
  width: 100%;
  hieght: 200px;
  object-fit: cover;
}
.card-body {
  padding: 15px;
}
.sku {
  color: #666;
  font-size: 0.8em;
}
.stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.price {
  font-weight: bold;
  font-size: 1.2em;
}
.stock {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: white;
}
.success {
  background-color: #28a745;
} /* Verde para stock bien */
.danger {
  background-color: #dc3545;
} /* Rojo para stock bajo */
</style>
