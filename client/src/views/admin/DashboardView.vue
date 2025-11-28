<template>
  <div class="dashboard-container">
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="icon-box">💰</div>
        <div class="info">
          <h3>S/ 12,450</h3>
          <p>Ventas del Mes</p>
        </div>
      </div>
      
      <div class="stat-card orange">
        <div class="icon-box">👥</div>
        <div class="info">
          <h3>45</h3>
          <p>Clientes Nuevos</p>
        </div>
      </div>
      
      <div class="stat-card green">
        <div class="icon-box">📦</div>
        <div class="info">
          <h3>12</h3>
          <p>Prod. Bajo Stock</p>
        </div>
      </div>
      
      <div class="stat-card purple">
        <div class="icon-box">💳</div>
        <div class="info">
          <h3>S/ 3,200</h3>
          <p>Por Cobrar</p>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <div class="card-box chart-section">
        <div class="card-header">
          <h4>Rendimiento de Ventas</h4>
          <select class="filter-select">
            <option>Esta Semana</option>
            <option>Este Mes</option>
          </select>
        </div>
        <div class="chart-placeholder">
          <div class="bar" style="height: 40%" title="Lun"></div>
          <div class="bar" style="height: 70%" title="Mar"></div>
          <div class="bar" style="height: 50%" title="Mié"></div>
          <div class="bar" style="height: 90%" title="Jue"></div>
          <div class="bar" style="height: 60%" title="Vie"></div>
          <div class="bar" style="height: 80%" title="Sáb"></div>
          <div class="bar" style="height: 30%" title="Dom"></div>
        </div>
        <div class="chart-labels">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
        </div>
      </div>

      <div class="card-box transactions-section">
        <h4>Últimas Ventas</h4>
        <ul class="activity-list">
          <li class="activity-item">
            <span class="dot green"></span>
            <div class="details">
              <strong>Juan Perez</strong> compró 1 Laptop
              <small>Hace 5 min</small>
            </div>
            <span class="amount">+ S/ 3,500</span>
          </li>
          <li class="activity-item">
            <span class="dot orange"></span>
            <div class="details">
              <strong>Empresa SAC</strong> (Crédito)
              <small>Hace 2 horas</small>
            </div>
            <span class="amount">+ S/ 15,000</span>
          </li>
          <li class="activity-item">
            <span class="dot red"></span>
            <div class="details">
              <strong>Gastos Operativos</strong>
              <small>Hace 5 horas</small>
            </div>
            <span class="amount text-red">- S/ 200</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container { display: flex; flex-direction: column; gap: 30px; }

/* Tarjetas Superiores */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
.stat-card { background: white; padding: 25px; border-radius: 12px; display: flex; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-5px); }
.icon-box { width: 50px; height: 50px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; margin-right: 15px; }
.stat-card.blue .icon-box { background: #e1f0ff; color: #3699ff; }
.stat-card.orange .icon-box { background: #fff4de; color: #ffa800; }
.stat-card.green .icon-box { background: #c9f7f5; color: #1bc5bd; }
.stat-card.purple .icon-box { background: #eee5ff; color: #8950fc; }
.info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #3f4254; }
.info p { margin: 0; color: #b5b5c3; font-size: 0.9rem; }

/* Grid Principal */
.main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
@media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }

.card-box { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card-header h4 { margin: 0; font-weight: 600; color: #3f4254; }
.filter-select { padding: 5px 10px; border-radius: 6px; border: 1px solid #e4e6ef; color: #6c7293; }

/* Gráfico CSS Simple */
.chart-placeholder { height: 200px; display: flex; align-items: flex-end; justify-content: space-around; padding-bottom: 10px; border-bottom: 1px solid #eee; }
.bar { width: 30px; background: #3699ff; border-radius: 4px 4px 0 0; transition: height 1s; opacity: 0.8; }
.bar:hover { opacity: 1; transform: scaleX(1.1); }
.chart-labels { display: flex; justify-content: space-around; margin-top: 10px; color: #b5b5c3; font-size: 0.8rem; }

/* Lista de Actividad */
.activity-list { list-style: none; padding: 0; margin: 0; }
.activity-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px dashed #ebedf3; }
.activity-item:last-child { border-bottom: none; }
.dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 15px; }
.dot.green { background: #1bc5bd; }
.dot.orange { background: #ffa800; }
.dot.red { background: #f64e60; }
.details { flex: 1; display: flex; flex-direction: column; font-size: 0.9rem; color: #3f4254; }
.details small { color: #b5b5c3; font-size: 0.75rem; margin-top: 3px; }
.amount { font-weight: 700; color: #1bc5bd; }
.amount.text-red { color: #f64e60; }
</style>