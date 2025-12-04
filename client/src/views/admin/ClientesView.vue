<template>
  <div class="page-container fade-in">

    <transition-group name="toast" tag="div" class="toast-container">
      <div v-for="notif in notificaciones" :key="notif.id" class="argon-toast" :class="notif.tipo">
        <div class="toast-icon">
          <span v-if="notif.tipo === 'success'">✅</span>
          <span v-if="notif.tipo === 'warning'">⚠️</span>
          <span v-if="notif.tipo === 'danger'">⛔</span>
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
        <h3 class="page-title">Cartera de Clientes</h3>
        <p class="page-subtitle">Gestión comercial y fiscal</p>
      </div>
      <div class="actions-wrapper">
        <div class="search-input-group">
          <span class="icon">🔍</span>
          <input v-model="busqueda" placeholder="Buscar por nombre o DNI..." />
        </div>
        <button class="btn-primary btn-pulse" @click="abrirModal(null)">
          <span>+</span> Nuevo Cliente
        </button>
      </div>
    </div>

    <div class="card-box table-responsive">
      <table class="monster-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in clientesFiltrados" :key="c.id" :class="{ 'row-inactive': c.estado === 'INACTIVO' }">
            <td>
              <div class="cell-wrapper">
                <div class="avatar-circle bg-gradient-info">{{ c.razon_social.charAt(0) }}</div>
                <div class="cell-text">
                  <span class="main-text">{{ c.razon_social }}</span>
                  <span class="sub-text">{{ c.email || 'Sin correo' }}</span>
                </div>
              </div>
            </td>
            <td><span class="badge-light">{{ c.tipo_documento }} • {{ c.numero_documento }}</span></td>
            <td class="text-muted">
              <div style="display:flex; flex-direction:column;">
                <span>📞 {{ c.telefono || '-' }}</span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="c.estado === 'INACTIVO' ? 'inactive' : 'active'">
                {{ c.estado || 'ACTIVO' }}
              </span>
            </td>
            <td class="text-right">
              <button v-if="c.estado !== 'INACTIVO'" class="btn-action edit" @click="abrirModal(c)"
                title="Editar">✏️</button>

              <button v-if="c.estado !== 'INACTIVO'" class="btn-action delete" @click="procesarEliminado(c)"
                title="Inactivar">🗑️</button>

              <button v-else class="btn-action restore" @click="reactivarCliente(c)" title="Reactivar">♻️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="modal-fade">
      <div v-if="mostrarModal" class="modal-backdrop" @click.self="mostrarModal = false">
        <div class="modal-card slide-in-up">
          <div class="modal-header">
            <h4>{{ modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente' }}</h4>
            <button class="close-btn" @click="mostrarModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="sunat-box" v-if="!modoEdicion">
              <div class="input-group-merged">
                <select v-model="form.tipo_documento" class="select-mini">
                  <option>DNI</option>
                  <option>RUC</option>
                </select>
                <input v-model="form.numero_documento" placeholder="Nro Documento" />
                <button class="btn-sunat" @click="consultarApi" :disabled="cargandoApi">{{ cargandoApi ? '...' : '🔍Consultar' }}</button>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group full"><label>Razón Social</label><input v-model="form.razon_social"
                  class="input-styled" :readonly="bloqueadoApi"></div>
              <div class="form-group full"><label>Dirección</label><input v-model="form.direccion" class="input-styled"
                  :readonly="bloqueadoApi"></div>
              <div class="form-group"><label>Teléfono</label><input v-model="form.telefono" class="input-styled"></div>
              <div class="form-group"><label>Email</label><input v-model="form.email" class="input-styled"></div>
              <div class="form-group" v-if="modoEdicion">
                <label>Estado</label>
                <select v-model="form.estado" class="input-styled">
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="mostrarModal = false">Cancelar</button>
            <button class="btn-primary" @click="guardar">{{ modoEdicion ? 'Actualizar' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api/axios';

const clientes = ref([]);
const busqueda = ref('');
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const cargandoApi = ref(false);
const bloqueadoApi = ref(false);
const notificaciones = ref([]); // Cola de notificaciones

const form = ref({ id: null, tipo_documento: 'DNI', numero_documento: '', razon_social: '', direccion: '', telefono: '', email: '', estado: 'ACTIVO' });

// --- LOGICA DE NOTIFICACIONES (TOASTS) ---
const notify = (titulo, mensaje, tipo = 'success') => {
  const id = Date.now();
  notificaciones.value.push({ id, titulo, mensaje, tipo });
  setTimeout(() => removerNotificacion(id), 4000); // Auto cerrar en 4s
};
const removerNotificacion = (id) => {
  notificaciones.value = notificaciones.value.filter(n => n.id !== id);
};

// --- LOGICA DE CLIENTES ---
const cargarClientes = async () => {
  try {
    const { data } = await api.get('/clientes');
    clientes.value = data;
  } catch (e) { console.error(e); }
};

const clientesFiltrados = computed(() =>
  clientes.value.filter(c =>
    c.razon_social.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    c.numero_documento.includes(busqueda.value)
  )
);

const abrirModal = (cliente) => {
  if (cliente) {
    modoEdicion.value = true;
    form.value = { ...cliente };
    bloqueadoApi.value = false;
  } else {
    modoEdicion.value = false;
    form.value = { tipo_documento: 'DNI', numero_documento: '', razon_social: '', estado: 'ACTIVO' };
    bloqueadoApi.value = false;
  }
  mostrarModal.value = true;
};

const consultarApi = async () => {
  if (!form.value.numero_documento) return notify('Error', 'Ingrese documento', 'warning');
  cargandoApi.value = true;
  try {
    const { data } = await api.post('/clientes/consulta-api', {
      tipo: form.value.tipo_documento, numero: form.value.numero_documento
    });
    if (data.success) {
      form.value.razon_social = data.razon_social || data.nombre;
      form.value.direccion = data.direccion || '';
      bloqueadoApi.value = true;
      notify('Éxito', 'Datos encontrados en padrón oficial', 'success');
    }
  } catch (e) { notify('Error', 'No encontrado en API oficial', 'danger'); }
  finally { cargandoApi.value = false; }
};

const guardar = async () => {
  try {
    if (modoEdicion.value) {
      await api.put(`/clientes/${form.value.id}`, form.value);
      notify('Actualizado', 'Cliente actualizado correctamente');
    } else {
      await api.post('/clientes', form.value);
      notify('Registrado', 'Nuevo cliente creado con éxito');
    }
    mostrarModal.value = false;
    cargarClientes();
  } catch (e) {
    notify('Error', e.response?.data?.message || 'Error al guardar', 'danger');
  }
};

const procesarEliminado = async (cliente) => {
  if (!confirm(`¿Procesar baja del cliente ${cliente.razon_social}?`)) return;

  try {
    const { data } = await api.delete(`/clientes/${cliente.id}`);

    // El backend ahora nos dice qué hizo
    if (data.action === 'INACTIVADO') {
      notify('Atención', 'Cliente PASÓ A INACTIVO porque tiene historial.', 'warning');
    } else {
      notify('Eliminado', 'Cliente eliminado permanentemente.', 'success');
    }
    cargarClientes();
  } catch (e) {
    notify('Error', 'No se pudo procesar la solicitud', 'danger');
  }
};

const reactivarCliente = async (cliente) => {
  if(!confirm(`¿Reactivar al cliente ${cliente.razon_social}?`)) return;
  try {
      await api.patch(`/clientes/${cliente.id}/reactivar`);
      notify('Éxito', 'Cliente reactivado');
      cargarClientes();
  } catch(e) { notify('Error', 'No se pudo reactivar', 'danger'); }
};

onMounted(() => cargarClientes());
</script>

<style scoped>
/* ESTILOS TOAST (NOTIFICACIONES FLOTANTES) */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.argon-toast {
  background: white;
  width: 320px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-left: 4px solid transparent;
  animation: slideInRight 0.3s;
}

.argon-toast.success {
  border-left-color: #2dce89;
}

.argon-toast.warning {
  border-left-color: #fb6340;
}

.argon-toast.danger {
  border-left-color: #f5365c;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-body {
  flex: 1;
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
  line-height: 1.3;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #adb5bd;
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

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

/* ESTILOS TABLA Y PAGINA */
.page-container {
  padding: 20px;
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

.actions-wrapper {
  display: flex;
  gap: 15px;
}

.search-input-group {
  background: white;
  border-radius: 30px;
  padding: 8px 15px;
  box-shadow: 0 1px 3px rgba(50, 50, 93, .15);
  display: flex;
  align-items: center;
}

.search-input-group input {
  border: none;
  outline: none;
  margin-left: 10px;
  color: #525f7f;
}

.btn-pulse {
  animation: pulse 2s infinite;
}

.card-box {
  background: white;
  border-radius: 15px;
  box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15);
  overflow: hidden;
}

.monster-table {
  width: 100%;
  border-collapse: collapse;
}

.monster-table th {
  background: #f6f9fc;
  padding: 15px;
  text-align: left;
  color: #8898aa;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #e9ecef;
}

.monster-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

/* Celdas bonitas */
.cell-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background: linear-gradient(87deg, #11cdef 0, #1171ef 100%);
  box-shadow: 0 4px 6px rgba(50, 50, 93, .11);
}

.main-text {
  display: block;
  font-weight: 600;
  color: #32325d;
  font-size: 0.9rem;
}

.sub-text {
  display: block;
  color: #8898aa;
  font-size: 0.75rem;
}

.badge-light {
  background: #e9ecef;
  color: #32325d;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
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

.row-inactive td {
  opacity: 0.6;
  background: #f8f9fe;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-action.edit {
  background: white;
  color: #5e72e4;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-action.delete {
  background: white;
  color: #f5365c;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Estilos Modal (Mismo que antes) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  width: 550px;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(50, 50, 93, .2);
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
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.sunat-box {
  background: #f6f9fc;
  padding: 15px;
  border-radius: 8px;
  border: 1px dashed #cad1d7;
  margin-bottom: 20px;
}

.input-group-merged {
  display: flex;
  gap: 10px;
}

.select-mini {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 0 10px;
}

.btn-sunat {
  background: #5e72e4;
  color: white;
  border: none;
  padding: 0 15px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.input-styled {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  background: #fff;
  box-sizing: border-box;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.full {
  grid-column: span 2;
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
</style>