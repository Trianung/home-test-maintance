<template>
  <div class="app-layout">
    <AppSidebar :mobile-open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="app-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
