<template>
  <div class="page-container fade-in">
    <div class="page-header-actions">
       <div class="title-wrapper">
        <h3 class="page-title">Kardex Físico</h3>
        <p class="page-subtitle">Historial de movimientos de almacén</p>
      </div>
    </div>

    <div class="card-box">
      <table class="monster-table">
        <thead>
           <tr>
             <th>Fecha</th>
             <th>Producto (SKU)</th>
             <th>Movimiento</th>
             <th>Cantidad</th>
             <th>Stock Resultante</th>
             <th>Ref.</th>
           </tr>
        </thead>
        <tbody>
           <tr v-for="k in movimientos" :key="k.id">
             <td>{{ new Date(k.fecha_movimiento).toLocaleDateString() }}</td>
             <td><span class="fw-bold">{{ k.producto_sku }}</span></td>
             <td>
                <span class="badge-status" :class="k.tipo_movimiento === 'COMPRA' || k.tipo_movimiento === 'ENTRADA' ? 'in' : 'out'">
                    {{ k.tipo_movimiento }}
                </span>
             </td>
             <td :class="k.cantidad > 0 ? 'text-success' : 'text-danger'">
                {{ k.cantidad > 0 ? '+' : '' }}{{ k.cantidad }}
             </td>
             <td class="fw-bold">{{ k.saldo_stock_resultante }}</td>
             <td class="text-muted small">{{ k.referencia_documento }}</td>
           </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const movimientos = ref([]);
const cargar = async () => { const {data} = await api.get('/kardex'); movimientos.value = data; };
onMounted(() => cargar());
</script>

<style scoped>
/* Badges específicos */
.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; }
.badge-status.in { background: #eafaf1; color: #2ecc71; }
.badge-status.out { background: #fdedec; color: #e74c3c; }
.text-success { color: #2ecc71; font-weight: bold; }
.text-danger { color: #e74c3c; font-weight: bold; }
</style>