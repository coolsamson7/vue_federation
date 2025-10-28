import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { FeatureRegistry } from "portal";
import Home from "../views/Home.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

// Add dynamic routes from metadata

routes.push(...FeatureRegistry.generateRouterConfig());

console.log(FeatureRegistry.getAll());

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
