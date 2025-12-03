<template>
  <div class="page-container">
    <h3>📈 Reportes de Ventas</h3>
    
    <div class="filters-card">
      <div class="filter-group">
        <label>Fecha Inicio</label>
        <input type="date" v-model="filtros.inicio">
      </div>
      <div class="filter-group">
        <label>Fecha Fin</label>
        <input type="date" v-model="filtros.fin">
      </div>
      <button class="btn-search" @click="buscarVentas">🔍 Consultar</button>
    </div>

    <div class="card-box" v-if="ventas.length > 0">
      <div class="header-result">
        <h4>Resultados: {{ ventas.length }} ventas encontradas</h4>
        <button class="btn-pdf" @click="generarPDF">📄 Descargar PDF</button>
      </div>

      <table class="monster-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Tipo Pago</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in ventas" :key="v.id">
            <td>#{{ v.id }}</td>
            <td>{{ formatearFecha(v.fecha_emision) }}</td>
            <td>{{ v.cliente }}<br><small>{{ v.numero_documento }}</small></td>
            <td>
                <span :class="v.tipo_pago === 'CONTADO' ? 'tag-green' : 'tag-orange'">
                    {{ v.tipo_pago }}
                </span>
            </td>
            <td class="fw-bold">S/ {{ v.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="buscado" class="no-results">
        No se encontraron ventas en este rango.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- 1. CAMBIO AQUÍ: Importación con nombre

const filtros = ref({ inicio: '', fin: '' });
const ventas = ref([]);
const buscado = ref(false);

const buscarVentas = async () => {
    if(!filtros.value.inicio || !filtros.value.fin) return alert("Selecciona las fechas");
    
    try {
        const { data } = await api.get(`/reportes/ventas?inicio=${filtros.value.inicio}&fin=${filtros.value.fin}`);
        ventas.value = data;
        buscado.value = true;
    } catch (error) {
        console.error(error);
        alert("Error obteniendo reporte");
    }
};

const generarPDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.text("Reporte de Ventas - TecnoMundo", 14, 20);
    doc.setFontSize(10);
    doc.text(`Desde: ${filtros.value.inicio} Hasta: ${filtros.value.fin}`, 14, 30);
    doc.text(`Generado por: Sistema Admin`, 14, 35);

    // Tabla
    const columnas = ["ID", "Fecha", "Cliente", "Doc", "Pago", "Total (S/)"];
    const filas = ventas.value.map(v => [
        v.id,
        formatearFecha(v.fecha_emision),
        v.cliente,
        v.numero_documento,
        v.tipo_pago,
        v.total
    ]);

    // <--- 2. CAMBIO AQUÍ: Usamos la función importada, pasando 'doc' como primer argumento
    autoTable(doc, {
        startY: 40,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80] }, // Color oscuro
    });

    // Total General al final
    // autoTable guarda el estado en doc.lastAutoTable
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalPeriodo = ventas.value.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
    
    doc.setFontSize(12);
    doc.text(`Total Vendido: S/ ${totalPeriodo.toFixed(2)}`, 14, finalY);

    // Descargar
    doc.save(`reporte_ventas_${filtros.value.inicio}.pdf`);
};

const formatearFecha = (f) => new Date(f).toLocaleDateString('es-PE');
</script>

<style scoped>
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; }
.filters-card { display: flex; gap: 15px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); align-items: flex-end; margin-bottom: 20px; }
.filter-group { display: flex; flex-direction: column; }
.filter-group label { font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; color: #555; }
.filter-group input { padding: 8px; border: 1px solid #ddd; border-radius: 5px; }

.btn-search { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; height: 38px; }
.btn-pdf { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }

.card-box { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.header-result { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th, .monster-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
.tag-green { color: #27ae60; font-weight: bold; background: #eafaf1; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
.tag-orange { color: #e67e22; font-weight: bold; background: #fef5e7; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }
.no-results { text-align: center; color: #777; margin-top: 30px; }
.fw-bold { font-weight: bold; }
</style>