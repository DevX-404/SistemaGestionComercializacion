<template>
  <div class="page-container fade-in">
    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Catálogo de Productos</h3>
        <p class="page-subtitle">Gestiona tu inventario y precios</p>
      </div>
      <div class="actions-wrapper">
        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar producto..." />
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
            <th>Categoría</th>
            <th>Precio Base</th>
            <th>Stock Actual</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productosFiltrados" :key="p.sku">
            <td>
              <div class="cell-wrapper">
                <img 
                  :src="p.imagenes?.[0] ? `http://localhost:3000${p.imagenes[0]}` : '/placeholder.png'" 
                  class="avatar-square"
                >
                <div class="cell-text">
                  <span class="main-text">{{ p.nombre }}</span>
                  <span class="sub-text">SKU: {{ p.sku }}</span>
                </div>
              </div>
            </td>
            <td><span class="badge-light">{{ p.specs?.categoria || 'General' }}</span></td>
            <td class="fw-bold text-primary">S/ {{ p.precio_base.toFixed(2) }}</td>
            <td>
              <span class="status-dot" :class="p.stock > 5 ? 'success' : 'danger'"></span>
              {{ p.stock }} u.
            </td>
            <td class="text-right">
              <button class="btn-action delete" @click="eliminar(p.sku)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
      <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
        <div class="modal-card slide-in-up" style="width: 600px;">
          <div class="modal-header">
            <h4>{{ form._id ? 'Editar Producto' : 'Nuevo Producto' }}</h4>
            <button class="close-btn" @click="modal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>SKU (Código Único)</label>
                <input v-model="form.sku" class="input-styled" :disabled="form._id">
              </div>
              <div class="form-group">
                <label>Categoría</label>
                <select v-model="form.categoria" class="input-styled">
                  <option v-for="c in categorias" :key="c._id" :value="c.nombre">{{ c.nombre }}</option>
                </select>
              </div>
              <div class="form-group full">
                <label>Nombre del Producto</label>
                <input v-model="form.nombre" class="input-styled">
              </div>
              <div class="form-group">
                <label>Precio Venta (S/)</label>
                <input type="number" v-model.number="form.precio" class="input-styled">
              </div>
              <div class="form-group">
                <label>Stock Inicial</label>
                <input type="number" v-model.number="form.stock_inicial" class="input-styled" :disabled="!!form._id">
              </div>
              <div class="form-group full">
                <label>Descripción</label>
                <textarea v-model="form.descripcion" class="input-styled" rows="2"></textarea>
              </div>
              <div class="form-group full">
                 <label>Imagen Principal</label>
                 <input type="file" @change="handleFileUpload" class="input-styled">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="modal = false">Cancelar</button>
            <button class="btn-primary" @click="guardar">Guardar Producto</button>
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

const form = ref({ sku: '', nombre: '', precio: 0, stock_inicial: 0, categoria: '', descripcion: '' });

const cargarDatos = async () => {
  await inventario.fetchProductos();
  try {
    const { data } = await api.get('/categorias');
    categorias.value = data;
  } catch (e) {}
};

const productosFiltrados = computed(() => 
  inventario.productos.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
);

const abrirModal = (prod) => {
  if(prod) {
    // Lógica editar (pendiente de implementar en backend full)
  } else {
    form.value = { sku: '', nombre: '', precio: 0, stock_inicial: 0, categoria: '', descripcion: '' };
  }
  modal.value = true;
};

const handleFileUpload = (event) => {
  archivo.value = event.target.files[0];
};

const guardar = async () => {
  const formData = new FormData();
  Object.keys(form.value).forEach(key => formData.append(key, form.value[key]));
  if(archivo.value) formData.append('imagen', archivo.value);

  try {
    await api.post('/productos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    alert('Producto guardado 📦');
    modal.value = false;
    cargarDatos();
  } catch (e) { alert('Error al guardar'); }
};

const eliminar = async (sku) => {
  if(confirm('¿Eliminar producto?')) {
    await api.delete(`/productos/${sku}`);
    cargarDatos();
  }
};

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

/* Reutilizamos estilos del Main Layout, agregamos específicos */
.avatar-square { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; margin-right: 15px; }
.page-container { padding: 10px; }
.text-primary { color: var(--primary); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group.full { grid-column: span 2; }
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
</style>