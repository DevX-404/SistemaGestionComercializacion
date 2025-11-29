<template>
  <div class="page-container">
    <div class="actions-bar">
      <h3>📦 Catálogo de Productos</h3>
      <div class="right-actions">
          <input type="text" v-model="busqueda" @input="buscarProductos" placeholder="🔍 Buscar por nombre o SKU..." class="search-input">
          <button class="btn-primary" @click="mostrarModal = true">+ Nuevo Producto</button>
      </div>
    </div>

    <div class="card-box">
        <table class="monster-table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>SKU</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prod in productos" :key="prod.sku">
                    <td>
                        <img :src="`http://localhost:3000${prod.imagenes[0]}`" class="thumb-img" alt="img">
                    </td>
                    <td class="fw-bold">{{ prod.sku }}</td>
                    <td>{{ prod.nombre }}</td>
                    <td class="text-green">S/ {{ prod.precio_base.toFixed(2) }}</td>
                    <td><span class="badge badge-cat">{{ prod.specs?.categoria || 'General' }}</span></td>
                    <td>
                        <button class="btn-icon delete" @click="eliminar(prod.sku)">🗑️</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Registrar Nuevo Producto</h4>
                <button @click="mostrarModal = false" class="btn-close">×</button>
            </div>
            
            <div class="modal-body">
                <div class="row">
                    <div class="form-group half">
                        <label>SKU (Código Único)</label>
                        <input v-model="form.sku" type="text" placeholder="EJ: LAP-HP-01">
                    </div>
                    <div class="form-group half">
                        <label>Categoría</label>
                        <select v-model="form.categoria">
                            <option>Tecnología</option>
                            <option>Hogar</option>
                            <option>Oficina</option>
                            <option>Gamer</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Nombre del Producto</label>
                    <input v-model="form.nombre" type="text">
                </div>

                <div class="form-group">
                    <label>Descripción Corta</label>
                    <textarea v-model="form.descripcion" rows="2"></textarea>
                </div>

                <div class="row">
                    <div class="form-group half">
                        <label>Precio Base (S/)</label>
                        <input v-model="form.precio" type="number" step="0.01">
                    </div>
                    <div class="form-group half">
                        <label>Stock Inicial (PostgreSQL)</label>
                        <input v-model="form.stock_inicial" type="number">
                    </div>
                </div>

                <div class="form-group file-group">
                    <label>Imagen Principal</label>
                    <input type="file" @change="handleFileUpload" accept="image/*">
                    <small>Se guardará en: /server/public/img</small>
                </div>
            </div>

            <div class="modal-footer">
                <button @click="guardarProducto" class="btn-save" :disabled="cargando">
                    {{ cargando ? 'Subiendo...' : 'Guardar Producto' }}
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import _ from 'lodash'; // Opcional si quieres debounce, sino directo

const productos = ref([]);
const mostrarModal = ref(false);
const busqueda = ref('');
const cargando = ref(false);
const archivoImagen = ref(null);

const form = ref({
    sku: '', nombre: '', descripcion: '', precio: '', stock_inicial: 0, categoria: 'Tecnología'
});

const cargarProductos = async (query = '') => {
    try {
        const { data } = await api.get(`/productos?search=${query}`);
        productos.value = data;
    } catch (error) { console.error(error); }
};

// Buscador simple
const buscarProductos = () => {
    cargarProductos(busqueda.value);
};

// Capturar el archivo del input
const handleFileUpload = (event) => {
    archivoImagen.value = event.target.files[0];
};

const guardarProducto = async () => {
    if (!form.value.sku || !form.value.nombre || !form.value.precio) {
        return alert('Complete los datos obligatorios');
    }

    cargando.value = true;

    try {
        // 1. Usamos FormData porque enviamos un ARCHIVO
        const formData = new FormData();
        formData.append('sku', form.value.sku);
        formData.append('nombre', form.value.nombre);
        formData.append('descripcion', form.value.descripcion);
        formData.append('precio', form.value.precio);
        formData.append('stock_inicial', form.value.stock_inicial);
        formData.append('categoria', form.value.categoria);
        
        if (archivoImagen.value) {
            formData.append('imagen', archivoImagen.value);
        }

        // 2. Enviar al backend (Headers se configuran automático con FormData)
        await api.post('/productos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Producto Registrado Exitosamente 📦');
        mostrarModal.value = false;
        
        // Limpiar form
        form.value = { sku: '', nombre: '', precio: '', stock_inicial: 0, categoria: 'Tecnología' };
        archivoImagen.value = null;
        
        cargarProductos();

    } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
        cargando.value = false;
    }
};

const eliminar = async (sku) => {
    if (confirm('¿Desactivar producto?')) {
        await api.delete(`/productos/${sku}`);
        cargarProductos();
    }
};

onMounted(() => cargarProductos());
</script>

<style scoped>
.page-container { padding: 20px; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.right-actions { display: flex; gap: 10px; }
.search-input { padding: 8px; border: 1px solid #ddd; border-radius: 6px; width: 250px; }
.btn-primary { background: var(--client-primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }

.card-box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.monster-table { width: 100%; border-collapse: collapse; }
.monster-table th { text-align: left; padding: 15px; border-bottom: 1px solid #eee; color: #a2a5b9; }
.monster-table td { padding: 10px 15px; border-bottom: 1px solid #f5f7fb; vertical-align: middle; }

.thumb-img { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
.fw-bold { font-weight: bold; }
.text-green { color: #1bc5bd; font-weight: bold; }
.badge-cat { background: #e1f0ff; color: #3699ff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 500px; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.btn-close { border: none; background: none; font-size: 1.5rem; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.form-group input, select, textarea { width: 100%; padding: 10px; border: 1px solid #e4e6ef; border-radius: 6px; box-sizing: border-box; }
.row { display: flex; gap: 10px; }
.half { flex: 1; }
.btn-save { width: 100%; background: #1bc5bd; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-save:disabled { background: #ccc; }
.file-group { background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px dashed #ccc; }
</style>