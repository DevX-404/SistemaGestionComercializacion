<template>
  <div class="checkout-wrapper">
    
    <Transition name="slide-down">
      <div v-if="notification.show" class="argon-alert" :class="notification.type">
        <div class="alert-icon">
          <span v-if="notification.type === 'success'">✅</span>
          <span v-if="notification.type === 'danger'">⛔</span>
          <span v-if="notification.type === 'warning'">⚠️</span>
          <span v-if="notification.type === 'info'">ℹ️</span>
        </div>
        <div class="alert-content">
            <h4 class="alert-heading">{{ getTitle(notification.type) }}</h4>
            <p>{{ notification.message }}</p>
        </div>
        <button class="close-btn" @click="notification.show = false">×</button>
      </div>
    </Transition>

    <div class="container">
      <h1 class="page-title">🚀 Finalizar Compra</h1>
      
      <div v-if="cart.items.length === 0" class="empty-state fade-in">
          <div class="empty-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Parece que aún no has agregado productos monstruosos.</p>
          <router-link to="/catalogo" class="btn-back">Volver al Catálogo</router-link>
      </div>

      <div v-else class="checkout-grid">
        
        <div class="steps-container">
            
            <div class="step-card" :class="{ active: step === 1, done: step > 1 }">
                <div class="step-header" @click="step = 1">
                    <div class="step-num">1</div>
                    <h3>Identificación del Cliente</h3>
                </div>
                <div class="step-body" v-if="step === 1">
                    <div class="form-group search-group">
                        <select v-model="tipoDoc" class="form-control compact argon-input">
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                        </select>
                        <input v-model="numDoc" type="text" class="form-control argon-input" 
                               :class="{'is-invalid': errors.numDoc}"
                               placeholder="Nro Documento" maxlength="11">
                        <button @click="buscarClienteApi" class="btn-dark" :disabled="buscando">
                            {{ buscando ? '...' : '🔍' }}
                        </button>
                    </div>
                    
                    <div v-if="clienteNombre" class="client-result fade-in">
                        <div class="form-group">
                            <label class="argon-label">Cliente / Razón Social</label>
                            <input v-model="clienteNombre" type="text" class="form-control argon-input" readonly>
                        </div>
                        <div class="form-group">
                            <label class="argon-label">Dirección de Envío</label>
                            <input v-model="clienteDireccion" type="text" class="form-control argon-input" placeholder="Ingrese dirección exacta">
                        </div>
                        <button class="btn-next" @click="step = 2">Continuar al Pago 👉</button>
                    </div>
                </div>
            </div>

            <div class="step-card" :class="{ active: step === 2 }">
                <div class="step-header">
                    <div class="step-num">2</div>
                    <h3>Método de Pago</h3>
                </div>
                <div class="step-body" v-if="step === 2">
                    
                    <div class="payment-tabs">
                        <button :class="{active: metodoPago === 'TARJETA'}" @click="metodoPago = 'TARJETA'">💳 Tarjeta</button>
                        <button :class="{active: metodoPago === 'CREDITO'}" @click="metodoPago = 'CREDITO'">🏦 Crédito</button>
                    </div>

                    <div v-if="metodoPago === 'TARJETA'" class="card-simulator">
                        <div class="flip-container" :class="{ flipped: isFlipped }">
                            <div class="flipper">
                                <div class="front">
                                    <div class="chip"></div>
                                    <div class="card-number">{{ cardForm.numero || '•••• •••• •••• ••••' }}</div>
                                    <div class="card-holder">{{ cardForm.nombre || 'NOMBRE TITULAR' }}</div>
                                    <div class="card-expiry">{{ cardForm.exp || 'MM/YY' }}</div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="logo-visa">
                                </div>
                                <div class="back">
                                    <div class="strip"></div>
                                    <div class="cvv-box">{{ cardForm.cvc || '***' }}</div>
                                    <p class="cvv-label">CVV</p>
                                </div>
                            </div>
                        </div>

                        <div class="card-form-inputs">
                            <input v-model="cardForm.numero" type="text" placeholder="Número de Tarjeta" maxlength="19" class="form-control argon-input">
                            <input v-model="cardForm.nombre" type="text" placeholder="Nombre en la tarjeta" class="form-control argon-input">
                            <div class="row">
                                <input v-model="cardForm.exp" type="text" placeholder="MM/YY" class="form-control argon-input">
                                <input v-model="cardForm.cvc" type="text" placeholder="CVV" class="form-control argon-input" 
                                    @focus="isFlipped = true" @blur="isFlipped = false" maxlength="3">
                            </div>
                        </div>
                    </div>

                    <div v-if="metodoPago === 'CREDITO'" class="credit-options">
                        <p>Seleccione sus cuotas:</p>
                        <div class="cuotas-grid">
                            <div v-for="c in [1, 3, 6, 12]" :key="c" 
                                 class="cuota-card" :class="{selected: cuotas === c}" @click="cuotas = c">
                                <strong>{{ c }}x</strong>
                                <small>{{ c === 1 ? 'Sin interés' : (c*1.5) + '% interés' }}</small>
                            </div>
                        </div>
                        <div class="total-projection">
                            Pagará: <strong>S/ {{ calcularCuota() }}</strong> mensuales
                        </div>
                    </div>

                    <button @click="procesarCompra" class="btn-pay-final" :disabled="procesando">
                        {{ procesando ? 'Procesando...' : `PAGAR S/ ${cart.totalVenta.toFixed(2)}` }}
                    </button>

                </div>
            </div>

        </div>

        <div class="order-summary">
            <h3>Tu Pedido</h3>
            <div class="summary-items">
                <div v-for="item in cart.items" :key="item.sku" class="mini-item">
                    <img :src="`http://localhost:3000${item.imagenes[0]}`">
                    
                    <div class="item-details">
                        <p class="mini-name">{{ item.nombre }}</p>
                        <p class="mini-sku">SKU: {{ item.sku }}</p>
                        
                        <div class="qty-controls">
                            <button class="qty-btn" @click="restarItem(item)">-</button>
                            <span class="qty-val">{{ item.cantidad }}</span>
                            <button class="qty-btn" @click="sumarItem(item)">+</button>
                        </div>
                    </div>
                    
                    <div class="item-right">
                         <span class="mini-price">S/ {{ (item.precio_base * item.cantidad).toFixed(2) }}</span>
                         <button class="btn-trash" @click="eliminarItem(item.sku)" title="Eliminar">🗑️</button>
                    </div>
                </div>
            </div>
            <div class="summary-total">
                <div class="row"><span>Subtotal:</span> <span>S/ {{ cart.subtotal.toFixed(2) }}</span></div>
                <div class="row"><span>IGV (18%):</span> <span>S/ {{ cart.igv.toFixed(2) }}</span></div>
                <div class="row final"><span>TOTAL:</span> <span>S/ {{ cart.totalVenta.toFixed(2) }}</span></div>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCartStore } from '../../stores/cart';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const cart = useCartStore();
const step = ref(1);

// Datos UI
const buscando = ref(false);
const procesando = ref(false);
const notification = ref({ show: false, message: '', type: 'success' });
const errors = reactive({ numDoc: false });

// Datos Formulario
const tipoDoc = ref('DNI');
const numDoc = ref('');
const clienteNombre = ref('');
const clienteDireccion = ref('');
const metodoPago = ref('TARJETA');
const cuotas = ref(1);
const cardForm = ref({ numero: '', nombre: '', exp: '', cvc: '' });
const isFlipped = ref(false);

// --- SISTEMA DE NOTIFICACIONES (Argon Toast) ---
const showToast = (msg, type = 'success') => {
    notification.value = { show: true, message: msg, type };
    setTimeout(() => { notification.value.show = false; }, 4000);
};
const getTitle = (type) => {
    if(type === 'success') return '¡Excelente!';
    if(type === 'danger') return '¡Error!';
    if(type === 'warning') return 'Advertencia';
    return 'Información';
};

// --- CONTROL DE CARRITO (Wrapper para evitar alerts nativos) ---
const sumarItem = (item) => {
    const res = cart.agregarProducto(item);
    if (!res.success) showToast(res.message, 'warning');
};

const restarItem = (item) => {
    cart.disminuirCantidad(item.sku);
};

const eliminarItem = (sku) => {
    cart.quitarProducto(sku);
    showToast('Producto eliminado del carrito', 'info');
};

// --- LÓGICA DE NEGOCIO ---
const buscarClienteApi = async () => {
    if (!numDoc.value) {
        errors.numDoc = true;
        return showToast('Ingrese un número de documento', 'warning');
    }
    errors.numDoc = false;
    buscando.value = true;
    try {
        const { data } = await api.post('/clientes/consulta-api', { tipo: tipoDoc.value, numero: numDoc.value });
        if(data) {
            clienteNombre.value = data.nombre || data.razon_social;
            clienteDireccion.value = data.direccion || '';
            showToast('Cliente encontrado', 'success');
        }
    } catch (error) {
        showToast('Documento no encontrado en RENIEC/SUNAT', 'warning');
    } finally { buscando.value = false; }
};

const calcularCuota = () => {
    let interes = cuotas.value === 1 ? 0 : (cuotas.value * 1.5) / 100;
    return ((cart.totalVenta * (1 + interes)) / cuotas.value).toFixed(2);
};

// --- GENERAR PDF ---
const generarBoletaPDF = (idVenta) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("MONSTER STORE S.A.C.", 105, 20, null, null, "center");
    doc.setFontSize(10);
    doc.text(`RUC: 20100000001 - Boleta Electrónica: ${idVenta}`, 105, 28, null, null, "center");
    
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 45);
    doc.text(`Cliente: ${clienteNombre.value}`, 15, 52);
    doc.text(`DOC: ${numDoc.value}`, 15, 59);

    const body = cart.items.map(i => [i.cantidad, i.nombre, `S/ ${i.precio_base}`, `S/ ${(i.precio_base*i.cantidad).toFixed(2)}`]);
    
    autoTable(doc, {
        startY: 70,
        head: [['Cant', 'Descripción', 'P.Unit', 'Total']],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [45, 206, 137] }
    });

    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text(`Total Pagado: S/ ${cart.totalVenta.toFixed(2)}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save(`Boleta_${idVenta}.pdf`);
};

const procesarCompra = async () => {
    if (!clienteNombre.value) return showToast('Identifíquese primero (Paso 1)', 'warning');
    
    procesando.value = true;
    try {
        let clienteId = 1; 
        try {
            await api.post('/clientes', {
                tipo_documento: tipoDoc.value, numero_documento: numDoc.value,
                razon_social: clienteNombre.value, direccion: clienteDireccion.value,
                email: 'web@cliente.com', telefono: '999'
            });
            const res = await api.get('/clientes');
            const nuevo = res.data.find(c => c.numero_documento === numDoc.value);
            if (nuevo) clienteId = nuevo.id;
        } catch (e) { /* Ignorar si existe */ }

        const payload = {
            cliente_id: clienteId, usuario_id: 'WEB', items: cart.items,
            tipo_pago: metodoPago.value === 'CREDITO' ? 'CREDITO' : 'CONTADO', total: cart.totalVenta
        };
        
        const { data } = await api.post('/ventas/procesar', payload);
        showToast(`¡Compra Exitosa! ID: ${data.venta_id}`, 'success');
        generarBoletaPDF(data.venta_id || Date.now());

        setTimeout(() => {
            cart.vaciarCarrito();
            window.location.href = '/';
        }, 3000);

    } catch (error) {
        console.error(error);
        showToast("Hubo un error procesando la venta", 'danger');
    } finally { procesando.value = false; }
};
</script>

<style scoped>
/* GENERAL */
.checkout-wrapper { background: #f8f9fe; min-height: 100vh; padding: 40px 20px; font-family: 'Open Sans', sans-serif; }
.container { max-width: 1150px; margin: 0 auto; }
.page-title { text-align: center; margin-bottom: 40px; color: #32325d; font-weight: 700; letter-spacing: -0.5px; }

/* --- ARGON ALERTS (Banner Flotante) --- */
.argon-alert {
    position: fixed; top: 20px; right: 20px; z-index: 10000;
    min-width: 350px; padding: 1rem; border-radius: 0.375rem;
    color: #fff; display: flex; align-items: flex-start;
    box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}
.argon-alert.success { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); }
.argon-alert.danger { background: linear-gradient(87deg, #f5365c 0, #f56036 100%); }
.argon-alert.warning { background: linear-gradient(87deg, #fb6340 0, #fbb140 100%); }
.argon-alert.info { background: linear-gradient(87deg, #11cdef 0, #1171ef 100%); }

.alert-icon { font-size: 1.5rem; margin-right: 1rem; }
.alert-content h4 { margin: 0; font-size: 0.9rem; text-transform: uppercase; font-weight: 700; opacity: 0.9; }
.alert-content p { margin: 2px 0 0; font-size: 0.9rem; }
.close-btn { margin-left: auto; background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.7; }
.close-btn:hover { opacity: 1; }

/* ANIMACIONES */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-50px) scale(0.9); opacity: 0; }
.fade-in { animation: fadeIn 0.5s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* INPUTS ARGON */
.argon-label { font-size: 0.85rem; font-weight: 600; color: #525f7f; margin-bottom: 0.5rem; display: block; }
.argon-input {
    border: 1px solid #cad1d7; border-radius: 0.375rem; background-color: #fff;
    box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
    transition: all 0.2s; padding: 0.625rem 0.75rem; width: 100%; box-sizing: border-box; color: #8898aa;
}
.argon-input:focus { border-color: #5e72e4; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11); outline: none; color: #32325d; }
.is-invalid { border-color: #f5365c; }

/* LAYOUT */
.grid-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 30px; }
.steps-container { display: flex; flex-direction: column; gap: 20px; }

/* STEPS CARD */
.step-card { background: white; border-radius: 0.375rem; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); overflow: hidden; transition: 0.3s; border: 1px solid rgba(0,0,0,.05); opacity: 0.7; }
.step-card.active { opacity: 1; transform: scale(1.01); border-color: #5e72e4; }
.step-header { display: flex; align-items: center; padding: 1.25rem; cursor: pointer; background: #fff; border-bottom: 1px solid #f0f0f0; }
.step-num { width: 30px; height: 30px; background: #e9ecef; color: #8898aa; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; margin-right: 1rem; }
.active .step-num { background: #5e72e4; color: white; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.step-body { padding: 1.5rem; }

/* RESUMEN PEDIDO */
.order-summary { background: white; padding: 1.5rem; border-radius: 0.375rem; box-shadow: 0 0 2rem 0 rgba(136, 152, 170, 0.15); border: 1px solid rgba(0,0,0,.05); height: fit-content; }
.summary-items { max-height: 400px; overflow-y: auto; }
.mini-item { display: flex; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px dashed #e9ecef; }
.mini-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 0.375rem; margin-right: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.item-details { flex: 1; }
.mini-name { font-weight: 600; color: #32325d; font-size: 0.9rem; margin: 0 0 5px; }
.mini-sku { font-size: 0.75rem; color: #8898aa; margin: 0; }

/* CONTROLES CANTIDAD */
.qty-controls { display: flex; align-items: center; margin-top: 8px; }
.qty-btn { width: 24px; height: 24px; border-radius: 50%; border: 1px solid #dee2e6; background: white; color: #525f7f; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-weight: bold; font-size: 0.9rem; }
.qty-btn:hover { background: #5e72e4; color: white; border-color: #5e72e4; }
.qty-val { margin: 0 10px; font-size: 0.9rem; font-weight: bold; color: #32325d; }

.item-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.mini-price { font-weight: 700; color: #2dce89; font-size: 1rem; }
.btn-trash { background: none; border: none; color: #f5365c; cursor: pointer; font-size: 1.1rem; opacity: 0.7; transition: 0.2s; }
.btn-trash:hover { opacity: 1; transform: scale(1.1); }

.summary-total .row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #525f7f; }
.summary-total .final { border-top: 1px solid #e9ecef; padding-top: 15px; margin-top: 15px; font-weight: 800; font-size: 1.25rem; color: #32325d; }

/* COMPONENTES FORMULARIO */
.search-group { display: flex; gap: 10px; margin-bottom: 15px; }
.compact { width: 100px; }
.btn-dark { background: #172b4d; color: white; border: none; padding: 0 1.5rem; border-radius: 0.375rem; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.client-result { background: #f6f9fc; padding: 1rem; border-radius: 0.375rem; margin-top: 1rem; border: 1px solid #e9ecef; }
.btn-next { width: 100%; background: #5e72e4; color: white; border: none; padding: 0.75rem; border-radius: 0.375rem; font-weight: 600; margin-top: 1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(50,50,93,.11); transition: 0.3s; }
.btn-next:hover { transform: translateY(-1px); box-shadow: 0 7px 14px rgba(50,50,93,.1); }

.payment-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.payment-tabs button { flex: 1; padding: 1rem; border: 1px solid #dee2e6; background: white; border-radius: 0.375rem; font-weight: 600; color: #8898aa; cursor: pointer; transition: 0.3s; }
.payment-tabs button.active { background: #172b4d; color: white; border-color: #172b4d; box-shadow: 0 4px 6px rgba(50,50,93,.11); }

/* TARJETA & OTROS */
.btn-pay-final { width: 100%; background: #2dce89; color: white; border: none; padding: 1rem; border-radius: 0.375rem; font-weight: 700; font-size: 1.1rem; margin-top: 1.5rem; cursor: pointer; box-shadow: 0 4px 6px rgba(50,50,93,.11); transition: 0.3s; }
.btn-pay-final:hover { transform: translateY(-1px); background: #26af74; box-shadow: 0 7px 14px rgba(50,50,93,.1); }
.credit-options { background: #fff9f2; padding: 1.5rem; border-radius: 0.375rem; border: 1px solid #ffe5d0; color: #8a5340; }
.cuotas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 10px 0; }
.cuota-card { background: white; border: 1px solid #dee2e6; padding: 10px; text-align: center; border-radius: 0.375rem; cursor: pointer; transition: 0.2s; }
.cuota-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(50,50,93,.11); }
.cuota-card.selected { border-color: #fb6340; background: #fb6340; color: white; }

.card-simulator { perspective: 1000px; margin-bottom: 20px; }
.flip-container { width: 320px; height: 200px; margin: 0 auto 20px; }
.flipper { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
.flip-container.flipped .flipper { transform: rotateY(180deg); }
.front, .back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 15px; color: white; box-shadow: 0 15px 35px rgba(50,50,93,.1), 0 5px 15px rgba(0,0,0,.07); padding: 20px; box-sizing: border-box; }
.front { background: linear-gradient(87deg, #172b4d 0, #1a174d 100%); z-index: 2; transform: rotateY(0deg); display: flex; flex-direction: column; justify-content: space-between; }
.back { background: linear-gradient(87deg, #1a174d 0, #172b4d 100%); transform: rotateY(180deg); padding: 0; }
.chip { width: 50px; height: 35px; background: linear-gradient(135deg, #d4af37, #f1d676); border-radius: 5px; }
.logo-visa { width: 60px; position: absolute; top: 20px; right: 20px; }
.card-number { font-size: 1.4rem; letter-spacing: 2px; font-family: monospace; text-shadow: 0 2px 2px rgba(0,0,0,0.5); }
.strip { width: 100%; height: 40px; background: black; margin-top: 20px; }
.cvv-box { background: white; color: black; width: 80%; margin: 10px auto; height: 30px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-family: monospace; border-radius: 4px; }
.cvv-label { text-align: right; width: 80%; margin: 5px auto 0; font-size: 0.7rem; opacity: 0.7; }

.empty-state { text-align: center; padding: 100px 20px; }
.empty-icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.3; }
.btn-back { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #172b4d; color: white; text-decoration: none; border-radius: 30px; font-weight: 600; transition: 0.3s; box-shadow: 0 4px 6px rgba(50,50,93,.11); }

@media (max-width: 900px) { .grid-layout { grid-template-columns: 1fr; } }
</style>