<template>
  <div class="chart-root-wrapper">
    
    <div v-if="loaded" class="chart-canvas-wrapper">
      <Bar 
        :data="chartData" 
        :options="chartOptions" 
      />
    </div>
    
    <div v-else class="loading-box">
      Cargando datos de ventas...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js';
import api from '../../api/axios';

// Registramos los módulos de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const loaded = ref(false);
const chartData = ref({
  labels: [],
  datasets: []
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // ¡Vital! No forzar la relación de aspecto original
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => ` S/ ${parseFloat(context.raw).toFixed(2)}`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => 'S/ ' + value // Eje Y con soles
      }
    }
  }
};

onMounted(async () => {
  try {
    const { data } = await api.get('/dashboard/ventas-semana');
    
    const dias = data.map(d => {
        // Corrección de zona horaria para el display:
        const [year, month, day] = d.fecha.split('-').map(Number);
        const date = new Date(year, month - 1, day); 
        return date.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
    });

    const montos = data.map(d => parseFloat(d.total));

    chartData.value = {
      labels: dias,
      datasets: [{
        label: 'Ventas Totales',
        backgroundColor: '#5e72e4',
        borderRadius: 5,
        data: montos
      }]
    };
    
    loaded.value = true;
  } catch (e) { 
    console.error("Error cargando gráfico:", e);
    // Permite que el componente se monte aunque la API falle
    loaded.value = true; 
  }
});
</script>

<style scoped>
/* 1. Contenedor Principal: Fija la altura y la posición para la "jaula" */
.chart-root-wrapper {
  position: relative;
  height: 300px; 
  width: 100%;
}

/* 2. Contenedor del Canvas: Se asegura de usar el 100% de la jaula, sin empujarla */
.chart-canvas-wrapper {
  position: absolute; 
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.loading-box {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8898aa;
  font-size: 0.9rem;
}
</style>