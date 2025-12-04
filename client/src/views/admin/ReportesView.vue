<template>
  <div class="page-container fade-in">
    
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Reportes Gerenciales</h3>
        <p class="page-subtitle">Vista general del rendimiento y exportación de datos</p>
      </div>
      <button class="btn-excel shadow-hover" @click="exportarExcelGlobal">
         <span class="icon">📊</span> 
         <span>Descargar Excel Corporativo</span>
      </button>
    </div>

    <div class="kpi-grid">
       <div class="kpi-card blue">
          <div class="kpi-icon-wrapper">
             <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-content">
             <span class="kpi-label">Ingresos Totales</span>
             <h3 class="kpi-value">S/ {{ formatMoney(stats.ingresos) }}</h3>
          </div>
       </div>

       <div class="kpi-card purple">
          <div class="kpi-icon-wrapper">
             <span class="kpi-icon">🧾</span>
          </div>
          <div class="kpi-content">
             <span class="kpi-label">Ventas Realizadas</span>
             <h3 class="kpi-value">{{ stats.ventas_cantidad }}</h3>
          </div>
       </div>

       <div class="kpi-card orange">
          <div class="kpi-icon-wrapper">
             <span class="kpi-icon">👥</span>
          </div>
          <div class="kpi-content">
             <span class="kpi-label">Clientes Activos</span>
             <h3 class="kpi-value">{{ stats.clientes }}</h3>
          </div>
       </div>

       <div class="kpi-card green">
          <div class="kpi-icon-wrapper">
             <span class="kpi-icon">📦</span>
          </div>
          <div class="kpi-content">
             <span class="kpi-label">Productos en Stock</span>
             <h3 class="kpi-value">{{ stats.productos }}</h3>
          </div>
       </div>
    </div>

    <div class="content-section mt-5">
       <div class="section-header">
          <h4 class="section-title-sm">Historial de Transacciones</h4>
          
          <div class="filters-bar">
            <div class="input-group-wrapper">
               <label>Desde:</label>
               <input type="date" v-model="filtros.inicio" class="input-styled">
            </div>
            <div class="input-group-wrapper">
               <label>Hasta:</label>
               <input type="date" v-model="filtros.fin" class="input-styled">
            </div>
            <button class="btn-filter" @click="buscarVentas">
               🔍 Actualizar
            </button>
          </div>
       </div>

       <div class="card-box table-responsive">
         <table class="monster-table">
           <thead>
             <tr>
               <th>N° Ticket</th>
               <th>Fecha de Emisión</th>
               <th>Cliente</th>
               <th>Método de Pago</th>
               <th class="text-right">Total Venta</th>
               <th class="text-center">Opciones</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="v in ventas" :key="v.id">
               <td><span class="ticket-badge">#{{ v.id.toString().padStart(6, '0') }}</span></td>
               <td>
                  <div class="date-wrapper">
                     <span class="main-date">{{ formatDate(v.fecha_emision) }}</span>
                     <span class="sub-time">{{ formatTime(v.fecha_emision) }}</span>
                  </div>
               </td>
               <td>
                  <div class="client-info">
                     <span class="client-name">{{ v.cliente }}</span>
                     <span class="client-doc">{{ v.numero_documento }}</span>
                  </div>
               </td>
               <td>
                  <span class="status-pill" :class="v.tipo_pago === 'CONTADO' ? 'status-success' : 'status-warning'">
                     {{ v.tipo_pago }}
                  </span>
               </td>
               <td class="text-right font-weight-bold text-dark">
                  S/ {{ parseFloat(v.total).toFixed(2) }}
               </td>
               <td class="text-center">
                  <button class="btn-icon" @click="verDetalle(v.id)" title="Ver Detalles">
                     👁️
                  </button>
               </td>
             </tr>
           </tbody>
         </table>
         
         <div v-if="ventas.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <p>No se encontraron registros en este rango de fechas.</p>
         </div>
       </div>
    </div>

    <transition name="modal-fade">
       <div v-if="modalDetalle" class="modal-backdrop" @click.self="modalDetalle = false">
          <div class="modal-card slide-in-up">
             <div class="modal-header-custom">
                <div class="header-content">
                   <h4>Detalle de Venta</h4>
                   <span class="ticket-number">#{{ ventaSeleccionada?.id }}</span>
                </div>
                <button class="close-btn" @click="modalDetalle = false">×</button>
             </div>
             <div class="modal-body-custom">
                <div class="detail-summary">
                    <div class="summary-item">
                       <label>Cliente</label>
                       <span>{{ ventaSeleccionada?.cliente || ventaSeleccionada?.razon_social }}</span>
                    </div>
                    <div class="summary-item text-right">
                       <label>Fecha</label>
                       <span>{{ formatDate(ventaSeleccionada?.fecha_emision) }}</span>
                    </div>
                </div>
                
                <table class="detail-table">
                   <thead>
                      <tr>
                         <th>Producto</th>
                         <th class="text-center">Cant.</th>
                         <th class="text-right">Subtotal</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr v-for="(item, i) in ventaSeleccionada?.items" :key="i">
                         <td>{{ getNombreProducto(item.sku) }}</td>
                         <td class="text-center">{{ item.cantidad }}</td>
                         <td class="text-right">S/ {{ parseFloat(item.subtotal).toFixed(2) }}</td>
                      </tr>
                   </tbody>
                   <tfoot>
                      <tr>
                         <td colspan="2" class="text-right label-total">TOTAL</td>
                         <td class="text-right value-total">S/ {{ parseFloat(ventaSeleccionada?.total).toFixed(2) }}</td>
                      </tr>
                   </tfoot>
                </table>
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
import * as XLSX from 'xlsx-js-style'; // USAMOS LA LIBRERÍA CON ESTILOS

const inventario = useInventarioStore();
const ventas = ref([]);
const stats = ref({ ingresos: 0, ventas_cantidad: 0, clientes: 0, productos: 0 });
const filtros = ref({ 
    inicio: new Date().toISOString().split('T')[0], 
    fin: new Date().toISOString().split('T')[0] 
});
const modalDetalle = ref(false);
const ventaSeleccionada = ref(null);

onMounted(async () => {
    await inventario.fetchProductos();
    cargarResumenGeneral();
    buscarVentas();
});

const cargarResumenGeneral = async () => {
    try {
        const { data } = await api.get('/reportes/general');
        stats.value = data.kpis;
    } catch (e) { console.error("Error KPIs", e); }
};

const buscarVentas = async () => {
   try {
      const { data } = await api.get(`/reportes/ventas?inicio=${filtros.value.inicio}&fin=${filtros.value.fin}`);
      ventas.value = data;
   } catch(e) { alert('Error cargando historial'); }
};

const verDetalle = async (id) => {
   try {
      const { data } = await api.get(`/ventas/${id}`);
      ventaSeleccionada.value = data;
      modalDetalle.value = true;
   } catch(e) { alert('Error al detalle'); }
};

// --- LÓGICA EXCEL MEJORADA ---
const exportarExcelGlobal = () => {
    const wb = XLSX.utils.book_new();
    
    // Estilos base para encabezados
    const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } }, // Azul corporativo
        alignment: { horizontal: "center" },
        border: { bottom: { style: "thin", color: { rgb: "000000" } } }
    };

    // 1. HOJA RESUMEN
    const resumenData = [
        [{ v: "REPORTE GENERAL DE GESTIÓN", s: { font: { bold: true, sz: 14 } } }],
        ["Generado el:", new Date().toLocaleString()],
        [], // Espacio
        ["KPI", "VALOR ACTUAL"], // Encabezados manuales
        ["Ingresos Totales", stats.value.ingresos],
        ["Ventas Totales", stats.value.ventas_cantidad],
        ["Total Clientes", stats.value.clientes],
        ["Total Productos", stats.value.productos],
    ];

    // Aplicar estilo a los headers de resumen (Fila 4, indices 0 y 1)
    // Nota: xlsx-js-style usa objetos para celdas con estilo, aquí lo simplificamos creando la hoja primero
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    // Ajustar ancho columnas resumen
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    // 2. HOJA VENTAS (Datatable)
    const ventasBody = ventas.value.map(v => ({
        "ID Ticket": v.id,
        "Fecha Emisión": formatDate(v.fecha_emision),
        "Hora": formatTime(v.fecha_emision),
        "Cliente": v.cliente,
        "Documento": v.numero_documento,
        "Método Pago": v.tipo_pago,
        "Total (S/)": parseFloat(v.total)
    }));

    const wsVentas = XLSX.utils.json_to_sheet(ventasBody);
    
    // Auto-ancho para Ventas (Calculamos el ancho basado en el contenido o header)
    const wscolsVentas = [
        { wch: 10 }, // ID
        { wch: 15 }, // Fecha
        { wch: 10 }, // Hora
        { wch: 35 }, // Cliente (Más ancho)
        { wch: 15 }, // Doc
        { wch: 15 }, // Pago
        { wch: 15 }  // Total
    ];
    wsVentas['!cols'] = wscolsVentas;

    // Aplicar estilo simple a la primera fila (Headers) si se desea iterar sobre las celdas 'A1', 'B1', etc.
    // Con xlsx-js-style se puede hacer post-proceso, pero solo con los anchos ya se ve mucho mejor.
    XLSX.utils.book_append_sheet(wb, wsVentas, "Detalle Ventas");

    // 3. HOJA PRODUCTOS
    if(inventario.productos.length > 0) {
        const productosBody = inventario.productos.map(p => ({
             "SKU": p.sku,
             "Nombre Producto": p.nombre,
             "Categoría": p.categoria?.nombre || '-',
             "Stock Actual": p.stock,
             "Precio Unit.": p.precio
        }));
        const wsProductos = XLSX.utils.json_to_sheet(productosBody);
        wsProductos['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 10 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, wsProductos, "Inventario");
    }

    XLSX.writeFile(wb, `Reporte_Gerencial_${filtros.value.inicio}.xlsx`);
};

// Helpers
const formatMoney = (amount) => parseFloat(amount || 0).toFixed(2);
const formatDate = (f) => new Date(f).toLocaleDateString('es-PE');
const formatTime = (f) => new Date(f).toLocaleTimeString('es-PE', {hour:'2-digit', minute:'2-digit'});
const getNombreProducto = (sku) => inventario.productos.find(p => p.sku === sku)?.nombre || 'Producto desconocido';
</script>

<style scoped>
/* --- LAYOUT GENERAL --- */
.page-container { 
    padding: 30px; 
    font-family: 'Inter', 'Segoe UI', sans-serif; 
    background-color: #f8f9fe; 
    min-height: 100vh; 
}

/* Header con más aire */
.page-header-actions { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
    margin-bottom: 40px; /* Más separación abajo */
}
.page-title { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0; }
.page-subtitle { color: #6b7280; margin-top: 5px; font-size: 0.95rem; }

/* Botón Excel Profesional */
.btn-excel { 
    background: #10b981; /* Un verde más moderno */
    color: white; 
    border: none; 
    padding: 12px 24px; 
    border-radius: 10px; 
    font-weight: 600; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    cursor: pointer; 
    transition: all 0.2s ease;
}
.btn-excel:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.icon { font-size: 1.2rem; }

/* --- KPI CARDS MEJORADAS --- */
.kpi-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
    gap: 30px; /* MÁS ESPACIO ENTRE TARJETAS */
    margin-bottom: 40px; 
}

.kpi-card { 
    background: white; 
    border-radius: 16px; 
    padding: 25px; 
    display: flex; 
    align-items: center; 
    gap: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0,0,0,0.03);
    transition: transform 0.2s;
}
.kpi-card:hover { transform: translateY(-3px); }

.kpi-icon-wrapper {
    width: 60px; height: 60px; 
    border-radius: 12px; 
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem;
}
/* Colores sutiles para los iconos */
.blue .kpi-icon-wrapper { background: #e0f2fe; color: #0284c7; }
.purple .kpi-icon-wrapper { background: #f3e8ff; color: #9333ea; }
.orange .kpi-icon-wrapper { background: #ffedd5; color: #ea580c; }
.green .kpi-icon-wrapper { background: #dcfce7; color: #16a34a; }

.kpi-content { display: flex; flex-direction: column; }
.kpi-label { font-size: 0.85rem; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-value { font-size: 1.8rem; font-weight: 800; color: #1f2937; margin: 5px 0 0 0; }

/* --- SECCIÓN DE CONTENIDO Y FILTROS --- */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
}
.section-title-sm { font-size: 1.2rem; font-weight: 700; color: #374151; margin: 0; }

.filters-bar {
    display: flex;
    align-items: flex-end;
    gap: 15px;
    background: white;
    padding: 10px 20px;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.input-group-wrapper { display: flex; flex-direction: column; gap: 5px; }
.input-group-wrapper label { font-size: 0.75rem; font-weight: 600; color: #6b7280; }
.input-styled { 
    border: 1px solid #e5e7eb; 
    border-radius: 6px; 
    padding: 6px 10px; 
    color: #374151; 
    outline: none; 
    font-family: inherit;
}
.btn-filter {
    background: #3b82f6; color: white; border: none; 
    padding: 8px 16px; border-radius: 6px; 
    font-weight: 600; cursor: pointer;
    height: 34px;
}

/* --- TABLA ESTILIZADA --- */
.card-box { 
    background: white; 
    border-radius: 16px; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); 
    overflow: hidden; 
    border: 1px solid #f3f4f6;
}

.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { 
    text-align: left; 
    padding: 18px 25px; /* Más padding */
    background: #f9fafb; 
    color: #6b7280; 
    font-size: 0.75rem; 
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.monster-table td { 
    padding: 16px 25px; 
    border-bottom: 1px solid #f3f4f6; 
    color: #4b5563; 
    font-size: 0.9rem;
}
.monster-table tr:last-child td { border-bottom: none; }

.ticket-badge { 
    background: #eff6ff; color: #2563eb; 
    padding: 4px 8px; border-radius: 6px; 
    font-family: 'Courier New', monospace; font-weight: 700; font-size: 0.85rem;
}

.client-info { display: flex; flex-direction: column; }
.client-name { font-weight: 600; color: #111827; }
.client-doc { font-size: 0.8rem; color: #9ca3af; }

.status-pill { 
    padding: 6px 12px; border-radius: 20px; 
    font-size: 0.75rem; font-weight: 700; 
}
.status-success { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }

.btn-icon {
    background: white; border: 1px solid #e5e7eb; 
    width: 34px; height: 34px; border-radius: 8px; 
    cursor: pointer; transition: all 0.2s; color: #6b7280;
}
.btn-icon:hover { border-color: #3b82f6; color: #3b82f6; transform: scale(1.05); }

/* --- MODAL LIMPIO --- */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); z-index: 999; }
.modal-card { background: white; width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

.modal-header-custom { 
    padding: 20px 25px; 
    background: #f8fafc; 
    display: flex; justify-content: space-between; align-items: center; 
    border-bottom: 1px solid #e2e8f0;
}
.header-content h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
.ticket-number { font-size: 0.9rem; color: #64748b; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.modal-body-custom { padding: 25px; }
.detail-summary { display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #e2e8f0; }
.summary-item { display: flex; flex-direction: column; font-size: 0.9rem; }
.summary-item label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.summary-item span { font-weight: 600; color: #334155; }

.detail-table { width: 100%; font-size: 0.9rem; }
.detail-table th { text-align: left; color: #94a3b8; padding-bottom: 10px; font-size: 0.8rem; }
.detail-table td { padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569; }
.label-total { padding-top: 15px; font-weight: 700; color: #64748b; }
.value-total { padding-top: 15px; font-weight: 800; color: #0f172a; font-size: 1.1rem; }

/* Utils */
.mt-5 { margin-top: 3rem; }
.slide-in-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 0.4s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.empty-state { text-align: center; padding: 50px; color: #9ca3af; }
.empty-icon { font-size: 3rem; margin-bottom: 10px; opacity: 0.5; }
</style>