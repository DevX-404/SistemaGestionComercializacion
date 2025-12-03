<template>
  <div class="page-container fade-in" v-if="cuenta">
    
    <button class="btn-back" @click="$router.go(-1)">← Volver a Cartera</button>

    <div class="credit-header-grid">
      <div class="card-box client-card">
        <div class="client-header">
          <div class="avatar-large">{{ cuenta.cliente.charAt(0) }}</div>
          <div>
            <h2>{{ cuenta.cliente }}</h2>
            <p class="doc-id">{{ cuenta.numero_documento }}</p>
          </div>
        </div>
        <div class="client-details">
          <div class="detail-row"><span>📞 Teléfono:</span> <strong>{{ cuenta.telefono || '-' }}</strong></div>
          <div class="detail-row"><span>📍 Dirección:</span> <strong>{{ cuenta.direccion || 'Sin dirección' }}</strong></div>
        </div>
      </div>

      <div class="card-box debt-summary">
        <div class="summary-row">
          <div>
            <small>Crédito Total</small>
            <h3>S/ {{ parseFloat(cuenta.monto_total).toFixed(2) }}</h3>
          </div>
          <div class="text-right">
            <small>Saldo Pendiente</small>
            <h3 class="text-danger">S/ {{ parseFloat(cuenta.saldo_pendiente).toFixed(2) }}</h3>
          </div>
        </div>
        <div class="progress-big">
          <div class="bar" :style="{ width: porcentajePagado + '%' }"></div>
        </div>
        <p class="progress-label">Ha pagado el {{ porcentajePagado }}% de la deuda</p>
      </div>
    </div>

    <div class="card-box mt-4">
      <div class="card-header">
        <h4>📅 Cronograma de Pagos</h4>
        <span class="badge-light">{{ cronograma.length }} Cuotas</span>
      </div>
      
      <table class="monster-table">
        <thead>
          <tr>
            <th># Cuota</th>
            <th>Vencimiento</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha Pago</th>
            <th class="text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cronograma" :key="c.id" :class="{ 'row-disabled': c.estado === 'PAGADO' }">
            <td><span class="circle-number">{{ c.numero_cuota }}</span></td>
            <td :class="{'text-danger fw-bold': esVencido(c)}">{{ formatearFecha(c.fecha_vencimiento) }}</td>
            <td class="fw-bold">S/ {{ parseFloat(c.monto_cuota).toFixed(2) }}</td>
            <td>
              <span class="badge-status" :class="c.estado === 'PAGADO' ? 'success' : (esVencido(c) ? 'danger' : 'warning')">
                {{ c.estado === 'PENDIENTE' && esVencido(c) ? 'VENCIDO' : c.estado }}
              </span>
            </td>
            <td class="text-muted">{{ c.fecha_pago ? formatearFecha(c.fecha_pago) : '-' }}</td>
            <td class="text-right">
              <button 
                v-if="c.estado !== 'PAGADO'" 
                class="btn-pay-now" 
                @click="abrirPago(c)"
              >
                💵 Pagar
              </button>
              <span v-else class="check-icon">✅</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
      <div v-if="modalPago" class="modal-backdrop">
        <div class="modal-card slide-in-up">
          <div class="modal-header bg-primary text-white">
            <h4>Realizar Pago - Cuota #{{ cuotaSeleccionada.numero_cuota }}</h4>
            <button class="close-btn white" @click="modalPago = false">×</button>
          </div>
          <div class="modal-body">
             <div class="payment-summary">
               <p>Monto a Pagar</p>
               <h1 class="amount-display">S/ {{ parseFloat(cuotaSeleccionada.monto_cuota).toFixed(2) }}</h1>
               <small>Vence: {{ formatearFecha(cuotaSeleccionada.fecha_vencimiento) }}</small>
             </div>
             
             <div class="form-group">
               <label>Método de Pago</label>
               <select class="input-styled">
                 <option>Efectivo</option>
                 <option>Yape / Plin</option>
                 <option>Transferencia</option>
                 <option>Tarjeta</option>
               </select>
             </div>
          </div>
          <div class="modal-footer">
             <button class="btn-ghost" @click="modalPago = false">Cancelar</button>
             <button class="btn-success btn-wide" @click="confirmarPago">CONFIRMAR PAGO</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
  <div v-else class="loading-screen">Cargando expediente...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api/axios';

const route = useRoute();
const cuenta = ref(null);
const cronograma = ref([]);
const modalPago = ref(false);
const cuotaSeleccionada = ref({});

const cargarDatos = async () => {
  try {
    // 1. Traer cabecera (Nueva función backend)
    const resCuenta = await api.get(`/cuentas/${route.params.id}`);
    cuenta.value = resCuenta.data;
    
    // 2. Traer cuotas
    const resCrono = await api.get(`/cuentas/${route.params.id}/cronograma`);
    cronograma.value = resCrono.data;
  } catch (e) { alert('Error cargando datos'); }
};

const porcentajePagado = computed(() => {
  if(!cuenta.value) return 0;
  const total = parseFloat(cuenta.value.monto_total);
  const pagado = parseFloat(cuenta.value.monto_pagado) || (total - parseFloat(cuenta.value.saldo_pendiente));
  return Math.round((pagado / total) * 100);
});

const esVencido = (cuota) => {
   if(cuota.estado === 'PAGADO') return false;
   return new Date(cuota.fecha_vencimiento) < new Date();
};

const abrirPago = (c) => { cuotaSeleccionada.value = c; modalPago.value = true; };

const confirmarPago = async () => {
  try {
     await api.post('/cuentas/pagar-cuota', {
       idCuota: cuotaSeleccionada.value.id,
       idCuenta: cuenta.value.id,
       monto: cuotaSeleccionada.value.monto_cuota
     });
     alert('Pago registrado con éxito 💸');
     modalPago.value = false;
     cargarDatos();
  } catch (e) { alert('Error al pagar'); }
};

const formatearFecha = (f) => new Date(f).toLocaleDateString('es-PE');

onMounted(() => cargarDatos());
</script>

<style scoped>
.page-container { padding: 20px; }
.btn-back { background: none; border: none; color: #5e72e4; font-weight: bold; cursor: pointer; margin-bottom: 20px; font-size: 0.9rem; }
.mt-4 { margin-top: 25px; }

.credit-header-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }

/* Tarjeta Cliente */
.client-card { display: flex; flex-direction: column; justify-content: space-between; padding: 25px; }
.client-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.avatar-large { width: 60px; height: 60px; background: #172b4d; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: bold; }
.client-header h2 { margin: 0; color: #32325d; font-size: 1.3rem; }
.doc-id { color: #8898aa; margin: 0; font-weight: 600; }
.detail-row { margin-bottom: 8px; color: #525f7f; font-size: 0.9rem; }

/* Resumen Deuda */
.debt-summary { padding: 25px; background: linear-gradient(87deg, #11cdef 0, #1171ef 100%); color: white; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
.summary-row h3 { margin: 0; font-size: 1.8rem; font-weight: 800; }
.summary-row small { text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px; opacity: 0.8; }
.text-danger { color: #fff !important; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }

.progress-big { height: 10px; background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.progress-big .bar { height: 100%; background: #2dce89; transition: width 0.5s ease; }
.progress-label { font-size: 0.8rem; text-align: center; opacity: 0.9; }

/* Cronograma */
.circle-number { width: 25px; height: 25px; background: #f6f9fc; color: #525f7f; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 0.8rem; }
.btn-pay-now { background: #2dce89; color: white; border: none; padding: 6px 15px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; cursor: pointer; box-shadow: 0 4px 6px rgba(46,204,113,.3); transition: 0.2s; }
.btn-pay-now:hover { transform: translateY(-2px); background: #26af74; }
.row-disabled { opacity: 0.6; background: #fcfcfc; }
.check-icon { font-size: 1.2rem; }

/* Modal Pago */
.bg-primary { background: #5e72e4; }
.text-white { color: white; }
.close-btn.white { color: white; opacity: 0.8; }
.close-btn.white:hover { opacity: 1; }
.payment-summary { text-align: center; margin-bottom: 25px; padding: 20px; background: #f8f9fe; border-radius: 10px; }
.amount-display { font-size: 2.5rem; color: #2dce89; margin: 5px 0; font-weight: 800; }
.btn-wide { width: 100%; padding: 12px; font-size: 1rem; margin-top: 10px; }
.btn-success { background: #2dce89; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }

@media (max-width: 768px) {
  .credit-header-grid { grid-template-columns: 1fr; }
}
</style>