<template>
  <div class="dev-app">
    <div class="dev-header">
      <h1>👤 User Module - Development Mode</h1>
      <p>This module is running standalone for development</p>
    </div>

    <div class="dev-content">
      <h2>Available Components:</h2>
      <div class="component-showcase">
        <div class="showcase-section">
          <h3>User List Component</h3>
          <UserList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserList from './components/UserList.vue';
</script>

<style scoped>
.dev-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  min-height: 100vh;
  background: #f5f7fa;
}

.dev-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.dev-header h1 {
  margin: 0 0 0.5rem 0;
}

.dev-header p {
  margin: 0;
  opacity: 0.9;
}

.dev-content {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.dev-content h2 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.component-showcase {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.showcase-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.showcase-section h3 {
  color: #374151;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}
</style>