<template>
  <header class="top-bar">
    <div class="page-title">
        <h2>{{ title }}</h2>
    </div>
    <div class="actions">
        <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search...">
        </div>
        <div class="user-profile">
            <img src="https://i.pravatar.cc/40?img=3" alt="Admin" class="avatar">
            <div class="user-info">
                <span class="name">Kristina Evans</span>
                <span class="role">Admin</span>
            </div>
        </div>
    </div>
  </header>
</template>

<script setup>
defineProps({ title: String });
</script>

<style scoped>
.top-bar {
    height: 80px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    box-shadow: var(--box-shadow);
    margin-bottom: 30px;
    border-radius: var(--border-radius);
}
.page-title h2 { margin: 0; font-weight: 600; color: var(--admin-text); }
.actions { display: flex; align-items: center; gap: 25px; }
.search-box {
    background: var(--admin-bg);
    padding: 10px 15px;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
}
.search-box input { border: none; background: transparent; outline: none; margin-left: 10px; }
.user-profile { display: flex; align-items: center; cursor: pointer; }
.avatar { width: 45px; height: 45px; border-radius: 50%; margin-right: 12px; }
.user-info { display: flex; flex-direction: column; }
.name { font-weight: 600; font-size: 0.9rem; }
.role { font-size: 0.8rem; color: #a2a5b9; }
</style>