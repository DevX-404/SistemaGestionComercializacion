<template>
  <div class="cart-page fade-in">
    <div class="container">
      
      <div class="cart-header">
        <h2>Tu Carrito de Compras</h2>
        <span class="item-count">{{ cart.items.length }} productos</span>
      </div>

      <div class="cart-layout" v-if="cart.items.length > 0">
        
        <div class="items-list">
          <div v-for="item in cart.items" :key="item.sku" class="cart-item">
             <div class="item-image">
                <img :src="item.imagenes?.[0] ? `http://localhost:3000${item.imagenes[0]}` : '/placeholder.png'">
             </div>
             <div class="item-details">
                <h4>{{ item.nombre }}</h4>
                <p class="sku">SKU: {{ item.sku }}</p>
                <p class="unit-price">S/ {{ item.precio_base.toFixed(2) }}</p>
             </div>
             <div class="item-actions">
                <div class="qty-control">
                   <button @click="cart.disminuirCantidad(item.sku)" class="btn-qty">−</button>
                   <input type="text" :value="item.cantidad" readonly>
                   <button @click="cart.agregarProducto(item)" class="btn-qty">+</button>
                </div>
                <div class="item-subtotal">S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}</div>
                <button @click="cart.quitarProducto(item.sku)" class="btn-trash">🗑️</button>
             </div>
          </div>
        </div>

        <div class="checkout-panel">
           <div class="summary-card">
              <h3>Resumen del Pedido</h3>
              <div class="summary-row"><span>Subtotal</span> <span>S/ {{ cart.subtotal.toFixed(2) }}</span></div>
              <div class="summary-row"><span>IGV (18%)</span> <span>S/ {{ cart.igv.toFixed(2) }}</span></div>
              <div class="divider"></div>
              <div class="summary-row total"><span>Total</span> <span>S/ {{ cart.totalVenta.toFixed(2) }}</span></div>

              <button class="btn-checkout" @click="iniciarCheckout">
                 INICIAR PAGO 🔒
              </button>
              <router-link to="/catalogo" class="continue-link">Seguir comprando</router-link>
           </div>
        </div>

      </div>

      <div v-else class="empty-cart">
         <div class="icon">🛒</div>
         <h2>Tu carrito está vacío</h2>
         <router-link to="/catalogo" class="btn-start">Ir a la Tienda</router-link>
      </div>

    </div>

    <transition name="modal-fade">
      <div v-if="step === 1" class="modal-backdrop">
         <div class="modal-card slide-in-up">
            <div class="modal-header">
               <h4>1. Identifícate</h4>
               <button class="close-btn" @click="step = 0">×</button>
            </div>
            <div class="modal-body">
               <p class="text-muted">Ingresa tu documento para continuar con la compra.</p>
               
               <div class="search-row">
                  <select v-model="clienteForm.tipo_documento" class="input-styled w-auto">
                     <option value="DNI">DNI</option>
                     <option value="RUC">RUC</option>
                  </select>
                  <input v-model="clienteForm.numero_documento" placeholder="Nro. Documento" class="input-styled flex-1" @keyup.enter="validarCliente">
                  <button class="btn-search" @click="validarCliente" :disabled="cargando">
                     {{ cargando ? '...' : '🔍' }}
                  </button>
               </div>

               <div v-if="clienteEncontrado" class="client-details-form fade-in">
                  <div class="form-group">
                     <label>Nombre / Razón Social</label>
                     <input v-model="clienteForm.razon_social" class="input-styled filled" readonly>
                  </div>
                  <div class="form-group">
                     <label>Dirección de Envío</label>
                     <input v-model="clienteForm.direccion" class="input-styled filled">
                  </div>
                  <div class="form-group">
                     <label>Correo Electrónico (Para envío de boleta)</label>
                     <input v-model="clienteForm.email" class="input-styled" placeholder="ejemplo@correo.com">
                  </div>
               </div>
            </div>
            <div class="modal-footer">
               <button class="btn-primary full-width" @click="irAlPago" :disabled="!clienteEncontrado">
                  Continuar al Pago ➔
               </button>
            </div>
         </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="step === 2" class="modal-backdrop">
         <div class="modal-card slide-in-up modal-lg">
            <div class="modal-header bg-dark text-white">
               <h4>2. Pasarela de Pago Segura</h4>
               <button class="close-btn white" @click="step = 1">×</button>
            </div>
            
            <div class="gateway-body">
               
               <div class="payment-methods">
                  <h5 class="section-title">Elige método de pago</h5>
                  
                  <label class="method-card" :class="{ active: metodoPago === 'CONTADO' }">
                     <input type="radio" v-model="metodoPago" value="CONTADO" hidden>
                     <span class="icon">💵</span>
                     <div class="text">
                        <strong>Contado / Débito</strong>
                        <small>Yape, Plin o Tarjeta Débito</small>
                     </div>
                  </label>

                  <label class="method-card" :class="{ active: metodoPago === 'CREDITO' }">
                     <input type="radio" v-model="metodoPago" value="CREDITO" hidden>
                     <span class="icon">💳</span>
                     <div class="text">
                        <strong>Tarjeta de Crédito</strong>
                        <small>Paga en cuotas</small>
                     </div>
                  </label>
               </div>

               <div class="card-details">
                  <div class="card-visual">
                     <div class="chip"></div>
                     <div class="number">•••• •••• •••• 4242</div>
                     <div class="name">{{ clienteForm.razon_social || 'NOMBRE TITULAR' }}</div>
                     <div class="logo-visa">VISA</div>
                  </div>

                  <div class="form-grid">
                      <div v-if="metodoPago === 'CREDITO'" class="form-group full">
                         <label>Número de Cuotas</label>
                         <select v-model="cuotas" class="input-styled">
                            <option :value="1">Sin cuotas (Directo)</option>
                            <option :value="3">3 Cuotas sin interés</option>
                            <option :value="6">6 Cuotas</option>
                            <option :value="12">12 Cuotas</option>
                         </select>
                      </div>

                      <div v-if="metodoPago === 'CONTADO'" class="yape-info fade-in">
                         <p>Escanea el QR con Yape o Plin</p>
                         <div class="qr-placeholder">QR</div>
                      </div>
                  </div>

                  <div class="total-pay-row">
                     <span>Total a Pagar:</span>
                     <strong>S/ {{ cart.totalVenta.toFixed(2) }}</strong>
                  </div>
               </div>
            </div>

            <div class="modal-footer">
               <button class="btn-success full-width" @click="procesarCompraFinal" :disabled="procesando">
                  <span v-if="!procesando">CONFIRMAR PAGO ✅</span>
                  <span v-else>Procesando... ⏳</span>
               </button>
               <div class="secure-seal">🔒 Transacción encriptada de 256-bits</div>
            </div>
         </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useRouter } from 'vue-router';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const cart = useCartStore();
const router = useRouter();

// Estados
const step = ref(0); // 0: Carrito, 1: Identidad, 2: Pago
const cargando = ref(false);
const procesando = ref(false);
const clienteEncontrado = ref(false);
const metodoPago = ref('CONTADO');
const cuotas = ref(1);

const clienteForm = reactive({
    id: null, // Si existe en BD
    tipo_documento: 'DNI',
    numero_documento: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: '999999999'
});

// --- PASO 1: VALIDAR IDENTIDAD ---
const iniciarCheckout = () => step.value = 1;

const validarCliente = async () => {
    if(!clienteForm.numero_documento) return alert("Ingrese documento");
    cargando.value = true;
    clienteEncontrado.value = false;

    try {
        // CORRECCIÓN PROFESIONAL:
        // No descargamos todos los clientes (eso daba 403).
        // Consultamos directamente al endpoint que busca en BD Local y API Externa a la vez.
        
        const { data: resultado } = await api.post('/clientes/consulta-api', {
            tipo: clienteForm.tipo_documento,
            numero: clienteForm.numero_documento
        });

        if (resultado.success || resultado.encontrado_en) {
            // Si existe (ya sea en BD local o RENIEC/SUNAT)
            clienteForm.id = resultado.id || null; // Si viene de BD local, tendrá ID
            clienteForm.razon_social = resultado.razon_social || resultado.nombre;
            clienteForm.direccion = resultado.direccion || '';
            clienteForm.email = resultado.email || '';
            clienteForm.telefono = resultado.telefono || '';
            
            clienteEncontrado.value = true;
        } else {
            alert("Documento no encontrado.");
        }

    } catch(e) {
        console.error(e);
        // Si el error es 404 es que no existe, si es otro, es error de red
        if (e.response && e.response.status === 404) {
             alert("Documento no encontrado en ninguna base de datos.");
        } else {
             alert("Error de conexión o documento inválido.");
        }
    } finally {
        cargando.value = false;
    }
};

const irAlPago = () => {
    if(!clienteForm.razon_social) return alert("Datos incompletos");
    step.value = 2;
};

// --- PASO 2: PROCESAR PAGO ---
const procesarCompraFinal = async () => {
    procesando.value = true;
    try {
        // 1. Si el cliente es nuevo (no tiene ID), lo creamos primero
        let idClienteFinal = clienteForm.id;
        
        if (!idClienteFinal) {
            const resNuevo = await api.post('/clientes', {
                tipo_documento: clienteForm.tipo_documento,
                numero_documento: clienteForm.numero_documento,
                razon_social: clienteForm.razon_social,
                direccion: clienteForm.direccion,
                email: clienteForm.email || 'cliente@web.com',
                telefono: clienteForm.telefono
            });
            // El backend suele devolver { message: '...', id: ... } o algo similar
            // Si tu backend no devuelve el ID al crear, hacemos una búsqueda rápida
            const { data: clientesRefresh } = await api.get('/clientes');
            const creado = clientesRefresh.find(c => c.numero_documento === clienteForm.numero_documento);
            idClienteFinal = creado.id;
        }

        // 2. Preparar Payload de Venta
        const payload = {
            cliente_id: idClienteFinal,
            usuario_id: 'WEB-USER', // Usuario genérico para ventas web
            items: cart.items.map(item => ({
                sku: item.sku,
                cantidad: item.cantidad,
                precio_unitario: item.precio_base, // CRUCIAL
                subtotal: item.precio_base * item.cantidad
            })),
            tipo_pago: metodoPago.value, // CONTADO o CREDITO
            total: cart.totalVenta,
            cuotas: metodoPago.value === 'CREDITO' ? cuotas.value : 1
        };

        // 3. Enviar Venta
        const { data } = await api.post('/ventas', payload);

        // 4. Éxito y PDF
        generarBoleta(data.id_venta || Date.now());
        alert('¡Compra exitosa! Tu boleta se está descargando.');
        
        cart.vaciarCarrito();
        router.push('/catalogo');

    } catch (error) {
        console.error(error);
        alert('Error procesando la venta: ' + (error.response?.data?.mensaje || error.message));
    } finally {
        procesando.value = false;
    }
};

// --- GENERADOR PDF ---
const generarBoleta = (idVenta) => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("MONSTER STORE - Comprobante Electrónico", 105, 20, null, null, "center");
    doc.setFontSize(10); doc.text(`Venta Web #${idVenta}`, 105, 28, null, null, "center");
    
    doc.text(`Cliente: ${clienteForm.razon_social}`, 15, 40);
    doc.text(`DOC: ${clienteForm.numero_documento}`, 15, 46);
    doc.text(`Método: ${metodoPago.value} (${metodoPago.value === 'CREDITO' ? cuotas.value + ' cuotas' : 'Directo'})`, 15, 52);

    const body = cart.items.map(i => [i.cantidad, i.nombre, `S/ ${i.precio_base}`, `S/ ${(i.precio_base*i.cantidad).toFixed(2)}`]);
    
    autoTable(doc, { 
        startY: 60, 
        head: [['Cant', 'Producto', 'P.Unit', 'Total']], 
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [94, 114, 228] }
    });

    doc.setFontSize(12);
    doc.text(`TOTAL PAGADO: S/ ${cart.totalVenta.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 15);
    doc.save(`Boleta_Venta_${idVenta}.pdf`);
};
</script>

<style scoped>
/* ESTILOS BASE CARRITO (Mantener los que tenías o usar estos mejorados) */
.cart-page { padding: 40px 20px; background: #f8f9fe; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; }
.cart-header { display: flex; align-items: baseline; gap: 15px; margin-bottom: 30px; }
.cart-header h2 { margin: 0; color: #32325d; font-weight: 800; }
.item-count { color: #8898aa; font-weight: 600; }
.cart-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
.items-list { background: white; border-radius: 15px; padding: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.cart-item { display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #f6f9fc; }
.item-image { width: 80px; height: 80px; background: #f8f9fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 20px; }
.item-image img { max-width: 80%; max-height: 80%; }
.item-details { flex: 1; }
.item-details h4 { margin: 0 0 5px; color: #32325d; font-size: 1rem; }
.sku { margin: 0; color: #8898aa; font-size: 0.75rem; font-family: monospace; }
.unit-price { color: #525f7f; font-weight: 600; margin-top: 5px; font-size: 0.9rem; }
.item-actions { display: flex; align-items: center; gap: 20px; }
.qty-control { display: flex; align-items: center; border: 1px solid #dee2e6; border-radius: 20px; overflow: hidden; }
.btn-qty { background: white; border: none; width: 30px; height: 30px; cursor: pointer; font-weight: bold; color: #5e72e4; transition: 0.2s; }
.btn-qty:hover { background: #f6f9fc; }
.qty-control input { width: 30px; border: none; text-align: center; font-weight: bold; color: #32325d; outline: none; }
.item-subtotal { font-weight: 800; color: #32325d; width: 80px; text-align: right; }
.btn-trash { background: none; border: none; color: #f5365c; cursor: pointer; font-size: 1.1rem; margin-left: 10px; }
.checkout-panel { position: sticky; top: 90px; }
.summary-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07); }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #525f7f; font-size: 0.9rem; }
.summary-row.total { font-size: 1.3rem; font-weight: 800; color: #32325d; margin-bottom: 25px; margin-top: 15px; }
.divider { border-top: 1px dashed #e9ecef; margin: 15px 0; }
.btn-checkout { width: 100%; background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 6px rgba(50,50,93,.11); letter-spacing: 1px; }
.btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 7px 14px rgba(50,50,93,.1); }
.continue-link { display: block; text-align: center; margin-top: 15px; color: #5e72e4; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.empty-cart { text-align: center; padding: 80px 20px; }
.empty-cart .icon { font-size: 4rem; opacity: 0.3; margin-bottom: 20px; }

/* === MODALES === */
.modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.modal-card { background: white; width: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: slideUp 0.4s ease; }
.modal-card.modal-lg { width: 800px; }
.modal-header { padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.bg-dark { background: #172b4d; }
.text-white { color: white; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #889; }
.close-btn.white { color: white; }
.modal-body { padding: 30px; }
.modal-footer { padding: 20px; border-top: 1px solid #eee; background: #f9f9f9; text-align: right; }

/* PASO 1: Identidad */
.search-row { display: flex; gap: 10px; margin-bottom: 20px; }
.input-styled { width: 100%; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; outline: none; }
.input-styled:focus { border-color: #5e72e4; box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1); }
.input-styled.filled { background: #e8f6fc; border-color: #11cdef; color: #172b4d; font-weight: 600; }
.btn-search { background: #5e72e4; color: white; border: none; padding: 0 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
.btn-primary { background: #5e72e4; color: white; border: none; padding: 12px; border-radius: 5px; font-weight: 700; cursor: pointer; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-size: 0.85rem; color: #8898aa; font-weight: 600; }

/* PASO 2: Pasarela */
.gateway-body { display: grid; grid-template-columns: 1fr 1.2fr; min-height: 350px; }
.payment-methods { padding: 25px; background: #f8f9fe; border-right: 1px solid #eee; }
.section-title { margin: 0 0 20px 0; font-size: 0.85rem; text-transform: uppercase; color: #8898aa; font-weight: 700; }
.method-card { display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border: 1px solid #e9ecef; border-radius: 10px; margin-bottom: 15px; cursor: pointer; transition: 0.2s; }
.method-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.method-card.active { border-color: #5e72e4; background: #f4f5fe; box-shadow: 0 0 0 2px #5e72e4; }
.method-card .icon { font-size: 1.5rem; }
.method-card .text strong { display: block; font-size: 0.9rem; color: #32325d; }
.method-card .text small { font-size: 0.75rem; color: #8898aa; }

.card-details { padding: 25px; display: flex; flex-direction: column; justify-content: space-between; }
.card-visual { background: linear-gradient(135deg, #172b4d 0%, #1a174d 100%); border-radius: 12px; padding: 20px; color: white; margin-bottom: 20px; position: relative; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.chip { width: 40px; height: 25px; background: linear-gradient(135deg, #e0c168, #f8e2a2); border-radius: 5px; margin-bottom: 20px; }
.number { font-family: monospace; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 15px; text-shadow: 0 2px 2px rgba(0,0,0,0.3); }
.name { font-size: 0.8rem; text-transform: uppercase; opacity: 0.8; }
.logo-visa { position: absolute; top: 20px; right: 20px; font-weight: 800; font-style: italic; font-size: 1.2rem; }

.yape-info { text-align: center; padding: 20px; background: #fafafa; border-radius: 8px; border: 1px dashed #ccc; }
.qr-placeholder { width: 100px; height: 100px; background: #32325d; color: white; display: flex; align-items: center; justify-content: center; margin: 10px auto; font-weight: bold; }

.total-pay-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; color: #32325d; padding-top: 15px; border-top: 1px solid #eee; }
.btn-success { background: #2dce89; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: 800; font-size: 1rem; width: 100%; cursor: pointer; transition: 0.2s; }
.btn-success:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(45,206,137,0.4); }
.secure-seal { text-align: center; margin-top: 10px; font-size: 0.75rem; color: #8898aa; display: flex; align-items: center; justify-content: center; gap: 5px; }

@keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
.full-width { width: 100%; }
.w-auto { width: auto; }
.flex-1 { flex: 1; }
</style>