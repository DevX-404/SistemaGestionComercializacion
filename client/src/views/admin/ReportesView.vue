<template>
  <div class="page-container fade-in">
    
    <div class="page-header-actions">
       <div class="title-wrapper">
         <h3 class="page-title">Historial de Ventas</h3>
         <p class="page-subtitle">Consultas y reimpresión de comprobantes</p>
       </div>
       
       <div class="filters-wrapper">
         <div class="date-range">
            <input type="date" v-model="filtros.inicio" class="input-date">
            <span class="separator">➔</span>
            <input type="date" v-model="filtros.fin" class="input-date">
         </div>
         <button class="btn-primary" @click="buscarVentas">🔍 Filtrar</button>
       </div>
    </div>

    <div class="card-box table-responsive">
       <table class="monster-table">
         <thead>
           <tr>
             <th>ID Venta</th>
             <th>Fecha</th>
             <th>Cliente</th>
             <th>Método Pago</th>
             <th class="text-right">Total</th>
             <th class="text-center">Acciones</th>
           </tr>
         </thead>
         <tbody>
           <tr v-for="v in ventas" :key="v.id">
             <td><span class="ticket-id">#{{ v.id.toString().padStart(6, '0') }}</span></td>
             <td>
                <div class="date-col">
                   <span class="fw-bold">{{ formatDate(v.fecha_emision) }}</span>
                   <small>{{ formatTime(v.fecha_emision) }}</small>
                </div>
             </td>
             <td>
                <div class="client-col">
                   <strong>{{ v.cliente }}</strong>
                   <small>{{ v.numero_documento }}</small>
                </div>
             </td>
             <td>
                <span class="badge-pill" :class="v.tipo_pago === 'CONTADO' ? 'bg-green' : 'bg-orange'">
                   {{ v.tipo_pago }}
                </span>
             </td>
             <td class="text-right fw-bold text-dark">S/ {{ parseFloat(v.total).toFixed(2) }}</td>
             <td class="text-center">
                <button class="btn-icon-action" @click="verDetalle(v.id)" title="Ver Detalle">👁️</button>
                <button class="btn-icon-action print" @click="imprimirTicket(v)" title="Reimprimir Ticket">🖨️</button>
             </td>
           </tr>
         </tbody>
       </table>
       
       <div v-if="ventas.length === 0" class="empty-state">
          <p>Seleccione un rango de fechas para consultar.</p>
       </div>
    </div>

    <transition name="modal-fade">
       <div v-if="modalDetalle" class="modal-backdrop" @click.self="modalDetalle = false">
          <div class="modal-card slide-in-up">
             <div class="modal-header bg-header">
                <div>
                   <h4 class="text-white">Detalle de Venta #{{ ventaSeleccionada?.id }}</h4>
                   <small class="text-white-50">{{ formatDate(ventaSeleccionada?.fecha_emision) }}</small>
                </div>
                <button class="close-btn white" @click="modalDetalle = false">×</button>
             </div>
             <div class="modal-body">
                <div class="info-grid">
                   <div><label>Cliente:</label> <strong>{{ ventaSeleccionada?.razon_social }}</strong></div>
                   <div><label>Documento:</label> {{ ventaSeleccionada?.numero_documento }}</div>
                   <div><label>Dirección:</label> {{ ventaSeleccionada?.direccion || '-' }}</div>
                </div>
                
                <hr class="divider">

                <table class="simple-table">
                   <thead><tr><th>Cant.</th><th>Descripción</th><th class="text-right">Total</th></tr></thead>
                   <tbody>
                      <tr v-for="(item, i) in ventaSeleccionada?.items" :key="i">
                         <td class="text-center fw-bold">{{ item.cantidad }}</td>
                         <td>{{ getNombreProducto(item.sku) }} <small class="text-muted">({{ item.sku }})</small></td>
                         <td class="text-right">S/ {{ parseFloat(item.subtotal).toFixed(2) }}</td>
                      </tr>
                   </tbody>
                   <tfoot>
                      <tr class="total-row">
                         <td colspan="2" class="text-right">TOTAL PAGADO</td>
                         <td class="text-right">S/ {{ parseFloat(ventaSeleccionada?.total).toFixed(2) }}</td>
                      </tr>
                   </tfoot>
                </table>
             </div>
             <div class="modal-footer">
                <button class="btn-primary full-width" @click="imprimirTicket(ventaSeleccionada)">🖨️ Reimprimir Comprobante</button>
             </div>
          </div>
       </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { useInventarioStore } from '../../stores/inventario';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const inventario = useInventarioStore();
const ventas = ref([]);
const filtros = ref({ inicio: new Date().toISOString().split('T')[0], fin: new Date().toISOString().split('T')[0] });
const modalDetalle = ref(false);
const ventaSeleccionada = ref(null);

// Cargar productos para cruzar nombres (como en Kardex)
onMounted(() => inventario.fetchProductos());

const buscarVentas = async () => {
   try {
      const { data } = await api.get(`/reportes/ventas?inicio=${filtros.value.inicio}&fin=${filtros.value.fin}`);
      ventas.value = data;
   } catch(e) { alert('Error cargando ventas'); }
};

const verDetalle = async (id) => {
   try {
      const { data } = await api.get(`/ventas/${id}`);
      ventaSeleccionada.value = data;
      modalDetalle.value = true;
   } catch(e) { alert('Error al obtener detalle'); }
};

const getNombreProducto = (sku) => inventario.productos.find(p => p.sku === sku)?.nombre || 'Producto';

// --- REIMPRESIÓN PDF ---
const imprimirTicket = (venta) => {
   if(!venta) return;
   const doc = new jsPDF({
       orientation: 'portrait', unit: 'mm', format: [80, 200] // Formato Ticket Térmico
   });
   
   doc.setFontSize(12); doc.text("MONSTER STORE", 40, 10, { align: "center" });
   doc.setFontSize(9); doc.text("RUC: 20100000001", 40, 15, { align: "center" });
   doc.text("--------------------------------", 40, 20, { align: "center" });
   
   doc.setFontSize(8);
   doc.text(`Ticket: #${venta.id}`, 5, 25);
   doc.text(`Fecha: ${formatDate(venta.fecha_emision)} ${formatTime(venta.fecha_emision)}`, 5, 30);
   doc.text(`Cliente: ${venta.razon_social || venta.cliente}`, 5, 35);
   
   // Si es desde la tabla principal, items no existe, hay que pedirlos.
   // Por simplicidad, aquí asumimos que se imprime desde el detalle o que el endpoint reporte trae items (lo cual sería pesado).
   // MEJOR: Solo permitir imprimir desde el modal de detalle para asegurar consistencia.
   
   if(venta.items) {
      let y = 45;
      venta.items.forEach(item => {
         doc.text(`${item.cantidad} x ${getNombreProducto(item.sku).substring(0,15)}..`, 5, y);
         doc.text(parseFloat(item.subtotal).toFixed(2), 75, y, { align: "right" });
         y += 5;
      });
      doc.text("--------------------------------", 40, y+2, { align: "center" });
      doc.setFontSize(10);
      doc.text(`TOTAL: S/ ${parseFloat(venta.total).toFixed(2)}`, 75, y+8, { align: "right" });
   } else {
      // Si intentan imprimir desde la lista, abrimos detalle primero
      verDetalle(venta.id).then(() => imprimirTicket(ventaSeleccionada.value));
      return; 
   }

   doc.save(`Ticket_${venta.id}.pdf`);
};

const formatDate = (f) => new Date(f).toLocaleDateString('es-PE');
const formatTime = (f) => new Date(f).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'});
</script>

<style scoped>
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }
.page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { margin: 0; font-weight: 800; color: #32325d; }
.page-subtitle { margin: 0; color: #889; font-size: 0.9rem; }

.filters-wrapper { display: flex; gap: 10px; align-items: center; }
.date-range { background: white; padding: 8px 15px; border-radius: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 10px; }
.input-date { border: none; outline: none; color: #525f7f; font-weight: bold; background: transparent; font-family: inherit; }
.separator { color: #889; font-size: 0.8rem; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; cursor: pointer; }

.card-box { background: white; border-radius: 15px; box-shadow: 0 0 2rem rgba(136,152,170,.15); padding: 20px; }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 12px; border-bottom: 1px solid #eee; color: #889; font-size: 0.7rem; text-transform: uppercase; background: #f6f9fc; }
.monster-table td { padding: 12px; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }

.ticket-id { font-family: monospace; background: #e8f6fc; color: #2980b9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.date-col, .client-col { display: flex; flex-direction: column; line-height: 1.2; font-size: 0.85rem; }
.badge-pill { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.bg-green { background: #eafaf1; color: #2ecc71; } .bg-orange { background: #fff3cd; color: #f39c12; }
.btn-icon-action { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f6f9fc; cursor: pointer; margin-left: 5px; transition: 0.2s; }
.btn-icon-action:hover { background: #5e72e4; color: white; }

/* Modal */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-card { background: white; width: 450px; border-radius: 10px; overflow: hidden; box-shadow: 0 15px 35px rgba(50,50,93,.2); }
.modal-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
.bg-header { background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%); }
.close-btn.white { color: white; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 20px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; margin-bottom: 15px; }
.info-grid label { color: #889; font-size: 0.75rem; display: block; }
.divider { border: 0; border-top: 1px dashed #eee; margin: 15px 0; }
.simple-table { width: 100%; font-size: 0.9rem; }
.simple-table th { text-align: left; color: #889; font-size: 0.75rem; padding-bottom: 5px; }
.total-row td { border-top: 2px solid #eee; padding-top: 10px; font-weight: 800; font-size: 1.1rem; }
.full-width { width: 100%; }

.empty-state { text-align: center; padding: 40px; color: #889; }
.fade-in { animation: fadeIn 0.4s ease-out; }
.slide-in-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>