<template>
  <div class="page-container">
    <div class="header-kardex">
        <div>
            <h3>📜 Kardex Físico Valorado</h3>
            <p class="subtitle">Auditoría de movimientos de inventario (PostgreSQL)</p>
        </div>
        <button class="btn-print" @click="imprimir">🖨️ Exportar PDF</button>
    </div>

    <div class="card-box">
        <table class="monster-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>SKU</th>
                    <th>Movimiento</th>
                    <th>Ref. Doc.</th>
                    <th class="text-right">Entrada/Salida</th>
                    <th class="text-right">Saldo Final</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="mov in movimientos" :key="mov.id">
                    <td>{{ new Date(mov.fecha_movimiento).toLocaleString() }}</td>
                    <td class="fw-bold">{{ mov.producto_sku }}</td>
                    <td>
                        <span :class="['badge', getBadgeColor(mov.tipo_movimiento)]">
                            {{ mov.tipo_movimiento }}
                        </span>
                    </td>
                    <td class="text-muted">{{ mov.referencia_documento }}</td>
                    
                    <td class="text-right" :class="mov.cantidad > 0 ? 'text-success' : 'text-danger'">
                        {{ mov.cantidad > 0 ? '+' : '' }}{{ mov.cantidad }}
                    </td>
                    
                    <td class="text-right fw-bold">{{ mov.saldo_stock_resultante }}</td>
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

onMounted(async () => {
    try {
        const { data } = await api.get('/kardex');
        movimientos.value = data;
    } catch (e) { console.error(e); }
});

const getBadgeColor = (tipo) => {
    if (tipo === 'VENTA') return 'badge-red';
    if (tipo.includes('INICIAL') || tipo === 'COMPRA') return 'badge-green';
    return 'badge-gray';
};

const imprimir = () => window.print(); // Truco simple para exportar a PDF
</script>

<style scoped>
.page-container { padding: 20px; }
.header-kardex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.subtitle { color: #b5b5c3; margin: 0; }

.card-box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; border-bottom: 2px solid #eee; color: #a2a5b9; font-size: 0.85rem; text-transform: uppercase; }
.monster-table td { padding: 12px 15px; border-bottom: 1px solid #f5f7fb; color: #3f4254; font-size: 0.9rem; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.badge-green { background: #c9f7f5; color: #1bc5bd; }
.badge-red { background: #ffe2e5; color: #f64e60; }
.badge-gray { background: #eee; color: #999; }

.text-right { text-align: right; }
.text-success { color: #1bc5bd; font-weight: bold; }
.text-danger { color: #f64e60; font-weight: bold; }
.text-muted { color: #b5b5c3; font-size: 0.8rem; }
.fw-bold { font-weight: 600; }
.btn-print { background: #2c3e50; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }

/* Ocultar sidebar al imprimir */
@media print {
    .admin-sidebar, .btn-print { display: none !important; }
    .page-container { padding: 0; margin: 0; }
    .card-box { box-shadow: none; }
}
</style>