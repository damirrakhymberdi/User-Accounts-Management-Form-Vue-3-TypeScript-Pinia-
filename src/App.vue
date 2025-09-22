<script setup lang="ts">
import AccountsManager from '@/components/AccountsManager.vue'
</script>

<template>
  <AccountsManager />
  
</template>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--text-primary, #1a202c);
  background: var(--bg-primary, #ffffff);
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
}

/* Dark mode global styles */
.dark {
  color-scheme: dark;
}

.dark body {
  background: #0f172a;
  color: #f1f5f9;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary, #f8fafc);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-color, #667eea);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color, #667eea);
  opacity: 0.8;
}

.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

/* Selection styles */
::selection {
  background: rgba(102, 126, 234, 0.3);
  color: inherit;
}

.dark ::selection {
  background: rgba(102, 126, 234, 0.5);
}

/* Focus styles */
*:focus {
  outline: 2px solid var(--accent-color, #667eea);
  outline-offset: 2px;
}

/* Smooth transitions for all elements */
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease,
              box-shadow 0.3s ease,
              transform 0.3s ease;
}

/* Improve text rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Loading animation for page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Custom Element Plus theme variables */
:root {
  --el-color-primary: #667eea;
  --el-color-primary-light-3: #8b9cf0;
  --el-color-primary-light-5: #a8b7f5;
  --el-color-primary-light-7: #c5d1f9;
  --el-color-primary-light-8: #d4ddfc;
  --el-color-primary-light-9: #e3e9fe;
  --el-color-primary-dark-2: #5a6fd8;
}

.dark {
  --el-color-primary: #8b9cf0;
  --el-color-primary-light-3: #a8b7f5;
  --el-color-primary-light-5: #c5d1f9;
  --el-color-primary-light-7: #d4ddfc;
  --el-color-primary-light-8: #e3e9fe;
  --el-color-primary-light-9: #f1f3ff;
  --el-color-primary-dark-2: #7a8de8;
}
</style>