<template>
  <div class="page-container fade-in">
    
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="notif in notificaciones" :key="notif.id" class="argon-toast" :class="notif.tipo">
        <div class="toast-icon">
          <span v-if="notif.tipo === 'success'">✅</span>
          <span v-else>⚠️</span>
        </div>
        <div class="toast-body">
          <h4 class="toast-title">{{ notif.titulo }}</h4>
          <p class="toast-msg">{{ notif.mensaje }}</p>
        </div>
      </div>
    </transition-group>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Maestro de Productos</h3>
        <p class="page-subtitle">Gestión de inventario y alertas de stock</p>
      </div>
      <div class="actions-wrapper">
        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar SKU o nombre..." />
        </div>
        <button class="btn-primary btn-pulse" @click="abrirModal(null)">
          <span>+</span> Nuevo Producto
        </button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio Venta</th>
            <th>Estado del Stock</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosFiltrados" :key="p.sku" :class="{ 'row-inactive': p.estado === 'INACTIVO' }">
            <td>
              <div class="cell-wrapper">
                <div class="img-thumbnail-wrapper">
                  <img 
                    :src="p.imagenes?.[0] ? `http://localhost:3000${p.imagenes[0]}` : '/placeholder.png'" 
                    class="product-thumb"
                  >
                </div>
                <div class="cell-text">
                  <span class="main-text">{{ p.nombre }}</span>
                  <span class="sub-text text-truncate" style="max-width: 180px;">{{ p.descripcion }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="sku-badge">{{ p.sku }}</span>
            </td>
            <td>
              <span class="badge-light">{{ p.categoria || 'General' }}</span>
            </td>
            <td>
              <strong class="text-primary">S/ {{ p.precio_base.toFixed(2) }}</strong>
            </td>
            <td style="width: 200px;">
              <div class="stock-indicator">
                 <div class="progress-mini">
                   <div class="bar" :class="getStockColor(p)" :style="{ width: Math.min(p.stock, 100) + '%' }"></div>
                 </div>
                 <span class="stock-text" :class="getStockColorText(p)">
                    {{ p.stock }} unid. 
                    <span v-if="p.stock <= (p.stock_minimo || 5)" class="alert-label">(BAJO)</span>
                 </span>
               </div>
            </td>
            <td class="text-right">
              <button v-if="p.estado !== 'INACTIVO'" class="btn-action edit" @click="abrirModal(p)" title="Editar">✏️</button>
              <button v-if="p.estado !== 'INACTIVO'" class="btn-action delete" @click="cambiarEstado(p, 'INACTIVO')" title="Dar de baja">🗑️</button>
              <button v-else class="btn-action restore" @click="cambiarEstado(p, 'ACTIVO')" title="Reactivar">♻️</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="productosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No se encontraron productos.</p>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
        <div class="modal-card slide-in-up modal-lg">
          <div class="modal-header">
            <h4>{{ form._id ? 'Editar Producto' : 'Nuevo Producto' }}</h4>
            <button class="close-btn" @click="modal = false">×</button>
          </div>
          
          <div class="modal-body">
            <div class="form-grid-layout">
              
              <div class="col-left">
                <div class="form-group">
                  <label>Nombre del Producto <span class="req">*</span></label>
                  <input v-model="form.nombre" class="input-styled" placeholder="Ej: Laptop Gamer HP" @input="generarSKU">
                </div>
                
                <div class="form-row-2">
                  <div class="form-group">
                    <label>Categoría <span class="req">*</span></label>
                    <select v-model="form.categoria" class="input-styled">
                      <option value="" disabled>Seleccione...</option>
                      <template v-for="c in categorias" :key="c._id">
                         <option v-if="c.estado" :value="c.nombre">{{ c.nombre }}</option>
                      </template>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Precio Venta (S/) <span class="req">*</span></label>
                    <input type="number" v-model.number="form.precio" class="input-styled" placeholder="0.00" step="0.10">
                  </div>
                </div>

                <div class="form-group">
                  <label>Descripción</label>
                  <textarea v-model="form.descripcion" class="input-styled" rows="3" placeholder="Detalles técnicos o comerciales..."></textarea>
                </div>
              </div>

              <div class="col-right bg-contrast">
                <div class="form-group">
                   <label>SKU (Generado Automáticamente)</label>
                   <input v-model="form.sku" class="input-styled sku-input" readonly>
                   <small class="text-muted">Identificador único de sistema</small>
                </div>

                <div class="form-row-2" v-if="!form._id">
                    <div class="form-group">
                      <label>Stock Inicial</label>
                      <input type="number" v-model.number="form.stock_inicial" class="input-styled" disabled title="El stock nace en 0 por defecto">
                      <small class="text-muted">Siempre inicia en 0</small>
                    </div>
                    <div class="form-group">
                      <label>Stock Mínimo</label>
                      <input type="number" v-model.number="form.stock_minimo" class="input-styled" placeholder="Ej: 5">
                      <small class="text-muted">Nivel de alerta</small>
                    </div>
                </div>
                
                <div class="form-group" v-else>
                    <label>Alerta de Stock Mínimo</label>
                    <input type="number" v-model.number="form.stock_minimo" class="input-styled" placeholder="Ej: 5">
                </div>

                <div class="form-group">
                   <label>Imagen del Producto</label>
                   <div class="upload-box">
                     <input type="file" @change="handleFile" id="fileUpload" class="input-file" hidden>
                     <label for="fileUpload" class="upload-label">
                        <span v-if="!archivo">📸 Subir Foto</span>
                        <span v-else class="text-success">✅ {{ archivo.name }}</span>
                     </label>
                   </div>
                </div>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-ghost" @click="modal = false">Cancelar</button>
            <button class="btn-primary" @click="guardar">
               {{ form._id ? 'Guardar Cambios' : 'Registrar Producto' }}
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

const inventario = useInventarioStore();
const categorias = ref([]);
const modal = ref(false);
const busqueda = ref('');
const archivo = ref(null);
const notificaciones = ref([]);

// Formulario con stock inicial fijo en 0 y stock minimo configurable
const form = ref({ 
  _id: null, sku: '', nombre: '', precio: 0, stock_inicial: 0, stock_minimo: 5, categoria: '', descripcion: '' 
});

// --- Helpers de UI ---
const notify = (t, m, k='success') => {
    const id = Date.now(); 
    notificaciones.value.push({id, titulo:t, mensaje:m, tipo:k});
    setTimeout(() => notificaciones.value = notificaciones.value.filter(n=>n.id!==id), 4000);
};

const getStockColor = (prod) => {
  const minimo = prod.stock_minimo || 5;
  if (prod.stock <= minimo) return 'bg-danger';
  if (prod.stock <= minimo * 2) return 'bg-warning';
  return 'bg-success';
};

const getStockColorText = (prod) => {
  const minimo = prod.stock_minimo || 5;
  if (prod.stock <= minimo) return 'text-danger fw-bold';
  return 'text-muted';
};

// --- Carga de Datos ---
const cargarDatos = async () => {
  await inventario.fetchProductos();
  try { 
      const {data} = await api.get('/categorias'); 
      categorias.value = data;
  } catch(e){}
};

// --- Lógica del Modal ---
const abrirModal = (prod) => {
  archivo.value = null;
  if(prod) {
    // MODO EDICIÓN
    form.value = { 
        ...prod, 
        precio: prod.precio_base, 
        categoria: prod.categoria || 'General',
        // Aseguramos que lea el stock mínimo si existe, sino pone 5
        stock_minimo: prod.stock_minimo || 5 
    };
  } else {
    // MODO CREACIÓN
    form.value = { 
        _id: null, sku: '', nombre: '', precio: 0, 
        stock_inicial: 0, // SIEMPRE 0 AL CREAR
        stock_minimo: 5,  // Valor sugerido
        categoria: categorias.value.length > 0 ? categorias.value[0].nombre : '',
        descripcion: '' 
    };
  }
  modal.value = true;
};

const generarSKU = () => {
  if(form.value._id) return; // No cambiar SKU al editar
  const n = form.value.nombre || '';
  if(n.length < 3) return;
  // SKU simple: 3 letras + timestamp corto
  form.value.sku = (n.substring(0,3) + '-' + Math.floor(Date.now()/1000).toString().slice(-4)).toUpperCase();
};

const handleFile = (e) => archivo.value = e.target.files[0];

// --- Guardar ---
const guardar = async () => {
  if(!form.value.nombre) return notify('Error','Nombre requerido','warning');
  if(!form.value.categoria) return notify('Error','Seleccione una categoría','warning');

  const fd = new FormData();
  if (!form.value._id) fd.append('sku', form.value.sku);
  
  fd.append('nombre', form.value.nombre);
  fd.append('precio', form.value.precio);
  fd.append('categoria', form.value.categoria);
  fd.append('descripcion', form.value.descripcion || '');
  fd.append('stock_minimo', form.value.stock_minimo); // Enviamos el nuevo campo
  
  // Solo enviamos stock_inicial al crear (aunque sea 0, para que el backend sepa)
  if(!form.value._id) fd.append('stock_inicial', 0); 
  
  if(archivo.value) fd.append('imagen', archivo.value);

  try {
      if (form.value._id) {
          // PUT
          await api.put(`/productos/${form.value.sku}`, fd, {headers:{'Content-Type':'multipart/form-data'}});
          notify('Actualizado', 'Producto editado correctamente');
      } else {
          // POST
          await api.post('/productos', fd, {headers:{'Content-Type':'multipart/form-data'}});
          notify('Creado', 'Producto registrado (Stock 0)');
      }
      modal.value = false; 
      cargarDatos();
  } catch(e) { 
      console.error(e);
      notify('Error', e.response?.data?.error || 'Error en el servidor', 'danger'); 
  }
};

const cambiarEstado = async (p, nuevoEstado) => {
  if(!confirm(`¿${nuevoEstado === 'INACTIVO' ? 'Dar de baja' : 'Reactivar'}?`)) return;
  try {
     if(nuevoEstado === 'INACTIVO') await api.delete(`/productos/${p.sku}`);
     else await api.patch(`/productos/${p.sku}/reactivar`);
     notify('Listo', `Producto ${nuevoEstado.toLowerCase()}`);
     cargarDatos();
  } catch(e) { notify('Error', 'Falló operación', 'danger'); }
};

const productosFiltrados = computed(() => 
  inventario.productos.filter(p => 
     p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
     p.sku.toLowerCase().includes(busqueda.value.toLowerCase())
  )
);

onMounted(() => cargarDatos());
</script>

<style scoped>
/* Estilos base (Page, Header, Table) idénticos a los anteriores */
.page-container { padding: 20px; }
.page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-title { margin: 0; font-size: 1.5rem; color: #32325d; font-weight: 700; }
.page-subtitle { margin: 5px 0 0; color: #8898aa; font-size: 0.9rem; }
.actions-wrapper { display: flex; gap: 15px; }
.search-input-group { background: white; border-radius: 30px; padding: 8px 15px; box-shadow: 0 1px 3px rgba(50,50,93,.15); display: flex; align-items: center; }
.search-input-group input { border: none; outline: none; margin-left: 10px; color: #525f7f; }
.btn-pulse { animation: pulse 2s infinite; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: 600; cursor: pointer; }

.card-box { background: white; border-radius: 15px; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); overflow: hidden; }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { background: #f6f9fc; padding: 15px; text-align: left; color: #8898aa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e9ecef; }
.monster-table td { padding: 15px; border-bottom: 1px solid #e9ecef; vertical-align: middle; }

.cell-wrapper { display: flex; align-items: center; gap: 15px; }
.img-thumbnail-wrapper { width: 45px; height: 45px; border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.product-thumb { width: 100%; height: 100%; object-fit: cover; }
.main-text { display: block; font-weight: 700; color: #32325d; font-size: 0.9rem; }
.sub-text { display: block; color: #8898aa; font-size: 0.75rem; }
.sku-badge { background: #e8f6fc; color: #2980b9; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; font-size: 0.8rem; }
.text-primary { color: #2dce89; }

/* Semáforo Stock */
.stock-indicator { display: flex; flex-direction: column; gap: 5px; }
.progress-mini { height: 4px; background: #e9ecef; border-radius: 10px; width: 100%; overflow: hidden; }
.progress-mini .bar { height: 100%; transition: width 0.5s; }
.bg-success { background-color: #2dce89; }
.bg-warning { background-color: #fb6340; }
.bg-danger { background-color: #f5365c; }
.stock-text { font-size: 0.7rem; font-weight: 600; }
.alert-label { color: #f5365c; font-weight: 800; margin-left: 5px; }

.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.status-badge.active { background: #eafaf1; color: #2dce89; }
.status-badge.inactive { background: #fdedec; color: #f5365c; }
.row-inactive { background-color: #f4f6f9; opacity: 0.6; filter: grayscale(100%); }

.btn-action { width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; margin-left: 5px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.btn-action.edit { background: white; color: #5e72e4; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.delete { background: white; color: #f5365c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.restore { background: #eafaf1; color: #2dce89; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }

/* Modal Styles */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; border-radius: 10px; box-shadow: 0 15px 35px rgba(50,50,93,.2); display: flex; flex-direction: column; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 25px; }
.modal-footer { padding: 20px; border-top: 1px solid #eee; text-align: right; }
.modal-lg { width: 800px; }
.form-grid-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 0; }
.col-left { padding-right: 20px; }
.col-right { padding-left: 20px; border-left: 1px solid #eee; background: #f8f9fe; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #525f7f; font-size: 0.85rem; }
.req { color: #f5365c; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; box-sizing: border-box; }
.sku-input { background: #e9ecef; font-weight: bold; letter-spacing: 1px; }
.upload-box { border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; }
.upload-label { cursor: pointer; color: #5e72e4; font-weight: 600; font-size: 0.9rem; }
.text-success { color: #2dce89; }
.btn-ghost { background: none; border: none; color: #889; font-weight: 600; margin-right: 15px; cursor: pointer; }

/* Toasts */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
.argon-toast { background: white; width: 300px; padding: 15px; border-radius: 8px; display: flex; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-left: 4px solid; }
.argon-toast.success { border-left-color: #2dce89; }
.argon-toast.danger { border-left-color: #f5365c; }
.argon-toast.warning { border-left-color: #fb6340; }
.toast-title { margin: 0; font-size: 0.8rem; font-weight: 800; color: #32325d; text-transform: uppercase; }
.toast-msg { margin: 2px 0 0; font-size: 0.85rem; color: #525f7f; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(94, 114, 228, 0); } 100% { box-shadow: 0 0 0 0 rgba(94, 114, 228, 0); } }
.slide-in-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 0.4s; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>