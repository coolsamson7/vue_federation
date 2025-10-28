<template>
  <div class="home">
    <h1>Welcome to Microfrontend Architecture</h1>
    <p>This is a demonstration of Vue 3 with Module Federation</p>

    <div class="feature-grid">
      <div v-for="feature in features" :key="feature.id" class="feature-card">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h3>{{ feature.name }}</h3>
        <p>{{ feature.description }}</p>
        <div class="feature-meta">
          <span class="badge">v{{ feature.version }}</span>
          <span v-if="feature.permissions" class="badge">{{ feature.permissions.length }} permissions</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FeatureRegistry } from 'portal';

const features = ref<any[]>([]);

onMounted(() => {
  features.value = FeatureRegistry.getAll();
});
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.feature-meta {
  display: flex;
  gap: 0.5rem;
}

.badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>