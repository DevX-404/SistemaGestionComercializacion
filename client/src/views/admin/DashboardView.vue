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
          <p>TOTAL PRODUCTOS</p>
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

      <div class="card-box transactions-section slide-up" style="animation-delay: 0.1s;">
        <div class="card-header">
          <h4>📝 Actividad Reciente</h4>
        </div>
        <ul class="activity-list">
          <li class="activity-item">
            <div class="icon-circle bg-blue">🛒</div>
            <div class="details">
              <strong>Nueva Venta</strong>
              <small>Hace 5 minutos</small>
            </div>
          </li>
          <li class="activity-item">
            <div class="icon-circle bg-green">🚚</div>
            <div class="details">
              <strong>Ingreso Mercadería</strong>
              <small>Hace 2 horas</small>
            </div>
          </li>
           <li class="activity-item">
            <div class="icon-circle bg-orange">👤</div>
            <div class="details">
              <strong>Nuevo Cliente</strong>
              <small>Hace 4 horas</small>
            </div>
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

const resumen = ref({ ventasHoy: 0, creditosPendientes: 0, productosBajoStock: 0, totalProductos: 0 });

const formatearDinero = (valor) => {
  const numero = parseFloat(valor) || 0;
  return numero.toFixed(2);
};

const cargarDatos = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/dashboard/resumen');
    resumen.value = data;
  } catch (error) { console.error("Error dashboard:", error); }
};

onMounted(() => {
  cargarDatos();
  setInterval(cargarDatos, 30000);
});
</script>

<style scoped>
.dashboard-container { padding: 20px; }

/* Animaciones de Entrada */
.fade-in { animation: fadeIn 0.5s ease-in; }
.slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* Grid de KPIs */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 15px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-5px); }

/* Gradientes Argon "Increíbles" */
.card-gradient-orange { background: linear-gradient(87deg, #f5365c 0, #f56036 100%); }
.card-gradient-blue { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); }
.card-gradient-green { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); }
.card-gradient-red { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); }

.stat-content p { margin: 0; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
.stat-content h3 { margin: 5px 0 0; font-size: 1.6rem; font-weight: 800; }
.stat-icon { font-size: 2.5rem; opacity: 0.4; }

.pulse-alert { animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(251, 99, 64, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(251, 99, 64, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 99, 64, 0); } }

/* Main Grid */
.main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
@media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }

.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); border: 1px solid rgba(0,0,0,0.02); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f6f9fc; padding-bottom: 15px; }
.card-header h4 { margin: 0; color: #32325d; font-weight: 700; }
.badge-pill { background: #5e72e4; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }

.chart-wrapper { height: 320px; width: 100%; padding: 10px; }

/* Actividad */
.activity-list { list-style: none; padding: 0; margin: 0; }
.activity-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
.activity-item:last-child { border-bottom: none; }

.icon-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 1.1rem; }
.bg-blue { background: #5e72e4; } .bg-green { background: #2dce89; } .bg-orange { background: #fb6340; }

.details strong { display: block; color: #525f7f; font-size: 0.9rem; }
.details small { color: #8898aa; font-size: 0.8rem; }
</style>