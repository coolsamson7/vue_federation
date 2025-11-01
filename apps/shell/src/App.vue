<template>
  <div id="app" class="shell-container">
    <nav class="shell-nav">
      <h1>🚀 Microfrontend Shell</h1>
      <ul v-if="menuItems.length > 0">
        <li v-for="item in menuItems" :key="item.id">
          <router-link :to="item.path || '/'">
            <span v-if="item.icon" class="icon">{{ item.icon }}</span>
            {{ item.name }}
          </router-link>
        </li>
      </ul>
      <p v-else class="no-features">No features loaded yet...</p>
    </nav>

    <main class="shell-content">
      <router-view />
    </main>

    <footer class="shell-footer">
      <button @click="exportMetadata" class="btn">Export Metadata JSON</button>
      <button @click="toggleMetadata" class="btn">
        {{ showMetadata ? "Hide" : "Show" }} Metadata
      </button>
      <div v-if="showMetadata && metadata" class="metadata-display">
        <h3>Feature Metadata</h3>
        <pre>{{ metadata }}</pre>
      </div>

      <button @click="refreshFeatures" class="btn">🔄 Refresh Features</button>
      <!-- ADDED -->
      <div class="feature-count">Features loaded: {{ featureCount }}</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { container } from "tsyringe";
import { FeatureRegistry, ModuleLoader } from "portal";

const menuItems = ref<any[]>([]);
const metadata = ref("");
const showMetadata = ref(false);

const featureRegistry = container.resolve(FeatureRegistry);

const featureCount = computed(() => featureRegistry.getAll().length); // ADDED

const refreshFeatures = () => {
  console.log("🔄 Refreshed features:", menuItems.value);

  const features = featureRegistry.getAll();

  menuItems.value = features.map((feature) => ({
    id: feature.id,
    name: feature.label,
    icon: feature.icon,
    description: feature.description,
    path: feature.path,
    //routes: feature.routes?.map((r) => r.path) || [],
  }));
};

onMounted(() => {
  // Initial load
  refreshFeatures();
  metadata.value = featureRegistry.exportJSON();

  // ADDED: Also refresh after a delay to catch late-loading modules
  setTimeout(refreshFeatures, 500);
  setTimeout(refreshFeatures, 1000);
});

const exportMetadata = () => {
  metadata.value = featureRegistry.exportJSON();
  console.log("Exported Metadata:", metadata.value);
};

const toggleMetadata = () => {
  if (!metadata.value) {
    exportMetadata();
  }
  showMetadata.value = !showMetadata.value;
};
</script>

<style scoped>
.no-features {
  /* ADDED entire rule */
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  margin: 0;
}

.feature-count {
  /* ADDED entire rule */
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
}

.shell-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, sans-serif;
}

.shell-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.shell-nav h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.shell-nav ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.shell-nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shell-nav a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.shell-nav a.router-link-active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.icon {
  font-size: 1.2rem;
}

.shell-content {
  flex: 1;
  padding: 2rem;
  background: #f5f7fa;
}

.shell-footer {
  background: white;
  padding: 1rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn:hover {
  background: #5568d3;
}

.metadata-display {
  flex: 1 1 100%;
  margin-top: 1rem;
}

.metadata-display h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

pre {
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 6px;
  overflow: auto;
  max-height: 400px;
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>
