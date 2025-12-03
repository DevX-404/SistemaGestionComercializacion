<template>
  <div class="pos-layout fade-in">

    <div class="client-bar card-box" :class="{ 'client-set': clienteSeleccionado }">
      <div class="client-search-group" v-if="!clienteSeleccionado">
        <span class="step-badge">1</span>
        <select v-model="tipoDoc" class="doc-select">
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
        </select>
        <input 
          v-model="numDoc" 
          placeholder="Ingrese Documento..." 
          @keyup.enter="buscarCliente"
          :disabled="buscandoCliente"
        >
        <button class="btn-search" @click="buscarCliente" :disabled="buscandoCliente">
          {{ buscandoCliente ? '...' : '🔍 Buscar / Crear' }}
        </button>
      </div>

      <div class="client-info" v-else>
        <div class="client-avatar">👤</div>
        <div class="info-text">
          <span class="label">Cliente Atendido:</span>
          <strong class="name">{{ clienteSeleccionado.razon_social }}</strong>
          <small class="doc">{{ clienteSeleccionado.numero_documento }}</small>
        </div>
        <button class="btn-change" @click="cambiarCliente">Cambiar</button>
      </div>

      <div class="session-info">
        <small>Vendedor:</small>
        <strong>{{ authStore.user?.nombre || 'Cajero' }}</strong>
      </div>
    </div>

    <div class="content-area" :class="{ 'blur-content': !clienteSeleccionado }">
      
      <div class="catalog-panel card-box">
        <div class="filters-bar">
          <input v-model="busqueda" placeholder="Filtrar productos..." class="search-products">
          <div class="categories-scroll">
            <button 
              class="cat-pill" 
              :class="{ active: categoriaActiva === 'Todas' }"
              @click="categoriaActiva = 'Todas'"
            >Todas</button>
            <button 
              v-for="cat in categorias" 
              :key="cat._id"
              class="cat-pill"
              :class="{ active: categoriaActiva === cat.nombre }"
              @click="categoriaActiva = cat.nombre"
            >
              {{ cat.nombre }}
            </button>
          </div>
        </div>

        <div class="products-grid-wrapper">
          <transition-group name="list" tag="div" class="products-grid">
            <div 
              v-for="prod in productosFiltrados" 
              :key="prod.sku" 
              class="product-card-pos"
              :class="{ 'disabled': prod.stock <= 0 }"
              @click="agregarAlCarrito(prod)"
            >
              <div class="img-frame">
                <img :src="prod.imagenes?.[0] ? `http://localhost:3000${prod.imagenes[0]}` : '/placeholder.png'">
                <div class="stock-tag" :class="prod.stock < 5 ? 'bg-red' : 'bg-green'">
                  {{ prod.stock }} u.
                </div>
              </div>
              <div class="p-info">
                <h6>{{ prod.nombre }}</h6>
                <span class="p-price">S/ {{ prod.precio_base.toFixed(2) }}</span>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <div class="ticket-panel card-box">
        <div class="ticket-header">
          <h3>🛒 Ticket de Venta</h3>
          <small>{{ new Date().toLocaleDateString() }}</small>
        </div>

        <div class="ticket-items">
          <div v-if="cartStore.items.length === 0" class="empty-msg">
            Seleccione productos del catálogo
          </div>
          <div v-for="item in cartStore.items" :key="item.sku" class="ticket-item">
            <div class="qty-col">
              <button @click="cartStore.disminuirCantidad(item.sku)">-</button>
              <span>{{ item.cantidad }}</span>
              <button @click="cartStore.agregarProducto(item)">+</button>
            </div>
            <div class="info-col">
              <span>{{ item.nombre }}</span>
              <small>S/ {{ item.precio_base }} c/u</small>
            </div>
            <div class="total-col">
              S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}
            </div>
            <button class="btn-del" @click="cartStore.quitarProducto(item.sku)">×</button>
          </div>
        </div>

        <div class="ticket-footer">
          <div class="totals">
            <div class="row"><span>Subtotal:</span> <span>S/ {{ cartStore.subtotal.toFixed(2) }}</span></div>
            <div class="row"><span>IGV (18%):</span> <span>S/ {{ cartStore.igv.toFixed(2) }}</span></div>
            <div class="row big"><span>TOTAL:</span> <span>S/ {{ cartStore.totalVenta.toFixed(2) }}</span></div>
          </div>

          <div class="payment-method">
            <label><input type="radio" value="CONTADO" v-model="tipoVenta"> 💵 Contado</label>
            <label><input type="radio" value="CREDITO" v-model="tipoVenta"> 💳 Crédito</label>
          </div>
          
          <div v-if="tipoVenta === 'CREDITO'" class="credit-select">
             <select v-model="cuotas">
               <option :value="1">1 Cuota (30 días)</option>
               <option :value="3">3 Cuotas</option>
               <option :value="6">6 Cuotas</option>
             </select>
          </div>

          <button class="btn-pay" @click="iniciarPago" :disabled="cartStore.items.length === 0">
            COBRAR S/ {{ cartStore.totalVenta.toFixed(2) }}
          </button>
        </div>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="mostrarPasarela" class="modal-backdrop">
        <div class="payment-modal">
          <div v-if="procesandoPago" class="processing-state">
            <div class="spinner"></div>
            <h3>Procesando Pago...</h3>
            <p>Conectando con el banco...</p>
          </div>
          <div v-else class="success-state">
            <div class="check-icon">✅</div>
            <h3>¡Venta Exitosa!</h3>
            <p>Ticket generado correctamente.</p>
            <button @click="cerrarVenta" class="btn-finish">Nueva Venta</button>
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
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import jsPDF from 'jspdf'; // Asegúrate de importar si generas PDF

const inventario = useInventarioStore();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Datos
const categorias = ref([]);
const categoriaActiva = ref('Todas');
const busqueda = ref('');
const tipoDoc = ref('DNI');
const numDoc = ref('');
const buscandoCliente = ref(false);
const clienteSeleccionado = ref(null);

// Pago
const tipoVenta = ref('CONTADO');
const cuotas = ref(1);
const mostrarPasarela = ref(false);
const procesandoPago = ref(false);

// Carga Inicial
onMounted(async () => {
  await inventario.fetchProductos(); // Ahora trae STOCK REAL
  try {
    const { data } = await api.get('/categorias');
    categorias.value = data;
  } catch (e) {}
});

// Lógica Cliente
const buscarCliente = async () => {
  if(!numDoc.value) return alert('Ingrese documento');
  buscandoCliente.value = true;
  try {
    // 1. Buscar en BD Local
    const resLocal = await api.get('/clientes');
    let cliente = resLocal.data.find(c => c.numero_documento === numDoc.value);
    
    // 2. Si no existe, buscar en API (RENIEC/SUNAT)
    if(!cliente) {
      try {
        const { data: datosExternos } = await api.post('/clientes/consulta-api', { 
           tipo: tipoDoc.value, numero: numDoc.value 
        });
        
        if(datosExternos.success) {
          // Preguntar si desea registrarlo
          if(confirm(`Cliente encontrado en ${datosExternos.encontrado_en}: ${datosExternos.razon_social || datosExternos.nombre}. ¿Registrar?`)) {
             // Guardar automáticamente
             const nuevoCliente = {
               tipo_documento: tipoDoc.value,
               numero_documento: numDoc.value,
               razon_social: datosExternos.razon_social || datosExternos.nombre,
               direccion: datosExternos.direccion || 'Sin dirección',
               email: 'no-email@cliente.com', telefono: '-'
             };
             await api.post('/clientes', nuevoCliente);
             // Recuperarlo de nuevo
             const resNew = await api.get('/clientes');
             cliente = resNew.data.find(c => c.numero_documento === numDoc.value);
          }
        }
      } catch(e) { alert('Cliente no encontrado en Padrón'); }
    }

    if(cliente) {
      clienteSeleccionado.value = cliente;
      cartStore.cliente_id = cliente.id; // Vincular al carrito
    } 

  } finally { buscandoCliente.value = false; }
};

const cambiarCliente = () => {
  clienteSeleccionado.value = null;
  cartStore.vaciarCarrito();
  numDoc.value = '';
};

// Filtrado
const productosFiltrados = computed(() => {
  let lista = inventario.productos;
  if(categoriaActiva.value !== 'Todas') {
    lista = lista.filter(p => p.categoria === categoriaActiva.value || p.specs?.categoria === categoriaActiva.value);
  }
  if(busqueda.value) {
    lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()));
  }
  return lista;
});

const agregarAlCarrito = (prod) => {
  if(!clienteSeleccionado.value) return alert('⚠️ IDENTIFIQUE AL CLIENTE PRIMERO');
  if(prod.stock <= 0) return alert('🚫 Producto Agotado');
  cartStore.agregarProducto(prod);
};

// Proceso de Pago
const iniciarPago = () => {
  if(!clienteSeleccionado.value) return;
  
  mostrarPasarela.value = true;
  procesandoPago.value = true;

  // Simulamos delay de banco (2 segundos)
  setTimeout(async () => {
     await confirmarVentaBackend();
     procesandoPago.value = false;
  }, 2000);
};

const confirmarVentaBackend = async () => {
  // Preparar payload
  const itemsProcesados = cartStore.items.map(i => ({
      sku: i.sku, cantidad: i.cantidad, precio_unitario: i.precio_base, subtotal: i.precio_base * i.cantidad
  }));

  const payload = {
      cliente_id: clienteSeleccionado.value.id,
      usuario_id: authStore.user?._id || 'CAJERO-01', // ID del usuario logueado
      items: itemsProcesados,
      tipo_pago: tipoVenta.value,
      total: cartStore.totalVenta,
      cuotas: tipoVenta.value === 'CREDITO' ? cuotas.value : 1
  };

  try {
    await api.post('/ventas', payload);
    // Aquí podrías llamar a generarBoletaPDF() si la tienes
  } catch (e) { 
    alert('Error guardando venta: ' + e.message); 
    mostrarPasarela.value = false;
  }
};

const cerrarVenta = () => {
  mostrarPasarela.value = false;
  cambiarCliente(); // Resetea todo para el siguiente
  inventario.fetchProductos(); // Actualiza stock visual
};
</script>

<style scoped>
.pos-layout { display: flex; flex-direction: column; height: calc(100vh - 90px); gap: 15px; }

/* CLIENT BAR */
.client-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 20px; background: white; border-left: 5px solid var(--warning);
  transition: 0.3s;
}
.client-bar.client-set { border-left-color: var(--success); background: #f0fff4; }

.client-search-group { display: flex; gap: 10px; align-items: center; }
.step-badge { background: var(--warning); color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; }
.doc-select { padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
.client-search-group input { padding: 8px; border: 1px solid #ddd; border-radius: 5px; width: 200px; }
.btn-search { background: var(--dark-purple); color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }

.client-info { display: flex; align-items: center; gap: 15px; }
.client-avatar { font-size: 2rem; }
.info-text { display: flex; flex-direction: column; }
.info-text .name { color: var(--dark-purple); font-size: 1.1rem; }
.btn-change { background: transparent; border: 1px solid #ccc; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

/* CONTENT AREA */
.content-area { display: flex; flex: 1; gap: 15px; overflow: hidden; transition: 0.3s; }
.blur-content { opacity: 0.5; pointer-events: none; filter: blur(2px); } /* Bloquea si no hay cliente */

/* CATALOGO */
.catalog-panel { flex: 1; display: flex; flex-direction: column; padding: 15px; }
.filters-bar { display: flex; gap: 15px; margin-bottom: 15px; }
.search-products { flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05); outline: none; }
.categories-scroll { display: flex; gap: 8px; overflow-x: auto; }
.cat-pill { white-space: nowrap; padding: 8px 15px; border-radius: 20px; border: 1px solid #eee; background: white; cursor: pointer; transition: 0.2s; }
.cat-pill.active { background: var(--primary); color: white; border-color: var(--primary); }

.products-grid-wrapper { flex: 1; overflow-y: auto; padding: 5px; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }

.product-card-pos { 
  background: white; border-radius: 10px; overflow: hidden; cursor: pointer; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: 0.2s; border: 1px solid transparent;
}
.product-card-pos:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: var(--primary); }
.product-card-pos.disabled { opacity: 0.6; pointer-events: none; filter: grayscale(1); }

.img-frame { height: 100px; position: relative; display: flex; align-items: center; justify-content: center; background: #f8f9fe; }
.img-frame img { max-height: 80%; max-width: 80%; }
.stock-tag { position: absolute; top: 5px; right: 5px; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.bg-green { background: var(--success); } .bg-red { background: var(--danger); }

.p-info { padding: 10px; text-align: center; }
.p-info h6 { margin: 0 0 5px; font-size: 0.85rem; color: var(--text-main); height: 35px; overflow: hidden; }
.p-price { font-weight: 800; color: var(--primary); }

/* TICKET */
.ticket-panel { width: 320px; display: flex; flex-direction: column; padding: 0; border-top: 5px solid var(--primary); }
.ticket-header { padding: 15px; background: #f8f9fe; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.ticket-items { flex: 1; overflow-y: auto; padding: 10px; background: white; }

.ticket-item { display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
.qty-col { display: flex; align-items: center; gap: 5px; background: #f0f2f5; border-radius: 15px; padding: 2px 5px; }
.qty-col button { width: 20px; height: 20px; border-radius: 50%; border: none; background: white; cursor: pointer; font-weight: bold; }
.info-col { flex: 1; padding: 0 10px; display: flex; flex-direction: column; font-size: 0.85rem; }
.total-col { font-weight: bold; color: var(--primary); font-size: 0.9rem; }
.btn-del { color: var(--danger); border: none; background: none; cursor: pointer; font-size: 1.2rem; }

.ticket-footer { padding: 15px; background: #f8f9fe; border-top: 1px solid #ddd; }
.totals .row { display: flex; justify-content: space-between; margin-bottom: 5px; color: #555; font-size: 0.9rem; }
.totals .big { font-size: 1.2rem; font-weight: 800; color: var(--dark-purple); margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px; }

.payment-method { display: flex; gap: 15px; margin: 15px 0; justify-content: center; }
.credit-select { margin-bottom: 10px; }
.credit-select select { width: 100%; padding: 8px; border-radius: 5px; border: 1px solid var(--warning); color: var(--warning); font-weight: bold; }

.btn-pay { width: 100%; background: var(--success); color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.2s; }
.btn-pay:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(45,206,137,0.4); }
.btn-pay:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

/* MODAL PASARELA */
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 200; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.payment-modal { background: white; padding: 40px; border-radius: 20px; text-align: center; width: 400px; animation: popUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.processing-state h3 { color: var(--primary); }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
.check-icon { font-size: 4rem; margin-bottom: 10px; animation: popUp 0.5s; }
.success-state h3 { color: var(--success); }
.btn-finish { background: var(--dark-purple); color: white; padding: 10px 20px; border-radius: 20px; border: none; font-weight: bold; margin-top: 20px; cursor: pointer; }

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes popUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>