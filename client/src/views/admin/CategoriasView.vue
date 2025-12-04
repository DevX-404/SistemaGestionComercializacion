<template>
  <div class="page-container fade-in">

    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="n in notificaciones" :key="n.id" class="argon-toast" :class="n.tipo">
        <div class="toast-icon">
          <span v-if="n.tipo === 'success'">✅</span>
          <span v-else-if="n.tipo === 'danger'">⛔</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="toast-body">
          <h4 class="toast-title">{{ n.titulo }}</h4>
          <p class="toast-msg">{{ n.mensaje }}</p>
        </div>
        <button class="toast-close" @click="removerNotificacion(n.id)">×</button>
      </div>
    </transition-group>

    <div class="page-header-actions">
      <div class="title-wrapper">
        <h3 class="page-title">Gestión de Categorías</h3>
        <p class="page-subtitle">Organización del catálogo de productos</p>
      </div>
      <button class="btn-primary" @click="abrirModal">+ Nueva Categoría</button>
    </div>

    <div class="card-box" style="max-width: 900px;">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in categorias" :key="c._id" :class="{ 'row-inactive': !c.estado }">
            <td>
              <span class="fw-bold text-main">{{ c.nombre }}</span>
            </td>
            <td class="text-muted">{{ c.descripcion || '-' }}</td>
            <td>
              <span class="status-badge" :class="c.estado ? 'active' : 'inactive'">
                {{ c.estado ? 'ACTIVO' : 'INACTIVO' }}
              </span>
            </td>
            <td class="text-right">
              <button v-if="c.estado" class="btn-action delete" @click="intentarEliminar(c)">🗑️</button>
              <button v-else class="btn-action restore" @click="reactivar(c)">♻️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="categorias.length === 0" class="empty-state">
        No hay categorías registradas.
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="modal" class="modal-backdrop" @click.self="modal = false">
        <div class="modal-card slide-in-up" style="width: 450px;">
          <div class="modal-header">
            <h4>Nueva Categoría</h4>
            <button class="close-btn" @click="modal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de Categoría <span class="req">*</span></label>
              <input v-model="form.nombre" class="input-styled" placeholder="Ej: Laptops, Accesorios...">
            </div>
            <div class="form-group">
              <label>Descripción (Opcional)</label>
              <textarea v-model="form.descripcion" class="input-styled" rows="3"></textarea>
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
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const categorias = ref([]);
const modal = ref(false);
const form = ref({ nombre: '', descripcion: '' });
const notificaciones = ref([]);

// --- SISTEMA DE NOTIFICACIONES ---
const notify = (t, m, k = 'success') => {
  const id = Date.now();
  notificaciones.value.push({ id, titulo: t, mensaje: m, tipo: k });
  setTimeout(() => removerNotificacion(id), 5000);
};
const removerNotificacion = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id);
};

const cargar = async () => {
  try {
    const { data } = await api.get('/categorias');
    categorias.value = data;
  } catch (e) { console.error(e); }
};

const abrirModal = () => {
  form.value = { nombre: '', descripcion: '' };
  modal.value = true;
};

const guardar = async () => {
  if (!form.value.nombre) return notify('Atención', 'El nombre es obligatorio', 'warning');
  try {
    await api.post('/categorias', form.value);
    modal.value = false;
    cargar();
    notify('Éxito', 'Categoría creada correctamente');
  } catch (e) {
    notify('Error', e.response?.data?.message || 'Error al guardar', 'danger');
  }
};

const intentarEliminar = async (cat) => {
  if (!confirm(`¿Intentar dar de baja la categoría "${cat.nombre}"?`)) return;

  try {
    await api.delete(`/categorias/${cat._id}`);
    cargar();
    notify('Listo', 'Categoría inactivada correctamente', 'success');
  } catch (e) {
    // Capturamos el error 409 específico de negocio
    if (e.response && e.response.status === 409) {
      notify('Bloqueado', e.response.data.message, 'danger');
    } else {
      notify('Error', 'Ocurrió un error en el servidor', 'danger');
    }
  }
};

// EN EL SCRIPT
const reactivar = async (c) => {
    if(!confirm('¿Reactivar categoría?')) return;
    await api.patch(`/categorias/${c._id}/reactivar`);
    cargar(); notify('Éxito', 'Categoría visible nuevamente');
};

onMounted(() => cargar());
</script>

<style scoped>
.page-container {
  padding: 20px;
  font-family: 'Segoe UI', sans-serif;
}

.page-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  color: #32325d;
  font-weight: 700;
}

.page-subtitle {
  margin: 5px 0 0;
  color: #8898aa;
  font-size: 0.9rem;
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
  padding: 15px;
  border-bottom: 1px solid #eee;
  color: #8898aa;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: #f6f9fc;
}

.monster-table td {
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.fw-bold {
  font-weight: 700;
}

.text-main {
  color: #32325d;
}

.text-muted {
  color: #8898aa;
  font-size: 0.85rem;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.5px;
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
  filter: grayscale(100%);
}

.locked-icon {
  font-size: 1.2rem;
  opacity: 0.5;
}

.btn-primary {
  background: #5e72e4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(50, 50, 93, .11);
  transition: 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, .1);
}

.btn-action.delete {
  background: white;
  color: #f5365c;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: 0.2s;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-action.delete:hover {
  background: #f5365c;
  color: white;
}

/* Modal */
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
  backdrop-filter: blur(3px);
}

.modal-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(50, 50, 93, .2);
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
  background: #f8f9fe;
}

.modal-header h4 {
  margin: 0;
  color: #32325d;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: right;
  background: #f8f9fe;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #889;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #525f7f;
  font-size: 0.85rem;
}

.req {
  color: #f5365c;
}

.input-styled {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  box-sizing: border-box;
  transition: 0.2s;
  color: #32325d;
}

.input-styled:focus {
  border-color: #5e72e4;
  box-shadow: 0 1px 3px rgba(50, 50, 93, .15);
  outline: none;
}

.btn-ghost {
  background: none;
  border: none;
  color: #889;
  font-weight: 600;
  margin-right: 15px;
  cursor: pointer;
}

/* TOASTS */
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
  width: 320px;
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

.toast-icon {
  font-size: 1.2rem;
}

.toast-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 800;
  color: #32325d;
  text-transform: uppercase;
}

.toast-msg {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #525f7f;
  line-height: 1.4;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #adb5bd;
}

.toast-close:hover {
  color: #525f7f;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #8898aa;
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