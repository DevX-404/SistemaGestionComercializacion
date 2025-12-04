import { defineStore } from 'pinia';
import axios from 'axios';

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        cliente_id: 1,
        tipoVenta: 'CONTADO',
        cuotas: 1
    }),
    getters: {
        subtotal: (state) => state.items.reduce((acc, item) => acc + (item.precio_base * item.cantidad), 0),
        igv: (state) => state.subtotal * 0.18,
        totalVenta: (state) => state.subtotal + state.igv
    },
    actions: {
        agregarProducto(producto) {
            const existente = this.items.find(i => i.sku === producto.sku);
            if (existente) {
                if (existente.cantidad < producto.stock) {
                    existente.cantidad++;
                } else {
                    alert('¡No hay más stock disponible!');
                }
            } else {
                this.items.push({ ...producto, cantidad: 1 });
            }
        },
        quitarProducto(sku) {
            this.items = this.items.filter(i => i.sku !== sku);
        },
        vaciarCarrito() {
            this.items = [];
            this.cuotas = 1;
            this.tipoVenta = 'CONTADO';
        },
        disminuirCantidad(sku) {
            const item = this.items.find(i => i.sku === sku);
            if (item) {
                item.cantidad--;
                if (item.cantidad <= 0) {
                    this.quitarProducto(sku);
                }
            }
            this.guardarCarrito();
        },

        // --- LA NUEVA FUNCIÓN QUE CONECTA CON EL BACKEND ---
        async procesarVenta() {
            if (this.items.length === 0) return alert("El carrito está vacío");

            const datosVenta = {
                cliente_id: this.cliente_id,
                usuario_id: "ADMIN-001", 
                items: this.items.map(i => ({
                    sku: i.sku,
                    cantidad: i.cantidad,
                    precio: i.precio_base,
                    subtotal: i.precio_base * i.cantidad
                })),
                tipo_pago: this.tipoVenta,
                total: this.totalVenta,
                cuotas: parseInt(this.cuotas) 
            };

            try {
                const response = await axios.post('http://localhost:3000/api/ventas', datosVenta);

                if (response.data.success) {
                    alert(`✅ Venta registrada con éxito! ID: ${response.data.id_venta}`);
                    this.vaciarCarrito();
                }
            } catch (error) {
                console.error(error);
                alert("❌ Error al procesar la venta: " + (error.response?.data?.mensaje || error.message));
            }
        }
    }
});