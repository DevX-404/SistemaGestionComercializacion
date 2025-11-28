<template>
  <aside class="admin-sidebar">
    <div class="brand">
      <span class="brand-icon">⚡</span>
      <h3>ProfitPulse</h3>
    </div>
    <nav class="menu">
      <div class="menu-section">PRINCIPAL</div>
      <router-link to="/admin/dashboard" class="menu-item">
        <span class="icon">📊</span> Dashboard
      </router-link>

      <div class="menu-section">COMERCIALIZACIÓN</div>
      <router-link to="/admin/ventas" class="menu-item">
        <span class="icon">🛒</span> Punto de Venta
      </router-link>
      <router-link to="/admin/clientes" class="menu-item">
        <span class="icon">🤝</span> Clientes
      </router-link>
      <router-link to="/admin/proveedores" class="menu-item">
        <span class="icon">🚚</span> Proveedores
      </router-link>

      <div class="menu-section">LOGÍSTICA</div>
      <router-link to="/admin/inventario" class="menu-item">
        <span class="icon">📦</span> Inventario / Productos
      </router-link>

      <div class="menu-section">SEGURIDAD</div>
      <router-link to="/admin/usuarios" class="menu-item">
        <span class="icon">👤</span> Usuarios
      </router-link>
      <router-link to="/admin/perfiles" class="menu-item">
        <span class="icon">🔑</span> Perfiles
      </router-link>
    </nav>
    <div class="logout-section">
      <a href="#" class="menu-item logout">
        <span class="icon">🚪</span> Log out
      </a>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 260px;
  height: 100vh;
  background-color: var(--admin-sidebar-bg);
  color: var(--admin-sidebar-text);
  position: fixed;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  color: #fff;
}
.brand-icon {
  font-size: 1.5rem;
  margin-right: 10px;
  color: var(--brand-primary);
}
.brand h3 {
  margin: 0;
  font-weight: 600;
}
.menu-section {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  margin-top: 25px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  text-decoration: none;
  color: var(--admin-sidebar-text);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  margin-bottom: 5px;
  font-weight: 500;
}
.menu-item:hover,
.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.icon {
  margin-right: 12px;
  font-size: 1.1rem;
}
.badge {
  background: var(--brand-primary);
  color: #000;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
  font-weight: bold;
}
.logout-section {
  margin-top: auto;
}
.logout:hover {
  background-color: var(--danger);
  color: #fff;
}
</style>
