<template>
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="$emit('toggle-sidebar')">☰</button>
      <span class="header-title">Maintenance Log</span>
    </div>
    <div class="header-right">
      <span class="header-user">{{ user?.name }} ({{ user?.role }})</span>
      <button class="btn btn-secondary btn-sm" @click="logout">Logout</button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['toggle-sidebar'])
const { user, logout } = useAuth()
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left { display: flex; align-items: center; gap: var(--spacing-md); }
.header-title { font-weight: 700; font-size: 1.1rem; color: var(--color-text); }
.header-right { display: flex; align-items: center; gap: var(--spacing-md); }
.header-user { font-size: 0.85rem; color: var(--color-text-secondary); }
.sidebar-toggle { display: none; background: none; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 4px 8px; cursor: pointer; font-size: 1.1rem; }
@media (max-width: 768px) { .sidebar-toggle { display: block; } }
</style>
