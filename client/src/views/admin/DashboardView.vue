<template>
  <div class="dashboard-container fade-in">
    
    <div class="stats-grid">
      <div class="stat-card card-gradient-orange">
        <div class="stat-content">
          <p>VENTAS HOY</p>
          <h3>S/ {{ formatearDinero(resumen.ventasHoy) }}</h3>
        </div>
        <div class="stat-icon">💰</div>
      </div>
      
      <div class="stat-card card-gradient-blue">
        <div class="stat-content">
          <p>POR COBRAR</p>
          <h3>S/ {{ formatearDinero(resumen.creditosPendientes) }}</h3>
        </div>
        <div class="stat-icon">💳</div>
      </div>
      
      <div class="stat-card card-gradient-red" :class="{ 'pulse-alert': resumen.productosBajoStock > 0 }">
        <div class="stat-content">
          <p>ALERTA STOCK</p>
          <h3>{{ resumen.productosBajoStock }} prod.</h3>
        </div>
        <div class="stat-icon">⚠️</div>
      </div>
      
      <div class="stat-card card-gradient-green">
        <div class="stat-content">
          <p>TOTAL CATÁLOGO</p>
          <h3>{{ resumen.totalProductos }} items</h3>
        </div>
        <div class="stat-icon">📦</div>
      </div>
    </div>

    <div class="main-grid">
      
      <div class="card-box chart-section slide-up">
        <div class="card-header">
          <h4>📊 Rendimiento Semanal</h4>
          <span class="badge-pill">Últimos 7 días</span>
        </div>
        <div class="chart-wrapper">
           <SalesChart />
        </div>
      </div>

      <div class="card-box top-products-section slide-up" style="animation-delay: 0.1s;">
        <div class="card-header">
          <h4>🏆 Top 5 Más Vendidos</h4>
        </div>
        <div class="top-list">
           <div v-for="(prod, index) in resumen.topProductos" :key="prod.sku" class="top-item">
              <div class="rank-num">{{ index + 1 }}</div>
              <img :src="getImagen(prod.sku)" class="mini-thumb">
              <div class="prod-details">
                 <div class="flex-between">
                    <strong>{{ getNombre(prod.sku) }}</strong>
                    <span class="fw-bold">{{ prod.total_vendido }} u.</span>
                 </div>
                 <div class="progress-bg">
                    <div class="progress-fill" :style="{ width: calcularPorcentaje(prod.total_vendido) + '%' }"></div>
                 </div>
              </div>
           </div>
           <div v-if="resumen.topProductos.length === 0" class="text-muted text-center mt-3">
              Sin datos de ventas aún.
           </div>
        </div>
      </div>

      <div class="card-box transactions-section slide-up" style="animation-delay: 0.2s;">
        <div class="card-header">
          <h4>⚡ Actividad en Vivo</h4>
        </div>
        <ul class="activity-list">
          <li v-for="(act, i) in resumen.actividadReciente" :key="i" class="activity-item">
            
            <div class="icon-circle" :class="act.tipo === 'VENTA' ? 'bg-success' : 'bg-info'">
               {{ act.tipo === 'VENTA' ? '🛒' : '🚚' }}
            </div>
            
            <div class="details">
              <strong>
                {{ act.tipo === 'VENTA' ? 'Nueva Venta Registrada' : 'Ingreso de Mercadería' }}
              </strong>
              <small>{{ formatDate(act.fecha) }} • {{ act.tipo === 'VENTA' ? `S/ ${act.monto}` : act.ref }}</small>
            </div>
            
            <span class="time-ago">Hace instantes</span>
          </li>

          <li v-if="resumen.actividadReciente.length === 0" class="text-center p-3 text-muted">
             Esperando movimientos...
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import SalesChart from '../../components/charts/SalesChart.vue';
import { useInventarioStore } from '../../stores/inventario';

const inventario = useInventarioStore();
const resumen = ref({ 
  ventasHoy: 0, creditosPendientes: 0, productosBajoStock: 0, totalProductos: 0,
  topProductos: [], actividadReciente: []
});

// --- Helpers ---
const formatearDinero = (v) => (parseFloat(v) || 0).toFixed(2);

const formatDate = (f) => {
    const d = new Date(f);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

// Cruzar datos con Pinia (Mongo) para obtener foto y nombre del SKU
const getProducto = (sku) => inventario.productos.find(p => p.sku === sku);
const getNombre = (sku) => getProducto(sku)?.nombre || sku;
const getImagen = (sku) => {
    const p = getProducto(sku);
    return p?.imagenes?.[0] ? `http://localhost:3000${p.imagenes[0]}` : '/placeholder.png';
};

// Barra de progreso: El más vendido es el 100%
const calcularPorcentaje = (cantidad) => {
    if (resumen.value.topProductos.length === 0) return 0;
    const max = resumen.value.topProductos[0].total_vendido;
    return (cantidad / max) * 100;
};

const cargarDatos = async () => {
  try {
    // 1. Aseguramos catálogo cargado para cruzar nombres
    if (inventario.productos.length === 0) await inventario.fetchProductos();
    
    // 2. Traemos la data del dashboard
    const { data } = await axios.get('http://localhost:3000/api/dashboard/resumen');
    resumen.value = data;
  } catch (error) { console.error("Error dashboard:", error); }
};

onMounted(() => {
  cargarDatos();
  setInterval(cargarDatos, 15000); // Actualizar cada 15 seg para ver el "Vivo"
});
</script>

<style scoped>
.dashboard-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }

/* Grid Layout Avanzado */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px; }
.main-grid { 
  display: grid; 
  grid-template-columns: 1.5fr 1fr 1fr; /* Gráfico ancho, Top 5, Feed */
  gap: 20px; 
}

/* Responsive: En tablets/laptops pequeñas el layout cambia */
@media (max-width: 1200px) {
    .main-grid { grid-template-columns: 1.5fr 1fr; }
    .transactions-section { grid-column: span 2; } /* Feed ancho abajo */
}
@media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } .transactions-section { grid-column: span 1; } }

/* Tarjetas KPI (Estilo Argon) */
.stat-card { border-radius: 15px; padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white; box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-3px); }
.card-gradient-orange { background: linear-gradient(87deg, #f5365c 0, #f56036 100%); }
.card-gradient-blue { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); }
.card-gradient-green { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); }
.card-gradient-red { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); }
.stat-content p { margin: 0; font-size: 0.75rem; font-weight: 800; opacity: 0.9; }
.stat-content h3 { margin: 5px 0 0; font-size: 1.5rem; font-weight: 800; }
.stat-icon { font-size: 2.2rem; opacity: 0.4; }
.pulse-alert { animation: pulse 2s infinite; }

/* Cards Genéricas */
.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem rgba(136,152,170,0.15); height: 100%; display: flex; flex-direction: column; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f6f9fc; padding-bottom: 10px; }
.card-header h4 { margin: 0; color: #32325d; font-weight: 700; font-size: 1rem; }
.badge-pill { background: #5e72e4; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }

/* Gráfico */
.chart-wrapper { height: 300px; width: 100%; flex: 1; }

/* Top 5 List */
.top-list { display: flex; flex-direction: column; gap: 15px; }
.top-item { display: flex; align-items: center; gap: 10px; }
.rank-num { width: 25px; height: 25px; background: #11cdef; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 0.8rem; flex-shrink: 0; }
.mini-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; }
.prod-details { flex: 1; }
.flex-between { display: flex; justify-content: space-between; font-size: 0.85rem; color: #32325d; margin-bottom: 4px; }
.progress-bg { height: 6px; background: #f6f9fc; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); border-radius: 10px; transition: width 1s ease; }

/* Actividad Feed */
.activity-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; max-height: 320px; }
.activity-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px dashed #f0f0f0; }
.icon-circle { width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1rem; margin-right: 12px; color: white; flex-shrink: 0; }
.bg-success { background: #2dce89; } .bg-info { background: #11cdef; }
.details { flex: 1; line-height: 1.3; }
.details strong { display: block; color: #525f7f; font-size: 0.85rem; }
.details small { color: #8898aa; font-size: 0.75rem; }
.time-ago { font-size: 0.7rem; color: #adb5bd; font-style: italic; white-space: nowrap; }

/* Animaciones */
.fade-in { animation: fadeIn 0.5s; }
.slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(251, 99, 64, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(251, 99, 64, 0); } }
</style>