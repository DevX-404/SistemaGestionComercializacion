<template>
  <div class="cuentas-container">
    <div class="header-action">
      <h1>💰 Cuentas por Cobrar</h1>
      <button class="btn-refresh" @click="cargarCuentas">Actualizar Lista</button>
    </div>

    <div class="panel">
      <table class="tabla-datos">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Emisión</th>
            <th>Vencimiento (General)</th>
            <th>Total Deuda</th>
            <th>Saldo Pendiente</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cuenta in cuentas" :key="cuenta.id">
            <td>
              <strong>{{ cuenta.cliente }}</strong><br>
              <small class="text-muted">{{ cuenta.ruc_dni }}</small>
            </td>
            <td>{{ formatearFecha(cuenta.fecha_emision) }}</td>
            <td :class="{'text-danger': esVencido(cuenta.fecha_vencimiento)}">
              {{ formatearFecha(cuenta.fecha_vencimiento) }}
            </td>
            <td>S/ {{ cuenta.monto_total }}</td>
            <td><strong style="color: #e74c3c;">S/ {{ cuenta.saldo_pendiente }}</strong></td>
            <td>
              <span :class="badgeClass(cuenta.estado)">{{ cuenta.estado }}</span>
            </td>
            <td>
              <button class="btn-pagar" @click="verDetalle(cuenta.id)">
                Ver Cronograma / Pagar
              </button>
            </td>
          </tr>
          <tr v-if="cuentas.length === 0">
            <td colspan="7" class="text-center">No hay deudas pendientes 🎉</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // <--- 1. Importamos el router

const router = useRouter(); // <--- 2. Iniciamos el router
const cuentas = ref([]);

// Navegar a la vista de detalle (DetalleCreditoView.vue)
const verDetalle = (id) => {
  router.push({ name: 'detalle-cuenta', params: { id } });
};

const cargarCuentas = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/cuentas');
    cuentas.value = response.data;
  } catch (error) {
    console.error("Error cargando cuentas:", error);
    alert("Error al conectar con el servidor");
  }
};

// --- Utilidades ---
const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const esVencido = (fecha) => {
  if (!fecha) return false;
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  return new Date(fecha) < hoy;
};

const badgeClass = (estado) => {
  if (estado === 'PAGADO') return 'badge badge-success';
  if (estado === 'VENCIDO') return 'badge badge-danger';
  return 'badge badge-warning'; 
};

onMounted(() => {
  cargarCuentas();
});
</script>

<style scoped>
.cuentas-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }
.header-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

.panel { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow-x: auto; }
.tabla-datos { width: 100%; border-collapse: collapse; min-width: 600px; }
.tabla-datos th, .tabla-datos td { padding: 15px; text-align: left; border-bottom: 1px solid #f0f0f0; }
.tabla-datos th { background-color: #f8f9fa; font-weight: 600; color: #2c3e50; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.tabla-datos tr:hover { background-color: #fdfdfd; }

/* Badges */
.badge { padding: 5px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; display: inline-block; min-width: 80px; text-align: center;}
.badge-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.badge-warning { background: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
.badge-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.text-danger { color: #e74c3c; font-weight: bold; }
.text-muted { color: #95a5a6; font-size: 0.85rem; }

/* Botones */
.btn-refresh { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
.btn-refresh:hover { background: #2980b9; }

.btn-pagar { 
  background: white; color: #3498db; border: 1px solid #3498db; 
  padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;
  transition: all 0.2s;
}
.btn-pagar:hover { background: #3498db; color: white; }
</style>