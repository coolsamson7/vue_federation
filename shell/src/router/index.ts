import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { FeatureMetadataScanner } from 'portal';
import Home from '../views/Home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
];

// Add dynamic routes from metadata
const dynamicRoutes = FeatureMetadataScanner.generateRouterConfig();
routes.push(...dynamicRoutes);

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;