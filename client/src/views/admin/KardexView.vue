<template>
  <div class="page-container fade-in">
    
    <div class="stats-grid">
      <div class="stat-card card-gradient-purple">
        <div class="stat-content">
          <p>MOVIMIENTOS</p>
          <h3>{{ movimientos.length }}</h3>
        </div>
        <div class="stat-icon">📋</div>
      </div>
      
      <div class="stat-card card-gradient-green">
        <div class="stat-content">
          <p>TOTAL INGRESOS</p>
          <h3>+{{ conteoEntradas }} u.</h3>
        </div>
        <div class="stat-icon">📥</div>
      </div>

      <div class="stat-card card-gradient-orange">
        <div class="stat-content">
          <p>TOTAL SALIDAS</p>
          <h3>{{ conteoSalidas }} u.</h3>
        </div>
        <div class="stat-icon">📤</div>
      </div>

      <div class="stat-card card-white border-green">
        <div class="stat-content text-dark">
          <p class="text-success">MONTO COMPRAS (S/)</p>
          <h3>S/ {{ totalMontoCompras }}</h3>
        </div>
        <div class="stat-icon text-success">💰</div>
      </div>

      <div class="stat-card card-white border-red">
        <div class="stat-content text-dark">
          <p class="text-danger">COSTO VENTAS (S/)</p>
          <h3>S/ {{ totalMontoVentas }}</h3>
        </div>
        <div class="stat-icon text-danger">💸</div>
      </div>
    </div>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Kardex Valorizado</h3>
        <p class="page-subtitle">Control de flujo de inventario</p>
      </div>
      
      <div class="filters-wrapper">
        <select v-model="filtroTipo" class="filter-select">
           <option value="TODOS">Todos los Movimientos</option>
           <option value="COMPRA">Solo Compras</option>
           <option value="VENTA">Solo Ventas</option>
        </select>

        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar por SKU o Documento..." />
        </div>
        
        <button class="btn-secondary" @click="cargarDatos">🔄 Refrescar</button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
           <tr>
             <th>Fecha</th>
             <th>Producto</th>
             <th>Movimiento</th>
             <th class="text-center">Cant.</th>
             <th class="text-right">Costo Unit.</th>
             <th class="text-right">Total (S/)</th>
             <th>Ref.</th>
           </tr>
        </thead>
        <tbody>
           <tr v-for="k in movimientosFiltrados" :key="k.id" :class="getRowClass(k.tipo_movimiento)">
             <td>
               <div class="date-wrapper">
                 <span class="main-date">{{ formatDate(k.fecha_movimiento) }}</span>
                 <span class="sub-time">{{ formatTime(k.fecha_movimiento) }}</span>
               </div>
             </td>
             <td>
               <div class="product-mini">
                 <img :src="getImagenProducto(k.producto_sku)" class="mini-thumb">
                 <div class="mini-info">
                    <span class="p-name">{{ getNombreProducto(k.producto_sku) }}</span>
                    <span class="p-sku">{{ k.producto_sku }}</span>
                 </div>
               </div>
             </td>
             <td>
                <span class="badge-type" :class="getBadgeClass(k.tipo_movimiento)">
                    {{ k.tipo_movimiento }}
                </span>
             </td>
             <td class="text-center fw-bold" :class="k.cantidad > 0 ? 'text-success' : 'text-danger'">
                {{ k.cantidad > 0 ? '+' : '' }}{{ k.cantidad }}
             </td>
             <td class="text-right text-muted">
                S/ {{ parseFloat(k.costo_unitario || 0).toFixed(2) }}
             </td>
             <td class="text-right fw-800 text-dark">
                S/ {{ calcularTotalOperacion(k) }}
             </td>
             <td class="small-text text-muted">
               <div class="ref-box">{{ k.referencia_documento || '-' }}</div>
             </td>
           </tr>
        </tbody>
      </table>
      
      <div v-if="movimientosFiltrados.length === 0" class="empty-state">
         <p>No hay datos para mostrar.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios';
import { useInventarioStore } from '../../stores/inventario';

const inventarioStore = useInventarioStore();
const movimientos = ref([]);
const busqueda = ref('');
const filtroTipo = ref('TODOS');

const cargarDatos = async () => {
    try {
        const { data } = await api.get('/kardex');
        movimientos.value = data;
    } catch (e) { console.error("Error Kardex:", e); }

    if (inventarioStore.productos.length === 0) {
        await inventarioStore.fetchProductos();
    }
};

// --- HELPERS ---
const getProducto = (sku) => inventarioStore.productos.find(p => p.sku === sku);
const getNombreProducto = (sku) => getProducto(sku)?.nombre || 'Desconocido';
const getImagenProducto = (sku) => getProducto(sku)?.imagenes?.[0] ? `http://localhost:3000${getProducto(sku).imagenes[0]}` : '/placeholder.png';

const formatDate = (f) => new Date(f).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' });
const formatTime = (f) => new Date(f).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

const getBadgeClass = (tipo) => (tipo === 'COMPRA' || tipo === 'ENTRADA') ? 'badge-in' : 'badge-out';
const getRowClass = (tipo) => (tipo === 'COMPRA') ? 'row-compra' : '';
const getIconoMovimiento = (tipo) => (tipo === 'COMPRA' ? '📥' : '📤');

const calcularTotalOperacion = (m) => {
    const total = Math.abs(m.cantidad) * parseFloat(m.costo_unitario || 0);
    return total.toFixed(2);
};

// --- KPIs ---
const conteoEntradas = computed(() => movimientos.value.filter(m => m.cantidad > 0).reduce((acc, m) => acc + m.cantidad, 0));
const conteoSalidas = computed(() => Math.abs(movimientos.value.filter(m => m.cantidad < 0).reduce((acc, m) => acc + m.cantidad, 0)));

// KPIs MONETARIOS (Ahora sí funcionarán)
const totalMontoCompras = computed(() => {
    return movimientos.value
        .filter(m => m.tipo_movimiento === 'COMPRA' || m.tipo_movimiento === 'ENTRADA')
        .reduce((acc, m) => acc + (Math.abs(m.cantidad) * parseFloat(m.costo_unitario || 0)), 0)
        .toFixed(2);
});

const totalMontoVentas = computed(() => {
    return movimientos.value
        .filter(m => m.tipo_movimiento === 'VENTA' || m.tipo_movimiento === 'SALIDA')
        .reduce((acc, m) => acc + (Math.abs(m.cantidad) * parseFloat(m.costo_unitario || 0)), 0)
        .toFixed(2);
});

const movimientosFiltrados = computed(() => {
    return movimientos.value.filter(m => {
        const texto = busqueda.value.toLowerCase();
        const matchText = m.producto_sku.toLowerCase().includes(texto) || 
                          (m.referencia_documento || '').toLowerCase().includes(texto);
        
        const matchTipo = filtroTipo.value === 'TODOS' || 
           (filtroTipo.value === 'COMPRA' && m.cantidad > 0) ||
           (filtroTipo.value === 'VENTA' && m.cantidad < 0);

        return matchText && matchTipo;
    });
});

onMounted(() => cargarDatos());
</script>

<style scoped>
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }

/* Grid de KPIs (5 columnas ahora) */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
  gap: 15px; margin-bottom: 25px; 
}

.stat-card { padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: 0.2s; }
.stat-card:hover { transform: translateY(-3px); }

/* Gradientes */
.card-gradient-purple { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); color: white; }
.card-gradient-green { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); color: white; }
.card-gradient-orange { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); color: white; }

/* Tarjetas Blancas con Borde */
.card-white { background: white; border-left: 5px solid #ccc; }
.border-green { border-left-color: #2dce89; }
.border-red { border-left-color: #f5365c; }
.text-dark { color: #32325d; }

.stat-content p { margin: 0; font-size: 0.65rem; font-weight: 800; opacity: 0.8; letter-spacing: 0.5px; }
.stat-content h3 { margin: 5px 0 0; font-size: 1.4rem; font-weight: 800; }
.stat-icon { font-size: 1.8rem; opacity: 0.8; }

/* Tabla */
.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem rgba(136,152,170,0.15); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 12px; color: #8898aa; font-size: 0.7rem; text-transform: uppercase; border-bottom: 1px solid #eee; background: #f6f9fc; }
.monster-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; font-size: 0.85rem; }

.date-wrapper { display: flex; flex-direction: column; }
.main-date { font-weight: 700; color: #32325d; }
.sub-time { font-size: 0.75rem; color: #889; }

.product-mini { display: flex; align-items: center; gap: 8px; }
.mini-thumb { width: 30px; height: 30px; border-radius: 6px; object-fit: cover; border: 1px solid #eee; }
.mini-info { display: flex; flex-direction: column; }
.p-name { font-weight: 600; color: #32325d; font-size: 0.85rem; }
.p-sku { font-size: 0.7rem; color: #5e72e4; font-family: monospace; }

.badge-type { padding: 3px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
.badge-in { background: #eafaf1; color: #2dce89; }
.badge-out { background: #fdedec; color: #f5365c; }
.badge-neutral { background: #e9ecef; color: #525f7f; }

.fw-800 { font-weight: 800; }
.text-success { color: #2dce89; } .text-danger { color: #f5365c; } .text-muted { color: #889; }
.ref-box { background: #f8f9fe; padding: 3px 6px; border-radius: 4px; font-family: monospace; display: inline-block; border: 1px solid #e9ecef; font-size: 0.75rem; }
.row-compra { background-color: rgba(45, 206, 137, 0.03); }

/* Header Actions */
.page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { margin: 0; color: #32325d; font-weight: 800; font-size: 1.3rem; }
.page-subtitle { margin: 0; color: #889; font-size: 0.85rem; }
.filters-wrapper { display: flex; gap: 10px; }
.filter-select { padding: 8px; border: 1px solid #ddd; border-radius: 5px; color: #525f7f; font-weight: 600; outline: none; font-size: 0.85rem; }
.search-input-group { background: white; padding: 8px 15px; border-radius: 30px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.search-input-group input { border: none; outline: none; margin-left: 10px; color: #525f7f; width: 180px; font-size: 0.85rem; }
.btn-secondary { background: white; border: 1px solid #5e72e4; color: #5e72e4; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 0.85rem; }

.empty-state { text-align: center; padding: 40px; color: #adb5bd; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>