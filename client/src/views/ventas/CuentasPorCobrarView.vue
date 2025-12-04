<template>
  <div class="page-container fade-in">
    
    <div class="stats-grid">
      <div class="stat-card card-gradient-purple">
        <div class="stat-content">
          <p>DEUDA TOTAL ACTIVA</p>
          <h3>S/ {{ totalDeuda.toFixed(2) }}</h3>
        </div>
        <div class="stat-icon">💰</div>
      </div>
      
      <div class="stat-card card-gradient-orange">
        <div class="stat-content">
          <p>CUENTAS POR COBRAR</p>
          <h3>{{ cuentasPendientes }} expedientes</h3>
        </div>
        <div class="stat-icon">📂</div>
      </div>

      <div class="stat-card card-gradient-green">
        <div class="stat-content">
          <p>TASA DE RECUPERACIÓN</p>
          <h3>{{ tasaRecuperacion }}%</h3>
        </div>
        <div class="stat-icon">📈</div>
      </div>
    </div>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Gestión de Cobranzas</h3>
        <p class="page-subtitle">Cartera de clientes y seguimiento de pagos</p>
      </div>
      
      <div class="actions-wrapper">
        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar cliente o DNI..." />
        </div>
        <select v-model="filtroEstado" class="filter-select">
           <option value="TODOS">Todos</option>
           <option value="PENDIENTE">Pendientes</option>
           <option value="VENCIDO">Vencidos</option>
           <option value="PAGADO">Pagados</option>
        </select>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Crédito ID</th>
            <th>Emisión / Vencimiento</th>
            <th>Estado Deuda</th>
            <th>Saldo Pendiente</th>
            <th class="text-right">Expediente</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cuenta in cuentasFiltradas" :key="cuenta.id" :class="{'row-vencida': esVencido(cuenta)}">
            <td>
              <div class="cell-wrapper">
                <div class="avatar-circle bg-gradient-info">{{ cuenta.cliente.charAt(0) }}</div>
                <div class="cell-text">
                  <span class="main-text">{{ cuenta.cliente }}</span>
                  <span class="sub-text">{{ cuenta.ruc_dni }}</span>
                </div>
              </div>
            </td>
            <td><span class="ticket-id">#{{ cuenta.id.toString().padStart(6, '0') }}</span></td>
            <td>
               <div class="date-col">
                 <span>{{ formatearFecha(cuenta.fecha_emision) }}</span>
                 <small :class="esVencido(cuenta) ? 'text-danger fw-bold' : 'text-muted'">
                    Vence: {{ formatearFecha(cuenta.fecha_vencimiento) }}
                 </small>
               </div>
            </td>
            <td style="width: 200px; padding-right: 20px;">
               <div class="progress-info">
                  <span class="status-badge" :class="getClassEstado(cuenta)">{{ cuenta.estado }}</span>
                  <span class="porcentaje">{{ calcularProgreso(cuenta) }}% Pagado</span>
               </div>
               <div class="progress-track">
                  <div class="progress-fill" :class="getClassEstado(cuenta)" :style="{ width: calcularProgreso(cuenta) + '%' }"></div>
               </div>
            </td>
            <td>
               <span class="price-tag">S/ {{ cuenta.saldo_pendiente }}</span>
            </td>
            <td class="text-right">
              <button class="btn-action view" @click="verDetalle(cuenta.id)" title="Ver Detalle">
                 📂 Abrir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="cuentasFiltradas.length === 0" class="empty-state">
         <div class="empty-icon">📭</div>
         <p>No se encontraron cuentas.</p>
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
const filtroEstado = ref('TODOS');

const cargarCuentas = async () => {
  try {
    const { data } = await api.get('/cuentas');
    cuentas.value = data;
  } catch (e) { console.error(e); }
};

// --- LÓGICA FILTROS ---
const cuentasFiltradas = computed(() => 
  cuentas.value.filter(c => {
    const matchTexto = c.cliente.toLowerCase().includes(busqueda.value.toLowerCase()) || c.ruc_dni.includes(busqueda.value);
    
    let matchEstado = true;
    if (filtroEstado.value === 'PENDIENTE') matchEstado = c.estado === 'PENDIENTE' && !esVencido(c);
    else if (filtroEstado.value === 'VENCIDO') matchEstado = esVencido(c) && c.estado !== 'PAGADO';
    else if (filtroEstado.value === 'PAGADO') matchEstado = c.estado === 'PAGADO';

    return matchTexto && matchEstado;
  })
);

// --- LÓGICA NEGOCIO ---
const esVencido = (c) => {
    if (c.estado === 'PAGADO') return false;
    const fechaVenc = new Date(c.fecha_vencimiento);
    const hoy = new Date();
    return fechaVenc < hoy;
};

const calcularProgreso = (c) => {
  const total = parseFloat(c.monto_total);
  const pendiente = parseFloat(c.saldo_pendiente);
  if (total === 0) return 100;
  return Math.round(((total - pendiente) / total) * 100);
};

const getClassEstado = (c) => {
  if(c.estado === 'PAGADO') return 'success';
  if(esVencido(c)) return 'danger';
  return 'warning'; // Pendiente al día
};

// --- KPIs ---
const totalDeuda = computed(() => cuentas.value.filter(c => c.estado !== 'PAGADO').reduce((acc, c) => acc + parseFloat(c.saldo_pendiente), 0));
const cuentasPendientes = computed(() => cuentas.value.filter(c => c.estado !== 'PAGADO').length);
const tasaRecuperacion = computed(() => {
    const total = cuentas.value.reduce((acc, c) => acc + parseFloat(c.monto_total), 0) || 1;
    const pagado = cuentas.value.reduce((acc, c) => acc + parseFloat(c.monto_pagado), 0);
    return ((pagado / total) * 100).toFixed(1);
});

const formatearFecha = (f) => new Date(f).toLocaleDateString('es-PE', {day:'2-digit', month:'short', year:'2-digit'});
const verDetalle = (id) => router.push({ name: 'detalle-cuenta', params: { id } });

onMounted(() => cargarCuentas());
</script>

<style scoped>
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }

/* KPIs (Estilo Argon) */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
.stat-card { border-radius: 15px; padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white; box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-3px); }
.card-gradient-purple { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); }
.card-gradient-orange { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); }
.card-gradient-green { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); }
.stat-content p { margin: 0; font-size: 0.75rem; font-weight: 800; opacity: 0.9; }
.stat-content h3 { margin: 5px 0 0; font-size: 1.5rem; font-weight: 800; }
.stat-icon { font-size: 2rem; opacity: 0.4; }

/* Header */
.page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { margin: 0; color: #32325d; font-weight: 800; font-size: 1.3rem; }
.page-subtitle { margin: 0; color: #889; font-size: 0.85rem; }
.actions-wrapper { display: flex; gap: 10px; }
.search-input-group { background: white; padding: 8px 15px; border-radius: 30px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.search-input-group input { border: none; outline: none; margin-left: 10px; color: #525f7f; width: 200px; font-size: 0.85rem; }
.filter-select { padding: 8px 15px; border: 1px solid #e9ecef; border-radius: 5px; color: #525f7f; font-weight: 600; outline: none; background: white; }

/* Tabla */
.card-box { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 0 2rem rgba(136,152,170,0.15); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; color: #8898aa; font-size: 0.7rem; text-transform: uppercase; border-bottom: 1px solid #eee; background: #f6f9fc; letter-spacing: 1px; }
.monster-table td { padding: 15px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.cell-wrapper { display: flex; align-items: center; gap: 15px; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.bg-gradient-info { background: linear-gradient(87deg, #11cdef 0, #1171ef 100%); }
.main-text { font-weight: 700; color: #32325d; font-size: 0.9rem; display: block; }
.sub-text { color: #8898aa; font-size: 0.75rem; display: block; }
.ticket-id { font-family: monospace; color: #5e72e4; background: #e8f6fc; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }

.date-col { display: flex; flex-direction: column; font-size: 0.85rem; line-height: 1.3; }
.text-danger { color: #f5365c; }
.text-muted { color: #8898aa; }
.fw-bold { font-weight: bold; }

/* Barra Progreso */
.progress-info { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center; }
.status-badge { padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.status-badge.success { background: #eafaf1; color: #2dce89; }
.status-badge.warning { background: #fff3cd; color: #f39c12; }
.status-badge.danger { background: #fdedec; color: #f5365c; }
.porcentaje { font-size: 0.7rem; color: #525f7f; font-weight: bold; }

.progress-track { height: 6px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; transition: width 0.5s; border-radius: 10px; }
.progress-fill.success { background: #2dce89; }
.progress-fill.warning { background: #fb6340; }
.progress-fill.danger { background: #f5365c; }

.price-tag { font-weight: 800; color: #32325d; font-size: 0.95rem; }
.btn-action.view { background: white; color: #5e72e4; border: 1px solid #e9ecef; padding: 5px 12px; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 0.8rem; transition: 0.2s; }
.btn-action.view:hover { background: #5e72e4; color: white; border-color: #5e72e4; }

.row-vencida { background-color: rgba(245, 54, 92, 0.03); } /* Fondo rojo muy sutil */

.empty-state { text-align: center; padding: 40px; color: #adb5bd; }
.empty-icon { font-size: 3rem; margin-bottom: 10px; opacity: 0.5; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>