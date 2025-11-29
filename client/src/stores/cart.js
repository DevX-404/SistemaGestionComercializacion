import { defineStore } from 'pinia';
// Ya no necesitamos importar 'api' aquí porque la venta se hace en la Vista

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        cliente: null,
        tipoVenta: 'CONTADO'
    }),
    getters: {
        totalVenta: (state) => state.items.reduce((acc, i) => acc + (i.precio_base * i.cantidad), 0),
        igv: (state) => state.totalVenta * 0.18,
        subtotal: (state) => state.totalVenta - (state.totalVenta * 0.18)
    },
    actions: {
        agregarProducto(producto) {
            const existente = this.items.find(i => i.sku === producto.sku);
            if (existente) {
                 // Validacion simple de stock visual
                if (existente.cantidad < producto.stock) existente.cantidad++;
                else alert('Stock insuficiente');
            } else {
                this.items.push({ ...producto, cantidad: 1 });
            }
        },
        quitarProducto(sku) {
            this.items = this.items.filter(i => i.sku !== sku);
        },

        // ✅ ESTA ES LA IMPORTANTE QUE NECESITABAS
        vaciarCarrito() {
            this.items = [];
            this.cliente = null;
        }
    }
});