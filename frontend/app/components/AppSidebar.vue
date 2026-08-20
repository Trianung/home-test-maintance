<template>
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <nav class="sidebar-nav">
      <NuxtLink to="/dashboard" class="nav-item" @click="$emit('close')"><Icon name="lucide:layout-dashboard" size="1.2em" /> Dashboard</NuxtLink>
      <NuxtLink to="/requests" class="nav-item" @click="$emit('close')"><Icon name="lucide:clipboard-list" size="1.2em" /> Requests</NuxtLink>
      <NuxtLink to="/requests/create" class="nav-item" @click="$emit('close')"><Icon name="lucide:plus-circle" size="1.2em" /> New Request</NuxtLink>
      <NuxtLink v-if="role === 'admin'" to="/users" class="nav-item" @click="$emit('close')"><Icon name="lucide:users" size="1.2em" /> Users</NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ mobileOpen: boolean }>()
defineEmits(['close'])
const { role } = useAuth()
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width); background: var(--sidebar-bg);
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 200;
  overflow-y: auto; padding-top: var(--spacing-lg);
}
.sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 var(--spacing-sm); }
.nav-item {
  display: flex; align-items: center; gap: var(--spacing-sm);
  padding: 10px 14px; color: var(--sidebar-text); border-radius: var(--radius-sm);
  font-size: 0.9rem; text-decoration: none; transition: background 0.15s ease;
}
.nav-item:hover { background: rgba(255,255,255,0.08); }
.nav-item.router-link-active { background: var(--sidebar-active); color: #fff; }
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.2s ease; }
  .sidebar.open { transform: translateX(0); }
}
</style>
