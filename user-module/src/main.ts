import { createApp } from 'vue';
import './UserModule';

// For standalone development
if (import.meta.env.DEV) {
  import('./DevApp.vue').then((module) => {
    const app = createApp(module.default);
    app.mount('#app');
  });
}

console.log('User Module loaded');

// Export for module federation
export { UserFeatureModule } from './UserModule';