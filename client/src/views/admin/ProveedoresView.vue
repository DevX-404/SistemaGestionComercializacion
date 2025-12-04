<template>
   <div class="page-container fade-in">
      <transition-group name="toast" tag="div" class="toast-container">
         <div v-for="notif in notificaciones" :key="notif.id" class="argon-toast" :class="notif.tipo">
            <div class="toast-icon">
               <span v-if="notif.tipo === 'success'">✅</span>
               <span v-else-if="notif.tipo === 'danger'">⛔</span>
               <span v-else>ℹ️</span>
            </div>
            <div class="toast-body">
               <h4 class="toast-title">{{ notif.titulo }}</h4>
               <p class="toast-msg">{{ notif.mensaje }}</p>
            </div>
            <button class="toast-close" @click="removerNotificacion(notif.id)">×</button>
         </div>
      </transition-group>

      <div class="page-header-actions">
         <div class="title-wrapper">
            <h3 class="page-title">Proveedores y Logística</h3>
            <p class="page-subtitle">Gestión de compras y socios</p>
         </div>
         <div class="actions-wrapper">
            <button class="btn-secondary btn-pulse" @click="abrirModalCompra">
               📥 Recepción de Mercadería
            </button>
            <button class="btn-primary" @click="abrirModalProveedor">+ Proveedor</button>
         </div>
      </div>

      <div class="card-box table-responsive">
         <table class="monster-table">
            <thead>
               <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th class="text-right"></th>
               </tr>
            </thead>
            <tbody>
               <tr v-for="p in proveedores" :key="p.id" :class="{ 'row-inactive': p.estado === 'INACTIVO' }">
                  <td>
                     <div class="cell-wrapper">
                        <div class="icon-box-sm">🏢</div>
                        <div class="cell-text"><span class="main-text">{{ p.razon_social }}</span><span
                              class="sub-text">{{ p.ruc }}</span></div>
                     </div>
                  </td>
                  <td>{{ p.contacto_nombre || '-' }} <br> <small>{{ p.telefono }}</small></td>
                  <td><span class="status-badge" :class="p.estado === 'INACTIVO' ? 'inactive' : 'active'">{{ p.estado ||
                        'ACTIVO' }}</span></td>
                  <td class="text-right">
                     <button v-if="p.estado !== 'INACTIVO'" class="btn-action delete" @click="eliminar(p)">🗑️</button>
                     <button v-else class="btn-action restore" @click="reactivar(p)">♻️</button>
                  </td>
               </tr>
            </tbody>
         </table>
      </div>

      <transition name="modal-fade">
         <div v-if="modalProveedor" class="modal-backdrop" @click.self="modalProveedor = false">
            <div class="modal-card slide-in-up">
               <div class="modal-header">
                  <h4>Nuevo Proveedor</h4><button class="close-btn" @click="modalProveedor = false">×</button>
               </div>
               <div class="modal-body">
                  <div style="display:flex; gap:10px; margin-bottom:15px;">
                     <input v-model="formProv.ruc" placeholder="RUC" class="input-styled" maxlength="11">
                     <button class="btn-primary" @click="buscarSunat">🔍</button>
                  </div>
                  <div class="form-group"><label>Razón Social</label><input v-model="formProv.razon_social"
                        class="input-styled" :readonly="bloqueado"></div>
                  <div class="form-group"><label>Dirección</label><input v-model="formProv.direccion"
                        class="input-styled" :readonly="bloqueado"></div>
                  <div class="form-grid-layout" style="grid-template-columns: 1fr 1fr; gap: 15px;">
                     <div class="form-group"><label>Contacto</label><input v-model="formProv.contacto_nombre"
                           class="input-styled"></div>
                     <div class="form-group"><label>Teléfono</label><input v-model="formProv.telefono"
                           class="input-styled"></div>
                  </div>
               </div>
               <div class="modal-footer"><button class="btn-primary full-width"
                     @click="guardarProveedor">Guardar</button></div>
            </div>
         </div>
      </transition>

      <transition name="modal-fade">
         <div v-if="modalCompra" class="modal-backdrop" @click.self="modalCompra = false">
            <div class="modal-card slide-in-up modal-xl">
               <div class="modal-header">
                  <div style="display:flex; align-items:center; gap:10px;">
                     <div class="icon-box-sm bg-green">📥</div>
                     <div>
                        <h4 style="margin:0">Nota de Ingreso</h4>
                        <small class="text-muted">Registro de Compras</small>
                     </div>
                  </div>
                  <button class="close-btn" @click="modalCompra = false">×</button>
               </div>

               <div class="modal-body">
                  <div class="invoice-header">
                     <div class="form-group">
                        <label>Proveedor</label>
                        <select v-model="cabeceraCompra.proveedor_id" class="input-styled">
                           <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razon_social }}</option>
                        </select>
                     </div>
                     <div class="form-group">
                        <label>Nro. Documento (Factura/Guía)</label>
                        <input v-model="cabeceraCompra.numero_documento" class="input-styled"
                           placeholder="Ej: F001-4922">
                     </div>
                  </div>

                  <hr class="divider">

                  <div class="add-item-bar">
                     <div class="form-group grow-2">
                        <label>Producto</label>
                        <select v-model="itemTemp.sku" class="input-styled">
                           <option v-for="p in productos" :key="p.sku" :value="p.sku">{{ p.nombre }}</option>
                        </select>
                     </div>
                     <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" v-model.number="itemTemp.cantidad" class="input-styled text-center">
                     </div>
                     <div class="form-group">
                        <label>Costo Unit. (S/)</label>
                        <input type="number" v-model.number="itemTemp.costo_unitario" class="input-styled text-center">
                     </div>
                     <button class="btn-add-item" @click="agregarItemLista">⬇ Agregar</button>
                  </div>

                  <div class="items-table-container">
                     <table class="simple-table">
                        <thead>
                           <tr>
                              <th>SKU</th>
                              <th>Producto</th>
                              <th class="text-center">Cant.</th>
                              <th class="text-center">Costo</th>
                              <th class="text-center">Subtotal</th>
                              <th></th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr v-for="(item, index) in listaItems" :key="index">
                              <td><span class="badge-gray">{{ item.sku }}</span></td>
                              <td>{{ getNombreProducto(item.sku) }}</td>
                              <td class="text-center fw-bold">{{ item.cantidad }}</td>
                              <td class="text-center">S/ {{ item.costo_unitario.toFixed(2) }}</td>
                              <td class="text-center fw-bold">S/ {{ (item.cantidad * item.costo_unitario).toFixed(2) }}
                              </td>
                              <td class="text-right">
                                 <button class="btn-remove-mini" @click="listaItems.splice(index, 1)">×</button>
                              </td>
                           </tr>
                           <tr v-if="listaItems.length === 0">
                              <td colspan="6" class="text-center text-muted p-3">
                                 Agregue productos a la lista de ingreso...
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div class="total-footer">
                     <span>Total Costo: </span>
                     <strong>S/ {{ totalCompra.toFixed(2) }}</strong>
                  </div>

               </div>
               <div class="modal-footer">
                  <button class="btn-ghost" @click="modalCompra = false">Cancelar</button>
                  <button class="btn-success" @click="procesarIngresoMasivo" :disabled="listaItems.length === 0">
                     ✅ PROCESAR INGRESO
                  </button>
               </div>
            </div>
         </div>
      </transition>
   </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios';
import { useInventarioStore } from '../../stores/inventario';

const inventarioStore = useInventarioStore();
const proveedores = ref([]);
const productos = ref([]);
const notificaciones = ref([]);

// Estados UI
const modalProveedor = ref(false);
const modalCompra = ref(false);
const buscando = ref(false);
const bloqueado = ref(false);

// Formularios
const formProv = ref({ ruc: '', razon_social: '', contacto_nombre: '', telefono: '', direccion: '' });

// --- LÓGICA NUEVA DE COMPRA ---
const cabeceraCompra = ref({ proveedor_id: '', numero_documento: '' });
const itemTemp = ref({ sku: '', cantidad: 1, costo_unitario: 0 });
const listaItems = ref([]);

const notify = (t, m, k = 'success') => {
   const id = Date.now(); notificaciones.value.push({ id, titulo: t, mensaje: m, tipo: k });
   setTimeout(() => notificaciones.value.shift(), 4000);
};

const cargar = async () => {
   const res = await api.get('/proveedores');
   proveedores.value = res.data;
   await inventarioStore.fetchProductos();
   productos.value = inventarioStore.productos;
};

// --- FUNCIONES DE COMPRA MASIVA ---
const agregarItemLista = () => {
   if (!itemTemp.value.sku || itemTemp.value.cantidad <= 0 || itemTemp.value.costo_unitario <= 0) {
      return notify('Error', 'Datos de producto inválidos', 'warning');
   }
   // Validar duplicados en la lista visual
   const existe = listaItems.value.find(i => i.sku === itemTemp.value.sku);
   if (existe) {
      existe.cantidad += itemTemp.value.cantidad; // Sumar cantidad si ya está
   } else {
      listaItems.value.push({ ...itemTemp.value });
   }
   // Reset item temp (pero mantenemos el SKU por si quiere agregar otro del mismo tipo rápido)
   itemTemp.value.cantidad = 1;
};

const getNombreProducto = (sku) => productos.value.find(p => p.sku === sku)?.nombre || 'Desconocido';

const totalCompra = computed(() => listaItems.value.reduce((acc, i) => acc + (i.cantidad * i.costo_unitario), 0));

const procesarIngresoMasivo = async () => {
   if (!cabeceraCompra.value.proveedor_id || !cabeceraCompra.value.numero_documento) {
      return notify('Faltan Datos', 'Seleccione proveedor y nro de documento', 'warning');
   }

   const payload = {
      proveedor_id: cabeceraCompra.value.proveedor_id,
      numero_documento: cabeceraCompra.value.numero_documento,
      items: listaItems.value
   };

   try {
      await api.post('/inventario/entrada', payload);
      notify('Éxito', 'Ingreso de mercadería registrado correctamente');
      modalCompra.value = false;
      listaItems.value = [];
      cabeceraCompra.value = { proveedor_id: '', numero_documento: '' };
      cargar(); // Recargar stocks
   } catch (e) {
      notify('Error', 'No se pudo registrar el ingreso', 'danger');
   }
};

// --- LÓGICA PROVEEDOR (Antigua) ---
const buscarSunat = async () => {
   // (Misma lógica de antes...)
   if (formProv.value.ruc.length !== 11) return alert('RUC 11 dígitos');
   buscando.value = true;
   try {
      const { data } = await api.post('/proveedores/consulta-ruc', { ruc: formProv.value.ruc });
      if (data.success) {
         formProv.value.razon_social = data.razon_social;
         formProv.value.direccion = data.direccion;
         bloqueado.value = true;
      }
   } catch (e) { notify('Error', 'No encontrado', 'warning'); } finally { buscando.value = false; }
};
const guardarProveedor = async () => { await api.post('/proveedores', formProv.value); modalProveedor.value = false; cargar(); notify('Ok', 'Proveedor guardado'); };
const eliminar = async (p) => { if (confirm('¿Inactivar?')) { await api.delete(`/proveedores/${p.id}`); cargar(); } };
const abrirModalProveedor = () => { formProv.value = {}; bloqueado.value = false; modalProveedor.value = true; };
const abrirModalCompra = () => {
   // Preparamos el modal limpio
   if (proveedores.value.length > 0) cabeceraCompra.value.proveedor_id = proveedores.value[0].id;
   modalCompra.value = true;
};

// EN EL SCRIPT
const reactivar = async (p) => {
    if(!confirm('¿Reactivar proveedor?')) return;
    try {
        await api.patch(`/proveedores/${p.id}/reactivar`);
        cargar(); notify('Listo', 'Proveedor activo de nuevo');
    } catch(e) { notify('Error', 'Falló reactivación', 'danger'); }
};

onMounted(() => cargar());
</script>

<style scoped>
.page-container {
   padding: 20px;
}

.page-header-actions {
   display: flex;
   justify-content: space-between;
   margin-bottom: 25px;
}

.btn-primary {
   background: #5e72e4;
   color: white;
   border: none;
   padding: 10px 15px;
   border-radius: 5px;
   font-weight: bold;
}

.btn-secondary {
   background: #172b4d;
   color: white;
   border: none;
   padding: 10px 15px;
   border-radius: 5px;
   font-weight: bold;
}

.btn-success {
   background: #2dce89;
   color: white;
   border: none;
   padding: 10px;
   border-radius: 5px;
   font-weight: bold;
}

.card-box {
   background: white;
   border-radius: 15px;
   box-shadow: 0 0 2rem rgba(136, 152, 170, .15);
   padding: 20px;
}

.monster-table {
   width: 100%;
   border-collapse: collapse;
}

.monster-table th {
   text-align: left;
   padding: 10px;
   color: #8898aa;
   border-bottom: 1px solid #eee;
   font-size: 0.75rem;
   text-transform: uppercase;
}

.monster-table td {
   padding: 15px 10px;
   border-bottom: 1px solid #f5f5f5;
}

.icon-box-sm {
   width: 35px;
   height: 35px;
   background: #fff4de;
   color: #f39c12;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 8px;
   margin-right: 10px;
}

.cell-wrapper {
   display: flex;
   align-items: center;
}

.main-text {
   display: block;
   font-weight: 700;
   color: #32325d;
   font-size: 0.9rem;
}

.sub-text {
   font-size: 0.75rem;
   color: #889;
}

.status-badge {
   padding: 4px 10px;
   border-radius: 12px;
   font-size: 0.7rem;
   font-weight: 800;
}

.status-badge.active {
   background: #eafaf1;
   color: #2dce89;
}

.status-badge.inactive {
   background: #fdedec;
   color: #f5365c;
}

.row-inactive {
   opacity: 0.6;
   background: #f9f9f9;
}

.btn-action.delete {
   background: white;
   color: #f5365c;
   border: none;
   cursor: pointer;
   font-size: 1.1rem;
}

/* Modal styles same as previous */
.modal-backdrop {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 999;
}

.modal-card {
   background: white;
   width: 450px;
   border-radius: 10px;
   padding: 20px;
   box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.modal-header {
   display: flex;
   justify-content: space-between;
   margin-bottom: 20px;
}

.input-styled {
   width: 100%;
   padding: 10px;
   border: 1px solid #ddd;
   border-radius: 5px;
   box-sizing: border-box;
}

.form-group {
   margin-bottom: 15px;
}

.full-width {
   width: 100%;
   margin-top: 10px;
}

.toast-container {
   position: fixed;
   top: 20px;
   right: 20px;
   z-index: 10000;
}

.argon-toast {
   background: white;
   padding: 15px;
   margin-bottom: 10px;
   border-radius: 8px;
   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
   border-left: 4px solid #2dce89;
   width: 250px;
}

.argon-toast.warning {
   border-left-color: #fb6340;
}

.argon-toast.danger {
   border-left-color: #f5365c;
}

.toast-title {
   margin: 0;
   font-size: 0.8rem;
   font-weight: bold;
}

.toast-msg {
   margin: 2px 0 0;
   font-size: 0.85rem;
   color: #666;
}

/* ... PEGAR ESTILOS DEL PASO ANTERIOR AQUÍ ... */
.page-container {
   padding: 20px;
   font-family: 'Segoe UI', sans-serif;
}

.page-header-actions {
   display: flex;
   justify-content: space-between;
   margin-bottom: 25px;
}

.card-box {
   background: white;
   border-radius: 15px;
   padding: 20px;
   box-shadow: 0 0 2rem rgba(136, 152, 170, .15);
}

.monster-table {
   width: 100%;
   border-collapse: collapse;
}

.monster-table th {
   text-align: left;
   padding: 10px;
   border-bottom: 1px solid #eee;
   color: #889;
   font-size: 0.75rem;
   text-transform: uppercase;
}

.monster-table td {
   padding: 15px 10px;
   border-bottom: 1px solid #f5f5f5;
}

.btn-primary {
   background: #5e72e4;
   color: white;
   border: none;
   padding: 10px 20px;
   border-radius: 5px;
   font-weight: bold;
   cursor: pointer;
}

.btn-secondary {
   background: #172b4d;
   color: white;
   border: none;
   padding: 10px 20px;
   border-radius: 5px;
   font-weight: bold;
   cursor: pointer;
}

.btn-success {
   background: #2dce89;
   color: white;
   border: none;
   padding: 10px 20px;
   border-radius: 5px;
   font-weight: bold;
   cursor: pointer;
}

.btn-ghost {
   background: none;
   border: 1px solid #ddd;
   padding: 10px 20px;
   border-radius: 5px;
   margin-right: 10px;
   cursor: pointer;
}

.btn-action.delete {
   background: white;
   color: #f5365c;
   border: none;
   cursor: pointer;
}

.icon-box-sm {
   width: 35px;
   height: 35px;
   background: #fff4de;
   color: #f39c12;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 8px;
   margin-right: 10px;
}

.cell-wrapper {
   display: flex;
   align-items: center;
}

.main-text {
   display: block;
   font-weight: 700;
   color: #32325d;
   font-size: 0.9rem;
}

.sub-text {
   font-size: 0.75rem;
   color: #889;
}

.status-badge {
   padding: 4px 10px;
   border-radius: 12px;
   font-size: 0.7rem;
   font-weight: 800;
}

.status-badge.active {
   background: #eafaf1;
   color: #2dce89;
}

.status-badge.inactive {
   background: #fdedec;
   color: #f5365c;
}

.row-inactive {
   opacity: 0.6;
   background: #f9f9f9;
}

/* --- NUEVOS ESTILOS PARA MODAL DE COMPRA --- */
.modal-xl {
   width: 800px !important;
}

/* Más ancho */
.bg-green {
   background: #eafaf1;
   color: #2dce89;
}

.invoice-header {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 20px;
   background: #f8f9fe;
   padding: 20px;
   border-radius: 10px;
   margin-bottom: 20px;
}

.divider {
   border: 0;
   border-top: 1px dashed #ddd;
   margin: 20px 0;
}

.add-item-bar {
   display: flex;
   gap: 10px;
   align-items: flex-end;
   margin-bottom: 15px;
   background: white;
   padding: 10px;
   border: 1px solid #eee;
   border-radius: 8px;
}

.grow-2 {
   flex: 2;
}

.btn-add-item {
   background: #5e72e4;
   color: white;
   border: none;
   padding: 10px 15px;
   border-radius: 5px;
   height: 42px;
   font-weight: bold;
   cursor: pointer;
   transition: 0.2s;
}

.btn-add-item:hover {
   transform: translateY(-2px);
   box-shadow: 0 4px 6px rgba(50, 50, 93, .11);
}

.items-table-container {
   max-height: 300px;
   overflow-y: auto;
   border: 1px solid #eee;
   border-radius: 8px;
}

.simple-table {
   width: 100%;
   border-collapse: collapse;
}

.simple-table th {
   background: #f6f9fc;
   padding: 10px;
   font-size: 0.75rem;
   color: #8898aa;
   text-transform: uppercase;
   position: sticky;
   top: 0;
}

.simple-table td {
   padding: 10px;
   border-bottom: 1px solid #f0f0f0;
   font-size: 0.9rem;
}

.badge-gray {
   background: #e9ecef;
   padding: 3px 8px;
   border-radius: 4px;
   font-family: monospace;
   font-size: 0.8rem;
}

.btn-remove-mini {
   background: #fdedec;
   color: #f5365c;
   border: none;
   width: 25px;
   height: 25px;
   border-radius: 50%;
   cursor: pointer;
   font-weight: bold;
}

.total-footer {
   text-align: right;
   font-size: 1.2rem;
   margin-top: 20px;
   color: #32325d;
}

/* Toasts y Modales Base */
.modal-backdrop {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.5);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 1000;
   backdrop-filter: blur(2px);
}

.modal-card {
   background: white;
   width: 450px;
   padding: 0;
   border-radius: 10px;
   box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
   overflow: hidden;
   display: flex;
   flex-direction: column;
}

.modal-header {
   padding: 20px;
   border-bottom: 1px solid #eee;
   display: flex;
   justify-content: space-between;
   align-items: center;
}

.modal-body {
   padding: 25px;
   flex: 1;
   overflow-y: auto;
}

.modal-footer {
   padding: 20px;
   border-top: 1px solid #eee;
   text-align: right;
   background: #f8f9fe;
}

.input-styled {
   width: 100%;
   padding: 10px;
   border: 1px solid #dee2e6;
   border-radius: 5px;
   box-sizing: border-box;
}

.form-group label {
   display: block;
   margin-bottom: 5px;
   font-weight: 600;
   color: #525f7f;
   font-size: 0.85rem;
}

.close-btn {
   background: none;
   border: none;
   font-size: 1.5rem;
   cursor: pointer;
   color: #889;
}

.toast-container {
   position: fixed;
   top: 20px;
   right: 20px;
   z-index: 11000;
   display: flex;
   flex-direction: column;
   gap: 10px;
}

.argon-toast {
   background: white;
   width: 300px;
   padding: 15px;
   border-radius: 6px;
   display: flex;
   gap: 15px;
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
   border-left: 5px solid;
   animation: slideInRight 0.3s;
}

.argon-toast.success {
   border-left-color: #2dce89;
}

.argon-toast.danger {
   border-left-color: #f5365c;
}

.argon-toast.warning {
   border-left-color: #fb6340;
}

.toast-title {
   margin: 0;
   font-weight: 800;
   font-size: 0.85rem;
}

.toast-msg {
   margin: 2px 0 0;
   font-size: 0.85rem;
   color: #555;
}

.toast-close {
   margin-left: auto;
   background: none;
   border: none;
   cursor: pointer;
   font-size: 1.2rem;
}

@keyframes slideInRight {
   from {
      opacity: 0;
      transform: translateX(50px);
   }

   to {
      opacity: 1;
      transform: translateX(0);
   }
}

.slide-in-up {
   animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
   from {
      opacity: 0;
      transform: translateY(50px);
   }

   to {
      opacity: 1;
      transform: translateY(0);
   }
}

.fade-in {
   animation: fadeIn 0.4s;
}

@keyframes fadeIn {
   from {
      opacity: 0;
   }

   to {
      opacity: 1;
   }
}
</style>