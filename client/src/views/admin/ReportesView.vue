<template>
  <div class="page-container">
    <h3>📈 Reportes y Analítica</h3>
    <p class="subtitle">Inteligencia de Negocios en Tiempo Real</p>

    <div v-if="loading" class="loading">Generando gráficos...</div>

    <div v-else class="charts-grid">
      
      <div class="chart-card">
        <h4>Ventas de la Semana (MySQL)</h4>
        <div class="canvas-container">
            <Bar :data="chartVentasData" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h4>Estado de Deuda (MySQL)</h4>
        <div class="canvas-container donut">
            <Doughnut :data="chartDeudaData" :options="donutOptions" />
        </div>
      </div>

      <div class="chart-card full-width">
        <div class="header-danger">
            <h4>⚠️ Alerta de Reabastecimiento (PostgreSQL)</h4>
            <span class="badge-count">{{ stockBajo.length }} Items</span>
        </div>
        <table class="monster-table">
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Stock Actual</th>
                    <th>Mínimo Requerido</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in stockBajo" :key="item.producto_sku">
                    <td>{{ item.producto_sku }}</td>
                    <td class="text-danger fw-bold">{{ item.stock_actual }} unid.</td>
                    <td>{{ item.stock_minimo }} unid.</td>
                    <td><span class="badge-critical">CRÍTICO</span></td>
                </tr>
                <tr v-if="stockBajo.length === 0">
                    <td colspan="4" class="text-center">¡Todo el inventario está saludable!</td>
                </tr>
            </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
// Importamos componentes de Chart.js
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';

// Registramos los componentes gráficos
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const loading = ref(true);
const stockBajo = ref([]);

// Datos reactivos para los gráficos
const chartVentasData = ref({ labels: [], datasets: [] });
const chartDeudaData = ref({ labels: [], datasets: [] });

// Opciones de estilo
const chartOptions = { responsive: true, maintainAspectRatio: false };
const donutOptions = { responsive: true, maintainAspectRatio: false };

onMounted(async () => {
    try {
        const { data } = await api.get('/reportes/dashboard');
        
        // 1. Configurar Gráfico de Ventas
        chartVentasData.value = {
            labels: data.ventas_chart.map(v => v.fecha),
            datasets: [{
                label: 'Ventas (S/)',
                backgroundColor: '#3699ff',
                data: data.ventas_chart.map(v => v.total)
            }]
        };

        // 2. Configurar Gráfico de Deuda
        const deuda = data.deuda_chart;
        chartDeudaData.value = {
            labels: ['Cobrado', 'Pendiente de Pago'],
            datasets: [{
                backgroundColor: ['#1bc5bd', '#ffa800'],
                data: [deuda.pagado || 0, deuda.deuda || 0]
            }]
        };

        // 3. Tabla de Stock
        stockBajo.value = data.stock_alerta;

    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.page-container { padding: 20px; }
.subtitle { color: #b5b5c3; margin-bottom: 20px; }
.loading { text-align: center; padding: 50px; font-size: 1.2rem; color: #3699ff; }

.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.chart-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); min-height: 350px; }
.full-width { grid-column: span 2; }

h4 { margin-top: 0; color: #3f4254; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; margin-bottom: 20px; }
.canvas-container { height: 300px; }
.donut { height: 250px; display: flex; justify-content: center; }

/* Tabla de Alerta */
.header-danger { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ffe2e5; padding-bottom: 10px; margin-bottom: 15px; }
.header-danger h4 { border: none; margin: 0; color: #f64e60; }
.badge-count { background: #f64e60; color: white; padding: 2px 10px; border-radius: 10px; font-size: 0.8rem; font-weight: bold; }

.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 10px; color: #a2a5b9; }
.monster-table td { padding: 10px; border-top: 1px solid #f0f0f0; color: #3f4254; }
.text-danger { color: #f64e60; }
.fw-bold { font-weight: bold; }
.badge-critical { background: #ffe2e5; color: #f64e60; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.text-center { text-align: center; color: #1bc5bd; }

@media (max-width: 800px) { .charts-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
</style>