<template>
  <div class="detalle-container">
    <h2>📅 Cronograma de Pagos</h2>
    <div class="card" v-for="cuota in cronograma" :key="cuota.id">
      <div class="cuota-info">
        <span class="numero">Cuota #{{ cuota.numero_cuota }}</span>
        <span class="fecha">Vence: {{ formatearFecha(cuota.fecha_vencimiento) }}</span>
        <span class="monto">S/ {{ cuota.monto_cuota }}</span>
      </div>
      
      <div class="estado">
        <span v-if="cuota.estado === 'PAGADO'" class="badge-ok">✅ PAGADO</span>
        <button 
          v-else 
          @click="pagar(cuota)" 
          class="btn-pagar">
          Pagar Ahora
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const cronograma = ref([]);

const cargarCronograma = async () => {
    // Usamos el ID que viene en la URL (ej: /admin/ventas/cuentas/5)
    const cuentaId = route.params.id;
    const res = await axios.get(`http://localhost:3000/api/cuentas/${cuentaId}/cronograma`);
    cronograma.value = res.data;
};

const pagar = async (cuota) => {
    if(!confirm(`¿Confirmar pago de la cuota #${cuota.numero_cuota}?`)) return;
    
    try {
        await axios.post('http://localhost:3000/api/cuentas/pagar-cuota', {
            idCuota: cuota.id,
            idCuenta: cuota.cuenta_id,
            monto: cuota.monto_cuota
        });
        alert("Pago registrado!");
        cargarCronograma(); // Recargar para ver el check verde
    } catch (e) {
        alert("Error al pagar");
    }
};

const formatearFecha = (f) => new Date(f).toLocaleDateString();

onMounted(() => cargarCronograma());
</script>

<style scoped>
.detalle-container { padding: 20px; max-width: 600px; margin: 0 auto; }
.card { 
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 15px; margin-bottom: 10px; 
  border-radius: 8px; border-left: 5px solid #3498db; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.cuota-info { display: flex; flex-direction: column; }
.numero { font-weight: bold; color: #2c3e50; }
.fecha { font-size: 0.85rem; color: #7f8c8d; }
.badge-ok { color: #27ae60; font-weight: bold; }
.btn-pagar { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }
.btn-pagar:hover { background: #2980b9; }
</style>