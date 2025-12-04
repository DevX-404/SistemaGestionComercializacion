<template>
  <div class="page-container fade-in">
    
    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="notif in notificaciones" :key="notif.id" class="argon-toast" :class="notif.tipo">
        <div class="toast-icon"><span v-if="notif.tipo==='success'">✅</span><span v-else>⚠️</span></div>
        <div class="toast-body"><h4 class="toast-title">{{ notif.titulo }}</h4><p class="toast-msg">{{ notif.mensaje }}</p></div>
      </div>
    </transition-group>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Maestro de Productos</h3>
        <p class="page-subtitle">Gestión de inventario</p>
      </div>
      <div class="actions-wrapper">
        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar SKU o nombre..." />
        </div>
        <button class="btn-primary btn-pulse" @click="abrirModal(null)"><span>+</span> Nuevo Producto</button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosFiltrados" :key="p.sku" :class="{ 'row-inactive': p.estado === 'INACTIVO' }">
            <td>
              <div class="cell-wrapper">
                <div class="img-thumbnail-wrapper">
                  <img :src="p.imagenes?.[0] ? `http://localhost:3000${p.imagenes[0]}` : '/placeholder.png'" class="product-thumb">
                </div>
                <div class="cell-text">
                  <span class="main-text">{{ p.nombre }}</span>
                  <span class="sub-text text-truncate" style="max-width: 180px;">{{ p.descripcion }}</span>
                </div>
              </div>
            </td>
            <td><span class="sku-badge">{{ p.sku }}</span></td>
            <td><span class="badge-light">{{ p.categoria || 'General' }}</span></td>
            <td class="fw-bold text-primary">S/ {{ p.precio_base.toFixed(2) }}</td>
            <td>
               <span class="status-badge" :class="p.estado === 'INACTIVO' ? 'inactive' : 'active'">
                 {{ p.estado || 'ACTIVO' }}
               </span>
            </td>
            <td class="text-right">
              <button v-if="p.estado !== 'INACTIVO'" class="btn-action edit" @click="abrirModal(p)">✏️</button>
              <button v-if="p.estado !== 'INACTIVO'" class="btn-action delete" @click="cambiarEstado(p, 'INACTIVO')">🗑️</button>
              <button v-else class="btn-action restore" @click="cambiarEstado(p, 'ACTIVO')" title="Reactivar">♻️</button>
            </td>
          </tr>
        </tbody>
      </table>
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
                  <label>Nombre</label>
                  <input v-model="form.nombre" class="input-styled" @input="generarSKU" placeholder="Nombre comercial">
                </div>
                <div class="form-row-2">
                  <div class="form-group">
  <label>Categoría</label>
  <select v-model="form.categoria" class="input-styled">
    <option value="" disabled>Seleccione...</option>
    <template v-for="c in categorias" :key="c._id">
       <option v-if="c.estado" :value="c.nombre">{{ c.nombre }}</option>
    </template>
  </select>
</div>
                  <div class="form-group">
                    <label>Precio (S/)</label>
                    <input type="number" v-model.number="form.precio" class="input-styled">
                  </div>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea v-model="form.descripcion" class="input-styled" rows="3"></textarea>
                </div>
              </div>
              <div class="col-right bg-contrast">
                <div class="form-group">
                   <label>SKU (Auto)</label>
                   <input v-model="form.sku" class="input-styled sku-input" readonly>
                </div>
                <div class="form-group" v-if="!form._id">
                  <label>Stock Inicial</label>
                  <input type="number" v-model.number="form.stock_inicial" class="input-styled">
                </div>
                <div class="form-group">
                   <label>Imagen</label>
                   <input type="file" @change="handleFile" class="input-styled">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="modal = false">Cancelar</button>
            <button class="btn-primary" @click="guardar">Guardar</button>
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

// Modelo del formulario
const form = ref({ 
  _id: null, sku: '', nombre: '', precio: 0, stock_inicial: 0, categoria: '', descripcion: '' 
});

// --- Helpers ---
const notify = (t, m, k='success') => {
    const id = Date.now(); 
    notificaciones.value.push({id, titulo:t, mensaje:m, tipo:k});
    setTimeout(() => notificaciones.value = notificaciones.value.filter(n=>n.id!==id), 4000);
};

const handleFile = (e) => archivo.value = e.target.files[0];

// --- Cargar Datos ---
const cargarDatos = async () => {
  await inventario.fetchProductos();
  try { 
      const {data} = await api.get('/categorias'); 
      categorias.value = data;
  } catch(e){}
};

// --- Abrir Modal (Corregido Carga de Categoría) ---
const abrirModal = (prod) => {
  archivo.value = null;
  if(prod) {
    // MODO EDICIÓN
    form.value = { 
        ...prod, 
        precio: prod.precio_base, 
        // La categoría puede venir directo o dentro de specs, aseguramos que la lea
        categoria: prod.categoria || 'General' 
    };
  } else {
    // MODO CREACIÓN
    form.value = { 
        _id: null, sku: '', nombre: '', precio: 0, stock_inicial: 0, 
        // Preselecciona la primera categoría activa si existe
        categoria: categorias.value.length > 0 ? categorias.value[0].nombre : '',
        descripcion: '' 
    };
  }
  modal.value = true;
};

// --- Guardar (Switch POST/PUT) ---
const guardar = async () => {
  if(!form.value.nombre) return notify('Error','Nombre requerido','warning');
  if(!form.value.categoria) return notify('Error','Seleccione una categoría','warning');

  const fd = new FormData();
  // No enviamos SKU si estamos editando (es la llave)
  if (!form.value._id) fd.append('sku', form.value.sku);
  
  fd.append('nombre', form.value.nombre);
  fd.append('precio', form.value.precio);
  fd.append('categoria', form.value.categoria);
  fd.append('descripcion', form.value.descripcion || '');
  
  // El stock inicial solo se manda al crear
  if(!form.value._id) fd.append('stock_inicial', form.value.stock_inicial);
  
  if(archivo.value) fd.append('imagen', archivo.value);

  try {
      if (form.value._id) {
          // EDITAR (PUT)
          await api.put(`/productos/${form.value.sku}`, fd, {headers:{'Content-Type':'multipart/form-data'}});
          notify('Actualizado', 'Producto editado correctamente');
      } else {
          // CREAR (POST)
          await api.post('/productos', fd, {headers:{'Content-Type':'multipart/form-data'}});
          notify('Creado', 'Producto registrado con éxito');
      }
      modal.value = false; 
      cargarDatos();
  } catch(e) { 
      console.error(e);
      notify('Error', e.response?.data?.error || 'Error en el servidor', 'danger'); 
  }
};

// ... (Mantén las funciones generarSKU, eliminar, cambiarEstado igual que antes) ...
const generarSKU = () => {
  if(form.value._id) return; // No cambiar SKU al editar
  const n = form.value.nombre || '';
  if(n.length < 3) return;
  form.value.sku = (n.substring(0,3) + '-' + Math.floor(Date.now()/1000).toString().slice(-4)).toUpperCase();
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

// Filtro
const productosFiltrados = computed(() => 
  inventario.productos.filter(p => 
     p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
     p.sku.toLowerCase().includes(busqueda.value.toLowerCase())
  )
);

onMounted(() => cargarDatos());
</script>

<style scoped>
/* ESTILOS ARGON (Copia y pega los estilos de CSS del paso anterior de ClientesView, son compatibles) */
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
.status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }
.status-badge.active { background: #eafaf1; color: #2dce89; }
.status-badge.inactive { background: #fdedec; color: #f5365c; }
.row-inactive { background-color: #f4f6f9; opacity: 0.6; filter: grayscale(100%); }
.btn-action { width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; margin-left: 5px; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
.btn-action.edit { background: white; color: #5e72e4; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.delete { background: white; color: #f5365c; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn-action.restore { background: #eafaf1; color: #2dce89; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); z-index: 1000; display: flex; justify-content: center; align-items: center; }
.modal-card { background: white; border-radius: 10px; box-shadow: 0 15px 35px rgba(50,50,93,.2); display: flex; flex-direction: column; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 25px; }
.modal-footer { padding: 20px; border-top: 1px solid #eee; text-align: right; }
.modal-lg { width: 800px; }
.form-grid-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 0; }
.col-left { padding-right: 20px; }
.col-right { padding-left: 20px; border-left: 1px solid #eee; background: #f8f9fe; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 600; color: #525f7f; font-size: 0.85rem; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; }
.sku-input { background: #e9ecef; font-weight: bold; letter-spacing: 1px; }
.btn-ghost { background: none; border: none; color: #889; font-weight: 600; margin-right: 15px; cursor: pointer; }
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