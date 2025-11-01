import "reflect-metadata";

import { createApp } from "vue";
import "./ProductModule";

// For standalone development
if (import.meta.env.DEV) {
  import("./DevApp.vue").then((module) => {
    const app = createApp(module.default);
    app.mount("#app");
  });
}

console.log("Product Module loaded");

// Export for module federation
export { ProductFeatureModule } from "./ProductModule";
