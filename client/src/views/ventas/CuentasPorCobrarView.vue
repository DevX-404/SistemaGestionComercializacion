<template>
  <div class="page-container fade-in">
    
    <div class="kpi-grid">
      <div class="kpi-card purple">
        <div class="kpi-icon">💰</div>
        <div class="kpi-data">
          <small>Deuda Total Activa</small>
          <h3>S/ {{ totalDeuda.toFixed(2) }}</h3>
        </div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon">⏳</div>
        <div class="kpi-data">
          <small>Cuentas Pendientes</small>
          <h3>{{ cuentas.filter(c => c.estado === 'PENDIENTE').length }}</h3>
        </div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-icon">✅</div>
        <div class="kpi-data">
          <small>Recuperado (Pagado)</small>
          <h3>{{ ((1 - (totalDeuda / totalOriginal)) * 100).toFixed(1) }}%</h3>
        </div>
      </div>
    </div>

    <div class="page-header-actions">
      <h3 class="page-title">Cartera de Clientes</h3>
      <div class="search-input-group">
        <span class="icon">🔍</span>
        <input v-model="busqueda" placeholder="Buscar cliente o DNI..." />
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Crédito (ID)</th>
            <th>Emisión</th>
            <th>Vencimiento</th>
            <th>Progreso Pago</th>
            <th>Deuda Actual</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cuenta in cuentasFiltradas" :key="cuenta.id">
            <td>
              <div class="cell-wrapper">
                <div class="avatar-circle bg-gradient-blue">
                  {{ cuenta.cliente.charAt(0) }}
                </div>
                <div class="cell-text">
                  <span class="main-text">{{ cuenta.cliente }}</span>
                  <span class="sub-text">{{ cuenta.ruc_dni }}</span>
                </div>
              </div>
            </td>
            <td class="text-muted">#{{ cuenta.id.toString().padStart(6, '0') }}</td>
            <td>{{ formatearFecha(cuenta.fecha_emision) }}</td>
            <td>
               <span :class="esVencido(cuenta.fecha_vencimiento) ? 'text-danger fw-bold' : ''">
                 {{ formatearFecha(cuenta.fecha_vencimiento) }}
               </span>
            </td>
            <td style="width: 150px;">
               <div class="progress-wrapper">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: calcularProgreso(cuenta) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ calcularProgreso(cuenta) }}%</span>
               </div>
            </td>
            <td>
               <span class="price-tag">S/ {{ cuenta.saldo_pendiente }}</span>
            </td>
            <td>
              <span class="badge-status" :class="getClassEstado(cuenta)">
                {{ cuenta.estado }}
              </span>
            </td>
            <td class="text-right">
              <button class="btn-action view" @click="verDetalle(cuenta.id)" title="Ver Expediente">
                 📂
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="cuentasFiltradas.length === 0" class="empty-state">
         <p>No se encontraron deudas con ese criterio.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/axios';

const router = useRouter();
const cuentas = ref([]);
const busqueda = ref('');

const cargarCuentas = async () => {
  try {
    const { data } = await api.get('/cuentas');
    cuentas.value = data;
  } catch (e) { console.error(e); }
};

const cuentasFiltradas = computed(() => 
  cuentas.value.filter(c => 
    c.cliente.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    c.ruc_dni.includes(busqueda.value)
  )
);

// Cálculos KPI
const totalDeuda = computed(() => cuentas.value.reduce((acc, c) => acc + parseFloat(c.saldo_pendiente), 0));
const totalOriginal = computed(() => cuentas.value.reduce((acc, c) => acc + parseFloat(c.monto_total), 0) || 1); // Evitar div 0

// Utilidades
const verDetalle = (id) => router.push({ name: 'detalle-cuenta', params: { id } });
const formatearFecha = (f) => new Date(f).toLocaleDateString('es-PE', {day:'2-digit', month:'2-digit', year:'2-digit'});
const esVencido = (f) => new Date(f) < new Date() && new Date(f).getDate() !== new Date().getDate();

const calcularProgreso = (c) => {
  const total = parseFloat(c.monto_total);
  const pendiente = parseFloat(c.saldo_pendiente);
  return Math.round(((total - pendiente) / total) * 100);
};

const getClassEstado = (c) => {
  if(c.estado === 'PAGADO') return 'success';
  if(esVencido(c.fecha_vencimiento)) return 'danger';
  return 'warning';
};

onMounted(() => cargarCuentas());
</script>

<style scoped>
/* Hereda estilos del main.css, agregamos específicos */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
.kpi-card { background: white; padding: 20px; border-radius: 15px; display: flex; align-items: center; gap: 15px; box-shadow: var(--shadow-card); position: relative; overflow: hidden; }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; }
.kpi-card.purple::before { background: var(--primary); }
.kpi-card.orange::before { background: var(--warning); }
.kpi-card.green::before { background: var(--success); }

.kpi-icon { font-size: 2rem; opacity: 0.8; }
.kpi-data h3 { margin: 0; font-size: 1.5rem; color: var(--text-main); }
.kpi-data small { color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.7rem; }

.bg-gradient-blue { background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%); }
.price-tag { font-weight: 800; color: var(--text-main); background: #f6f9fc; padding: 5px 10px; border-radius: 8px; font-size: 0.9rem; }

/* Barra de Progreso */
.progress-wrapper { display: flex; align-items: center; gap: 10px; }
.progress-bar { flex: 1; height: 6px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--success); border-radius: 10px; transition: width 0.5s ease; }
.progress-text { font-size: 0.7rem; font-weight: bold; color: var(--text-muted); }

/* Badges */
.badge-status { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
.badge-status.success { background: #eafaf1; color: #2ecc71; }
.badge-status.warning { background: #fff3cd; color: #f39c12; }
.badge-status.danger { background: #fdedec; color: #e74c3c; }

.btn-action.view { background: #fff; color: #11cdef; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.view:hover { background: #11cdef; color: white; }
</style>