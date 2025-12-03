<template>
  <div class="page-container fade-in">
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Proveedores y Compras</h3>
        <p class="page-subtitle">Gestión de socios comerciales y reabastecimiento</p>
      </div>
      <div class="actions-wrapper">
        <button class="btn-secondary" @click="abrirModalCompra">📥 Registrar Compra</button>
        <button class="btn-primary" @click="abrirModalProveedor"><span>+</span> Proveedor</button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Empresa / RUC</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prov in proveedores" :key="prov.id">
            <td>
               <div class="cell-wrapper">
                  <div class="icon-box-sm">🏢</div>
                  <div class="cell-text">
                    <span class="main-text">{{ prov.razon_social }}</span>
                    <span class="sub-text">RUC: {{ prov.ruc }}</span>
                  </div>
               </div>
            </td>
            <td>{{ prov.contacto_nombre || '-' }}</td>
            <td>{{ prov.telefono || '-' }}</td>
            <td class="text-muted small">{{ prov.direccion }}</td>
            <td class="text-right">
              <button class="btn-action delete" @click="eliminar(prov.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
      <div v-if="modalProveedor" class="modal-backdrop" @click.self="modalProveedor = false">
        <div class="modal-card slide-in-up">
          <div class="modal-header">
            <h4>Nuevo Proveedor</h4>
            <button class="close-btn" @click="modalProveedor = false">×</button>
          </div>
          <div class="modal-body">
             <div class="sunat-search-group">
               <input v-model="formProv.ruc" placeholder="RUC (11 dígitos)" class="input-styled" maxlength="11">
               <button class="btn-primary" @click="buscarSunat" :disabled="buscando">🔍</button>
             </div>

             <div class="form-group mt-3">
               <label>Razón Social</label>
               <input v-model="formProv.razon_social" class="input-styled" :readonly="bloqueado">
             </div>
             <div class="form-group">
               <label>Dirección</label>
               <input v-model="formProv.direccion" class="input-styled" :readonly="bloqueado">
             </div>
             <div class="form-grid">
               <div class="form-group">
                 <label>Contacto</label>
                 <input v-model="formProv.contacto_nombre" class="input-styled">
               </div>
               <div class="form-group">
                 <label>Teléfono</label>
                 <input v-model="formProv.telefono" class="input-styled">
               </div>
             </div>
          </div>
          <div class="modal-footer">
            <button class="btn-primary full-width" @click="guardarProveedor">Guardar Proveedor</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="modalCompra" class="modal-backdrop" @click.self="modalCompra = false">
        <div class="modal-card slide-in-up">
           <div class="modal-header">
            <h4>📥 Ingreso de Mercadería</h4>
            <button class="close-btn" @click="modalCompra = false">×</button>
          </div>
          <div class="modal-body">
            <p class="info-text">Registrar entrada de stock al almacén.</p>
            
            <div class="form-group">
              <label>Producto</label>
              <select v-model="formCompra.sku" class="input-styled">
                 <option v-for="p in productos" :key="p.sku" :value="p.sku">{{ p.nombre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Proveedor</label>
              <select v-model="formCompra.proveedor_id" class="input-styled">
                 <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razon_social }}</option>
              </select>
            </div>
            <div class="form-grid">
               <div class="form-group">
                 <label>Cantidad</label>
                 <input type="number" v-model.number="formCompra.cantidad" class="input-styled">
               </div>
               <div class="form-group">
                 <label>Costo Unitario (S/)</label>
                 <input type="number" v-model.number="formCompra.costo_unitario" class="input-styled">
               </div>
            </div>
          </div>
          <div class="modal-footer">
             <button class="btn-success full-width" @click="registrarCompra">Confirmar Ingreso</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
// ... (Misma lógica de script que el paso anterior de Proveedores, no cambia nada funcional) ...
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { useInventarioStore } from '../../stores/inventario';

const inventarioStore = useInventarioStore();
const proveedores = ref([]);
const productos = ref([]);
const modalProveedor = ref(false);
const modalCompra = ref(false);
const buscando = ref(false);
const bloqueado = ref(false);

const formProv = ref({ ruc: '', razon_social: '', contacto_nombre: '', telefono: '', direccion: '' });
const formCompra = ref({ sku: '', proveedor_id: '', cantidad: 1, costo_unitario: 0 });

const cargarDatos = async () => {
    const res = await api.get('/proveedores');
    proveedores.value = res.data;
    await inventarioStore.fetchProductos();
    productos.value = inventarioStore.productos;
};

const buscarSunat = async () => {
    if(formProv.value.ruc.length !== 11) return alert('RUC 11 dígitos');
    buscando.value = true;
    try {
        const { data } = await api.post('/proveedores/consulta-ruc', { ruc: formProv.value.ruc });
        if(data.success) {
            formProv.value.razon_social = data.razon_social;
            formProv.value.direccion = data.direccion;
            bloqueado.value = true;
        }
    } catch (e) { alert('No encontrado'); } finally { buscando.value = false; }
};

const abrirModalProveedor = () => { formProv.value = {}; bloqueado.value = false; modalProveedor.value = true; };
const abrirModalCompra = () => { modalCompra.value = true; };

const guardarProveedor = async () => {
    await api.post('/proveedores', formProv.value);
    modalProveedor.value = false; cargarDatos();
};
const registrarCompra = async () => {
    await api.post('/inventario/entrada', formCompra.value);
    alert('Stock actualizado'); modalCompra.value = false;
};
const eliminar = async (id) => { if(confirm('Borrar?')) { await api.delete(`/proveedores/${id}`); cargarDatos(); }};

onMounted(() => cargarDatos());
</script>

<style scoped>
.page-container { padding: 10px; }

/* HEADER */
.page-header-actions {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
}
.page-title { margin: 0; font-size: 1.5rem; color: #32325d; font-weight: 700; }
.page-subtitle { margin: 5px 0 0; color: #8898aa; font-size: 0.9rem; }

.actions-wrapper { display: flex; gap: 15px; }
.search-input-group {
  background: white; border-radius: 30px; padding: 8px 15px; box-shadow: 0 1px 3px rgba(50,50,93,.15);
  display: flex; align-items: center;
}
.search-input-group input { border: none; outline: none; margin-left: 10px; color: #525f7f; }
.btn-pulse { animation: pulse-shadow 2s infinite; }
@keyframes pulse-shadow { 0% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(94, 114, 228, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0); } }

/* TABLA ESTILIZADA */
.cell-wrapper { display: flex; align-items: center; gap: 15px; }
.avatar-circle { width: 40px; height: 40px; background: linear-gradient(87deg, #11cdef 0, #1171ef 100%); color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.cell-text { display: flex; flex-direction: column; }
.main-text { font-weight: 600; color: #32325d; font-size: 0.9rem; }
.sub-text { font-size: 0.75rem; color: #8898aa; }

.badge-light { background: #e9ecef; color: #32325d; padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.status-dot.active { background: #2dce89; }

.btn-action { width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer; margin-left: 5px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.btn-action.edit { background: #fff; color: #5e72e4; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.edit:hover { background: #5e72e4; color: white; }
.btn-action.delete { background: #fff; color: #f5365c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

/* MODAL BONITO */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 999; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; width: 550px; border-radius: 15px; box-shadow: 0 15px 35px rgba(50,50,93,.2); overflow: hidden; }
.modal-header { padding: 20px; background: #f8f9fe; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h4 { margin: 0; color: #32325d; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #8898aa; }

.modal-body { padding: 30px; }
.sunat-box { background: #f6f9fc; padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px dashed #dee2e6; }
.input-group-merged { display: flex; gap: 10px; }
.input-group-merged select, .input-group-merged input { border: 1px solid #dee2e6; padding: 10px; border-radius: 5px; outline: none; }
.btn-sunat { background: #5e72e4; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; font-weight: 600; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group.full { grid-column: span 2; }
.form-group label { display: block; margin-bottom: 8px; color: #525f7f; font-size: 0.85rem; font-weight: 600; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #e9ecef; border-radius: 5px; background: #fcfcfc; transition: 0.2s; box-sizing: border-box; }
.input-styled:focus { border-color: #5e72e4; background: white; box-shadow: 0 0 0 3px rgba(94,114,228,.1); outline: none; }

.modal-footer { padding: 20px; background: #f8f9fe; text-align: right; border-top: 1px solid #f0f0f0; }
.btn-ghost { background: transparent; border: none; color: #8898aa; font-weight: 600; margin-right: 15px; cursor: pointer; }

/* Animación Modal */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.slide-in-up { animation: slideUpModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUpModal { from { transform: translateY(50px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.icon-box-sm { width: 35px; height: 35px; background: #fff4de; color: #f39c12; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-right: 10px; }
.sunat-search-group { display: flex; gap: 10px; }
.mt-3 { margin-top: 15px; }
.full-width { width: 100%; }
.info-text { background: #e8f6fc; color: #2980b9; padding: 10px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 15px; }
.btn-secondary { background: #172b4d; color: white; border:none; padding: 10px 20px; border-radius: 6px; font-weight: bold; transition: 0.2s; }
.btn-secondary:hover { background: #0f1e36; }
.btn-success { background: #2dce89; color: white; border:none; padding: 10px; border-radius: 6px; font-weight: bold; }
</style>