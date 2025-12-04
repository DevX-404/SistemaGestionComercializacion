<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content fade-in-up">
        <h1>Tecnología <span class="text-gradient">Monstruosa</span></h1>
        <p>Equipa tu vida con lo último en laptops, componentes y accesorios.</p>
        <router-link to="/catalogo" class="btn-hero">VER CATÁLOGO ➔</router-link>
      </div>
    </section>

    <section class="features container">
      <div class="feature-card">
        <div class="icon">🚀</div>
        <h4>Envíos Rápidos</h4>
        <p>Recibe tu pedido en 24h en Lima.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h4>Garantía Real</h4>
        <p>Productos 100% originales y sellados.</p>
      </div>
      <div class="feature-card">
        <div class="icon">💳</div>
        <h4>Pagos Seguros</h4>
        <p>Aceptamos todas las tarjetas y Yape.</p>
      </div>
    </section>

    <section class="promo-banner">
      <div class="container promo-flex">
        <div class="promo-text">
          <h2>Ofertas Gamer</h2>
          <p>Hasta 30% de descuento en periféricos seleccionados.</p>
        </div>
        <router-link to="/catalogo" class="btn-promo">Aprovechar</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* HERO */
.hero {
  height: 85vh;
  background: url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat;
  position: relative;
  display: flex; align-items: center; justify-content: center; text-align: center;
  margin-top: -70px; /* Para que quede detrás del navbar transparente */
}
.hero-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, rgba(26,23,77,0.8) 0%, rgba(94,114,228,0.6) 100%); }
.hero-content { position: relative; z-index: 2; color: white; padding: 20px; }
.hero-content h1 { font-size: 4rem; font-weight: 800; margin-bottom: 10px; text-shadow: 0 4px 10px rgba(0,0,0,0.3); }
.text-gradient { background: linear-gradient(to right, #11cdef, #2dce89); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-content p { font-size: 1.5rem; margin-bottom: 30px; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto; }

.btn-hero {
  background: white; color: #172b4d; padding: 15px 40px; border-radius: 30px;
  font-weight: 800; text-decoration: none; font-size: 1rem; transition: 0.3s;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.btn-hero:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.3); }

/* FEATURES */
.container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: -50px; position: relative; z-index: 3; }
.feature-card { background: white; padding: 30px; border-radius: 15px; text-align: center; box-shadow: 0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07); transition: 0.3s; }
.feature-card:hover { transform: translateY(-10px); }
.feature-card .icon { font-size: 3rem; margin-bottom: 15px; }
.feature-card h4 { color: #32325d; font-weight: 700; margin-bottom: 10px; }
.feature-card p { color: #8898aa; font-size: 0.9rem; }

/* PROMO */
.promo-banner { background: linear-gradient(87deg, #2dce89 0, #2dcecc 100%); color: white; padding: 40px 0; margin-top: 40px; }
.promo-flex { display: flex; justify-content: space-between; align-items: center; padding-top: 0; padding-bottom: 0; }
.promo-text h2 { font-size: 2rem; margin: 0; }
.btn-promo { background: white; color: #2dce89; padding: 10px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

/* Animación */
.fade-in-up { animation: fadeInUp 1s cubic-bezier(0.2, 1, 0.2, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .hero-content h1 { font-size: 2.5rem; }
  .promo-flex { flex-direction: column; text-align: center; gap: 20px; }
}
</style>