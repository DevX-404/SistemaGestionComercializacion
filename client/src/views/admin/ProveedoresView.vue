<template>
  <div class="page-container fade-in">
    <transition-group name="toast" tag="div" class="toast-container">
       <div v-for="n in notificaciones" :key="n.id" class="argon-toast" :class="n.tipo">
          <div class="toast-icon">ℹ️</div>
          <div class="toast-body"><h4 class="toast-title">{{ n.titulo }}</h4><p class="toast-msg">{{ n.mensaje }}</p></div>
       </div>
    </transition-group>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Proveedores</h3>
        <p class="page-subtitle">Socios comerciales y compras</p>
      </div>
      <div class="actions-wrapper">
         <button class="btn-secondary" @click="modalCompra = true">📥 Registrar Compra</button>
         <button class="btn-primary" @click="abrirModalProveedor">+ Proveedor</button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead><tr><th>Empresa</th><th>Contacto</th><th>Estado</th><th class="text-right"></th></tr></thead>
        <tbody>
          <tr v-for="p in proveedores" :key="p.id" :class="{'row-inactive': p.estado === 'INACTIVO'}">
            <td>
               <div class="cell-wrapper">
                  <div class="icon-box-sm">🏢</div>
                  <div class="cell-text"><span class="main-text">{{ p.razon_social }}</span><span class="sub-text">{{ p.ruc }}</span></div>
               </div>
            </td>
            <td>{{ p.contacto_nombre || '-' }} <br> <small>{{ p.telefono }}</small></td>
            <td><span class="status-badge" :class="p.estado === 'INACTIVO' ? 'inactive' : 'active'">{{ p.estado || 'ACTIVO' }}</span></td>
            <td class="text-right">
               <button v-if="p.estado !== 'INACTIVO'" class="btn-action delete" @click="eliminar(p)">🗑️</button>
               <span v-else>🔒</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
       <div v-if="modalProveedor" class="modal-backdrop" @click.self="modalProveedor = false">
          <div class="modal-card slide-in-up">
             <div class="modal-header"><h4>Nuevo Proveedor</h4><button class="close-btn" @click="modalProveedor = false">×</button></div>
             <div class="modal-body">
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                   <input v-model="formProv.ruc" placeholder="RUC" class="input-styled" maxlength="11">
                   <button class="btn-primary" @click="buscarSunat">🔍</button>
                </div>
                <div class="form-group"><label>Razón Social</label><input v-model="formProv.razon_social" class="input-styled" :readonly="bloqueado"></div>
                <div class="form-group"><label>Dirección</label><input v-model="formProv.direccion" class="input-styled" :readonly="bloqueado"></div>
                <div class="form-grid-layout" style="grid-template-columns: 1fr 1fr; gap: 15px;">
                   <div class="form-group"><label>Contacto</label><input v-model="formProv.contacto_nombre" class="input-styled"></div>
                   <div class="form-group"><label>Teléfono</label><input v-model="formProv.telefono" class="input-styled"></div>
                </div>
             </div>
             <div class="modal-footer"><button class="btn-primary full-width" @click="guardarProveedor">Guardar</button></div>
          </div>
       </div>
    </transition>

    <transition name="modal-fade">
       <div v-if="modalCompra" class="modal-backdrop" @click.self="modalCompra = false">
          <div class="modal-card slide-in-up">
             <div class="modal-header"><h4>📥 Ingreso de Mercadería</h4></div>
             <div class="modal-body">
                <div class="form-group"><label>Producto</label>
                   <select v-model="formCompra.sku" class="input-styled">
                      <option v-for="x in productos" :key="x.sku" :value="x.sku">{{ x.nombre }} ({{ x.stock }})</option>
                   </select>
                </div>
                <div class="form-group"><label>Proveedor</label>
                   <select v-model="formCompra.proveedor_id" class="input-styled">
                      <option v-for="x in proveedores" :key="x.id" :value="x.id">{{ x.razon_social }}</option>
                   </select>
                </div>
                <div style="display:flex; gap:15px">
                   <div class="form-group" style="flex:1"><label>Cantidad</label><input type="number" v-model.number="formCompra.cantidad" class="input-styled"></div>
                   <div class="form-group" style="flex:1"><label>Costo (S/)</label><input type="number" v-model.number="formCompra.costo_unitario" class="input-styled"></div>
                </div>
             </div>
             <div class="modal-footer"><button class="btn-success full-width" @click="registrarCompra">Confirmar</button></div>
          </div>
       </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import { useInventarioStore } from '../../stores/inventario';

const inventarioStore = useInventarioStore();
const proveedores = ref([]);
const productos = ref([]);
const modalProveedor = ref(false);
const modalCompra = ref(false);
const notificaciones = ref([]);
const bloqueado = ref(false);

const formProv = ref({ ruc: '', razon_social: '', contacto_nombre: '', telefono: '', direccion: '' });
const formCompra = ref({ sku: '', proveedor_id: '', cantidad: 1, costo_unitario: 0 });

const notify = (t,m,k='success') => {
    const id = Date.now(); notificaciones.value.push({id, titulo:t, mensaje:m, tipo:k});
    setTimeout(()=>notificaciones.value.shift(),4000);
};

const cargar = async () => {
    const { data } = await api.get('/proveedores');
    proveedores.value = data;
    await inventarioStore.fetchProductos();
    productos.value = inventarioStore.productos;
};

const buscarSunat = async () => {
    try {
       const {data} = await api.post('/proveedores/consulta-ruc', {ruc:formProv.value.ruc});
       if(data.success) { formProv.value.razon_social = data.razon_social; formProv.value.direccion = data.direccion; bloqueado.value=true; }
    } catch(e){ notify('Error', 'No encontrado', 'warning'); }
};

const guardarProveedor = async () => {
    await api.post('/proveedores', formProv.value);
    modalProveedor.value = false; cargar(); notify('Éxito', 'Proveedor registrado');
};

const eliminar = async (p) => {
    if(confirm('¿Inactivar proveedor?')) {
        await api.delete(`/proveedores/${p.id}`);
        cargar(); notify('Listo', 'Proveedor inactivado');
    }
};

const registrarCompra = async () => {
    await api.post('/inventario/entrada', formCompra.value);
    modalCompra.value = false; cargar(); notify('Stock', 'Ingreso registrado');
};

const abrirModalProveedor = () => { formProv.value={}; bloqueado.value=false; modalProveedor.value=true; };
onMounted(() => cargar());
</script>

<style scoped>
/* Usa los mismos estilos que ProductosView para mantener consistencia */
.page-container { padding: 20px; }
.page-header-actions { display: flex; justify-content: space-between; margin-bottom: 25px; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 10px 15px; border-radius: 5px; font-weight: bold; }
.btn-secondary { background: #172b4d; color: white; border: none; padding: 10px 15px; border-radius: 5px; font-weight: bold; }
.btn-success { background: #2dce89; color: white; border: none; padding: 10px; border-radius: 5px; font-weight: bold; }
.card-box { background: white; border-radius: 15px; box-shadow: 0 0 2rem rgba(136,152,170,.15); padding: 20px; }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 10px; color: #8898aa; border-bottom: 1px solid #eee; font-size: 0.75rem; text-transform: uppercase; }
.monster-table td { padding: 15px 10px; border-bottom: 1px solid #f5f5f5; }
.icon-box-sm { width: 35px; height: 35px; background: #fff4de; color: #f39c12; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-right: 10px; }
.cell-wrapper { display: flex; align-items: center; }
.main-text { display: block; font-weight: 700; color: #32325d; font-size: 0.9rem; }
.sub-text { font-size: 0.75rem; color: #889; }
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.status-badge.active { background: #eafaf1; color: #2dce89; }
.status-badge.inactive { background: #fdedec; color: #f5365c; }
.row-inactive { opacity: 0.6; background: #f9f9f9; }
.btn-action.delete { background: white; color: #f5365c; border:none; cursor:pointer; font-size:1.1rem; }
/* Modal styles same as previous */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-card { background: white; width: 450px; border-radius: 10px; padding: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
.form-group { margin-bottom: 15px; }
.full-width { width: 100%; margin-top: 10px; }
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; }
.argon-toast { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 4px solid #2dce89; width: 250px; }
.argon-toast.warning { border-left-color: #fb6340; }
.argon-toast.danger { border-left-color: #f5365c; }
.toast-title { margin: 0; font-size: 0.8rem; font-weight: bold; }
.toast-msg { margin: 2px 0 0; font-size: 0.85rem; color: #666; }
</style>