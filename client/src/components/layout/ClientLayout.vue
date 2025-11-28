<template>
  <div class="client-layout">
    <nav class="client-navbar">
        <div class="container nav-container">
            <h2 class="logo">Monster<span class="highlight">Store</span></h2>
            <ul class="nav-links">
                <li><router-link to="/">Inicio</router-link></li>
                <li><router-link to="/catalogo">Catálogo</router-link></li>
            </ul>
            <div class="nav-cart">🛒 Carrito (0)</div>
        </div>
    </nav>
    
    <router-view />
    
    <footer class="client-footer">
        <p>© 2024 MonsterStore - Todos los derechos reservados</p>
    </footer>
  </div>
</template>

<style scoped>
.client-layout { background-color: #fff; font-family: 'Poppins', sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.client-navbar { padding: 20px 0; border-bottom: 1px solid #eee; }
.nav-container { display: flex; justify-content: space-between; align-items: center; }
.logo { margin: 0; color: #333; }
.highlight { color: var(--client-primary); }
.nav-links { list-style: none; display: flex; gap: 30px; margin: 0; }
.nav-links a { text-decoration: none; color: #555; font-weight: 500; transition: color 0.3s; }
.nav-links a:hover, .router-link-active { color: var(--client-primary); }
.nav-cart { font-weight: bold; color: var(--client-primary); cursor: pointer; }
.client-footer { background: #333; color: #fff; text-align: center; padding: 20px 0; margin-top: 50px; }
</style>