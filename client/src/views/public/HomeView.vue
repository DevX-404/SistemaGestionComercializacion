<template>
  <div>
    <section class="hero">
        <div class="hero-content">
            <h1>Tecnología Monstruosa a tu Alcance</h1>
            <p>Descubre las mejores laptops y periféricos con precios increíbles y stock garantizado.</p>
            <router-link to="/catalogo" class="btn-hero">Ver Catálogo Ahora</router-link>
        </div>
        <div class="hero-image">
            <img src="http://localhost:3000/img/laptop.jpg" alt="Laptop Hero">
        </div>
    </section>

    <section class="featured container">
        <h2>Productos Destacados</h2>
        <div class="grid">
            <div class="placeholder-card">Producto 1</div>
            <div class="placeholder-card">Producto 2</div>
            <div class="placeholder-card">Producto 3</div>
        </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 80px 10% 100px;
    background: linear-gradient(135deg, var(--client-primary) 0%, #00c6ff 100%);
    color: #fff;
    border-bottom-right-radius: 100px;
    margin-bottom: 50px;
}
.hero-content { max-width: 500px; }
.hero h1 { font-size: 3rem; font-weight: 800; line-height: 1.2; margin-bottom: 20px; }
.hero p { font-size: 1.1rem; margin-bottom: 30px; opacity: 0.9; }
.btn-hero {
    display: inline-block;
    padding: 15px 40px;
    background: #fff;
    color: var(--client-primary);
    text-decoration: none;
    font-weight: bold;
    border-radius: 30px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    transition: transform 0.3s;
}
.btn-hero:hover { transform: translateY(-5px); box-shadow: 0 15px 25px rgba(0,0,0,0.3); }
.hero-image img { max-width: 100%; width: 500px; transform: rotate(-10deg); filter: drop-shadow(20px 20px 30px rgba(0,0,0,0.3)); }

.featured { padding: 50px 20px; }
.featured h2 { text-align: center; margin-bottom: 40px; color: #333; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.placeholder-card { height: 300px; background: #eee; border-radius: var(--border-radius); display: flex; justify-content: center; align-items: center; }
</style>